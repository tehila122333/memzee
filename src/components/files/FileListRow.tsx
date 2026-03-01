"use client";

import { formatBytes } from "@/lib/file-utils";
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

export default function FileListRow({ file, view, onClick, onRefresh, selected, onSelect }: Props) {
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
    <tr
      className={`cursor-pointer border-b border-gray-100 hover:bg-gray-50 ${selected ? "bg-blue-50" : ""}`}
      onClick={onClick}
    >
      <td className="px-3 py-2" onClick={(e) => { e.stopPropagation(); onSelect(); }}>
        <input
          type="checkbox"
          checked={selected}
          onChange={() => {}}
          className="h-4 w-4 cursor-pointer accent-blue-600"
        />
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <FileIcon mimeType={file.mime_type} className="h-5 w-5 flex-shrink-0 text-gray-400" />
          <span className="truncate text-sm text-gray-900 max-w-xs" title={file.original_name}>
            {file.original_name}
          </span>
        </div>
      </td>
      <td className="px-3 py-2 text-sm text-gray-500 whitespace-nowrap">
        {formatBytes(file.size_bytes)}
      </td>
      <td className="hidden px-3 py-2 text-sm text-gray-500 md:table-cell">
        {file.mime_type.split("/")[1]?.toUpperCase() ?? file.mime_type}
      </td>
      <td className="hidden px-3 py-2 text-sm text-gray-500 md:table-cell whitespace-nowrap">
        {new Date(file.uploaded_at).toLocaleDateString()}
      </td>
      <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1">
          {view === "trash" ? (
            <>
              <button
                onClick={handleRestore}
                className="rounded px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-50"
              >
                Restore
              </button>
              <button
                onClick={handlePermDelete}
                className="rounded px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
              >
                Delete
              </button>
            </>
          ) : (
            <button
              onClick={handleDelete}
              className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
            >
              ✕
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
