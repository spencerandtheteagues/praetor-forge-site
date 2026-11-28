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
    LEAD_EMAIL_TO: "spencer@theharnesslab.com",
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

test("intake-worker: redacts leaked secrets, caps problems at 20, strips control chars, and sends to spencer@theharnesslab.com", async () => {
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
    assert.deepEqual(capturedBody.to, ["spencer@theharnesslab.com"]);
    assert.ok(!capturedBody.subject.includes("\n") && !capturedBody.subject.includes("\r"));
    assert.ok(!capturedBody.text.includes(fakeKey), "Raw API key must never reach Resend");
    assert.ok(capturedBody.text.includes("[REDACTED API key]"));
    assert.ok(!capturedBody.text.includes("Problem-21"), "Problems array must be capped at 20");
  } finally {
    globalThis.fetch = origFetch;
  }
});

test("intake-worker: strips embedded control and zero-width chars BEFORE secret redaction so split tokens cannot bypass redaction", async () => {
  let capturedBody = null;
  const origFetch = globalThis.fetch;
  globalThis.fetch = async (_url, init) => {
    capturedBody = JSON.parse(init.body);
    return new Response(JSON.stringify({ id: "email_124" }), { status: 200 });
  };
  try {
    const rawGhp = "ghp_" + "A".repeat(36);
    const splitGhp = "ghp_" + "A".repeat(10) + "\u0001" + "A".repeat(26);
    const rawSk = "sk-proj-" + "A1b2C3d4E5f6G7h8I9j0K1l2";
    const zwSk = "sk-proj-" + "A1b2C3\u200bd4E5f6G7h8I9j0K1l2";
    const req = new Request("https://harness-lab-intake.theharnesslab.workers.dev/api/intake", {
      method: "POST",
      headers: { Origin: "https://theharnesslab.com", "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `Test ${zwSk}`,
        email: "jane@example.com",
        desiredWorkflow: `Token test ${splitGhp}`,
      }),
    });
    const res = await worker.fetch(req, makeEnv());
    assert.equal(res.status, 200);
    assert.ok(!capturedBody.text.includes(rawGhp), "Control-char-split GitHub token must not bypass redaction");
    assert.ok(!capturedBody.text.includes(rawSk), "Zero-width-split API key must not bypass redaction");
    assert.ok(capturedBody.text.includes("[REDACTED GitHub token]"));
    assert.ok(capturedBody.text.includes("[REDACTED API key]"));
  } finally {
    globalThis.fetch = origFetch;
  }
});

test("intake-worker: redacts tab/newline-adjacent secrets in clipLine and bidi/format-split secrets without mangling word boundaries", async () => {
  let capturedBody = null;
  const origFetch = globalThis.fetch;
  globalThis.fetch = async (_url, init) => {
    capturedBody = JSON.parse(init.body);
    return new Response(JSON.stringify({ id: "email_125" }), { status: 200 });
  };
  try {
    const stripeKey = "sk_live_" + "9876543210abcdef";
    const ghpKey = "ghp_" + "B".repeat(36);
    const awsKey = "AKIA" + "IOSFODNN7EXAMPLE";
    const googleKey = "AIza" + "SyDa1234567890abcdefABCDEF123456";
    const jwtToken = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    const bidiSplitSk = "sk-proj-" + "A1b2C3\u202ed4E5f6\u2066G7h8\u034fI9j0\u180eK1l2";
    const rawSk = "sk-proj-A1b2C3d4E5f6G7h8I9j0K1l2";

    const req = new Request("https://harness-lab-intake.theharnesslab.workers.dev/api/intake", {
      method: "POST",
      headers: { Origin: "https://theharnesslab.com", "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        name: "Jane\r\nSmith\u202e",
        email: "jane@example.com",
        company: `Acme\t${stripeKey}`,
        website: `https://acme.example\t${awsKey}`,
        callWindow: `Morning\n${googleKey}`,
        desiredWorkflow: `Rotate ${bidiSplitSk} and\t${jwtToken}`,
        problems: [`Auth\n${ghpKey}`],
      }),
    });
    const res = await worker.fetch(req, makeEnv());
    assert.equal(res.status, 200);
    assert.ok(capturedBody);
    assert.ok(capturedBody.subject.includes("Jane Smith"), "clipLine should preserve space when collapsing CRLF");
    assert.ok(!/[\u202a-\u202e\u2066-\u2069]/.test(capturedBody.subject), "Bidi controls must be stripped from subject");
    assert.ok(!/[\u202a-\u202e\u2066-\u2069]/.test(capturedBody.html), "Bidi controls must be stripped from html");
    for (const secret of [stripeKey, ghpKey, awsKey, googleKey, jwtToken, rawSk]) {
      assert.ok(!capturedBody.text.includes(secret), `Leaked secret in text: ${secret.slice(0, 8)}`);
      assert.ok(!capturedBody.html.includes(secret), `Leaked secret in html: ${secret.slice(0, 8)}`);
    }
    assert.ok(capturedBody.text.includes("Acme [REDACTED Stripe key]"));
    assert.ok(capturedBody.text.includes("Auth [REDACTED GitHub token]"));
    assert.ok(capturedBody.text.includes("[REDACTED AWS access key]"));
    assert.ok(capturedBody.text.includes("[REDACTED Google API key]"));
    assert.ok(capturedBody.text.includes("[REDACTED signed token (JWT)]"));
    assert.ok(capturedBody.text.includes("[REDACTED API key]"));
    assert.ok(capturedBody.text.includes("— via theharnesslab.com intake form"));
    assert.ok(!capturedBody.text.includes("via the theharnesslab.com"));
    assert.ok(capturedBody.html.includes("via theharnesslab.com intake form"));
    assert.ok(!capturedBody.html.includes("via the theharnesslab.com"));
  } finally {
    globalThis.fetch = origFetch;
  }
});

