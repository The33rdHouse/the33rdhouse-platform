import { z } from "zod";

const idSchema = z.union([z.string(), z.number()]);
const namedRecord = z.object({ id: idSchema, name: z.string().min(1) }).passthrough();

export const escapeMatrixAggregateSchema = z
  .object({
    meta: z.record(z.string(), z.unknown()).optional(),
    eras: z.array(namedRecord),
    gates: z.array(namedRecord),
    paths: z.array(namedRecord),
    ranks: z.array(namedRecord),
    matrix_traps: z.array(namedRecord),
    traditions: z.array(namedRecord),
    laws: z.array(namedRecord),
    law_lore_framework: z.record(z.string(), z.unknown()),
    achievements: z.array(namedRecord),
  })
  .passthrough();
