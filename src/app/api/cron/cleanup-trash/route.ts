import { NextResponse } from "next/server";
import { queryD1, mutateD1 } from "@/lib/d1";
import { getR2Client } from "@/lib/r2";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import type { FileRecord } from "@/types";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expired = await queryD1<FileRecord>(
    `SELECT * FROM files WHERE deleted_at IS NOT NULL AND deleted_at < datetime('now', '-30 days')`,
    []
  );

  if (expired.length === 0) {
    return NextResponse.json({ deleted: 0 });
  }

  const r2 = getR2Client();
  let deleted = 0;

  for (const file of expired) {
    try {
      // Delete file from R2
      await r2.send(
        new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME!,
          Key: file.storage_key,
        })
      );

      // Delete thumbnail from R2 if present
      if (file.thumbnail_key) {
        await r2.send(
          new DeleteObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: file.thumbnail_key,
          })
        ).catch(() => {}); // non-fatal
      }

      // Remove from D1
      await mutateD1(`DELETE FROM files WHERE id = ?`, [file.id]);
      deleted++;
    } catch {
      // Log and continue — don't fail the whole cron
    }
  }

  return NextResponse.json({ deleted });
}
