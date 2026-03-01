"use client";

import { useEffect, useState } from "react";
import { X, Keyboard } from "lucide-react";

const shortcuts = [
  { key: "U", description: "Upload files" },
  { key: "/", description: "Focus search" },
  { key: "?", description: "Show keyboard shortcuts" },
  { key: "Esc", description: "Close lightbox / dialogs" },
  { key: "←  →", description: "Navigate files in lightbox" },
];

export default function KeyboardShortcuts() {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const inInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable;
      if (inInput) return;

      if (e.key === "u" || e.key === "U") {
        // Trigger upload button click
        document.querySelector<HTMLInputElement>("input[type=file]:not([webkitdirectory])")?.click();
      } else if (e.key === "/") {
        e.preventDefault();
        const input = document.getElementById("search-input") as HTMLInputElement | null;
        input?.focus();
      } else if (e.key === "?") {
        setShowModal((v) => !v);
      } else if (e.key === "Escape") {
        setShowModal(false);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (!showModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={() => setShowModal(false)}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-700 dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Keyboard className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={() => setShowModal(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-2">
          {shortcuts.map(({ key, description }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-300">{description}</span>
              <kbd className="rounded border border-gray-300 bg-gray-100 px-2 py-0.5 font-mono text-xs text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300">
                {key}
              </kbd>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-gray-400 dark:text-gray-500">
          Press <kbd className="rounded border border-gray-300 bg-gray-100 px-1 font-mono text-xs dark:border-gray-600 dark:bg-gray-800">?</kbd> to toggle this panel
        </p>
      </div>
    </div>
  );
}
