"use client";

import { useState, useEffect } from "react";
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
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [shouldNavigate, setShouldNavigate] = useState(false);
  const [error, setError] = useState(null);

  // Handle navigation after successful PDF generation
  useEffect(() => {
    if (shouldNavigate) {
      const timeout = setTimeout(() => {
        router.push("/onboarding");
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [shouldNavigate, router]);

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
      if (!isScriptLoaded) {
        toast.error("Please wait for the page to fully load");
        return;
      }

      setIsSubmitting(true);
      setError(null);
      
      // Show loading state
      toast.loading("Generating your career guide...");
      
      const result = await generateCareerPDF(answers);
      
      if (result.success && result.htmlContent) {
        // Create a temporary container with minimal styling
        const container = document.createElement('div');
        container.innerHTML = `
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            .career-guide { max-width: 800px; margin: 0 auto; padding: 20px; }
            .career-path { margin: 20px 0; padding: 15px; border: 1px solid #eee; }
            h1 { text-align: center; margin-bottom: 30px; }
            h2 { color: #2980b9; margin-bottom: 15px; }
            h3 { color: #2980b9; margin: 10px 0; }
            ul { padding-left: 20px; }
          </style>
          ${result.htmlContent}
        `;
        document.body.appendChild(container);

        try {
          await window.html2pdf()
            .set({
              margin: [10, 10],
              filename: 'career-guide.pdf',
              image: { type: 'jpeg', quality: 0.8 },
              html2canvas: { 
                scale: 1.5,
                useCORS: true,
                logging: false
              },
              jsPDF: { 
                unit: 'mm', 
                format: 'a4', 
                orientation: 'portrait'
              }
            })
            .from(container)
            .save();

          toast.success("Your career guide has been generated!");
          setShouldNavigate(true);
        } finally {
          document.body.removeChild(container);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to generate career guide. Please try again.");
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Script 
        src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"
        strategy="afterInteractive"
        onLoad={() => setIsScriptLoaded(true)}
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