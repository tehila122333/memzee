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
  const { ids, folderId } = body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "ids array required" }, { status: 400 });
  }

  // Verify ownership
  const placeholders = ids.map(() => "?").join(", ");
  const files = await queryD1<FileRecord>(
    `SELECT id FROM files WHERE id IN (${placeholders}) AND storage_key LIKE ? AND deleted_at IS NULL`,
    [...ids, `${userId}/%`]
  );

  if (files.length === 0) {
    return NextResponse.json({ moved: 0 });
  }

  const ownedIds = files.map((f) => f.id);
  const ownedPlaceholders = ownedIds.map(() => "?").join(", ");

  await mutateD1(
    `UPDATE files SET folder_id = ? WHERE id IN (${ownedPlaceholders})`,
    [folderId ?? null, ...ownedIds]
  );

  return NextResponse.json({ moved: ownedIds.length });
}
