import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  try {
    const loggedInUser = await db.user.findUnique({
      where: {
        clerkId: user.id,
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    const name = `${user.firstName} ${user.lastName}`;

    const newUser = await db.user.create({
      data: {
        clerkId: user.id,
        name,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
        hasCompletedOnboarding: false,
      },
    });

    return newUser;
  } catch (error) {
    console.error("Error in checkUser:", error);
    throw error;
  }
};
