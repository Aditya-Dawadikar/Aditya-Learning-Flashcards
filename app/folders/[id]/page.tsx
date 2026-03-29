import { FolderClient } from '@/components/FolderClient';

export default async function FolderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FolderClient folderId={id} />;
}
