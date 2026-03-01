"use client";

import FileCard from "./FileCard";
import FileListRow from "./FileListRow";
import type { FileRecord, FileView } from "@/types";

interface Props {
  files: FileRecord[];
  view: FileView;
  viewMode: "grid" | "list";
  onSelect: (file: FileRecord) => void;
  onRefresh: () => void;
  selectedIds: Set<string>;
  onSelectToggle: (id: string) => void;
}

export default function FileGrid({
  files,
  view,
  viewMode,
  onSelect,
  onRefresh,
  selectedIds,
  onSelectToggle,
}: Props) {
  if (viewMode === "list") {
    return (
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500 dark:bg-gray-800 dark:text-gray-400">
            <tr>
              <th className="w-8 px-3 py-2" />
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Size</th>
              <th className="hidden px-3 py-2 md:table-cell">Type</th>
              <th className="hidden px-3 py-2 md:table-cell">Date</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <FileListRow
                key={file.id}
                file={file}
                view={view}
                onClick={() => onSelect(file)}
                onRefresh={onRefresh}
                selected={selectedIds.has(file.id)}
                onSelect={() => onSelectToggle(file.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {files.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          view={view}
          onClick={() => onSelect(file)}
          onRefresh={onRefresh}
          selected={selectedIds.has(file.id)}
          onSelect={() => onSelectToggle(file.id)}
        />
      ))}
    </div>
  );
}
