/**
 * CORE DATA MODEL FOR BLOCK-BASED HTML EMAIL GENERATOR
 * Rock-solid foundation for email template management
 */

// ============================================================================
// TEMPLATE TYPES
// ============================================================================

/**
 * Supported email template types
 * Each has distinct allowed blocks and layout constraints
 */
export type TemplateType = "open-fund" | "close-fund" | "newsletter";

// ============================================================================
// BLOCK TYPES
// ============================================================================

/**
 * All supported block types in the email body
 * Restricted set to maintain email client compatibility
 */
export type BlockType =
  | "title"
  | "paragraph"
  | "image"
  | "button"
  | "divider"
  | "highlight-box";

// ============================================================================
// SANITIZATION
// ============================================================================

/**
 * Allowed inline HTML tags for text content
 * Restricted to ensure email client compatibility and prevent XSS
 */
export type AllowedInlineTag = "strong" | "b" | "em" | "i" | "u" | "a" | "br";

/**
 * Text sanitization configuration
 * Specifies which inline tags are allowed per block type
 */
export interface TextSanitizationConfig {
  // Global rules
  stripAllHTMLExcept: AllowedInlineTag[];
  stripAllStyles: boolean;
  escapeUnsafeCharacters: boolean;

  // Per-tag rules
  tagRestrictions: {
    a: {
      allowedAttributes: ["href"];
      requireHttpProtocol: boolean;
    };
    img: {
      allowedAttributes: ["src", "alt", "width", "height"];
      requireHttpProtocol: boolean;
    };
  };
}

// ============================================================================
// BLOCK DEFINITIONS
// ============================================================================

/**
 * Title block: Single heading for sections
 * Max 2 allowed per template typically
 */
export interface TitleBlock {
  type: "title";
  id: string;
  content: string; // Plain text or sanitized HTML with inline tags only
  level: "h1" | "h2" | "h3"; // Heading level
  color?: string; // Hex color, validated
  paddingBottom?: number; // pixels
}

/**
 * Paragraph block: Text content with optional inline formatting
 * Most flexible block type
 */
export interface ParagraphBlock {
  type: "paragraph";
  id: string;
  content: string; // Plain text or sanitized HTML with <strong>, <em>, <a>, etc.
  color?: string; // Hex color
  lineHeight?: number; // multiplier, e.g., 1.6
  paddingBottom?: number;
  textAlign?: "left" | "center" | "right";
}

/**
 * Image block: Responsive image with alt text
 * Must have accessible alt text
 */
export interface ImageBlock {
  type: "image";
  id: string;
  src: string; // URL, must be HTTPS
  alt: string; // Required accessibility
  width?: number; // pixels or percentage
  height?: number;
  maxWidth?: number; // For responsive design
  borderRadius?: number; // pixels
  paddingBottom?: number;
}

/**
 * Button block: Call-to-action button
 * Limited to 1-2 per template
 */
export interface ButtonBlock {
  type: "button";
  id: string;
  label: string; // Plain text only
  href: string; // URL, must be HTTPS
  backgroundColor?: string; // Hex color
  textColor?: string; // Hex color
  padding?: string; // e.g., "12px 24px"
  borderRadius?: number; // pixels
  marginTop?: number;
  paddingBottom?: number;
  align?: "left" | "center" | "right";
}

/**
 * Divider block: Visual separator
 * Horizontal line
 */
export interface DividerBlock {
  type: "divider";
  id: string;
  color?: string; // Hex color
  height?: number; // pixels
  margin?: number; // vertical margin
}

/**
 * Highlight box: Featured content area
 * Used for callouts, warnings, feature highlights
 */
export interface HighlightBoxBlock {
  type: "highlight-box";
  id: string;
  content: string; // Sanitized HTML
  backgroundColor: string; // Hex color
  borderColor?: string; // Hex color
  borderLeft?: boolean; // Accent border
  padding?: string; // e.g., "20px"
  paddingBottom?: number;
  borderRadius?: number; // pixels
}

