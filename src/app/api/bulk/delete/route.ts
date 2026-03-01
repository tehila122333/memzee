import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { queryD1, mutateD1 } from "@/lib/d1";
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

  // Verify ownership of all files
  const placeholders = ids.map(() => "?").join(", ");
  const files = await queryD1<FileRecord>(
    `SELECT id, storage_key FROM files WHERE id IN (${placeholders}) AND storage_key LIKE ? AND deleted_at IS NULL`,
    [...ids, `${userId}/%`]
  );

  if (files.length === 0) {
    return NextResponse.json({ deleted: 0 });
  }

  const ownedIds = files.map((f) => f.id);
  const ownedPlaceholders = ownedIds.map(() => "?").join(", ");

  await mutateD1(
    `UPDATE files SET deleted_at = datetime('now') WHERE id IN (${ownedPlaceholders})`,
    ownedIds
  );

  return NextResponse.json({ deleted: ownedIds.length });
}
