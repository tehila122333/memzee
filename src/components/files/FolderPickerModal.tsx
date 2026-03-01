"use client";

import { useState, useEffect } from "react";
import { Folder, FolderOpen, X } from "lucide-react";
import type { FolderRecord } from "@/types";

interface FolderNode extends FolderRecord {
  children: FolderNode[];
}

function buildTree(folders: FolderRecord[]): FolderNode[] {
  const map = new Map<string, FolderNode>();
  folders.forEach((f) => map.set(f.id, { ...f, children: [] }));
  const roots: FolderNode[] = [];
  map.forEach((node) => {
    if (node.parent_id && map.has(node.parent_id)) {
      map.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

interface TreeNodeProps {
  node: FolderNode;
  depth: number;
  onSelect: (id: string) => void;
}

function TreeNode({ node, depth, onSelect }: TreeNodeProps) {
  const [open, setOpen] = useState(false);
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <button
        className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm text-gray-700 hover:bg-gray-100"
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => onSelect(node.id)}
      >
        {hasChildren ? (
          <span
            className="mr-0.5 text-xs text-gray-400"
            onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
          >
            {open ? "▾" : "▸"}
          </span>
        ) : (
          <span className="w-3" />
        )}
        {open ? (
          <FolderOpen className="h-4 w-4 flex-shrink-0 text-blue-500" />
        ) : (
          <Folder className="h-4 w-4 flex-shrink-0 text-blue-500" />
        )}
        {node.name}
      </button>
      {open &&
        node.children.map((child) => (
          <TreeNode key={child.id} node={child} depth={depth + 1} onSelect={onSelect} />
        ))}
    </div>
  );
}

interface Props {
  onSelect: (folderId: string | null) => void;
  onClose: () => void;
}

export default function FolderPickerModal({ onSelect, onClose }: Props) {
  const [folders, setFolders] = useState<FolderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/folders")
      .then((r) => r.json())
      .then((d) => setFolders(d.folders ?? []))
      .finally(() => setLoading(false));
  }, []);

  const tree = buildTree(folders);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-80 rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Move to folder</h2>
          <button onClick={onClose} className="rounded p-1 text-gray-400 hover:text-gray-600">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-72 overflow-y-auto p-2">
          {loading ? (
            <p className="py-4 text-center text-sm text-gray-400">Loading...</p>
          ) : (
            <>
              <button
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm text-gray-500 hover:bg-gray-100"
                onClick={() => onSelect(null)}
              >
                <Folder className="h-4 w-4" />
                No folder (root)
              </button>
              {tree.map((node) => (
                <TreeNode key={node.id} node={node} depth={0} onSelect={onSelect} />
              ))}
              {folders.length === 0 && (
                <p className="py-2 text-center text-sm text-gray-400">No folders yet</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
