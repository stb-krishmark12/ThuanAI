'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';

export default function SubscribePage() {
    const [plans, setPlans] = useState([]);
    const { isSignedIn } = useAuth();

    useEffect(() => {
        fetch('/api/subscription-plans')
            .then(res => res.json())
            .then(data => setPlans(data));
    }, []);

    const handleSubscribe = async (planId) => {
        if (!isSignedIn) {
            window.location.href = '/sign-in';
            return;
        }

        const res = await fetch('/api/create-order', {
            method: 'POST',
            body: JSON.stringify({ planId }),
            headers: { 'Content-Type': 'application/json' },
        });

        const data = await res.json();

        const options = {
            key: data.razorpayKey,
            amount: data.amount,
            currency: 'INR',
            order_id: data.orderId,
            handler: function (response) {
                alert('Payment successful!');
                window.location.href = '/onboarding';
            },
            theme: { color: '#6366f1' },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    return (
        <div style={{ padding: '40px' }}>
            <h1>Available Plans</h1>
            {plans.map((plan) => (
                <div key={plan.id} style={{ margin: '20px 0' }}>
                    <h3>{plan.name}</h3>
                    <p>{plan.description}</p>
                    <button onClick={() => handleSubscribe(plan.id)}>Subscribe</button>
                </div>
            ))}
        </div>
    );
}
