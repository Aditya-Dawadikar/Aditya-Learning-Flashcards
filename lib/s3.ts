import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import type { Playlist } from '@/types';

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
const KEY = 'playlists.json';

const client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

console.log(`[s3] Client initialised — region: ${process.env.AWS_REGION}, bucket: ${BUCKET}`);

// ── Helpers ───────────────────────────────────────────────────

export async function getPlaylists(): Promise<Playlist[]> {
  console.log(`[s3] GET s3://${BUCKET}/${KEY}`);
  try {
    const res = await client.send(new GetObjectCommand({ Bucket: BUCKET, Key: KEY }));
    const body = await res.Body?.transformToString();
    const parsed = body ? (JSON.parse(body) as Playlist[]) : [];
    console.log(`[s3] GET ok — ${parsed.length} playlist(s)`);
    return parsed;
  } catch (err: unknown) {
    const name = (err as { name?: string }).name;
    if (name === 'NoSuchKey') {
      console.log(`[s3] GET — file not found (first run), returning []`);
      return [];
    }
    console.error(`[s3] GET failed — ${name}:`, err);
    throw err;
  }
}

export async function savePlaylists(playlists: Playlist[]): Promise<void> {
  console.log(`[s3] PUT s3://${BUCKET}/${KEY} — ${playlists.length} playlist(s)`);
  try {
    await client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: KEY,
        Body: JSON.stringify(playlists),
        ContentType: 'application/json',
      }),
    );
    console.log(`[s3] PUT ok`);
  } catch (err: unknown) {
    console.error(`[s3] PUT failed — ${(err as { name?: string }).name}:`, err);
    throw err;
  }
}
