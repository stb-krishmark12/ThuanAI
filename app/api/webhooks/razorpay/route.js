import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req) {
    try {
        if (!(req instanceof Request)) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
        }

        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (!secret) {
            return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
        }

        const rawBody = await req.text();
        const signature = req.headers.get('x-razorpay-signature');
        if (!signature) {
            return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
        }

        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(rawBody)
            .digest('hex');

        if (expectedSignature !== signature) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        let event;
        try {
            event = JSON.parse(rawBody);
        } catch {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        if (event?.event === 'payment.captured') {
            const payment = event.payload?.payment?.entity;
            const { notes } = payment || {};
            const userId = notes?.userId;
            const planId = notes?.planId;

            if (!userId || !planId) {
                return NextResponse.json({ error: 'Missing plan or user info' }, { status: 400 });
            }

            try {
                const plan = await db.SubscriptionPlan.findUnique({
                    where: { id: planId },
                });

                if (!plan) {
                    return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
                }

                const existing = await db.Subscription.findFirst({
                    where: { razorpayPaymentId: payment.id },
                });

                if (existing) {
                    return NextResponse.json({ message: 'Already processed' });
                }

                const now = new Date();
                const expiresAt = new Date(now.getTime() + plan.durationInDays * 24 * 60 * 60 * 1000);

                console.log('Creating subscription', { userId, planId, now, expiresAt, paymentId: payment.id });
                console.log("timestamp check:", now, expiresAt);

                console.log("data:", {
                    userId,
                    planId,
                    status: 'active',
                    startsAt: now,
                    expiresAt,
                    razorpayPaymentId: payment.id,
                })

                await db.Subscription.create({
                    data: {
                        userId,
                        planId,
                        status: 'active',
                        startsAt: now,
                        expiresAt,
                        razorpayPaymentId: payment.id,
                    },
                });
            } catch (error) {
                return NextResponse.json({ error: 'Database operation failed' }, { status: 500 });
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        return NextResponse.json(
            {
                error: 'Internal server error',
                errorType: error instanceof Error ? error.name : 'Unknown',
                errorMessage: error instanceof Error ? error.message : 'Unexpected error',
            },
            { status: 500 }
        );
    }
}
