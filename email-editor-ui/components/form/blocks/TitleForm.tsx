'use client';

import ColorInput from '../ColorInput';
import SelectInput from '../SelectInput';
import NumberInput from '../NumberInput';

interface TitleFormProps {
  color: string;
  level: 'h1' | 'h2' | 'h3';
  paddingBottom: number;
  onColorChange: (value: string) => void;
  onLevelChange: (value: 'h1' | 'h2' | 'h3') => void;
  onPaddingBottomChange: (value: number) => void;
}

export default function TitleForm({
  color,
  level,
  paddingBottom,
  onColorChange,
  onLevelChange,
  onPaddingBottomChange,
}: TitleFormProps) {
  return (
    <>
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
