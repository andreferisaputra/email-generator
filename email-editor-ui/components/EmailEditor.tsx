"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { Block, BlockType, EmailDocument } from "email-editor-core";
import { createEmail, getValidationSummary } from "email-editor-core";
import { GripVertical } from "lucide-react";
import {
  BLOCK_LIBRARY,
  createBlock,
  duplicateBlock,
  getStarterBlocks,
  syncEmailBlocks,
} from "@/lib/blockFactory";
import Preview from "./Preview";
import ComponentPalette from "./editor/ComponentPalette";
import EditorToolbar from "./editor/EditorToolbar";
import EmailCanvas from "./editor/EmailCanvas";
import InspectorPanel from "./editor/InspectorPanel";

const STORAGE_KEY = "nobi-email-builder-draft-v1";
const HISTORY_LIMIT = 40;

interface HistoryState {
  past: EmailDocument[];
  present: EmailDocument;
  future: EmailDocument[];
}

interface ActiveDrag {
  source: "palette" | "canvas";
  type: BlockType;
}

function createInitialEmail(): EmailDocument {
  return createEmail(getStarterBlocks());
}

function restoreEmailDocument(raw: string): EmailDocument | null {
  try {
    const parsed = JSON.parse(raw) as EmailDocument;
    const blocks = parsed.body?.blocks ?? parsed.blocks;
    if (!Array.isArray(blocks)) return null;

    return syncEmailBlocks(
      {
        ...parsed,
        createdAt: new Date(parsed.createdAt),
        updatedAt: new Date(parsed.updatedAt),
      },
      blocks
    );
  } catch {
    return null;
  }
}

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  );
}

