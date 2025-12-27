'use client';

import { useRef, useState } from 'react';
import { applyInlineFormatting, applyCombinedLinkFormatting, applyStyleFormatting } from '../../lib/inlineFormatting';

interface TextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  showFormatting?: boolean;
}

export default function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  showFormatting = false,
}: TextAreaProps) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedColor, setSelectedColor] = useState('#008867');
  const [linkUrl, setLinkUrl] = useState('https://');
  const [linkBold, setLinkBold] = useState(false);
  const [linkColor, setLinkColor] = useState('#008867');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [styleWeight, setStyleWeight] = useState('bold');
  const [styleColor, setStyleColor] = useState('#008867');
  const [showStyleInput, setShowStyleInput] = useState(false);

  const handleBoldColor = () => {
    if (!textAreaRef.current) return;

    const { selectionStart, selectionEnd } = textAreaRef.current;
    const selectedText = value.substring(selectionStart, selectionEnd);

    if (!selectedText) {
      alert('Please select text first');
      return;
    }

    const formatted = applyInlineFormatting(value, selectionStart, selectionEnd, selectedColor);
    onChange(formatted);

    setTimeout(() => {
      if (textAreaRef.current) {
        textAreaRef.current.focus();
        textAreaRef.current.setSelectionRange(selectionStart, selectionStart);
      }
    }, 0);
  };

  const handleInsertLink = () => {
    if (!textAreaRef.current) return;

    const { selectionStart, selectionEnd } = textAreaRef.current;
    const selectedText = value.substring(selectionStart, selectionEnd);

    if (!selectedText) {
      alert('Please select text first');
      return;
    }

    if (!linkUrl || linkUrl === 'https://') {
      alert('Please enter a valid URL');
      return;
    }

    // Use combined formatting if bold or custom color is set
    const formatted = applyCombinedLinkFormatting(
      value,
      selectionStart,
      selectionEnd,
      linkUrl,
      linkBold,
      linkColor !== '#008867' ? linkColor : null
    );
    onChange(formatted);
    setShowLinkInput(false);
    setLinkUrl('https://');
    setLinkBold(false);
    setLinkColor('#008867');

    setTimeout(() => {
      if (textAreaRef.current) {
        textAreaRef.current.focus();
        textAreaRef.current.setSelectionRange(selectionStart, selectionStart);
      }
    }, 0);
  };

  const handleApplyStyle = () => {
    if (!textAreaRef.current) return;

    const { selectionStart, selectionEnd } = textAreaRef.current;
    const selectedText = value.substring(selectionStart, selectionEnd);

    if (!selectedText) {
      alert('Please select text first');
      return;
    }

    const formatted = applyStyleFormatting(
      value,
      selectionStart,
      selectionEnd,
      styleWeight || null,
      styleColor || null
    );
    onChange(formatted);
    setShowStyleInput(false);
    setStyleWeight('bold');
    setStyleColor('#008867');

    setTimeout(() => {
      if (textAreaRef.current) {
        textAreaRef.current.focus();
        textAreaRef.current.setSelectionRange(selectionStart, selectionStart);
      }
    }, 0);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        {showFormatting && (
          <div className="flex items-center gap-2">
            {!showLinkInput && !showStyleInput ? (
              <>
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="h-8 w-12 border border-gray-300 rounded cursor-pointer"
                  title="Select color for bold text"
                />
                <button
                  onClick={handleBoldColor}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors font-semibold"
                  title="Wrap selected text in bold with color"
                >
                  Bold + Color
                </button>
                <button
                  onClick={() => setShowLinkInput(true)}
                  className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors font-semibold"
                  title="Wrap selected text in link"
                >
                  Insert Link
                </button>
                <button
                  onClick={() => setShowStyleInput(true)}
                  className="px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors font-semibold"
                  title="Wrap selected text with style formatting"
                >
                  Style Text
                </button>
              </>
            ) : showLinkInput ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  autoFocus
                />
                <label className="flex items-center gap-1 text-sm">
                  <input
                    type="checkbox"
                    checked={linkBold}
                    onChange={(e) => setLinkBold(e.target.checked)}
                    className="cursor-pointer"
                  />
                  <span>Bold</span>
                </label>
                <input
                  type="color"
                  value={linkColor}
                  onChange={(e) => setLinkColor(e.target.value)}
                  className="h-8 w-12 border border-gray-300 rounded cursor-pointer"
                  title="Select link color"
                />
                <button
                  onClick={handleInsertLink}
                  className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors font-semibold"
                  title="Apply link"
                >
                  Apply
                </button>
                <button
                  onClick={() => {
                    setShowLinkInput(false);
                    setLinkUrl('https://');
                    setLinkBold(false);
                    setLinkColor('#008867');
                  }}
                  className="px-3 py-1 text-sm bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors font-semibold"
                  title="Cancel"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <select
                  value={styleWeight}
                  onChange={(e) => setStyleWeight(e.target.value)}
                  className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="normal">Normal</option>
                  <option value="semibold">Semibold</option>
                  <option value="bold">Bold</option>
                </select>
                <input
                  type="color"
                  value={styleColor}
                  onChange={(e) => setStyleColor(e.target.value)}
                  className="h-8 w-12 border border-gray-300 rounded cursor-pointer"
                  title="Select text color"
                />
                <button
                  onClick={handleApplyStyle}
                  className="px-3 py-1 text-sm bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors font-semibold"
                  title="Apply style"
                >
                  Apply
                </button>
                <button
                  onClick={() => {
                    setShowStyleInput(false);
                    setStyleWeight('bold');
                    setStyleColor('#008867');
                  }}
                  className="px-3 py-1 text-sm bg-gray-400 text-white rounded hover:bg-gray-500 transition-colors font-semibold"
                  title="Cancel"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <textarea
        ref={textAreaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder}
      />
    </div>
  );
}
