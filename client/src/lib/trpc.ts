import { createTRPCClient, httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import type { AppRouter } from "../../../src/api/router";
export const api = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/trpc",
      transformer: superjson,
      fetch(url, options) {
        return fetch(url, { ...options, credentials: "same-origin" });
      },
    }),
  ],
});
