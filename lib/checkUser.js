import { auth } from "@clerk/nextjs/server";

export const checkUser = async () => {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  // Return a basic user object without database access
  return {
    id: userId,
    clerkUserId: userId,
    email: userId, // You might want to get the actual email from Clerk
    name: "User", // You might want to get the actual name from Clerk
  };
};
