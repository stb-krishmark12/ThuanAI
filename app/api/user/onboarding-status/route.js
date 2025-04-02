import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ hasCompletedOnboarding: false });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { hasCompletedOnboarding: true }
    });

    return NextResponse.json({ 
      hasCompletedOnboarding: user?.hasCompletedOnboarding || false 
    });
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    return NextResponse.json({ hasCompletedOnboarding: false });
  }
} 