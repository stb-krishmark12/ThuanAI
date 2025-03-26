import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  try {
    const loggedInUser = await db.user.upsert({
      where: {
        clerkUserId: user.id,
      },
      update: {
        name: `${user.firstName} ${user.lastName}`,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
      },
      create: {
        clerkUserId: user.id,
        name: `${user.firstName} ${user.lastName}`,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress,
        skills: [], // Initialize empty skills array
      },
    });

    return loggedInUser;
  } catch (error) {
    console.log(error.message);
    return null;
  }
};
