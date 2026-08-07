import { realmId } from "../canon/ids";
import type { ParsedSourcePackage } from "../import/types";

export type RealmMediaAvailability = "AVAILABLE" | "MISSING";

export type RealmMediaRegistration = {
  mediaId: string;
  realmId: string;
  realmNumber: number;
  sourcePackage: "complete-backend";
  sourcePath?: string;
  sourceFilename?: string;
  mimeType: "audio/mpeg";
  sha256?: string;
  r2Key?: string;
  availability: RealmMediaAvailability;
};

function validateRealmIndex(value: number): number {
  if (!Number.isInteger(value)) throw new Error("Realm media index must be an integer");
  if (value < 0 || value > 143) throw new Error("Realm media index must be between 0 and 143");
  return value;
}

export function buildRealmMediaRegistry(
  parsedBackend: ParsedSourcePackage,
): RealmMediaRegistration[] {
  if (parsedBackend.sourceId !== "complete-backend") {
    throw new Error("Realm media registry requires the complete-backend source package");
  }

  const byIndex = new Map<number, (typeof parsedBackend.media)[number]>();
  for (const media of parsedBackend.media) {
    if (media.realmIndex === undefined) throw new Error(`Realm media index missing for ${media.fileName}`);
    const index = validateRealmIndex(media.realmIndex);
    if (byIndex.has(index)) throw new Error(`Duplicate Realm media index: ${index}`);
    if (media.mimeType !== "audio/mpeg") throw new Error(`Unexpected Realm audio MIME type: ${media.mimeType}`);
    if (!media.sha256 || !/^[a-f0-9]{64}$/i.test(media.sha256)) {
      throw new Error(`Realm audio SHA-256 missing or invalid: ${media.fileName}`);
    }
    byIndex.set(index, media);
  }

  return Array.from({ length: 144 }, (_, index) => {
    const realmNumber = index + 1;
    const stableRealmId = realmId(realmNumber);
    const mediaId = `media-${stableRealmId}-audio`;
    const source = byIndex.get(index);

    if (!source) {
      return {
        mediaId,
        realmId: stableRealmId,
        realmNumber,
        sourcePackage: "complete-backend" as const,
        mimeType: "audio/mpeg" as const,
        availability: "MISSING" as const,
      };
    }

    return {
      mediaId,
      realmId: stableRealmId,
      realmNumber,
      sourcePackage: "complete-backend" as const,
      sourcePath: source.sourcePath,
      sourceFilename: source.fileName,
      mimeType: "audio/mpeg" as const,
      sha256: source.sha256,
      r2Key: `meditations/${stableRealmId}/${source.fileName}`,
      availability: "AVAILABLE" as const,
    };
  });
}
