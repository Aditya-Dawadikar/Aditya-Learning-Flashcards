'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePlaylists } from '@/hooks/usePlaylists';
import { useFolders } from '@/hooks/useFolders';
import { UploadModal } from '@/components/UploadModal';
import { STRIP_GRADIENTS } from '@/lib/colors';
import type { Playlist, Folder } from '@/types';

type SelectMode = 'none' | 'mix' | 'delete';

/* ─── MoveFolderPopover ────────────────────────────────────── */

function MoveFolderPopover({
  folders,
  currentFolderId,
  onMove,
  onClose,
}: {
  folders: Folder[];
  currentFolderId?: string;
  onMove: (folderId: string | null) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const otherFolders = folders.filter(f => f.id !== currentFolderId);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-8 z-30 w-44 bg-white border border-stone-100 rounded-xl shadow-lg py-1 text-sm"
    >
      <p className="px-3 py-1.5 text-xs font-semibold text-stone-400 uppercase tracking-wider">Move to…</p>
      <button
        onClick={() => { onMove(null); onClose(); }}
        className="w-full text-left px-3 py-2 hover:bg-stone-50 text-stone-600 flex items-center gap-2"
      >
        <span>🏠</span> No folder
      </button>
      {otherFolders.map(f => (
        <button
          key={f.id}
          onClick={() => { onMove(f.id); onClose(); }}
          className="w-full text-left px-3 py-2 hover:bg-stone-50 text-stone-600 flex items-center gap-2"
        >
          <span>{f.emoji ?? '📁'}</span>
          <span className="truncate">{f.name}</span>
        </button>
      ))}
      {otherFolders.length === 0 && (
        <p className="px-3 py-2 text-stone-400 text-xs">No other folders</p>
      )}
    </div>
  );
}

/* ─── PlaylistCard ─────────────────────────────────────────── */

