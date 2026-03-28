import { NextResponse } from 'next/server';
import { getPlaylists, savePlaylists } from '@/lib/s3';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    console.log(`[api/playlists] DELETE — id: ${id}`);
    const playlists = await getPlaylists();
    const before = playlists.length;
    const updated = playlists.filter(p => p.id !== id);
    if (updated.length === before) {
      console.warn(`[api/playlists] DELETE — id "${id}" not found in list`);
    }
    await savePlaylists(updated);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('[api/playlists] DELETE error:', err);
    return NextResponse.json({ error: 'Failed to delete playlist' }, { status: 500 });
  }
}
