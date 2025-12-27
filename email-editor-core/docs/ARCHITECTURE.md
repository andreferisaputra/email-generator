/**
 * ARCHITECTURE GUIDE: BLOCK-BASED EMAIL GENERATOR
 * Core Data Model and Validation System
 * 
 * This document explains the design philosophy and structure of the email
 * generator's core validation and sanitization system.
 */

# ARCHITECTURE OVERVIEW

## System Goal
Create a rock-solid foundation that prevents marketing users from breaking email
layouts or violating email client compatibility while maintaining marketing flexibility.

## Core Principle: LAYERED PROTECTION

```
┌─────────────────────────────────────────────────────────┐
│  INPUT LAYER: Text Sanitization                        │
│  - Strip dangerous HTML                                 │
│  - Validate URLs                                        │
│  - Escape special characters                            │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  BLOCK LAYER: Individual Block Validation              │
│  - Content not empty                                    │
│  - Required attributes present                          │
│  - Color formats valid                                  │
│  - Image URLs use HTTPS                                 │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  TEMPLATE LAYER: Per-Template Rules                    │
│  - Allowed block types                                  │
│  - Min/max counts per block type                        │
│  - Mandatory blocks                                     │
│  - Block order requirements                             │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│  DOCUMENT LAYER: Complete Email Validation             │
│  - Fixed sections present                              │
│  - All blocks pass validation                          │
│  - Template rules satisfied                             │
│  - Generate validation report                           │
└─────────────────────────────────────────────────────────┘
```

---

# 1. DATA MODEL

## Email Document Structure

### EmailDocument
The root object representing a complete email.

```typescript
interface EmailDocument {
  // Metadata
  id: string;                    // UUID
  templateType: TemplateType;    // 'open-fund' | 'close-fund' | 'newsletter'
  version: number;               // For change tracking
  
  // Variable Content (Marketing Body)
  body: {
    blocks: Block[];            // Reorderable content blocks
  };
  
  // Fixed Sections (Same per template)
  header: EmailHeader;           // Logo, unchanged
  helpSection: HelpSection;      // Contact info, unchanged per template
  complianceSection: ComplianceSection; // Legal/regulatory, unchanged
  footer: EmailFooter;           // Company info, unchanged
  
  // Validation State
  isValid: boolean;
  validationErrors: ValidationError[];
  
  // Personalization
  personalizationVariables?: Record<string, string>;
}
```

### Block Types (All Supported)

The system supports 6 block types, carefully chosen for email client compatibility:

#### 1. Title Block
- **Purpose**: Section headings
- **Constraints**: Max 2 per template, plain text + emphasis only
- **Attributes**: `content`, `level` (h1/h2/h3), `color`, margins
- **Use Case**: "HARI INI! Open Fund..." headlines

#### 2. Paragraph Block
- **Purpose**: Body text content
- **Constraints**: Min 2, max 5-8 per template (varies)
- **Attributes**: `content`, `color`, `lineHeight`, `textAlign`, margins
- **Allowed HTML**: `<strong>`, `<em>`, `<a>`, `<br>`, `<u>`
- **Use Case**: Marketing copy with occasional links

#### 3. Image Block
- **Purpose**: Responsive images and charts
- **Constraints**: Max 1-4 per template
- **Attributes**: `src` (HTTPS only), `alt` (required), dimensions
- **Accessibility**: Alt text is mandatory
- **Use Case**: Hero images, performance charts, visual separators

#### 4. Button Block
- **Purpose**: Call-to-action
- **Constraints**: Max 1-2 per template, at least one per open-fund
- **Attributes**: `label` (plain text), `href`, colors, padding
- **Restrictions**: No HTML in label, HTTPS URLs only
- **Use Case**: "Investasi Sekarang", "Learn More"

#### 5. Divider Block
- **Purpose**: Visual separation
- **Constraints**: Max 1-3 per template (rarely used)
- **Attributes**: `color`, `height`, `margin`
- **Use Case**: Separate sections without adding content

