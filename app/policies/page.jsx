"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PoliciesPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12">Policies & Information</h1>

        {/* Privacy Policy */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Privacy Policy</h2>
          <div className="prose prose-invert max-w-none">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p>
              At ThunAI, we take your privacy seriously. This Privacy Policy explains how we collect,
              use, and protect your personal information when you use our services.
            </p>
            <h3>Information We Collect</h3>
            <ul>
              <li>Personal information (name, email, contact details)</li>
              <li>Career information and preferences</li>
              <li>Usage data and analytics</li>
              <li>Payment information (processed securely through Razorpay)</li>
            </ul>
            <h3>How We Use Your Information</h3>
            <ul>
              <li>To provide personalized career guidance</li>
              <li>To improve our services</li>
              <li>To communicate with you about our services</li>
              <li>To process payments and subscriptions</li>
            </ul>
          </div>
        </section>

        {/* Terms and Conditions */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Terms and Conditions</h2>
          <div className="prose prose-invert max-w-none">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p>
              By using ThunAI, you agree to these terms and conditions. Please read them carefully.
            </p>
            <h3>Service Usage</h3>
            <ul>
              <li>You must be at least 18 years old to use our services</li>
              <li>You are responsible for maintaining the security of your account</li>
              <li>You agree not to misuse or abuse our services</li>
              <li>We reserve the right to modify or discontinue services at any time</li>
            </ul>
          </div>
        </section>

        {/* Refund Policy */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Refund Policy</h2>
          <div className="prose prose-invert max-w-none">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p>
              We offer a 7-day money-back guarantee for all our subscription plans.
            </p>
            <h3>Refund Process</h3>
            <ul>
              <li>Request must be made within 7 days of purchase</li>
              <li>Account must not have used premium features</li>
              <li>Refunds will be processed within 5-7 business days</li>
              <li>Access will be revoked immediately upon refund approval</li>
            </ul>
          </div>
        </section>

        {/* Contact Us */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
          <div className="prose prose-invert max-w-none">
            <p>
              Have questions? We're here to help! Contact us through any of the following channels:
            </p>
            <ul>
              <li>Email: thestbcompany@gmail.com</li>
              <li>Support Hours: Monday - Friday, 9:00 AM - 6:00 PM IST</li>
            </ul>
            <div className="mt-6">
              <a href="mailto:thestbcompany@gmail.com">
                <Button className="w-full sm:w-auto">
                  Send us an Email
                </Button>
              </a>
            </div>
          </div>
        </section>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link href="/">
            <Button variant="outline">
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 