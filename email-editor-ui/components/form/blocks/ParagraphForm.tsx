'use client';

import ColorInput from '../ColorInput';
import SelectInput from '../SelectInput';
import TextArea from '../TextArea';
import NumberInput from '../NumberInput';

interface ParagraphFormProps {
  content: string;
  color: string;
  lineHeight: number;
  paddingBottom: number;
  textAlign: 'left' | 'center' | 'right';
  onContentChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onLineHeightChange: (value: number) => void;
  onPaddingBottomChange: (value: number) => void;
  onTextAlignChange: (value: 'left' | 'center' | 'right') => void;
}

export default function ParagraphForm({
  content,
  color,
  lineHeight,
  paddingBottom,
  textAlign,
  onContentChange,
  onColorChange,
  onLineHeightChange,
  onPaddingBottomChange,
  onTextAlignChange,
}: ParagraphFormProps) {
  return (
    <>
      <TextArea
        label="Paragraph Content"
        value={content}
        onChange={onContentChange}
        placeholder="e.g., Kabar gembira untuk investor di Indonesia! Open fund NOBI Dana Kripto Indeks Kelas A sudah dimulai hari ini."
        rows={4}
        showFormatting={true}
      />

      <ColorInput
        label="Text Color"
        value={color}
        onChange={onColorChange}
      />

      <NumberInput
        label="Line Height"
        value={lineHeight}
        onChange={onLineHeightChange}
        min={1}
        max={3}
        unit="multiplier"
      />

      <SelectInput
        label="Text Alignment"
        value={textAlign}
        onChange={(val) => onTextAlignChange(val as 'left' | 'center' | 'right')}
        options={[
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
        ]}
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
