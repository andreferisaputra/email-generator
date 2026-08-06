/**
 * EMAIL GENERATOR CORE - MAIN EXPORT
 *
 * Block-based HTML email generator with strict validation and sanitization.
 * Rock-solid foundation for marketing email systems.
 */

// ============================================================================
// IMPORTS
// ============================================================================

import type {
  BlockType,
  AllowedInlineTag,
  TextSanitizationConfig,
  TitleBlock,
  ParagraphBlock,
  ImageBlock,
  ButtonBlock,
  DividerBlock,
  HighlightBoxBlock,
  Block,
  EmailHeader,
  HelpSection,
  ComplianceSection,
  EmailFooter,
  EmailDocument,
  ValidationError,
  ValidationContext,
  EmailConfiguration,
  SanitizationContext,
} from "./types.js";

import {
  EMAIL_CONFIG,
  getEmailConfig,
  BLOCK_CONSTRAINT_MESSAGES,
} from "./email-config.js";

import {
  blockTypeAllowedRule,
  blockCountConstraintRule,
  totalBlockCountRule,
  mandatoryBlocksRule,
  blockIdUniquenessRule,
  blockContentValidationRule,
  colorFormatRule,
  blockOrderRule,
  fixedSectionsRule,
  validateEmailDocument,
  isEmailDocumentValid,
  getValidationSummary,
  type ValidationSummary,
} from "./validator.js";

import {
  GLOBAL_SANITIZATION_CONFIG,
  BLOCK_SANITIZATION_CONFIG,
  escapeHtml,
  isValidUrlProtocol,
  stripAllHtml,
  sanitizeAttributes,
  sanitizeHtml,
  sanitizeTextContent,
  isValidUrl,
  sanitizeButtonLabel,
  sanitizeImageAlt,
  sanitizeBlock,
  getSanitizationReport,
  type SanitizationResult,
} from "./sanitizer.js";

import { renderEmail } from "./renderer/renderEmail.js";

import { renderBlock } from "./renderer/renderBlock.js";

// ============================================================================
// RE-EXPORTS
// ============================================================================

export type {
  BlockType,
  AllowedInlineTag,
  TextSanitizationConfig,
  TitleBlock,
  ParagraphBlock,
  ImageBlock,
  ButtonBlock,
  DividerBlock,
  HighlightBoxBlock,
  Block,
  EmailHeader,
  HelpSection,
  ComplianceSection,
  EmailFooter,
  EmailDocument,
  ValidationError,
  ValidationContext,
  EmailConfiguration,
  SanitizationContext,
};

export {
  EMAIL_CONFIG,
  getEmailConfig,
  BLOCK_CONSTRAINT_MESSAGES,
  blockTypeAllowedRule,
  blockCountConstraintRule,
  totalBlockCountRule,
  mandatoryBlocksRule,
  blockIdUniquenessRule,
  blockContentValidationRule,
  colorFormatRule,
  blockOrderRule,
  fixedSectionsRule,
  validateEmailDocument,
  isEmailDocumentValid,
  getValidationSummary,
  type ValidationSummary,
  GLOBAL_SANITIZATION_CONFIG,
  BLOCK_SANITIZATION_CONFIG,
  escapeHtml,
  isValidUrlProtocol,
  stripAllHtml,
  sanitizeAttributes,
  sanitizeHtml,
  sanitizeTextContent,
  isValidUrl,
  sanitizeButtonLabel,
  sanitizeImageAlt,
  sanitizeBlock,
  getSanitizationReport,
  type SanitizationResult,
  renderEmail,
  renderBlock,
};

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Create a new email document with default structure
 *
 * USAGE:
 * ```typescript
 * const email = createEmail([
 *   { type: 'title', id: 'title-1', content: 'Welcome' },
 *   { type: 'paragraph', id: 'para-1', content: 'This is an email' }
 * ]);
 * ```
 */
export function createEmail(
  blocks: Block[] = [],
  personalizationVars?: Record<string, string>
): EmailDocument {
  // Sanitize all blocks
  const sanitizedBlocks = blocks.map((block) => {
    try {
      return sanitizeBlock(block);
    } catch (e) {
      console.error(`Failed to sanitize block ${block.id}:`, e);
      return block;
    }
  });

  // Create email document
  const email: EmailDocument = {
    id: generateUUID(),
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    blocks: sanitizedBlocks,
    body: {
      blocks: sanitizedBlocks,
    },
    header: {
      logoUrl: "https://nobi.id/icons/logo-nobi-dana-kripto-black.png",
      logoHeight: 32,
    },
    helpSection: {
      title: "Butuh Bantuan untuk Mulai?",
      description: "Tim kami siap bantu kamu! Kalau ada pertanyaan atau kendala saat registrasi dan verifikasi, langsung aja hubungi kami via:",
      contactItems: [
        {
          type: "email",
          label: "Email",
          value: "halo@nobi.id",
          href: "mailto:halo@nobi.id",
        },
        {
          type: "whatsapp",
          label: "WhatsApp",
          value: "+62 811-8826-624",
          href: "https://wa.me/628118826624",
        },
      ],
      imageUrl: "https://nobi.id/images/hubungi-kami.png",
    },
    complianceSection: {
      text: "PT Dana Kripto Indonesia sebagai peserta sandbox OJK",
      sandboxNumber: "S-196/IK.01/2025",
    },
    footer: {
      logoUrl: "https://nobi.id/icons/logo-nobi-dana-kripto.png",
      companyName: "PT. Dana Kripto Indonesia",
      address: "The Plaza Office Tower - 7th Floor, Jakarta, Indonesia",
      socialLinks: [
        {
          platform: "email",
          url: "mailto:halo@nobi.id",
        },
        {
          platform: "instagram",
          url: "https://www.instagram.com/nobidanakripto/",
        },
        {
          platform: "whatsapp",
          url: "https://wa.me/628118826624?text=Halo%20tim%20NOBI%2C%20saya%20butuh%20bantuan%20mengenai...%20Mohon%20dibantu%20ya.%20Terima%20kasih.",
        },
      ],
    },
    personalizationVariables: personalizationVars,
    isValid: false,
    validationErrors: [],
  };

  // Validate
  const summary = getValidationSummary(email, false);
  email.isValid = summary.isValid;
  email.validationErrors = summary.errors;

  return email;
}

