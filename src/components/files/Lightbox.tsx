"use client";

import { useEffect } from "react";
import { X, Download, Trash2, RotateCcw } from "lucide-react";
import { formatBytes } from "@/lib/file-utils";
import { isImage, isVideo } from "@/lib/file-utils";
import LightboxImage from "./LightboxImage";
import LightboxVideo from "./LightboxVideo";
import LightboxDocument from "./LightboxDocument";
import type { FileRecord, FileView } from "@/types";

interface Props {
  file: FileRecord;
  view: FileView;
  onClose: () => void;
  onDelete: () => void;
}

export default function Lightbox({ file, view, onClose, onDelete }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleDownload = async () => {
    const res = await fetch(`/api/files/${file.id}/download`);
    const data = await res.json();
    const a = document.createElement("a");
    a.href = data.url;
    a.download = file.original_name;
    a.click();
  };

  const handleDelete = async () => {
    await fetch(`/api/files/${file.id}`, { method: "DELETE" });
    onDelete();
  };

  const handleRestore = async () => {
    await fetch(`/api/trash/${file.id}`, { method: "POST" });
    onDelete();
  };

  const handlePermDelete = async () => {
    if (!confirm(`Permanently delete "${file.original_name}"? This cannot be undone.`)) return;
    await fetch(`/api/trash/${file.id}`, { method: "DELETE" });
    onDelete();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/90"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between bg-black/50 px-4 py-3 backdrop-blur">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-white">{file.original_name}</p>
          <p className="text-xs text-gray-400">{formatBytes(file.size_bytes)}</p>
        </div>
        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
          {view !== "trash" && (
            <>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20"
              >
                <Download className="h-4 w-4" />
                Download
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-red-400 hover:bg-red-900/30"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </>
          )}
          {view === "trash" && (
            <>
              <button
                onClick={handleRestore}
                className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-green-400 hover:bg-green-900/30"
              >
                <RotateCcw className="h-4 w-4" />
                Restore
              </button>
              <button
                onClick={handlePermDelete}
                className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-red-400 hover:bg-red-900/30"
              >
                <Trash2 className="h-4 w-4" />
                Delete Forever
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="rounded-lg bg-white/10 p-1.5 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 items-center justify-center overflow-hidden p-4">
        {isImage(file.mime_type) ? (
          <LightboxImage fileId={file.id} />
        ) : isVideo(file.mime_type) ? (
          <LightboxVideo fileId={file.id} mimeType={file.mime_type} />
        ) : (
          <LightboxDocument
            fileId={file.id}
            mimeType={file.mime_type}
            fileName={file.original_name}
          />
        )}
      </div>
    </div>
  );
}
