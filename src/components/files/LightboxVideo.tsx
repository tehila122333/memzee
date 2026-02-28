"use client";

import { useEffect, useState } from "react";

interface Props {
  fileId: string;
  mimeType: string;
}

export default function LightboxVideo({ fileId, mimeType }: Props) {
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

  return (
    <video controls className="max-h-full max-w-full rounded">
      <source src={url} type={mimeType} />
      Your browser does not support the video tag.
    </video>
  );
}
