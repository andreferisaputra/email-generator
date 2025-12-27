'use client';

import type { Block } from 'email-editor-core';

interface BlockListProps {
  blocks: Block[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}

const blockTypeLabels: Record<string, string> = {
  title: 'Heading',
  paragraph: 'Text',
  image: 'Image',
  button: 'Call-to-Action',
  divider: 'Separator',
  'highlight-box': 'Featured Box',
};

export default function BlockList({
  blocks,
  selectedId,
  onSelect,
  onRemove,
}: BlockListProps) {
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900">Email Content</h3>
      {blocks.length === 0 ? (
        <p className="text-sm text-gray-500 py-4">No content blocks added yet. Start by adding your first content block below.</p>
      ) : (
        <div className="space-y-2">
          {blocks.map((block, idx) => {
            let preview = '';
            if ('content' in block) {
              preview = (block.content as string).substring(0, 40);
              if ((block.content as string).length > 40) preview += '...';
            } else if ('label' in block) {
              preview = (block.label as string);
            } else if ('src' in block) {
              preview = (block.src as string);
            }

            return (
              <div
                key={block.id}
                onClick={() => onSelect(block.id)}
                className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedId === block.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 overflow-hidden">
                    <p className="font-medium text-gray-900">
                      {idx + 1}. {blockTypeLabels[block.type]}
                    </p>
                    {preview && <p className="text-xs text-gray-600 mt-1">{preview}</p>}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(block.id);
                    }}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
