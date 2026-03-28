'use client';
import { useState, useRef, useCallback } from 'react';
import type { Card, UploadPayload } from '@/types';

const EXAMPLE = `{
  "title": "Spanish Basics",
  "description": "Common vocabulary",
  "emoji": "🇪🇸",
  "cards": [
    { "front": "Hello", "back": "Hola" },
    {
      "front": "What does 'gracias' mean?",
      "back": "Thank you",
      "explanation": "Used to express gratitude. Formal version is 'muchas gracias' (many thanks). Comes from Latin 'gratia' meaning grace or favor.",
      "hint": "Sounds like 'grass-ee-as'"
    }
  ]
}`;

interface UploadModalProps {
  onClose: () => void;
  onUpload: (data: {
    title: string;
    description?: string;
    emoji?: string;
    cards: Card[];
  }) => void;
}

export function UploadModal({ onClose, onUpload }: UploadModalProps) {
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseAndUpload = useCallback(
    (content: string) => {
      setError(null);
      try {
        const parsed: UploadPayload = JSON.parse(content);
        let title = 'Untitled Playlist';
        let description: string | undefined;
        let emoji: string | undefined;
        let cards: Card[];

        if (Array.isArray(parsed)) {
          cards = parsed;
        } else {
          title = parsed.title || title;
          description = parsed.description;
          emoji = parsed.emoji;
          cards = parsed.cards || [];
        }

        if (!Array.isArray(cards) || cards.length === 0) {
          setError('No cards found. Make sure your JSON has a "cards" array.');
          return;
        }

        const valid = cards.filter(
          c =>
            typeof c.front === 'string' &&
            typeof c.back === 'string' &&
            c.front.trim() &&
            c.back.trim(),
        );

        if (valid.length === 0) {
          setError('Cards must have non-empty "front" and "back" string fields.');
          return;
        }

        onUpload({ title, description, emoji, cards: valid });
        onClose();
      } catch {
        setError('Invalid JSON — please check your file format.');
      }
    },
    [onUpload, onClose],
  );

  const handleFile = useCallback(
    (file: File) => {
      if (!file.name.endsWith('.json')) {
        setError('Please upload a .json file.');
        return;
      }
      const reader = new FileReader();
      reader.onload = e => parseAndUpload(e.target?.result as string);
      reader.readAsText(file);
    },
    [parseAndUpload],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Mobile bottom-sheet handle */}
        <div className="sm:hidden flex justify-center py-3">
          <div className="w-10 h-1 bg-stone-200 rounded-full" />
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-stone-800">Upload Playlist</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-50 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={e => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              dragOver
                ? 'border-violet-400 bg-violet-50'
                : 'border-stone-200 hover:border-violet-300 hover:bg-violet-50/40'
            }`}
          >
            <p className="text-3xl mb-2">📁</p>
            <p className="font-semibold text-stone-700 text-sm">Drop your JSON file here</p>
            <p className="text-stone-400 text-xs mt-1">or tap to browse</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={e => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </div>

          {error && (
            <div className="flex gap-2 items-start bg-rose-50 text-rose-600 text-sm rounded-xl p-3">
              <span className="flex-shrink-0 mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Format reference (collapsible) */}
          <details className="group">
            <summary className="cursor-pointer text-xs font-medium text-stone-400 hover:text-violet-600 flex items-center gap-1.5 select-none transition-colors list-none">
              <svg
                className="w-3.5 h-3.5 transition-transform group-open:rotate-90"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
              Expected JSON format
            </summary>
            <div className="mt-2 bg-stone-50 rounded-xl p-3 overflow-x-auto">
              <pre className="text-xs text-stone-500 font-mono whitespace-pre">{EXAMPLE}</pre>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
