import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import type { Playlist, Folder } from '@/types';

// ── Config validation at startup ─────────────────────────────
const REQUIRED_VARS = [
  'AWS_REGION',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'S3_BUCKET_NAME',
] as const;

for (const v of REQUIRED_VARS) {
  if (!process.env[v]) {
    console.error(`[s3] ❌ Missing required environment variable: ${v}`);
  }
}

const BUCKET = process.env.S3_BUCKET_NAME!;

const client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

console.log(`[s3] Client initialised — region: ${process.env.AWS_REGION}, bucket: ${BUCKET}`);

// ── Internal helpers ──────────────────────────────────────────

async function listKeys(prefix: string): Promise<string[]> {
  const keys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const res = await client.send(
      new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      }),
    );
    for (const obj of res.Contents ?? []) {
      if (obj.Key) keys.push(obj.Key);
    }
    continuationToken = res.NextContinuationToken;
  } while (continuationToken);

  return keys;
}

async function fetchObject<T>(key: string): Promise<T | null> {
  try {
    const res = await client.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
    const body = await res.Body?.transformToString();
    return body ? (JSON.parse(body) as T) : null;
  } catch (err: unknown) {
    if ((err as { name?: string }).name === 'NoSuchKey') return null;
    throw err;
  }
}

// ── Folders ───────────────────────────────────────────────────

export async function listFolders(): Promise<Folder[]> {
  console.log(`[s3] LIST s3://${BUCKET}/folders/`);
  const keys = await listKeys('folders/');
  if (keys.length === 0) return [];
  const results = await Promise.all(keys.map(k => fetchObject<Folder>(k)));
  const folders = results.filter((f): f is Folder => f !== null);
  console.log(`[s3] LIST folders — ${folders.length} folder(s)`);
  return folders;
}

export async function saveFolder(folder: Folder): Promise<void> {
  const key = `folders/${folder.id}.json`;
  console.log(`[s3] PUT s3://${BUCKET}/${key}`);
  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: JSON.stringify(folder),
      ContentType: 'application/json',
    }),
  );
}

export async function deleteFolder(id: string): Promise<void> {
  const key = `folders/${id}.json`;
  console.log(`[s3] DELETE s3://${BUCKET}/${key}`);
  await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

// ── Playlists ─────────────────────────────────────────────────

export async function listPlaylists(): Promise<Playlist[]> {
  console.log(`[s3] LIST s3://${BUCKET}/playlists/`);
  const keys = await listKeys('playlists/');

  if (keys.length > 0) {
    const results = await Promise.all(keys.map(k => fetchObject<Playlist>(k)));
    const playlists = results.filter((p): p is Playlist => p !== null);
    console.log(`[s3] LIST playlists — ${playlists.length} playlist(s)`);
    return playlists;
  }

  // ── Migration: old single-file format ─────────────────────
  console.log(`[s3] No per-file playlists found — checking legacy playlists.json`);
  const legacy = await fetchObject<Playlist[]>('playlists.json');
  if (legacy && Array.isArray(legacy) && legacy.length > 0) {
    console.log(`[s3] Migrating ${legacy.length} playlist(s) from playlists.json`);
    await Promise.all(legacy.map(p => savePlaylist(p)));
    console.log(`[s3] Migration complete`);
    return legacy;
  }

  return [];
}

export async function savePlaylist(playlist: Playlist): Promise<void> {
  const key = `playlists/${playlist.id}.json`;
  console.log(`[s3] PUT s3://${BUCKET}/${key}`);
  await client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: JSON.stringify(playlist),
      ContentType: 'application/json',
    }),
  );
}

export async function deletePlaylist(id: string): Promise<void> {
  const key = `playlists/${id}.json`;
  console.log(`[s3] DELETE s3://${BUCKET}/${key}`);
  await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}
