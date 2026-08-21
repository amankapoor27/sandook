import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fs from "fs/promises";
import path from "path";
import { getEnv, isR2Configured } from "./env";

const LOCAL_STORAGE_DIR = path.join(process.cwd(), "storage");

async function ensureLocalDir() {
  await fs.mkdir(LOCAL_STORAGE_DIR, { recursive: true });
}

function localPath(key: string) {
  return path.join(LOCAL_STORAGE_DIR, key);
}

function getR2Client() {
  const env = getEnv();
  return new S3Client({
    region: "auto",
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID!,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

export async function getObject(key: string): Promise<Buffer | null> {
  if (isR2Configured()) {
    const env = getEnv();
    try {
      const response = await getR2Client().send(
        new GetObjectCommand({ Bucket: env.R2_BUCKET_NAME!, Key: key }),
      );
      const bytes = await response.Body?.transformToByteArray();
      return bytes ? Buffer.from(bytes) : null;
    } catch {
      return null;
    }
  }

  try {
    return await fs.readFile(localPath(key));
  } catch {
    return null;
  }
}

export async function putObject(
  key: string,
  body: Buffer,
  contentType: string,
): Promise<void> {
  if (isR2Configured()) {
    const env = getEnv();
    await getR2Client().send(
      new PutObjectCommand({
        Bucket: env.R2_BUCKET_NAME!,
        Key: key,
        Body: body,
        ContentType: contentType,
      }),
    );
    return;
  }

  await ensureLocalDir();
  const filePath = localPath(key);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, body);
}

export async function deleteObject(key: string): Promise<void> {
  if (isR2Configured()) {
    const env = getEnv();
    await getR2Client().send(
      new DeleteObjectCommand({ Bucket: env.R2_BUCKET_NAME!, Key: key }),
    );
    return;
  }

  try {
    await fs.unlink(localPath(key));
  } catch {
    // file may already be gone
  }
}

export function getPublicUrl(key: string): string {
  if (isR2Configured()) {
    const env = getEnv();
    if (env.R2_PUBLIC_URL) {
      return `${env.R2_PUBLIC_URL.replace(/\/$/, "")}/${key}`;
    }
  }

  return `/api/media/${key.split("/").map(encodeURIComponent).join("/")}`;
}

export async function createPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn = 300,
): Promise<string> {
  if (!isR2Configured()) {
    throw new Error("Presigned uploads require R2 configuration");
  }

  const env = getEnv();
  return getSignedUrl(
    getR2Client(),
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME!,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn },
  );
}

export function getStorageMode(): "local" | "r2" {
  return isR2Configured() ? "r2" : "local";
}
