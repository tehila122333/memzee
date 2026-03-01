"use client";

import { useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import UploadButton from "@/components/upload/UploadButton";
import ThemeToggle from "@/components/theme/ThemeToggle";

export default function Header() {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Expose focus method for keyboard shortcut
  if (typeof window !== "undefined") {
    (window as Window & { __focusSearch?: () => void }).__focusSearch = () => inputRef.current?.focus();
  }

  const handleChange = (value: string) => {
    setQuery(value);
    window.dispatchEvent(new CustomEvent("memzee:search", { detail: { q: value } }));
  };

  const clearSearch = () => handleChange("");

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 dark:border-gray-700 dark:bg-gray-900">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
        <input
          ref={inputRef}
          id="search-input"
          type="text"
          placeholder="Search files… (/)"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-8 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 ml-4">
        <UploadButton />
        <ThemeToggle />
        <UserButton afterSignOutUrl="/sign-in" />
      </div>
    </header>
  );
}
