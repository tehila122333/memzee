import { Image, Video, FileText, File } from "lucide-react";
import { getFileCategory } from "@/lib/file-utils";

interface Props {
  mimeType: string;
  className?: string;
}

export default function FileIcon({ mimeType, className }: Props) {
  const category = getFileCategory(mimeType);
  switch (category) {
    case "photo":
      return <Image className={className} />;
    case "video":
      return <Video className={className} />;
    case "document":
      return <FileText className={className} />;
    default:
      return <File className={className} />;
  }
}
