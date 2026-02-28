"use client";

import { useEffect, useState } from "react";
import { FileText } from "lucide-react";

interface Props {
  fileId: string;
  mimeType: string;
  fileName: string;
}

export default function LightboxDocument({ fileId, mimeType, fileName }: Props) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/files/${fileId}/download?preview=true`)
      .then((r) => r.json())
      .then((d) => setUrl(d.url))
      .catch(() => {});
  }, [fileId]);

  if (!url) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </div>
    );
  }

  if (mimeType === "application/pdf") {
    return (
      <iframe
        src={url}
        className="h-full w-full rounded"
        title={fileName}
      />
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 text-white">
      <FileText className="h-20 w-20 text-gray-300" />
      <p className="text-lg font-medium">{fileName}</p>
      <a
        href={url}
        download={fileName}
        className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
      >
        Download to view
      </a>
    </div>
  );
}
