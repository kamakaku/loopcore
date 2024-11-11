import React from 'react';
import Layout from '../layout/Layout';

export default function FAQ() {
  const faqs = [
    {
      question: "What is Loopcore?",
      answer: "Loopcore is a collaborative design feedback platform that helps teams streamline their design review process. It allows you to share designs, collect feedback, and manage design iterations in one place."
    },
    {
      question: "How do I get started?",
      answer: "Getting started is easy! Simply sign up for an account, create your first loop by uploading a design or sharing a URL, and invite your team members to collaborate."
    },
    {
      question: "What file types are supported?",
      answer: "We support various file types including images (PNG, JPG, GIF), PDFs, and direct integration with Figma. You can also share URLs for web-based designs."
    },
    {
      question: "How does team collaboration work?",
      answer: "You can create teams, add members, and organize projects. Team members can view designs, leave comments, and create spots to highlight specific areas for feedback."
    },
    {
      question: "Is my data secure?",
      answer: "Yes, we take security seriously. All data is encrypted in transit and at rest. We use industry-standard security measures to protect your information."
    },
    {
      question: "What are the pricing plans?",
      answer: "We offer flexible pricing plans to suit different team sizes and needs. Visit our pricing page for detailed information about our plans and features."
    },
    {
      question: "Can I integrate Loopcore with other tools?",
      answer: "Yes, we offer API access and webhooks for integration with your existing tools. We also have direct integration with popular design tools like Figma."
    },
    {
      question: "How do I cancel my subscription?",
      answer: "You can cancel your subscription at any time from your account settings. Your data will be retained for 30 days after cancellation."
    }
  ];

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Frequently Asked Questions</h1>
        
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {faq.question}
              </h3>
              <p className="text-gray-600">
                {faq.answer}
              </p>
            </div>
          ))}

          <div className="mt-8 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold text-blue-900 mb-4">
              Still have questions?
            </h2>
            <p className="text-blue-700 mb-4">
              We're here to help! Contact our support team and we'll get back to you as soon as possible.
            </p>
            <a
              href="mailto:support@loopcore.app"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
}