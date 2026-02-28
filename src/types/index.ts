export type FileView = "all" | "photos" | "videos" | "documents" | "trash";

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
}

export interface UploadState {
  status: "idle" | "requesting" | "uploading" | "confirming" | "done" | "error";
  progress: number;
  fileName?: string;
  error?: string;
}

export interface PresignedUploadResponse {
  uploadUrl: string;
  storageKey: string;
  fileId: string;
}

export interface DownloadResponse {
  url: string;
}
