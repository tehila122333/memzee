"use client";

import { UserButton } from "@clerk/nextjs";
import UploadButton from "@/components/upload/UploadButton";

export default function Header() {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <UploadButton />
        <UserButton afterSignOutUrl="/sign-in" />
      </div>
    </header>
  );
}
