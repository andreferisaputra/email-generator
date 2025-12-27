"use client";

import { useState } from "react";
import {
  TemplateType,
  EmailDocument,
  Block,
  createEmail,
  getValidationSummary,
} from "email-editor-core";
import BlockList from "./BlockList";
import BlockForm from "./BlockForm";
import Preview from "./Preview";
import ExportButtons from "./ExportButtons";

interface EmailEditorProps {
  template: TemplateType;
  onBack: () => void;
}

export default function EmailEditor({ template, onBack }: EmailEditorProps) {
  const [email, setEmail] = useState<EmailDocument | null>(() =>
    createEmail(template, [])
  );
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const validation = email ? getValidationSummary(email, false) : null;

  const handleAddBlock = (newBlock: Block) => {
    if (!email) return;
    const updated: EmailDocument = {
      ...email,
      body: {
        blocks: [...email.body.blocks, newBlock],
      },
      blocks: [...email.blocks, newBlock],
    };
    setEmail(updated);
    setSelectedBlockId(null);
  };

  const handleUpdateBlock = (blockId: string, updates: Partial<Block>) => {
    if (!email) return;
    const updated: EmailDocument = {
      ...email,
      body: {
        blocks: email.body.blocks.map((b) =>
          b.id === blockId ? ({ ...b, ...updates } as Block) : b
        ),
      },
      blocks: email.blocks.map((b) =>
        b.id === blockId ? ({ ...b, ...updates } as Block) : b
      ),
    };
    setEmail(updated);
  };

  const handleRemoveBlock = (blockId: string) => {
    if (!email) return;
    const updated: EmailDocument = {
      ...email,
      body: {
        blocks: email.body.blocks.filter((b) => b.id !== blockId),
      },
      blocks: email.blocks.filter((b) => b.id !== blockId),
    };
    setEmail(updated);
    setSelectedBlockId(null);
  };

  if (!email) return <div>Loading...</div>;

  const selectedBlock = email.body.blocks.find((b) => b.id === selectedBlockId);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {template === "open-fund" && "Open Fund Email"}
            {template === "close-fund" && "Close Fund Email"}
            {template === "newsletter" && "Newsletter Email"}
          </h2>
          <p className="text-sm text-gray-600">
            {template === "open-fund" &&
              "Marketing email for fund launch announcement"}
            {template === "close-fund" &&
              "Notification email for fund closing and next phase"}
            {template === "newsletter" &&
              "Information and performance update for fund subscribers"}
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back to Templates
        </button>
      </div>

      {validation && validation.errorCount > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-semibold text-red-900">
            ⚠️ {validation.errorCount} validation error
            {validation.errorCount > 1 ? "s" : ""} - Please fix before exporting
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Editor Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-blue-900 mb-1">
              ℹ️ FIXED SECTIONS
            </p>
            <p className="text-xs text-blue-800">
              Email header, help section, compliance, and footer are
              automatically included and cannot be edited here.
            </p>
          </div>

          <BlockList
            blocks={email.body.blocks}
            selectedId={selectedBlockId}
            onSelect={setSelectedBlockId}
            onRemove={handleRemoveBlock}
          />

          {selectedBlock ? (
            <BlockForm
              block={selectedBlock}
              onUpdate={handleUpdateBlock}
              onAddNew={handleAddBlock}
            />
          ) : (
            <BlockForm onAddNew={handleAddBlock} />
          )}
        </div>

        {/* Preview Section */}
        <div className="flex flex-col gap-8">
          <Preview email={email} />
          <ExportButtons email={email} />
        </div>
      </div>
    </div>
  );
}