test("intake-worker: guards non-string field coercion, enforces exact application/json media type, validates domain/punycode emails, and checks fields before burning INTAKE_LIMIT", async () => {
  let limitCalls = 0;
  let resendCalls = 0;
  const origFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    resendCalls += 1;
    return new Response(JSON.stringify({ message: "Invalid reply_to" }), { status: 422 });
  };
  try {
    // 1. Non-exact application/json* media types must return 415 without touching Resend
    for (const badType of ["application/jsonp", "application/json-patch+json", "application/jsonlines"]) {
      const req = new Request("https://harness-lab-intake.theharnesslab.workers.dev/api/intake", {
        method: "POST",
        headers: { Origin: "https://theharnesslab.com", "Content-Type": badType },
        body: JSON.stringify({ name: "Jane", email: "jane@example.com", desiredWorkflow: "Automate" }),
      });
      assert.equal((await worker.fetch(req, makeEnv())).status, 415, `Expected 415 for ${badType}`);
    }

    // 2. Malformed email domains & missing fields must return 400 BEFORE calling INTAKE_LIMIT or Resend
    const env = makeEnv({
      INTAKE_LIMIT: {
        async limit() {
          limitCalls += 1;
          return { success: true };
        },
      },
    });

    const missingRes = await worker.fetch(
      new Request("https://harness-lab-intake.theharnesslab.workers.dev/api/intake", {
        method: "POST",
        headers: { Origin: "https://theharnesslab.com", "Content-Type": "application/json" },
        body: JSON.stringify({ name: "   ", email: "jane@example.com", desiredWorkflow: "   " }),
      }),
      env,
    );
    assert.equal(missingRes.status, 400);

    for (const badEmail of [
      "jane@.example.com",
      "jane@a..com",
      "jane@-a.com",
      "jane@a-.com",
      ".jane@example.com",
      "jane.@example.com",
      "ja..ne@example.com",
      "jane@example.xn--",
    ]) {
      const res = await worker.fetch(
        new Request("https://harness-lab-intake.theharnesslab.workers.dev/api/intake", {
          method: "POST",
          headers: { Origin: "https://theharnesslab.com", "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Jane", email: badEmail, desiredWorkflow: "Automate" }),
        }),
        env,
      );
      assert.equal(res.status, 400, `Expected 400 invalid_email for ${badEmail}, got ${res.status}`);
      assert.equal((await res.json()).error, "invalid_email");
    }

    assert.equal(limitCalls, 0, "Invalid/incomplete payloads must not burn INTAKE_LIMIT");
    assert.equal(resendCalls, 0, "Invalid emails must be rejected before calling Resend");

    // 3. Valid punycode TLDs + non-string optional fields safely ignored without [object Object]
    let capturedBody = null;
    globalThis.fetch = async (_url, init) => {
      capturedBody = JSON.parse(init.body);
      return new Response(JSON.stringify({ id: "email_126" }), { status: 200 });
    };
    const okRes = await worker.fetch(
      new Request("https://harness-lab-intake.theharnesslab.workers.dev/api/intake", {
        method: "POST",
        headers: { Origin: "https://theharnesslab.com", "Content-Type": "APPLICATION/JSON ; charset=utf-8" },
        body: JSON.stringify({
          name: "Jane",
          email: "jane@company.xn--p1ai",
          company: { nested: "obj" },
          infrastructure: ["array", "ignored"],
          role: 12345,
          problems: [{ bad: true }, 99, "Manual re-entry"],
          desiredWorkflow: "Automate intake",
        }),
      }),
      env,
    );
    assert.equal(okRes.status, 200);
    assert.equal(limitCalls, 1, "Valid submission should consume exactly 1 rate-limit token");
    assert.equal(capturedBody.reply_to, "jane@company.xn--p1ai");
    assert.ok(!capturedBody.text.includes("[object Object]"), "Non-string objects must not coerce to [object Object]");
    assert.ok(!capturedBody.text.includes("12345"), "Non-string numbers must be ignored");
    assert.ok(capturedBody.text.includes("Problems: Manual re-entry"));
  } finally {
    globalThis.fetch = origFetch;
  }
});

