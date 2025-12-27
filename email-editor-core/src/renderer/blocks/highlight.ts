/**
 * HIGHLIGHT BOX BLOCK RENDERER
 *
 * Responsibility: Render a single highlight box block to HTML
 * - Receives: HighlightBoxBlock
 * - Returns: HTML string for this block only
 * - Owns: All styling for highlight box blocks
 * - Does NOT: Know about other blocks, templates, or document structure
 */

import type { HighlightBoxBlock } from '../../types.js';

/**
 * Render a highlight box block to HTML
 *
 * @param block - The highlight box block to render
 * @returns HTML string for this block
 */
export function renderHighlightBlock(block: HighlightBoxBlock): string {
  // Default values if not specified
  const padding = block.padding || '20px';
  const borderRadius = block.borderRadius || 8;
  const paddingBottom = block.paddingBottom || 20;
  const borderColor = block.borderColor || 'transparent';

  // Container styles
  const containerStyles = [
    `background-color: ${block.backgroundColor}`,
    `border-radius: ${borderRadius}px`,
    `padding-bottom: ${paddingBottom}px`,
    'margin-top: 0',
  ].join(";");

  // Content styles
  const contentStyles = [
    `padding: ${padding}`,
    'word-wrap: break-word',
  ].join(';');

  // Add border if specified
  let borderStyle = '';
  if (block.borderColor && block.borderColor !== 'transparent') {
    borderStyle = `border: 1px solid ${borderColor};`;
  }

  // HTML table wrapper (email compatibility)
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="${containerStyles} ${borderStyle}">
      <tr>
        <td style="${contentStyles}">
          ${block.content}
        </td>
      </tr>
    </table>
  `.trim();
}
