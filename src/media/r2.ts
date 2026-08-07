import { S3Client } from "@aws-sdk/client-s3";
import { z } from "zod";

const r2WriteEnvSchema = z.object({
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET: z.string().min(1),
});

export type R2WriteEnv = z.infer<typeof r2WriteEnvSchema>;

export function parseR2WriteEnv(input: Record<string, unknown>): R2WriteEnv {
  return r2WriteEnvSchema.parse(input);
}

export function createR2Client(env: R2WriteEnv): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });
}