/**
 * Union type for all possible blocks
 */
export type Block =
  | TitleBlock
  | ParagraphBlock
  | ImageBlock
  | ButtonBlock
  | DividerBlock
  | HighlightBoxBlock;

// ============================================================================
// TEMPLATE STRUCTURE
// ============================================================================

/**
 * Fixed section: Template logo/header
 * Consistent across all templates
 */
export interface EmailHeader {
  logoUrl: string; // HTTPS
  logoHeight?: number;
  showDarkModeVariant?: boolean;
}

/**
 * Fixed section: Contact and support info
 * Consistent across all templates
 */
export interface HelpSection {
  title: string; // e.g., "Butuh Bantuan untuk Mulai?"
  description: string;
  contactItems: {
    type: "email" | "phone" | "whatsapp";
    label: string;
    value: string;
    href: string;
  }[];
  imageUrl?: string;
}

/**
 * Fixed section: Compliance and legal
 * Varies per template
 */
export interface ComplianceSection {
  text: string; // e.g., "PT Dana Kripto Indonesia sebagai peserta sandbox OJK..."
  sandboxNumber?: string;
  backgroundColor?: string;
}

/**
 * Fixed section: Footer
 * Company information
 */
export interface EmailFooter {
  logoUrl: string;
  companyName: string;
  address: string;
  socialLinks?: {
    platform:
      | "instagram"
      | "twitter"
      | "linkedin"
      | "facebook"
      | "whatsapp"
      | "email";
    url: string;
  }[];
}

/**
 * Email document: Complete structure
 * Represents a fully-formed email with template, body blocks, and fixed sections
 */
export interface EmailDocument {
  // Metadata
  id: string; // UUID
  templateType: TemplateType;
  version: number; // For change tracking
  createdAt: Date;
  updatedAt: Date;

  // Variable content (THE BODY)
  blocks: Block[];

  // Fixed sections (same per template)
  header: EmailHeader;
  body: {
    blocks: Block[]; // Main content blocks
  };
  helpSection: HelpSection;
  complianceSection: ComplianceSection;
  footer: EmailFooter;

  // Metadata for personalization
  personalizationVariables?: {
    [key: string]: string; // e.g., { "firstName": "John", "email": "john@example.com" }
  };

  // Validation state
  isValid?: boolean;
  validationErrors?: ValidationError[];
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validation error details
 */
export interface ValidationError {
  code: string; // e.g., 'BLOCK_NOT_ALLOWED', 'MAX_BLOCKS_EXCEEDED'
  message: string;
  blockId?: string;
  blockType?: BlockType;
  severity: "error" | "warning";
}

/**
 * Template configuration: Rules per template
 * Enforced by validator
 */
export interface TemplateConfiguration {
  templateType: TemplateType;

  // Block availability
  allowedBlockTypes: BlockType[];

  // Block count constraints
  blockConstraints: {
    [K in BlockType]?: {
      min: number;
      max: number;
      required: boolean;
    };
  };

  // Global constraints
  maxTotalBlocks: number;
  allowReordering: boolean;
  requireBlockOrder?: (BlockType | "any")[];

  // Mandatory blocks (must exist)
  mandatoryBlocks: BlockType[];

  // Help and compliance sections
  helpSectionRequired: boolean;
  complianceSectionRequired: boolean;
}

// ============================================================================
// VALIDATION CONTEXT
// ============================================================================

/**
 * Context for validation operations
 * Passed to validator to enforce rules
 */
export interface ValidationContext {
  templateConfig: TemplateConfiguration;
  email: EmailDocument;
  strict: boolean; // If true, warnings become errors
}

// ============================================================================
// SANITIZATION CONTEXT
// ============================================================================

/**
 * Context for text sanitization
 */
export interface SanitizationContext {
  blockType: BlockType;
  sanitizationConfig: TextSanitizationConfig;
}
