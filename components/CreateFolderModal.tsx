'use client';
import { useState, useRef, useEffect } from 'react';

const FOLDER_EMOJIS = ['📁', '📂', '🗂️', '📚', '🎓', '🌍', '🔬', '💡', '🎯', '⚡', '🧠', '🎨'];

export function CreateFolderModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (data: { name: string; emoji: string }) => void;
}) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('📁');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate({ name: trimmed, emoji });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-sm bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 z-10">
        <h2 className="text-lg font-bold text-stone-800 mb-5">New Folder</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Emoji picker */}
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Icon</p>
            <div className="flex flex-wrap gap-2">
              {FOLDER_EMOJIS.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-9 h-9 rounded-xl text-xl flex items-center justify-center transition-all ${
                    emoji === e
                      ? 'bg-violet-100 ring-2 ring-violet-400'
                      : 'bg-stone-50 hover:bg-stone-100'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Name input */}
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Name</p>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Languages, Science…"
              maxLength={40}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-300"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-stone-200 text-stone-500 font-semibold text-sm hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 py-2.5 rounded-xl bg-violet-600 text-white font-semibold text-sm disabled:opacity-40 active:scale-[0.98] transition-all"
            >
              Create Folder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
