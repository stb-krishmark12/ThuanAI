"use client";

import { getIndustryInsights } from "@/actions/dashboard";
import DashboardView from "./_component/dashboard-view";
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { useLoading } from "@/components/loading-provider";

export default function DashboardPage() {
  const [insights, setInsights] = useState(null);
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    const loadDashboard = async () => {
      showLoading("Loading your dashboard...");
      try {
        const { isOnboarded } = await getUserOnboardingStatus();
        if (!isOnboarded) {
          redirect("/onboarding");
          return;
        }
        const data = await getIndustryInsights();
        setInsights(data);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      } finally {
        hideLoading();
      }
    };

    loadDashboard();
  }, []);

  if (!insights) {
    return null;
  }

  return (
    <div className="container mx-auto">
      <DashboardView insights={insights} />
    </div>
  );
}
