import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { mutateD1 } from "@/lib/d1";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { fileId, storageKey, originalName, mimeType, sizeBytes } = body;

  if (!fileId || !storageKey || !originalName || !mimeType || !sizeBytes) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Verify ownership: storage key must start with userId/
  if (!storageKey.startsWith(`${userId}/`)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await mutateD1(
    `INSERT INTO files (id, storage_key, original_name, mime_type, size_bytes)
     VALUES (?, ?, ?, ?, ?)`,
    [fileId, storageKey, originalName, mimeType, sizeBytes]
  );

  return NextResponse.json({ success: true, fileId });
}
