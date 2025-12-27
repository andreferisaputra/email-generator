# Phase 2 Architecture Diagram

## High-Level Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    EmailDocument                             │
│  {                                                           │
│    body: { blocks: [Block, Block, ...] },                   │
│    header: { logoUrl, logoHeight },                         │
│    helpSection: { title, description, ... },               │
│    complianceSection: { text, sandboxNumber },             │
│    footer: { companyName, address, ... }                   │
│  }                                                          │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
         ┌───────────────────────────────────────┐
         │      renderEmail(email)               │
         │  src/renderer/renderEmail.ts          │
         └───────────┬───────────────────────────┘
                     │
         ┌───────────┴──────────────────────────────────────┐
         │                                                  │
         ▼                                                  ▼
   ┌──────────────┐                        ┌──────────────────┐
   │Build Sections│                        │Iterate Body      │
   ├──────────────┤                        ├──────────────────┤
   │+ Header HTML │                        │for each block:   │
   │+ Help HTML   │                        │  renderBlock()   │
   │+ Compliance  │                        │+ Title           │
   │+ Footer HTML │                        │+ Paragraph       │
   └──────────────┘                        │+ Image           │
                                           │+ Button          │
         ┌──────────────────────┐          │+ Divider         │
         │      Combine All     │          │+ Highlight       │
         │     HTML Sections    │          └────┬─────────────┘
         └──────────────────────┘               │
                     │                          │
                     └──────────────┬───────────┘
                                    ▼
                    ┌──────────────────────────┐
                    │  renderBlock(block)      │
                    │  src/renderer/           │
                    │  renderBlock.ts          │
                    └──────────┬───────────────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │  ... 6 more
                ▼              ▼              ▼
         ┌────────────┐ ┌────────────┐ ┌────────────┐
         │renderTitle │ │renderParag │ │renderImage │
         │Block()     │ │raphBlock() │ │Block()     │
         ├────────────┤ ├────────────┤ ├────────────┤
         │blocks/     │ │blocks/     │ │blocks/     │
         │title.ts    │ │paragraph.s │ │image.ts    │
         └────────────┘ └────────────┘ └────────────┘
                │              │              │
                ▼              ▼              ▼
         ┌────────────┐ ┌────────────┐ ┌────────────┐
         │  <table>   │ │  <table>   │ │  <table>   │
         │    ...     │ │    ...     │ │  <img>     │
         │  </table>  │ │  </table>  │ │  </table>  │
         └────────────┘ └────────────┘ └────────────┘
                │              │              │
                └──────────────┴──────────────┘
                               │
                               ▼
                   ┌───────────────────────┐
                   │  Complete HTML Email  │
                   │  <!DOCTYPE html>      │
                   │  <html>               │
                   │    <head>...</head>   │
                   │    <body>             │
                   │      <table>          │
                   │        HEADER         │
                   │        BODY BLOCKS    │
                   │        HELP SECTION   │
                   │        COMPLIANCE     │
                   │        FOOTER         │
                   │      </table>         │
                   │    </body>            │
                   │  </html>              │
                   └───────────────────────┘
```

---

## Detailed Architecture

### Level 1: Document Assembly

```
renderEmail.ts
┌─────────────────────────────────────────────────────┐
│ export function renderEmail(                        │
│   email: EmailDocument                              │
│ ): string {                                         │
│                                                     │
│   // Build all body blocks                         │
│   const bodyBlocksHtml =                           │
│     email.body.blocks.map(renderBlock).join();    │
│                                                     │
│   // Assemble complete email structure            │
│   return `<!DOCTYPE html>...` + bodyBlocksHtml +  │
│           footer + ...;                            │
│ }                                                   │
└─────────────────────────────────────────────────────┘

KNOWS:
✓ EmailDocument structure
✓ Header, body, help, compliance, footer sections
✓ How to iterate blocks
✓ How to call renderBlock()

DOESN'T KNOW:
✗ Block types (title, paragraph, etc.)
✗ Block-specific styles or content
✗ HTML generation details for blocks
```

### Level 2: Block Dispatcher

```
renderBlock.ts
┌─────────────────────────────────────────────────────┐
│ export function renderBlock(                        │
│   block: Block                                      │
│ ): string {                                         │
│                                                     │
│   switch (block.type) {                            │
│     case 'title':                                  │
│       return renderTitleBlock(block);              │
│     case 'paragraph':                              │
│       return renderParagraphBlock(block);          │
│     ...                                             │
│   }                                                 │
│ }                                                   │
└─────────────────────────────────────────────────────┘

KNOWS:
✓ Block.type field
✓ Which renderer handles each type
✓ How to dispatch correctly

DOESN'T KNOW:
✗ Block properties (color, fontSize, etc.)
✗ HTML generation logic
✗ Style details
```

### Level 3: Block Renderers

```
blocks/title.ts (and similar for each type)
┌─────────────────────────────────────────────────────┐
│ export function renderTitleBlock(                   │
│   block: TitleBlock                                 │
│ ): string {                                         │
│                                                     │
│   const fontSize = block.level === 'h1'            │
│     ? '28px' : '24px';                             │
│   const color = block.color || '#1a1a1a';          │
│                                                     │
│   return `<table><tr><td                           │
│     style="font-size: ${fontSize};                 │
│     color: ${color};">                             │
│     ${block.content}                               │
│     </td></tr></table>`;                           │
│ }                                                   │
└─────────────────────────────────────────────────────┘

KNOWS:
✓ This specific block type
✓ All its properties
✓ All its styles
✓ How to render it to HTML

