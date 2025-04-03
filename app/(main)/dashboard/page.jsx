"use client";

import { getIndustryInsights } from "@/actions/dashboard";
import DashboardView from "./_component/dashboard-view";
import { getUserOnboardingStatus } from "@/actions/user";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { useLoading } from "@/components/loading-provider";
import { Button } from "@/components/ui/button";
import { PenBox } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const [insights, setInsights] = useState(null);
  const { showLoading, hideLoading } = useLoading();

  useEffect(() => {
    // Refresh the page once when component mounts

    if (!window.location.href.includes('?refreshed=true')) {
      window.location.href = window.location.href + '?refreshed=true';
      return;
    }

    const loadDashboard = async () => {
      showLoading("Loading your dashboard...");
      try {
        const res = await fetch("/api/user/isonboarded");
        const d = await res.json();

        if (!d.onboarded) {
          window.location.href = "/onboarding";
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <Link href="/onboarding/form?edit=true">
          <Button variant="outline" className="flex items-center gap-2">
            <PenBox className="h-4 w-4" />
            Edit Profile
          </Button>
        </Link>
      </div>
      <DashboardView insights={insights} />
    </div>
  );
}
