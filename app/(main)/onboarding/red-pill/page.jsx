"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { generateCareerPDF } from "@/actions/career-pdf";
import { toast } from "sonner";
import Script from 'next/script';

const questions = [
  {
    id: "work_preference",
    question: "How do you prefer to work?",
    options: [
      "Independently with clear goals",
      "In a team with collaborative tasks",
      "Mix of both, depending on the project",
      "Flexible, adapting to the situation"
    ]
  },
  {
    id: "task_preference",
    question: "What type of tasks do you enjoy most?",
    options: [
      "Creative problem-solving",
      "Detailed analysis and research",
      "Hands-on practical work",
      "Strategic planning and organization"
    ]
  },
  {
    id: "learning_style",
    question: "How do you prefer to learn new things?",
    options: [
      "Through practical experience",
      "By reading and studying",
      "Through interactive workshops",
      "By observing and imitating"
    ]
  },
  {
    id: "social_interaction",
    question: "How do you prefer to interact with others?",
    options: [
      "One-on-one meetings",
      "Group discussions and presentations",
      "Written communication",
      "Mix of different interaction styles"
    ]
  },
  {
    id: "job_motivation",
    question: "What excites you most about a job?",
    options: [
      "Solving complex problems",
      "Helping others",
      "Creating something new",
      "Learning and growing"
    ]
  },
  {
    id: "risk_preference",
    question: "How do you feel about taking risks?",
    options: [
      "Comfortable with calculated risks",
      "Prefer stability and security",
      "Open to risks with proper planning",
      "Depends on the potential reward"
    ]
  },
  {
    id: "pressure_handling",
    question: "How do you handle pressure and deadlines?",
    options: [
      "Thrive under pressure",
      "Prefer steady, manageable pace",
      "Can handle occasional pressure",
      "Work best with clear timelines"
    ]
  },
  {
    id: "work_environment",
    question: "What work environment do you prefer?",
    options: [
      "Traditional office setting",
      "Remote or hybrid work",
      "Dynamic, changing environments",
      "Flexible, adaptable spaces"
    ]
  }
];

export default function RedPillPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleAnswer = (value) => {
    setAnswers((prev) => ({
      ...prev,
      [questions[currentQuestion].id]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      const result = await generateCareerPDF(answers);
      
      if (result.success && result.htmlContent) {
        // Create a temporary container and add it to the DOM
        const container = document.createElement('div');
        container.innerHTML = result.htmlContent;
        container.style.width = '210mm'; // A4 width
        container.style.padding = '20px';
        document.body.appendChild(container);

        // Wait for images and fonts to load
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Generate PDF
        const opt = {
          margin: [10, 10],
          filename: 'career-guide.pdf',
          image: { type: 'jpeg', quality: 1 },
          html2canvas: { 
            scale: 2,
            useCORS: true,
            logging: true
          },
          jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait'
          }
        };

        try {
          await html2pdf()
            .set(opt)
            .from(container)
            .save();

          toast.success("Your career guide has been generated!");
          router.push("/onboarding");
        } catch (pdfError) {
          console.error("PDF generation error:", pdfError);
          throw new Error("Failed to generate PDF");
        } finally {
          // Clean up
          document.body.removeChild(container);
        }
      } else {
        throw new Error("Failed to get career guide content");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to generate career guide. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Script 
        src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
        strategy="beforeInteractive"
      />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white p-4">
        <Card className="w-full max-w-2xl p-8 bg-black/50 backdrop-blur-sm border border-gray-800">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 text-red-400">Red Pill Path</h1>
            <p className="text-gray-400">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </div>

          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">
              {questions[currentQuestion].question}
            </h2>

            <RadioGroup
              value={answers[questions[currentQuestion].id]}
              onValueChange={handleAnswer}
              className="space-y-4"
            >
              {questions[currentQuestion].options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={option}
                    id={`option-${index}`}
                    className="border-gray-600"
                  />
                  <Label
                    htmlFor={`option-${index}`}
                    className="text-gray-300 cursor-pointer"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {error && (
              <div className="text-red-400 text-sm mt-4">
                {error}
              </div>
            )}

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentQuestion === 0 || isSubmitting}
              >
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={!answers[questions[currentQuestion].id] || isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⌛</span>
                    {currentQuestion === questions.length - 1 ? "Generating..." : "Processing..."}
                  </span>
                ) : (
                  currentQuestion === questions.length - 1 ? "Generate Career Guide" : "Next"
                )}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
} 