'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlaylists } from '@/hooks/usePlaylists';
import { UploadModal } from '@/components/UploadModal';
import { STRIP_GRADIENTS } from '@/lib/colors';
import type { Playlist } from '@/types';

/* ─── PlaylistCard ─────────────────────────────────────────── */

function PlaylistCard({
  playlist,
  onStudy,
  onDelete,
  isSelected,
  isSelectMode,
  onToggleSelect,
}: {
  playlist: Playlist;
  onStudy: () => void;
  onDelete: () => void;
  isSelected: boolean;
  isSelectMode: boolean;
  onToggleSelect: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const strip = STRIP_GRADIENTS[playlist.colorIndex % STRIP_GRADIENTS.length];

  const daysAgo = Math.floor(
    (Date.now() - new Date(playlist.createdAt).getTime()) / 86_400_000,
  );
  const dateStr =
    daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`;

  return (
    <div
      className={`bg-white rounded-2xl border overflow-hidden transition-all ${
        isSelected
          ? 'border-violet-400 ring-2 ring-violet-200 shadow-sm'
          : 'border-stone-100 shadow-sm'
      }`}
    >
      {/* Color strip */}
      <div className={`h-1.5 bg-gradient-to-r ${strip}`} />

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Select checkbox */}
          {isSelectMode && (
            <button
              onClick={onToggleSelect}
              className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                isSelected
                  ? 'bg-violet-600 border-violet-600 text-white'
                  : 'border-stone-300 bg-white'
              }`}
              aria-label={isSelected ? 'Deselect playlist' : 'Select playlist'}
            >
              {isSelected && (
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xl leading-none">{playlist.emoji}</span>
              <h3 className="font-bold text-stone-800 text-sm truncate">{playlist.title}</h3>
            </div>
            {playlist.description && (
              <p className="text-xs text-stone-400 mt-0.5 truncate">{playlist.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs bg-stone-50 border border-stone-100 text-stone-500 px-2 py-0.5 rounded-full">
                {playlist.cards.length} cards
              </span>
              <span className="text-xs text-stone-300">{dateStr}</span>
            </div>
          </div>

          {/* Delete (only outside select mode) */}
          {!isSelectMode &&
            (confirmDelete ? (
              <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs text-stone-400 px-2 py-1 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onDelete}
                  className="text-xs text-rose-500 font-semibold px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-1.5 text-stone-300 hover:text-rose-400 hover:bg-rose-50 rounded-lg transition-colors flex-shrink-0"
                aria-label="Delete playlist"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            ))}
        </div>

        {/* Study / Select button */}
        {isSelectMode ? (
          <button
            onClick={onToggleSelect}
            className={`mt-3 w-full py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] ${
              isSelected
                ? 'bg-violet-50 text-violet-600 border border-violet-200'
                : 'bg-stone-50 text-stone-500 border border-stone-200'
            }`}
          >
            {isSelected ? '✓ Added to Mix' : '+ Add to Mix'}
          </button>
        ) : (
          <button
            onClick={onStudy}
            className={`mt-3 w-full py-2.5 bg-gradient-to-r ${strip} text-white rounded-xl font-semibold text-sm shadow-sm active:scale-[0.98] transition-transform`}
          >
            Study Now →
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── EmptyState ───────────────────────────────────────────── */

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <span className="text-6xl mb-4">📚</span>
      <h2 className="text-xl font-bold text-stone-800 mb-2">No playlists yet</h2>
      <p className="text-stone-400 text-sm mb-8 max-w-xs leading-relaxed">
        Upload a JSON file to create your first flashcard playlist and start studying.
      </p>
      <button
        onClick={onAdd}
        className="px-6 py-3 bg-violet-600 text-white rounded-2xl font-bold shadow-lg shadow-violet-200 active:scale-[0.98] transition-transform"
      >
        + Upload Playlist
      </button>
      <div className="mt-8 w-full max-w-xs text-left bg-white/70 border border-stone-100 rounded-2xl p-4">
        <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
          JSON Format
        </p>
        <pre className="text-xs text-stone-400 font-mono overflow-x-auto">{`{
  "title": "My Cards",
  "emoji": "✨",
  "cards": [
    { "front": "Q?", "back": "A!" }
  ]
}`}</pre>
      </div>
    </div>
  );
}

/* ─── HomeClient ───────────────────────────────────────────── */

export function HomeClient() {
  const router = useRouter();
  const { playlists, addPlaylist, removePlaylist, isHydrated } = usePlaylists();
  const [showUpload, setShowUpload] = useState(false);
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');

  const filtered = query.trim()
    ? playlists.filter(p => {
        const q = query.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.emoji?.includes(q)
        );
      })
    : playlists;

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exitSelectMode = () => {
    setIsSelectMode(false);
    setSelectedIds(new Set());
  };

  const handleStartMix = () => {
    const ids = Array.from(selectedIds).join(',');
    router.push(`/study/mix?ids=${encodeURIComponent(ids)}`);
  };

  const mixCardCount = playlists
    .filter(p => selectedIds.has(p.id))
    .reduce((s, p) => s + p.cards.length, 0);

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-stone-100/80">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-violet-600 rounded-xl flex items-center justify-center shadow-sm shadow-violet-300 text-base">
              ⚡
            </div>
            <h1 className="font-bold text-stone-800 text-base">FlashCards</h1>
          </div>

          <div className="flex items-center gap-2">
            {playlists.length >= 2 && (
              <button
                onClick={() => (isSelectMode ? exitSelectMode() : setIsSelectMode(true))}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                  isSelectMode
                    ? 'bg-stone-100 text-stone-600'
                    : 'bg-violet-50 text-violet-600 border border-violet-100'
                }`}
              >
                {isSelectMode ? 'Cancel' : '⚡ Mix Mode'}
              </button>
            )}
            <button
              onClick={() => setShowUpload(true)}
              className="w-8 h-8 bg-violet-600 text-white rounded-xl flex items-center justify-center shadow-sm shadow-violet-300 active:scale-95 transition-transform"
              aria-label="Upload playlist"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Search bar */}
      {isHydrated && playlists.length > 0 && (
        <div className="bg-white/80 backdrop-blur-md border-b border-stone-100/80">
          <div className="max-w-lg mx-auto px-4 pb-3">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                />
              </svg>
              <input
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search playlists…"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-4 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-300 transition-all"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  aria-label="Clear search"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-lg mx-auto px-4 py-5">
        {!isHydrated ? (
          <div className="flex justify-center pt-20">
            <div className="w-7 h-7 rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" />
          </div>
        ) : playlists.length === 0 ? (
          <EmptyState onAdd={() => setShowUpload(true)} />
        ) : (
          <div className="space-y-3">
            {isSelectMode && (
              <div className="flex items-center gap-2 bg-violet-50 border border-violet-100 rounded-2xl p-3">
                <span>🎯</span>
                <p className="text-sm text-violet-700 font-medium">
                  Select playlists to combine into a speed-run session
                </p>
              </div>
            )}

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <span className="text-4xl mb-3">🔍</span>
                <p className="font-semibold text-stone-600 text-sm">No playlists match</p>
                <p className="text-stone-400 text-xs mt-1">
                  Try a different search term
                </p>
                <button
                  onClick={() => setQuery('')}
                  className="mt-4 text-xs font-semibold text-violet-600 hover:underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              filtered.map(playlist => (
                <PlaylistCard
                  key={playlist.id}
                  playlist={playlist}
                  onStudy={() => router.push(`/study/${playlist.id}`)}
                  onDelete={() => removePlaylist(playlist.id)}
                  isSelected={selectedIds.has(playlist.id)}
                  isSelectMode={isSelectMode}
                  onToggleSelect={() => toggleSelect(playlist.id)}
                />
              ))
            )}
          </div>
        )}
      </main>

      {/* Mix-mode start FAB */}
      {isSelectMode && selectedIds.size > 0 && (
        <div className="fixed bottom-5 inset-x-4 max-w-lg mx-auto z-20">
          <button
            onClick={handleStartMix}
            className="w-full py-4 bg-violet-600 text-white rounded-2xl font-bold shadow-2xl shadow-violet-300/60 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span className="text-lg">⚡</span>
            <span>
              Start Mix · {selectedIds.size}{' '}
              {selectedIds.size === 1 ? 'playlist' : 'playlists'} · {mixCardCount} cards
            </span>
          </button>
        </div>
      )}

      {/* Upload modal */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUpload={data => addPlaylist(data)}
        />
      )}
    </div>
  );
}
