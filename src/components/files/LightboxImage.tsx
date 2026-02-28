"use client";

import { useEffect, useState } from "react";

interface Props {
  fileId: string;
}

export default function LightboxImage({ fileId }: Props) {
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
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" className="max-h-full max-w-full rounded object-contain" />
  );
}
