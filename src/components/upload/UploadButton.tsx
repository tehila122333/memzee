"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import UploadProgress from "./UploadProgress";
import type { UploadState } from "@/types";

export default function UploadButton() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState>({ status: "idle", progress: 0 });

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    setUploadState({ status: "requesting", progress: 0, fileName: file.name });

    try {
      // Step 1: Get presigned URL
      const presignedRes = await fetch("/api/upload/presigned", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
          sizeBytes: file.size,
        }),
      });

      if (!presignedRes.ok) throw new Error("Failed to get upload URL");

      const { uploadUrl, storageKey, fileId } = await presignedRes.json();

      // Step 2: Upload directly to R2 via XHR for progress
      setUploadState({ status: "uploading", progress: 0, fileName: file.name });

      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("PUT", uploadUrl);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setUploadState({ status: "uploading", progress: pct, fileName: file.name });
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`R2 upload failed: ${xhr.status}`));
        };

        xhr.onerror = () => reject(new Error("Network error during upload"));
        xhr.send(file);
      });

      // Step 3: Confirm upload in D1
      setUploadState({ status: "confirming", progress: 100, fileName: file.name });

      const confirmRes = await fetch("/api/upload/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId,
          storageKey,
          originalName: file.name,
          mimeType: file.type || "application/octet-stream",
          sizeBytes: file.size,
        }),
      });

      if (!confirmRes.ok) throw new Error("Failed to save file metadata");

      setUploadState({ status: "done", progress: 100, fileName: file.name });

      // Notify FileView to refresh
      window.dispatchEvent(new Event("memzee:upload-done"));

      // Auto-clear toast after 2s
      setTimeout(() => setUploadState({ status: "idle", progress: 0 }), 2000);
    } catch (err) {
      setUploadState({
        status: "error",
        progress: 0,
        fileName: file.name,
        error: err instanceof Error ? err.message : "Upload failed",
      });
      setTimeout(() => setUploadState({ status: "idle", progress: 0 }), 4000);
    }

    // Reset input so same file can be re-uploaded
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploadState.status !== "idle"}
        className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Upload className="h-4 w-4" />
        Upload
      </button>
      <UploadProgress state={uploadState} />
    </>
  );
}
