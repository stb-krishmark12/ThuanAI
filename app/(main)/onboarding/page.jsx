"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { industries } from "@/data/industries";
import OnboardingForm from "./_components/onboarding-form";

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedPill, setSelectedPill] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const handlePillSelect = (pill) => {
    setSelectedPill(pill);
  };

  const handleContinue = () => {
    if (selectedPill === "red") {
      router.push("/onboarding/red-pill");
    } else if (selectedPill === "blue") {
      setShowForm(true);
    }
  };

  if (showForm) {
    return <OnboardingForm industries={industries} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <Card className="w-full max-w-4xl p-8 bg-black/50 backdrop-blur-sm border border-gray-800">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Welcome to ThunAI</h1>
          <p className="text-xl text-gray-400">
            Choose your path to discover your perfect career
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Blue Pill */}
          <Card
            className={`p-6 cursor-pointer transition-all duration-300 ${
              selectedPill === "blue"
                ? "bg-blue-500/20 border-blue-500"
                : "bg-gray-800/50 border-gray-700 hover:bg-gray-800/70"
            }`}
            onClick={() => handlePillSelect("blue")}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">💊</span>
              </div>
              <h2 className="text-2xl font-bold mb-4 text-blue-400">Blue Pill</h2>
              <p className="text-gray-300 mb-4">
                Take the traditional path with a comprehensive profile setup for
                personalized career guidance.
              </p>
              <ul className="text-left text-gray-400 space-y-2 mb-6">
                <li>• Detailed profile creation</li>
                <li>• Industry-specific guidance</li>
                <li>• Skill assessment</li>
                <li>• Long-term career planning</li>
              </ul>
            </div>
          </Card>

          {/* Red Pill */}
          <Card
            className={`p-6 cursor-pointer transition-all duration-300 ${
              selectedPill === "red"
                ? "bg-red-500/20 border-red-500"
                : "bg-gray-800/50 border-gray-700 hover:bg-gray-800/70"
            }`}
            onClick={() => handlePillSelect("red")}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">💊</span>
              </div>
              <h2 className="text-2xl font-bold mb-4 text-red-400">Red Pill</h2>
              <p className="text-gray-300 mb-4">
                Take the quick path with an 8-question quiz to get your personalized
                career roadmap instantly.
              </p>
              <ul className="text-left text-gray-400 space-y-2 mb-6">
                <li>• Quick 8-question assessment</li>
                <li>• Instant career recommendations</li>
                <li>• Personalized roadmap</li>
                <li>• PDF guide delivered to your email</li>
              </ul>
            </div>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!selectedPill}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
          >
            Continue
          </Button>
        </div>
      </Card>
    </div>
  );
}
