import Razorpay from 'razorpay';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/prisma';
import { NextResponse } from 'next/server';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
});

export async function POST(req) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { planId } = await req.json();

    const plan = await db.SubscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan) return NextResponse.json({ error: 'Invalid plan' }, { status: 404 });

    const order = await razorpay.orders.create({
        amount: plan.price,
        currency: 'INR',
        payment_capture: 1,
        notes: { planId, userId },
    });

    return NextResponse.json({
        orderId: order.id,
        razorpayKey: process.env.RAZORPAY_KEY,
        amount: plan.price,
    });
}
