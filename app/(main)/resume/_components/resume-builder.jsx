"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Download,
  Edit,
  Loader2,
  Monitor,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { saveResume } from "@/actions/resume";
import { EntryForm } from "./entry-form";
import useFetch from "@/hooks/use-fetch";
import { useUser } from "@clerk/nextjs";
import { entriesToMarkdown } from "@/app/lib/helper";
import { resumeSchema } from "@/app/lib/schema";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLoading } from "@/components/loading-provider";

const editorStyles = `
  .w-md-editor {
    font-family: Arial, sans-serif !important;
  }

  .w-md-editor-text-pre,
  .w-md-editor-text-input,
  .w-md-editor-text,
  .wmde-markdown-var {
    font-family: Arial, sans-serif !important;
    font-size: 10pt !important;
    line-height: 1.2 !important;
  }

  .w-md-editor-preview {
    font-family: Arial, sans-serif !important;
    font-size: 10pt !important;
    line-height: 1.2 !important;
  }

  .wmde-markdown {
    font-family: Arial, sans-serif !important;
    font-size: 10pt !important;
    line-height: 1.2 !important;
  }

  .wmde-markdown h1,
  .wmde-markdown h2,
  .wmde-markdown h3,
  .w-md-editor-preview h1,
  .w-md-editor-preview h2,
  .w-md-editor-preview h3 {
    font-family: 'Times New Roman', serif !important;
    font-weight: bold !important;
    margin-top: 8pt !important;
    margin-bottom: 4pt !important;
  }

  .wmde-markdown p,
  .w-md-editor-preview p {
    font-family: Arial, sans-serif !important;
    font-size: 10pt !important;
    margin-top: 4pt !important;
    margin-bottom: 4pt !important;
  }

  .wmde-markdown ul,
  .wmde-markdown ol,
  .w-md-editor-preview ul,
  .w-md-editor-preview ol {
    font-family: Arial, sans-serif !important;
    font-size: 10pt !important;
    margin-top: 4pt !important;
    margin-bottom: 4pt !important;
    padding-left: 20pt !important;
  }

  .wmde-markdown li,
  .w-md-editor-preview li {
    font-family: Arial, sans-serif !important;
    font-size: 10pt !important;
    margin-top: 2pt !important;
    margin-bottom: 2pt !important;
  }

  .w-md-editor-text-pre > code,
  .w-md-editor-text-input {
    font-family: Arial, sans-serif !important;
    font-size: 10pt !important;
  }

  .w-md-editor-toolbar {
    background-color: #f8f9fa !important;
  }
`;

