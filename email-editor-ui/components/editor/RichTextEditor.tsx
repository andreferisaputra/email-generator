"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type KeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { Bold, Check, Italic, Link2, Underline, Unlink2, X } from "lucide-react";
import {
  editorElementToContent,
  inlineContentToEditorHtml,
  normalizeLinkUrl,
} from "@/lib/richText";

interface RichTextEditorProps {
  value: string;
  label: string;
  className?: string;
  style?: CSSProperties;
  multiline?: boolean;
  richText?: boolean;
  onCommit: (value: string) => void;
}

interface ToolbarPosition {
  left: number;
  top: number;
  placement: "above" | "below";
}

interface SelectionOffsets {
  start: number;
  end: number;
}

interface ActiveFormats {
  bold: boolean;
  italic: boolean;
  underline: boolean;
}

interface InlineFormatPatch {
  weight?: "normal" | "bold";
  italic?: boolean;
  underline?: boolean;
  color?: string;
  href?: string;
  unlink?: boolean;
}

const EMPTY_FORMATS: ActiveFormats = {
  bold: false,
  italic: false,
  underline: false,
};

function getSelectionOffsets(root: HTMLElement): SelectionOffsets | null {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  if (!(root === range.commonAncestorContainer || root.contains(range.commonAncestorContainer))) {
    return null;
  }

  const before = range.cloneRange();
  before.selectNodeContents(root);
  before.setEnd(range.startContainer, range.startOffset);
  return {
    start: before.toString().length,
    end: before.toString().length + range.toString().length,
  };
}

function restoreSelectionOffsets(root: HTMLElement, offsets: SelectionOffsets) {
  const range = document.createRange();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let currentOffset = 0;
  let startNode: Node | null = null;
  let endNode: Node | null = null;
  let startOffset = 0;
  let endOffset = 0;
  let node = walker.nextNode();

  while (node) {
    const length = node.textContent?.length ?? 0;
    if (!startNode && offsets.start <= currentOffset + length) {
      startNode = node;
      startOffset = Math.max(0, offsets.start - currentOffset);
    }
    if (offsets.end <= currentOffset + length) {
      endNode = node;
      endOffset = Math.max(0, offsets.end - currentOffset);
      break;
    }
    currentOffset += length;
    node = walker.nextNode();
  }

  if (!startNode) return;
  endNode ??= startNode;
  if (!endOffset) endOffset = startOffset;
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);

  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

