"use client";

import { useState } from "react";
import { Trash2, FolderInput, Download, X } from "lucide-react";
import FolderPickerModal from "./FolderPickerModal";

interface Props {
  selectedIds: Set<string>;
  onClear: () => void;
  onRefresh: () => void;
}

export default function BulkActionBar({ selectedIds, onClear, onRefresh }: Props) {
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const count = selectedIds.size;
  const ids = Array.from(selectedIds);

  const handleDelete = async () => {
    if (!confirm(`Move ${count} file${count !== 1 ? "s" : ""} to trash?`)) return;
    setLoading(true);
    await fetch("/api/bulk/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    setLoading(false);
    onClear();
    onRefresh();
  };

  const handleDownloadZip = async () => {
    setLoading(true);
    const res = await fetch("/api/bulk/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids }),
    });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "memzee-files.zip";
      a.click();
      URL.revokeObjectURL(url);
    }
    setLoading(false);
  };

  const handleMove = async (folderId: string | null) => {
    setLoading(true);
    await fetch("/api/bulk/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids, folderId }),
    });
    setLoading(false);
    setShowMoveModal(false);
    onClear();
    onRefresh();
  };

  return (
    <>
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2">
        <span className="text-sm font-medium text-blue-700">
          {count} selected
        </span>
        <div className="ml-2 flex items-center gap-1">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex items-center gap-1 rounded px-2 py-1 text-sm text-red-600 hover:bg-red-100 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
          <button
            onClick={() => setShowMoveModal(true)}
            disabled={loading}
            className="flex items-center gap-1 rounded px-2 py-1 text-sm text-gray-700 hover:bg-gray-200 disabled:opacity-50"
          >
            <FolderInput className="h-3.5 w-3.5" />
            Move
          </button>
          <button
            onClick={handleDownloadZip}
            disabled={loading}
            className="flex items-center gap-1 rounded px-2 py-1 text-sm text-gray-700 hover:bg-gray-200 disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            Download ZIP
          </button>
        </div>
        <button
          onClick={onClear}
          className="ml-auto rounded p-1 text-gray-400 hover:text-gray-600"
          title="Clear selection"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      {showMoveModal && (
        <FolderPickerModal
          onSelect={handleMove}
          onClose={() => setShowMoveModal(false)}
        />
      )}
    </>
  );
}
