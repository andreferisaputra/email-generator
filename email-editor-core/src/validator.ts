/**
 * VALIDATION STRATEGY AND IMPLEMENTATION
 * Enforces data integrity and template compliance
 */

import type {
  Block,
  BlockType,
  EmailDocument,
  ValidationError,
  ValidationContext,
  TemplateConfiguration,
} from './types.js';
import { getTemplateConfig } from './template-config.js';

// ============================================================================
// VALIDATION RULES
// ============================================================================

/**
 * Validation rule interface
 * Each rule checks a specific constraint
 */
interface ValidationRule {
  name: string;
  description: string;
  validate: (context: ValidationContext) => ValidationError[];
}

// ============================================================================
// CORE VALIDATORS
// ============================================================================

/**
 * RULE 1: Block type availability
 * Ensures only allowed block types for this template are used
 */
export const blockTypeAllowedRule: ValidationRule = {
  name: 'BLOCK_TYPE_ALLOWED',
  description: 'Block type is allowed for this template',
  validate: (context: ValidationContext): ValidationError[] => {
    const { email, templateConfig } = context;
    const errors: ValidationError[] = [];

    email.body.blocks.forEach((block) => {
      if (!templateConfig.allowedBlockTypes.includes(block.type)) {
        errors.push({
          code: 'BLOCK_TYPE_NOT_ALLOWED',
          message: `Block type "${block.type}" is not allowed in ${templateConfig.templateType} template`,
          blockId: block.id,
          blockType: block.type,
          severity: 'error',
        });
      }
    });

    return errors;
  },
};

/**
 * RULE 2: Block count constraints
 * Enforces min/max count per block type
 */
export const blockCountConstraintRule: ValidationRule = {
  name: 'BLOCK_COUNT_CONSTRAINT',
  description: 'Block count respects per-type min/max constraints',
  validate: (context: ValidationContext): ValidationError[] => {
    const { email, templateConfig } = context;
    const errors: ValidationError[] = [];

    // Count blocks by type
    const blockCounts = new Map<BlockType, number>();
    email.body.blocks.forEach((block) => {
      blockCounts.set(block.type, (blockCounts.get(block.type) ?? 0) + 1);
    });

    // Check each constraint
    Object.entries(templateConfig.blockConstraints).forEach(([blockType, constraint]) => {
      if (!constraint) return;

      const count = blockCounts.get(blockType as BlockType) ?? 0;

      // Check minimum
      if (count < constraint.min) {
        errors.push({
          code: 'MIN_BLOCKS_NOT_MET',
          message: `Minimum ${constraint.min} ${blockType} block(s) required. Found: ${count}`,
          blockType: blockType as BlockType,
          severity: constraint.required ? 'error' : 'warning',
        });
      }

      // Check maximum
      if (count > constraint.max) {
        errors.push({
          code: 'MAX_BLOCKS_EXCEEDED',
          message: `Maximum ${constraint.max} ${blockType} block(s) allowed. Found: ${count}`,
          blockType: blockType as BlockType,
          severity: 'error',
        });
      }
    });

    return errors;
  },
};

/**
 * RULE 3: Total block count
 * Enforces maximum total blocks in body
 */
export const totalBlockCountRule: ValidationRule = {
  name: 'TOTAL_BLOCK_COUNT',
  description: 'Total block count does not exceed template maximum',
  validate: (context: ValidationContext): ValidationError[] => {
    const { email, templateConfig } = context;
    const errors: ValidationError[] = [];

    if (email.body.blocks.length > templateConfig.maxTotalBlocks) {
      errors.push({
        code: 'MAX_TOTAL_BLOCKS_EXCEEDED',
        message: `Maximum ${templateConfig.maxTotalBlocks} total blocks allowed. Found: ${email.body.blocks.length}`,
        severity: 'error',
      });
    }

    return errors;
  },
};

/**
 * RULE 4: Mandatory blocks
 * Ensures all required block types are present
 */
export const mandatoryBlocksRule: ValidationRule = {
  name: 'MANDATORY_BLOCKS',
  description: 'All mandatory block types are present',
  validate: (context: ValidationContext): ValidationError[] => {
    const { email, templateConfig } = context;
    const errors: ValidationError[] = [];

    const presentBlockTypes = new Set(email.body.blocks.map((b) => b.type));

    templateConfig.mandatoryBlocks.forEach((blockType) => {
      if (!presentBlockTypes.has(blockType)) {
        errors.push({
          code: 'MANDATORY_BLOCK_MISSING',
          message: `Mandatory block type "${blockType}" is missing`,
          blockType,
          severity: 'error',
        });
      }
    });

    return errors;
  },
};

/**
 * RULE 5: Block order consistency
 * If reordering is disabled, checks that blocks follow required order
 */
