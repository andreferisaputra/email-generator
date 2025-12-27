"use client";

import { useState } from "react";
import type {
  Block,
  TitleBlock,
  ParagraphBlock,
  ImageBlock,
  ButtonBlock,
  DividerBlock,
  HighlightBoxBlock,
} from "email-editor-core";
import SelectInput from "./form/SelectInput";
import TitleForm from "./form/blocks/TitleForm";
import ParagraphForm from "./form/blocks/ParagraphForm";
import ImageForm from "./form/blocks/ImageForm";
import ButtonForm from "./form/blocks/ButtonForm";
import DividerForm from "./form/blocks/DividerForm";
import HighlightBoxForm from "./form/blocks/HighlightBoxForm";

interface BlockFormProps {
  block?: Block;
  onUpdate?: (id: string, updates: Partial<Block>) => void;
  onAddNew: (block: Block) => void;
}

const blockTypes = [
  "title",
  "paragraph",
  "image",
  "button",
  "divider",
  "highlight-box",
] as const;

const blockTypeLabels: Record<typeof blockTypes[number], string> = {
  title: "Heading / Section Title",
  paragraph: "Text Content",
  image: "Image",
  button: "Call-to-Action Button",
  divider: "Divider / Separator",
  "highlight-box": "Highlight Box / Featured Content",
};

interface BlockState {
  type: typeof blockTypes[number];
  content: string;
  href: string;
  src: string;
  alt: string;
  label: string;
  level: "h1" | "h2" | "h3";
  color: string;
  backgroundColor: string;
  lineHeight: number;
  paddingBottom: number;
  textAlign: "left" | "center" | "right";
  width: number;
  imageHeight?: number;
  maxWidth: number;
  borderRadius: number;
  padding: string;
  marginTop: number;
  align: "left" | "center" | "right";
  borderColor: string;
  borderLeft: boolean;
  textColor: string;
  dividerHeight: number;
  dividerMargin: number;
}

function getInitialState(block?: Block): BlockState {
  if (!block) {
    return {
      type: "paragraph",
      content: "",
      href: "",
      src: "",
      alt: "",
      label: "",
      level: "h1",
      color: "#1a1a1a",
      backgroundColor: "#f8f4e6",
      lineHeight: 1.6,
      paddingBottom: 16,
      textAlign: "left",
      width: 100,
      maxWidth: 600,
      borderRadius: 0,
      padding: "10px 16px",
      marginTop: 12,
      align: "left",
      borderColor: "transparent",
      borderLeft: false,
      textColor: "#ffffff",
      imageHeight: undefined,
      dividerHeight: 1,
      dividerMargin: 16,
    };
  }

  return {
    type: block.type,
    content: "content" in block ? block.content : "",
    href: "href" in block ? block.href : "",
    src: "src" in block ? block.src : "",
    alt: "alt" in block ? block.alt : "",
    label: "label" in block ? block.label : "",
    level: ("level" in block ? block.level : "h1") as "h1" | "h2" | "h3",
    color: ("color" in block ? block.color : "#1a1a1a") as string,
    backgroundColor: ("backgroundColor" in block ? block.backgroundColor : "#f8f4e6") as string,
    lineHeight: ("lineHeight" in block ? block.lineHeight : 1.6) as number,
    paddingBottom: ("paddingBottom" in block ? block.paddingBottom : 16) as number,
    textAlign: ("textAlign" in block ? block.textAlign : "left") as "left" | "center" | "right",
    width: ("width" in block ? block.width : 100) as number,
    imageHeight: ("height" in block && block.type === "image" ? (block as ImageBlock).height : undefined) as number | undefined,
    maxWidth: ("maxWidth" in block ? block.maxWidth : 600) as number,
    borderRadius: ("borderRadius" in block ? block.borderRadius : 0) as number,
    padding: ("padding" in block ? block.padding : "10px 16px") as string,
    marginTop: ("marginTop" in block ? block.marginTop : 12) as number,
    align: ("align" in block ? block.align : "left") as "left" | "center" | "right",
    borderColor: ("borderColor" in block ? block.borderColor : "transparent") as string,
    borderLeft: ("borderLeft" in block ? block.borderLeft : false) as boolean,
    textColor: ("textColor" in block ? block.textColor : "#ffffff") as string,
    dividerHeight: ("height" in block && block.type === "divider" ? (block as DividerBlock).height : 1) as number,
    dividerMargin: ("margin" in block && block.type === "divider" ? (block as DividerBlock).margin : 16) as number,
  };
}

