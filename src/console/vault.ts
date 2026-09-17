import { readFile, realpath } from "node:fs/promises";
import { resolve, relative, isAbsolute } from "node:path";
import { createHash } from "node:crypto";
import type { Express } from "express";
// Add a file only after reviewing its classification, exact bytes and SHA-256.
export type Exhibit = {
  id: string;
  title: string;
  tier: string;
  file: string;
  sha256: string;
};
export const EXHIBITS: readonly Exhibit[] = [];
export function exhibitList() {
  return EXHIBITS.map(({ file: _file, ...entry }) => entry);
}
export async function readExhibit(
  id: string,
  root: string | undefined,
  entries: readonly Exhibit[] = EXHIBITS,
) {
  const entry = entries.find((item) => item.id === id);
  if (!entry || !root) return null;
  const base = await realpath(root);
  const path = await realpath(resolve(base, entry.file));
  const rel = relative(base, path);
  if (rel.startsWith("..") || isAbsolute(rel))
    throw new Error("Invalid exhibit path");
  const data = await readFile(path);
  if (createHash("sha256").update(data).digest("hex") !== entry.sha256)
    throw new Error("Exhibit integrity mismatch");
  return { data, entry };
}
export function installVault(app: Express) {
  app.get("/api/exhibits/:id", async (request, response) => {
    response.setHeader("Cache-Control", "no-store");
    if (!response.locals.authUserId) {
      response.status(401).json({ error: "Authentication required" });
      return;
    }
    try {
      const result = await readExhibit(
        String(request.params.id),
        process.env.EXHIBIT_ROOT,
      );
      if (!result) {
        response.status(404).json({ error: "Exhibit unavailable" });
        return;
      }
      response.setHeader("Content-Type", "application/octet-stream");
      response.setHeader(
        "Content-Disposition",
        `attachment; filename="${result.entry.id.replace(/[^a-zA-Z0-9_-]/g, "_")}.bin"`,
      );
      response.send(result.data);
    } catch {
      response.status(503).json({ error: "Exhibit unavailable" });
    }
  });
}
