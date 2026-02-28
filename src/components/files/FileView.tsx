"use client";

import { useState, useEffect, useCallback } from "react";
import FileGrid from "./FileGrid";
import Lightbox from "./Lightbox";
import EmptyState from "./EmptyState";
import type { FileRecord, FileView as FileViewType } from "@/types";

interface Props {
  view: FileViewType;
}

export default function FileView({ view }: Props) {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/files?view=${view}`);
      const data = await res.json();
      setFiles(data.files ?? []);
    } catch {
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [view]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Listen for upload events to refresh
  useEffect(() => {
    const handler = () => fetchFiles();
    window.addEventListener("memzee:upload-done", handler);
    return () => window.removeEventListener("memzee:upload-done", handler);
  }, [fetchFiles]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (files.length === 0) {
    return <EmptyState view={view} />;
  }

  return (
    <>
      <FileGrid
        files={files}
        view={view}
        onSelect={setSelectedFile}
        onRefresh={fetchFiles}
      />
      {selectedFile && (
        <Lightbox
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
          onDelete={async () => {
            await fetchFiles();
            setSelectedFile(null);
          }}
          view={view}
        />
      )}
    </>
  );
}
