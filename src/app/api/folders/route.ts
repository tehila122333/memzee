import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { queryD1, mutateD1 } from "@/lib/d1";
import type { FolderRecord } from "@/types";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const folders = await queryD1<FolderRecord>(
    `SELECT * FROM folders WHERE owner_key = ? ORDER BY created_at ASC`,
    [userId]
  );

  return NextResponse.json({ folders });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { name, parentId } = body;

  if (!name || typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const id = nanoid();
  await mutateD1(
    `INSERT INTO folders (id, name, parent_id, owner_key) VALUES (?, ?, ?, ?)`,
    [id, name.trim(), parentId ?? null, userId]
  );

  return NextResponse.json({ id, name: name.trim(), parent_id: parentId ?? null, owner_key: userId });
}
