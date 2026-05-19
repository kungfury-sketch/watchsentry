import { Hono } from "hono";
import { runDailyRefresh } from "./cron";

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
  scheduled: async (_event: ScheduledEvent, env: Env, _ctx: ExecutionContext) => {
    await runDailyRefresh(env);
  },
};
