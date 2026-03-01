export type FileView = "all" | "photos" | "videos" | "documents" | "trash" | "folder";

export interface FileRecord {
  id: string;
  storage_key: string;
  thumbnail_key: string | null;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  folder_id: string | null;
  uploaded_at: string;
  updated_at: string;
  deleted_at: string | null;
  // Computed server-side, not stored in D1
  preview_url?: string;
}

export interface FolderRecord {
  id: string;
  name: string;
  parent_id: string | null;
  owner_key: string;
  created_at: string;
}

export interface FileUploadState {
  localId: string;
  fileName: string;
  status: "pending" | "uploading" | "done" | "error";
  progress: number;
  error?: string;
}

export interface UploadState {
  files: FileUploadState[];
  isOpen: boolean;
}

export interface PresignedUploadResponse {
  uploadUrl: string;
  storageKey: string;
  fileId: string;
}

export interface DownloadResponse {
  url: string;
}
