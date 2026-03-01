import { UploadProvider } from "@/components/upload/UploadContext";
import DropZone from "@/components/upload/DropZone";
import PasteUploadHandler from "@/components/upload/PasteUploadHandler";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import KeyboardShortcuts from "@/components/layout/KeyboardShortcuts";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <UploadProvider>
      <PasteUploadHandler />
      <KeyboardShortcuts />
      <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <DropZone>
            <div className="p-6">{children}</div>
          </DropZone>
        </div>
      </div>
    </UploadProvider>
  );
}
