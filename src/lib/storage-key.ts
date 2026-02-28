import { nanoid } from "nanoid";

export function generateStorageKey(userId: string, fileName: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const ext = fileName.includes(".") ? "." + fileName.split(".").pop() : "";
  const id = nanoid(12);
  return `${userId}/${year}/${month}/${id}${ext}`;
}
