/**
 * PSEUDOCODE: BLOCK-BASED EMAIL GENERATOR ARCHITECTURE
 * 
 * This document provides pseudocode for the core validation and sanitization
 * workflows that are implemented in the accompanying TypeScript modules.
 */

// ============================================================================
// PSEUDOCODE: EMAIL DOCUMENT CREATION WORKFLOW
// ============================================================================

FUNCTION createEmailDocument(templateType, blocks) {
  // Initialize email with template metadata
  email = {
    id: generateUUID(),
    templateType: templateType,
    version: 1,
    createdAt: now(),
    updatedAt: now(),
    body: {
      blocks: blocks
    },
    header: getHeaderForTemplate(templateType),
    helpSection: getHelpSectionForTemplate(templateType),
    complianceSection: getComplianceSectionForTemplate(templateType),
    footer: getFooterForTemplate(templateType),
    isValid: false,
    validationErrors: []
  }

  // Sanitize all text content
  FOR EACH block IN email.body.blocks {
    block = sanitizeBlock(block)
  }

  // Validate the complete document
  validationErrors = validateEmailDocument(email, strict=false)
  email.validationErrors = validationErrors
  email.isValid = (validationErrors.length == 0)

  RETURN email
}

// ============================================================================
// PSEUDOCODE: VALIDATION WORKFLOW
// ============================================================================

FUNCTION validateEmailDocument(email, strict) {
  templateConfig = getTemplateConfig(email.templateType)
  validationContext = {
    templateConfig: templateConfig,
    email: email,
    strict: strict
  }

  allErrors = []

  // Run all validation rules in order
  FOR EACH rule IN VALIDATION_RULES {
    ruleErrors = rule.validate(validationContext)
    allErrors.addAll(ruleErrors)
  }

  // Filter results based on strict mode
  IF NOT strict THEN
    // In non-strict mode, only return errors (not warnings)
    allErrors = filter(allErrors, e => e.severity == 'error')
  END IF

  RETURN allErrors
}

FUNCTION validateBlockTypeAllowed(context) {
  errors = []
  
  FOR EACH block IN context.email.body.blocks {
    IF block.type NOT IN context.templateConfig.allowedBlockTypes THEN
      errors.add({
        code: 'BLOCK_TYPE_NOT_ALLOWED',
        message: format("Block type '{}' not allowed", block.type),
        severity: 'error',
        blockId: block.id,
        blockType: block.type
      })
    END IF
  }

  RETURN errors
}

FUNCTION validateBlockCountConstraints(context) {
  errors = []
  config = context.templateConfig

  // Count blocks by type
  blockCounts = new Map()
  FOR EACH block IN context.email.body.blocks {
    blockCounts[block.type] = blockCounts[block.type] + 1
  }

  // Check each constraint
  FOR EACH (blockType, constraint) IN config.blockConstraints {
    currentCount = blockCounts[blockType] OR 0

    // Check minimum
    IF currentCount < constraint.min THEN
      errors.add({
        code: 'MIN_BLOCKS_NOT_MET',
        message: format("Minimum {} blocks of type '{}' required", constraint.min, blockType),
        severity: constraint.required ? 'error' : 'warning',
        blockType: blockType
      })
    END IF

    // Check maximum
    IF currentCount > constraint.max THEN
      errors.add({
        code: 'MAX_BLOCKS_EXCEEDED',
        message: format("Maximum {} blocks of type '{}' allowed", constraint.max, blockType),
        severity: 'error',
        blockType: blockType
      })
    END IF
  }

  RETURN errors
}

FUNCTION validateMandatoryBlocks(context) {
  errors = []
  presentTypes = new Set()

  FOR EACH block IN context.email.body.blocks {
    presentTypes.add(block.type)
  }

  FOR EACH mandatoryType IN context.templateConfig.mandatoryBlocks {
    IF mandatoryType NOT IN presentTypes THEN
      errors.add({
        code: 'MANDATORY_BLOCK_MISSING',
        message: format("Mandatory block type '{}' is missing", mandatoryType),
        severity: 'error',
        blockType: mandatoryType
      })
    END IF
  }

  RETURN errors
}

