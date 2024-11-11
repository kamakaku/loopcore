import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              Über uns
            </h3>
            <p className="mt-4 text-base text-gray-500">
              Loopcore ist eine innovative Plattform für Design-Feedback und Kollaboration.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              Rechtliches
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/legal/imprint" className="text-base text-gray-500 hover:text-gray-900">
                  Impressum
                </Link>
              </li>
              <li>
                <Link to="/legal/privacy" className="text-base text-gray-500 hover:text-gray-900">
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link to="/legal/terms" className="text-base text-gray-500 hover:text-gray-900">
                  AGB
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              Support
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/legal/faq" className="text-base text-gray-500 hover:text-gray-900">
                  FAQ
                </Link>
              </li>
              <li>
                <a href="mailto:support@loopcore.app" className="text-base text-gray-500 hover:text-gray-900">
                  Support
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              Kontakt
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a href="mailto:info@loopcore.app" className="text-base text-gray-500 hover:text-gray-900">
                  info@loopcore.app
                </a>
              </li>
              <li className="text-base text-gray-500">
                Musterstraße 123<br />
                12345 Berlin
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8">
          <p className="text-base text-gray-400 text-center">
            © {new Date().getFullYear()} Loopcore GmbH. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
}