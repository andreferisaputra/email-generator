/**
 * BUTTON BLOCK RENDERER
 *
 * Responsibility: Render a single button block to HTML
 * - Receives: ButtonBlock
 * - Returns: HTML string for this block only
 * - Owns: All styling for button blocks
 * - Does NOT: Know about other blocks, templates, or document structure
 */

import type { ButtonBlock } from "../../types.js";

/**
 * Render a button block to HTML
 *
 * @param block - The button block to render
 * @returns HTML string for this block
 */
export function renderButtonBlock(block: ButtonBlock): string {
  // Default values if not specified
  const backgroundColor = block.backgroundColor || "#006950";
  const textColor = block.textColor || "#ffffff";
  const padding = block.padding || "10px 16px";
  const borderRadius = block.borderRadius || 6;
  const marginTop = block.marginTop || 12;
  const paddingBottom = block.paddingBottom || 0;
  const align = block.align || "left";

  // Parse padding if string format like "12px 24px"
  const paddingValue = padding;

  // Inline styles for button link
  const linkStyles = [
    `background-color: ${backgroundColor}`,
    `color: ${textColor}`,
    `padding: ${paddingValue}`,
    "text-decoration: none",
    `border-radius: ${borderRadius}px`,
    "display: inline-block",
    "font-weight: bold",
    "border: none",
    "cursor: pointer",
  ].join(";");

  // Container styles
  const containerStyles = [
    `margin-top: ${marginTop}px`,
    `padding-bottom: ${paddingBottom}px`,
    `text-align: ${align}`,
  ].join(";");

  // HTML table wrapper (email compatibility)
  return `
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="${containerStyles}">
          <a href="${block.href}" style="${linkStyles}">
            ${block.label}
          </a>
        </td>
      </tr>
    </table>
  `.trim();
}