export default function EmailEditor() {
  const [history, setHistory] = useState<HistoryState>(() => ({
    past: [],
    present: createInitialEmail(),
    future: [],
  }));
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null);
  const [viewMode, setViewMode] = useState<"design" | "preview">("design");
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [storageReady, setStorageReady] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const email = history.present;
  const blocks = email.body.blocks;
  const selectedBlock = blocks.find((block) => block.id === selectedBlockId);
  const validation = useMemo(() => getValidationSummary(email, false), [email]);

  const commit = useCallback((updater: (current: EmailDocument) => EmailDocument) => {
    setHistory((current) => {
      const next = updater(current.present);
      if (next === current.present) return current;

      return {
        past: [...current.past, current.present].slice(-HISTORY_LIMIT),
        present: next,
        future: [],
      };
    });
  }, []);

  const undo = useCallback(() => {
    setHistory((current) => {
      const previous = current.past.at(-1);
      if (!previous) return current;
      return {
        past: current.past.slice(0, -1),
        present: previous,
        future: [current.present, ...current.future].slice(0, HISTORY_LIMIT),
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory((current) => {
      const next = current.future[0];
      if (!next) return current;
      return {
        past: [...current.past, current.present].slice(-HISTORY_LIMIT),
        present: next,
        future: current.future.slice(1),
      };
    });
  }, []);

  useEffect(() => {
    const restoreTimer = window.setTimeout(() => {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      const restored = saved ? restoreEmailDocument(saved) : null;
      if (restored) {
        setHistory({ past: [], present: restored, future: [] });
      }
      setStorageReady(true);
    }, 0);

    return () => window.clearTimeout(restoreTimer);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(email));
  }, [email, storageReady]);

  useEffect(() => {
    const handleKeyboardShortcut = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) return;
      const modifier = event.ctrlKey || event.metaKey;
      if (!modifier) return;

      if (event.key.toLowerCase() === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if (
        event.key.toLowerCase() === "y" ||
        (event.key.toLowerCase() === "z" && event.shiftKey)
      ) {
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handleKeyboardShortcut);
    return () => window.removeEventListener("keydown", handleKeyboardShortcut);
  }, [redo, undo]);

  const addBlockAt = useCallback(
    (type: BlockType, index?: number) => {
      const newBlock = createBlock(type);
      commit((current) => {
        const nextBlocks = [...current.body.blocks];
        nextBlocks.splice(index ?? nextBlocks.length, 0, newBlock);
        return syncEmailBlocks(current, nextBlocks);
      });
      setSelectedBlockId(newBlock.id);
      setViewMode("design");
    },
    [commit]
  );

  const handleUpdateBlock = useCallback(
    (blockId: string, updates: Partial<Block>) => {
      commit((current) => {
        const nextBlocks = current.body.blocks.map((block) =>
          block.id === blockId ? ({ ...block, ...updates } as Block) : block
        );
        return syncEmailBlocks(current, nextBlocks);
      });
    },
    [commit]
  );

  const handleDeleteBlock = useCallback(
    (blockId: string) => {
      commit((current) =>
        syncEmailBlocks(
          current,
          current.body.blocks.filter((block) => block.id !== blockId)
        )
      );
      setSelectedBlockId(null);
    },
    [commit]
  );

  const handleDuplicateBlock = useCallback(
    (blockId: string) => {
      const sourceIndex = blocks.findIndex((block) => block.id === blockId);
      if (sourceIndex < 0) return;
      const copy = duplicateBlock(blocks[sourceIndex]);
      commit((current) => {
        const nextBlocks = [...current.body.blocks];
        nextBlocks.splice(sourceIndex + 1, 0, copy);
        return syncEmailBlocks(current, nextBlocks);
      });
      setSelectedBlockId(copy.id);
    },
    [blocks, commit]
  );

  const handleDragStart = (event: DragStartEvent) => {
    const source = event.active.data.current?.source;
    const type = event.active.data.current?.type as BlockType | undefined;
    if (type && (source === "palette" || source === "canvas")) {
      setActiveDrag({ source, type });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDrag(null);
    if (!over) return;

    const source = active.data.current?.source;
    if (source === "palette") {
      const type = active.data.current?.type as BlockType;
      const overIndex = blocks.findIndex((block) => block.id === over.id);
      addBlockAt(type, overIndex >= 0 ? overIndex : blocks.length);
      return;
    }

    if (source === "canvas" && active.id !== over.id) {
      const oldIndex = blocks.findIndex((block) => block.id === active.id);
      const overIndex = blocks.findIndex((block) => block.id === over.id);
      const newIndex = over.id === "email-canvas" ? blocks.length - 1 : overIndex;
      if (oldIndex < 0 || newIndex < 0) return;

      commit((current) =>
        syncEmailBlocks(current, arrayMove(current.body.blocks, oldIndex, newIndex))
      );
      setSelectedBlockId(String(active.id));
    }
  };

  const activeLabel = activeDrag
    ? BLOCK_LIBRARY.find((item) => item.type === activeDrag.type)?.label
    : null;

  return (
    <DndContext
      id="email-editor-dnd"
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveDrag(null)}
    >
      <div className="grid items-start gap-4 xl:grid-cols-[240px_minmax(0,1fr)_340px]">
        <ComponentPalette onAdd={addBlockAt} />

        <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-[#e9eeeb] shadow-sm">
          <EditorToolbar
            viewMode={viewMode}
            viewport={viewport}
            canUndo={history.past.length > 0}
            canRedo={history.future.length > 0}
            onViewModeChange={setViewMode}
            onViewportChange={setViewport}
            onUndo={undo}
            onRedo={redo}
          />

          {validation.errorCount > 0 && (
            <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-900">
              {validation.errorCount} validation issue{validation.errorCount > 1 ? "s" : ""} must be fixed before delivery.
            </div>
          )}

          {viewMode === "design" ? (
            <EmailCanvas
              blocks={blocks}
              selectedId={selectedBlockId}
              viewport={viewport}
              onSelect={setSelectedBlockId}
              onUpdate={handleUpdateBlock}
              onDuplicate={handleDuplicateBlock}
              onDelete={handleDeleteBlock}
              onAddDefault={() => addBlockAt("paragraph")}
            />
          ) : (
            <Preview email={email} viewport={viewport} />
          )}
        </section>

        <InspectorPanel email={email} selectedBlock={selectedBlock} onUpdate={handleUpdateBlock} />
      </div>

      <DragOverlay dropAnimation={{ duration: 180, easing: "ease-out" }}>
        {activeDrag && activeLabel ? (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-xl">
            <GripVertical size={17} className="text-emerald-700" aria-hidden="true" />
            {activeLabel}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
