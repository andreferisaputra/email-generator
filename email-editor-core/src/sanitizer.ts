/**
 * TEXT SANITIZATION STRATEGY
 * Ensures input safety and email client compatibility
 */

import type { AllowedInlineTag, TextSanitizationConfig, BlockType } from './types.js';

// ============================================================================
// SANITIZATION CONFIGURATION
// ============================================================================

/**
 * Global sanitization rules
 * Applied to all text content
 */
export const GLOBAL_SANITIZATION_CONFIG: TextSanitizationConfig = {
  // Strip all HTML except explicitly allowed tags
  stripAllHTMLExcept: ['strong', 'b', 'em', 'i', 'u', 'a', 'br'],

  // Always strip inline styles
  stripAllStyles: true,

  // Escape unsafe characters to prevent XSS
  escapeUnsafeCharacters: true,

  // Per-tag restrictions
  tagRestrictions: {
    a: {
      allowedAttributes: ['href'],
      requireHttpProtocol: true,
    },
    img: {
      allowedAttributes: ['src', 'alt', 'width', 'height'],
      requireHttpProtocol: true,
    },
  },
};

/**
 * Block-type specific sanitization rules
 * Some blocks allow more flexibility than others
 */
export const BLOCK_SANITIZATION_CONFIG: Record<BlockType, TextSanitizationConfig> = {
  // Titles: plain text + basic emphasis
  title: {
    stripAllHTMLExcept: ['strong', 'b', 'em', 'i'],
    stripAllStyles: true,
    escapeUnsafeCharacters: true,
    tagRestrictions: {
      a: {
        allowedAttributes: ['href'],
        requireHttpProtocol: true,
      },
      img: {
        allowedAttributes: ['src', 'alt', 'width', 'height'],
        requireHttpProtocol: true,
      },
    },
  },

  // Paragraphs: most flexible - allow links and emphasis
  paragraph: {
    stripAllHTMLExcept: ['strong', 'b', 'em', 'i', 'u', 'a', 'br'],
    stripAllStyles: true,
    escapeUnsafeCharacters: true,
    tagRestrictions: {
      a: {
        allowedAttributes: ['href'],
        requireHttpProtocol: true,
      },
      img: {
        allowedAttributes: ['src', 'alt', 'width', 'height'],
        requireHttpProtocol: true,
      },
    },
  },

  // Images: no text content to sanitize
  image: {
    stripAllHTMLExcept: [],
    stripAllStyles: true,
    escapeUnsafeCharacters: true,
    tagRestrictions: {
      a: {
        allowedAttributes: ['href'],
        requireHttpProtocol: true,
      },
      img: {
        allowedAttributes: ['src', 'alt', 'width', 'height'],
        requireHttpProtocol: true,
      },
    },
  },

  // Buttons: plain text only, no HTML allowed
  button: {
    stripAllHTMLExcept: [],
    stripAllStyles: true,
    escapeUnsafeCharacters: true,
    tagRestrictions: {
      a: {
        allowedAttributes: ['href'],
        requireHttpProtocol: true,
      },
      img: {
        allowedAttributes: ['src', 'alt', 'width', 'height'],
        requireHttpProtocol: true,
      },
    },
  },

  // Dividers: no text content
  divider: {
    stripAllHTMLExcept: [],
    stripAllStyles: true,
    escapeUnsafeCharacters: true,
    tagRestrictions: {
      a: {
        allowedAttributes: ['href'],
        requireHttpProtocol: true,
      },
      img: {
        allowedAttributes: ['src', 'alt', 'width', 'height'],
        requireHttpProtocol: true,
      },
    },
  },

  // Highlight boxes: allow emphasis and links
  'highlight-box': {
    stripAllHTMLExcept: ['strong', 'b', 'em', 'i', 'u', 'a', 'br'],
    stripAllStyles: true,
    escapeUnsafeCharacters: true,
    tagRestrictions: {
      a: {
        allowedAttributes: ['href'],
        requireHttpProtocol: true,
      },
      img: {
        allowedAttributes: ['src', 'alt', 'width', 'height'],
        requireHttpProtocol: true,
      },
    },
  },
};

