"use client";

import {
  Eye,
  LayoutTemplate,
  Monitor,
  Redo2,
  Smartphone,
  Undo2,
} from "lucide-react";
import type { ReactNode } from "react";

interface EditorToolbarProps {
  viewMode: "design" | "preview";
  viewport: "desktop" | "mobile";
  canUndo: boolean;
  canRedo: boolean;
  onViewModeChange: (mode: "design" | "preview") => void;
  onViewportChange: (viewport: "desktop" | "mobile") => void;
  onUndo: () => void;
  onRedo: () => void;
}

function ToolbarButton({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 disabled:cursor-not-allowed disabled:opacity-35 ${
        active
          ? "bg-slate-900 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
      }`}
    >
      {children}
    </button>
  );
}

export default function EditorToolbar({
  viewMode,
  viewport,
  canUndo,
  canRedo,
  onViewModeChange,
  onViewportChange,
  onUndo,
  onRedo,
}: EditorToolbarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-3 py-2 backdrop-blur">
      <div className="flex items-center gap-1" role="toolbar" aria-label="History controls">
        <ToolbarButton label="Undo" disabled={!canUndo} onClick={onUndo}>
          <Undo2 size={17} aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton label="Redo" disabled={!canRedo} onClick={onRedo}>
          <Redo2 size={17} aria-hidden="true" />
        </ToolbarButton>
        <span className="ml-2 hidden text-xs text-slate-400 sm:inline">Saved locally</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-xl bg-slate-100 p-1" role="group" aria-label="Editor mode">
          <ToolbarButton
            label="Design mode"
            active={viewMode === "design"}
            onClick={() => onViewModeChange("design")}
          >
            <LayoutTemplate size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Design</span>
          </ToolbarButton>
          <ToolbarButton
            label="Preview mode"
            active={viewMode === "preview"}
            onClick={() => onViewModeChange("preview")}
          >
            <Eye size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Preview</span>
          </ToolbarButton>
        </div>

        <div className="flex rounded-xl bg-slate-100 p-1" role="group" aria-label="Preview width">
          <ToolbarButton
            label="Desktop width"
            active={viewport === "desktop"}
            onClick={() => onViewportChange("desktop")}
          >
            <Monitor size={16} aria-hidden="true" />
          </ToolbarButton>
          <ToolbarButton
            label="Mobile width"
            active={viewport === "mobile"}
            onClick={() => onViewportChange("mobile")}
          >
            <Smartphone size={16} aria-hidden="true" />
          </ToolbarButton>
        </div>
      </div>
    </div>
  );
}
