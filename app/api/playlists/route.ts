import { NextResponse } from 'next/server';
import { listPlaylists, savePlaylist } from '@/lib/s3';
import type { Playlist } from '@/types';

export async function GET() {
  try {
    const playlists = await listPlaylists();
    return NextResponse.json(playlists);
  } catch (err: unknown) {
    console.error('[api/playlists] GET error:', err);
    return NextResponse.json({ error: 'Failed to load playlists' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const playlist: Playlist = await request.json();
    console.log(`[api/playlists] POST — adding playlist "${playlist.title}" (${playlist.cards.length} cards)`);
    await savePlaylist(playlist);
    return NextResponse.json(playlist, { status: 201 });
  } catch (err: unknown) {
    console.error('[api/playlists] POST error:', err);
    return NextResponse.json({ error: 'Failed to save playlist' }, { status: 500 });
  }
}
