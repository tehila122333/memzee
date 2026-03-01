"use client";

import type { UploadState } from "@/types";

interface Props {
  state: UploadState;
}

export default function UploadProgress({ state }: Props) {
  if (!state.isOpen || state.files.length === 0) return null;

  const done = state.files.filter((f) => f.status === "done").length;
  const total = state.files.length;
  const hasError = state.files.some((f) => f.status === "error");
  const allDone = done === total;

  return (
    <div
      className={`fixed bottom-6 right-6 z-40 w-72 rounded-xl p-4 shadow-xl ${
        hasError ? "bg-red-600 text-white" : allDone ? "bg-green-600 text-white" : "bg-gray-900 text-white"
      }`}
    >
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium">
          {allDone ? "Upload complete!" : hasError ? "Some uploads failed" : "Uploading..."}
        </p>
        <p className="text-xs opacity-80">
          {done}/{total}
        </p>
      </div>
      <div className="max-h-48 space-y-2 overflow-y-auto">
        {state.files.map((f) => (
          <div key={f.localId}>
            <div className="flex items-center justify-between">
              <p className="max-w-[180px] truncate text-xs opacity-90" title={f.fileName}>
                {f.fileName}
              </p>
              <span className="ml-1 text-xs opacity-70">
                {f.status === "done" ? "✓" : f.status === "error" ? "✗" : `${f.progress}%`}
              </span>
            </div>
            {f.status === "uploading" && (
              <div className="mt-0.5 h-1 w-full rounded-full bg-white/30">
                <div
                  className="h-1 rounded-full bg-white transition-all duration-200"
                  style={{ width: `${f.progress}%` }}
                />
              </div>
            )}
            {f.status === "error" && f.error && (
              <p className="text-xs opacity-70">{f.error}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
