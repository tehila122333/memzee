import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { mutateD1 } from "@/lib/d1";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { fileId, storageKey, originalName, mimeType, sizeBytes, folderId, thumbnailKey } = body;

  if (!fileId || !storageKey || !originalName || !mimeType || !sizeBytes) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!storageKey.startsWith(`${userId}/`)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await mutateD1(
    `INSERT INTO files (id, storage_key, thumbnail_key, original_name, mime_type, size_bytes, folder_id)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [fileId, storageKey, thumbnailKey ?? null, originalName, mimeType, sizeBytes, folderId ?? null]
  );

  return NextResponse.json({ success: true, fileId });
}
