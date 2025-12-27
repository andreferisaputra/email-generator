/**
 * IMAGE BLOCK RENDERER
 *
 * Responsibility: Render a single image block to HTML
 * - Receives: ImageBlock
 * - Returns: HTML string for this block only
 * - Owns: All styling for image blocks
 * - Does NOT: Know about other blocks, templates, or document structure
 */

import type { ImageBlock } from '../../types.js';

/**
 * Render an image block to HTML
 *
 * @param block - The image block to render
 * @returns HTML string for this block
 */
export function renderImageBlock(block: ImageBlock): string {
  // Default values if not specified
  const maxWidth = block.maxWidth || 600;
  const width = block.width || '100%';
  const borderRadius = block.borderRadius || 0;
  const paddingBottom = block.paddingBottom || 16;

  // Build image element
  let imgTag = `<img src="${block.src}" alt="${block.alt}"`;

  // Add width if numeric
  if (typeof block.width === 'number') {
    imgTag += ` width="${block.width}"`;
  }

  // Add height if specified
  if (block.height) {
    imgTag += ` height="${block.height}"`;
  }

  // Inline styles for image
  const imgStyles = [
    `max-width: ${maxWidth}px`,
    'width: 100%',
    'height: auto',
    'display: block',
    borderRadius > 0 ? `border-radius: ${borderRadius}px` : '',
  ]
    .filter((s) => s.length > 0)
    .join(';');

  imgTag += ` style="${imgStyles}" />`;

  // Container styles
  const containerStyles = [
    `padding-bottom: ${paddingBottom}px`,
    'margin-top: 0',
    'text-align: center',
  ].join(";");

  // HTML table wrapper (email compatibility)
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="${containerStyles}">
          ${imgTag}
        </td>
      </tr>
    </table>
  `.trim();
}