export default function ResumeBuilder({ initialContent }) {
  const [activeTab, setActiveTab] = useState("edit");
  const [previewContent, setPreviewContent] = useState(initialContent);
  const { user } = useUser();
  const [resumeMode, setResumeMode] = useState("preview");
  const [entries, setEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState({
    type: "Experience",
    title: "",
    organization: "",
    startDate: "",
    endDate: "",
    description: "",
  });
  const { showLoading, hideLoading } = useLoading();

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      contactInfo: {},
      summary: "",
      skills: "",
      experience: [],
      education: [],
      projects: [],
    },
  });

  const {
    loading: isSaving,
    fn: saveResumeFn,
    data: saveResult,
    error: saveError,
  } = useFetch(saveResume);

  // Watch form fields for preview updates
  const formValues = watch();

  useEffect(() => {
    if (initialContent) setActiveTab("preview");
  }, [initialContent]);

  // Update preview content when form values change
  useEffect(() => {
    if (activeTab === "edit") {
      const newContent = getCombinedContent();
      setPreviewContent(newContent ? newContent : initialContent);
    }
  }, [formValues, activeTab]);

  // Handle save result
  useEffect(() => {
    if (saveResult && !isSaving) {
      toast.success("Resume saved successfully!");
    }
    if (saveError) {
      toast.error(saveError.message || "Failed to save resume");
    }
  }, [saveResult, saveError, isSaving]);

  useEffect(() => {
    // Add the styles to the document
    const styleSheet = document.createElement("style");
    styleSheet.innerText = editorStyles;
    document.head.appendChild(styleSheet);

    // Cleanup
    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  const getContactMarkdown = () => {
    const { contactInfo } = formValues;
    const parts = [];
    if (contactInfo.email) parts.push(`${contactInfo.email}`);
    if (contactInfo.mobile) parts.push(`${contactInfo.mobile}`);
    if (contactInfo.linkedin)
      parts.push(`[LinkedIn](${contactInfo.linkedin})`);
    if (contactInfo.twitter) parts.push(`[Portfolio](${contactInfo.twitter})`);

    return parts.length > 0
      ? `## <div align="center">${user.fullName}</div>
        \n\n<div align="center">\n\n${parts.join(" | ")}\n\n</div>`
      : "";
  };

  const getCombinedContent = () => {
    const { summary, skills, experience, education, projects } = formValues;
    return [
      getContactMarkdown(),
      summary && `## Professional Summary\n\n${summary}`,
      skills && `## Skills\n\n${skills}`,
      entriesToMarkdown(experience, "Work Experience"),
      entriesToMarkdown(education, "Education"),
      entriesToMarkdown(projects, "Projects"),
    ]
      .filter(Boolean)
      .join("\n\n");
  };

  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    const { experience, education, projects } = formValues;
    const totalEntries = experience.length + education.length + projects.length;
    
    if (totalEntries === 0) {
      toast.error("Please add at least one entry to your resume");
      return;
    }

    showLoading("Generating PDF...");
    try {
      // Dynamically import html2pdf only on client side
      const html2pdf = (await import('html2pdf.js')).default;
      
      const element = document.getElementById("resume-pdf");
      const opt = {
        margin: [15, 15],
        filename: "resume.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { 
          unit: "mm", 
          format: "a4", 
          orientation: "portrait"
        },
        pagebreak: { mode: 'avoid-all' }
      };

      // Create a clone of the element to avoid modifying the original
      const pdfContent = element.cloneNode(true);
      
      // Apply resume-friendly styles
      pdfContent.style.cssText = `
        font-family: Arial, sans-serif !important;
        font-size: 10pt !important;
        line-height: 1.2 !important;
        max-width: 190mm !important;
        margin: 0 auto !important;
        color: #000000 !important;
        background-color: #ffffff !important;
      `;

      // Style headings
      const headings = pdfContent.querySelectorAll('h1, h2, h3');
      headings.forEach(heading => {
        heading.style.cssText = `
          font-family: Times New Roman, serif !important;
          font-weight: bold !important;
          margin-top: 8pt !important;
          margin-bottom: 4pt !important;
        `;
      });

      // Style paragraphs
      const paragraphs = pdfContent.querySelectorAll('p');
      paragraphs.forEach(p => {
        p.style.cssText = `
          margin-top: 4pt !important;
          margin-bottom: 4pt !important;
          font-family: Arial, sans-serif !important;
          font-size: 10pt !important;
        `;
      });

      // Style lists
      const lists = pdfContent.querySelectorAll('ul, ol');
      lists.forEach(list => {
        list.style.cssText = `
          margin-top: 4pt !important;
          margin-bottom: 4pt !important;
          padding-left: 20pt !important;
          font-family: Arial, sans-serif !important;
          font-size: 10pt !important;
        `;
      });

      // Style list items
      const listItems = pdfContent.querySelectorAll('li');
      listItems.forEach(item => {
        item.style.cssText = `
          margin-top: 2pt !important;
          margin-bottom: 2pt !important;
          font-family: Arial, sans-serif !important;
          font-size: 10pt !important;
        `;
      });

      // Replace the original element with the styled clone
      element.innerHTML = pdfContent.innerHTML;

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    } finally {
      hideLoading();
    }
  };

  const onSubmit = async (data) => {
    try {
      const formattedContent = previewContent
        .replace(/\n/g, "\n") // Normalize newlines
        .replace(/\n\s*\n/g, "\n\n") // Normalize multiple newlines to double newlines
        .trim();

      console.log(previewContent, formattedContent);
      await saveResumeFn(previewContent);
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  const handleAdd = async () => {
    if (!currentEntry.title || !currentEntry.organization) {
      toast.error("Please fill in all required fields");
      return;
    }

    showLoading("Adding entry...");
    try {
      const newEntry = {
        ...currentEntry,
        id: Date.now(),
        description: currentEntry.description.trim().split('\n').filter(Boolean).join(' • ')
      };
      setEntries([...entries, newEntry]);
      setCurrentEntry({
        type: "Experience",
        title: "",
        organization: "",
        startDate: "",
        endDate: "",
        description: "",
      });
      toast.success("Entry added successfully");
    } catch (error) {
      toast.error("Failed to add entry");
    } finally {
      hideLoading();
    }
  };

  return (
    <div data-color-mode="light" className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-2">
        <h1 className="font-bold gradient-title text-5xl md:text-6xl">
          Resume Builder
        </h1>
        <div className="space-x-2">
          <Button
            variant="destructive"
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save
              </>
            )}
          </Button>
          <Button onClick={generatePDF} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="edit">Form</TabsTrigger>
          <TabsTrigger value="preview">Markdown</TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    {...register("contactInfo.email")}
                    type="email"
                    placeholder="your@email.com"
                    error={errors.contactInfo?.email}
                  />
                  {errors.contactInfo?.email && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mobile Number</label>
                  <Input
                    {...register("contactInfo.mobile")}
                    type="tel"
                    placeholder="+1 234 567 8900"
                  />
                  {errors.contactInfo?.mobile && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.mobile.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">LinkedIn URL</label>
                  <Input
                    {...register("contactInfo.linkedin")}
                    type="url"
                    placeholder="https://linkedin.com/in/your-profile"
                  />
                  {errors.contactInfo?.linkedin && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.linkedin.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Github/portfolio URL
                  </label>
                  <Input
                    {...register("contactInfo.twitter")}
                    type="url"
                    placeholder="Enter your gihub profile / portfolio link"
                  />
                  {errors.contactInfo?.twitter && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.twitter.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Professional Summary</h3>
              <Controller
                name="summary"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="h-32"
                    placeholder="Write a compelling professional summary..."
                    error={errors.summary}
                  />
                )}
              />
              {errors.summary && (
                <p className="text-sm text-red-500">{errors.summary.message}</p>
              )}
            </div>

            {/* Skills */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Skills</h3>
              <Controller
                name="skills"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="h-32"
                    placeholder="List your key skills..."
                    error={errors.skills}
                  />
                )}
              />
              {errors.skills && (
                <p className="text-sm text-red-500">{errors.skills.message}</p>
              )}
            </div>

            {/* Experience */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Work Experience</h3>
              <Controller
                name="experience"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Experience"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.experience && (
                <p className="text-sm text-red-500">
                  {errors.experience.message}
                </p>
              )}
            </div>

            {/* Education */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Education</h3>
              <Controller
                name="education"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Education"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.education && (
                <p className="text-sm text-red-500">
                  {errors.education.message}
                </p>
              )}
            </div>

            {/* Projects */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Projects</h3>
              <Controller
                name="projects"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Project"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.projects && (
                <p className="text-sm text-red-500">
                  {errors.projects.message}
                </p>
              )}
            </div>
          </form>
        </TabsContent>

        <TabsContent value="preview">
          {activeTab === "preview" && (
            <Button
              variant="link"
              type="button"
              className="mb-2"
              onClick={() =>
                setResumeMode(resumeMode === "preview" ? "edit" : "preview")
              }
            >
              {resumeMode === "preview" ? (
                <>
                  <Edit className="h-4 w-4" />
                  Edit Resume
                </>
              ) : (
                <>
                  <Monitor className="h-4 w-4" />
                  Show Preview
                </>
              )}
            </Button>
          )}

          {activeTab === "preview" && resumeMode !== "preview" && (
            <div className="flex p-3 gap-2 items-center border-2 border-yellow-600 text-yellow-600 rounded mb-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm">
                You will lose editied markdown if you update the form data.
              </span>
            </div>
          )}
          <div className="border rounded-lg">
            <MDEditor
              value={previewContent}
              onChange={setPreviewContent}
              height={800}
              preview={resumeMode}
              previewOptions={{
                className: "wmde-markdown",
                style: {
                  fontFamily: 'Arial, sans-serif',
                  fontSize: '10pt',
                  lineHeight: 1.2,
                  backgroundColor: '#ffffff',
                }
              }}
              style={{
                fontFamily: 'Arial, sans-serif',
                fontSize: '10pt',
                lineHeight: 1.2,
              }}
            />
          </div>
          <div className="hidden">
            <div id="resume-pdf" className="p-4" style={{ 
              fontFamily: 'Arial, sans-serif !important',
              fontSize: '10pt !important',
              lineHeight: '1.2 !important',
              maxWidth: '190mm !important',
              margin: '0 auto !important',
              backgroundColor: '#ffffff !important',
              color: '#000000 !important'
            }}>
              <MDEditor.Markdown
                source={previewContent}
                style={{
                  background: "white",
                  color: "black",
                  fontFamily: 'Arial, sans-serif !important',
                  fontSize: '10pt !important',
                }}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
