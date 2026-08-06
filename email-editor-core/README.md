# Email Editor Core

TypeScript engine for the NOBI block-based email generator.

## Responsibilities

- Defines the email document and supported content blocks.
- Sanitizes user-provided block content.
- Validates block data and required fixed sections.
- Renders a complete email-safe HTML document.

The generator uses one shared email configuration. There is no template selection or template-specific behavior.

## Supported Blocks

- `title`
- `paragraph`
- `image`
- `button`
- `divider`
- `highlight-box`

## Usage

```ts
import { createEmail, renderEmail, getValidationSummary } from "email-editor-core";

const email = createEmail([
  {
    type: "title",
    id: "title-1",
    content: "Campaign Update",
    level: "h1",
  },
  {
    type: "paragraph",
    id: "paragraph-1",
    content: "Hello from NOBI.",
  },
]);

const validation = getValidationSummary(email);
const html = renderEmail(email);
```

## Build

```bash
npm run build --workspace=email-editor-core
```

Generated package files are written to `dist`.
