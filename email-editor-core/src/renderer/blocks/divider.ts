/**
 * DIVIDER BLOCK RENDERER
 *
 * Responsibility: Render a single divider block to HTML
 * - Receives: DividerBlock
 * - Returns: HTML string for this block only
 * - Owns: All styling for divider blocks
 * - Does NOT: Know about other blocks, templates, or document structure
 */

import type { DividerBlock } from '../../types.js';

/**
 * Render a divider block to HTML
 *
 * @param block - The divider block to render
 * @returns HTML string for this block
 */
export function renderDividerBlock(block: DividerBlock): string {
  // Default values if not specified
  const color = block.color || '#e6e9ee';
  const height = block.height || 1;
  const margin = block.margin || 16;

  // Inline styles for divider
  const styles = [
    'border: none',
    'border-top: none',
    `border-bottom: ${height}px solid ${color}`,
    `padding-top: ${margin}px`,
    `padding-bottom: ${margin}px`,
    'width: 100%',
  ].join(";");

  // HTML table wrapper (email compatibility)
  // HR element doesn't work well in email, so use a table with a line
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="border-bottom: ${height}px solid ${color}; height: 0;"></td>
      </tr>
      <tr>
        <td style="height: ${margin}px;"></td>
      </tr>
    </table>
  `.trim();
}
