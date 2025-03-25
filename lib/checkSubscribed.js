import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function checkSubscribed() {
    const { userId } = await auth();
    if (!userId) return false;

    const subscription = await db.Subscription.findFirst({
        where: {
            userId,
            status: "active",
            expiresAt: { gt: new Date() },
        },
    });

    return {
        isSubscribed: Boolean(subscription),
    };
}
