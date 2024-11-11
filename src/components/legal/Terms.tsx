import React from 'react';
import Layout from '../layout/Layout';

export default function Terms() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-blue max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="mb-4">
              By accessing and using Loopcore ("the Service"), you accept and agree to be bound by the terms and conditions of this agreement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="mb-4">
              Loopcore is a collaborative design feedback platform that allows users to share, review, and comment on design work. The service includes features for team collaboration, project management, and design iteration.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p className="mb-4">
              To access the Service, you must register for an account. You agree to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Provide accurate account information</li>
              <li>Maintain the security of your account</li>
              <li>Promptly notify us of any unauthorized use</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Intellectual Property Rights</h2>
            <p className="mb-4">
              You retain all rights to your content. By using our service, you grant us a license to host, store, and share your content as necessary to provide the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Acceptable Use</h2>
            <p className="mb-4">
              You agree not to:
            </p>
            <ul className="list-disc pl-6 mb-4">
              <li>Violate any laws or regulations</li>
              <li>Infringe on others' intellectual property rights</li>
              <li>Share malicious code or content</li>
              <li>Attempt to breach security measures</li>
              <li>Use the service for unauthorized commercial purposes</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Termination</h2>
            <p className="mb-4">
              We reserve the right to suspend or terminate your account for violations of these terms or for any other reason at our discretion.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Changes to Terms</h2>
            <p className="mb-4">
              We may modify these terms at any time. Continued use of the service after changes constitutes acceptance of the modified terms.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}