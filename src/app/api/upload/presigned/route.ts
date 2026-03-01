import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { generateStorageKey } from "@/lib/storage-key";
import { generateUploadPresignedUrl } from "@/lib/upload";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { fileName, contentType, sizeBytes } = body;

  if (!fileName || !contentType || !sizeBytes) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const storageKey = generateStorageKey(userId, fileName);
  const fileId = nanoid();
  const uploadUrl = await generateUploadPresignedUrl(storageKey, contentType);

  let thumbnailUploadUrl: string | undefined;
  let thumbnailKey: string | undefined;
  if (contentType.startsWith("image/")) {
    thumbnailKey = `thumbnails/${userId}/${fileId}.webp`;
    thumbnailUploadUrl = await generateUploadPresignedUrl(thumbnailKey, "image/webp");
  }

  return NextResponse.json({ uploadUrl, storageKey, fileId, thumbnailUploadUrl, thumbnailKey });
}
