"use client";

import { useEffect } from "react";
import { X, Download, Trash2, RotateCcw, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import { formatBytes } from "@/lib/file-utils";
import { isImage, isVideo } from "@/lib/file-utils";
import LightboxImage from "./LightboxImage";
import LightboxVideo from "./LightboxVideo";
import LightboxDocument from "./LightboxDocument";
import type { FileRecord, FileView } from "@/types";

interface Props {
  file: FileRecord;
  files: FileRecord[];
  selectedIndex: number;
  view: FileView;
  onClose: () => void;
  onDelete: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function Lightbox({
  file,
  files,
  selectedIndex,
  view,
  onClose,
  onDelete,
  onPrev,
  onNext,
}: Props) {
  const hasPrev = selectedIndex > 0;
  const hasNext = selectedIndex < files.length - 1;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onPrev();
      if (e.key === "ArrowRight" && hasNext) onNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, onPrev, onNext, hasPrev, hasNext]);

  const handleDownload = async () => {
    const res = await fetch(`/api/files/${file.id}/download`);
    const data = await res.json();
    const a = document.createElement("a");
    a.href = data.url;
    a.download = file.original_name;
    a.click();
  };

  const handleShare = async () => {
    if (!navigator.share && !navigator.canShare) {
      handleDownload();
      return;
    }
    try {
      const res = await fetch(`/api/files/${file.id}/download`);
      const data = await res.json();
      const blob = await fetch(data.url).then((r) => r.blob());
      const shareFile = new File([blob], file.original_name, { type: file.mime_type });
      if (navigator.canShare?.({ files: [shareFile] })) {
        await navigator.share({ files: [shareFile], title: file.original_name });
      } else {
        handleDownload();
      }
    } catch {
      handleDownload();
    }
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
        <div className="ml-4 flex flex-shrink-0 items-center gap-2">
          {view !== "trash" && (
            <>
              <button
                onClick={handleShare}
                className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
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

      {/* Content with prev/next arrows */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden p-4">
        {hasPrev && (
          <button
            onClick={onPrev}
            className="absolute left-4 z-10 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}

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

        {hasNext && (
          <button
            onClick={onNext}
            className="absolute right-4 z-10 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>
    </div>
  );
}
