"use client";

import { useRef, useState, useEffect } from "react";
import { formatBytes } from "@/lib/file-utils";
import { isImage } from "@/lib/file-utils";
import FileIcon from "./FileIcon";
import type { FileRecord, FileView } from "@/types";

interface Props {
  file: FileRecord;
  view: FileView;
  onClick: () => void;
  onRefresh: () => void;
}

export default function FileCard({ file, view, onClick, onRefresh }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!isImage(file.mime_type)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [file.mime_type]);

  useEffect(() => {
    if (!visible || !isImage(file.mime_type)) return;

    fetch(`/api/files/${file.id}/download?preview=true`)
      .then((r) => r.json())
      .then((d) => setThumbnailUrl(d.url))
      .catch(() => {});
  }, [visible, file.id, file.mime_type]);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await fetch(`/api/files/${file.id}`, { method: "DELETE" });
    onRefresh();
  };

  const handleRestore = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await fetch(`/api/trash/${file.id}`, { method: "POST" });
    onRefresh();
  };

  const handlePermDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Permanently delete "${file.original_name}"? This cannot be undone.`)) return;
    await fetch(`/api/trash/${file.id}`, { method: "DELETE" });
    onRefresh();
  };

  return (
    <div
      ref={ref}
      className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
      onClick={onClick}
    >
      {/* Thumbnail / Icon area */}
      <div className="flex h-36 items-center justify-center bg-gray-100">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={file.original_name}
            className="h-full w-full object-cover"
          />
        ) : (
          <FileIcon mimeType={file.mime_type} className="h-12 w-12 text-gray-400" />
        )}
      </div>

      {/* Info */}
      <div className="p-2">
        <p className="truncate text-xs font-medium text-gray-900" title={file.original_name}>
          {file.original_name}
        </p>
        <p className="text-xs text-gray-400">{formatBytes(file.size_bytes)}</p>
      </div>

      {/* Actions overlay */}
      <div className="absolute right-1 top-1 hidden gap-1 group-hover:flex">
        {view === "trash" ? (
          <>
            <button
              onClick={handleRestore}
              className="rounded bg-white/90 px-2 py-1 text-xs font-medium text-green-700 shadow hover:bg-green-50"
              title="Restore"
            >
              Restore
            </button>
            <button
              onClick={handlePermDelete}
              className="rounded bg-white/90 px-2 py-1 text-xs font-medium text-red-700 shadow hover:bg-red-50"
              title="Delete permanently"
            >
              Delete
            </button>
          </>
        ) : (
          <button
            onClick={handleDelete}
            className="rounded bg-white/90 px-2 py-1 text-xs font-medium text-red-600 shadow hover:bg-red-50"
            title="Move to trash"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