export const blockOrderRule: ValidationRule = {
  name: 'BLOCK_ORDER',
  description: 'Blocks are in the recommended order',
  validate: (context: ValidationContext): ValidationError[] => {
    const { email, templateConfig, strict } = context;
    const errors: ValidationError[] = [];

    // Skip if reordering is allowed or no order requirement
    if (templateConfig.allowReordering || !templateConfig.requireBlockOrder) {
      return errors;
    }

    // Check if blocks follow required order
    let lastOrderIndex = -1;
    for (const block of email.body.blocks) {
      const requireOrder = templateConfig.requireBlockOrder;
      let blockOrderIndex = -1;

      for (let i = 0; i < requireOrder.length; i++) {
        if (requireOrder[i] === 'any' || requireOrder[i] === block.type) {
          blockOrderIndex = i;
          break;
        }
      }

      if (blockOrderIndex < lastOrderIndex) {
        errors.push({
          code: 'BLOCK_ORDER_VIOLATION',
          message: `Block "${block.type}" appears out of order. Expected order: ${requireOrder.join(' → ')}`,
          blockId: block.id,
          blockType: block.type,
          severity: strict ? 'error' : 'warning',
        });
      }

      if (blockOrderIndex >= 0) {
        lastOrderIndex = blockOrderIndex;
      }
    }

    return errors;
  },
};

/**
 * RULE 6: Fixed sections presence
 * Ensures help and compliance sections are present if required
 */
export const fixedSectionsRule: ValidationRule = {
  name: 'FIXED_SECTIONS',
  description: 'Required fixed sections are present',
  validate: (context: ValidationContext): ValidationError[] => {
    const { email, templateConfig } = context;
    const errors: ValidationError[] = [];

    if (templateConfig.helpSectionRequired && !email.helpSection) {
      errors.push({
        code: 'HELP_SECTION_MISSING',
        message: 'Help section is required for this template',
        severity: 'error',
      });
    }

    if (templateConfig.complianceSectionRequired && !email.complianceSection) {
      errors.push({
        code: 'COMPLIANCE_SECTION_MISSING',
        message: 'Compliance section is required for this template',
        severity: 'error',
      });
    }

    return errors;
  },
};

/**
 * RULE 7: Block IDs uniqueness
 * Ensures all block IDs are unique
 */
export const blockIdUniquenessRule: ValidationRule = {
  name: 'BLOCK_ID_UNIQUENESS',
  description: 'All block IDs are unique',
  validate: (context: ValidationContext): ValidationError[] => {
    const { email } = context;
    const errors: ValidationError[] = [];

    const idSet = new Set<string>();
    email.body.blocks.forEach((block) => {
      if (idSet.has(block.id)) {
        errors.push({
          code: 'DUPLICATE_BLOCK_ID',
          message: `Duplicate block ID: ${block.id}`,
          blockId: block.id,
          severity: 'error',
        });
      }
      idSet.add(block.id);
    });

    return errors;
  },
};

/**
 * RULE 8: Block content validation
 * Type-specific content rules
 */
export const blockContentValidationRule: ValidationRule = {
  name: 'BLOCK_CONTENT',
  description: 'Block content is valid per block type',
  validate: (context: ValidationContext): ValidationError[] => {
    const { email } = context;
    const errors: ValidationError[] = [];

    email.body.blocks.forEach((block) => {
      // Title blocks
      if (block.type === 'title') {
        if (!block.content || block.content.trim().length === 0) {
          errors.push({
            code: 'EMPTY_TITLE',
            message: 'Title block cannot be empty',
            blockId: block.id,
            blockType: 'title',
            severity: 'error',
          });
        }
      }

      // Paragraph blocks
      if (block.type === 'paragraph') {
        if (!block.content || block.content.trim().length === 0) {
          errors.push({
            code: 'EMPTY_PARAGRAPH',
            message: 'Paragraph block cannot be empty',
            blockId: block.id,
            blockType: 'paragraph',
            severity: 'error',
          });
        }
      }

      // Image blocks
      if (block.type === 'image') {
        if (!block.src || !block.src.trim()) {
          errors.push({
            code: 'MISSING_IMAGE_SRC',
            message: 'Image block must have a source URL',
            blockId: block.id,
            blockType: 'image',
            severity: 'error',
          });
        } else if (!block.src.startsWith('https://')) {
          errors.push({
            code: 'INVALID_IMAGE_PROTOCOL',
            message: 'Image URL must use HTTPS protocol',
            blockId: block.id,
            blockType: 'image',
            severity: 'error',
          });
        }

        if (!block.alt || block.alt.trim().length === 0) {
          errors.push({
            code: 'MISSING_IMAGE_ALT',
            message: 'Image block must have alt text for accessibility',
            blockId: block.id,
            blockType: 'image',
            severity: 'error',
          });
        }
      }

      // Button blocks
      if (block.type === 'button') {
        if (!block.label || block.label.trim().length === 0) {
          errors.push({
            code: 'EMPTY_BUTTON_LABEL',
            message: 'Button block must have a label',
            blockId: block.id,
            blockType: 'button',
            severity: 'error',
          });
        }

        if (!block.href || !block.href.trim()) {
          errors.push({
            code: 'MISSING_BUTTON_HREF',
            message: 'Button block must have a URL',
            blockId: block.id,
            blockType: 'button',
            severity: 'error',
          });
        } else if (!block.href.startsWith('https://') && !block.href.startsWith('http://')) {
          errors.push({
            code: 'INVALID_BUTTON_PROTOCOL',
            message: 'Button URL must use HTTP or HTTPS protocol',
            blockId: block.id,
            blockType: 'button',
            severity: 'error',
          });
        }
      }

      // Highlight box blocks
      if (block.type === 'highlight-box') {
        if (!block.content || block.content.trim().length === 0) {
          errors.push({
            code: 'EMPTY_HIGHLIGHT_BOX',
            message: 'Highlight box cannot be empty',
            blockId: block.id,
            blockType: 'highlight-box',
            severity: 'error',
          });
        }

        if (!block.backgroundColor) {
          errors.push({
            code: 'MISSING_HIGHLIGHT_COLOR',
            message: 'Highlight box must have a background color',
            blockId: block.id,
            blockType: 'highlight-box',
            severity: 'warning',
          });
        }
      }
    });

    return errors;
  },
};

