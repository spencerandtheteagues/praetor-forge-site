// Run against the production preview. Requests that could send email are mocked.
// PLAYWRIGHT_MODULE and CHROMIUM_PATH select an already-installed test runtime.
import assert from "node:assert/strict";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const base = process.env.PREVIEW_URL || process.env.VERIFY_BASE_URL || "http://127.0.0.1:4174";
const distDir = resolve(import.meta.dirname, "..", "dist");
// theharnesslab.com may only link out to these exact hostnames.
const LINK_ALLOWLIST = [
  "theharnesslab.com",
  "theharnesslab.dev",
  "title-desk.com",
  "desktop.title-desk.com",
  "artificiallandman.io",
  "ailandman.io",
  "brandstream.my",
  "apex-build.dev",
];
const RETIRED = /happy-homes|Happy Homes|charlie-computer|Charlie Computer|Charlie['’]s Computer/;
const TEXT_EXT = new Set([".html", ".js", ".mjs", ".css", ".json", ".xml", ".txt", ".svg", ".webmanifest", ".map"]);
async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}
const output = process.env.VERIFY_OUTPUT || resolve(import.meta.dirname, "..", "docs/redesign-2026-09-14");
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROMIUM_PATH
    ? { executablePath: process.env.CHROMIUM_PATH }
    : process.env.PLAYWRIGHT_CHANNEL
      ? { channel: process.env.PLAYWRIGHT_CHANNEL }
      : {}),
});
const results = [],
  errors = [],
  consoleWarnings = [],
  failedAssets = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
  });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (msg) => {
    const type = msg.type();
    const txt = msg.text();
    if (type === "error") {
      // Ignore the intentional 503 returned when delivery === "failure" tests form fallback.
      if (delivery === "failure" && /status of 503/i.test(txt)) return;
      errors.push(`console.error: ${txt}`);
    } else if (/GL_INVALID|CONTEXT_LOST/i.test(txt)) {
      consoleWarnings.push(txt);
    }
  });
  page.on("response", (response) => {
    if (response.url().startsWith(base) && response.status() >= 400)
      failedAssets.push(response.url());
  });
  let submissions = [],
    delivery = "success";
  await page.route(
    "https://harness-lab-intake.theharnesslab.workers.dev/api/intake",
    async (route) => {
      submissions.push(route.request().postDataJSON());
      await route.fulfill({
        status: delivery === "success" ? 200 : 503,
        contentType: "application/json",
        body: JSON.stringify({ ok: delivery === "success" }),
      });
    },
  );
  await page.goto(base, { waitUntil: "networkidle" });
  assert.match(await page.title(), /Software for Any Industry/);
  assert.equal(await page.locator("h1").count(), 1);
  const text = await page.locator("body").innerText();
  for (const phrase of [
    "Landman title",
    "Title-Desk",
    "Title-Desk Agent",
    "AI Landman",
    "Jayson Powers",
    "BrandStreams",
    "APEX.BUILD",
    "completely self-taught",
    "607-364-7772",
    "spencer@theharnesslab.com",
    "The Harness Lab is a software company.",
    "Live now: Title-Desk, Artificial Landman, and AI Landman automate mineral title work.",
    "Tell us a job to automate",
    "Try Title-Desk",
  ])
    assert.ok(text.includes(phrase), phrase);
  assert.doesNotMatch(text, /\$\d|fixed fee|founding clients|spots remaining/i);
  assert.equal(await page.locator('a[href="tel:+16073647772"]').count(), 1);
  assert.equal(await page.locator(".cal-fab").count(), 0);
  assert.equal(await page.locator(".medallion-controls").count(), 0, "No controls below medallion");
  assert.equal(await page.locator(".hero-art button").count(), 0, "No buttons inside hero-art");
  await page.evaluate(async () => {
    await document.fonts?.load('800 32px "Cinzel"');
    await document.fonts?.load('900 44px "Cinzel"');
    await document.fonts?.load('800 32px "Outfit"');
    await document.fonts?.load('900 44px "Outfit"');
    await document.fonts?.ready;
  });
  for (const [vw, vh] of [[1440, 1000], [1440, 900], [1280, 800], [1920, 1080]]) {
    await page.setViewportSize({ width: vw, height: vh });
    await page.evaluate(() => window.scrollTo(0, 0));
    const box = await page.locator(".medallion-stage").boundingBox();
    const bezelBox = await page.locator(".medallion-bezel").boundingBox();
    assert.ok(box && box.width >= 380, `Medallion rendered at ${vw}x${vh}`);
    assert.ok(box.y >= 60, `Medallion top (${box.y}) clears header at ${vw}x${vh}`);
    assert.ok(box.y + box.height <= vh, `Medallion bottom (${box.y + box.height}) fully visible inside ${vh}px viewport at ${vw}x${vh}`);
    const maxHlRight = await page.locator(".hero-headline .hl-line").evaluateAll((els) =>
      Math.max(...els.map((el) => {
        const range = document.createRange();
        range.selectNodeContents(el);
        return range.getBoundingClientRect().right;
      })),
    );
    const leftEdge = bezelBox ? Math.min(box.x, bezelBox.x) : box.x;
    assert.ok(maxHlRight <= leftEdge - 12, `Headline text right (${maxHlRight}) clears medallion bezel left (${leftEdge}) at ${vw}x${vh}`);
    if (vw >= 1440 && vh >= 900) {
      const ctaBox = await page.locator(".hero-actions").boundingBox();
      assert.ok(ctaBox && ctaBox.y + ctaBox.height <= vh, `Hero CTAs (${ctaBox?.y + ctaBox?.height}) visible above fold at ${vw}x${vh}`);
    }
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => window.scrollTo(0, 0));
  assert.ok((await page.locator('a[href="https://title-desk.com/"]').count()) >= 1);
  assert.ok((await page.locator('a[href="https://ailandman.io/"]').count()) >= 1);
  assert.ok((await page.locator('a[href="https://artificiallandman.io/"]').count()) >= 1);
  assert.equal(await page.locator(".footer-signature a").count(), 3);
  const brokenAnchors = await page
    .locator('a[href^="#"]')
    .evaluateAll((links) =>
      links
        .map((a) => a.getAttribute("href").slice(1))
        .filter((id) => id && !document.getElementById(id)),
    );
  assert.deepEqual(brokenAnchors, []);
  results.push(
    "Required copy, contact links, price removal, single H1, and navigation targets pass.",
  );

  // Outbound-link allowlist: every external http(s) anchor must point at an
  // allowlisted hostname (exact match, no subdomains).
  const offList = await page.locator("a[href]").evaluateAll((links, allow) =>
    links
      .map((a) => a.href)
      .filter((href) => /^https?:/i.test(href))
      .filter((href) => {
        const host = new URL(href).hostname;
        return host !== location.hostname && !allow.includes(host);
      }),
  LINK_ALLOWLIST);
  assert.deepEqual(offList, [], `Off-allowlist links: ${offList.join(", ")}`);
  assert.equal(
    await page.locator('a[href*="github.com"]').count(),
    0,
    "No GitHub links on theharnesslab.com",
  );

  // Copy rules on rendered text, meta, JSON-LD and image alt text.
  const textContent = await page.evaluate(() => document.body.textContent);
  assert.ok(textContent.includes("no-copy reverse-engineering"), "no-copy reverse-engineering");
  assert.ok(textContent.includes("The same tools"));
  assert.ok(textContent.includes("behind the products we sell"));
  assert.ok(!textContent.includes("$"), "No dollar characters in visible copy");
  const headAndAlts = await page.evaluate(() =>
    [
      ...[...document.querySelectorAll("meta[content]")].map((m) => m.content),
      ...[...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent),
      ...[...document.querySelectorAll("img[alt]")].map((i) => i.alt),
      document.title,
    ].join("\n"),
  );
  for (const [label, haystack] of [["visible text", text], ["text content", textContent], ["meta/JSON-LD/alt", headAndAlts]]) {
    assert.ok(!haystack.includes("5.5"), `No "5.5" in ${label}`);
    assert.doesNotMatch(haystack, RETIRED, `No retired project names in ${label}`);
    assert.doesNotMatch(haystack, /\bdamn\b|\bshit\b/i, `No profanity in ${label}`);
  }

  // Chapter VI landing gallery: no outbound links and no site addresses.
  const gallery = page.locator("#landing-gallery");
  assert.equal(await gallery.locator("a[href]").count(), 0, "Landing gallery has no links");
  const galleryText = await gallery.evaluate((el) =>
    [el.textContent, ...[...el.querySelectorAll("img")].map((i) => i.alt)].join(" "),
  );
  assert.doesNotMatch(
    galleryText,
    /\b[\w-]+\.(com|io|dev|my|net|org|co|app|ai)\b|https?:|www\./i,
    "Landing gallery carries no domain names",
  );
  assert.equal(await gallery.locator(".screenshot-button").count(), 8);

  // Built dist/: retired projects must be gone from every file name and every
  // text asset that ships to Pages.
  const distHits = [];
  for await (const file of walk(distDir)) {
    const rel = relative(distDir, file);
    if (RETIRED.test(rel)) distHits.push(rel);
    else if (TEXT_EXT.has(extname(file)) && RETIRED.test(await readFile(file, "utf8"))) distHits.push(rel);
  }
  assert.deepEqual(distHits, [], `Retired project references in dist: ${distHits.join(", ")}`);
  results.push(
    "Outbound links stay on the allowlist; no GitHub links, dollar signs, 5.5 strings, profanity or retired project names; landing gallery is link-free; dist is clean.",
  );

  await page.getByRole("button", { name: "Pause motion" }).click();
  assert.equal(
    await page
      .locator(".orbit-one")
      .evaluate((el) => getComputedStyle(el).animationPlayState),
    "paused",
  );
  await page.getByRole("button", { name: "Resume motion" }).click();
  assert.equal(
    await page
      .locator(".orbit-one")
      .evaluate((el) => getComputedStyle(el).animationPlayState),
    "running",
  );
  for (const name of ["Documents", "Operations", "Records"]) {
    await page.getByRole("button", { name, exact: true }).click();
    await page
      .getByRole("button", { name: "Run example", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Replay example", exact: true })
      .waitFor();
    assert.match(
      await page.locator(".demo-announcement").innerText(),
      /Example complete/,
    );
  }
  await page
    .getByRole("button", { name: "Replay example", exact: true })
    .click();
  await page.getByRole("button", { name: "Documents", exact: true }).click();
  await page.waitForTimeout(3200);
  assert.equal(
    await page
      .getByRole("button", { name: "Run example", exact: true })
      .count(),
    1,
  );
  results.push(
    "All three workflow examples complete; switching examples cancels previous timers; pause/resume works.",
  );

  const imageButtons = page.locator(
    ".screenshot-button, .investor-thumbnails button",
  );
  for (let i = 0; i < (await imageButtons.count()); i++) {
    await imageButtons.nth(i).click();
    assert.equal(await page.locator("dialog[open]").count(), 1);
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("dialog").count(), 0);
    assert.ok(
      await imageButtons.nth(i).evaluate((el) => el === document.activeElement),
    );
  }
  results.push(
    "Every rendered screenshot preview opens, closes on Escape, and restores keyboard focus.",
  );

  await page.goto(`${base}/contact/`, { waitUntil: "networkidle" });
  await page
    .getByRole("button", { name: "Send to Spencer" })
    .click();
  assert.equal(submissions.length, 0, "Empty form must not submit");
  await page.getByLabel("Your name", { exact: true }).fill("Preview Test");
  await page.getByLabel("Work email").fill("preview@example.com");
  await page.getByLabel("Company").fill("Preview Company");
  await page
    .getByLabel("Your question")
    .fill("Automate document intake and prepare a report for review.");
  await page
    .getByRole("button", { name: "Send to Spencer" })
    .click();
  await page
    .getByRole("heading", { name: "Spencer has your question." })
    .waitFor();
  assert.equal(submissions.length, 1);
  assert.equal(submissions[0].email, "preview@example.com");
  assert.equal(submissions[0].requestType, "Title-Desk");
  assert.ok(!("budget" in submissions[0]));
  await page.getByRole("button", { name: "Send another question" }).click();
  delivery = "failure";
  await page
    .getByLabel("Your question")
    .fill("Preserve this enquiry if delivery fails.");
  await page
    .getByRole("button", { name: "Send to Spencer" })
    .click();
  await page.getByRole("alert").waitFor();
  assert.equal(
    await page
      .getByLabel("Your question")
      .inputValue(),
    "Preserve this enquiry if delivery fails.",
  );
  assert.match(
    await page
      .getByRole("link", { name: "Open this enquiry in your email app" })
      .getAttribute("href"),
    /^mailto:spencer@theharnesslab.com\?/,
  );
  results.push(
    "Mocked contact success and server failure pass; native validation blocks empty submission; failure preserves input and offers email fallback. No email sent.",
  );

  await page.goto(base, { waitUntil: "networkidle" });
  await page.reload({ waitUntil: "networkidle" });
  for (const width of [320, 390, 768, 1024, 1440, 2560, 3840]) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => window.scrollTo(0, 0));
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `Overflow at ${width}px`,
    );
    if (width <= 768) {
      const toggle = page.getByRole("button", { name: "Open navigation" });
      await toggle.click();
      await page
        .getByRole("navigation")
        .getByRole("link", { name: "Products", exact: true })
        .click();
      assert.equal(await toggle.getAttribute("aria-expanded"), "false");
      assert.equal(new URL(page.url()).hash, "#work");
    }
  }
  results.push(
    "No horizontal overflow at 320, 390, 768, 1024, 1440, 2560, or 3840 pixels. Mobile navigation opens and closes after selection.",
  );

  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(
    await page
      .locator(".orbit-one")
      .evaluate((el) => getComputedStyle(el).animationName),
    "none",
  );
  await page.getByRole("button", { name: "Run example", exact: true }).click();
  assert.equal(
    await page
      .getByRole("button", { name: "Replay example", exact: true })
      .count(),
    1,
  );
  results.push(
    "Reduced-motion mode disables ambient animation and completes the example without motion.",
  );
  // Load lazy assets and check actual image decoding, not just HTTP responses.
  for (const img of await page.locator("main img").all()) {
    await img.scrollIntoViewIfNeeded();
    await img.evaluate((el) => el.decode());
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `${output}/desktop-hero.png` });
  await page.screenshot({ path: `${output}/desktop-full.png`, fullPage: true });
  for (const id of ["workflow", "work", "about"])
    await page
      .locator(`#${id}`)
      .screenshot({
        path: `${output}/desktop-${id}.png`,
        style: ".site-header, .skip-link { visibility: hidden !important; }",
      });
  await page.goto(`${base}/contact/`, { waitUntil: "networkidle" });
  await page.locator("#contact").screenshot({
    path: `${output}/desktop-contact.png`,
    style: ".site-header, .skip-link { visibility: hidden !important; }",
  });
  await page.goto(base, { waitUntil: "networkidle" });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `${output}/mobile-hero.png` });
  await page.screenshot({ path: `${output}/mobile-full.png`, fullPage: true });

  // Verify all 6 service pages, 4 legal pages, and security.txt
  const subpages = [
    "/ai-workflow-automation/",
    "/custom-software-development/",
    "/website-design-development/",
    "/internal-tools-development/",
    "/api-integrations/",
    "/landman-title-workflow-automation/",
    "/legal/",
    "/legal/terms/",
    "/legal/privacy/",
    "/legal/client-terms/",
    "/contact/",
  ];
  for (const path of subpages) {
    const res = await page.goto(`${base}${path}`, { waitUntil: "networkidle" });
    assert.equal(res?.status(), 200, `${path} returned HTTP ${res?.status()}`);
    assert.equal(await page.locator("h1").count(), 1, `${path} has 1 H1`);
    const subOffList = await page.locator("a[href]").evaluateAll((links, allow) =>
      links
        .map((a) => a.href)
        .filter((href) => /^https?:/i.test(href))
        .filter((href) => {
          const host = new URL(href).hostname;
          return host !== location.hostname && !allow.includes(host);
        }),
    LINK_ALLOWLIST);
    assert.deepEqual(subOffList, [], `Off-allowlist links on ${path}: ${subOffList.join(", ")}`);
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      assert.ok(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
        `Overflow on ${path} at ${width}px`,
      );
    }
  }
  const secRes = await page.goto(`${base}/.well-known/security.txt`);
  assert.equal(secRes?.status(), 200, "/.well-known/security.txt HTTP 200");
  assert.match(await page.locator("body").innerText(), /Contact: mailto:spencer@theharnesslab\.com/);
  results.push("All 6 service pages, 4 legal pages, and /.well-known/security.txt pass HTTP 200, allowlist, and responsive checks.");

  assert.deepEqual(errors, []);
  assert.deepEqual(consoleWarnings, [], `WebGL/GPU warnings: ${consoleWarnings.join("; ")}`);
  assert.deepEqual(failedAssets, []);
  results.push(
    "All rendered images decode; no JavaScript exceptions or failed local assets. Desktop and mobile screenshots saved.",
  );
  const report = {
    checkedAt: new Date().toISOString(),
    base,
    results,
    errors,
    failedAssets,
    realEmailSent: false,
  };
  await writeFile(
    `${output}/verification.json`,
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close();
}
