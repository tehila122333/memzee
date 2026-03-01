import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { queryD1 } from "@/lib/d1";

const TOTAL_BYTES = 107_374_182_400; // 100 GB

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await queryD1<{ used: number | null }>(
    `SELECT SUM(size_bytes) as used FROM files
     WHERE storage_key LIKE ? AND deleted_at IS NULL`,
    [`${userId}/%`]
  );

  const used = rows[0]?.used ?? 0;
  return NextResponse.json({ used, total: TOTAL_BYTES });
}