#### 6. Highlight Box Block
- **Purpose**: Featured callouts, warnings, highlights
- **Constraints**: Max 0-2 per template
- **Attributes**: `content`, `backgroundColor`, `borderColor`, padding
- **Allowed HTML**: Same as paragraph blocks
- **Use Case**: Key benefits box, compliance notices

---

# 2. TEMPLATE RULES

## Per-Template Configuration

Each template has explicit rules encoded in `TemplateConfiguration`.

### Configuration Structure

```typescript
interface TemplateConfiguration {
  templateType: TemplateType;
  allowedBlockTypes: BlockType[];           // Which types allowed
  blockConstraints: {...};                   // Min/max per type
  maxTotalBlocks: number;                    // Hard limit
  allowReordering: boolean;                  // Can user reorder?
  requireBlockOrder?: BlockType[];          // Suggested order
  mandatoryBlocks: BlockType[];             // Must exist
  helpSectionRequired: boolean;              // Always true
  complianceSectionRequired: boolean;        // Always true
}
```

### OPEN-FUND TEMPLATE

**Purpose**: Launch announcement for new fund offering

| Constraint | Value | Rationale |
|-----------|-------|-----------|
| Allowed Types | All 6 types | Maximum flexibility for marketing |
| Title | 1-2 (required) | Headline + optional subheading |
| Paragraph | 2-5 (required) | Core marketing message |
| Image | 0-3 | Hero + optional details |
| Button | 1-2 (required) | Strong CTA essential |
| Divider | 0-2 | Optional separators |
| Highlight Box | 0-1 | Key benefits callout |
| Max Total | 15 blocks | Prevents overwhelming emails |
| Reordering | ✅ Allowed | Marketing can test variations |
| Mandatory | title, paragraph, button | Core marketing elements |

**Recommended Order** (not enforced):
```
title → paragraph → image → paragraph → button → highlight-box
```

### CLOSE-FUND TEMPLATE

**Purpose**: Fund closure notification and transition

| Constraint | Value | Rationale |
|-----------|-------|-----------|
| Allowed Types | All 6 types | Some flexibility allowed |
| Title | 0-1 | Optional heading |
| Paragraph | 2-4 (required) | Clear communication needed |
| Image | 0-2 | Optional visual context |
| Button | 0-1 | No hard CTA for closures |
| Divider | 0-1 | Minimal separators |
| Highlight Box | 0-1 | Optional important notice |
| Max Total | 12 blocks | Shorter, more formal |
| Reordering | ✅ Allowed | Some flexibility |
| Mandatory | paragraph | Core message only |

**Recommended Order**:
```
paragraph → divider → paragraph → highlight-box
```

### NEWSLETTER TEMPLATE

**Purpose**: Educational content, performance updates, market insights

| Constraint | Value | Rationale |
|-----------|-------|-----------|
| Allowed Types | All 6 types | Full flexibility |
| Title | 1-2 (required) | Article headline |
| Paragraph | 3-8 (required) | Long-form content allowed |
| Image | 1-4 (required) | Charts and visuals essential |
| Button | 0-2 | Optional additional CTAs |
| Divider | 0-3 | Can separate sections |
| Highlight Box | 0-2 | Key insights boxes |
| Max Total | 20 blocks | Most permissive |
| Reordering | ✅ Allowed | Content flexibility |
| Mandatory | title, paragraph, image | Editorial requirements |

---

# 3. VALIDATION STRATEGY

## 9 Validation Rules (Executed in Order)

### Rule 1: Block Type Allowed ✓
**Checks**: Each block's type is in template's allowedBlockTypes
**Severity**: ERROR
**Error Code**: `BLOCK_TYPE_NOT_ALLOWED`
**Example**: "Block type 'script' is not allowed in open-fund template"

### Rule 2: Block Count Constraints ✓
**Checks**: Each block type's count respects min/max from config
**Severity**: ERROR or WARNING (depends on required flag)
**Error Codes**: `MIN_BLOCKS_NOT_MET`, `MAX_BLOCKS_EXCEEDED`
**Example**: "Minimum 2 paragraph blocks required. Found: 1"