DOESN'T KNOW:
✗ Other block types
✗ Document structure
✗ Email sections or layout
```

---

## Separation of Concerns

```
┌──────────────────────────┐
│   renderEmail.ts         │
│                          │
│ Responsibility:          │
│ - Document assembly      │
│ - Section management     │
│ - Block iteration        │
│                          │
│ Dependencies:            │
│ - renderBlock()          │
│ - EmailDocument type     │
└────────────┬─────────────┘
             │
             │ calls
             ▼
┌──────────────────────────┐
│   renderBlock.ts         │
│                          │
│ Responsibility:          │
│ - Block dispatch         │
│ - Type routing           │
│                          │
│ Dependencies:            │
│ - Block renderer modules │
│ - Block type             │
└────────────┬─────────────┘
             │
             │ dispatches to
             ▼
┌──────────────────────────┐
│   blocks/[type].ts       │
│                          │
│ Responsibility:          │
│ - Block HTML generation  │
│ - Style ownership        │
│ - Content formatting     │
│                          │
│ Dependencies:            │
│ - Specific block type    │
│ - TypeScript types       │
└──────────────────────────┘
```

---

## Request/Response Flow

```
1. USER CREATES EMAIL

   EmailDocument {
     body: {
       blocks: [
         { type: 'title', id: 't1', content: 'Hello' },
         { type: 'paragraph', id: 'p1', content: 'Welcome' },
         { type: 'button', id: 'b1', label: 'Click', url: '...' }
       ],
       header: { logoUrl: '...' },
       ...
     }
   }

2. CALL renderEmail()

   renderEmail(emailDocument)

3. LEVEL 1: DOCUMENT ASSEMBLY

   renderEmail() creates sections:
   - Header HTML section
   - Iterates body.blocks
   - Help section HTML
   - Compliance section HTML
   - Footer section HTML

4. LEVEL 2: DISPATCH (for each block)

   For block 1: renderBlock({ type: 'title', ... })
     → switch matches 'title'
     → calls renderTitleBlock()

   For block 2: renderBlock({ type: 'paragraph', ... })
     → switch matches 'paragraph'
     → calls renderParagraphBlock()

   For block 3: renderBlock({ type: 'button', ... })
     → switch matches 'button'
     → calls renderButtonBlock()

5. LEVEL 3: GENERATION (specific renderer)

   renderTitleBlock(block) returns:
   "<table><tr><td style="...">Hello</td></tr></table>"

   renderParagraphBlock(block) returns:
   "<table><tr><td style="...">Welcome</td></tr></table>"

   renderButtonBlock(block) returns:
   "<table><tr><td><a style="...">Click</a></td></tr></table>"

6. LEVEL 1: ASSEMBLY (combine all)

   All HTML strings combined:
   <!DOCTYPE html>
   <html>
     <head>...</head>
     <body>
       <table>
         <tr><td>HEADER</td></tr>
         <tr><td>
           <table>...</table>  <!-- title block -->
           <table>...</table>  <!-- paragraph block -->
           <table>...</table>  <!-- button block -->
         </td></tr>
         <tr><td>HELP SECTION</td></tr>
         <tr><td>COMPLIANCE</td></tr>
         <tr><td>FOOTER</td></tr>
       </table>
     </body>
   </html>

7. RETURN COMPLETE EMAIL

   Output: Complete HTML string (ready to send)
```

---

## Key Architectural Patterns

### Pattern 1: Pure Functions

```
PURE: renderTitleBlock(block)
  Input:  TitleBlock { type: 'title', level: 'h1', content: 'Hi' }
  Output: String "<table>...</table>"
  
  ✓ Same input = same output (deterministic)
  ✓ No side effects
  ✓ No mutations
  ✓ Testable with simple assertions
```

### Pattern 2: Dispatch

```
DISPATCHER: renderBlock()
  Input:  Block (any type)
  Logic:  switch on block.type
  Output: Call appropriate renderer
  
  ✓ Single responsibility (just dispatch)
  ✓ Easy to extend (add new case)
  ✓ Type-safe (TypeScript exhaustiveness)
```

### Pattern 3: Composition

```
COMPOSITION: renderEmail()
  Combines:
  - Header HTML (from header object)
  - Body HTML (from renderBlock calls)
  - Help HTML (from helpSection object)
  - Compliance HTML (from complianceSection object)
  - Footer HTML (from footer object)
  
  ✓ Builds complexity from simple pieces
  ✓ Clear structure
  ✓ Easy to modify sections
```

---

## Testing Architecture

```
Unit Tests:
  renderTitleBlock(block) → assert HTML output
  renderParagraphBlock(block) → assert HTML output
  ... (6 block renderers)

Integration Tests:
  renderBlock(block) → assert dispatcher routes correctly
  
System Tests:
  renderEmail(document) → assert complete HTML structure

All testable because:
✓ Pure functions (deterministic)
✓ No external dependencies
✓ String input/output (easy to assert)
✓ No async operations
```

---

## Summary

The Phase 2 renderer implements a **three-level hierarchy**:

1. **renderEmail.ts** - Document-level assembly
2. **renderBlock.ts** - Block-level dispatch
3. **blocks/*.ts** - Block-specific generation

Each level has **clear boundaries**:
- No block logic in document assembler
- No HTML generation in dispatcher
- No document knowledge in block renderers

All functions are **pure**:
- Deterministic
- No side effects
- No mutations

Result: **Clean, maintainable, extensible architecture** ✅