FUNCTION validateBlockContent(context) {
  errors = []

  FOR EACH block IN context.email.body.blocks {
    IF block.type == 'title' OR block.type == 'paragraph' THEN
      IF block.content IS empty THEN
        errors.add({
          code: 'EMPTY_BLOCK_CONTENT',
          message: format("Block '{}' cannot be empty", block.type),
          severity: 'error',
          blockId: block.id
        })
      END IF
    END IF

    IF block.type == 'image' THEN
      IF block.src IS empty THEN
        errors.add({
          code: 'MISSING_IMAGE_SRC',
          message: "Image must have source URL",
          severity: 'error',
          blockId: block.id
        })
      ELSE IF NOT block.src.startsWith('https://') THEN
        errors.add({
          code: 'INVALID_IMAGE_PROTOCOL',
          message: "Image URL must use HTTPS",
          severity: 'error',
          blockId: block.id
        })
      END IF

      IF block.alt IS empty THEN
        errors.add({
          code: 'MISSING_IMAGE_ALT',
          message: "Image must have alt text",
          severity: 'error',
          blockId: block.id
        })
      END IF
    END IF

    IF block.type == 'button' THEN
      IF block.label IS empty THEN
        errors.add({
          code: 'EMPTY_BUTTON_LABEL',
          message: "Button must have a label",
          severity: 'error',
          blockId: block.id
        })
      END IF

      IF block.href IS empty THEN
        errors.add({
          code: 'MISSING_BUTTON_HREF',
          message: "Button must have a URL",
          severity: 'error',
          blockId: block.id
        })
      ELSE IF NOT isValidUrl(block.href) THEN
        errors.add({
          code: 'INVALID_BUTTON_URL',
          message: "Button URL is invalid",
          severity: 'error',
          blockId: block.id
        })
      END IF
    END IF
  }

  RETURN errors
}

FUNCTION validateColorFormats(context) {
  errors = []
  hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

  FOR EACH block IN context.email.body.blocks {
    IF block HAS field 'color' AND block.color IS NOT empty THEN
      IF NOT hexColorRegex.matches(block.color) THEN
        errors.add({
          code: 'INVALID_COLOR_FORMAT',
          message: format("Invalid color format: {}", block.color),
          severity: 'error',
          blockId: block.id
        })
      END IF
    END IF

    IF block HAS field 'backgroundColor' AND block.backgroundColor IS NOT empty THEN
      IF NOT hexColorRegex.matches(block.backgroundColor) THEN
        errors.add({
          code: 'INVALID_COLOR_FORMAT',
          message: format("Invalid background color: {}", block.backgroundColor),
          severity: 'error',
          blockId: block.id
        })
      END IF
    END IF
  }

  RETURN errors
}

// ============================================================================
// PSEUDOCODE: SANITIZATION WORKFLOW
// ============================================================================

FUNCTION sanitizeTextContent(rawText, blockType) {
  IF rawText IS empty THEN RETURN empty STRING END IF

  config = BLOCK_SANITIZATION_CONFIG[blockType]

  // Case 1: No HTML allowed for this block type
  IF config.stripAllHTMLExcept IS empty THEN
    plainText = stripAllHtmlTags(rawText)
    IF config.escapeUnsafeCharacters THEN
      plainText = escapeHtml(plainText)
    END IF
    RETURN plainText
  END IF

  // Case 2: Some HTML tags allowed
  sanitized = sanitizeHtml(rawText, config.stripAllHTMLExcept)
  RETURN sanitized
}

FUNCTION sanitizeHtml(rawHtml, allowedTags) {
  allowedTagSet = convertToSet(allowedTags)
  dangerousTagSet = {'script', 'iframe', 'object', 'embed', 'form', 'style', ...}
  
  result = empty STRING
  lastIndex = 0
  
  // Tokenize HTML by finding all tags
  FOR EACH tagMatch IN findAllTags(rawHtml) {
    // Add text before tag
    textBefore = rawHtml[lastIndex : tagMatch.startIndex]
    result += escapeHtml(textBefore)

    tagName = extractTagName(tagMatch)
    tagName = toLowerCase(tagName)

    // Skip dangerous tags entirely
    IF tagName IN dangerousTagSet THEN
      lastIndex = tagMatch.endIndex
      CONTINUE
    END IF

    // Skip non-allowed tags
    IF tagName NOT IN allowedTagSet THEN
      lastIndex = tagMatch.endIndex
      CONTINUE
    END IF

    // Keep allowed tag (but sanitize attributes if present)
    sanitizedTag = sanitizeTagAttributes(tagMatch, tagName)
    result += sanitizedTag
    lastIndex = tagMatch.endIndex
  }

  // Add remaining text
  textAfter = rawHtml[lastIndex : end]
  result += escapeHtml(textAfter)

  RETURN result
}

