'use client';

import { useMemo } from 'react';
import type { EmailDocument } from 'email-editor-core';
import { renderEmail } from 'email-editor-core';

interface ExportButtonsProps {
  email: EmailDocument;
}

export default function ExportButtons({ email }: ExportButtonsProps) {
  const html = useMemo(() => renderEmail(email), [email]);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(html);
      alert('✅ HTML copied to clipboard!');
    } catch {
      alert('❌ Failed to copy to clipboard');
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    element.setAttribute('href', `data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    element.setAttribute('download', `email-${email.templateType}-${new Date().toISOString().slice(0, 10)}.html`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900">Export Email</h3>
      <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
        <p className="text-xs text-yellow-900">
          <span className="font-semibold">✓ Ready to send?</span> Your email includes all required sections (header, footer, compliance).
        </p>
      </div>
      <div className="space-y-2">
        <button
          onClick={handleCopyToClipboard}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
        >
          📋 Copy HTML Code
        </button>
        <button
          onClick={handleDownload}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
        >
          ⬇️ Download HTML File
        </button>
      </div>
      <p className="text-xs text-gray-600 mt-4">
        Use the HTML in your email service provider (ESP) to send campaigns via Mailchimp, SendGrid, etc.
      </p>
    </div>
  );
}
