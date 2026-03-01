"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderOpen,
  Image,
  Video,
  FileText,
  Trash2,
  Cloud,
  Folder,
  FolderPlus,
  Check,
  X,
  Pencil,
  Trash,
} from "lucide-react";
import { clsx } from "clsx";
import { formatBytes } from "@/lib/file-utils";
import type { FolderRecord } from "@/types";

const navItems = [
  { href: "/files", label: "All Files", icon: FolderOpen },
  { href: "/photos", label: "Photos", icon: Image },
  { href: "/videos", label: "Videos", icon: Video },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/trash", label: "Trash", icon: Trash2 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [folders, setFolders] = useState<FolderRecord[]>([]);
  const [storage, setStorage] = useState<{ used: number; total: number } | null>(null);
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const fetchFolders = useCallback(async () => {
    try {
      const res = await fetch("/api/folders");
      const data = await res.json();
      setFolders(data.folders ?? []);
    } catch {
      // ignore
    }
  }, []);

  const fetchStorage = useCallback(async () => {
    try {
      const res = await fetch("/api/storage");
      const data = await res.json();
      setStorage(data);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchFolders();
    fetchStorage();
  }, [fetchFolders, fetchStorage]);

  useEffect(() => {
    const handler = () => fetchFolders();
    window.addEventListener("memzee:folder-changed", handler);
    window.addEventListener("memzee:upload-done", fetchStorage);
    return () => {
      window.removeEventListener("memzee:folder-changed", handler);
      window.removeEventListener("memzee:upload-done", fetchStorage);
    };
  }, [fetchFolders, fetchStorage]);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await fetch("/api/folders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newFolderName.trim() }),
    });
    setNewFolderName("");
    setShowNewFolder(false);
    fetchFolders();
    window.dispatchEvent(new Event("memzee:folder-changed"));
  };

  const handleRename = async (id: string) => {
    if (!editingName.trim()) return;
    await fetch(`/api/folders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editingName.trim() }),
    });
    setEditingId(null);
    fetchFolders();
    window.dispatchEvent(new Event("memzee:folder-changed"));
  };

  const handleDeleteFolder = async (id: string, name: string) => {
    if (!confirm(`Delete folder "${name}"? Files inside will be moved to root.`)) return;
    await fetch(`/api/folders/${id}`, { method: "DELETE" });
    fetchFolders();
    window.dispatchEvent(new Event("memzee:folder-changed"));
  };

  const usedPct = storage ? Math.min(100, (storage.used / storage.total) * 100) : 0;

  return (
    <aside className="flex w-56 flex-shrink-0 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-5">
        <Cloud className="h-6 w-6 text-blue-600" />
        <span className="text-lg font-bold text-gray-900">Memzee</span>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto p-3">
        {/* Main nav */}
        <nav className="space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                pathname === href || pathname.startsWith(href + "/")
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Folders section */}
        <div className="mt-4">
          <div className="flex items-center justify-between px-3 py-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Folders
            </span>
            <button
              onClick={() => setShowNewFolder((v) => !v)}
              title="New folder"
              className="rounded p-0.5 text-gray-400 hover:text-blue-600"
            >
              <FolderPlus className="h-3.5 w-3.5" />
            </button>
          </div>

          {showNewFolder && (
            <div className="mt-1 flex items-center gap-1 px-2">
              <input
                autoFocus
                className="min-w-0 flex-1 rounded border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateFolder();
                  if (e.key === "Escape") { setShowNewFolder(false); setNewFolderName(""); }
                }}
              />
              <button onClick={handleCreateFolder} className="text-green-600 hover:text-green-700">
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => { setShowNewFolder(false); setNewFolderName(""); }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="mt-1 space-y-0.5">
            {folders.map((folder) => (
              <div key={folder.id} className="group flex items-center gap-1 rounded-lg px-3 py-1.5">
                {editingId === folder.id ? (
                  <div className="flex flex-1 items-center gap-1">
                    <input
                      autoFocus
                      className="min-w-0 flex-1 rounded border border-gray-300 px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRename(folder.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                    />
                    <button onClick={() => handleRename(folder.id)} className="text-green-600">
                      <Check className="h-3 w-3" />
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-gray-400">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Link
                      href={`/folders/${folder.id}`}
                      className={clsx(
                        "flex min-w-0 flex-1 items-center gap-2 text-sm transition-colors",
                        pathname === `/folders/${folder.id}`
                          ? "font-medium text-blue-700"
                          : "text-gray-600 hover:text-gray-900"
                      )}
                    >
                      <Folder className="h-4 w-4 flex-shrink-0 text-blue-400" />
                      <span className="truncate">{folder.name}</span>
                    </Link>
                    <div className="hidden shrink-0 items-center gap-0.5 group-hover:flex">
                      <button
                        onClick={() => { setEditingId(folder.id); setEditingName(folder.name); }}
                        className="rounded p-0.5 text-gray-400 hover:text-gray-600"
                        title="Rename"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteFolder(folder.id, folder.name)}
                        className="rounded p-0.5 text-gray-400 hover:text-red-500"
                        title="Delete"
                      >
                        <Trash className="h-3 w-3" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {folders.length === 0 && !showNewFolder && (
              <p className="px-3 py-1 text-xs text-gray-400">No folders yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Storage bar */}
      {storage !== null && (
        <div className="border-t border-gray-100 px-4 py-3">
          <div className="mb-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-1.5 rounded-full bg-blue-500 transition-all"
              style={{ width: `${usedPct}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">
            {formatBytes(storage.used)} of {formatBytes(storage.total)} used
          </p>
        </div>
      )}
    </aside>
  );
}
