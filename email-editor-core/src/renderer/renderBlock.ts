/**
 * BLOCK DISPATCHER
 *
 * Responsibility: Route blocks to correct renderer
 * - Receives: Block (union type of all block types)
 * - Returns: HTML string for that block
 * - Does NOT: Generate HTML itself, contain block logic, know about document structure
 */

import type { Block } from '../types.js';
import { renderTitleBlock } from './blocks/title.js';
import { renderParagraphBlock } from './blocks/paragraph.js';
import { renderImageBlock } from './blocks/image.js';
import { renderButtonBlock } from './blocks/button.js';
import { renderDividerBlock } from './blocks/divider.js';
import { renderHighlightBlock } from './blocks/highlight.js';

/**
 * Render any block to HTML
 *
 * Routes block to correct renderer based on block type.
 * Each block type handler owns its complete HTML generation.
 *
 * @param block - The block to render (any block type)
 * @returns HTML string for this block
 * @throws Error if block type is unknown
 */
export function renderBlock(block: Block): string {
  switch (block.type) {
    case 'title':
      return renderTitleBlock(block);

    case 'paragraph':
      return renderParagraphBlock(block);

    case 'image':
      return renderImageBlock(block);

    case 'button':
      return renderButtonBlock(block);

    case 'divider':
      return renderDividerBlock(block);

    case 'highlight-box':
      return renderHighlightBlock(block);

    default:
      // TypeScript exhaustiveness check - this should never happen in production
      // but provides helpful error message if a new block type is added but not handled
      throw new Error(`Unknown block type: ${(block as Block).type}`);
  }
}