FUNCTION sanitizeTagAttributes(tagMatch, tagName) {
  // Extract attributes from tag
  attributes = parseAttributes(tagMatch)
  
  // Get allowed attributes for this tag
  allowedAttrs = []
  IF tagName == 'a' THEN allowedAttrs = ['href']
  ELSE IF tagName == 'img' THEN allowedAttrs = ['src', 'alt', 'width', 'height']
  ELSE IF tagName IN ['strong', 'b', 'em', 'i', 'u', 'br'] THEN allowedAttrs = []
  END IF

  // Filter attributes
  cleanAttributes = {}
  FOR EACH (attrName, attrValue) IN attributes {
    attrName = toLowerCase(attrName)

    // Reject dangerous attributes
    IF attrName IN {'onclick', 'onload', 'onerror', 'style', 'class', ...} THEN
      CONTINUE
    END IF

    // Only keep allowed attributes
    IF attrName NOT IN allowedAttrs THEN
      CONTINUE
    END IF

    // Validate specific attributes
    IF attrName == 'href' OR attrName == 'src' THEN
      IF NOT isValidUrl(attrValue) THEN CONTINUE END IF
      cleanAttributes[attrName] = escapeHtml(attrValue)
    ELSE
      // For alt text and other safe attributes
      cleanAttributes[attrName] = escapeHtml(attrValue)
    END IF
  }

  // Reconstruct clean tag
  cleanTag = '<' + tagName
  FOR EACH (attrName, attrValue) IN cleanAttributes {
    cleanTag += ' ' + attrName + '="' + attrValue + '"'
  }
  cleanTag += '>'

  RETURN cleanTag
}

FUNCTION escapeHtml(text) {
  // Replace dangerous characters with HTML entities
  text = replace(text, '&', '&amp;')
  text = replace(text, '<', '&lt;')
  text = replace(text, '>', '&gt;')
  text = replace(text, '"', '&quot;')
  text = replace(text, "'", '&#39;')
  RETURN text
}

FUNCTION sanitizeBlock(block) {
  sanitized = copyObject(block)

  SWITCH block.type {
    CASE 'title':
    CASE 'paragraph':
    CASE 'highlight-box':
      sanitized.content = sanitizeTextContent(block.content, block.type)

    CASE 'button':
      sanitized.label = stripAllHtmlTags(block.label)
      sanitized.label = trim(sanitized.label)
      IF NOT isValidUrl(block.href) THEN
        THROW Error("Invalid button URL")
      END IF

    CASE 'image':
      sanitized.alt = stripAllHtmlTags(block.alt)
      sanitized.alt = trim(sanitized.alt)
      IF NOT isValidUrl(block.src) OR NOT block.src.startsWith('https://') THEN
        THROW Error("Invalid image URL - must be HTTPS")
      END IF

    CASE 'divider':
      // No content to sanitize
  }

  RETURN sanitized
}

// ============================================================================
// PSEUDOCODE: BLOCK ADDITION WORKFLOW
// ============================================================================

FUNCTION addBlockToEmail(email, block) {
  // Validate block structure
  IF block.id IS empty OR block.type IS empty THEN
    THROW Error("Block must have id and type")
  END IF

  // Sanitize the block
  cleanBlock = sanitizeBlock(block)

  // Check if block type is allowed
  config = getTemplateConfig(email.templateType)
  IF cleanBlock.type NOT IN config.allowedBlockTypes THEN
    THROW Error("Block type not allowed for this template")
  END IF

  // Add to email
  email.body.blocks.append(cleanBlock)

  // Re-validate entire email
  validationErrors = validateEmailDocument(email, strict=false)
  email.validationErrors = validationErrors
  email.isValid = (validationErrors.length == 0)

  IF NOT email.isValid THEN
    // Log validation errors but don't reject
    LOG("Email validation failed after adding block")
  END IF

  RETURN email
}

