import { Hono } from "hono";
import { cors } from "hono/cors";
import { runDailyRefresh } from "./cron";
import { enrich, enrichRequestSchema } from "./enrich";

export type Env = {
  DB: D1Database;
  CACHE: KVNamespace;
  EBAY_APP_ID: string;
  EBAY_CERT_ID: string;
};

const app = new Hono<{ Bindings: Env }>();

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
    maxAge: 86400,
  }),
);

app.get("/health", (c) => c.json({ ok: true, name: "watchsentry-api" }));

app.post("/enrich", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = enrichRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "invalid_request", details: parsed.error.flatten() }, 400);
  }
  const result = await enrich(c.env, parsed.data);
  return c.json(result);
});

export default {
  fetch: app.fetch,
  scheduled: async (_event: ScheduledEvent, env: Env, _ctx: ExecutionContext) => {
    await runDailyRefresh(env);
  },
};
