import type { Block, BlockType, EmailDocument } from "email-editor-core";

export interface BlockLibraryItem {
  type: BlockType;
  label: string;
  description: string;
}

export const BLOCK_LIBRARY: BlockLibraryItem[] = [
  { type: "title", label: "Heading", description: "Section title or headline" },
  { type: "paragraph", label: "Text", description: "Body copy and descriptions" },
  { type: "image", label: "Image", description: "Responsive campaign visual" },
  { type: "button", label: "Button", description: "Primary call-to-action" },
  { type: "highlight-box", label: "Callout", description: "Highlighted information" },
  { type: "divider", label: "Divider", description: "Separate content sections" },
];

function createBlockId(type: BlockType): string {
  return `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createBlock(type: BlockType): Block {
  const id = createBlockId(type);

  switch (type) {
    case "title":
      return {
        type,
        id,
        content: "Your campaign headline",
        level: "h1",
        color: "#17211d",
        paddingBottom: 16,
      };
    case "paragraph":
      return {
        type,
        id,
        content: "Write a clear message for your audience. Click this text to edit it directly.",
        color: "#44514b",
        lineHeight: 1.6,
        paddingBottom: 18,
        textAlign: "left",
      };
    case "image":
      return {
        type,
        id,
        src: "https://placehold.co/1200x640/e6f3ee/176b50?text=Campaign+Image",
        alt: "Campaign visual",
        width: 600,
        maxWidth: 600,
        borderRadius: 12,
        paddingBottom: 18,
      };
    case "button":
      return {
        type,
        id,
        label: "Learn More",
        href: "https://nobi.id",
        backgroundColor: "#087a5b",
        textColor: "#ffffff",
        padding: "12px 24px",
        borderRadius: 8,
        marginTop: 4,
        paddingBottom: 18,
        align: "left",
      };
    case "highlight-box":
      return {
        type,
        id,
        content: "Add an important note, key metric, or campaign highlight here.",
        backgroundColor: "#e8f5f0",
        borderColor: "#9bd4c1",
        borderLeft: true,
        padding: "20px",
        paddingBottom: 18,
        borderRadius: 10,
      };
    case "divider":
      return {
        type,
        id,
        color: "#d8e2dd",
        height: 1,
        margin: 18,
      };
  }
}

export function duplicateBlock(block: Block): Block {
  return {
    ...block,
    id: createBlockId(block.type),
  } as Block;
}

export function syncEmailBlocks(email: EmailDocument, blocks: Block[]): EmailDocument {
  return {
    ...email,
    blocks,
    body: { blocks },
    updatedAt: new Date(),
  };
}

export function getStarterBlocks(): Block[] {
  return [
    { ...createBlock("title"), id: "starter-title" },
    { ...createBlock("paragraph"), id: "starter-paragraph" },
    { ...createBlock("button"), id: "starter-button" },
  ];
}
