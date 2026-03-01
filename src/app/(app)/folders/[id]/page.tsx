import FileView from "@/components/files/FileView";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function FolderPage({ params }: Props) {
  const { id } = await params;
  return <FileView view="folder" folderId={id} />;
}
