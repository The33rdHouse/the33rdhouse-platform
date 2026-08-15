import express, { type Express } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./api/router";
import { createHttpContext } from "./api/context";

export function createApp(): Express {
  const app = express();
  app.disable("x-powered-by");
  app.use(express.json({ limit: "1mb" }));
  app.get("/health", (_request, response) => {
    response.status(200).json({ status: "ok", service: "canonical-content-core" });
  });
  app.use(
    "/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext: createHttpContext,
    }),
  );
  return app;
}
