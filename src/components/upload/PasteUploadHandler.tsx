"use client";

import { useEffect } from "react";
import { useUpload } from "./UploadContext";

export default function PasteUploadHandler() {
  const { uploadFiles } = useUpload();

  useEffect(() => {
    const handler = (e: ClipboardEvent) => {
      const files = Array.from(e.clipboardData?.files ?? []);
      if (files.length > 0) {
        e.preventDefault();
        uploadFiles(files);
      }
    };
    window.addEventListener("paste", handler);
    return () => window.removeEventListener("paste", handler);
  }, [uploadFiles]);

  return null;
}
