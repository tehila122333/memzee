"use client";

import { useState, useEffect, useCallback } from "react";
import { LayoutGrid, List } from "lucide-react";
import FileGrid from "./FileGrid";
import Lightbox from "./Lightbox";
import EmptyState from "./EmptyState";
import BulkActionBar from "./BulkActionBar";
import type { FileRecord, FileView as FileViewType } from "@/types";

interface Props {
  view: FileViewType;
  folderId?: string;
}

export default function FileView({ view, folderId }: Props) {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/files?view=${view}`;
      if (folderId) url += `&folderId=${encodeURIComponent(folderId)}`;
      const res = await fetch(url);
      const data = await res.json();
      setFiles(data.files ?? []);
    } catch {
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [view, folderId]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  useEffect(() => {
    const handler = () => fetchFiles();
    window.addEventListener("memzee:upload-done", handler);
    return () => window.removeEventListener("memzee:upload-done", handler);
  }, [fetchFiles]);

  const handleSelectToggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const openLightbox = (file: FileRecord) => {
    const idx = files.findIndex((f) => f.id === file.id);
    if (idx !== -1) setSelectedIndex(idx);
  };

  const selectedFile = selectedIndex !== null ? files[selectedIndex] : null;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      {/* Header row: count + view toggle */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-500">
            {files.length} item{files.length !== 1 ? "s" : ""}
          </p>
          {selectedIds.size > 0 && (
            <p className="text-sm text-blue-600">· {selectedIds.size} selected</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode("grid")}
            title="Grid view"
            className={`rounded p-1.5 transition ${
              viewMode === "grid"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            title="List view"
            className={`rounded p-1.5 transition ${
              viewMode === "list"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <BulkActionBar
          selectedIds={selectedIds}
          onClear={clearSelection}
          onRefresh={fetchFiles}
        />
      )}

      {/* Content */}
      {files.length === 0 ? (
        <EmptyState view={view} />
      ) : (
        <FileGrid
          files={files}
          view={view}
          viewMode={viewMode}
          onSelect={openLightbox}
          onRefresh={fetchFiles}
          selectedIds={selectedIds}
          onSelectToggle={handleSelectToggle}
        />
      )}

      {/* Lightbox */}
      {selectedFile && (
        <Lightbox
          file={selectedFile}
          files={files}
          selectedIndex={selectedIndex!}
          onPrev={() =>
            setSelectedIndex((prev) => (prev !== null ? Math.max(0, prev - 1) : null))
          }
          onNext={() =>
            setSelectedIndex((prev) =>
              prev !== null ? Math.min(files.length - 1, prev + 1) : null
            )
          }
          onClose={() => setSelectedIndex(null)}
          onDelete={async () => {
            await fetchFiles();
            setSelectedIndex(null);
          }}
          view={view}
        />
      )}
    </>
  );
}