function ToolbarButton({
  label,
  active = false,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={label}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={`flex size-10 items-center justify-center rounded-lg transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 ${
        active
          ? "bg-emerald-500 text-slate-950"
          : "text-white hover:bg-white/15"
      }`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  value,
  label,
  className,
  style,
  multiline = false,
  richText = true,
  onCommit,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const pendingOffsetsRef = useRef<SelectionOffsets | null>(null);
  const [toolbar, setToolbar] = useState<ToolbarPosition | null>(null);
  const [formats, setFormats] = useState<ActiveFormats>(EMPTY_FORMATS);
  const [textColor, setTextColor] = useState("#008867");
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("https://");
  const [linkError, setLinkError] = useState(false);
  const editorHtml = useMemo(() => inlineContentToEditorHtml(value), [value]);

  useLayoutEffect(() => {
    const editor = editorRef.current;
    if (editor && editor.innerHTML !== editorHtml) editor.innerHTML = editorHtml;
  }, [editorHtml]);

  const captureSelection = useCallback(() => {
    if (!richText) return;
    const editor = editorRef.current;
    const selection = window.getSelection();
    if (!editor || !selection || selection.rangeCount === 0 || selection.isCollapsed) {
      if (!toolbarRef.current?.contains(document.activeElement)) setToolbar(null);
      return;
    }

    const range = selection.getRangeAt(0);
    if (!(editor === range.commonAncestorContainer || editor.contains(range.commonAncestorContainer))) {
      if (!toolbarRef.current?.contains(document.activeElement)) setToolbar(null);
      return;
    }

    const rect = range.getBoundingClientRect();
    const fallbackRect = range.getClientRects().item(0);
    const selectionRect = rect.width || rect.height ? rect : fallbackRect;
    if (!selectionRect) return;

    savedRangeRef.current = range.cloneRange();
    const placement = selectionRect.top > 82 ? "above" : "below";
    setToolbar({
      left: Math.max(132, Math.min(window.innerWidth - 132, selectionRect.left + selectionRect.width / 2)),
      top: placement === "above" ? selectionRect.top - 10 : selectionRect.bottom + 10,
      placement,
    });
    const startElement =
      range.startContainer instanceof HTMLElement
        ? range.startContainer
        : range.startContainer.parentElement;
    if (startElement) {
      const computed = window.getComputedStyle(startElement);
      setFormats({
        bold: computed.fontWeight === "bold" || Number(computed.fontWeight) >= 700,
        italic: computed.fontStyle === "italic",
        underline: computed.textDecorationLine.includes("underline"),
      });
    }
  }, [richText]);

  const restoreSavedRange = useCallback(() => {
    const editor = editorRef.current;
    const range = savedRangeRef.current;
    if (!editor || !range) return false;
    editor.focus({ preventScroll: true });
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    return true;
  }, []);

  const persistFormatting = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    pendingOffsetsRef.current = getSelectionOffsets(editor);
    const nextValue = editorElementToContent(editor);
    if (nextValue && nextValue !== value) onCommit(nextValue);

    window.setTimeout(() => {
      const currentEditor = editorRef.current;
      const offsets = pendingOffsetsRef.current;
      if (!currentEditor || !offsets) return;
      restoreSelectionOffsets(currentEditor, offsets);
      captureSelection();
      pendingOffsetsRef.current = null;
    }, 0);
  }, [captureSelection, onCommit, value]);

  const applyFormat = useCallback(
    (patch: InlineFormatPatch) => {
      if (!restoreSavedRange()) return;
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

      const range = selection.getRangeAt(0);
      const wrapper = document.createElement("span");
      if (patch.weight) {
        wrapper.dataset.inlineWeight = patch.weight;
        wrapper.style.fontWeight = patch.weight === "bold" ? "700" : "400";
      }
      if (patch.italic !== undefined) {
        wrapper.dataset.inlineItalic = String(patch.italic);
        wrapper.style.fontStyle = patch.italic ? "italic" : "normal";
      }
      if (patch.underline !== undefined) {
        wrapper.dataset.inlineUnderline = String(patch.underline);
        wrapper.style.textDecoration = patch.underline ? "underline" : "none";
      }
      if (patch.color) {
        wrapper.dataset.inlineColor = patch.color;
        wrapper.style.color = patch.color;
      }
      if (patch.href) {
        wrapper.dataset.inlineHref = patch.href;
        wrapper.style.color = "#008867";
        wrapper.style.fontWeight = "600";
        wrapper.style.textDecoration = "underline";
      }
      if (patch.unlink) {
        wrapper.dataset.inlineUnlink = "true";
        wrapper.style.color = "inherit";
        wrapper.style.fontWeight = "inherit";
        wrapper.style.textDecoration = "none";
      }

      wrapper.append(range.extractContents());
      range.insertNode(wrapper);
      range.selectNodeContents(wrapper);
      selection.removeAllRanges();
      selection.addRange(range);
      savedRangeRef.current = range.cloneRange();
      persistFormatting();
    },
    [persistFormatting, restoreSavedRange]
  );

  const applyLink = useCallback(() => {
    const normalizedUrl = normalizeLinkUrl(linkUrl);
    if (!normalizedUrl) {
      setLinkError(true);
      return;
    }
    setLinkError(false);
    applyFormat({ href: normalizedUrl });
    setShowLinkInput(false);
    setLinkUrl("https://");
  }, [applyFormat, linkUrl]);

  const commitEditor = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;
    const nextValue = editorElementToContent(editor);
    if (nextValue.trim() && nextValue !== value) onCommit(nextValue);
  }, [onCommit, value]);

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (toolbarRef.current?.contains(event.relatedTarget as Node | null)) return;
    window.setTimeout(() => {
      if (toolbarRef.current?.contains(document.activeElement)) return;
      commitEditor();
    }, 0);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.currentTarget.blur();
      setToolbar(null);
    } else if (!multiline && event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.blur();
    }
  };

  useEffect(() => {
    document.addEventListener("selectionchange", captureSelection);
    window.addEventListener("resize", captureSelection);
    window.addEventListener("scroll", captureSelection, true);
    return () => {
      document.removeEventListener("selectionchange", captureSelection);
      window.removeEventListener("resize", captureSelection);
      window.removeEventListener("scroll", captureSelection, true);
    };
  }, [captureSelection]);

  const toolbarNode =
    richText && toolbar
      ? createPortal(
          <div
            ref={toolbarRef}
            role="toolbar"
            aria-label="Selected text formatting"
            className="fixed z-[1000] max-w-[calc(100vw-24px)] rounded-xl border border-white/10 bg-slate-950 p-1.5 shadow-[0_16px_45px_rgba(15,23,42,0.32)]"
            style={{
              left: toolbar.left,
              top: toolbar.top,
              transform:
                toolbar.placement === "above"
                  ? "translate(-50%, -100%)"
                  : "translate(-50%, 0)",
            }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            {showLinkInput ? (
              <div className="flex min-w-[280px] items-start gap-1.5 p-0.5">
                <div className="min-w-0 flex-1">
                  <input
                    autoFocus
                    type="url"
                    value={linkUrl}
                    onChange={(event) => {
                      setLinkUrl(event.target.value);
                      setLinkError(false);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        applyLink();
                      } else if (event.key === "Escape") {
                        setShowLinkInput(false);
                        restoreSavedRange();
                      }
                    }}
                    aria-label="Link URL"
                    aria-invalid={linkError}
                    className={`h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-950 outline-none ${
                      linkError
                        ? "border-red-400 ring-2 ring-red-400/30"
                        : "border-transparent focus:ring-2 focus:ring-emerald-400"
                    }`}
                    placeholder="https://example.com"
                  />
                  {linkError && (
                    <p className="px-1 pt-1 text-[11px] text-red-300">
                      Use an http, https, or mailto link.
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  aria-label="Apply link"
                  title="Apply link"
                  onClick={applyLink}
                  className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-slate-950 transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <Check size={17} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Cancel link"
                  title="Cancel"
                  onClick={() => {
                    setShowLinkInput(false);
                    setLinkError(false);
                    restoreSavedRange();
                  }}
                  className="flex size-10 shrink-0 items-center justify-center rounded-lg text-white transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <X size={17} aria-hidden="true" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-0.5">
                <ToolbarButton
                  label="Bold"
                  active={formats.bold}
                  onClick={() => applyFormat({ weight: formats.bold ? "normal" : "bold" })}
                >
                  <Bold size={17} aria-hidden="true" />
                </ToolbarButton>
                <ToolbarButton
                  label="Italic"
                  active={formats.italic}
                  onClick={() => applyFormat({ italic: !formats.italic })}
                >
                  <Italic size={17} aria-hidden="true" />
                </ToolbarButton>
                <ToolbarButton
                  label="Underline"
                  active={formats.underline}
                  onClick={() => applyFormat({ underline: !formats.underline })}
                >
                  <Underline size={17} aria-hidden="true" />
                </ToolbarButton>
                <label
                  className="relative flex size-10 cursor-pointer items-center justify-center rounded-lg text-white transition hover:bg-white/15 focus-within:ring-2 focus-within:ring-emerald-400"
                  title="Text color"
                  aria-label="Text color"
                >
                  <span
                    className="flex size-5 items-end justify-center border-b-[3px] font-bold leading-none"
                    style={{ borderBottomColor: textColor }}
                    aria-hidden="true"
                  >
                    A
                  </span>
                  <input
                    type="color"
                    value={textColor}
                    onMouseDown={() => restoreSavedRange()}
                    onChange={(event) => {
                      setTextColor(event.target.value);
                      applyFormat({ color: event.target.value });
                    }}
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                </label>
                <span className="mx-1 h-6 w-px bg-white/15" aria-hidden="true" />
                <ToolbarButton label="Add link" onClick={() => setShowLinkInput(true)}>
                  <Link2 size={17} aria-hidden="true" />
                </ToolbarButton>
                <ToolbarButton label="Remove link" onClick={() => applyFormat({ unlink: true })}>
                  <Unlink2 size={17} aria-hidden="true" />
                </ToolbarButton>
              </div>
            )}
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-label={label}
        aria-multiline={multiline}
        className={`cursor-text rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70 [&_a]:cursor-text ${className ?? ""}`}
        style={style}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onMouseUp={captureSelection}
        onKeyUp={captureSelection}
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("a")) event.preventDefault();
        }}
        onPaste={(event) => {
          event.preventDefault();
          const selection = window.getSelection();
          if (!selection || selection.rangeCount === 0) return;
          const range = selection.getRangeAt(0);
          const textNode = document.createTextNode(event.clipboardData.getData("text/plain"));
          range.deleteContents();
          range.insertNode(textNode);
          range.setStartAfter(textNode);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }}
      />
      {toolbarNode}
    </>
  );
}
