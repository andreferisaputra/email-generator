"use client";

import type { Block, EmailDocument } from "email-editor-core";
import { MousePointer2, SlidersHorizontal, Type } from "lucide-react";
import BlockForm from "../BlockForm";
import ExportButtons from "../ExportButtons";

interface InspectorPanelProps {
  email: EmailDocument;
  selectedBlock?: Block;
  onUpdate: (id: string, updates: Partial<Block>) => void;
}

export default function InspectorPanel({
  email,
  selectedBlock,
  onUpdate,
}: InspectorPanelProps) {
  const editsContentInline =
    selectedBlock && ["title", "paragraph", "highlight-box", "button"].includes(selectedBlock.type);
  const supportsSelectionFormatting =
    selectedBlock && ["title", "paragraph", "highlight-box"].includes(selectedBlock.type);

  return (
    <aside className="rounded-2xl border border-slate-200/80 bg-white shadow-sm xl:sticky xl:top-24 xl:flex xl:h-[calc(100vh-7rem)] xl:flex-col">
      <div className="border-b border-slate-200 px-4 py-4">
        <div className="flex items-center gap-2 text-slate-900">
          <SlidersHorizontal size={17} aria-hidden="true" />
          <h2 className="font-semibold">Properties</h2>
        </div>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          Fine-tune the selected block and export when you are ready.
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {selectedBlock ? (
          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                  Selected block
                </p>
                <p className="mt-1 text-sm font-medium capitalize text-slate-900">
                  {selectedBlock.type.replace("-", " ")}
                </p>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-800">
                Edit on canvas
              </span>
            </div>
            {editsContentInline && (
              <div className="mb-4 flex gap-3 rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-700 shadow-sm">
                  <Type size={17} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Edit the content directly</p>
                  <p className="mt-0.5 text-xs leading-5 text-slate-600">
                    {supportsSelectionFormatting
                      ? "Click the text on the canvas. Highlight any words to open the formatting toolbar."
                      : "Click the button label on the canvas and type your changes there."}
                  </p>
                </div>
              </div>
            )}
            <BlockForm
              key={selectedBlock.id}
              block={selectedBlock}
              onUpdate={onUpdate}
              embedded
            />
          </div>
        ) : (
          <div className="flex min-h-56 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 text-center">
            <span className="flex size-11 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm">
              <MousePointer2 size={19} aria-hidden="true" />
            </span>
            <p className="mt-4 text-sm font-semibold text-slate-900">Select a block</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Click any canvas element to edit content directly and adjust its layout here.
            </p>
          </div>
        )}

        <div className="my-6 h-px bg-slate-200" />
        <ExportButtons email={email} />
      </div>
    </aside>
  );
}