test("intake-worker: POST /api/voice-session enforces origin, rate limit, 503 when unconfigured, mints ElevenLabs + Simli tokens, and degrades cleanly", async () => {
  // Forbidden origin -> 403
  const badOrigin = await worker.fetch(
    new Request("https://harness-lab-intake.theharnesslab.workers.dev/api/voice-session", {
      method: "POST",
      headers: { Origin: "https://evil.example", "Content-Type": "application/json" },
      body: "{}",
    }),
    makeEnv(),
  );
  assert.equal(badOrigin.status, 403);

  // Unconfigured -> 503
  const unconfigured = await worker.fetch(
    new Request("https://harness-lab-intake.theharnesslab.workers.dev/api/voice-session", {
      method: "POST",
      headers: { Origin: "https://theharnesslab.com", "Content-Type": "application/json" },
      body: "{}",
    }),
    makeEnv(),
  );
  assert.equal(unconfigured.status, 503);

  // Rate limited -> 429
  const limited = await worker.fetch(
    new Request("https://harness-lab-intake.theharnesslab.workers.dev/api/voice-session", {
      method: "POST",
      headers: { Origin: "https://theharnesslab.com", "Content-Type": "application/json" },
      body: "{}",
    }),
    makeEnv({
      ELEVENLABS_API_KEY: "el_test",
      HARNESSLAB_ELEVENLABS_AGENT_ID: "agent_test",
      VOICE_LIMIT: { async limit() { return { success: false }; } },
    }),
  );
  assert.equal(limited.status, 429);

  const origFetch = globalThis.fetch;
  let simliCalled = 0;
  globalThis.fetch = async (url) => {
    const u = String(url);
    if (u.startsWith("https://api.elevenlabs.io/v1/convai/conversation/get-signed-url")) {
      return new Response(JSON.stringify({ signed_url: "wss://api.elevenlabs.io/v1/convai/conversation?sig=ok" }), { status: 200 });
    }
    if (u === "https://api.simli.ai/compose/token") {
      simliCalled += 1;
      return new Response(JSON.stringify({ session_token: "simli_tok_hl" }), { status: 200 });
    }
    if (u === "https://api.simli.ai/compose/ice") {
      return new Response(JSON.stringify([{ urls: ["stun:stun.l.google.com:19302"] }]), { status: 200 });
    }
    throw new Error(`unexpected fetch ${u}`);
  };
  try {
    const voiceEnv = makeEnv({
      ELEVENLABS_API_KEY: "el_test",
      HARNESSLAB_ELEVENLABS_AGENT_ID: "agent_test",
      SIMLI_API_KEY: "simli_test",
      SIMLI_FACE_ID: "face_test",
    });
    const okRes = await worker.fetch(
      new Request("https://harness-lab-intake.theharnesslab.workers.dev/api/voice-session", {
        method: "POST",
        headers: { Origin: "https://theharnesslab.com", "Content-Type": "application/json" },
        body: "{}",
      }),
      voiceEnv,
    );
    assert.equal(okRes.status, 200);
    const okJson = await okRes.json();
    assert.equal(okJson.ok, true);
    assert.match(okJson.signedUrl, /^wss:\/\/api\.elevenlabs\.io\//);
    assert.equal(okJson.simli.sessionToken, "simli_tok_hl");
    assert.equal(simliCalled, 1);

    // textOnly skips Simli
    const textRes = await worker.fetch(
      new Request("https://harness-lab-intake.theharnesslab.workers.dev/api/voice-session", {
        method: "POST",
        headers: { Origin: "https://theharnesslab.com", "Content-Type": "application/json" },
        body: JSON.stringify({ textOnly: true }),
      }),
      voiceEnv,
    );
    assert.equal(textRes.status, 200);
    const textJson = await textRes.json();
    assert.equal(textJson.simli, undefined);
    assert.equal(simliCalled, 1);
  } finally {
    globalThis.fetch = origFetch;
  }
});