FUNCTION removeBlockFromEmail(email, blockId) {
  // Find and remove block
  blockIndex = -1
  FOR i = 0 TO email.body.blocks.length {
    IF email.body.blocks[i].id == blockId THEN
      blockIndex = i
      BREAK
    END IF
  }

  IF blockIndex == -1 THEN
    THROW Error("Block not found")
  END IF

  email.body.blocks.removeAt(blockIndex)

  // Re-validate
  validationErrors = validateEmailDocument(email, strict=false)
  email.validationErrors = validationErrors
  email.isValid = (validationErrors.length == 0)

  RETURN email
}

FUNCTION reorderBlocks(email, blockIds) {
  // Check if reordering is allowed
  config = getTemplateConfig(email.templateType)
  IF NOT config.allowReordering THEN
    THROW Error("Reordering not allowed for this template")
  END IF

  // Create map of block ID to block
  blockMap = {}
  FOR EACH block IN email.body.blocks {
    blockMap[block.id] = block
  }

  // Reorder blocks
  reordered = []
  FOR EACH blockId IN blockIds {
    IF blockId NOT IN blockMap THEN
      THROW Error("Block not found: " + blockId)
    END IF
    reordered.append(blockMap[blockId])
  }

  email.body.blocks = reordered

  // Re-validate
  validationErrors = validateEmailDocument(email, strict=false)
  email.validationErrors = validationErrors
  email.isValid = (validationErrors.length == 0)

  RETURN email
}

// ============================================================================
// PSEUDOCODE: ERROR REPORTING
// ============================================================================

FUNCTION getValidationSummary(email, strict) {
  allErrors = validateEmailDocument(email, strict=true)
  
  errors = filter(allErrors, e => e.severity == 'error')
  warnings = filter(allErrors, e => e.severity == 'warning')

  summary = {
    isValid: errors.length == 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  }

  RETURN summary
}

FUNCTION generateValidationReport(email) {
  summary = getValidationSummary(email, strict=true)

  report = "Email Validation Report\n"
  report += "=======================\n"
  report += "Template: " + email.templateType + "\n"
  report += "Status: " + (summary.isValid ? "VALID" : "INVALID") + "\n"
  report += "Errors: " + summary.errorCount + "\n"
  report += "Warnings: " + summary.warningCount + "\n\n"

  IF summary.errorCount > 0 THEN
    report += "ERRORS:\n"
    FOR EACH error IN summary.errors {
      report += "  [" + error.code + "] " + error.message + "\n"
      IF error.blockId IS NOT empty THEN
        report += "    Block ID: " + error.blockId + "\n"
      END IF
    }
    report += "\n"
  END IF

  IF summary.warningCount > 0 THEN
    report += "WARNINGS:\n"
    FOR EACH warning IN summary.warnings {
      report += "  [" + warning.code + "] " + warning.message + "\n"
    }
  END IF

  RETURN report
}

// ============================================================================
// KEY DESIGN PRINCIPLES
// ============================================================================

/*
 * 1. DEFENSE IN DEPTH
 *    - Validation happens at multiple levels
 *    - Sanitization before storage
 *    - Type safety with TypeScript
 *
 * 2. FAIL-SAFE DEFAULTS
 *    - Most restrictive rules by default
 *    - Explicit whitelisting, not blacklisting
 *    - Reject on doubt, warn on caution
 *
 * 3. EMAIL CLIENT COMPATIBILITY
 *    - Only safe inline HTML tags allowed
 *    - HTTPS only for external resources
 *    - No scripts, iframes, or dangerous elements
 *
 * 4. USER FEEDBACK
 *    - Clear error messages
 *    - Distinguish errors vs warnings
 *    - Provide guidance on fixes
 *
 * 5. AUDIT TRAIL
 *    - Track document versions
 *    - Record validation state
 *    - Enable rollback if needed
 */
