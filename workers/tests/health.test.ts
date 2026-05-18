import { describe, expect, it } from "vitest";
import worker from "../src/index";

describe("health endpoint", () => {
  it("returns ok=true with the service name", async () => {
    const req = new Request("http://x/health");
    const env = {} as never;
    const res = await worker.fetch(req, env, {} as never);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ ok: true, name: "watchsentry-api" });
  });

  it("returns 404 on unknown route", async () => {
    const req = new Request("http://x/does-not-exist");
    const env = {} as never;
    const res = await worker.fetch(req, env, {} as never);
    expect(res.status).toBe(404);
  });
});
