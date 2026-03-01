"use client";

import { useState, useCallback, useRef, ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Upload } from "lucide-react";
import { useUpload } from "./UploadContext";

export default function DropZone({ children }: { children: ReactNode }) {
  const [dragging, setDragging] = useState(false);
  const dragCount = useRef(0);
  const { uploadFiles } = useUpload();
  const pathname = usePathname();

  const getFolderId = () => {
    const match = pathname.match(/^\/folders\/([^/]+)/);
    return match ? match[1] : null;
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCount.current++;
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCount.current--;
    if (dragCount.current === 0) setDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      dragCount.current = 0;
      setDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) uploadFiles(files, getFolderId());
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [uploadFiles, pathname]
  );

  return (
    <div
      className="relative flex-1 overflow-y-auto"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {dragging && (
        <div className="pointer-events-none absolute inset-0 z-30 flex flex-col items-center justify-center bg-blue-50/80 backdrop-blur-sm">
          <Upload className="mb-4 h-16 w-16 text-blue-500" />
          <p className="text-xl font-semibold text-blue-700">Drop files here</p>
        </div>
      )}
      {children}
    </div>
  );
}
