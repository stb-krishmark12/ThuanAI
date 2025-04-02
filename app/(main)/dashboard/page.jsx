"use client";

import { getIndustryInsights } from "@/actions/dashboard";
import DashboardView from "./_component/dashboard-view";
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { useLoading } from "@/components/loading-provider";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/onboarding?edit=true">
          <Button variant="outline" className="gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit Profile
          </Button>
        </Link>
      </div>
      <DashboardView insights={insights} />
    </div>
  );
}
