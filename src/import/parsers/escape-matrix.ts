import { escapeMatrixAggregateSchema } from "../schemas/escape-matrix";
import { type ParsedSourcePackage, stagingRecord } from "../types";
import { openZip, readJsonEntry } from "./zip";

export async function parseEscapeMatrix(zipPath: string): Promise<ParsedSourcePackage> {
  const directory = await openZip(zipPath);
  const { path, data } = await readJsonEntry(
    directory,
    "escape-matrix-data/traditions.json",
    escapeMatrixAggregateSchema,
  );
  const records: ParsedSourcePackage["records"] = [];

  const append = (kind: string, items: Array<Record<string, unknown> & { id: string | number }>) => {
    for (const item of items) records.push(stagingRecord(kind, path, item.id, item));
  };

  append("era", data.eras);
  append("gate", data.gates);
  append("path", data.paths);
  append("rank", data.ranks);
  append("trap", data.matrix_traps);
  append("tradition", data.traditions);
  append("law", data.laws);
  append("achievement", data.achievements);
  records.push(stagingRecord("law_lore_framework", path, "law-lore-framework", data.law_lore_framework));

  return {
    sourceId: "escape-matrix",
    records,
    media: [],
    warnings: [
      "Parsed aggregate traditions.json only; derivative per-category JSON files are treated as duplicate source views.",
    ],
  };
}
