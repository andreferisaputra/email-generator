'use client';

import { useMemo } from 'react';
import type { EmailDocument } from 'email-editor-core';
import { renderEmail } from 'email-editor-core';

interface PreviewProps {
  email: EmailDocument;
}

export default function Preview({ email }: PreviewProps) {
  const html = useMemo(() => renderEmail(email), [email]);

  return (
    <div className="space-y-3">
      <div>
        <h3 className="font-semibold text-gray-900">Live Preview</h3>
        <p className="text-xs text-gray-600 mt-1">600px viewport (desktop email width)</p>
      </div>
      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white shadow">
        <div
          className="bg-gray-100 flex justify-center p-4"
          style={{ width: '100%' }}
        >
          <iframe
            srcDoc={html}
            className="border-none"
            style={{
              width: '600px',
              maxWidth: '100%',
              height: '800px',
              backgroundColor: 'white',
            }}
            title="Email Preview"
          />
        </div>
      </div>
      <p className="text-xs text-gray-500 text-center">Scroll in preview to see full email including footer</p>
    </div>
  );
}
