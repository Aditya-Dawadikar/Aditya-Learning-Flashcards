import { NextResponse } from 'next/server';
import { deletePlaylist, listPlaylists, savePlaylist } from '@/lib/s3';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    console.log(`[api/playlists] DELETE — id: ${id}`);
    await deletePlaylist(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('[api/playlists] DELETE error:', err);
    return NextResponse.json({ error: 'Failed to delete playlist' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const patch: { folderId?: string | null } = await request.json();
    console.log(`[api/playlists] PATCH — id: ${id}, folderId: ${patch.folderId ?? 'null'}`);

    const all = await listPlaylists();
    const playlist = all.find(p => p.id === id);
    if (!playlist) {
      return NextResponse.json({ error: 'Playlist not found' }, { status: 404 });
    }

    const updated = {
      ...playlist,
      folderId: patch.folderId ?? undefined,
    };
    await savePlaylist(updated);
    return NextResponse.json(updated);
  } catch (err: unknown) {
    console.error('[api/playlists] PATCH error:', err);
    return NextResponse.json({ error: 'Failed to update playlist' }, { status: 500 });
  }
}
