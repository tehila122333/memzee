"use client";

import { createContext, useContext, useState, useCallback, useRef, ReactNode } from "react";
import type { UploadState, FileUploadState } from "@/types";
import UploadProgress from "./UploadProgress";

async function generateThumbnailBlob(file: File, maxSize = 400): Promise<Blob | null> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(null); return; }
      ctx.drawImage(img, 0, 0, w, h);
      canvas.toBlob((blob) => resolve(blob), "image/webp", 0.75);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    img.src = url;
  });
}

interface UploadContextType {
  uploadState: UploadState;
  uploadFiles: (files: File[], folderId?: string | null) => void;
}

const UploadContext = createContext<UploadContextType | null>(null);

export function useUpload() {
  const ctx = useContext(UploadContext);
  if (!ctx) throw new Error("useUpload must be used within UploadProvider");
  return ctx;
}

export function UploadProvider({ children }: { children: ReactNode }) {
  const [uploadState, setUploadState] = useState<UploadState>({ files: [], isOpen: false });
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const uploadFiles = useCallback(async (files: File[], folderId?: string | null) => {
    if (files.length === 0) return;

    if (clearTimer.current) clearTimeout(clearTimer.current);

    const ts = Date.now();
    const initialFiles: FileUploadState[] = files.map((f, i) => ({
      localId: `${ts}-${i}`,
      fileName: f.name,
      status: "pending",
      progress: 0,
    }));

    setUploadState({ files: initialFiles, isOpen: true });

    const updateFile = (localId: string, update: Partial<FileUploadState>) => {
      setUploadState((prev) => ({
        ...prev,
        files: prev.files.map((f) => (f.localId === localId ? { ...f, ...update } : f)),
      }));
    };

    await Promise.all(
      initialFiles.map(async (fileState, idx) => {
        const file = files[idx];
        const { localId } = fileState;

        try {
          updateFile(localId, { status: "uploading", progress: 0 });

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
          const { uploadUrl, storageKey, fileId, thumbnailUploadUrl, thumbnailKey } = await presignedRes.json();

          await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("PUT", uploadUrl);
            xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");

            xhr.upload.onprogress = (e) => {
              if (e.lengthComputable) {
                updateFile(localId, { progress: Math.round((e.loaded / e.total) * 100) });
              }
            };

            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) resolve();
              else reject(new Error(`R2 upload failed: ${xhr.status}`));
            };

            xhr.onerror = () => reject(new Error("Network error during upload"));
            xhr.send(file);
          });

          // Upload thumbnail for images
          if (thumbnailUploadUrl && thumbnailKey && file.type.startsWith("image/")) {
            const thumbBlob = await generateThumbnailBlob(file);
            if (thumbBlob) {
              await new Promise<void>((resolve) => {
                const xhr = new XMLHttpRequest();
                xhr.open("PUT", thumbnailUploadUrl);
                xhr.setRequestHeader("Content-Type", "image/webp");
                xhr.onload = () => resolve();
                xhr.onerror = () => resolve(); // non-fatal
                xhr.send(thumbBlob);
              });
            }
          }

          const confirmRes = await fetch("/api/upload/confirm", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileId,
              storageKey,
              originalName: file.name,
              mimeType: file.type || "application/octet-stream",
              sizeBytes: file.size,
              folderId: folderId ?? null,
              thumbnailKey: thumbnailKey ?? null,
            }),
          });

          if (!confirmRes.ok) throw new Error("Failed to save file metadata");
          updateFile(localId, { status: "done", progress: 100 });
        } catch (err) {
          updateFile(localId, {
            status: "error",
            error: err instanceof Error ? err.message : "Upload failed",
          });
        }
      })
    );

    window.dispatchEvent(new Event("memzee:upload-done"));

    clearTimer.current = setTimeout(() => {
      setUploadState({ files: [], isOpen: false });
    }, 3000);
  }, []);

  return (
    <UploadContext.Provider value={{ uploadState, uploadFiles }}>
      {children}
      <UploadProgress state={uploadState} />
    </UploadContext.Provider>
  );
}
