import { NextResponse } from 'next/server';
import { deleteFolder, listPlaylists, savePlaylist } from '@/lib/s3';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    console.log(`[api/folders] DELETE — id: ${id}`);

    // Unset folderId on all playlists that belonged to this folder
    const all = await listPlaylists();
    const affected = all.filter(p => p.folderId === id);
    await Promise.all(
      affected.map(p => savePlaylist({ ...p, folderId: undefined })),
    );

    await deleteFolder(id);
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('[api/folders] DELETE error:', err);
    return NextResponse.json({ error: 'Failed to delete folder' }, { status: 500 });
  }
}
