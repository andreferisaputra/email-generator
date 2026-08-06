/* eslint-disable @next/next/no-img-element */
"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Block } from "email-editor-core";
import { Copy, GripVertical, Trash2 } from "lucide-react";
import RichTextEditor from "./RichTextEditor";

interface CanvasBlockProps {
  block: Block;
  selected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Block>) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

function BlockContent({
  block,
  onUpdate,
}: {
  block: Block;
  onUpdate: (updates: Partial<Block>) => void;
}) {
  switch (block.type) {
    case "title": {
      const sizes = { h1: "30px", h2: "25px", h3: "21px" };
      return (
        <RichTextEditor
          value={block.content}
          label="Edit heading text"
          className="font-bold leading-tight"
          style={{
            color: block.color ?? "#17211d",
            fontSize: sizes[block.level ?? "h2"],
            paddingBottom: block.paddingBottom ?? 16,
          }}
          onCommit={(content) => onUpdate({ content })}
        />
      );
    }
    case "paragraph":
      return (
        <RichTextEditor
          value={block.content}
          label="Edit paragraph text"
          className="leading-relaxed"
          multiline
          style={{
            color: block.color ?? "#44514b",
            lineHeight: block.lineHeight ?? 1.6,
            paddingBottom: block.paddingBottom ?? 18,
            textAlign: block.textAlign ?? "left",
          }}
          onCommit={(content) => onUpdate({ content })}
        />
      );
    case "image":
      return (
        <div style={{ paddingBottom: block.paddingBottom ?? 18 }}>
          <img
            src={block.src}
            alt={block.alt}
            width={block.width}
            height={block.height}
            className="mx-auto h-auto w-full object-cover"
            style={{
              maxWidth: block.maxWidth ?? 600,
              borderRadius: block.borderRadius ?? 0,
            }}
          />
        </div>
      );
    case "button":
      return (
        <div
          style={{
            textAlign: block.align ?? "left",
            marginTop: block.marginTop ?? 4,
            paddingBottom: block.paddingBottom ?? 18,
          }}
        >
          <RichTextEditor
            value={block.label}
            label="Edit button label"
            className="inline-block font-semibold"
            richText={false}
            style={{
              color: block.textColor ?? "#ffffff",
              backgroundColor: block.backgroundColor ?? "#087a5b",
              padding: block.padding ?? "12px 24px",
              borderRadius: block.borderRadius ?? 8,
            }}
            onCommit={(label) => onUpdate({ label })}
          />
        </div>
      );
    case "divider":
      return (
        <div style={{ paddingBlock: block.margin ?? 18 }}>
          <div
            style={{
              height: block.height ?? 1,
              backgroundColor: block.color ?? "#d8e2dd",
            }}
          />
        </div>
      );
    case "highlight-box":
      return (
        <div style={{ paddingBottom: block.paddingBottom ?? 18 }}>
          <div
            style={{
              padding: block.padding ?? "20px",
              borderRadius: block.borderRadius ?? 10,
              backgroundColor: block.backgroundColor,
              border: block.borderColor ? `1px solid ${block.borderColor}` : undefined,
              borderLeft: block.borderLeft
                ? `4px solid ${block.borderColor ?? "#087a5b"}`
                : undefined,
            }}
          >
            <RichTextEditor
              value={block.content}
              label="Edit callout text"
              className="leading-relaxed text-slate-800"
              multiline
              onCommit={(content) => onUpdate({ content })}
            />
          </div>
        </div>
      );
  }
}

export default function CanvasBlock({
  block,
  selected,
  onSelect,
  onUpdate,
  onDuplicate,
  onDelete,
}: CanvasBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id, data: { source: "canvas", type: block.type } });

  return (
    <div
      ref={setNodeRef}
      role="button"
      tabIndex={0}
      aria-label={`Select ${block.type} block`}
      onClick={() => onSelect(block.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(block.id);
        }
      }}
      className={`group relative rounded-lg border-2 px-5 pt-5 transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 ${
        selected
          ? "border-emerald-500 bg-emerald-50/25 shadow-[0_10px_35px_rgba(8,122,91,0.12)]"
          : "border-transparent hover:border-emerald-200 hover:bg-emerald-50/20"
      } ${isDragging ? "z-20 opacity-45" : ""}`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <button
        type="button"
        className={`absolute -left-4 top-2 z-10 flex size-9 cursor-grab items-center justify-center rounded-md border border-transparent text-slate-400 transition hover:border-slate-200 hover:bg-white hover:text-slate-700 hover:shadow-sm active:cursor-grabbing ${
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
        }`}
        aria-label="Drag to reorder block"
        onClick={(event) => event.stopPropagation()}
        {...attributes}
        {...listeners}
      >
        <GripVertical size={18} aria-hidden="true" />
      </button>

      {selected && (
        <div className="absolute right-2 top-2 z-10 flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-md">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDuplicate(block.id);
            }}
            className="flex size-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            aria-label="Duplicate block"
            title="Duplicate"
          >
            <Copy size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(block.id);
            }}
            className="flex size-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
            aria-label="Delete block"
            title="Delete"
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      <BlockContent block={block} onUpdate={(updates) => onUpdate(block.id, updates)} />
    </div>
  );
}
