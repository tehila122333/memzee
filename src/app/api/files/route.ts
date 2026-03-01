import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { queryD1 } from "@/lib/d1";
import type { FileRecord, FileView } from "@/types";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const view = (searchParams.get("view") ?? "all") as FileView;
  const folderId = searchParams.get("folderId");

  let sql: string;
  const params: (string | null)[] = [`${userId}/%`];

  if (view === "trash") {
    sql = `SELECT * FROM files WHERE storage_key LIKE ? AND deleted_at IS NOT NULL ORDER BY deleted_at DESC`;
  } else if (view === "photos") {
    sql = `SELECT * FROM files WHERE storage_key LIKE ? AND deleted_at IS NULL AND mime_type LIKE 'image/%' ORDER BY uploaded_at DESC`;
  } else if (view === "videos") {
    sql = `SELECT * FROM files WHERE storage_key LIKE ? AND deleted_at IS NULL AND mime_type LIKE 'video/%' ORDER BY uploaded_at DESC`;
  } else if (view === "documents") {
    sql = `SELECT * FROM files WHERE storage_key LIKE ? AND deleted_at IS NULL AND (mime_type LIKE 'application/pdf%' OR mime_type LIKE 'text/%' OR mime_type LIKE '%document%' OR mime_type LIKE '%spreadsheet%' OR mime_type LIKE '%presentation%') ORDER BY uploaded_at DESC`;
  } else if (view === "folder" && folderId) {
    sql = `SELECT * FROM files WHERE storage_key LIKE ? AND folder_id = ? AND deleted_at IS NULL ORDER BY uploaded_at DESC`;
    params.push(folderId);
  } else {
    sql = `SELECT * FROM files WHERE storage_key LIKE ? AND deleted_at IS NULL ORDER BY uploaded_at DESC`;
  }

  const files = await queryD1<FileRecord>(sql, params);
  return NextResponse.json({ files });
}
