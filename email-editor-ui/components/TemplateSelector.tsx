'use client';

import type { TemplateType } from 'email-editor-core';

interface TemplateSelectorProps {
  onSelect: (template: TemplateType) => void;
}

const templates = [
  {
    id: 'open-fund' as TemplateType,
    name: 'Open Fund',
    description: 'Marketing email announcing fund launch with strong call-to-action. Includes hero image, promotional content, and investment button.',
    usage: 'Min 1 Title, 2-5 Paragraphs, 1-2 Buttons, optional Highlight Box',
  },
  {
    id: 'close-fund' as TemplateType,
    name: 'Close Fund',
    description: 'Notification email informing users about fund closing. Formal tone with next phase information and support details.',
    usage: 'Optional Title, 2-4 Paragraphs, Help section, Compliance required',
  },
  {
    id: 'newsletter' as TemplateType,
    name: 'Newsletter',
    description: 'Educational content featuring fund performance, market insights, and updates. Supports rich content with multiple sections.',
    usage: 'Min 1 Title, 3-8 Paragraphs, 1+ Images for charts/graphics, optional CTAs',
  },
];

export default function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Generator</h1>
        <p className="text-gray-600">Create professional email campaigns. Choose a template to get started.</p>
      </div>

      <div className="grid gap-4">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template.id)}
            className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-lg">{template.name}</h3>
                <p className="text-sm text-gray-600 mt-2">{template.description}</p>
                <p className="text-xs text-gray-500 mt-3 bg-gray-50 p-2 rounded">
                  <span className="font-semibold">Content requirements:</span> {template.usage}
                </p>
              </div>
              <div className="ml-4 text-blue-600">→</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
