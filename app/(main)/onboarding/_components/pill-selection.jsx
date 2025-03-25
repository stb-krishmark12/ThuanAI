"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function PillSelection() {
  const router = useRouter();
  const [selectedPill, setSelectedPill] = useState(null);

  const handlePillSelect = (pill) => {
    setSelectedPill(pill);
    if (pill === "red") {
      router.push("/onboarding/red-pill");
    } else {
      router.push("/onboarding/form");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <Card className="w-full max-w-2xl p-8 bg-black/50 backdrop-blur-sm border border-gray-800">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Welcome to ThunAI</h1>
          <p className="text-gray-400 text-lg">
            Choose your path to career enlightenment
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Blue Pill */}
          <div
            className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
              selectedPill === "blue"
                ? "border-blue-500 bg-blue-500/10"
                : "border-blue-800 hover:border-blue-500"
            }`}
            onClick={() => handlePillSelect("blue")}
          >
            <h2 className="text-2xl font-bold text-blue-400 mb-4">Blue Pill</h2>
            <p className="text-gray-300">
              Take the traditional path. Fill out your complete profile manually and
              get personalized career guidance based on your detailed information.
            </p>
          </div>

          {/* Red Pill */}
          <div
            className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
              selectedPill === "red"
                ? "border-red-500 bg-red-500/10"
                : "border-red-800 hover:border-red-500"
            }`}
            onClick={() => handlePillSelect("red")}
          >
            <h2 className="text-2xl font-bold text-red-400 mb-4">Red Pill</h2>
            <p className="text-gray-300">
              Answer 8 quick questions and receive a personalized career roadmap
              with free course links and internship opportunities sent directly to
              your email.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
} 