export default function BlockForm({
  block,
  onUpdate,
  onAddNew,
}: BlockFormProps) {
  const initialState = getInitialState(block);

  const [state, setState] = useState<BlockState>(initialState);

  const handleSave = () => {
    if (block && onUpdate) {
      const updates = createBlockUpdates(state);
      onUpdate(block.id, updates);
    } else {
      const newBlock = createNewBlock(state);
      if (newBlock) {
        onAddNew(newBlock);
        setState(getInitialState());
      }
    }
  };

  const isValid = validateBlock(state);

  return (
    <div className="p-4 border border-gray-300 rounded-lg bg-white space-y-4 text-black">
      <h3 className="font-semibold text-gray-900">
        {block ? "Edit Block" : "Add New Content Block"}
      </h3>

      <SelectInput
        label="Content Type"
        value={state.type}
        onChange={(type) => setState({ ...state, type: type as typeof blockTypes[number] })}
        disabled={!!block}
        options={blockTypes.map((bt) => ({
          value: bt,
          label: blockTypeLabels[bt],
        }))}
      />

      {/* Block-specific forms */}
      {state.type === "title" && (
        <TitleForm
          content={state.content}
          color={state.color}
          level={state.level}
          paddingBottom={state.paddingBottom}
          onContentChange={(val) => setState({ ...state, content: val })}
          onColorChange={(val) => setState({ ...state, color: val })}
          onLevelChange={(val) => setState({ ...state, level: val })}
          onPaddingBottomChange={(val) => setState({ ...state, paddingBottom: val })}
        />
      )}

      {state.type === "paragraph" && (
        <ParagraphForm
          content={state.content}
          color={state.color}
          lineHeight={state.lineHeight}
          paddingBottom={state.paddingBottom}
          textAlign={state.textAlign}
          onContentChange={(val) => setState({ ...state, content: val })}
          onColorChange={(val) => setState({ ...state, color: val })}
          onLineHeightChange={(val) => setState({ ...state, lineHeight: val })}
          onPaddingBottomChange={(val) => setState({ ...state, paddingBottom: val })}
          onTextAlignChange={(val) => setState({ ...state, textAlign: val })}
        />
      )}

      {state.type === "image" && (
        <ImageForm
          src={state.src}
          alt={state.alt}
          width={state.width}
          height={state.imageHeight}
          maxWidth={state.maxWidth}
          borderRadius={state.borderRadius}
          paddingBottom={state.paddingBottom}
          onSrcChange={(val) => setState({ ...state, src: val })}
          onAltChange={(val) => setState({ ...state, alt: val })}
          onWidthChange={(val) => setState({ ...state, width: val })}
          onHeightChange={(val) => setState({ ...state, imageHeight: val })}
          onMaxWidthChange={(val) => setState({ ...state, maxWidth: val })}
          onBorderRadiusChange={(val) => setState({ ...state, borderRadius: val })}
          onPaddingBottomChange={(val) => setState({ ...state, paddingBottom: val })}
        />
      )}

      {state.type === "button" && (
        <ButtonForm
          label={state.label}
          href={state.href}
          backgroundColor={state.backgroundColor}
          textColor={state.textColor}
          padding={state.padding}
          borderRadius={state.borderRadius}
          marginTop={state.marginTop}
          paddingBottom={state.paddingBottom}
          align={state.align}
          onLabelChange={(val) => setState({ ...state, label: val })}
          onHrefChange={(val) => setState({ ...state, href: val })}
          onBackgroundColorChange={(val) => setState({ ...state, backgroundColor: val })}
          onTextColorChange={(val) => setState({ ...state, textColor: val })}
          onPaddingChange={(val) => setState({ ...state, padding: val })}
          onBorderRadiusChange={(val) => setState({ ...state, borderRadius: val })}
          onMarginTopChange={(val) => setState({ ...state, marginTop: val })}
          onPaddingBottomChange={(val) => setState({ ...state, paddingBottom: val })}
          onAlignChange={(val) => setState({ ...state, align: val })}
        />
      )}

      {state.type === "divider" && (
        <DividerForm
          color={state.color}
          height={state.dividerHeight}
          margin={state.dividerMargin}
          onColorChange={(val) => setState({ ...state, color: val })}
          onHeightChange={(val) => setState({ ...state, dividerHeight: val })}
          onMarginChange={(val) => setState({ ...state, dividerMargin: val })}
        />
      )}

      {state.type === "highlight-box" && (
        <HighlightBoxForm
          content={state.content}
          backgroundColor={state.backgroundColor}
          borderColor={state.borderColor}
          padding={state.padding}
          borderRadius={state.borderRadius}
          paddingBottom={state.paddingBottom}
          borderLeft={state.borderLeft}
          onContentChange={(val) => setState({ ...state, content: val })}
          onBackgroundColorChange={(val) => setState({ ...state, backgroundColor: val })}
          onBorderColorChange={(val) => setState({ ...state, borderColor: val })}
          onPaddingChange={(val) => setState({ ...state, padding: val })}
          onBorderRadiusChange={(val) => setState({ ...state, borderRadius: val })}
          onPaddingBottomChange={(val) => setState({ ...state, paddingBottom: val })}
          onBorderLeftChange={(val) => setState({ ...state, borderLeft: val })}
        />
      )}

      <button
        onClick={handleSave}
        disabled={!isValid}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-medium"
      >
        {block ? "Update Block" : "Add Block"}
      </button>
    </div>
  );
}

