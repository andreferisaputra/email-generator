/**
 * PARAGRAPH BLOCK RENDERER
 *
 * Responsibility: Render a single paragraph block to HTML
 * - Receives: ParagraphBlock
 * - Returns: HTML string for this block only
 * - Owns: All styling for paragraph blocks
 * - Does NOT: Know about other blocks, templates, or document structure
 */

import type { ParagraphBlock } from '../../types.js';
import { parseInlineFormatting } from '../parseInlineFormatting.js';

/**
 * Render a paragraph block to HTML
 *
 * @param block - The paragraph block to render
 * @returns HTML string for this block
 */
export function renderParagraphBlock(block: ParagraphBlock): string {
  // Default values if not specified
  const color = block.color || '#334155';
  const lineHeight = block.lineHeight || 1.6;
  const paddingBottom = block.paddingBottom || 16;
  const textAlign = block.textAlign || 'left';

  // Inline styles for paragraph
  const styles = [
    `color: ${color}`,
    `line-height: ${lineHeight}`,
    `padding-bottom: ${paddingBottom}px`,
    'margin-top: 0',
    `text-align: ${textAlign}`,
  ].join(";");

  // HTML table wrapper (email compatibility)
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="${styles}">
          ${parseInlineFormatting(block.content)}
        </td>
      </tr>
    </table>
  `.trim();
}
