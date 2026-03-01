import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { queryD1, mutateD1 } from "@/lib/d1";
import type { FolderRecord } from "@/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { name } = body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const folders = await queryD1<FolderRecord>(
    `SELECT * FROM folders WHERE id = ? AND owner_key = ?`,
    [id, userId]
  );
  if (folders.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await mutateD1(`UPDATE folders SET name = ? WHERE id = ?`, [name.trim(), id]);
  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const folders = await queryD1<FolderRecord>(
    `SELECT * FROM folders WHERE id = ? AND owner_key = ?`,
    [id, userId]
  );
  if (folders.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Unset folder_id on files in this folder
  await mutateD1(
    `UPDATE files SET folder_id = NULL WHERE folder_id = ? AND storage_key LIKE ?`,
    [id, `${userId}/%`]
  );

  await mutateD1(`DELETE FROM folders WHERE id = ?`, [id]);
  return NextResponse.json({ success: true });
}
