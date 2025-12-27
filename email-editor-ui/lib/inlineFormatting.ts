/**
 * Inline formatting utilities for text content
 */

/**
 * Wrap selected text with inline formatting token
 * @param text - Current text content
 * @param selectionStart - Start index of selection
 * @param selectionEnd - End index of selection
 * @param color - Hex color code (e.g., #008867)
 * @returns Updated text with formatting applied
 */
export function applyInlineFormatting(
  text: string,
  selectionStart: number,
  selectionEnd: number,
  color: string
): string {
  if (selectionStart === selectionEnd) {
    return text; // No text selected
  }

  const selectedText = text.substring(selectionStart, selectionEnd);
  const beforeSelection = text.substring(0, selectionStart);
  const afterSelection = text.substring(selectionEnd);

  const formatted = `{{bold:${color}}}${selectedText}{{/bold}}`;
  return beforeSelection + formatted + afterSelection;
}

/**
 * Wrap selected text with link formatting token
 * @param text - Current text content
 * @param selectionStart - Start index of selection
 * @param selectionEnd - End index of selection
 * @param url - URL to link to
 * @returns Updated text with link formatting applied
 */
export function applyLinkFormatting(
  text: string,
  selectionStart: number,
  selectionEnd: number,
  url: string
): string {
  if (selectionStart === selectionEnd) {
    return text; // No text selected
  }

  const selectedText = text.substring(selectionStart, selectionEnd);
  const beforeSelection = text.substring(0, selectionStart);
  const afterSelection = text.substring(selectionEnd);

  const formatted = `{{link:${url}}}${selectedText}{{/link}}`;
  return beforeSelection + formatted + afterSelection;
}

/**
 * Wrap selected text with combined link formatting token
 * @param text - Current text content
 * @param selectionStart - Start index of selection
 * @param selectionEnd - End index of selection
 * @param url - URL to link to
 * @param bold - Whether to apply bold
 * @param color - Hex color code (optional)
 * @returns Updated text with combined formatting applied
 */
export function applyCombinedLinkFormatting(
  text: string,
  selectionStart: number,
  selectionEnd: number,
  url: string,
  bold: boolean = false,
  color: string | null = null
): string {
  if (selectionStart === selectionEnd) {
    return text; // No text selected
  }

  const selectedText = text.substring(selectionStart, selectionEnd);
  const beforeSelection = text.substring(0, selectionStart);
  const afterSelection = text.substring(selectionEnd);

  // Build the token spec
  let spec = url;
  if (bold) {
    spec += '|bold';
  }
  if (color) {
    spec += `|color:${color}`;
  }

  const formatted = `{{link:${spec}}}${selectedText}{{/link}}`;
  return beforeSelection + formatted + afterSelection;
}

/**
 * Wrap selected text with unified style formatting token
 * @param text - Current text content
 * @param selectionStart - Start index of selection
 * @param selectionEnd - End index of selection
 * @param weight - Font weight: normal | semibold | bold (optional)
 * @param color - Hex color code (optional)
 * @returns Updated text with style formatting applied
 */
export function applyStyleFormatting(
  text: string,
  selectionStart: number,
  selectionEnd: number,
  weight: string | null = null,
  color: string | null = null
): string {
  if (selectionStart === selectionEnd) {
    return text; // No text selected
  }

  if (!weight && !color) {
    return text; // At least one option must exist
  }

  const selectedText = text.substring(selectionStart, selectionEnd);
  const beforeSelection = text.substring(0, selectionStart);
  const afterSelection = text.substring(selectionEnd);

  // Build the token spec
  let spec = '';
  if (weight) {
    spec += weight;
  }
  if (color) {
    if (spec) spec += '|';
    spec += `color:${color}`;
  }

  const formatted = `{{style:${spec}}}${selectedText}{{/style}}`;
  return beforeSelection + formatted + afterSelection;
}

/**
 * Get cursor position after applying formatting
 * @param originalStart - Original selection start
 * @param originalEnd - Original selection end
 * @returns New cursor position (end of formatted text)
 */
export function getNewCursorPosition(
  originalStart: number,
  originalEnd: number
): number {
  const tokenLength = 15; // "{{bold:#XXXXXX}}" = 15 chars
  const closingTokenLength = 11; // "{{/bold}}" = 11 chars
  return originalStart + (originalEnd - originalStart) + tokenLength + closingTokenLength;
}
