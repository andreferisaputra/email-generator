/**
 * Parse inline formatting tokens in text
 *
 * Converts tokens like:
 * - {{bold:#HEX_COLOR}}text{{/bold}} to safe inline <span> with color and font-weight
 * - {{link:URL}}text{{/link}} to safe inline <a> with href and inline styles
 * - {{link:URL|bold|color:#HEX}}text{{/link}} to <a> with combined formatting
 * - {{style:weight|color:#HEX}}text{{/style}} to <span> with unified styling
 *
 * @param text - The text string containing formatting tokens
 * @returns HTML string with formatted spans and links
 */

/**
 * Validate if URL is safe to use in href
 */
function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;

  // Whitelist: allow https://, http://, mailto:, https://wa.me/
  if (url.startsWith('https://')) return true;
  if (url.startsWith('http://')) return true;
  if (url.startsWith('mailto:')) return true;
  if (url.startsWith('https://wa.me/')) return true;

  // Blacklist: reject javascript:, data:, vbscript:, file:
  if (url.startsWith('javascript:')) return false;
  if (url.startsWith('data:')) return false;
  if (url.startsWith('vbscript:')) return false;
  if (url.startsWith('file:')) return false;

  return false;
}

/**
 * Parse link modifiers from token
 * Format: {{link:URL|bold|color:#HEX}}
 * Returns: { url, hasBold, color }
 */
function parseLinkModifiers(spec: string): { url: string; hasBold: boolean; color: string | null } {
  const parts = spec.split('|').map((p) => p.trim());
  const url = parts[0];
  let hasBold = false;
  let color: string | null = null;

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    if (part === 'bold') {
      hasBold = true;
    } else if (part.startsWith('color:')) {
      const colorValue = part.substring(6); // Remove "color:" prefix
      // Validate hex color
      if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(colorValue)) {
        color = colorValue;
      }
    }
  }

  return { url, hasBold, color };
}

/**
 * Parse style modifiers from token
 * Format: {{style:weight|color:#HEX}}
 * Weight ∈ normal, semibold, bold (optional)
 * Color format: color:#HEX (optional)
 * Returns: { weight, color, isValid }
 */
function parseStyleModifiers(spec: string): { weight: string | null; color: string | null; isValid: boolean } {
  const parts = spec.split('|').map((p) => p.trim());
  let weight: string | null = null;
  let color: string | null = null;
  let hasOption = false;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    // Check for weight
    if (part === 'normal' || part === 'semibold' || part === 'bold') {
      weight = part;
      hasOption = true;
    } else if (part.startsWith('color:')) {
      const colorValue = part.substring(6); // Remove "color:" prefix
      // Validate hex color
      if (/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(colorValue)) {
        color = colorValue;
        hasOption = true;
      }
    }
  }

  // At least one option must exist
  return { weight, color, isValid: hasOption };
}

export function parseInlineFormatting(text: string): string {
  let result = text;

  // Step 1: Parse bold tokens first
  const boldRegex = /\{\{bold:(#[0-9A-Fa-f]{3}|#[0-9A-Fa-f]{6})\}\}(.*?)\{\{\/bold\}\}/g;
  let boldMatch;

  while ((boldMatch = boldRegex.exec(text)) !== null) {
    const color = boldMatch[1]; // e.g., #008867
    const contentText = boldMatch[2]; // The text to format
    const fullToken = boldMatch[0]; // The entire {{bold:#...}}...{{/bold}}

    // Create the replacement span with inline styles
    const replacement = `<span style="color:${color};font-weight:700;">${contentText}</span>`;

    // Replace only this specific token occurrence
    result = result.replace(fullToken, replacement);
  }

  // Step 2: Parse unified style tokens
  // Regex to match {{style:modifiers}}...{{/style}}
  const styleRegex = /\{\{style:([^}]+)\}\}(.*?)\{\{\/style\}\}/g;
  let styleMatch;

  while ((styleMatch = styleRegex.exec(result)) !== null) {
    const spec = styleMatch[1]; // e.g., "bold|color:#008867"
    const contentText = styleMatch[2]; // The text to format
    const fullToken = styleMatch[0]; // The entire {{style:...}}...{{/style}}

    // Parse style modifiers
    const { weight, color, isValid } = parseStyleModifiers(spec);

    // Skip invalid tokens (at least one option must exist)
    if (!isValid) {
      result = result.replace(fullToken, contentText);
      continue;
    }

    // Build inline styles for the span
    const styles: string[] = [];

    // Add color if specified
    if (color) {
      styles.push(`color:${color}`);
    }

    // Add font-weight based on weight value
    if (weight === 'bold') {
      styles.push('font-weight:700');
    } else if (weight === 'semibold') {
      styles.push('font-weight:600');
    } else if (weight === 'normal') {
      styles.push('font-weight:400');
    }

    // Create the replacement span with inline styles
    const replacement = `<span style="${styles.join(';')};">${contentText}</span>`;

    // Replace only this specific token occurrence
    result = result.replace(fullToken, replacement);
  }

  // Step 3: Parse combined link tokens with optional modifiers
  // Regex to match {{link:URL|modifiers}}...{{/link}}
  const combinedLinkRegex = /\{\{link:([^}]+)\}\}(.*?)\{\{\/link\}\}/g;
  let combinedLinkMatch;

  while ((combinedLinkMatch = combinedLinkRegex.exec(result)) !== null) {
    const spec = combinedLinkMatch[1]; // e.g., "URL|bold|color:#008867"
    const linkText = combinedLinkMatch[2]; // The text to display
    const fullToken = combinedLinkMatch[0]; // The entire {{link:...}}...{{/link}}

    // Parse URL and modifiers
    const { url, hasBold, color } = parseLinkModifiers(spec);

    // Validate URL before rendering
    if (!isValidUrl(url)) {
      // Invalid URL: render plain text without link
      result = result.replace(fullToken, linkText);
      continue;
    }

    // Build inline styles for the anchor
    const styles: string[] = [];
    const linkColor = color || '#008867'; // Default color
    styles.push(`color:${linkColor}`);
    styles.push('text-decoration:none');
    if (hasBold) {
      styles.push('font-weight:700');
    } else {
      styles.push('font-weight:600');
    }

    // Create the replacement anchor with inline styles
    const replacement = `<a href="${url}" style="${styles.join(';')};" target="_blank" rel="noopener noreferrer">${linkText}</a>`;

    // Replace only this specific token occurrence
    result = result.replace(fullToken, replacement);
  }

  return result;
}
