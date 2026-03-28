'use client';
import { useRouter } from 'next/navigation';
import { usePlaylists } from '@/hooks/usePlaylists';
import { StudySession } from '@/components/StudySession';

export function SingleStudyClient({ id }: { id: string }) {
  const router = useRouter();
  const { getPlaylist, isHydrated } = usePlaylists();

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-7 h-7 rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" />
      </div>
    );
  }

  const playlist = getPlaylist(id);

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8 text-center">
        <span className="text-5xl">🔍</span>
        <h2 className="text-xl font-bold text-stone-800">Playlist not found</h2>
        <p className="text-stone-400 text-sm">It may have been deleted.</p>
        <button
          onClick={() => router.push('/')}
          className="px-5 py-2.5 bg-violet-600 text-white rounded-xl font-bold"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <StudySession
      playlists={[playlist]}
      title={`${playlist.emoji} ${playlist.title}`}
      onExit={() => router.push('/')}
    />
  );
}
