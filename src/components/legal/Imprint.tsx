import React from 'react';
import Layout from '../layout/Layout';

export default function Imprint() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Imprint</h1>
        
        <div className="prose prose-blue max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Company Information</h2>
            <p className="mb-4">
              Loopcore GmbH<br />
              Musterstraße 123<br />
              12345 Berlin<br />
              Germany
            </p>
            <p className="mb-4">
              Commercial Register: HRB 123456<br />
              Registration Court: Amtsgericht Berlin-Charlottenburg
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact</h2>
            <p className="mb-4">
              Email: info@loopcore.app<br />
              Phone: +49 (0) 30 123456789
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Management</h2>
            <p className="mb-4">
              CEO: John Doe<br />
              CTO: Jane Smith
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">VAT Information</h2>
            <p className="mb-4">
              VAT ID: DE123456789
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Responsible for Content</h2>
            <p className="mb-4">
              According to § 55 Abs. 2 RStV:<br />
              John Doe<br />
              Loopcore GmbH<br />
              Musterstraße 123<br />
              12345 Berlin
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
}