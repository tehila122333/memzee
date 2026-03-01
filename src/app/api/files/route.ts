import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { queryD1 } from "@/lib/d1";
import { generatePreviewPresignedUrl } from "@/lib/download";
import type { FileRecord, FileView } from "@/types";

const PAGE_SIZE = 50;

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const view = (searchParams.get("view") ?? "all") as FileView;
  const folderId = searchParams.get("folderId");
  const cursor = searchParams.get("cursor"); // last uploaded_at / deleted_at value
  const q = searchParams.get("q")?.trim();

  const params: (string | null)[] = [`${userId}/%`];
  const conditions: string[] = ["storage_key LIKE ?"];

  if (q) {
    conditions.push("original_name LIKE ?");
    params.push(`%${q}%`);
  }

  const dateField = view === "trash" ? "deleted_at" : "uploaded_at";

  if (view === "trash") {
    conditions.push("deleted_at IS NOT NULL");
  } else {
    conditions.push("deleted_at IS NULL");
    if (view === "photos") conditions.push("mime_type LIKE 'image/%'");
    else if (view === "videos") conditions.push("mime_type LIKE 'video/%'");
    else if (view === "documents") conditions.push("(mime_type LIKE 'application/pdf%' OR mime_type LIKE 'text/%' OR mime_type LIKE '%document%' OR mime_type LIKE '%spreadsheet%' OR mime_type LIKE '%presentation%')");
    else if (view === "folder" && folderId) {
      conditions.push("folder_id = ?");
      params.push(folderId);
    }
  }

  if (cursor) {
    conditions.push(`${dateField} < ?`);
    params.push(cursor);
  }

  const where = conditions.join(" AND ");
  params.push(String(PAGE_SIZE + 1));
  const sql = `SELECT * FROM files WHERE ${where} ORDER BY ${dateField} DESC LIMIT ?`;

  const rows = await queryD1<FileRecord>(sql, params);
  const hasMore = rows.length > PAGE_SIZE;
  const files = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
  const nextCursor = hasMore ? files[files.length - 1][dateField as keyof FileRecord] as string : null;

  // Batch-generate preview URLs for all image files in parallel (local crypto op, no network)
  const filesWithUrls = await Promise.all(
    files.map(async (file) => {
      if (!file.mime_type.startsWith("image/")) return file;
      try {
        const key = file.thumbnail_key ?? file.storage_key;
        const preview_url = await generatePreviewPresignedUrl(key);
        return { ...file, preview_url };
      } catch {
        return file;
      }
    })
  );

  return NextResponse.json({ files: filesWithUrls, hasMore, nextCursor });
}
