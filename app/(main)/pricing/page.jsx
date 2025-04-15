'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import Script from 'next/script';

export default function SubscribePage() {
    const [plans, setPlans] = useState([]);
    const { isSignedIn } = useAuth();
    const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);

    // Fetch plans from the database
    useEffect(() => {
        fetch('/api/subscription-plans')
            .then(res => res.json())
            .then(data => {
                // Apply special offer to the ₹399 plan
                const modifiedPlans = data.map(plan => {
                    if (plan.price === 39900) { // 399 in paise
                        return {
                            ...plan,
                            originalPrice: plan.price,
                            price: 9900, // 99 in paise
                            isSpecialOffer: true
                        };
                    }
                    return plan;
                });
                setPlans(modifiedPlans);
            })
            .catch(err => console.error('Error fetching plans:', err));
    }, []);

    const handleSubscribe = async (planId) => {
        if (!isSignedIn) {
            window.location.href = '/sign-in';
            return;
        }

        try {
            const res = await fetch('/api/create-order', {
                method: 'POST',
                body: JSON.stringify({ planId }),
                headers: { 'Content-Type': 'application/json' },
            });

            if (!res.ok) {
                throw new Error('Failed to create order');
            }

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
        } catch (error) {
            console.error('Payment error:', error);
            alert('Failed to initiate payment. Please try again.');
        }
    };

    return (
        <>
            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                onLoad={() => setIsRazorpayLoaded(true)}
                strategy="beforeInteractive"
            />
            <div className="min-h-screen relative flex flex-col items-center justify-center bg-black text-white overflow-hidden">
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/70" />

                {/* Limited Time Offer Banner */}
                <div className="relative z-20 w-full bg-gradient-to-r from-red-600 via-red-500 to-red-600 py-2">
                    <div className="container mx-auto text-center">
                        <p className="text-white font-bold animate-pulse">
                            🔥 Limited Time Offer: Get Started for Just ₹99! 🔥
                        </p>
                    </div>
                </div>

                <div className="relative z-10 w-full max-w-7xl p-4 md:p-8">
                    <div className="text-center mb-8 md:mb-16">
                        <h1 className="text-3xl md:text-5xl font-bold mb-2 md:mb-4 text-white drop-shadow-glow">
                            Choose Your Plan
                        </h1>
                        <p className="text-lg md:text-xl text-gray-300">
                            Select the perfect plan for your career growth journey
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-12 px-4 md:px-12">
                        {plans.map((plan) => (
                            <div
                                key={plan.id}
                                className={`transform hover:scale-105 transition-all duration-500 w-full md:w-1/2 p-6 md:p-8 rounded-lg backdrop-blur-sm cursor-pointer animate-float-left border-[1px] border-blue-800 hover:border-blue-500 bg-black/40`}
                            >
                                {plan.isSpecialOffer && (
                                    <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold animate-bounce">
                                        75% OFF
                                    </div>
                                )}
                                <div className="flex flex-col items-center text-center">
                                    <h2 className="text-xl md:text-2xl font-bold text-blue-400 mb-4">
                                        {plan.name}
                                    </h2>
                                    <div className="mb-2">
                                        {plan.isSpecialOffer ? (
                                            <div className="flex flex-col items-center">
                                                <span className="text-2xl text-gray-400 line-through mb-1">
                                                    ₹{(plan.originalPrice / 100).toFixed(0)}
                                                </span>
                                                <span className="text-4xl md:text-5xl font-extrabold text-red-500">
                                                    ₹{(plan.price / 100).toFixed(0)}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-4xl md:text-5xl font-extrabold text-white">
                                                ₹{(plan.price / 100).toFixed(0)}
                                            </span>
                                        )}
                                        <span className="text-gray-400 ml-2">
                                            {plan.durationInDays === 30 ? '/month' : '/3 months'}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleSubscribe(plan.id)}
                                        className={`w-full py-3 px-6 ${
                                            plan.isSpecialOffer 
                                                ? 'bg-red-500/50 hover:bg-red-500/70 border-red-400 hover:border-red-300' 
                                                : 'bg-blue-500/50 hover:bg-blue-500/70 border-blue-400 hover:border-blue-300'
                                        } text-white font-semibold rounded-md transition-all duration-300 border backdrop-blur-sm animate-pulse-slow`}
                                    >
                                        {plan.isSpecialOffer ? 'Grab the Offer!' : 'Subscribe Now'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Timer Banner */}
                    <div className="mt-8 text-center">
                        <p className="text-red-400 font-semibold animate-pulse">
                            ⏰ Hurry! Limited Time Offer Ends Soon! ⏰
                        </p>
                    </div>

                    {/* FAQ Section */}
                    <div className="mt-24 max-w-3xl mx-auto">
                        <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-12 drop-shadow-glow">
                            Frequently Asked Questions
                        </h2>
                        <dl className="space-y-8">
                            <div className="backdrop-blur-sm bg-black/30 p-6 rounded-lg border border-blue-900/50">
                                <dt className="text-lg font-semibold text-blue-400">
                                    How does the billing work?
                                </dt>
                                <dd className="mt-2 text-gray-300">
                                    You'll be billed monthly according to your chosen plan.
                                </dd>
                            </div>
                            <div className="backdrop-blur-sm bg-black/30 p-6 rounded-lg border border-blue-900/50">
                                <dt className="text-lg font-semibold text-blue-400">
                                    Can I cancel my subscription?
                                </dt>
                                <dd className="mt-2 text-gray-300">
                                    Yes, you can cancel your subscription at any time. Your access will continue until the end of your billing period.
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                @keyframes float-left {
                    0%, 100% { transform: translateY(0px) translateX(-5px); }
                    50% { transform: translateY(-10px) translateX(5px); }
                }

                .animate-float-left {
                    animation: float-left 3s ease-in-out infinite;
                }

                .drop-shadow-glow {
                    filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.7));
                }

                @keyframes pulse-slow {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }

                .animate-pulse-slow {
                    animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }

                @media (max-width: 768px) {
                    .animate-float-left {
                        animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                    }
                }
            `}</style>
        </>
    );
}
