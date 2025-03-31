"use client";

import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import PillSelection from "./_components/pill-selection";
import OnboardingForm from "./_components/onboarding-form";
import { industries } from "@/data/industries";
import { useState, useEffect } from "react";

export default function OnboardingPage() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Check if user is already onboarded
    const checkOnboardingStatus = async () => {
      const { isOnboarded } = await getUserOnboardingStatus();
      if (isOnboarded) {
        redirect("/dashboard");
      }
    };

    checkOnboardingStatus();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {!showOnboarding ? (
        <PillSelection onSelect={() => setShowOnboarding(true)} />
      ) : (
        <OnboardingForm industries={industries} />
      )}
    </div>
  );
}
