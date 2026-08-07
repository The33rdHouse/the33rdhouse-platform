import { z } from "zod";

const postgresUrl = z.string().min(1).superRefine((value, ctx) => {
  if (!value.startsWith("postgres://") && !value.startsWith("postgresql://")) {
    ctx.addIssue({
      code: "custom",
      message: "DATABASE_URL must use postgres:// or postgresql://",
    });
  }
});

const envSchema = z.object({
  DATABASE_URL: postgresUrl,
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  SOURCE_EVIDENCE_DIR: z.string().min(1).default("source-evidence"),
  R2_ACCOUNT_ID: z.string().min(1).optional(),
  R2_ACCESS_KEY_ID: z.string().min(1).optional(),
  R2_SECRET_ACCESS_KEY: z.string().min(1).optional(),
  R2_BUCKET_NAME: z.string().min(1).optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

export function parseEnv(input: Record<string, unknown>): AppEnv {
  return envSchema.parse(input);
}

let loadedEnv: AppEnv | undefined;

function loadEnv(): AppEnv {
  loadedEnv ??= parseEnv(process.env);
  return loadedEnv;
}

export const env = new Proxy({} as AppEnv, {
  get(_target, property) {
    return loadEnv()[property as keyof AppEnv];
  },
});
