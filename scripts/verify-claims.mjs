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

// Permitted non-prose asset paths, filenames, and element/tab identifiers that
// intentionally retain lowercase 'titledesk' so zero URLs, imports, or anchors break.
const ALLOWED_TITLEDESK_IDENTIFIERS =
  /(?:\/showcase\/|")titledesk(?:-hosted)?\/|\/products\/titledesk-(?:web|agent)-seal|\/video\/titledesk-sales-demo|#(?!-)video-titledesk-walkthrough|#(?!-)software-titledesk-agent|#(?!-)titledesk\b|titledesk-name|cinema-tab-titledesk-walkthrough|"titledesk(?:-walkthrough)?"/g;

const FORBIDDEN = [
  [/TitleDesk/, "Banned unhyphenated product name 'TitleDesk' (use 'Title-Desk' or 'Title-Desk Agent')"],
  [/TITLEDESK/, "Banned uppercase unhyphenated name 'TITLEDESK' (use 'TITLE-DESK')"],
  [/titledesk/i, "Banned unhyphenated 'titledesk' outside allowlisted asset paths/IDs (use 'Title-Desk')"],
  [/Title\s+Desk/i, "Banned spaced product name 'Title Desk' (use 'Title-Desk')"],
  [/Title-Desk Desktop\b/, "Banned product name 'Title-Desk Desktop' / 'Title-Desk Desktop Agent' (use 'Title-Desk Agent')"],
  [/Title-Desk Agent Desktop/i, "Banned product name 'Title-Desk Agent Desktop' (use 'Title-Desk Agent')"],
  [/Title-Desk Web/i, "Banned product name 'Title-Desk Web'"],
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
  [/spencer@theharnesslab\.com/i, "Unverified mailbox 'spencer@theharnesslab.com' (use 'sales@theharnesslab.com')"],
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
  const rawContent = await readFile(file, "utf8");
  const content = rawContent.replace(ALLOWED_TITLEDESK_IDENTIFIERS, "__ALLOWED_ASSET_ID__");
  for (const [pattern, reason] of FORBIDDEN) {
    const match = content.match(pattern);
    if (match) {
      failures.push(`${rel}: ${reason} (matched "${match[0]}")`);
    }
  }
}

// Require canonical hyphenated product names ('Title-Desk' & 'Title-Desk Agent') across public text surfaces
for (const [rel, requiredNames] of [
  ["index.html", ["Title-Desk", "Title-Desk Agent"]],
  ["llms.txt", ["Title-Desk", "Title-Desk Agent"]],
  ["llms-full.txt", ["Title-Desk", "Title-Desk Agent"]],
  ["legal/index.html", ["Title-Desk", "Title-Desk Agent"]],
  ["legal/terms/index.html", ["Title-Desk"]],
  ["legal/privacy/index.html", ["Title-Desk"]],
  ["ai-workflow-automation/index.html", ["Title-Desk", "Title-Desk Agent"]],
  ["custom-software-development/index.html", ["Title-Desk", "Title-Desk Agent"]],
  ["website-design-development/index.html", ["Title-Desk", "Title-Desk Agent"]],
  ["internal-tools-development/index.html", ["Title-Desk", "Title-Desk Agent"]],
  ["api-integrations/index.html", ["Title-Desk", "Title-Desk Agent"]],
  ["landman-title-workflow-automation/index.html", ["Title-Desk", "Title-Desk Agent"]],
]) {
  const txt = await readFile(join(distDir, rel), "utf8");
  for (const name of requiredNames) {
    if (!txt.includes(name)) {
      failures.push(`${rel}: missing required hyphenated brand '${name}'`);
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
