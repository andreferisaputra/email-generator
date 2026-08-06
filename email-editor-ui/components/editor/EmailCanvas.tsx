/* eslint-disable @next/next/no-img-element */
"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Block } from "email-editor-core";
import { LockKeyhole, Plus } from "lucide-react";
import type { ReactNode } from "react";
import CanvasBlock from "./CanvasBlock";

interface EmailCanvasProps {
  blocks: Block[];
  selectedId: string | null;
  viewport: "desktop" | "mobile";
  onSelect: (id: string | null) => void;
  onUpdate: (id: string, updates: Partial<Block>) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onAddDefault: () => void;
}

function LockedSection({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 border-y border-dashed border-slate-200 bg-slate-50 px-5 py-3 text-xs font-medium text-slate-500">
      <LockKeyhole size={13} aria-hidden="true" />
      {children}
    </div>
  );
}

export default function EmailCanvas({
  blocks,
  selectedId,
  viewport,
  onSelect,
  onUpdate,
  onDuplicate,
  onDelete,
  onAddDefault,
}: EmailCanvasProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: "email-canvas",
    data: { source: "canvas-dropzone" },
  });

  return (
    <div className="editor-stage flex min-h-[760px] justify-center overflow-x-auto px-4 py-8 sm:px-8">
      <div
        ref={setNodeRef}
        className={`canvas-sheet relative shrink-0 overflow-hidden rounded-[22px] border bg-white shadow-[0_28px_80px_rgba(24,42,34,0.16)] transition-all duration-200 ${
          isOver ? "border-emerald-500 ring-4 ring-emerald-200/60" : "border-slate-200"
        }`}
        style={{ width: viewport === "desktop" ? 640 : 375 }}
        onClick={(event) => {
          if (event.target === event.currentTarget) onSelect(null);
        }}
      >
        <div className="flex h-20 items-center justify-center bg-white px-6">
          <img
            src="https://nobi.id/icons/logo-nobi-dana-kripto-black.png"
            alt="NOBI Dana Kripto"
            className="max-h-8 w-auto max-w-[180px] object-contain"
          />
        </div>

        <LockedSection>Header is included automatically</LockedSection>

        <div className="min-h-[420px] px-4 py-5 sm:px-6">
          <SortableContext
            items={blocks.map((block) => block.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1">
              {blocks.map((block) => (
                <CanvasBlock
                  key={block.id}
                  block={block}
                  selected={selectedId === block.id}
                  onSelect={(id) => onSelect(id)}
                  onUpdate={onUpdate}
                  onDuplicate={onDuplicate}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </SortableContext>

          {blocks.length === 0 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onAddDefault();
              }}
              className="flex min-h-64 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-emerald-200 bg-emerald-50/40 px-8 text-center transition hover:border-emerald-400 hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              <span className="flex size-12 items-center justify-center rounded-full bg-white text-emerald-700 shadow-sm">
                <Plus size={22} aria-hidden="true" />
              </span>
              <span className="mt-4 text-sm font-semibold text-slate-900">Drop content here</span>
              <span className="mt-1 max-w-60 text-xs leading-5 text-slate-500">
                Drag from the component library, or click to add a text block.
              </span>
            </button>
          )}
        </div>

        <LockedSection>Help, compliance, and footer sections are locked</LockedSection>
        <div className="h-24 bg-[#087a5b]" />
      </div>
    </div>
  );
}
