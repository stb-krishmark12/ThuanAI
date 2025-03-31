"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function PillSelection({ onSelect }) {
  const [selectedPill, setSelectedPill] = useState(null);

  const handlePillSelect = (pill) => {
    setSelectedPill(pill);
    if (pill === "blue") {
      onSelect();
    } else {
      // For red pill, we'll handle it later
      console.log("Red pill selected");
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-black text-white overflow-hidden">
      {/* Background Image */}
      <Image
        src="/pills.png"
        alt="Matrix Pills Choice"
        fill
        className="object-contain md:object-cover opacity-90 transition-opacity"
        priority
        quality={100}
      />

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/70" />

      <div className="relative z-10 w-full max-w-7xl p-4 md:p-8">
        <div className="text-center mb-8 md:mb-16">
          <h1 className="text-3xl md:text-5xl font-bold mb-2 md:mb-4 text-white drop-shadow-glow">
            Welcome to ThunAI
          </h1>
          <p className="text-lg md:text-xl text-gray-300">
            Choose your path to career enlightenment
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-12 px-4 md:px-12">
          {/* Blue Pill */}
          <div
            className={`transform hover:scale-105 transition-all duration-500 w-full md:w-1/2 p-4 md:p-6 rounded-lg backdrop-blur-sm cursor-pointer animate-float-left ${
              selectedPill === "blue"
                ? "border-[3px] border-blue-500 bg-blue-500/20"
                : "border-[1px] border-blue-800 hover:border-blue-500 bg-black/40"
            }`}
            onClick={() => handlePillSelect("blue")}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 mb-4 rounded-full bg-blue-500/50 animate-pulse flex items-center justify-center">
                <span className="text-xl md:text-2xl">💊</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-blue-400 mb-2 md:mb-4">Blue Pill</h2>
              <p className="text-sm md:text-base text-gray-300">
                Already have a career goal? Take this path to get personalized guidance, 
                skill development plans, and industry insights tailored to your chosen career path.
              </p>
            </div>
          </div>

          {/* Red Pill */}
          <div
            className={`transform hover:scale-105 transition-all duration-500 w-full md:w-1/2 p-4 md:p-6 rounded-lg backdrop-blur-sm cursor-pointer animate-float-right ${
              selectedPill === "red"
                ? "border-[3px] border-red-500 bg-red-500/20"
                : "border-[1px] border-red-800 hover:border-red-500 bg-black/40"
            }`}
            onClick={() => handlePillSelect("red")}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 md:w-16 md:h-16 mb-4 rounded-full bg-red-500/50 animate-pulse flex items-center justify-center">
                <span className="text-xl md:text-2xl">💊</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-red-400 mb-2 md:mb-4">Red Pill</h2>
              <p className="text-sm md:text-base text-gray-300">
                Unsure about your career path? Take this journey to discover your perfect 
                career match through our AI-powered assessment and receive a personalized 
                career roadmap with tailored recommendations.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float-left {
          0%, 100% { transform: translateY(0px) translateX(-5px); }
          50% { transform: translateY(-10px) translateX(5px); }
        }

        @keyframes float-right {
          0%, 100% { transform: translateY(0px) translateX(5px); }
          50% { transform: translateY(-10px) translateX(-5px); }
        }

        .animate-float-left {
          animation: float-left 3s ease-in-out infinite;
        }

        .animate-float-right {
          animation: float-right 3s ease-in-out infinite;
        }

        .drop-shadow-glow {
          filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.7));
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @media (max-width: 768px) {
          .animate-float-left,
          .animate-float-right {
            animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          }
        }
      `}</style>
    </div>
  );
} 