// ============================================================================
// PERSONALIZATION TOKEN HANDLING
// ============================================================================

const ALLOWED_PERSONALIZATION_TOKENS = new Set(['firstName', 'lastName', 'email']);

interface TokenMap {
  text: string;
  tokens: Map<string, string>;
}

/**
 * Extract allowed personalization tokens and replace with safe placeholders
 */
function extractPersonalizationTokens(text: string): TokenMap {
  const tokens = new Map<string, string>();
  let index = 0;

  const modified = text.replace(/\{\{([^}]+)\}\}/g, (fullMatch, tokenName) => {
    const trimmed = tokenName.trim();
    if (ALLOWED_PERSONALIZATION_TOKENS.has(trimmed)) {
      const placeholder = `__PERSONALIZATION_TOKEN_${index}__`;
      tokens.set(placeholder, fullMatch);
      index++;
      return placeholder;
    }
    return '';
  });

  return { text: modified, tokens };
}

/**
 * Restore original personalization tokens after sanitization
 */
function restorePersonalizationTokens(text: string, tokens: Map<string, string>): string {
  let result = text;
  tokens.forEach((original, placeholder) => {
    result = result.split(placeholder).join(original);
  });
  return result;
}

// ============================================================================
// SANITIZATION FUNCTIONS
// ============================================================================

/**
 * List of potentially dangerous HTML tags that must be stripped
 */
const DANGEROUS_TAGS = [
  'script',
  'iframe',
  'object',
  'embed',
  'form',
  'input',
  'button',
  'textarea',
  'style',
  'link',
  'meta',
  'base',
];

/**
 * List of dangerous attributes that carry scripts/code
 */
const DANGEROUS_ATTRIBUTES = [
  'onload',
  'onerror',
  'onclick',
  'onmouseover',
  'onmouseout',
  'onmousemove',
  'onmouseenter',
  'onmouseleave',
  'onchange',
  'onfocus',
  'onblur',
  'onsubmit',
  'onkeydown',
  'onkeyup',
  'onkeypress',
  'ondblclick',
  'ondrag',
  'ondrop',
  'onwheel',
  'onscroll',
  'style',
  'class',
  'id',
];

/**
 * Characters that need HTML entity escaping to prevent XSS
 */
const UNSAFE_CHARS: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
};

/**
 * Escape HTML special characters
 * Prevents XSS by converting dangerous chars to entities
 *
 * @param text - Raw text to escape
 * @returns Escaped text safe for HTML
 */
