import { Hono } from "hono";

export type Env = {
  DB: D1Database;
  CACHE: KVNamespace;
  EBAY_APP_ID: string;
  EBAY_CERT_ID: string;
};

const app = new Hono<{ Bindings: Env }>();

app.get("/health", (c) => c.json({ ok: true, name: "watchsentry-api" }));

export default {
  fetch: app.fetch,
  scheduled: async (_event: ScheduledEvent, _env: Env, _ctx: ExecutionContext) => {
    // Cron entry — wired to runDailyRefresh in Task 2.7
  },
};
