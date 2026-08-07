import * as unzipper from "unzipper";
import { z, type ZodType } from "zod";

export type ZipDirectory = unzipper.Directory;
export type ZipEntry = unzipper.Entry;

export async function openZip(zipPath: string): Promise<ZipDirectory> {
  try {
    return await unzipper.Open.file(zipPath);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Unable to open source ZIP ${zipPath}: ${message}`, { cause: error });
  }
}

export function findRequiredEntry(directory: ZipDirectory, suffix: string): ZipEntry {
  const matches = directory.files.filter(
    (entry) => entry.type !== "Directory" && (entry.path === suffix || entry.path.endsWith(`/${suffix}`)),
  );

  if (matches.length !== 1) {
    throw new Error(`Expected exactly one ZIP entry ending in ${suffix}; found ${matches.length}`);
  }

  return matches[0]!;
}

export async function readEntryText(entry: ZipEntry): Promise<string> {
  return (await entry.buffer()).toString("utf8");
}

export async function readJsonEntry<T>(
  directory: ZipDirectory,
  suffix: string,
  schema: ZodType<T>,
): Promise<{ path: string; data: T }> {
  const entry = findRequiredEntry(directory, suffix);
  const text = await readEntryText(entry);
  let raw: unknown;

  try {
    raw = JSON.parse(text);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid JSON in ${entry.path}: ${message}`, { cause: error });
  }

  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new Error(`Schema validation failed for ${entry.path}: ${z.prettifyError(result.error)}`);
  }

  return { path: entry.path, data: result.data };
}
