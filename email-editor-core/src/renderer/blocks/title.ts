/**
 * TITLE BLOCK RENDERER
 *
 * Responsibility: Render a single title block to HTML
 * - Receives: TitleBlock
 * - Returns: HTML string for this block only
 * - Owns: All styling for title blocks
 * - Does NOT: Know about other blocks, templates, or document structure
 */

import type { TitleBlock } from '../../types.js';
import { parseInlineFormatting } from '../parseInlineFormatting.js';

/**
 * Render a title block to HTML
 *
 * @param block - The title block to render
 * @returns HTML string for this block
 */
export function renderTitleBlock(block: TitleBlock): string {
  // Determine heading tag based on level
  const tag = block.level || 'h2';

  // Font size based on heading level
  const fontSizeMap = {
    h1: '28px',
    h2: '24px',
    h3: '20px',
  };
  const fontSize = fontSizeMap[tag] || '24px';

  // Default colors if not specified
  const color = block.color || '#1a1a1a';
  const paddingBottom = block.paddingBottom || 20;

  // Inline styles for title
  const styles = [
    `font-size: ${fontSize}`,
    'font-weight: 700',
    `color: ${color}`,
    `padding-bottom: ${paddingBottom}px`,
    'margin-top: 0',
    'line-height: 1.3',
  ].join(';');

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
