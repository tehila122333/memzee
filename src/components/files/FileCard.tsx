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
  selected: boolean;
  onSelect: () => void;
}

export default function FileCard({ file, view, onClick, onRefresh, selected, onSelect }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  // Use pre-generated URL from listing if available, otherwise lazy-fetch
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(file.preview_url ?? null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Already have the URL from the listing response — no need to fetch
    if (file.preview_url || !isImage(file.mime_type)) return;

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
  }, [file.mime_type, file.preview_url]);

  useEffect(() => {
    if (!visible || !isImage(file.mime_type) || file.preview_url) return;

    const param = file.thumbnail_key ? "thumbnail=true" : "preview=true";
    fetch(`/api/files/${file.id}/download?${param}`)
      .then((r) => r.json())
      .then((d) => setThumbnailUrl(d.url))
      .catch(() => {});
  }, [visible, file.id, file.mime_type, file.thumbnail_key, file.preview_url]);

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
      className={`group relative cursor-pointer overflow-hidden rounded-xl border bg-white shadow-sm transition hover:shadow-md dark:bg-gray-800 dark:hover:shadow-gray-700/40 ${
        selected
          ? "border-blue-400 ring-2 ring-blue-300 dark:border-blue-500 dark:ring-blue-700"
          : "border-gray-200 dark:border-gray-700"
      }`}
      onClick={onClick}
    >
      {/* Checkbox */}
      <div
        className={`absolute left-1.5 top-1.5 z-10 transition-opacity ${
          selected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
      >
        <input
          type="checkbox"
          checked={selected}
          onChange={() => {}}
          className="h-4 w-4 cursor-pointer accent-blue-600 shadow"
        />
      </div>

      {/* Thumbnail / Icon area */}
      <div className="flex h-36 items-center justify-center bg-gray-100 dark:bg-gray-700">
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnailUrl}
            alt={file.original_name}
            className="h-full w-full object-cover"
          />
        ) : (
          <FileIcon mimeType={file.mime_type} className="h-12 w-12 text-gray-400 dark:text-gray-500" />
        )}
      </div>

      {/* Info */}
      <div className="p-2">
        <p className="truncate text-xs font-medium text-gray-900 dark:text-gray-100" title={file.original_name}>
          {file.original_name}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">{formatBytes(file.size_bytes)}</p>
      </div>

      {/* Actions overlay */}
      <div className="absolute right-1 top-1 hidden gap-1 group-hover:flex">
        {view === "trash" ? (
          <>
            <button
              onClick={handleRestore}
              className="rounded bg-white/90 px-2 py-1 text-xs font-medium text-green-700 shadow hover:bg-green-50 dark:bg-gray-900/90 dark:text-green-400 dark:hover:bg-green-900/30"
              title="Restore"
            >
              Restore
            </button>
            <button
              onClick={handlePermDelete}
              className="rounded bg-white/90 px-2 py-1 text-xs font-medium text-red-700 shadow hover:bg-red-50 dark:bg-gray-900/90 dark:text-red-400 dark:hover:bg-red-900/30"
              title="Delete permanently"
            >
              Delete
            </button>
          </>
        ) : (
          <button
            onClick={handleDelete}
            className="rounded bg-white/90 px-2 py-1 text-xs font-medium text-red-600 shadow hover:bg-red-50 dark:bg-gray-900/90 dark:text-red-400 dark:hover:bg-red-900/30"
            title="Move to trash"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
