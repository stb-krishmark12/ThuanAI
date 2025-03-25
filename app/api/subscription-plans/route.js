import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export async function GET() {
    const plans = await db.SubscriptionPlan.findMany();
    return NextResponse.json(plans);
}
