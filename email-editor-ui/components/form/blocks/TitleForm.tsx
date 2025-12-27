'use client';

import ColorInput from '../ColorInput';
import SelectInput from '../SelectInput';
import TextArea from '../TextArea';
import NumberInput from '../NumberInput';

interface TitleFormProps {
  content: string;
  color: string;
  level: 'h1' | 'h2' | 'h3';
  paddingBottom: number;
  onContentChange: (value: string) => void;
  onColorChange: (value: string) => void;
  onLevelChange: (value: 'h1' | 'h2' | 'h3') => void;
  onPaddingBottomChange: (value: number) => void;
}

export default function TitleForm({
  content,
  color,
  level,
  paddingBottom,
  onContentChange,
  onColorChange,
  onLevelChange,
  onPaddingBottomChange,
}: TitleFormProps) {
  return (
    <>
      <TextArea
        label="Heading Text"
        value={content}
        onChange={onContentChange}
        placeholder="e.g., HARI INI! Open Fund NOBI Dana Kripto Indeks Kelas A Resmi Dimulai!"
        rows={3}
        showFormatting={true}
      />

      <SelectInput
        label="Heading Size"
        value={level}
        onChange={(val) => onLevelChange(val as 'h1' | 'h2' | 'h3')}
        options={[
          { value: 'h1', label: 'Large (H1) - 28px' },
          { value: 'h2', label: 'Medium (H2) - 24px' },
          { value: 'h3', label: 'Small (H3) - 20px' },
        ]}
      />

      <ColorInput
        label="Heading Color"
        value={color}
        onChange={onColorChange}
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
