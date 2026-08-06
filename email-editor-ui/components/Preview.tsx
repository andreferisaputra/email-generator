"use client";

import { useMemo } from "react";
import type { EmailDocument } from "email-editor-core";
import { renderEmail } from "email-editor-core";

interface PreviewProps {
  email: EmailDocument;
  viewport?: "desktop" | "mobile";
}

export default function Preview({ email, viewport = "desktop" }: PreviewProps) {
  const html = useMemo(() => renderEmail(email), [email]);
  const width = viewport === "desktop" ? 600 : 375;

  return (
    <div className="flex min-h-[760px] justify-center overflow-x-auto px-4 py-8 sm:px-8">
      <div
        className="shrink-0 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(24,42,34,0.16)]"
        style={{ width }}
      >
        <iframe
          srcDoc={html}
          className="block h-[820px] w-full border-0 bg-white"
          title={`${viewport} email preview`}
          sandbox="allow-popups allow-popups-to-escape-sandbox"
        />
      </div>
    </div>
  );
}
