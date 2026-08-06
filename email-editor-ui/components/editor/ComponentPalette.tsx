"use client";

import { useDraggable } from "@dnd-kit/core";
import type { BlockType } from "email-editor-core";
import {
  Heading1,
  ImageIcon,
  Link2,
  Minus,
  MousePointerClick,
  Text,
} from "lucide-react";
import { BLOCK_LIBRARY } from "@/lib/blockFactory";

interface ComponentPaletteProps {
  onAdd: (type: BlockType) => void;
}

const icons = {
  title: Heading1,
  paragraph: Text,
  image: ImageIcon,
  button: MousePointerClick,
  divider: Minus,
  "highlight-box": Link2,
};

function PaletteItem({
  type,
  label,
  description,
  onAdd,
}: {
  type: BlockType;
  label: string;
  description: string;
  onAdd: (type: BlockType) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette:${type}`,
    data: { source: "palette", type },
  });
  const Icon = icons[type];

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={() => onAdd(type)}
      className={`group flex min-h-20 w-full cursor-grab items-start gap-3 rounded-xl border bg-white p-3 text-left transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 active:cursor-grabbing ${
        isDragging
          ? "border-emerald-500 opacity-60 shadow-lg"
          : "border-slate-200 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
      }`}
      aria-label={`Add ${label} block`}
      {...listeners}
      {...attributes}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 transition group-hover:bg-emerald-100">
        <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <span>
        <span className="block text-sm font-semibold text-slate-900">{label}</span>
        <span className="mt-1 block text-xs leading-4 text-slate-500">{description}</span>
      </span>
    </button>
  );
}

export default function ComponentPalette({ onAdd }: ComponentPaletteProps) {
  return (
    <aside className="rounded-2xl border border-slate-200/80 bg-slate-50/90 p-4 shadow-sm xl:sticky xl:top-24 xl:h-[calc(100vh-7rem)] xl:overflow-y-auto">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
          Components
        </p>
        <h2 className="mt-1 text-lg font-semibold text-slate-950">Build your email</h2>
        <p className="mt-1 text-sm leading-5 text-slate-500">
          Drag a component onto the canvas, or click to append it.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-1">
        {BLOCK_LIBRARY.map((item) => (
          <PaletteItem key={item.type} {...item} onAdd={onAdd} />
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
        <p className="text-xs font-semibold text-emerald-900">Email-safe canvas</p>
        <p className="mt-1 text-xs leading-5 text-emerald-800/80">
          Blocks stay inside a responsive column so the exported HTML remains reliable.
        </p>
      </div>
    </aside>
  );
}
