import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { queryD1, mutateD1 } from "@/lib/d1";
import type { FileRecord } from "@/types";

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
    `SELECT * FROM files WHERE id = ? AND storage_key LIKE ? AND deleted_at IS NULL`,
    [id, `${userId}/%`]
  );

  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await mutateD1(`UPDATE files SET deleted_at = datetime('now') WHERE id = ?`, [id]);

  return NextResponse.json({ success: true });
}
