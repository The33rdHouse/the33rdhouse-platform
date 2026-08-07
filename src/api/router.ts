import { router } from "./trpc";
import { adminRouter } from "./routers/admin";
import { atlasRouter } from "./routers/atlas";
import { claimsRouter } from "./routers/claims";
import { correspondencesRouter } from "./routers/correspondences";
import { gatesRouter } from "./routers/gates";
import { pathsRouter } from "./routers/paths";
import { realmsRouter } from "./routers/realms";
import { researchRouter } from "./routers/research";
import { traditionsRouter } from "./routers/traditions";

export const appRouter = router({
  atlas: atlasRouter,
  traditions: traditionsRouter,
  gates: gatesRouter,
  realms: realmsRouter,
  paths: pathsRouter,
  correspondences: correspondencesRouter,
  research: researchRouter,
  claims: claimsRouter,
  admin: adminRouter,
});

export type AppRouter = typeof appRouter;