function PlaylistCard({
  playlist,
  folders,
  onStudy,
  onDelete,
  onMove,
  selectMode,
  isSelected,
  onToggleSelect,
}: {
  playlist: Playlist;
  folders: Folder[];
  onStudy: () => void;
  onDelete: () => void;
  onMove: (folderId: string | null) => void;
  selectMode: SelectMode;
  isSelected: boolean;
  onToggleSelect: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showMove, setShowMove] = useState(false);
  const strip = STRIP_GRADIENTS[playlist.colorIndex % STRIP_GRADIENTS.length];

  const daysAgo = Math.floor(
    (Date.now() - new Date(playlist.createdAt).getTime()) / 86_400_000,
  );
  const dateStr =
    daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo}d ago`;

  const isMixMode = selectMode === 'mix';
  const isDeleteMode = selectMode === 'delete';
  const isAnySelectMode = isMixMode || isDeleteMode;

  const checkboxColor = isMixMode
    ? isSelected
      ? 'bg-violet-600 border-violet-600 text-white'
      : 'border-stone-300 bg-white'
    : isSelected
    ? 'bg-rose-500 border-rose-500 text-white'
    : 'border-stone-300 bg-white';

  return (
    <div
      className={`bg-white rounded-2xl border overflow-hidden transition-all ${
        isSelected && isMixMode
          ? 'border-violet-400 ring-2 ring-violet-200 shadow-sm'
          : isSelected && isDeleteMode
          ? 'border-rose-400 ring-2 ring-rose-200 shadow-sm'
          : 'border-stone-100 shadow-sm'
      }`}
    >
      <div className={`h-1.5 bg-gradient-to-r ${strip}`} />

      <div className="p-4">
        <div className="flex items-start gap-3">
          {isAnySelectMode && (
            <button
              onClick={onToggleSelect}
              className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${checkboxColor}`}
              aria-label={isSelected ? 'Deselect' : 'Select'}
            >
              {isSelected && (
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          )}

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

          {/* Action buttons — normal mode only */}
          {selectMode === 'none' && (
            <div className="flex items-center gap-0.5 flex-shrink-0 ml-1">
              <div className="relative">
                <button
                  onClick={() => setShowMove(v => !v)}
                  className="p-1.5 text-stone-300 hover:text-violet-400 hover:bg-violet-50 rounded-lg transition-colors"
                  aria-label="Move to folder"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                  </svg>
                </button>
                {showMove && (
                  <MoveFolderPopover
                    folders={folders}
                    currentFolderId={playlist.folderId}
                    onMove={onMove}
                    onClose={() => setShowMove(false)}
                  />
                )}
              </div>

              {confirmDelete ? (
                <div className="flex items-center gap-1">
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
                  className="p-1.5 text-stone-300 hover:text-rose-400 hover:bg-rose-50 rounded-lg transition-colors"
                  aria-label="Delete playlist"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Bottom action button */}
        {isMixMode ? (
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
        ) : isDeleteMode ? (
          <button
            onClick={onToggleSelect}
            className={`mt-3 w-full py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.98] ${
              isSelected
                ? 'bg-rose-50 text-rose-500 border border-rose-200'
                : 'bg-stone-50 text-stone-500 border border-stone-200'
            }`}
          >
            {isSelected ? '✓ Marked for deletion' : '+ Select'}
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

/* ─── BulkDeleteConfirm ────────────────────────────────────── */

function BulkDeleteConfirm({
  count,
  onConfirm,
  onCancel,
}: {
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="fixed bottom-5 inset-x-4 max-w-lg mx-auto z-20">
        <div className="bg-white border border-rose-200 rounded-2xl shadow-2xl p-4">
          <p className="text-sm font-semibold text-stone-800 mb-1">
            Delete {count} {count === 1 ? 'playlist' : 'playlists'}?
          </p>
          <p className="text-xs text-stone-400 mb-4">This cannot be undone.</p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirming(false)}
              className="flex-1 py-2.5 bg-stone-100 text-stone-600 rounded-xl font-semibold text-sm hover:bg-stone-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 bg-rose-500 text-white rounded-xl font-semibold text-sm shadow-sm active:scale-[0.98] transition-all"
            >
              Delete {count}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-5 inset-x-4 max-w-lg mx-auto z-20">
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="py-4 px-5 bg-white border border-stone-200 text-stone-600 rounded-2xl font-bold shadow-lg active:scale-[0.98] transition-all text-sm"
        >
          Cancel
        </button>
        <button
          onClick={() => setConfirming(true)}
          className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-bold shadow-2xl shadow-rose-300/60 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete {count} {count === 1 ? 'playlist' : 'playlists'}
        </button>
      </div>
    </div>
  );
}

/* ─── FolderClient ─────────────────────────────────────────── */

export function FolderClient({ folderId }: { folderId: string }) {
  const router = useRouter();
  const { playlists, addPlaylist, removePlaylist, movePlaylist, isHydrated } = usePlaylists();
  const { folders, getFolder, isHydrated: foldersHydrated } = useFolders();
  const [showUpload, setShowUpload] = useState(false);
  const [selectMode, setSelectMode] = useState<SelectMode>('none');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');

  const folder = getFolder(folderId);
  const folderPlaylists = playlists.filter(p => p.folderId === folderId);

  const filtered = query.trim()
    ? folderPlaylists.filter(p => {
        const q = query.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.emoji?.includes(q)
        );
      })
    : folderPlaylists;

  const allHydrated = isHydrated && foldersHydrated;

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const exitSelectMode = () => {
    setSelectMode('none');
    setSelectedIds(new Set());
  };

  const enterMode = (mode: SelectMode) => {
    setSelectedIds(new Set());
    setSelectMode(mode);
  };

  const handleStartMix = () => {
    const ids = Array.from(selectedIds).join(',');
    router.push(`/study/mix?ids=${encodeURIComponent(ids)}`);
  };

  const handleBulkDelete = () => {
    selectedIds.forEach(id => removePlaylist(id));
    exitSelectMode();
  };

  const mixCardCount = folderPlaylists
    .filter(p => selectedIds.has(p.id))
    .reduce((s, p) => s + p.cards.length, 0);

  if (allHydrated && !folder) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <span className="text-5xl">📁</span>
        <p className="font-semibold text-stone-600">Folder not found</p>
        <button
          onClick={() => router.push('/')}
          className="text-sm text-violet-600 font-semibold hover:underline"
        >
          ← Back to home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-stone-100/80">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-stone-100 transition-colors text-stone-500"
            aria-label="Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex-1 flex items-center gap-2 min-w-0">
            <span className="text-xl leading-none">{folder?.emoji ?? '📁'}</span>
            <h1 className="font-bold text-stone-800 text-base truncate">
              {folder?.name ?? '…'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {selectMode !== 'none' ? (
              <button
                onClick={exitSelectMode}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-stone-100 text-stone-600 transition-all"
              >
                Cancel
              </button>
            ) : (
              <>
                {folderPlaylists.length >= 2 && (
                  <button
                    onClick={() => enterMode('mix')}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl bg-violet-50 text-violet-600 border border-violet-100 transition-all"
                  >
                    ⚡ Mix
                  </button>
                )}
                {folderPlaylists.length >= 1 && (
                  <button
                    onClick={() => enterMode('delete')}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-rose-50 text-rose-400 border border-rose-100 hover:bg-rose-100 transition-all"
                    aria-label="Select to delete"
                    title="Select to delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => setShowUpload(true)}
                  className="w-8 h-8 bg-violet-600 text-white rounded-xl flex items-center justify-center shadow-sm shadow-violet-300 active:scale-95 transition-transform"
                  aria-label="Upload playlist"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Search bar */}
        {folderPlaylists.length > 0 && selectMode === 'none' && (
          <div className="max-w-lg mx-auto px-4 pb-3">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={`Search in ${folder?.name ?? 'folder'}…`}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-9 pr-9 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-300 transition-all"
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
        )}

        {/* Select mode hint */}
        {selectMode !== 'none' && (
          <div className={`max-w-lg mx-auto px-4 pb-3`}>
            <div className={`flex items-center gap-2 rounded-xl p-3 ${
              selectMode === 'mix'
                ? 'bg-violet-50 border border-violet-100'
                : 'bg-rose-50 border border-rose-100'
            }`}>
              <span>{selectMode === 'mix' ? '🎯' : '🗑️'}</span>
              <p className={`text-sm font-medium ${
                selectMode === 'mix' ? 'text-violet-700' : 'text-rose-700'
              }`}>
                {selectMode === 'mix'
                  ? `Select playlists to mix · ${selectedIds.size} selected`
                  : `Select playlists to delete · ${selectedIds.size} selected`}
              </p>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-lg mx-auto px-4 py-5">
        {!allHydrated ? (
          <div className="flex justify-center pt-20">
            <div className="w-7 h-7 rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" />
          </div>
        ) : folderPlaylists.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <span className="text-5xl mb-4">📂</span>
            <h2 className="text-lg font-bold text-stone-800 mb-2">Empty folder</h2>
            <p className="text-stone-400 text-sm mb-6 max-w-xs leading-relaxed">
              Upload a playlist or move one here from the home screen.
            </p>
            <button
              onClick={() => setShowUpload(true)}
              className="px-6 py-3 bg-violet-600 text-white rounded-2xl font-bold shadow-lg shadow-violet-200 active:scale-[0.98] transition-transform"
            >
              + Upload Playlist
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <span className="text-4xl mb-3">🔍</span>
            <p className="font-semibold text-stone-600 text-sm">No playlists match</p>
            <button
              onClick={() => setQuery('')}
              className="mt-3 text-xs font-semibold text-violet-600 hover:underline"
            >
              Clear search
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(playlist => (
              <PlaylistCard
                key={playlist.id}
                playlist={playlist}
                folders={folders}
                onStudy={() => router.push(`/study/${playlist.id}`)}
                onDelete={() => removePlaylist(playlist.id)}
                onMove={newFolderId => movePlaylist(playlist.id, newFolderId)}
                selectMode={selectMode}
                isSelected={selectedIds.has(playlist.id)}
                onToggleSelect={() => toggleSelect(playlist.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Mix FAB */}
      {selectMode === 'mix' && selectedIds.size > 0 && (
        <div className="fixed bottom-5 inset-x-4 max-w-lg mx-auto z-20">
          <div className="flex gap-2">
            <button
              onClick={exitSelectMode}
              className="py-4 px-5 bg-white border border-stone-200 text-stone-600 rounded-2xl font-bold shadow-lg active:scale-[0.98] transition-all text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleStartMix}
              className="flex-1 py-4 bg-violet-600 text-white rounded-2xl font-bold shadow-2xl shadow-violet-300/60 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span className="text-lg">⚡</span>
              <span>
                Start Mix · {selectedIds.size}{' '}
                {selectedIds.size === 1 ? 'playlist' : 'playlists'} · {mixCardCount} cards
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Bulk delete FAB */}
      {selectMode === 'delete' && selectedIds.size > 0 && (
        <BulkDeleteConfirm
          count={selectedIds.size}
          onConfirm={handleBulkDelete}
          onCancel={exitSelectMode}
        />
      )}

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUpload={data => addPlaylist({ ...data, folderId })}
        />
      )}
    </div>
  );
}
