import { z } from "zod";

export const backendAssetManifestSchema = z
  .object({
    assets: z.array(
      z
        .object({
          name: z.string().min(1),
          path: z.string().min(1),
          size: z.number().int().nonnegative(),
          category: z.string().optional(),
          type: z.string().optional(),
        })
        .passthrough(),
    ),
  })
  .passthrough();

export const staticSourceRecordSchema = z.object({
  rawSource: z.string().min(1),
  fields: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])),
});