### Rule 3: Total Block Count ✓
**Checks**: Sum of all blocks ≤ template's maxTotalBlocks
**Severity**: ERROR
**Error Code**: `MAX_TOTAL_BLOCKS_EXCEEDED`
**Example**: "Maximum 15 total blocks allowed. Found: 18"

### Rule 4: Mandatory Blocks ✓
**Checks**: All mandatoryBlocks are present
**Severity**: ERROR
**Error Code**: `MANDATORY_BLOCK_MISSING`
**Example**: "Mandatory block type 'button' is missing"

### Rule 5: Block ID Uniqueness ✓
**Checks**: No duplicate block IDs
**Severity**: ERROR
**Error Code**: `DUPLICATE_BLOCK_ID`
**Example**: "Duplicate block ID: block-123"

### Rule 6: Block Content Validation ✓
**Checks**:
- Title/Paragraph/HighlightBox: Not empty
- Image: src (HTTPS), alt (required)
- Button: label, href (valid URL)
**Severity**: ERROR
**Error Codes**: `EMPTY_TITLE`, `MISSING_IMAGE_SRC`, `INVALID_IMAGE_PROTOCOL`, etc.

### Rule 7: Color Format Validation ✓
**Checks**: All color fields are valid hex colors (#RGB or #RRGGBB)
**Severity**: ERROR
**Error Code**: `INVALID_COLOR_FORMAT`
**Example**: "Invalid color format: 'red'. Use hex format like #FF5733"

### Rule 8: Block Order (Optional) ✓
**Checks**: If reordering disabled, blocks follow requireBlockOrder
**Severity**: WARNING (unless strict mode)
**Error Code**: `BLOCK_ORDER_VIOLATION`
**Note**: Skipped if allowReordering = true

### Rule 9: Fixed Sections ✓
**Checks**: Required sections (help, compliance) are present
**Severity**: ERROR
**Error Code**: `HELP_SECTION_MISSING`, `COMPLIANCE_SECTION_MISSING`

## Validation Modes

### Standard Mode (Strict = false)
- Returns only ERROR severity issues
- Warnings are suppressed
- User sees blocking issues only

### Strict Mode (Strict = true)
- Returns both ERRORS and WARNINGS
- For server-side validation or pre-flight checks
- Useful for audit trails

---

# 4. SANITIZATION STRATEGY

## Input Sanitization Pipeline

```
Raw User Input
    ↓
┌─ Block Type Detection ─┐
│                        │
├─ Plain Text Block?  ───→ stripAllHtml() → escapeHtml()
│
├─ HTML-allowed Block? ──→ sanitizeHtml()
│                            ├─ Tokenize by tags
│                            ├─ Skip dangerous tags
│                            ├─ Keep allowed tags only
│                            ├─ Sanitize attributes
│                            └─ Escape text nodes
│
└─ URL Attribute?  ──────→ isValidUrl()
                            ├─ Check protocol (https://)
                            ├─ Check format
                            └─ Escape for HTML

Result: Clean, Safe Content
```

## Block Type Sanitization Rules

### Title Block
- **Allowed HTML**: `<strong>`, `<b>`, `<em>`, `<i>`
- **Not allowed**: Links, line breaks
- **Reason**: Titles should be brief and simple
- **Example Input**: `HARI INI! <script>alert('x')</script>`
- **Example Output**: `HARI INI! `

### Paragraph Block
- **Allowed HTML**: `<strong>`, `<b>`, `<em>`, `<i>`, `<u>`, `<a>`, `<br>`
- **Attribute Validation**: href requires HTTPS
- **Reason**: Paragraphs need emphasis and links
- **Example Input**: `Kamu bisa <a href="http://bad.com">click</a> here`
- **Example Output**: `Kamu bisa here` (link stripped, not HTTPS)

### Button Label
- **Allowed HTML**: None (plain text only)
- **Reason**: Buttons shouldn't have complex markup
- **Example Input**: `Click <strong>Now</strong>`
- **Example Output**: `Click Now`

### Image Alt Text
- **Allowed HTML**: None (plain text)
- **Reason**: Alt text is accessibility text
- **Example Input**: `Fund image <div>more</div>`
- **Example Output**: `Fund image more`

### Image/Button URLs
- **Protocol Check**: MUST be HTTPS (HTTP rejected)
- **Format Check**: Must be valid URL format
- **Example**: `http://example.com` → REJECTED
- **Example**: `https://example.com` → ACCEPTED

## HTML Sanitization Algorithm

```
INPUT: rawHtml, allowedTags

1. Create allowedTagSet from allowedTags
2. Create dangerousTagSet = {'script', 'iframe', 'object', 'embed', 'form', ...}
3. tokenize(rawHtml) into text and tags
4. FOR each token:
     IF text:
       result += escapeHtml(text)
     ELSE IF tag:
       tagName = extractTagName(token)
       IF tagName in dangerousTagSet:
         skip tag
       ELSE IF tagName NOT in allowedTagSet:
         skip tag
       ELSE:
         sanitizeAttributes(token)
         result += cleanTag
5. RETURN result
```

## Dangerous Elements Always Stripped

**Tags**: script, iframe, object, embed, form, input, button, textarea, style, link, meta

**Attributes**: onclick, onload, onerror, onmouseover, onfocus, onchange, style, class, id

**Reason**: Prevents XSS, injection attacks, unintended styling

## Character Escaping

```
& → &amp;
< → &lt;
> → &gt;
" → &quot;
' → &#39;
/ → &#x2F;
```

**Why**: These characters have special meaning in HTML/attributes.
Escaping prevents interpretation as markup.

---

# 5. ERROR REPORTING

## Validation Error Structure

```typescript
interface ValidationError {
  code: string;              // Machine-readable: BLOCK_TYPE_NOT_ALLOWED
  message: string;           // Human-readable: Block type 'xyz' not allowed
  blockId?: string;          // Which block (if applicable)
  blockType?: BlockType;     // What type of block
  severity: 'error' | 'warning';
}
```

## Validation Summary

```typescript
interface ValidationSummary {
  isValid: boolean;          // true if no errors
  errorCount: number;
  warningCount: number;
  errors: ValidationError[]; // All error-level issues
  warnings: ValidationError[]; // All warning-level issues
}
```

## Example Report

```
Email Validation Report
=======================
Template: open-fund
Status: INVALID
Errors: 2
Warnings: 1

ERRORS:
  [MANDATORY_BLOCK_MISSING] Mandatory block type 'button' is missing
  [EMPTY_TITLE] Title block cannot be empty
    Block ID: title-1

WARNINGS:
  [BLOCK_ORDER_VIOLATION] Block "paragraph" appears out of order
```

---

# 6. WORKFLOW DIAGRAMS

## Create Email Workflow

```
User Input: template + blocks
    ↓
Sanitize all blocks
    ├─ stripHtml / sanitizeHtml per block type
    ├─ escapeCharacters
    └─ validateURLs
    ↓
Validate Document
    ├─ Rule 1: Block types allowed?
    ├─ Rule 2: Block counts OK?
    ├─ Rule 3: Total count OK?
    ├─ Rule 4: Mandatory blocks present?
    ├─ Rule 5: Block IDs unique?
    ├─ Rule 6: Content valid?
    ├─ Rule 7: Colors valid?
    ├─ Rule 8: Order correct?
    └─ Rule 9: Fixed sections present?
    ↓
Set ValidationState
    ├─ email.isValid = (errors.length == 0)
    └─ email.validationErrors = errors
    ↓
Return EmailDocument
```

## Add Block Workflow

```
User adds block
    ↓
Sanitize block
    ├─ escapeContent
    ├─ validateURLs
    └─ checkFormat
    ↓
Check type allowed
    ├─ Is block.type in template.allowedBlockTypes?
    └─ Reject if not
    ↓
Add to body.blocks
    ↓
Re-validate entire email
    ├─ Run all 9 rules
    └─ Update validationErrors
    ↓
Return updated EmailDocument
```

---

# 7. KEY DESIGN DECISIONS

## Decision 1: Sanitization Before Validation
**Chosen**: Sanitize on input, validate after
**Rationale**: 
- Clean data is easier to validate
- Prevents validation confusion from bad input
- Users see what they get

## Decision 2: Strict Whitelisting (Not Blacklisting)
**Chosen**: Explicitly allow tags, block everything else
**Rationale**:
- Email clients have varying support
- Safer for unknown future threats
- Easier to maintain (short whitelist vs long blacklist)

## Decision 3: Type Safety via TypeScript
**Chosen**: Strong typing for all models
**Rationale**:
- Prevents accidental invalid structures
- Catches errors at development time
- Improves IDE support

## Decision 4: Separation of Concerns
**Chosen**: Separate types, config, validation, sanitization
**Rationale**:
- Each module has single responsibility
- Easy to test independently
- Easy to extend with new block types

## Decision 5: Template Configuration as Code
**Chosen**: Rules defined in code, not configuration
**Rationale**:
- Type-safe, validated at build time
- Easy to version control and review
- No runtime parsing errors

## Decision 6: Reordering Allowed per Template
**Chosen**: Templates decide if blocks can be reordered
**Rationale**:
- Some emails need strict order (newsletters)
- Some benefit from flexibility (marketing)
- Configurable per template

---

# 8. SECURITY CONSIDERATIONS

## XSS Prevention
- ✅ All user input is escaped or sanitized
- ✅ No script tags or event handlers allowed
- ✅ URLs validated for protocol safety
- ✅ HTML entities prevent character escaping

## URL Injection
- ✅ Only https:// and http:// allowed (and mailto:)
- ✅ javascript: urls rejected
- ✅ data: urls rejected
- ✅ All URLs validated via URL constructor

## Email Client Compatibility
- ✅ Only inline HTML tags allowed (no divs, spans)
- ✅ No CSS classes or IDs (prevent collisions)
- ✅ No external stylesheets
- ✅ HTTPS images only

## Email Authentication
- ✅ Content validation ensures compliance messages can't be removed
- ✅ Fixed footer/header prevents spoofing
- ✅ Version tracking enables audit trail

---

# 9. EXTENSIBILITY

## Adding a New Block Type

### Step 1: Update Types

```typescript
export type BlockType = 'title' | ... | 'new-type';

export interface NewTypeBlock {
  type: 'new-type';
  id: string;
  // fields...
}
```

### Step 2: Update Sanitization

```typescript
export const BLOCK_SANITIZATION_CONFIG: Record<BlockType, ...> = {
  'new-type': {
    stripAllHTMLExcept: [...],
    stripAllStyles: true,
    escapeUnsafeCharacters: true,
    tagRestrictions: {...}
  }
};
```

### Step 3: Add Validation Rule (if needed)

```typescript
export const newTypeValidationRule: ValidationRule = {
  name: 'NEW_TYPE_VALIDATION',
  description: 'New type specific validation',
  validate: (context) => { ... }
};
```

### Step 4: Update Template Configs

```typescript
export const OPEN_FUND_CONFIG: TemplateConfiguration = {
  // ...
  allowedBlockTypes: [..., 'new-type'],
  blockConstraints: {
    // ... add constraint for new-type
  }
};
```

---

# 10. IMPLEMENTATION CHECKLIST

- [x] Data model types (types.ts)
- [x] Template configurations (template-config.ts)
- [x] Validation rules (validator.ts)
- [x] Sanitization functions (sanitizer.ts)
- [x] Error types and reporting
- [x] Pseudocode documentation
- [x] Architecture guide (this file)

## Next Phases (Not in This Task)

- [ ] HTML generation from validated blocks
- [ ] React UI components for editing
- [ ] Database schema
- [ ] API endpoints
- [ ] Email sending integration
- [ ] Audit logging
- [ ] A/B testing framework
