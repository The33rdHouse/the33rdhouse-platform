export type StagingRecord = {
  kind: string;
  sourcePath: string;
  sourceRecordId: string;
  payload: Record<string, unknown>;
};

export type ParsedMedia = {
  sourcePath: string;
  fileName: string;
  realmIndex?: number;
  mimeType?: string;
};

export type ParsedSourcePackage = {
  sourceId: "deity-atlas" | "escape-matrix" | "complete-backend";
  records: StagingRecord[];
  media: ParsedMedia[];
  warnings: string[];
};

export function stagingRecord(
  kind: string,
  sourcePath: string,
  sourceRecordId: string | number,
  payload: Record<string, unknown>,
): StagingRecord {
  return {
    kind,
    sourcePath,
    sourceRecordId: String(sourceRecordId),
    payload,
  };
}
