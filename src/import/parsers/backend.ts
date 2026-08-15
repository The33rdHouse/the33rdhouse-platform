import { createHash } from "node:crypto";
import { basename, extname } from "node:path";
import { backendAssetManifestSchema } from "../schemas/backend";
import { type ParsedSourcePackage, stagingRecord } from "../types";
import { parseStaticExportedArray } from "./static-ts";
import { findRequiredEntry, openZip, readEntryText, readJsonEntry, type ZipDirectory } from "./zip";

async function appendStaticArray(
  directory: ZipDirectory,
  records: ParsedSourcePackage["records"],
  sourceSuffix: string,
  exportName: string,
  kind: string,
): Promise<void> {
  const entry = findRequiredEntry(directory, sourceSuffix);
  const source = await readEntryText(entry);
  const parsed = parseStaticExportedArray(source, exportName);

  parsed.forEach((item, index) => {
    const extractedId = item.id;
    const sourceRecordId =
      typeof extractedId === "string" || typeof extractedId === "number" ? extractedId : index;
    records.push(stagingRecord(kind, entry.path, sourceRecordId, item));
  });
}

export async function parseBackend(zipPath: string): Promise<ParsedSourcePackage> {
  const directory = await openZip(zipPath);
  const records: ParsedSourcePackage["records"] = [];
  const media: ParsedSourcePackage["media"] = [];
  const files = directory.files.filter((entry) => entry.type !== "Directory");

  for (const entry of files) {
    if (
      entry.path.includes("/server/") ||
      entry.path.includes("/app/") ||
      entry.path.includes("/lib/data/") ||
      entry.path.includes("/lib/assets/")
    ) {
      records.push(
        stagingRecord("file_inventory", entry.path, entry.path, {
          path: entry.path,
          extension: extname(entry.path),
        }),
      );
    }

    if (/\/assets\/audio\/meditations\/[^/]+\.mp3$/i.test(entry.path)) {
      const realmMatch = /realm_(\d{3})_/i.exec(basename(entry.path));
      const bytes = await entry.buffer();
      media.push({
        sourcePath: entry.path,
        fileName: basename(entry.path),
        realmIndex: realmMatch ? Number(realmMatch[1]) : undefined,
        mimeType: "audio/mpeg",
        sha256: createHash("sha256").update(bytes).digest("hex"),
      });
    }
  }

  await appendStaticArray(
    directory,
    records,
    "the-33rd-house/lib/data/meditation-realms.ts",
    "MEDITATION_REALMS",
    "backend_realm_variant",
  );
  await appendStaticArray(
    directory,
    records,
    "the-33rd-house/lib/data/era-timelines.ts",
    "ERA_TIMELINES",
    "backend_era",
  );
  await appendStaticArray(
    directory,
    records,
    "the-33rd-house/lib/data/library-books.ts",
    "LIBRARY_BOOKS",
    "backend_book",
  );

  const assetManifest = await readJsonEntry(
    directory,
    "the-33rd-house/lib/assets/manifest.json",
    backendAssetManifestSchema,
  );
  assetManifest.data.assets.forEach((asset, index) => {
    records.push(stagingRecord("backend_asset", assetManifest.path, index + 1, asset));
  });

  return {
    sourceId: "complete-backend",
    records,
    media,
    warnings: [
      "TypeScript/TSX modules are never imported or executed; selected exported data arrays are parsed with the TypeScript compiler API and literal-only AST evaluation.",
      "Backend source references missing local modules and is treated as source evidence rather than runtime scaffolding.",
    ],
  };
}