/**
 * Generate a comprehensive validation report for an email
 */
export function generateReport(email: EmailDocument): string {
  const summary = getValidationSummary(email, true);

  let report = `
╔════════════════════════════════════════════════════════╗
║  EMAIL VALIDATION REPORT                              ║
╚════════════════════════════════════════════════════════╝

Status:         ${summary.isValid ? "✅ VALID" : "❌ INVALID"}
Blocks:         ${email.body.blocks.length}
Errors:         ${summary.errorCount}
Warnings:       ${summary.warningCount}

`;

  if (summary.errorCount > 0) {
    report += `ERRORS (${summary.errorCount}):\n`;
    report += "─".repeat(56) + "\n";
    summary.errors.forEach((error) => {
      report += `  [${error.code}]\n`;
      report += `  ${error.message}\n`;
      if (error.blockId) report += `  Block: ${error.blockId}\n`;
      report += "\n";
    });
  }

  if (summary.warningCount > 0) {
    report += `\nWARNINGS (${summary.warningCount}):\n`;
    report += "─".repeat(56) + "\n";
    summary.warnings.forEach((warning) => {
      report += `  [${warning.code}]\n`;
      report += `  ${warning.message}\n`;
      report += "\n";
    });
  }

  if (summary.isValid) {
    report += "\n✅ All validation checks passed!\n";
  }

  report += "\n╔════════════════════════════════════════════════════════╗\n";

  return report;
}

/**
 * Generate UUID v4
 */
function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ============================================================================
// DOCUMENTATION
// ============================================================================

/**
 * Documentation files included in this module:
 *
 * 📄 ARCHITECTURE.md
 *    Complete system design, decisions, security considerations
 *
 * 📄 PSEUDOCODE.md
 *    Detailed pseudocode for all major functions
 *
 * 📄 types.ts
 *    TypeScript interfaces and types
 *
 * 📄 email-config.ts
 *    Per-template rules and constraints
 *
 * 📄 validator.ts
 *    9 validation rules and validation engine
 *
 * 📄 sanitizer.ts
 *    Text sanitization and HTML cleaning
 */

export const DOCUMENTATION = {
  ARCHITECTURE: "ARCHITECTURE.md",
  PSEUDOCODE: "PSEUDOCODE.md",
  TYPES: "types.ts",
  EMAIL_CONFIG: "email-config.ts",
  VALIDATOR: "validator.ts",
  SANITIZER: "sanitizer.ts",
};

// ============================================================================
// QUICK START GUIDE
// ============================================================================

/**
 * QUICK START
 *
 * 1. Create an email:
 *    ```
 *    const email = createEmail([
 *      { type: 'title', id: 'h1', content: 'Welcome' },
 *      { type: 'paragraph', id: 'p1', content: 'Hello!' }
 *    ]);
 *    ```
 *
 * 2. Validate:
 *    ```
 *    const isValid = isEmailDocumentValid(email);
 *    const summary = getValidationSummary(email);
 *    ```
 *
 * 3. Get report:
 *    ```
 *    console.log(generateReport(email));
 *    ```
 *
 * 4. Sanitize text:
 *    ```
 *    const clean = sanitizeTextContent(userInput, 'paragraph');
 *    ```
 *
 * BLOCK TYPES:
 *   - title         : Heading (h1/h2/h3)
 *   - paragraph     : Body text with links
 *   - image         : Responsive image (HTTPS)
 *   - button        : Call-to-action
 *   - divider       : Visual separator
 *   - highlight-box : Callout/feature box
 *
 * VALIDATION:
 *   Automatic checks:
 *   ✓ Block type is supported
 *   ✓ Min/max block counts per type
 *   ✓ Total block limit
 *   ✓ Mandatory blocks present
 *   ✓ Unique block IDs
 *   ✓ Content not empty
 *   ✓ Valid colors (hex format)
 *   ✓ Valid URLs (HTTPS for images/buttons)
 *   ✓ Required sections present
 *
 * SANITIZATION:
 *   Automatic cleaning:
 *   ✓ Strip dangerous HTML tags
 *   ✓ Remove event handlers
 *   ✓ Validate and escape URLs
 *   ✓ Escape HTML special chars
 *   ✓ Remove inline styles
 *   ✓ Block non-HTTPS resources
 *
 * SECURITY:
 *   ✓ XSS prevention (character escaping)
 *   ✓ URL injection prevention
 *   ✓ Email client compatibility
 *   ✓ Compliance section protection
 */
