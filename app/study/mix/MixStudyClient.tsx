'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { usePlaylists } from '@/hooks/usePlaylists';
import { StudySession } from '@/components/StudySession';

export function MixStudyClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { getPlaylists, isHydrated } = usePlaylists();

  const idsParam = searchParams.get('ids') ?? '';
  const ids = idsParam.split(',').filter(Boolean);

  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-7 h-7 rounded-full border-2 border-violet-200 border-t-violet-600 animate-spin" />
      </div>
    );
  }

  const playlists = getPlaylists(ids);

  if (playlists.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-8 text-center">
        <span className="text-5xl">🔍</span>
        <h2 className="text-xl font-bold text-stone-800">Playlists not found</h2>
        <p className="text-stone-400 text-sm">They may have been deleted.</p>
        <button
          onClick={() => router.push('/')}
          className="px-5 py-2.5 bg-violet-600 text-white rounded-xl font-bold"
        >
          Go Home
        </button>
      </div>
    );
  }

  const title =
    playlists.length === 1
      ? `${playlists[0].emoji} ${playlists[0].title}`
      : `⚡ Mix · ${playlists.map(p => p.title).join(', ')}`;

  return (
    <StudySession
      playlists={playlists}
      title={title}
      onExit={() => router.push('/')}
    />
  );
}
