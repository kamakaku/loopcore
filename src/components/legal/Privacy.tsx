import React from 'react';
import Layout from '../layout/Layout';

export default function Privacy() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-blue max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Data Protection Overview</h2>
            <p className="mb-4">
              We take the protection of your personal data very seriously. This privacy policy informs you about how we handle your personal data when you use our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Data Collection</h2>
            <h3 className="text-xl font-medium mb-3">2.1 What data do we collect?</h3>
            <ul className="list-disc pl-6 mb-4">
              <li>Email address</li>
              <li>Name (if provided)</li>
              <li>Profile information</li>
              <li>Usage data</li>
              <li>Technical data (IP address, browser type, etc.)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Data Usage</h2>
            <p className="mb-4">
              We use your data to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide and maintain our service</li>
              <li>Notify you about changes to our service</li>
              <li>Provide customer support</li>
              <li>Monitor the usage of our service</li>
              <li>Detect, prevent and address technical issues</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Data Storage</h2>
            <p className="mb-4">
              Your data is stored securely in data centers within the European Union. We implement appropriate technical and organizational measures to protect your personal data against accidental or unlawful destruction, loss, alteration, unauthorized disclosure, or access.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
            <p className="mb-4">
              Under GDPR, you have the following rights:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Right to access your personal data</li>
              <li>Right to rectification of inaccurate data</li>
              <li>Right to erasure of your data</li>
              <li>Right to restrict processing</li>
              <li>Right to data portability</li>
              <li>Right to object to processing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Contact</h2>
            <p className="mb-4">
              If you have any questions about this Privacy Policy, please contact us at:<br />
              privacy@loopcore.app
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}