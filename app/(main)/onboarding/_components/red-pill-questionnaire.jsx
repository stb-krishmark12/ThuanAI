"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { generateCareerPDF } from "@/actions/career-pdf";
import { toast } from "sonner";

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

export default function RedPillQuestionnaire() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      await generateCareerPDF(answers);
      toast.success("Your career guide has been generated and sent to your email!");
      router.push("/onboarding");
    } catch (error) {
      toast.error("Failed to generate career guide. Please try again.");
      console.error("Error submitting answers:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-8">
      <Card className="p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Question {currentQuestion + 1} of {questions.length}</h2>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">{questions[currentQuestion].question}</h3>
          <RadioGroup
            value={answers[questions[currentQuestion].id]}
            onValueChange={handleAnswer}
            className="space-y-4"
          >
            {questions[currentQuestion].options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="text-lg">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentQuestion === 0}
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!answers[questions[currentQuestion].id] || isSubmitting}
          >
            {currentQuestion === questions.length - 1 ? "Submit" : "Next"}
          </Button>
        </div>
      </Card>
    </div>
  );
} 