"use client";

import FileCard from "./FileCard";
import type { FileRecord, FileView } from "@/types";

interface Props {
  files: FileRecord[];
  view: FileView;
  onSelect: (file: FileRecord) => void;
  onRefresh: () => void;
}

export default function FileGrid({ files, view, onSelect, onRefresh }: Props) {
  return (
    <div>
      <p className="mb-4 text-sm text-gray-500">{files.length} item{files.length !== 1 ? "s" : ""}</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {files.map((file) => (
          <FileCard
            key={file.id}
            file={file}
            view={view}
            onClick={() => onSelect(file)}
            onRefresh={onRefresh}
          />
        ))}
      </div>
    </div>
  );
}
