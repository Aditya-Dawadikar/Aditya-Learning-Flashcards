'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlaylists } from '@/hooks/usePlaylists';
import { useFolders } from '@/hooks/useFolders';
import { UploadModal } from '@/components/UploadModal';
import { CreateFolderModal } from '@/components/CreateFolderModal';
import { STRIP_GRADIENTS } from '@/lib/colors';
import type { Playlist, Folder } from '@/types';

/* ─── FolderCard ───────────────────────────────────────────── */

function FolderCard({
  folder,
  playlistCount,
  onOpen,
  onDelete,
  isSelectMode,
  isSelected,
  onToggleSelect,
}: {
  folder: Folder;
  playlistCount: number;
  onOpen: () => void;
  onDelete: () => void;
  isSelectMode: boolean;
  isSelected: boolean;
  onToggleSelect: () => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div
      className={`bg-white rounded-2xl border overflow-hidden flex flex-col transition-all ${
        isSelected
          ? 'border-rose-400 ring-2 ring-rose-200 shadow-sm'
          : 'border-stone-100 shadow-sm'
      }`}
    >
      <button
        onClick={isSelectMode ? onToggleSelect : onOpen}
        className="flex-1 p-5 text-left active:bg-stone-50 transition-colors"
      >
        <div className="flex items-start gap-2">
          {isSelectMode && (
            <div
              className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                isSelected
                  ? 'bg-rose-500 border-rose-500 text-white'
                  : 'border-stone-300 bg-white'
              }`}
            >
              {isSelected && (
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <span className="text-3xl leading-none block mb-3">{folder.emoji ?? '📁'}</span>
            <p className="font-bold text-stone-800 text-sm truncate">{folder.name}</p>
            <p className="text-xs text-stone-400 mt-1">
              {playlistCount} {playlistCount === 1 ? 'playlist' : 'playlists'}
            </p>
          </div>
        </div>
      </button>

      {/* Delete row — hidden in select mode */}
      {!isSelectMode && (
        <div className="border-t border-stone-50 px-3 py-1.5 flex justify-end">
          {confirmDelete ? (
            playlistCount > 0 ? (
              <div className="flex items-center gap-2 py-0.5">
                <p className="text-xs text-amber-600 font-medium">
                  Move {playlistCount} playlist{playlistCount > 1 ? 's' : ''} out first
                </p>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-xs text-stone-400 px-2 py-0.5 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  OK
                </button>
              </div>
            ) : (
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
            )
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1 text-stone-300 hover:text-rose-400 transition-colors"
              aria-label="Delete folder"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── SearchResultCard ─────────────────────────────────────── */

function SearchResultCard({
  playlist,
  folderLabel,
  folderEmoji,
  onStudy,
}: {
  playlist: Playlist;
  folderLabel: string;
  folderEmoji: string;
  onStudy: () => void;
}) {
  const strip = STRIP_GRADIENTS[playlist.colorIndex % STRIP_GRADIENTS.length];

  return (
    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
      <div className={`h-1 bg-gradient-to-r ${strip}`} />
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl leading-none">{playlist.emoji}</span>
              <h3 className="font-bold text-stone-800 text-sm truncate">{playlist.title}</h3>
              <span className="inline-flex items-center gap-1 text-xs bg-stone-50 border border-stone-100 text-stone-500 px-2 py-0.5 rounded-full flex-shrink-0">
                <span>{folderEmoji}</span>
                <span className="truncate max-w-[100px]">{folderLabel}</span>
              </span>
            </div>
            {playlist.description && (
              <p className="text-xs text-stone-400 mt-1 truncate">{playlist.description}</p>
            )}
            <span className="inline-block text-xs bg-stone-50 border border-stone-100 text-stone-500 px-2 py-0.5 rounded-full mt-2">
              {playlist.cards.length} cards
            </span>
          </div>
        </div>
        <button
          onClick={onStudy}
          className={`mt-3 w-full py-2.5 bg-gradient-to-r ${strip} text-white rounded-xl font-semibold text-sm shadow-sm active:scale-[0.98] transition-transform`}
        >
          Study Now →
        </button>
      </div>
    </div>
  );
}

/* ─── BulkDeleteBar ────────────────────────────────────────── */

function BulkDeleteBar({
  selectedCount,
  blockedCount,
  onConfirm,
  onCancel,
}: {
  selectedCount: number;
  blockedCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const deletableCount = selectedCount - blockedCount;

  if (confirming) {
    return (
      <div className="fixed bottom-5 inset-x-4 max-w-lg mx-auto z-20">
        <div className="bg-white border border-rose-200 rounded-2xl shadow-2xl p-4">
          <p className="text-sm font-semibold text-stone-800 mb-1">
            Delete {deletableCount} empty {deletableCount === 1 ? 'folder' : 'folders'}?
          </p>
          {blockedCount > 0 && (
            <p className="text-xs text-amber-600 mb-3">
              {blockedCount} non-empty {blockedCount === 1 ? 'folder' : 'folders'} will be skipped.
            </p>
          )}
          <p className="text-xs text-stone-400 mb-4">This cannot be undone.</p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirming(false)}
              className="flex-1 py-2.5 bg-stone-100 text-stone-600 rounded-xl font-semibold text-sm transition-colors hover:bg-stone-200"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 bg-rose-500 text-white rounded-xl font-semibold text-sm shadow-sm active:scale-[0.98] transition-all"
            >
              Delete {deletableCount}
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
          disabled={deletableCount === 0}
          className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-bold shadow-2xl shadow-rose-300/60 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span>
            Delete {selectedCount} {selectedCount === 1 ? 'folder' : 'folders'}
            {blockedCount > 0 && ` (${blockedCount} non-empty)`}
          </span>
        </button>
      </div>
    </div>
  );
}

/* ─── EmptyState ───────────────────────────────────────────── */

function EmptyState({ onNewFolder }: { onNewFolder: () => void }) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <span className="text-6xl mb-4">📂</span>
      <h2 className="text-xl font-bold text-stone-800 mb-2">No folders yet</h2>
      <p className="text-stone-400 text-sm mb-8 max-w-xs leading-relaxed">
        Create a folder to organise your study playlists — like a drive for your study material.
      </p>
      <button
        onClick={onNewFolder}
        className="px-6 py-3 bg-violet-600 text-white rounded-2xl font-bold shadow-lg shadow-violet-200 active:scale-[0.98] transition-transform"
      >
        + New Folder
      </button>
    </div>
  );
}

/* ─── HomeClient ───────────────────────────────────────────── */

export function HomeClient() {
  const router = useRouter();
  const { playlists, addPlaylist, isHydrated } = usePlaylists();
  const { folders, addFolder, removeFolder, isHydrated: foldersHydrated } = useFolders();
  const [showUpload, setShowUpload] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [query, setQuery] = useState('');
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const allHydrated = isHydrated && foldersHydrated;

  const isSearching = query.trim().length > 0;

  const searchResults = isSearching
    ? playlists.filter(p => {
        const q = query.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.emoji?.includes(q)
        );
      })
    : [];

  const getFolderInfo = (folderId?: string): { label: string; emoji: string } => {
    if (!folderId) return { label: 'Unfiled', emoji: '📭' };
    const f = folders.find(x => x.id === folderId);
    return f ? { label: f.name, emoji: f.emoji ?? '📁' } : { label: 'Unfiled', emoji: '📭' };
  };

  const playlistCountFor = (folderId: string) =>
    playlists.filter(p => p.folderId === folderId).length;

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

  const handleBulkDelete = () => {
    // Only delete empty folders
    selectedIds.forEach(id => {
      if (playlistCountFor(id) === 0) removeFolder(id);
    });
    exitSelectMode();
  };

  const blockedCount = Array.from(selectedIds).filter(
    id => playlistCountFor(id) > 0,
  ).length;

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
            {allHydrated && folders.length > 0 && !isSearching && (
              <button
                onClick={() => (isSelectMode ? exitSelectMode() : setIsSelectMode(true))}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all ${
                  isSelectMode
                    ? 'bg-stone-100 text-stone-600'
                    : 'bg-rose-50 text-rose-500 border border-rose-100'
                }`}
              >
                {isSelectMode ? 'Cancel' : 'Select'}
              </button>
            )}
            {!isSelectMode && (
              <>
                <button
                  onClick={() => setShowCreateFolder(true)}
                  className="w-8 h-8 bg-stone-100 text-stone-500 rounded-xl flex items-center justify-center hover:bg-stone-200 active:scale-95 transition-all"
                  aria-label="New folder"
                  title="New folder"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  </svg>
                </button>
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
        {allHydrated && !isSelectMode && (
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
                placeholder="Search all playlists…"
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
      </header>

      {/* Main content */}
      <main className="max-w-lg mx-auto px-4 py-5">
        {!allHydrated ? (
          <div className="flex justify-center pt-20">
            <div className="w-7 h-7 rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" />
          </div>
        ) : isSearching ? (
          /* ── Search results ── */
          <div>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">
              {searchResults.length === 0
                ? 'No results'
                : `${searchResults.length} result${searchResults.length === 1 ? '' : 's'}`}
            </p>
            {searchResults.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-center">
                <span className="text-4xl mb-3">🔍</span>
                <p className="font-semibold text-stone-600 text-sm">No playlists match</p>
                <p className="text-stone-400 text-xs mt-1">Try a different search term</p>
                <button
                  onClick={() => setQuery('')}
                  className="mt-4 text-xs font-semibold text-violet-600 hover:underline"
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {searchResults.map(playlist => {
                  const { label, emoji } = getFolderInfo(playlist.folderId);
                  return (
                    <SearchResultCard
                      key={playlist.id}
                      playlist={playlist}
                      folderLabel={label}
                      folderEmoji={emoji}
                      onStudy={() => router.push(`/study/${playlist.id}`)}
                    />
                  );
                })}
              </div>
            )}
          </div>
        ) : folders.length === 0 ? (
          /* ── No folders ── */
          <EmptyState onNewFolder={() => setShowCreateFolder(true)} />
        ) : (
          /* ── Folder grid ── */
          <div>
            <div className="flex items-center justify-between mb-3">
              {isSelectMode ? (
                <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                  {selectedIds.size === 0
                    ? 'Tap folders to select'
                    : `${selectedIds.size} selected`}
                </p>
              ) : (
                <>
                  <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                    {folders.length} {folders.length === 1 ? 'folder' : 'folders'}
                  </p>
                  <button
                    onClick={() => setShowCreateFolder(true)}
                    className="text-xs text-violet-600 font-semibold hover:underline"
                  >
                    + New folder
                  </button>
                </>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {folders.map(folder => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  playlistCount={playlistCountFor(folder.id)}
                  onOpen={() => router.push(`/folders/${folder.id}`)}
                  onDelete={() => removeFolder(folder.id)}
                  isSelectMode={isSelectMode}
                  isSelected={selectedIds.has(folder.id)}
                  onToggleSelect={() => toggleSelect(folder.id)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Bulk delete FAB */}
      {isSelectMode && selectedIds.size > 0 && (
        <BulkDeleteBar
          selectedCount={selectedIds.size}
          blockedCount={blockedCount}
          onConfirm={handleBulkDelete}
          onCancel={exitSelectMode}
        />
      )}

      {/* Modals */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUpload={data => addPlaylist(data)}
        />
      )}
      {showCreateFolder && (
        <CreateFolderModal
          onClose={() => setShowCreateFolder(false)}
          onCreate={data => addFolder(data)}
        />
      )}
    </div>
  );
}
