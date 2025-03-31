import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/sign-in",
  "/sign-up",
  "/pricing",
  "/policies",
  "/api/webhook/clerk",
  "/api/webhook/stripe",
];

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const path = req.nextUrl.pathname;

  // Allow public routes
  if (publicRoutes.includes(path)) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
