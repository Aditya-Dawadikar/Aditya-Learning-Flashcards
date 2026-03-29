'use client';
import { useState, useEffect, useCallback } from 'react';
import type { Playlist, Card } from '@/types';

const NUM_COLORS = 8;

export function usePlaylists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from S3 on mount
  useEffect(() => {
    fetch('/api/playlists')
      .then(r => r.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) setPlaylists(data as Playlist[]);
      })
      .catch(console.error)
      .finally(() => setIsHydrated(true));
  }, []);

  // Optimistic add: update local state immediately, sync to S3 in background
  const addPlaylist = useCallback(
    (data: { title: string; description?: string; emoji?: string; cards: Card[]; folderId?: string }): Playlist => {
      const playlist: Playlist = {
        id: crypto.randomUUID(),
        title: data.title,
        description: data.description,
        emoji: data.emoji ?? '📚',
        cards: data.cards,
        createdAt: new Date().toISOString(),
        colorIndex: Math.floor(Math.random() * NUM_COLORS),
        folderId: data.folderId,
      };
      setPlaylists(prev => [playlist, ...prev]);
      fetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playlist),
      }).catch(console.error);
      return playlist;
    },
    [],
  );

  // Optimistic delete: remove from local state immediately, sync to S3 in background
  const removePlaylist = useCallback((id: string) => {
    setPlaylists(prev => prev.filter(p => p.id !== id));
    fetch(`/api/playlists/${id}`, { method: 'DELETE' }).catch(console.error);
  }, []);

  // Optimistic move: update folderId locally, sync to S3 in background
  const movePlaylist = useCallback((id: string, folderId: string | null) => {
    setPlaylists(prev =>
      prev.map(p =>
        p.id === id ? { ...p, folderId: folderId ?? undefined } : p,
      ),
    );
    fetch(`/api/playlists/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folderId }),
    }).catch(console.error);
  }, []);

  const getPlaylist = useCallback(
    (id: string): Playlist | undefined => playlists.find(p => p.id === id),
    [playlists],
  );

  const getPlaylists = useCallback(
    (ids: string[]): Playlist[] => playlists.filter(p => ids.includes(p.id)),
    [playlists],
  );

  return { playlists, addPlaylist, removePlaylist, movePlaylist, getPlaylist, getPlaylists, isHydrated };
}
