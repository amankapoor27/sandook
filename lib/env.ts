import { z } from "zod";
import {
  DEFAULT_ADMIN_PASSWORD,
  DEFAULT_SESSION_SECRET,
  isDefaultAdminPassword,
  isDefaultSessionSecret,
} from "./env-defaults";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  ADMIN_PASSWORD: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),
  R2_PUBLIC_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;

function assertProductionSecrets(adminPassword: string, sessionSecret: string) {
  const enforceSecrets =
    process.env.VERCEL_ENV === "production" ||
    process.env.SANDOOK_ENFORCE_SECRETS === "true";

  if (!enforceSecrets) return;

  if (isDefaultAdminPassword(adminPassword)) {
    throw new Error(
      "ADMIN_PASSWORD must be set to a strong value in production (default 'dev' is not allowed).",
    );
  }

  if (isDefaultSessionSecret(sessionSecret)) {
    throw new Error(
      "SESSION_SECRET must be set to a unique random value in production (dev default is not allowed).",
    );
  }
}

function loadEnv(): Env {
  const adminPassword =
    process.env.ADMIN_PASSWORD?.trim() || DEFAULT_ADMIN_PASSWORD;
  const sessionSecretRaw = process.env.SESSION_SECRET?.trim();
  const sessionSecret =
    sessionSecretRaw && sessionSecretRaw.length >= 32
      ? sessionSecretRaw
      : DEFAULT_SESSION_SECRET;

  assertProductionSecrets(adminPassword, sessionSecret);

  const raw = {
    NODE_ENV: process.env.NODE_ENV,
    ADMIN_PASSWORD: adminPassword,
    SESSION_SECRET: sessionSecret,
    R2_ACCOUNT_ID: process.env.R2_ACCOUNT_ID,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
    R2_PUBLIC_URL: process.env.R2_PUBLIC_URL,
  };

  const result = envSchema.safeParse(raw);
  if (!result.success) {
    throw new Error(
      `Invalid environment:\n${result.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n")}`,
    );
  }

  return result.data;
}

let cached: Env | null = null;

export function getEnv(): Env {
  if (!cached) {
    cached = loadEnv();
  }
  return cached;
}

export function isR2Configured(): boolean {
  const env = getEnv();
  return Boolean(
    env.R2_ACCOUNT_ID &&
      env.R2_ACCESS_KEY_ID &&
      env.R2_SECRET_ACCESS_KEY &&
      env.R2_BUCKET_NAME,
  );
}
