'use client';

import ColorInput from '../ColorInput';
import NumberInput from '../NumberInput';

interface DividerFormProps {
  color: string;
  height: number;
  margin: number;
  onColorChange: (value: string) => void;
  onHeightChange: (value: number) => void;
  onMarginChange: (value: number) => void;
}

export default function DividerForm({
  color,
  height,
  margin,
  onColorChange,
  onHeightChange,
  onMarginChange,
}: DividerFormProps) {
  return (
    <>
      <ColorInput
        label="Divider Color"
        value={color}
        onChange={onColorChange}
      />

      <NumberInput
        label="Line Height"
        value={height}
        onChange={onHeightChange}
        min={1}
        max={10}
        unit="px"
      />

      <NumberInput
        label="Vertical Margin"
        value={margin}
        onChange={onMarginChange}
        min={0}
        max={100}
        unit="px"
      />
    </>
  );
}
