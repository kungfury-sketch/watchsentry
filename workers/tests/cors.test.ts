import { describe, expect, it } from "vitest";
import worker from "../src/index";

const ORIGIN = "https://www.chrono24.com";

describe("CORS", () => {
  it("responds to /enrich preflight with 204 + CORS headers", async () => {
    const req = new Request("http://x/enrich", {
      method: "OPTIONS",
      headers: {
        Origin: ORIGIN,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
      },
    });
    const env = {} as never;
    const res = await worker.fetch(req, env, {} as never);
    expect(res.status).toBe(204);
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
    expect(res.headers.get("access-control-allow-methods")).toContain("POST");
    expect(res.headers.get("access-control-allow-headers")?.toLowerCase()).toContain(
      "content-type",
    );
  });

  it("attaches access-control-allow-origin to /health responses", async () => {
    const req = new Request("http://x/health", { headers: { Origin: ORIGIN } });
    const env = {} as never;
    const res = await worker.fetch(req, env, {} as never);
    expect(res.status).toBe(200);
    expect(res.headers.get("access-control-allow-origin")).toBe("*");
  });
});
