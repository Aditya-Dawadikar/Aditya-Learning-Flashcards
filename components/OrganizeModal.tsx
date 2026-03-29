'use client';
import { useEffect } from 'react';
import type { Folder, Playlist } from '@/types';

interface OrganizeModalProps {
  playlist: Playlist;
  folders: Folder[];
  onMove: (folderId: string | null) => void;
  onClose: () => void;
}

export function OrganizeModal({ playlist, folders, onMove, onClose }: OrganizeModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const currentFolder = folders.find(f => f.id === playlist.folderId);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />

      {/* Sheet */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
        {/* Handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-stone-200 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 pt-3 pb-4 border-b border-stone-100">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest mb-1.5">
                Organize
              </p>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xl leading-none flex-shrink-0">{playlist.emoji}</span>
                <h3 className="font-bold text-stone-800 text-base truncate">{playlist.title}</h3>
              </div>
              <p className="text-xs text-stone-400 mt-1.5">
                Currently in:{' '}
                <span className="font-medium text-stone-500">
                  {currentFolder
                    ? `${currentFolder.emoji ?? '📁'} ${currentFolder.name}`
                    : '🏠 Root'}
                </span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors"
              aria-label="Close"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Location list */}
        <div className="overflow-y-auto max-h-72 py-1.5">
          {/* Root option */}
          <button
            onClick={() => { onMove(null); onClose(); }}
            className={`w-full flex items-center gap-3 px-5 py-3 transition-colors text-left ${
              !playlist.folderId
                ? 'bg-violet-50'
                : 'hover:bg-stone-50'
            }`}
          >
            <span className="text-xl leading-none flex-shrink-0">🏠</span>
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-sm ${!playlist.folderId ? 'text-violet-700' : 'text-stone-700'}`}>
                Root
              </p>
              <p className="text-xs text-stone-400">Home screen</p>
            </div>
            {!playlist.folderId && (
              <svg className="w-4 h-4 text-violet-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          {folders.length > 0 && (
            <div className="h-px bg-stone-100 mx-5 my-1" />
          )}

          {/* Folder options */}
          {folders.map(folder => (
            <button
              key={folder.id}
              onClick={() => { onMove(folder.id); onClose(); }}
              className={`w-full flex items-center gap-3 px-5 py-3 transition-colors text-left ${
                playlist.folderId === folder.id
                  ? 'bg-violet-50'
                  : 'hover:bg-stone-50'
              }`}
            >
              <span className="text-xl leading-none flex-shrink-0">{folder.emoji ?? '📁'}</span>
              <span className={`flex-1 font-semibold text-sm truncate ${
                playlist.folderId === folder.id ? 'text-violet-700' : 'text-stone-700'
              }`}>
                {folder.name}
              </span>
              {playlist.folderId === folder.id && (
                <svg className="w-4 h-4 text-violet-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}

          {folders.length === 0 && (
            <p className="px-5 py-4 text-sm text-stone-400 text-center">
              No folders yet — create one from the home screen.
            </p>
          )}
        </div>

        {/* Bottom safe area */}
        <div className="pb-5" />
      </div>
    </div>
  );
}
