"use server";

import { db } from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { generateAIInsights } from "./dashboard";

export async function updateUser(data) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    // Start a transaction to handle all operations
    const result = await db.$transaction(
      async (tx) => {
        // Try to find the user, if not found create a basic record
        let user = await tx.user.findUnique({
          where: { clerkUserId: userId },
        });

        if (!user) {
          // Get user data from Clerk
          const clerkUser = await currentUser();
          const name = `${clerkUser.firstName} ${clerkUser.lastName}`;
          
          // Create basic user record
          user = await tx.user.create({
            data: {
              clerkUserId: userId,
              name,
              imageUrl: clerkUser.imageUrl,
              email: clerkUser.emailAddresses[0].emailAddress,
              skills: [], // Initialize empty skills array
            },
          });
        }

        // Check if industry exists or create it
        let industryInsight = await tx.industryInsight.findUnique({
          where: {
            industry: data.industry,
          },
        });

        if (!industryInsight) {
          const insights = await generateAIInsights(data.industry);
          industryInsight = await tx.industryInsight.create({
            data: {
              industry: data.industry,
              ...insights,
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
        }

        // Update the user with onboarding data
        const updatedUser = await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            industry: data.industry,
            experience: parseInt(data.experience) || 0,
            bio: data.bio || "",
            skills: Array.isArray(data.skills) ? data.skills : [],
            isOnboarded: true,
          },
          include: {
            industryInsight: true,
          },
        });

        return { success: true, user: updatedUser };
      },
      {
        timeout: 15000, // Increased timeout for safety
      }
    );

    revalidatePath("/");
    return result;
  } catch (error) {
    console.error("Error in updateUser:", error);
    throw new Error(error.message || "Failed to update profile");
  }
}

export async function getUserOnboardingStatus() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  try {
    const user = await db.user.findUnique({
      where: {
        clerkUserId: userId,
      },
      select: {
        industry: true,
        isOnboarded: true,
      },
    });

    return {
      isOnboarded: !!user?.isOnboarded,
    };
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    throw new Error("Failed to check onboarding status");
  }
}
