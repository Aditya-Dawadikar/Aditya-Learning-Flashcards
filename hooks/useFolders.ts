'use client';
import { useState, useEffect, useCallback } from 'react';
import type { Folder } from '@/types';

export function useFolders() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    fetch('/api/folders')
      .then(r => r.json())
      .then((data: unknown) => {
        if (Array.isArray(data)) setFolders(data as Folder[]);
      })
      .catch(console.error)
      .finally(() => setIsHydrated(true));
  }, []);

  const addFolder = useCallback(
    (data: { name: string; emoji?: string }): Folder => {
      const folder: Folder = {
        id: crypto.randomUUID(),
        name: data.name,
        emoji: data.emoji ?? '📁',
        createdAt: new Date().toISOString(),
      };
      setFolders(prev => [...prev, folder]);
      fetch('/api/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(folder),
      }).catch(console.error);
      return folder;
    },
    [],
  );

  const removeFolder = useCallback((id: string) => {
    setFolders(prev => prev.filter(f => f.id !== id));
    fetch(`/api/folders/${id}`, { method: 'DELETE' }).catch(console.error);
  }, []);

  const getFolder = useCallback(
    (id: string): Folder | undefined => folders.find(f => f.id === id),
    [folders],
  );

  return { folders, addFolder, removeFolder, getFolder, isHydrated };
}
