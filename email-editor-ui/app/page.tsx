'use client';

import { useState } from 'react';
import TemplateSelector from '@/components/TemplateSelector';
import EmailEditor from '@/components/EmailEditor';
import type { EmailDocument, TemplateType } from 'email-editor-core';

export default function Home() {
  const [template, setTemplate] = useState<TemplateType | null>(null);
  const [email, setEmail] = useState<EmailDocument | null>(null);

  const handleTemplateSelect = (selectedTemplate: TemplateType) => {
    setTemplate(selectedTemplate);
    // Initialize empty document will be done in EmailEditor
  };

  const handleBack = () => {
    setTemplate(null);
    setEmail(null);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <header className="border-b bg-white shadow-sm sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">📧 Email Generator</h1>
              <p className="text-sm text-gray-600 mt-1">
                {template ? 'Building your email campaign' : 'Create professional email campaigns'}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {!template ? (
          <TemplateSelector onSelect={handleTemplateSelect} />
        ) : (
          <EmailEditor template={template} onBack={handleBack} />
        )}
      </main>

      <footer className="bg-white border-t mt-12">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-xs text-gray-500 text-center">
            NOBI Dana Kripto Email Generator • All emails are safe and GDPR-compliant
          </p>
        </div>
      </footer>
    </div>
  );
}
