import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Client } from "./r2";

export async function generateUploadPresignedUrl(
  storageKey: string,
  contentType: string
): Promise<string> {
  const client = getR2Client();
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: storageKey,
    ContentType: contentType,
  });
  return getSignedUrl(client, command, { expiresIn: 3600 });
}
