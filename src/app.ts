import {
  authenticate,
  requireSameOrigin,
  installSessionRoutes,
} from "./console/session";
import { installVault } from "./console/vault";
import { resolve } from "node:path";
import express, { type Express } from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "./api/router";
import { createHttpContext } from "./api/context";

export function createApp(): Express {
  const app = express();
  app.disable("x-powered-by");
  app.use((_request, response, next) => {
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Referrer-Policy", "no-referrer");
    response.setHeader(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'",
    );
    response.setHeader("Cache-Control", "no-store");
    next();
  });
  app.use(express.json({ limit: "1mb" }));
  app.get("/health", (_request, response) => {
    response
      .status(200)
      .json({ status: "ok", service: "canonical-content-core" });
  });
  app.use(requireSameOrigin);
  installSessionRoutes(app);
  app.use(authenticate);
  installVault(app);
  app.use(
    "/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext: createHttpContext,
    }),
  );
  app.use(express.static(resolve("dist/client")));
  return app;
}