// ============================================================================
// HELPER FUNCTIONS (DRY principle)
// ============================================================================

function validateBlock(state: BlockState): boolean {
  if (!state.type) return false;

  switch (state.type) {
    case "title":
    case "paragraph":
    case "highlight-box":
      return state.content.trim().length > 0;
    case "button":
      return state.label.trim().length > 0 && state.href.trim().length > 0;
    case "image":
      return state.src.trim().length > 0 && state.alt.trim().length > 0;
    case "divider":
      return true;
    default:
      return false;
  }
}

function createBlockUpdates(
  state: BlockState
): Partial<Block> {
  const updates: Partial<Block> = {};

  switch (state.type) {
    case "title": {
      const titleUpdates: Partial<TitleBlock> = {
        level: state.level,
        content: state.content,
        color: state.color,
        paddingBottom: state.paddingBottom,
      };
      Object.assign(updates, titleUpdates);
      break;
    }
    case "paragraph": {
      const paragraphUpdates: Partial<ParagraphBlock> = {
        content: state.content,
        color: state.color,
        lineHeight: state.lineHeight,
        paddingBottom: state.paddingBottom,
        textAlign: state.textAlign,
      };
      Object.assign(updates, paragraphUpdates);
      break;
    }
    case "image": {
      const imageUpdates: Partial<ImageBlock> = {
        src: state.src,
        alt: state.alt,
        width: state.width,
        height: state.imageHeight,
        maxWidth: state.maxWidth,
        borderRadius: state.borderRadius,
        paddingBottom: state.paddingBottom,
      };
      Object.assign(updates, imageUpdates);
      break;
    }
    case "button": {
      const buttonUpdates: Partial<ButtonBlock> = {
        label: state.label,
        href: state.href,
        backgroundColor: state.backgroundColor,
        textColor: state.textColor,
        padding: state.padding,
        borderRadius: state.borderRadius,
        marginTop: state.marginTop,
        paddingBottom: state.paddingBottom,
        align: state.align,
      };
      Object.assign(updates, buttonUpdates);
      break;
    }
    case "divider": {
      const dividerUpdates: Partial<DividerBlock> = {
        color: state.color,
        height: state.dividerHeight,
        margin: state.dividerMargin,
      };
      Object.assign(updates, dividerUpdates);
      break;
    }
    case "highlight-box": {
      const boxUpdates: Partial<HighlightBoxBlock> = {
        content: state.content,
        backgroundColor: state.backgroundColor,
        borderColor: state.borderColor,
        padding: state.padding,
        borderRadius: state.borderRadius,
        paddingBottom: state.paddingBottom,
        borderLeft: state.borderLeft,
      };
      Object.assign(updates, boxUpdates);
      break;
    }
  }

  return updates;
}

function createNewBlock(state: BlockState): Block | null {
  switch (state.type) {
    case "title":
      return {
        type: "title",
        id: `block-${Date.now()}`,
        content: state.content,
        level: state.level,
        color: state.color,
        paddingBottom: state.paddingBottom,
      } as TitleBlock;

    case "paragraph":
      return {
        type: "paragraph",
        id: `block-${Date.now()}`,
        content: state.content,
        color: state.color,
        lineHeight: state.lineHeight,
        paddingBottom: state.paddingBottom,
        textAlign: state.textAlign,
      } as ParagraphBlock;

    case "image":
      return {
        type: "image",
        id: `block-${Date.now()}`,
        src: state.src,
        alt: state.alt,
        width: state.width,
        height: state.imageHeight,
        maxWidth: state.maxWidth,
        borderRadius: state.borderRadius,
        paddingBottom: state.paddingBottom,
      } as ImageBlock;

    case "button":
      return {
        type: "button",
        id: `block-${Date.now()}`,
        label: state.label,
        href: state.href,
        backgroundColor: state.backgroundColor,
        textColor: state.textColor,
        padding: state.padding,
        borderRadius: state.borderRadius,
        marginTop: state.marginTop,
        paddingBottom: state.paddingBottom,
        align: state.align,
      } as ButtonBlock;

    case "divider":
      return {
        type: "divider",
        id: `block-${Date.now()}`,
        color: state.color,
        height: state.dividerHeight,
        margin: state.dividerMargin,
      } as DividerBlock;

    case "highlight-box":
      return {
        type: "highlight-box",
        id: `block-${Date.now()}`,
        content: state.content,
        backgroundColor: state.backgroundColor,
        borderColor: state.borderColor,
        padding: state.padding,
        borderRadius: state.borderRadius,
        paddingBottom: state.paddingBottom,
        borderLeft: state.borderLeft,
      } as HighlightBoxBlock;

    default:
      return null;
  }
}
