import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

export async function checkSubscribed() {
    try {
        const { userId } = await auth();
        if (!userId) return { isSubscribed: false };

        const user = await db.user.findUnique({
            where: { clerkId: userId },
        });

        if (!user) return { isSubscribed: false };

        const subscription = await db.subscription.findFirst({
            where: {
                userId: user.id,
                status: "active",
                expiresAt: { gt: new Date() },
            },
        });

        return {
            isSubscribed: Boolean(subscription),
        };
    } catch (error) {
        console.error("Error in checkSubscribed:", error);
        return { isSubscribed: false };
    }
}
