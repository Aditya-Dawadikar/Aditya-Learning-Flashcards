import { NextResponse } from 'next/server';
import { listFolders, saveFolder } from '@/lib/s3';
import type { Folder } from '@/types';

export async function GET() {
  try {
    const folders = await listFolders();
    return NextResponse.json(folders);
  } catch (err: unknown) {
    console.error('[api/folders] GET error:', err);
    return NextResponse.json({ error: 'Failed to load folders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const folder: Folder = await request.json();
    console.log(`[api/folders] POST — creating folder "${folder.name}"`);
    await saveFolder(folder);
    return NextResponse.json(folder, { status: 201 });
  } catch (err: unknown) {
    console.error('[api/folders] POST error:', err);
    return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 });
  }
}
