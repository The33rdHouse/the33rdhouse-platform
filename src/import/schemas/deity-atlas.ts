import { z } from "zod";

const idSchema = z.union([z.string(), z.number()]);

export const deitySchema = z
  .object({
    id: idSchema,
    name_primary: z.string().min(1),
  })
  .passthrough();

export const realmsDataSchema = z
  .object({
    meta: z.record(z.string(), z.unknown()).optional(),
    realms: z.array(
      z
        .object({
          number: z.number().int(),
          name: z.string().min(1),
          gate: z.union([z.string(), z.number()]),
        })
        .passthrough(),
    ),
  })
  .passthrough();

export const meditationDataSchema = z
  .object({
    realms: z.array(
      z
        .object({
          realm: z.number().int(),
          name: z.string().min(1),
          gate: z.union([z.string(), z.number()]),
        })
        .passthrough(),
    ),
    weeklyScripts: z.array(
      z
        .object({
          gate: z.union([z.string(), z.number()]),
          week: z.number().int(),
          title: z.string().min(1),
        })
        .passthrough(),
    ),
  })
  .passthrough();

export const researchLibrarySchema = z.array(
  z
    .object({
      id: idSchema,
      category: z.string().min(1),
    })
    .passthrough(),
);

export const eraSystemsSchema = z
  .object({
    eras: z.array(
      z
        .object({
          id: idSchema,
          name: z.string().min(1),
        })
        .passthrough(),
    ),
  })
  .passthrough();

export const cosmologySchema = z
  .object({
    zodiac: z.record(z.string(), z.unknown()),
    planets: z.record(z.string(), z.unknown()),
    fixedStars: z.record(z.string(), z.unknown()),
    gates: z.record(z.string(), z.unknown()),
    traditions: z.record(z.string(), z.unknown()),
    chakras: z.record(z.string(), z.unknown()),
  })
  .passthrough();

export const platformDataSchema = z
  .object({
    meta: z.record(z.string(), z.unknown()),
    schema: z.record(z.string(), z.unknown()),
    api: z.record(z.string(), z.unknown()),
    governance: z.record(z.string(), z.unknown()),
  })
  .passthrough();

export const deitySeriesSchema = z.array(z.record(z.string(), z.unknown()));
