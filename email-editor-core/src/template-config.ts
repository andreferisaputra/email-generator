/**
 * TEMPLATE-SPECIFIC RULES AND CONFIGURATION
 * Enforces constraints per template type
 */

import type { TemplateConfiguration, BlockType } from './types.js';

// ============================================================================
// TEMPLATE RULES
// ============================================================================

/**
 * OPEN-FUND TEMPLATE RULES
 * Purpose: Marketing email for new fund launch
 * Structure: Hero image → Title + Paragraphs + CTA → Highlight box
 * Marketing-focused, needs strong CTA
 */
export const OPEN_FUND_CONFIG: TemplateConfiguration = {
  templateType: 'open-fund',

  // Which block types are allowed
  allowedBlockTypes: ['title', 'paragraph', 'image', 'button', 'divider', 'highlight-box'],

  // Per-block constraints
  blockConstraints: {
    title: {
      min: 1,
      max: 2,
      required: true,
    },
    paragraph: {
      min: 2,
      max: 5,
      required: true,
    },
    image: {
      min: 0,
      max: 3,
      required: false,
    },
    button: {
      min: 1,
      max: 2,
      required: true, // Must have CTA
    },
    divider: {
      min: 0,
      max: 2,
      required: false,
    },
    'highlight-box': {
      min: 0,
      max: 1,
      required: false,
    },
  },

  // Global constraints
  maxTotalBlocks: 15,
  allowReordering: true,

  // Recommended order (but not enforced if allowReordering: true)
  requireBlockOrder: [
    'title',
    'paragraph',
    'image',
    'paragraph',
    'button',
    'highlight-box',
  ],

  // Must always exist
  mandatoryBlocks: ['title', 'paragraph', 'button'],

  // Fixed sections
  helpSectionRequired: true,
  complianceSectionRequired: true,
};

/**
 * CLOSE-FUND TEMPLATE RULES
 * Purpose: Notification that fund is closed, transition to next phase
 * Structure: Announcement → Details → Next steps → Highlight
 * More formal, fewer blocks than open-fund
 */
export const CLOSE_FUND_CONFIG: TemplateConfiguration = {
  templateType: 'close-fund',

  allowedBlockTypes: ['title', 'paragraph', 'image', 'button', 'divider', 'highlight-box'],

  blockConstraints: {
    title: {
      min: 0,
      max: 1,
      required: false,
    },
    paragraph: {
      min: 2,
      max: 4,
      required: true,
    },
    image: {
      min: 0,
      max: 2,
      required: false,
    },
    button: {
      min: 0,
      max: 1,
      required: false, // No hard CTA for close
    },
    divider: {
      min: 0,
      max: 1,
      required: false,
    },
    'highlight-box': {
      min: 0,
      max: 1,
      required: false,
    },
  },

  maxTotalBlocks: 12,
  allowReordering: true,

  // Suggested structure but not required
  requireBlockOrder: ['paragraph', 'divider', 'paragraph', 'highlight-box'],

  mandatoryBlocks: ['paragraph'],

  helpSectionRequired: true,
  complianceSectionRequired: true,
};

/**
 * NEWSLETTER TEMPLATE RULES
 * Purpose: Information and updates about fund performance
 * Structure: Article → Performance details → CTA → Help
 * Education-focused, longer form content allowed
 */
export const NEWSLETTER_CONFIG: TemplateConfiguration = {
  templateType: 'newsletter',

  allowedBlockTypes: ['title', 'paragraph', 'image', 'button', 'divider', 'highlight-box'],

  blockConstraints: {
    title: {
      min: 1,
      max: 2,
      required: true,
    },
    paragraph: {
      min: 3,
      max: 8,
      required: true, // Longer articles
    },
    image: {
      min: 1,
      max: 4,
      required: true, // Always include performance charts
    },
    button: {
      min: 0,
      max: 2,
      required: false,
    },
    divider: {
      min: 0,
      max: 3,
      required: false,
    },
    'highlight-box': {
      min: 0,
      max: 2,
      required: false,
    },
  },

  maxTotalBlocks: 20, // Most flexible
  allowReordering: true,

  requireBlockOrder: ['title', 'image', 'paragraph', 'divider', 'paragraph', 'button'],

  mandatoryBlocks: ['title', 'paragraph', 'image'],

  helpSectionRequired: true,
  complianceSectionRequired: true,
};

/**
 * Registry of all template configurations
 * Used by validator to look up rules
 */
export const TEMPLATE_CONFIG_REGISTRY: Record<string, TemplateConfiguration> = {
  'open-fund': OPEN_FUND_CONFIG,
  'close-fund': CLOSE_FUND_CONFIG,
  'newsletter': NEWSLETTER_CONFIG,
};

/**
 * Get template configuration by type
 * @throws Error if template type not found
 */
export function getTemplateConfig(templateType: string): TemplateConfiguration {
  const config = TEMPLATE_CONFIG_REGISTRY[templateType];
  if (!config) {
    throw new Error(`Unknown template type: ${templateType}`);
  }
  return config;
}

// ============================================================================
// CONSTRAINT DESCRIPTIONS (for error messages)
// ============================================================================

export const BLOCK_CONSTRAINT_MESSAGES: Record<BlockType, string> = {
  title: 'Section heading (appears once or twice)',
  paragraph: 'Text content with optional inline formatting',
  image: 'Responsive image with alt text',
  button: 'Call-to-action button',
  divider: 'Visual separator line',
  'highlight-box': 'Featured callout box',
};
