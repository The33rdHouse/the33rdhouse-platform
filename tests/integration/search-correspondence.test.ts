import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { inArray } from "drizzle-orm";
import { db } from "../../src/db/client";
import { canonObjects, correspondences, deities } from "../../src/db/schema";
import { createContext } from "../../src/api/context";
import { appRouter } from "../../src/api/router";

const approvedId = "deity-release-approved";
const reviewId = "deity-release-review";
const correspondenceId = "corr-release-approved";

async function cleanup(): Promise<void> {
  await db.delete(correspondences).where(inArray(correspondences.id, [correspondenceId]));
  await db.delete(canonObjects).where(inArray(canonObjects.id, [approvedId, reviewId]));
  await db.delete(deities).where(inArray(deities.id, [approvedId, reviewId]));
}

beforeEach(async () => {
  await cleanup();
  await db.insert(deities).values([
    { id: approvedId, canonicalName: "Release Search Approved" },
    { id: reviewId, canonicalName: "Release Search Review" },
  ]);
  await db.insert(canonObjects).values([
    {
      id: approvedId,
      objectType: "deity",
      level: "CONTENT",
      status: "APPROVED",
      currentVersion: 0,
    },
    {
      id: reviewId,
      objectType: "deity",
      level: "CONTENT",
      status: "UNDER_REVIEW",
      currentVersion: 0,
    },
  ]);
  await db.insert(correspondences).values({
    id: correspondenceId,
    fromObjectId: approvedId,
    toObjectId: "concept-release-target",
    relationType: "RELEASE_TEST_CONNECTION",
  });
});

afterEach(cleanup);

describe("release search and correspondence queries", () => {
  it("keeps Atlas search approval-filtered and correspondence search bounded", async () => {
    const caller = appRouter.createCaller(await createContext({ database: db, userId: null }));

    const atlas = await caller.atlas.search({ query: "Release Search", limit: 100 });
    expect(atlas.items.map((item) => item.id)).toEqual([approvedId]);

    const correspondence = await caller.correspondences.search({
      query: "release-approved",
      limit: 100,
    });
    expect(correspondence.items.map((item) => item.id)).toEqual([correspondenceId]);
  });
});
