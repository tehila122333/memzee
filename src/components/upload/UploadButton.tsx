"use client";

import { useRef } from "react";
import { Upload, FolderUp } from "lucide-react";
import { useUpload } from "./UploadContext";

interface Props {
  folderId?: string | null;
}

export default function UploadButton({ folderId }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const dirRef = useRef<HTMLInputElement>(null);
  const { uploadFiles, uploadState } = useUpload();

  const busy =
    uploadState.isOpen &&
    uploadState.files.some((f) => f.status === "uploading" || f.status === "pending");

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    uploadFiles(Array.from(files), folderId);
    if (fileRef.current) fileRef.current.value = "";
    if (dirRef.current) dirRef.current.value = "";
  };

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <input
        ref={dirRef}
        type="file"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...({ webkitdirectory: "", multiple: true } as any)}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        onClick={() => fileRef.current?.click()}
        disabled={busy}
        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Upload className="h-4 w-4" />
        Upload
      </button>
      <button
        onClick={() => dirRef.current?.click()}
        disabled={busy}
        title="Upload folder"
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <FolderUp className="h-4 w-4" />
      </button>
    </>
  );
}
