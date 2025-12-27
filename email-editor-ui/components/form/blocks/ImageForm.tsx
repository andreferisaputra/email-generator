'use client';

import TextInput from '../TextInput';
import NumberInput from '../NumberInput';

interface ImageFormProps {
  src: string;
  alt: string;
  width: number;
  height?: number;
  maxWidth: number;
  borderRadius: number;
  paddingBottom: number;
  onSrcChange: (value: string) => void;
  onAltChange: (value: string) => void;
  onWidthChange: (value: number) => void;
  onHeightChange: (value: number | undefined) => void;
  onMaxWidthChange: (value: number) => void;
  onBorderRadiusChange: (value: number) => void;
  onPaddingBottomChange: (value: number) => void;
}

export default function ImageForm({
  src,
  alt,
  width,
  height,
  maxWidth,
  borderRadius,
  paddingBottom,
  onSrcChange,
  onAltChange,
  onWidthChange,
  onHeightChange,
  onMaxWidthChange,
  onBorderRadiusChange,
  onPaddingBottomChange,
}: ImageFormProps) {
  return (
    <>
      <TextInput
        label="Image URL (HTTPS only)"
        value={src}
        onChange={onSrcChange}
        type="url"
        placeholder="https://cdn.example.com/image.jpg"
      />

      <TextInput
        label="Alt Text (Required for accessibility)"
        value={alt}
        onChange={onAltChange}
        placeholder="e.g., Hero image for fund launch"
      />

      <NumberInput
        label="Width"
        value={width}
        onChange={onWidthChange}
        min={50}
        max={600}
        unit="px"
      />

      {height !== undefined && (
        <NumberInput
          label="Height"
          value={height}
          onChange={onHeightChange}
          min={50}
          max={600}
          unit="px"
        />
      )}

      <NumberInput
        label="Max Width"
        value={maxWidth}
        onChange={onMaxWidthChange}
        min={100}
        max={600}
        unit="px"
      />

      <NumberInput
        label="Border Radius"
        value={borderRadius}
        onChange={onBorderRadiusChange}
        min={0}
        max={50}
        unit="px"
      />

      <NumberInput
        label="Padding Bottom"
        value={paddingBottom}
        onChange={onPaddingBottomChange}
        min={0}
        max={100}
        unit="px"
      />
    </>
  );
}
