import { Cloud } from "lucide-react";
import type { FileView } from "@/types";

const labels: Record<FileView, string> = {
  all: "No files yet",
  photos: "No photos yet",
  videos: "No videos yet",
  documents: "No documents yet",
  trash: "Trash is empty",
  folder: "This folder is empty",
};

const subtitles: Record<FileView, string> = {
  all: "Upload your first file using the Upload button above.",
  photos: "Upload images to see them here.",
  videos: "Upload videos to see them here.",
  documents: "Upload documents to see them here.",
  trash: "Deleted files will appear here.",
  folder: "Upload or drag files into this folder.",
};

export default function EmptyState({ view }: { view: FileView }) {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
      <Cloud className="h-14 w-14 text-gray-300" />
      <h2 className="text-lg font-semibold text-gray-600">{labels[view]}</h2>
      <p className="text-sm text-gray-400">{subtitles[view]}</p>
    </div>
  );
}
