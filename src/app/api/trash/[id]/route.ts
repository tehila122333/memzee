import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { queryD1, mutateD1 } from "@/lib/d1";
import { getR2Client } from "@/lib/r2";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import type { FileRecord } from "@/types";

// POST: restore
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const rows = await queryD1<FileRecord>(
    `SELECT * FROM files WHERE id = ? AND storage_key LIKE ? AND deleted_at IS NOT NULL`,
    [id, `${userId}/%`]
  );

  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await mutateD1(`UPDATE files SET deleted_at = NULL WHERE id = ?`, [id]);

  return NextResponse.json({ success: true });
}

// DELETE: permanent delete
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const rows = await queryD1<FileRecord>(
    `SELECT * FROM files WHERE id = ? AND storage_key LIKE ? AND deleted_at IS NOT NULL`,
    [id, `${userId}/%`]
  );

  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const file = rows[0];

  // Delete from R2
  const r2 = getR2Client();
  await r2.send(
    new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: file.storage_key,
    })
  );

  // Delete from D1
  await mutateD1(`DELETE FROM files WHERE id = ?`, [id]);

  return NextResponse.json({ success: true });
}
