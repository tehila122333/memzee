import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getR2Client } from "./r2";

export async function generateDownloadPresignedUrl(
  storageKey: string,
  fileName: string
): Promise<string> {
  const client = getR2Client();
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: storageKey,
    ResponseContentDisposition: `attachment; filename="${encodeURIComponent(fileName)}"`,
  });
  return getSignedUrl(client, command, { expiresIn: 3600 });
}

export async function generatePreviewPresignedUrl(storageKey: string): Promise<string> {
  const client = getR2Client();
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: storageKey,
  });
  return getSignedUrl(client, command, { expiresIn: 3600 });
}
