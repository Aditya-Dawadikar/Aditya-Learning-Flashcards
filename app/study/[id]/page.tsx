import { SingleStudyClient } from '@/components/SingleStudyClient';

export default async function StudyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <SingleStudyClient id={id} />;
}
