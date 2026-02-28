"use client";

import type { UploadState } from "@/types";

interface Props {
  state: UploadState;
}

export default function UploadProgress({ state }: Props) {
  if (state.status === "idle") return null;

  const label: Record<UploadState["status"], string> = {
    idle: "",
    requesting: "Preparing...",
    uploading: `Uploading... ${state.progress}%`,
    confirming: "Saving...",
    done: "Upload complete!",
    error: state.error ?? "Upload failed",
  };

  const isError = state.status === "error";
  const isDone = state.status === "done";

  return (
    <div
      className={`fixed bottom-6 right-6 z-40 min-w-64 rounded-xl p-4 shadow-xl ${
        isError
          ? "bg-red-600 text-white"
          : isDone
          ? "bg-green-600 text-white"
          : "bg-gray-900 text-white"
      }`}
    >
      <p className="text-sm font-medium">{state.fileName}</p>
      <p className="text-xs opacity-80">{label[state.status]}</p>
      {state.status === "uploading" && (
        <div className="mt-2 h-1.5 w-full rounded-full bg-white/30">
          <div
            className="h-1.5 rounded-full bg-white transition-all duration-200"
            style={{ width: `${state.progress}%` }}
          />
        </div>
      )}
    </div>
  );
}
