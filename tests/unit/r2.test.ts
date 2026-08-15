import { describe, expect, it } from "vitest";
import { createR2Client, parseR2WriteEnv } from "../../src/media/r2";

describe("Cloudflare R2 adapter", () => {
  it("configures the S3 client for the account endpoint and auto region", async () => {
    const env = parseR2WriteEnv({
      R2_ACCOUNT_ID: "account123",
      R2_ACCESS_KEY_ID: "access-key",
      R2_SECRET_ACCESS_KEY: "secret-key",
      R2_BUCKET: "canonical-media",
    });
    const client = createR2Client(env);

    expect(await client.config.region()).toBe("auto");
    const endpoint = await client.config.endpoint?.();
    expect(endpoint?.hostname).toBe("account123.r2.cloudflarestorage.com");
    expect(env.R2_BUCKET).toBe("canonical-media");
  });

  it("fails closed when write credentials are incomplete", () => {
    expect(() => parseR2WriteEnv({ R2_ACCOUNT_ID: "account123" })).toThrow();
  });
});
