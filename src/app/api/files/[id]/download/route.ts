import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { queryD1 } from "@/lib/d1";
import { generateDownloadPresignedUrl, generatePreviewPresignedUrl } from "@/lib/download";
import type { FileRecord } from "@/types";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const preview = searchParams.get("preview") === "true";

  const rows = await queryD1<FileRecord>(
    `SELECT * FROM files WHERE id = ? AND storage_key LIKE ?`,
    [id, `${userId}/%`]
  );

  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const file = rows[0];
  const url = preview
    ? await generatePreviewPresignedUrl(file.storage_key)
    : await generateDownloadPresignedUrl(file.storage_key, file.original_name);

  return NextResponse.json({ url });
}
