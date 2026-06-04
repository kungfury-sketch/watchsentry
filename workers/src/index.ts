import { Hono } from "hono";
import { cors } from "hono/cors";
import { runDailyRefresh } from "./cron";
import { discoverRequestSchema, recordDiscovery } from "./discover";
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

// Fire-and-forget candidate registration from the extension. Logged in candidate_refs
// and validated nightly by the cron — promoted to watch_references when eBay has
// enough sold-comps. See workers/migrations/0005_candidate_refs.sql for the table.
app.post("/discover", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = discoverRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: "invalid_request", details: parsed.error.flatten() }, 400);
  }
  await recordDiscovery(c.env.DB, parsed.data);
  return c.json({ ok: true });
});

export default {
  fetch: app.fetch,
  scheduled: async (_event: ScheduledEvent, env: Env, _ctx: ExecutionContext) => {
    try {
      await runDailyRefresh(env);
    } catch (e) {
      // Last-resort guard: record an unexpected scheduled failure with context instead of
      // letting it surface as only a generic platform cron error. [M6]
      await env.DB.prepare("INSERT INTO audit_log (event_type, payload_json) VALUES (?, ?)")
        .bind("cron_fatal_error", JSON.stringify({ error: String(e) }))
        .run()
        .catch(() => {});
    }
  },
};
