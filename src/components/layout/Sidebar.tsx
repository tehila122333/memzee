"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderOpen,
  Image,
  Video,
  FileText,
  Trash2,
  Cloud,
} from "lucide-react";
import { clsx } from "clsx";

const navItems = [
  { href: "/files", label: "All Files", icon: FolderOpen },
  { href: "/photos", label: "Photos", icon: Image },
  { href: "/videos", label: "Videos", icon: Video },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/trash", label: "Trash", icon: Trash2 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 flex-shrink-0 flex-col border-r border-gray-200 bg-white">
      <div className="flex items-center gap-2 px-4 py-5 border-b border-gray-200">
        <Cloud className="h-6 w-6 text-blue-600" />
        <span className="text-lg font-bold text-gray-900">Memzee</span>
      </div>
      <nav className="flex-1 p-3 space-y-1">
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
    </aside>
  );
}
