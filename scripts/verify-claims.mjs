// Deterministic claims, naming, OPSEC, and link-matrix verifier for theharnesslab.com.
// Runs against built dist/ and intake-worker/ before any publish.
import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const distDir = join(root, "dist");

const TEXT_EXT = new Set([
  ".html",
  ".js",
  ".mjs",
  ".css",
  ".json",
  ".xml",
  ".txt",
  ".svg",
  ".webmanifest",
]);

const FORBIDDEN = [
  [/Title-Desk/, "Banned hyphenated product name 'Title-Desk'"],
  [/TITLE-DESK/, "Banned uppercase hyphenated name 'TITLE-DESK'"],
  [/Title Desk/, "Banned spaced product name 'Title Desk'"],
  [/TitleDesk Desktop/, "Banned product name 'TitleDesk Desktop' (use 'TitleDesk Agent')"],
  [/TitleDesk Agent Desktop/, "Banned product name 'TitleDesk Agent Desktop'"],
  [/Title-Desk Web/, "Banned product name 'Title-Desk Web'"],
  [/TitleDesk Web/, "Banned product name 'TitleDesk Web'"],
  [/New Mexico/i, "Banned 'New Mexico' capability/roadmap claim"],
  [/\b28-build\b/i, "Stale '28-build' count (canonical .dev ledger is 27-build)"],
  [/\b282\s*\/\s*282\b/, "Volatile hosted test count '282/282'"],
  [/Jake Powers/i, "Unsanitized 'Jake Powers' header discrepancy"],
  [/Ubuntu Omen|HP Omen|Kali VPS|Kali Linux/i, "Internal workstation/VPS hostname leak"],
  [/\/Users\/spencerteague|\/home\/spencer/, "Local filesystem path leak"],
  [/written only when all three agree|three-way consensus|triple-check/i, "Banned validator consensus overclaim"],
  [/zero extra vendor spend|ZERO EXTRA SPEND/i, "Banned subscription/spend claim"],
  [/tenant-isolated/i, "Banned 'tenant-isolated' phrase"],
  [/signed workbook/i, "Banned 'signed workbook' phrase"],
  [/brandstream\.my/i, "Dead domain 'brandstream.my' must stay unlinked until cutover completes"],
  [/spencerandtheteagues@gmail\.com/i, "Personal Gmail address leak"],
];

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

const failures = [];

try {
  await stat(distDir);
} catch {
  console.error("verify-claims: dist/ does not exist — run `npm run build` first.");
  process.exit(1);
}

for await (const file of walk(distDir)) {
  const rel = relative(distDir, file);
  if (!TEXT_EXT.has(extname(file))) continue;
  const content = await readFile(file, "utf8");
  for (const [pattern, reason] of FORBIDDEN) {
    const match = content.match(pattern);
    if (match) {
      failures.push(`${rel}: ${reason} (matched "${match[0]}")`);
    }
  }
}

// Verify CNAME and /.well-known/security.txt
const cname = (await readFile(join(distDir, "CNAME"), "utf8")).trim();
if (cname !== "theharnesslab.com") {
  failures.push(`dist/CNAME expected "theharnesslab.com", got "${cname}"`);
}

const secTxt = await readFile(join(distDir, ".well-known/security.txt"), "utf8");
for (const expected of [
  "Contact: mailto:sales@theharnesslab.com",
  "Expires: 2027-11-18T00:00:00Z",
  "Preferred-Languages: en",
  "Canonical: https://theharnesslab.com/.well-known/security.txt",
]) {
  if (!secTxt.includes(expected)) {
    failures.push(`dist/.well-known/security.txt missing "${expected}"`);
  }
}

// Verify all 6 service pages and 4 legal pages exist and carry LLC details + async fonts
const requiredHtml = [
  "index.html",
  "ai-workflow-automation/index.html",
  "custom-software-development/index.html",
  "website-design-development/index.html",
  "internal-tools-development/index.html",
  "api-integrations/index.html",
  "landman-title-workflow-automation/index.html",
  "legal/index.html",
  "legal/terms/index.html",
  "legal/privacy/index.html",
  "legal/client-terms/index.html",
];

for (const rel of requiredHtml) {
  const html = await readFile(join(distDir, rel), "utf8");
  if (!html.includes("The Harness Lab LLC") || !html.includes("806765129")) {
    failures.push(`${rel}: missing LLC legal name or SOS file number 806765129`);
  }
  if (!html.includes('media="print"')) {
    failures.push(`${rel}: Google Fonts stylesheet should be non-render-blocking (media="print")`);
  }
}

// Verify intake-worker hardening invariants
const workerSrc = await readFile(join(root, "intake-worker/src/index.ts"), "utf8");
const wranglerCfg = await readFile(join(root, "intake-worker/wrangler.jsonc"), "utf8");
assert.ok(workerSrc.includes("MAX_BODY") && workerSrc.includes("readBoundedUtf8"), "intake-worker must enforce bounded streaming body cap");
assert.ok(workerSrc.includes("redactSecrets"), "intake-worker must enforce server-side secret redaction");
assert.ok(!wranglerCfg.includes("gmail.com"), "wrangler.jsonc must not route leads to personal Gmail");
assert.ok(wranglerCfg.includes("sales@theharnesslab.com"), "wrangler.jsonc must route leads to sales@theharnesslab.com");

if (failures.length > 0) {
  console.error("Claims & OPSEC verification failed:");
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}

console.log(`Claims & OPSEC verification passed across ${requiredHtml.length} HTML entrypoints, dist/, and intake-worker/.`);
