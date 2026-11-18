import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { transform } from "esbuild";

const workerTsPath = resolve(import.meta.dirname, "../src/index.ts");
const tsSource = await readFile(workerTsPath, "utf8");
const { code } = await transform(tsSource, { loader: "ts", format: "esm" });
const mod = await import(`data:text/javascript;base64,${Buffer.from(code).toString("base64")}`);
const worker = mod.default;

function makeEnv(overrides = {}) {
  return {
    RESEND_API_KEY: "re_test_dummy",
    LEAD_EMAIL_TO: "sales@theharnesslab.com",
    LEAD_EMAIL_FROM: "The Harness Lab <intake@theharnesslab.com>",
    ...overrides,
  };
}

test("intake-worker: GET /api/health returns 200 ok", async () => {
  const req = new Request("https://harness-lab-intake.theharnesslab.workers.dev/api/health");
  const res = await worker.fetch(req, makeEnv());
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.ok, true);
});

test("intake-worker: rejects missing or unlisted Origin with 403", async () => {
  const reqNoOrigin = new Request("https://harness-lab-intake.theharnesslab.workers.dev/api/intake", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Jane", email: "jane@example.com", desiredWorkflow: "Build tool" }),
  });
  assert.equal((await worker.fetch(reqNoOrigin, makeEnv())).status, 403);

  const reqEvilOrigin = new Request("https://harness-lab-intake.theharnesslab.workers.dev/api/intake", {
    method: "POST",
    headers: { Origin: "https://evil.example", "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Jane", email: "jane@example.com", desiredWorkflow: "Build tool" }),
  });
  const res = await worker.fetch(reqEvilOrigin, makeEnv());
  assert.equal(res.status, 403);
  assert.equal(res.headers.get("Access-Control-Allow-Origin"), null);
});

test("intake-worker: rejects non-JSON Content-Type with 415", async () => {
  const req = new Request("https://harness-lab-intake.theharnesslab.workers.dev/api/intake", {
    method: "POST",
    headers: { Origin: "https://theharnesslab.com", "Content-Type": "text/plain" },
    body: "hello",
  });
  assert.equal((await worker.fetch(req, makeEnv())).status, 415);
});

test("intake-worker: enforces streaming 64 KB byte cap (413) even without Content-Length", async () => {
  const bigChunk = new Uint8Array(70 * 1024).fill(65);
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(bigChunk);
      controller.close();
    },
  });
  const req = new Request("https://harness-lab-intake.theharnesslab.workers.dev/api/intake", {
    method: "POST",
    headers: { Origin: "https://theharnesslab.com", "Content-Type": "application/json" },
    body: stream,
    duplex: "half",
  });
  const res = await worker.fetch(req, makeEnv());
  assert.equal(res.status, 413);
});

test("intake-worker: honeypot returns 200 without burning INTAKE_LIMIT or calling Resend", async () => {
  let limitCalls = 0;
  const env = makeEnv({
    INTAKE_LIMIT: {
      async limit() {
        limitCalls += 1;
        return { success: true };
      },
    },
  });
  const req = new Request("https://harness-lab-intake.theharnesslab.workers.dev/api/intake", {
    method: "POST",
    headers: { Origin: "https://theharnesslab.com", "Content-Type": "application/json" },
    body: JSON.stringify({
      hp: "http://spam.bot",
      name: "Bot",
      email: "bot@example.com",
      desiredWorkflow: "Buy links",
    }),
  });
  const res = await worker.fetch(req, env);
  assert.equal(res.status, 200);
  assert.equal(limitCalls, 0, "Honeypot must short-circuit before rate limiter");
});

test("intake-worker: enforces INTAKE_LIMIT 429, required desiredWorkflow 400, and strict EMAIL_RE 400", async () => {
  const rateLimitedEnv = makeEnv({
    INTAKE_LIMIT: { async limit() { return { success: false }; } },
  });
  const req1 = new Request("https://harness-lab-intake.theharnesslab.workers.dev/api/intake", {
    method: "POST",
    headers: { Origin: "https://theharnesslab.com", "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Jane", email: "jane@example.com", desiredWorkflow: "Automate" }),
  });
  assert.equal((await worker.fetch(req1, rateLimitedEnv)).status, 429);

  const reqMissingWorkflow = new Request("https://harness-lab-intake.theharnesslab.workers.dev/api/intake", {
    method: "POST",
    headers: { Origin: "https://theharnesslab.com", "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Jane", email: "jane@example.com", desiredWorkflow: "   " }),
  });
  assert.equal((await worker.fetch(reqMissingWorkflow, makeEnv())).status, 400);

  const reqBadEmail = new Request("https://harness-lab-intake.theharnesslab.workers.dev/api/intake", {
    method: "POST",
    headers: { Origin: "https://theharnesslab.com", "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Jane", email: "bad@email@example", desiredWorkflow: "Automate" }),
  });
  assert.equal((await worker.fetch(reqBadEmail, makeEnv())).status, 400);
});

test("intake-worker: redacts leaked secrets, caps problems at 20, strips control chars, and sends to sales@theharnesslab.com", async () => {
  let capturedBody = null;
  const origFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    assert.equal(url, "https://api.resend.com/emails");
    capturedBody = JSON.parse(init.body);
    return new Response(JSON.stringify({ id: "email_123" }), { status: 200 });
  };
  try {
    const fakeKey = "sk-proj-" + "A1b2C3d4E5f6G7h8I9j0K1l2";
    const problems = Array.from({ length: 35 }, (_, i) => `Problem-${i + 1}`);
    const req = new Request("https://harness-lab-intake.theharnesslab.workers.dev/api/intake", {
      method: "POST",
      headers: { Origin: "https://theharnesslab.com", "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Jane\r\nInjected: header",
        email: "jane@example.com",
        company: "Acme Title",
        desiredWorkflow: `Connect CRM using ${fakeKey} safely`,
        problems,
      }),
    });
    const res = await worker.fetch(req, makeEnv());
    assert.equal(res.status, 200);
    assert.ok(capturedBody);
    assert.deepEqual(capturedBody.to, ["sales@theharnesslab.com"]);
    assert.ok(!capturedBody.subject.includes("\n") && !capturedBody.subject.includes("\r"));
    assert.ok(!capturedBody.text.includes(fakeKey), "Raw API key must never reach Resend");
    assert.ok(capturedBody.text.includes("[REDACTED API key]"));
    assert.ok(!capturedBody.text.includes("Problem-21"), "Problems array must be capped at 20");
  } finally {
    globalThis.fetch = origFetch;
  }
});
