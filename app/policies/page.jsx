"use client";

import React from "react";

export default function PoliciesPage() {
  return (
    <div className="min-h-screen pt-24 pb-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Terms and Conditions */}
        <section className="space-y-4">
          <h1 className="text-3xl font-bold text-white mb-8">Terms and Conditions</h1>
          <div className="space-y-4 text-gray-300">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p>By using ThunAI, you agree to these terms and conditions:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You must be at least 18 years old to use this service</li>
              <li>You are responsible for maintaining the confidentiality of your account</li>
              <li>You agree not to misuse or abuse the service</li>
              <li>We reserve the right to modify or terminate the service at any time</li>
              <li>All content provided is for informational purposes only</li>
            </ul>
          </div>
        </section>

        {/* Privacy Policy */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Privacy Policy</h2>
          <div className="space-y-4 text-gray-300">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p>We collect and process your data as follows:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Personal information (name, email, profile data)</li>
              <li>Career information and preferences</li>
              <li>Usage data and analytics</li>
              <li>Payment information (processed securely through Razorpay)</li>
            </ul>
            <p>We use this data to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide personalized career guidance</li>
              <li>Improve our services</li>
              <li>Communicate with you about your account</li>
              <li>Process payments and subscriptions</li>
            </ul>
          </div>
        </section>

        {/* Return/Refund/Cancellation Policy */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Return/Refund/Cancellation Policy</h2>
          <div className="space-y-4 text-gray-300">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Subscription cancellations can be made at any time</li>
              <li>Refunds are available within 7 days of purchase</li>
              <li>Access to services continues until the end of the billing period</li>
              <li>No refunds for partial months of service</li>
              <li>Contact support for any refund requests</li>
            </ul>
          </div>
        </section>

        {/* Contact Information */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Contact Information</h2>
          <div className="space-y-4 text-gray-300">
            <p>For any queries or concerns, please contact us:</p>
            <div className="space-y-2">
              <p>Email: thestbcompany@gmail.com</p>
              <p>Address: STB Company</p>
              <p>123 Business Street</p>
              <p>City, State 12345</p>
              <p>Country</p>
            </div>
            <p>Business Hours: Monday - Friday, 9:00 AM - 6:00 PM (IST)</p>
          </div>
        </section>
      </div>
    </div>
  );
} 