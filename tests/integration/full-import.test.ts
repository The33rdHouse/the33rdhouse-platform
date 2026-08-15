import { describe, expect, it } from "vitest";
import { inventoryEvidenceDirectory } from "../../src/import/evidence";
import { parseBackend } from "../../src/import/parsers/backend";
import { parseDeityAtlas } from "../../src/import/parsers/deity-atlas";
import { parseEscapeMatrix } from "../../src/import/parsers/escape-matrix";
import { planRealmReconciliations } from "../../src/import/pipeline";
import { buildRealmMediaRegistry } from "../../src/media/registry";
import { rankRulesFromSources } from "../../src/progression/import";

const sourceDir = process.env.SOURCE_EVIDENCE_DIR ?? "";

const expectedHashes = new Map<string, string>([
  ["complete-backend", "807118cb83c9c2a3d17208dc2359500ebd8b9b9535b59063887a097ba5103859"],
  ["escape-matrix", "723f4939fee408c45662bfcb02fda5e453c4241b0d1c44533bb89980f490bd5e"],
  ["deity-atlas", "63de0efb96498508d809c12302cead3ba6e0eb4f6adeab68a22e0ba6f558aa1d"],
]);

describe.skipIf(!sourceDir)("controlled full-source verification", () => {
  it("verifies all evidence and minimum corpus counts before promotion", async () => {
    const evidence = await inventoryEvidenceDirectory(sourceDir);
    expect(evidence).toHaveLength(3);
    for (const item of evidence) {
      if (!item.id) throw new Error(`Verified evidence item is missing an ID: ${item.fileName}`);
      expect(item.sha256).toBe(expectedHashes.get(item.id));
    }

    const byId = new Map<string, string>();
    for (const item of evidence) {
      if (!item.id) throw new Error(`Verified evidence item is missing an ID: ${item.fileName}`);
      byId.set(item.id, item.filePath);
    }

    const backendPath = byId.get("complete-backend");
    const escapeMatrixPath = byId.get("escape-matrix");
    const deityAtlasPath = byId.get("deity-atlas");
    if (!backendPath || !escapeMatrixPath || !deityAtlasPath) {
      throw new Error("Verified full-source package set is incomplete");
    }

    const backend = await parseBackend(backendPath);
    const escapeMatrix = await parseEscapeMatrix(escapeMatrixPath);
    const deityAtlas = await parseDeityAtlas(deityAtlasPath);

    expect(deityAtlas.records.filter((item) => item.kind === "deity")).toHaveLength(447);
    expect(deityAtlas.records.filter((item) => item.kind === "realm_variant")).toHaveLength(144);
    expect(deityAtlas.records.filter((item) => item.kind === "meditation_realm_variant")).toHaveLength(144);
    expect(deityAtlas.records.filter((item) => item.kind === "weekly_script")).toHaveLength(48);
    expect(deityAtlas.records.filter((item) => item.kind === "research_library")).toHaveLength(15);
    expect(deityAtlas.records.filter((item) => item.kind === "era")).toHaveLength(8);

    expect(escapeMatrix.records.filter((item) => item.kind === "tradition")).toHaveLength(66);
    expect(escapeMatrix.records.filter((item) => item.kind === "gate")).toHaveLength(12);
    expect(escapeMatrix.records.filter((item) => item.kind === "path")).toHaveLength(12);
    expect(escapeMatrix.records.filter((item) => item.kind === "rank")).toHaveLength(8);
    expect(escapeMatrix.records.filter((item) => item.kind === "law")).toHaveLength(12);
    expect(escapeMatrix.records.filter((item) => item.kind === "trap")).toHaveLength(4);

    expect(backend.records.filter((item) => item.kind === "backend_realm_variant")).toHaveLength(24);
    expect(backend.media).toHaveLength(55);

    const media = buildRealmMediaRegistry(backend);
    expect(media.filter((item) => item.availability === "AVAILABLE")).toHaveLength(55);
    expect(media.filter((item) => item.availability === "MISSING")).toHaveLength(89);

    const reconciliations = planRealmReconciliations([backend, escapeMatrix, deityAtlas]);
    expect(reconciliations).toHaveLength(144);
    expect(reconciliations.filter((item) => item.status === "UNDER_REVIEW").length).toBeGreaterThanOrEqual(134);
    expect(rankRulesFromSources([backend, escapeMatrix, deityAtlas])).toHaveLength(8);
  });
});
