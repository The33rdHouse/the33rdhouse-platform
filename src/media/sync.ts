import { createHash } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { mediaAssets, realmMedia } from "../db/schema";
import type { CanonicalDatabase } from "../canon/promotion";
import { openZip } from "../import/parsers/zip";
import type { ParsedSourcePackage } from "../import/types";
import { buildRealmMediaRegistry } from "./registry";
import { createR2Client, parseR2WriteEnv } from "./r2";

export type MediaSyncReport = {
  available: number;
  missing: number;
  uploaded: number;
  persisted: number;
};

export type MediaSyncOptions = {
  dryRun: boolean;
  parsedBackend: ParsedSourcePackage;
  sourceZipPath?: string;
  database?: CanonicalDatabase;
  r2Env?: Record<string, unknown>;
};

export async function syncMedia(options: MediaSyncOptions): Promise<MediaSyncReport> {
  const registry = buildRealmMediaRegistry(options.parsedBackend);
  const available = registry.filter((item) => item.availability === "AVAILABLE").length;
  const missing = registry.length - available;

  if (options.dryRun) {
    return { available, missing, uploaded: 0, persisted: 0 };
  }

  if (!options.sourceZipPath) throw new Error("sourceZipPath is required for media write mode");
  if (!options.database) throw new Error("database is required for media write mode");

  const env = parseR2WriteEnv(options.r2Env ?? process.env);
  const client = createR2Client(env);
  const directory = await openZip(options.sourceZipPath);
  let uploaded = 0;

  try {
    for (const registration of registry) {
      if (registration.availability !== "AVAILABLE") continue;
      if (!registration.sourcePath || !registration.r2Key || !registration.sha256) {
        throw new Error(`Incomplete AVAILABLE media registration for ${registration.realmId}`);
      }
      const entry = directory.files.find(
        (candidate) => candidate.type !== "Directory" && candidate.path === registration.sourcePath,
      );
      if (!entry) throw new Error(`Source audio entry missing: ${registration.sourcePath}`);
      const bytes = await entry.buffer();
      const actualSha256 = createHash("sha256").update(bytes).digest("hex");
      if (actualSha256 !== registration.sha256) {
        throw new Error(`Media SHA-256 mismatch for ${registration.sourceFilename}`);
      }

      await client.send(
        new PutObjectCommand({
          Bucket: env.R2_BUCKET,
          Key: registration.r2Key,
          Body: bytes,
          ContentType: registration.mimeType,
          Metadata: {
            sha256: registration.sha256,
            realm: registration.realmId,
            sourcePackage: registration.sourcePackage,
          },
        }),
      );
      uploaded += 1;
    }

    await options.database.transaction(async (tx) => {
      for (const registration of registry) {
        const storageKey =
          registration.r2Key ?? `meditations/${registration.realmId}/missing-audio`;
        await tx
          .insert(mediaAssets)
          .values({
            id: registration.mediaId,
            assetType: "realm-meditation-audio",
            storageProvider: "cloudflare-r2",
            storageKey,
            mimeType: registration.mimeType,
            sha256: registration.sha256,
            version: 1,
            publicationStatus: "DRAFT",
            availability: registration.availability,
          })
          .onConflictDoUpdate({
            target: mediaAssets.id,
            set: {
              storageProvider: "cloudflare-r2",
              storageKey,
              mimeType: registration.mimeType,
              sha256: registration.sha256,
              availability: registration.availability,
            },
          });

        await tx
          .insert(realmMedia)
          .values({ realmId: registration.realmId, mediaAssetId: registration.mediaId })
          .onConflictDoNothing();
      }
    });

    return { available, missing, uploaded, persisted: registry.length };
  } finally {
    client.destroy();
  }
}
