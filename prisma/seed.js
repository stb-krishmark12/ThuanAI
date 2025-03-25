// prisma/seed.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    await prisma.subscriptionPlan.createMany({
        data: [
            {
                name: 'Monthly Plan',
                description: '₹149/month',
                price: 14900,
                durationInDays: 30,
            },
            {
                name: 'Quarterly Plan',
                description: '₹399/3 months',
                price: 39900,
                durationInDays: 90,
            },
        ],
        skipDuplicates: true,
    });

    console.log('✔️ Seeded subscription plans');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
