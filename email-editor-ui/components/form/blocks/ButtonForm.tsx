'use client';

import ColorInput from '../ColorInput';
import SelectInput from '../SelectInput';
import TextInput from '../TextInput';
import NumberInput from '../NumberInput';

interface ButtonFormProps {
  label: string;
  href: string;
  backgroundColor: string;
  textColor: string;
  padding: string;
  borderRadius: number;
  marginTop: number;
  paddingBottom: number;
  align: 'left' | 'center' | 'right';
  onLabelChange: (value: string) => void;
  onHrefChange: (value: string) => void;
  onBackgroundColorChange: (value: string) => void;
  onTextColorChange: (value: string) => void;
  onPaddingChange: (value: string) => void;
  onBorderRadiusChange: (value: number) => void;
  onMarginTopChange: (value: number) => void;
  onPaddingBottomChange: (value: number) => void;
  onAlignChange: (value: 'left' | 'center' | 'right') => void;
}

export default function ButtonForm({
  label,
  href,
  backgroundColor,
  textColor,
  padding,
  borderRadius,
  marginTop,
  paddingBottom,
  align,
  onLabelChange,
  onHrefChange,
  onBackgroundColorChange,
  onTextColorChange,
  onPaddingChange,
  onBorderRadiusChange,
  onMarginTopChange,
  onPaddingBottomChange,
  onAlignChange,
}: ButtonFormProps) {
  return (
    <>
      <TextInput
        label="Button Text"
        value={label}
        onChange={onLabelChange}
        placeholder="e.g., Investasi Sekarang"
      />

      <TextInput
        label="Button Link (URL)"
        value={href}
        onChange={onHrefChange}
        type="url"
        placeholder="https://app.nobi.id/explore/..."
      />

      <ColorInput
        label="Background Color"
        value={backgroundColor}
        onChange={onBackgroundColorChange}
      />

      <ColorInput
        label="Text Color"
        value={textColor}
        onChange={onTextColorChange}
      />

      <TextInput
        label="Padding (e.g., '10px 16px')"
        value={padding}
        onChange={onPaddingChange}
        placeholder="10px 16px"
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
        label="Margin Top"
        value={marginTop}
        onChange={onMarginTopChange}
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

      <SelectInput
        label="Alignment"
        value={align}
        onChange={(val) => onAlignChange(val as 'left' | 'center' | 'right')}
        options={[
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
        ]}
      />
    </>
  );
}
