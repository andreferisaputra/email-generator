'use client';

import ColorInput from '../ColorInput';
import NumberInput from '../NumberInput';

interface HighlightBoxFormProps {
  backgroundColor: string;
  borderColor: string;
  padding: string;
  borderRadius: number;
  paddingBottom: number;
  borderLeft: boolean;
  onBackgroundColorChange: (value: string) => void;
  onBorderColorChange: (value: string) => void;
  onPaddingChange: (value: string) => void;
  onBorderRadiusChange: (value: number) => void;
  onPaddingBottomChange: (value: number) => void;
  onBorderLeftChange: (value: boolean) => void;
}

export default function HighlightBoxForm({
  backgroundColor,
  borderColor,
  padding,
  borderRadius,
  paddingBottom,
  borderLeft,
  onBackgroundColorChange,
  onBorderColorChange,
  onPaddingChange,
  onBorderRadiusChange,
  onPaddingBottomChange,
  onBorderLeftChange,
}: HighlightBoxFormProps) {
  return (
    <>
      <ColorInput
        label="Background Color"
        value={backgroundColor}
        onChange={onBackgroundColorChange}
      />

      <ColorInput
        label="Border Color"
        value={borderColor}
        onChange={onBorderColorChange}
      />

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={borderLeft}
            onChange={(e) => onBorderLeftChange(e.target.checked)}
            className="w-4 h-4 border border-gray-300 rounded cursor-pointer"
          />
          Left Border Accent
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Padding (e.g., 20px)
        </label>
        <input
          type="text"
          value={padding}
          onChange={(e) => onPaddingChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="20px"
        />
      </div>

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
