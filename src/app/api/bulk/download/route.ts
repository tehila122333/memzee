import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import JSZip from "jszip";
import { queryD1 } from "@/lib/d1";
import { generatePreviewPresignedUrl } from "@/lib/download";
import type { FileRecord } from "@/types";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { ids } = body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "ids array required" }, { status: 400 });
  }

  const placeholders = ids.map(() => "?").join(", ");
  const files = await queryD1<FileRecord>(
    `SELECT * FROM files WHERE id IN (${placeholders}) AND storage_key LIKE ? AND deleted_at IS NULL`,
    [...ids, `${userId}/%`]
  );

  if (files.length === 0) {
    return NextResponse.json({ error: "No files found" }, { status: 404 });
  }

  const zip = new JSZip();

  await Promise.all(
    files.map(async (file) => {
      try {
        const url = await generatePreviewPresignedUrl(file.storage_key);
        const res = await fetch(url);
        if (!res.ok) return;
        const buffer = await res.arrayBuffer();
        zip.file(file.original_name, buffer);
      } catch {
        // skip files that fail to fetch
      }
    })
  );

  const zipBuffer = await zip.generateAsync({ type: "arraybuffer" });

  return new Response(zipBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": 'attachment; filename="memzee-files.zip"',
    },
  });
}
