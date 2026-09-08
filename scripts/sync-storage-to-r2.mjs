#!/usr/bin/env node
/**
 * Upload local ./storage to Cloudflare R2 using credentials from .env.local
 * Usage: npm run sync:r2
 */

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const storageDir = path.join(root, "storage");
const envPath = path.join(root, ".env.local");

function loadEnv(filePath) {
  const env = {};
  return fs
    .readFile(filePath, "utf8")
    .then((raw) => {
      for (const line of raw.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const i = trimmed.indexOf("=");
        if (i === -1) continue;
        env[trimmed.slice(0, i).trim()] = trimmed.slice(i + 1).trim();
      }
      return env;
    })
    .catch(() => env);
}

function contentTypeFor(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".json":
      return "application/json";
    case ".webp":
      return "image/webp";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    default:
      return "application/octet-stream";
  }
}

async function collectFiles(dir, base = dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(full, base)));
    } else if (entry.isFile()) {
      files.push({
        absolute: full,
        key: path.relative(base, full).split(path.sep).join("/"),
      });
    }
  }
  return files;
}

async function main() {
  const env = await loadEnv(envPath);
  const accountId = env.R2_ACCOUNT_ID;
  const accessKeyId = env.R2_ACCESS_KEY_ID;
  const secretAccessKey = env.R2_SECRET_ACCESS_KEY;
  const bucket = env.R2_BUCKET_NAME;

  const missing = [
    ["R2_ACCOUNT_ID", accountId],
    ["R2_ACCESS_KEY_ID", accessKeyId],
    ["R2_SECRET_ACCESS_KEY", secretAccessKey],
    ["R2_BUCKET_NAME", bucket],
  ].filter(([, value]) => !value);

  if (missing.length > 0) {
    console.error(
      "Missing R2 credentials in .env.local:",
      missing.map(([name]) => name).join(", "),
    );
    process.exit(1);
  }

  try {
    await fs.access(storageDir);
  } catch {
    console.error("No ./storage directory found.");
    process.exit(1);
  }

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });

  const files = await collectFiles(storageDir);
  if (files.length === 0) {
    console.log("Nothing to upload in ./storage");
    return;
  }

  console.log(`Uploading ${files.length} file(s) to R2 bucket "${bucket}"…`);

  let uploaded = 0;
  for (const file of files) {
    const body = await fs.readFile(file.absolute);
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: file.key,
        Body: body,
        ContentType: contentTypeFor(file.absolute),
      }),
    );
    uploaded += 1;
    if (uploaded % 10 === 0 || uploaded === files.length) {
      console.log(`  ${uploaded}/${files.length}`);
    }
  }

  console.log("Done.");
  if (env.R2_PUBLIC_URL) {
    console.log(`Public media base: ${env.R2_PUBLIC_URL.replace(/\/$/, "")}`);
  } else {
    console.log(
      "Tip: set R2_PUBLIC_URL in Vercel for direct image URLs (optional).",
    );
  }
}

main().catch((error) => {
  console.error("Sync failed:", error);
  process.exit(1);
});
