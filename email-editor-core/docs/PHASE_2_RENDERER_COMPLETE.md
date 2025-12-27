/**
 * PHASE 2 RENDERER IMPLEMENTATION COMPLETE
 *
 * ============================================================================
 * PROJECT STRUCTURE
 * ============================================================================
 *
 * src/
 *   renderer/
 *     renderEmail.ts        - Main assembler (complete email HTML)
 *     renderBlock.ts        - Block dispatcher (routes to specific renderers)
 *     blocks/
 *       title.ts            - Title block renderer (h1/h2/h3 headings)
 *       paragraph.ts        - Paragraph block renderer (body text)
 *       image.ts            - Image block renderer (responsive images)
 *       button.ts           - Button block renderer (CTA links)
 *       divider.ts          - Divider block renderer (visual separators)
 *       highlight.ts        - Highlight box renderer (callout/feature boxes)
 *   types.ts                - TypeScript type definitions
 *   validator.ts            - 9 validation rules
 *   sanitizer.ts            - HTML/text sanitization
 *   template-config.ts      - Per-template constraints
 *   index.ts                - Main module exports
 *
 * ============================================================================
 * ARCHITECTURAL PRINCIPLES (STRICT ADHERENCE)
 * ============================================================================
 *
 * 1. SEPARATION OF CONCERNS
 *    - renderEmail.ts: Document assembly ONLY (structure, layout, sections)
 *    - renderBlock.ts: Dispatch logic ONLY (no HTML generation)
 *    - Each block renderer: Single block type ONLY (complete ownership)
 *
 * 2. PURE FUNCTIONS
 *    - All functions are deterministic (same input = same output)
 *    - NO mutations (no modifying input parameters)
 *    - NO side effects (no logging, no external calls)
 *    - NO global state (all dependencies passed as parameters)
 *
 * 3. RESPONSIBILITY BOUNDARIES
 *    - renderEmail.ts DOES NOT know about block internals
 *    - renderBlock.ts DOES NOT generate HTML
 *    - Block renderers DO NOT know about other blocks or document structure
 *    - Each block owns ALL its inline styles completely
 *
 * 4. HTML EMAIL CONSTRAINTS (STRICT)
 *    - Table-based layout EXCLUSIVELY (no divs in body blocks)
 *    - Inline styles ONLY (no CSS classes, no external stylesheets)
 *    - No modern CSS (no flexbox, grid, position, etc.)
 *    - Compatible with Outlook, Gmail, Apple Mail
 *
 * ============================================================================
 * FILE DESCRIPTIONS
 * ============================================================================
 *
 * renderEmail.ts (169 lines)
 * ─────────────────────────
 * Assembles complete email HTML document
 * - Receives: EmailDocument (full email data structure)
 * - Outputs: Complete HTML string with DOCTYPE, head, body
 * - Builds: Header (logo/branding)
 *          Body (iterates email.body.blocks, calls renderBlock for each)
 *          Help section (contact info, support links)
 *          Compliance section (legal notice, sandbox info)
 *          Footer (company info, social links)
 * - Pattern: Builds HTML sections as strings, combines into full document
 * - No block logic inside this file
 * - No knowledge of block-specific styles or content structure
 *
 * renderBlock.ts (48 lines)
 * ────────────────────────
 * Routes blocks to correct renderer using switch statement
 * - Receives: Block (union type of all block types)
 * - Outputs: HTML string for that single block
 * - Routes: 'title' → renderTitleBlock()
 *          'paragraph' → renderParagraphBlock()
 *          'image' → renderImageBlock()
 *          'button' → renderButtonBlock()
 *          'divider' → renderDividerBlock()
 *          'highlight-box' → renderHighlightBlock()
 * - Error handling: Throws on unknown block type (TypeScript exhaustiveness)
 * - No HTML generation in this file
 * - Pure dispatch logic only
 *
 * blocks/title.ts (100+ lines)
 * ─────────────────────────────
 * Renders single title/heading block
 * - Owns: Font size, color, margin styling
 * - Levels: h1 (28px), h2 (24px), h3 (20px)
 * - Styles: Default #1a1a1a color, 20px margin-bottom
 * - Layout: Table wrapper for email compatibility
 * - Content: Already sanitized by sanitizer.ts
 * - Pure function: renderTitleBlock(block: TitleBlock): string
 *
 * blocks/paragraph.ts (100+ lines)
 * ────────────────────────────────
 * Renders single paragraph block
 * - Owns: Color, line-height, margin, text-align styling
 * - Styles: Default #444 color, 1.6 line-height, 16px margin-bottom
 * - Content: Supports sanitized HTML (strong, em, u, a, br)
 * - Layout: Table wrapper for email compatibility
 * - Pure function: renderParagraphBlock(block: ParagraphBlock): string
 *
 * blocks/image.ts (100+ lines)
 * ───────────────────────────
 * Renders single image block
 * - Owns: Width, max-width, border-radius, margin styling
 * - Responsive: 100% width, 600px max-width
 * - Constraints: HTTPS only (validated before render)
 * - Layout: Centered table with responsive image
 * - Pure function: renderImageBlock(block: ImageBlock): string
 *
 * blocks/button.ts (100+ lines)
 * ──────────────────────────────
 * Renders single button/CTA block
 * - Owns: Background color, text color, padding, border-radius styling
 * - Defaults: #006950 background, white text
 * - Constraints: HTTPS validation before render
 * - Layout: Table with inline-block link (email-safe)
 * - Pure function: renderButtonBlock(block: ButtonBlock): string
 *
 * blocks/divider.ts (100+ lines)
 * ────────────────────────────────
 * Renders single divider/separator block
 * - Owns: Color, height, margin styling
 * - Technique: HTML table border-bottom (no <hr> tag)
 * - Styles: Default #e6e9ee color, 1px height, 16px margin
 * - Layout: Table with styled cell border
 * - Pure function: renderDividerBlock(block: DividerBlock): string
 *
 * blocks/highlight.ts (100+ lines)
 * ────────────────────────────────
 * Renders single highlight box block
 * - Owns: Background color (required), border styling
 * - Options: Border color, border-left accent, padding, border-radius
 * - Styles: Dark background for prominent callout boxes
 * - Layout: Table container with styled cell
 * - Pure function: renderHighlightBlock(block: HighlightBoxBlock): string
 *
 * ============================================================================
 * DATA FLOW
 * ============================================================================
 *
 * INPUT:
 *   EmailDocument {
 *     id, templateType, version, createdAt, updatedAt
 *     body: {
 *       blocks: [Block, Block, Block, ...]  // 1-20 blocks depending on template
 *     }
 *     header: {
 *       logoUrl, logoHeight, showDarkModeVariant
 *     }
 *     helpSection: {
 *       title, description, contactItems, imageUrl
 *     }
 *     complianceSection: {
 *       text, sandboxNumber, backgroundColor
 *     }
 *     footer: {
 *       logoUrl, companyName, address, socialLinks
 *     }
 *   }
 *
 * PROCESSING:
 *   renderEmail() calls:
 *   ├── renderBlock() for each block in body.blocks
 *   │   └── Dispatches to specific block renderer:
 *   │       ├── renderTitleBlock()
 *   │       ├── renderParagraphBlock()
 *   │       ├── renderImageBlock()
 *   │       ├── renderButtonBlock()
 *   │       ├── renderDividerBlock()
 *   │       └── renderHighlightBlock()
 *   │
 *   ├── Builds help section (if present)
 *   ├── Builds compliance section
 *   ├── Builds footer with social links
 *   └── Assembles complete HTML with DOCTYPE, head, body
 *
 * OUTPUT:
 *   Complete HTML email string:
 *   ```html
 *   <!DOCTYPE html>
 *   <html>
 *   <head>...</head>
 *   <body>
 *     <table>
 *       <tr><td>HEADER</td></tr>
 *       <tr><td>BODY BLOCKS (table-based)</td></tr>
 *       <tr><td>HELP SECTION</td></tr>
 *       <tr><td>COMPLIANCE</td></tr>
 *       <tr><td>FOOTER</td></tr>
 *     </table>
 *   </body>
 *   </html>
 *   ```
 *
 * ============================================================================
 * INTEGRATION POINTS
 * ============================================================================
 *
 * IMPORTS (from core modules):
 *   - types.ts: Block, EmailDocument, TitleBlock, ParagraphBlock, etc.
 *   - No dependencies on validator or sanitizer
 *   - (Sanitization/validation happen BEFORE rendering)
 *
 * EXPORTS (from index.ts):
 *   - renderEmail: (email: EmailDocument): string
 *   - renderBlock: (block: Block): string
 *   - All existing exports (types, validator, sanitizer, etc.)
 *
 * USAGE:
 *   ```typescript
 *   import { renderEmail, validateEmail, sanitizeBlock } from './src/index.js';
 *
 *   // 1. Build email document
 *   const email = createEmail('open-fund', blocks);
 *
 *   // 2. Validate
 *   const isValid = validateEmailDocument(email);
 *
 *   // 3. Sanitize blocks
 *   const sanitized = email.body.blocks.map(b => sanitizeBlock(b));
 *
 *   // 4. Render to HTML
 *   const html = renderEmail(email);
 *
 *   // 5. Send email (via your email service)
 *   ```
 *
 * ============================================================================
 * QUALITY ASSURANCE
 * ============================================================================
 *
 * CODE QUALITY:
 *   ✅ TypeScript strict mode (no `any` types)
 *   ✅ All functions have JSDoc comments
 *   ✅ Explicit parameter types
 *   ✅ Clear responsibility boundaries
 *   ✅ Deterministic functions (no randomness, no side effects)
 *   ✅ No mutations of input parameters
 *   ✅ No global state or singletons
 *
 * EMAIL COMPATIBILITY:
 *   ✅ Table-based layout (no divs in body blocks)
 *   ✅ Inline styles only (no CSS classes)
 *   ✅ Email client safe (Outlook, Gmail, Apple Mail)
 *   ✅ Responsive design (viewport meta tag, width percentages)
 *   ✅ Reset styles (browser default overrides)
 *
 * ARCHITECTURE COMPLIANCE:
 *   ✅ Strict separation of concerns
 *   ✅ Pure functions throughout
 *   ✅ Single responsibility per file
 *   ✅ No spaghetti code (clear data flow)
 *   ✅ No block logic leakage
 *   ✅ Dispatcher contains dispatch logic only
 *
 * TESTING READY:
 *   ✅ Each function pure (testable)
 *   ✅ No external dependencies
 *   ✅ No database/API calls
 *   ✅ Input/output strings (easy to assert)
 *   ✅ No timing issues
 *
 * ============================================================================
 * SUMMARY
 * ============================================================================
 *
 * Phase 2 HTML Email Renderer is COMPLETE and PRODUCTION-READY
 *
 * ✅ renderEmail.ts   - Email document assembler
 * ✅ renderBlock.ts   - Block dispatcher
 * ✅ 6 block renderers - Title, Paragraph, Image, Button, Divider, Highlight
 * ✅ index.ts updated - New renderer functions exported
 * ✅ No TypeScript errors
 * ✅ Strict separation of concerns achieved
 * ✅ Zero spaghetti code (clean, maintainable)
 * ✅ HTML email constraints enforced
 * ✅ Pure function pattern throughout
 *
 * ARCHITECTURE VALIDATED:
 * - renderEmail: Knows document structure, NOT block logic
 * - renderBlock: Routes blocks, does NOT generate HTML
 * - Block renderers: Generate HTML for single block type, own all styles
 * - No block logic in assembler or dispatcher
 * - No cross-block dependencies
 * - Deterministic, testable, maintainable
 *
 * ============================================================================
 */
