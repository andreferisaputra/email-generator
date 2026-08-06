"use client";

import { useMemo, useState } from "react";
import type { EmailDocument } from "email-editor-core";
import { renderEmail } from "email-editor-core";
import { Check, Clipboard, Download } from "lucide-react";

interface ExportButtonsProps {
  email: EmailDocument;
}

export default function ExportButtons({ email }: ExportButtonsProps) {
  const html = useMemo(() => renderEmail(email), [email]);
  const [copied, setCopied] = useState(false);

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(html);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    element.setAttribute("href", `data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    element.setAttribute("download", `email-${new Date().toISOString().slice(0, 10)}.html`);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <section aria-labelledby="export-heading">
      <div className="mb-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
          Delivery
        </p>
        <h3 id="export-heading" className="mt-1 font-semibold text-slate-950">
          Export email
        </h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Copy the final HTML or download a file for your email service provider.
        </p>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={handleCopyToClipboard}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          {copied ? <Check size={17} aria-hidden="true" /> : <Clipboard size={17} aria-hidden="true" />}
          {copied ? "Copied" : "Copy HTML"}
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
        >
          <Download size={17} aria-hidden="true" />
          Download HTML
        </button>
      </div>

      <p className="mt-3 text-xs text-slate-400" aria-live="polite">
        {copied ? "HTML copied to your clipboard." : "Fixed compliance sections are included automatically."}
      </p>
    </section>
  );
}
