export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export type FileCategory = "photo" | "video" | "document" | "other";

export function getFileCategory(mimeType: string): FileCategory {
  if (mimeType.startsWith("image/")) return "photo";
  if (mimeType.startsWith("video/")) return "video";
  if (
    mimeType.startsWith("application/pdf") ||
    mimeType.startsWith("text/") ||
    mimeType.includes("document") ||
    mimeType.includes("spreadsheet") ||
    mimeType.includes("presentation")
  )
    return "document";
  return "other";
}

export function isImage(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}

export function isVideo(mimeType: string): boolean {
  return mimeType.startsWith("video/");
}
