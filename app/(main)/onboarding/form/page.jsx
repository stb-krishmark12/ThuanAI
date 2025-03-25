"use client";

import { industries } from "@/data/industries";
import OnboardingForm from "../_components/onboarding-form";

export default function FormPage() {
  return (
    <div className="min-h-screen bg-background">
      <OnboardingForm industries={industries} />
    </div>
  );
} 