/**
 * Shared rules for every generated email.
 */

import type { BlockType, EmailConfiguration } from "./types.js";

export const EMAIL_CONFIG: EmailConfiguration = {
  allowedBlockTypes: [
    "title",
    "paragraph",
    "image",
    "button",
    "divider",
    "highlight-box",
  ],
  blockConstraints: {
    title: { min: 0, max: 20, required: false },
    paragraph: { min: 0, max: 30, required: false },
    image: { min: 0, max: 20, required: false },
    button: { min: 0, max: 20, required: false },
    divider: { min: 0, max: 20, required: false },
    "highlight-box": { min: 0, max: 20, required: false },
  },
  maxTotalBlocks: 50,
  allowReordering: true,
  mandatoryBlocks: [],
  helpSectionRequired: true,
  complianceSectionRequired: true,
};

export function getEmailConfig(): EmailConfiguration {
  return EMAIL_CONFIG;
}

export const BLOCK_CONSTRAINT_MESSAGES: Record<BlockType, string> = {
  title: "Section heading",
  paragraph: "Text content with optional inline formatting",
  image: "Responsive image with alt text",
  button: "Call-to-action button",
  divider: "Visual separator line",
  "highlight-box": "Featured callout box",
};
