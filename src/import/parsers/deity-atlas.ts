import {
  cosmologySchema,
  deitySchema,
  deitySeriesSchema,
  eraSystemsSchema,
  meditationDataSchema,
  platformDataSchema,
  realmsDataSchema,
  researchLibrarySchema,
} from "../schemas/deity-atlas";
import { type ParsedSourcePackage, stagingRecord } from "../types";
import { openZip, readJsonEntry } from "./zip";
import { z } from "zod";

export async function parseDeityAtlas(zipPath: string): Promise<ParsedSourcePackage> {
  const directory = await openZip(zipPath);
  const records: ParsedSourcePackage["records"] = [];

  const deities = await readJsonEntry(directory, "deity-atlas-data/deity_atlas_data.json", z.array(deitySchema));
  for (const deity of deities.data) {
    records.push(stagingRecord("deity", deities.path, deity.id, deity));
  }

  const realms = await readJsonEntry(directory, "deity-atlas-data/realms_data.json", realmsDataSchema);
  for (const realm of realms.data.realms) {
    records.push(stagingRecord("realm_variant", realms.path, realm.number, realm));
  }

  const meditation = await readJsonEntry(
    directory,
    "deity-atlas-data/meditation_data.json",
    meditationDataSchema,
  );
  for (const realm of meditation.data.realms) {
    records.push(stagingRecord("meditation_realm_variant", meditation.path, realm.realm, realm));
  }
  for (const weekly of meditation.data.weeklyScripts) {
    records.push(
      stagingRecord(
        "weekly_script",
        meditation.path,
        `${String(weekly.gate)}-${weekly.week}`,
        weekly,
      ),
    );
  }

  const library = await readJsonEntry(
    directory,
    "deity-atlas-data/research_library.json",
    researchLibrarySchema,
  );
  for (const item of library.data) {
    records.push(stagingRecord("research_library", library.path, item.id, item));
  }

  const eraSystems = await readJsonEntry(
    directory,
    "deity-atlas-data/era_systems_data.json",
    eraSystemsSchema,
  );
  for (const era of eraSystems.data.eras) {
    records.push(stagingRecord("era", eraSystems.path, era.id, era));
  }
  const { eras: _eras, ...eraMetadata } = eraSystems.data;
  records.push(stagingRecord("era_system_metadata", eraSystems.path, "era-systems", eraMetadata));

  const cosmology = await readJsonEntry(
    directory,
    "deity-atlas-data/cosmology_data.json",
    cosmologySchema,
  );
  records.push(stagingRecord("cosmology_metadata", cosmology.path, "cosmology", cosmology.data));

  const platform = await readJsonEntry(
    directory,
    "deity-atlas-data/platform_data.json",
    platformDataSchema,
  );
  records.push(stagingRecord("platform_metadata", platform.path, "platform", platform.data));

  const series = await readJsonEntry(directory, "deity-atlas-data/deity_series.json", deitySeriesSchema);
  series.data.forEach((item, index) => {
    records.push(stagingRecord("deity_series", series.path, index + 1, item));
  });

  return {
    sourceId: "deity-atlas",
    records,
    media: [],
    warnings: [],
  };
}