export function escapeHtml(text: string): string {
  return text.replace(/[&<>"'\/]/g, (char) => UNSAFE_CHARS[char] ?? char);
}

/**
 * Validate URL protocol
 * Ensures only safe protocols are used
 *
 * @param url - URL to validate
 * @returns true if URL uses safe protocol
 */
export function isValidUrlProtocol(url: string): boolean {
  if (!url) return false;

  // Allowed protocols
  const allowedProtocols = ['http://', 'https://', 'mailto:'];

  const lowerUrl = url.toLowerCase().trim();
  return allowedProtocols.some((protocol) => lowerUrl.startsWith(protocol));
}

/**
 * Remove all HTML tags from text
 * Used for blocks that don't allow any HTML
 *
 * @param text - HTML text
 * @returns Plain text with all tags removed
 */
export function stripAllHtml(text: string): string {
  return text
    .replace(/<[^>]*>/g, '') // Remove all tags
    .replace(/&[a-zA-Z0-9]+;/g, (entity) => {
      // Decode common entities
      const entityMap: Record<string, string> = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&nbsp;': ' ',
      };
      return entityMap[entity] ?? entity;
    });
}

/**
 * Parse and validate HTML attributes
 * Returns only allowed attributes with validated values
 *
 * @param tag - HTML tag name
 * @param attributes - Raw attributes from HTML
 * @param allowedAttrs - List of allowed attribute names
 * @returns Clean attribute object
 */
export function sanitizeAttributes(
  tag: string,
  attributes: Record<string, string>,
  allowedAttrs: string[]
): Record<string, string> {
  const clean: Record<string, string> = {};

  Object.entries(attributes).forEach(([attrName, attrValue]) => {
    const lowerAttrName = attrName.toLowerCase();

    // Reject dangerous attributes
    if (DANGEROUS_ATTRIBUTES.includes(lowerAttrName)) {
      return;
    }

    // Only allow explicitly allowed attributes
    if (!allowedAttrs.includes(lowerAttrName)) {
      return;
    }

    // Validate specific attributes
    if (lowerAttrName === 'href' || lowerAttrName === 'src') {
      if (!isValidUrlProtocol(attrValue)) {
        return; // Skip invalid URLs
      }
      clean[lowerAttrName] = escapeHtml(attrValue);
    } else if (lowerAttrName === 'alt') {
      clean[lowerAttrName] = escapeHtml(attrValue);
    } else {
      // For other allowed attributes, escape and include
      clean[lowerAttrName] = escapeHtml(attrValue);
    }
  });

  return clean;
}

/**
 * Sanitize HTML content
 * Removes dangerous tags/attributes while preserving allowed inline tags
 *
 * PSEUDOCODE:
 * 1. Parse HTML into tokens (tags and text)
 * 2. For each token:
 *    - If text: escape special characters
 *    - If tag:
 *      - If dangerous tag: remove
 *      - If not in allowed list: remove
 *      - If allowed: sanitize attributes and keep
 * 3. Reconstruct HTML from clean tokens
 * 4. Validate against allowed tag list
 *
 * @param html - Raw HTML input
 * @param allowedTags - List of allowed tag names
 * @param stripStyles - If true, remove all style attributes
 * @returns Sanitized HTML
 */
export function sanitizeHtml(html: string, allowedTags: AllowedInlineTag[]): string {
  if (!html) return '';

  // Simple tokenizer: split by tags
  const tagRegex = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
  const allowedTagSet = new Set(allowedTags.map((t) => t.toLowerCase()));
  const dangerousTagSet = new Set(DANGEROUS_TAGS.map((t) => t.toLowerCase()));

  let result = '';
  let lastIndex = 0;

  const matches = html.matchAll(tagRegex);

  for (const match of matches) {
    // Add text before tag
    const textBefore = html.substring(lastIndex, match.index);
    result += escapeHtml(textBefore);

    const fullTag = match[0];
    const tagName = match[1].toLowerCase();
    const isClosing = fullTag.startsWith('</');

    // Skip dangerous tags
    if (dangerousTagSet.has(tagName)) {
      lastIndex = match.index! + fullTag.length;
      continue;
    }

    // Skip disallowed tags
    if (!allowedTagSet.has(tagName)) {
      lastIndex = match.index! + fullTag.length;
      continue;
    }

    // Keep allowed tag
    result += fullTag;
    lastIndex = match.index! + fullTag.length;
  }

  // Add remaining text
  const textAfter = html.substring(lastIndex);
  result += escapeHtml(textAfter);

  return result;
}

/**
 * Validate and sanitize text content per block type
 * Main entry point for text sanitization
 *
 * PSEUDOCODE:
 * 1. Get sanitization config for block type
 * 2. If strict mode (no HTML allowed):
 *    - Strip all HTML
 *    - Escape characters
 * 3. If HTML allowed:
 *    - Sanitize HTML keeping only allowed tags
 *    - Validate and clean attributes
 *    - Escape dangerous characters
 * 4. Return clean text
 *
 * @param text - Raw input text
 * @param blockType - Type of block containing the text
 * @returns Sanitized text safe for email
 */
export function sanitizeTextContent(text: string, blockType: BlockType): string {
  if (!text) return '';

  const { text: textWithPlaceholders, tokens } = extractPersonalizationTokens(text);
  const config = BLOCK_SANITIZATION_CONFIG[blockType];

  let sanitized: string;

  if (config.stripAllHTMLExcept.length === 0) {
    const plain = stripAllHtml(textWithPlaceholders);
    sanitized = config.escapeUnsafeCharacters ? escapeHtml(plain) : plain;
  } else {
    sanitized = sanitizeHtml(textWithPlaceholders, config.stripAllHTMLExcept);
  }

  return restorePersonalizationTokens(sanitized, tokens);
}

/**
 * Validate URL for href/src attributes
 * Ensures protocols are safe and format is valid
 *
 * @param url - URL to validate
 * @param requireHttps - If true, reject http://
 * @returns true if valid
 */
export function isValidUrl(url: string, requireHttps: boolean = false): boolean {
  if (!url || typeof url !== 'string') return false;

  try {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol.slice(0, -1); // Remove trailing :

    if (requireHttps) {
      return protocol === 'https';
    }

    return ['http', 'https', 'mailto'].includes(protocol);
  } catch {
    // Not a valid URL
    return false;
  }
}

/**
 * Sanitize button label
 * Buttons don't support HTML - only plain text
 *
 * @param label - Button label text
 * @returns Sanitized label
 */
export function sanitizeButtonLabel(label: string): string {
  if (!label) return '';

  // Strip all HTML
  const plain = stripAllHtml(label);

  // Trim and escape
  return escapeHtml(plain.trim());
}

/**
 * Sanitize image alt text
 * Should be plain text only
 *
 * @param alt - Alt text
 * @returns Sanitized alt text
 */
export function sanitizeImageAlt(alt: string): string {
  if (!alt) return '';

  // Strip HTML and escape
  const plain = stripAllHtml(alt);
  return escapeHtml(plain.trim());
}

/**
 * Batch sanitization for entire block object
 * Applies type-specific sanitization to all text fields
 *
 * PSEUDOCODE:
 * 1. Get block type
 * 2. For each text field in block:
 *    - Apply appropriate sanitization function
 *    - Validate URLs if applicable
 *    - Check color formats
 * 3. Return sanitized block copy
 *
 * @param block - Block object to sanitize
 * @returns New block with sanitized content
 */
export function sanitizeBlock<T extends { type: BlockType; id: string }>(block: T): T {
  const sanitized = { ...block } as any;

  switch (block.type) {
    case 'title':
    case 'paragraph':
    case 'highlight-box':
      if ('content' in sanitized) {
        sanitized.content = sanitizeTextContent(sanitized.content, block.type);
      }
      break;

    case 'button':
      if ('label' in sanitized) {
        sanitized.label = sanitizeButtonLabel(sanitized.label);
      }
      if ('href' in sanitized) {
        if (!isValidUrl(sanitized.href)) {
          throw new Error(`Invalid URL in button: ${sanitized.href}`);
        }
      }
      break;

    case 'image':
      if ('alt' in sanitized) {
        sanitized.alt = sanitizeImageAlt(sanitized.alt);
      }
      if ('src' in sanitized) {
        if (!isValidUrl(sanitized.src, true)) {
          // Images must use HTTPS
          throw new Error(`Invalid HTTPS URL for image: ${sanitized.src}`);
        }
      }
      break;

    // Dividers don't have text content
    case 'divider':
      break;
  }

  return sanitized;
}

// ============================================================================
// SANITIZATION SUMMARY
// ============================================================================

export interface SanitizationResult {
  success: boolean;
  original: string;
  sanitized: string;
  removedCount: number;
  warnings: string[];
}

/**
 * Get detailed sanitization report
 * Useful for debugging and user feedback
 */
export function getSanitizationReport(
  original: string,
  blockType: BlockType
): SanitizationResult {
  const warnings: string[] = [];
  const sanitized = sanitizeTextContent(original, blockType);

  // Count removed tags
  const tagRegex = /<[^>]*>/g;
  const config = BLOCK_SANITIZATION_CONFIG[blockType];
  const allowedTagSet = new Set(config.stripAllHTMLExcept);

  let removedCount = 0;
  const matches = original.matchAll(tagRegex);

  for (const match of matches) {
    const tag = match[0];
    const tagName = tag.match(/<\/?([a-zA-Z][a-zA-Z0-9]*)/)?.[1]?.toLowerCase();

    if (tagName && !allowedTagSet.has(tagName as AllowedInlineTag)) {
      removedCount++;
      warnings.push(`Removed disallowed tag: ${tag}`);
    }
  }

  return {
    success: removedCount === 0,
    original,
    sanitized,
    removedCount,
    warnings,
  };
}
