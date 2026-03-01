"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const sentinelRef = useRef<HTMLDivElement>(null);

  const buildUrl = useCallback(
    (cursor?: string | null, q?: string) => {
      let url = `/api/files?view=${view}`;
      if (folderId) url += `&folderId=${encodeURIComponent(folderId)}`;
      if (q) url += `&q=${encodeURIComponent(q)}`;
      if (cursor) url += `&cursor=${encodeURIComponent(cursor)}`;
      return url;
    },
    [view, folderId]
  );

  const fetchFiles = useCallback(
    async (q = searchQuery) => {
      setLoading(true);
      setNextCursor(null);
      setHasMore(false);
      try {
        const res = await fetch(buildUrl(null, q));
        const data = await res.json();
        setFiles(data.files ?? []);
        setHasMore(data.hasMore ?? false);
        setNextCursor(data.nextCursor ?? null);
      } catch {
        setFiles([]);
      } finally {
        setLoading(false);
      }
    },
    [buildUrl, searchQuery]
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || !nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(buildUrl(nextCursor, searchQuery));
      const data = await res.json();
      setFiles((prev) => [...prev, ...(data.files ?? [])]);
      setHasMore(data.hasMore ?? false);
      setNextCursor(data.nextCursor ?? null);
    } catch {
      // ignore
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, nextCursor, loadingMore, buildUrl, searchQuery]);

  useEffect(() => {
    fetchFiles();
  }, [view, folderId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handler = () => fetchFiles();
    window.addEventListener("memzee:upload-done", handler);
    return () => window.removeEventListener("memzee:upload-done", handler);
  }, [fetchFiles]);

  // Listen for search events from Header
  useEffect(() => {
    const handler = (e: Event) => {
      const q = (e as CustomEvent<{ q: string }>).detail.q;
      setSearchQuery(q);
      fetchFiles(q);
    };
    window.addEventListener("memzee:search", handler as EventListener);
    return () => window.removeEventListener("memzee:search", handler as EventListener);
  }, [fetchFiles]);

  // IntersectionObserver for infinite scroll sentinel
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

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
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {files.length} item{files.length !== 1 ? "s" : ""}
            {searchQuery && <span className="ml-1 text-blue-600">· &quot;{searchQuery}&quot;</span>}
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
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            title="List view"
            className={`rounded p-1.5 transition ${
              viewMode === "list"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
        <>
          <FileGrid
            files={files}
            view={view}
            viewMode={viewMode}
            onSelect={openLightbox}
            onRefresh={fetchFiles}
            selectedIds={selectedIds}
            onSelectToggle={handleSelectToggle}
          />
          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="h-8" />
          {loadingMore && (
            <div className="flex justify-center py-4">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          )}
        </>
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