/**
 * RULE 9: Color format validation
 * Ensures all color values are valid hex colors
 */
export const colorFormatRule: ValidationRule = {
  name: 'COLOR_FORMAT',
  description: 'All color values are valid hex colors',
  validate: (context: ValidationContext): ValidationError[] => {
    const { email } = context;
    const errors: ValidationError[] = [];

    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

    email.body.blocks.forEach((block) => {
      if ('color' in block && block.color && !hexColorRegex.test(block.color)) {
        errors.push({
          code: 'INVALID_COLOR_FORMAT',
          message: `Invalid color format: ${block.color}. Use hex format like #FF5733`,
          blockId: block.id,
          blockType: block.type,
          severity: 'error',
        });
      }

      if (
        'backgroundColor' in block &&
        block.backgroundColor &&
        !hexColorRegex.test(block.backgroundColor)
      ) {
        errors.push({
          code: 'INVALID_COLOR_FORMAT',
          message: `Invalid background color format: ${block.backgroundColor}. Use hex format like #FF5733`,
          blockId: block.id,
          blockType: block.type,
          severity: 'error',
        });
      }

      if ('borderColor' in block && block.borderColor && !hexColorRegex.test(block.borderColor)) {
        errors.push({
          code: 'INVALID_COLOR_FORMAT',
          message: `Invalid border color format: ${block.borderColor}. Use hex format like #FF5733`,
          blockId: block.id,
          blockType: block.type,
          severity: 'error',
        });
      }
    });

    return errors;
  },
};

// ============================================================================
// VALIDATION ENGINE
// ============================================================================

/**
 * All validation rules in execution order
 */
const VALIDATION_RULES: ValidationRule[] = [
  blockTypeAllowedRule,
  blockCountConstraintRule,
  totalBlockCountRule,
  mandatoryBlocksRule,
  blockIdUniquenessRule,
  blockContentValidationRule,
  colorFormatRule,
  blockOrderRule, // Order check is last since other errors might matter more
  fixedSectionsRule,
];

/**
 * MAIN VALIDATION FUNCTION
 *
 * @param email - The email document to validate
 * @param strict - If true, warnings become errors
 * @returns ValidationError array
 */
export function validateEmailDocument(
  email: EmailDocument,
  strict: boolean = false
): ValidationError[] {
  const templateConfig = getTemplateConfig(email.templateType);
  const context: ValidationContext = {
    templateConfig,
    email,
    strict,
  };

  // Run all validation rules
  const allErrors = VALIDATION_RULES.flatMap((rule) => rule.validate(context));

  // Filter if not strict mode
  if (!strict) {
    return allErrors.filter((err) => err.severity === 'error');
  }

  return allErrors;
}

/**
 * Check if email document is valid
 * @returns true if no errors, false otherwise
 */
export function isEmailDocumentValid(
  email: EmailDocument,
  strict: boolean = false
): boolean {
  const errors = validateEmailDocument(email, strict);
  return errors.length === 0;
}

/**
 * Get validation summary
 * Useful for reporting
 */
export interface ValidationSummary {
  isValid: boolean;
  errorCount: number;
  warningCount: number;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export function getValidationSummary(
  email: EmailDocument,
  strict: boolean = false
): ValidationSummary {
  const allErrors = validateEmailDocument(email, true); // Always get both errors and warnings

  const errors = allErrors.filter((e) => e.severity === 'error');
  const warnings = allErrors.filter((e) => e.severity === 'warning');

  return {
    isValid: errors.length === 0,
    errorCount: errors.length,
    warningCount: strict ? warnings.length : 0,
    errors,
    warnings,
  };
}
