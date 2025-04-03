import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function GET() {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ onboarded: false }, { status: 401 });
    }

    const user = await db.User.findUnique({
        where: { clerkUserId: userId },
    });

    return NextResponse.json({ onboarded: user?.isOnboarded ?? false });
}
