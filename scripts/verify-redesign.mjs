// Run against the production preview. Requests that could send email are mocked.
// PLAYWRIGHT_MODULE and CHROMIUM_PATH select an already-installed test runtime.
import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
const { chromium } = await import(
  process.env.PLAYWRIGHT_MODULE || "playwright"
);
const base = process.env.PREVIEW_URL || "http://127.0.0.1:4174";
const output = "docs/redesign-2026-09-14";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  ...(process.env.CHROMIUM_PATH
    ? { executablePath: process.env.CHROMIUM_PATH }
    : {}),
});
const results = [],
  errors = [],
  failedAssets = [];
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
  });
  page.on("pageerror", (error) => errors.push(error.message));
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
  assert.match(await page.title(), /Custom Software/);
  assert.equal(await page.locator("h1").count(), 1);
  const text = await page.locator("body").innerText();
  for (const phrase of [
    "TitleDesk Agent",
    "Jayson Powers",
    "BrandStreams",
    "APEX.BUILD",
    "completely self-taught",
    "607-364-7772",
    "sales@theharnesslab.com",
    "spencer@theharnesslab.com",
  ])
    assert.ok(text.includes(phrase), phrase);
  assert.doesNotMatch(text, /\$\d|fixed fee|founding clients|spots remaining/i);
  assert.equal(await page.locator('a[href="tel:+16073647772"]').count(), 1);
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
  for (const name of ["Documents", "Operations", "Client work"]) {
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
    "All five screenshot previews open, close on Escape, and restore keyboard focus.",
  );

  await page
    .getByRole("button", { name: "Let’s talk about your project" })
    .click();
  assert.equal(submissions.length, 0, "Empty form must not submit");
  await page.getByLabel("Your name", { exact: true }).fill("Preview Test");
  await page.getByLabel("Work email").fill("preview@example.com");
  await page.getByLabel("Company").fill("Preview Company");
  await page
    .getByLabel("The idea, the bottleneck, or the big ambition")
    .fill("Automate document intake and prepare a report for review.");
  await page
    .getByRole("button", { name: "Let’s talk about your project" })
    .click();
  await page
    .getByRole("heading", { name: "Your project is on our radar." })
    .waitFor();
  assert.equal(submissions.length, 1);
  assert.equal(submissions[0].email, "preview@example.com");
  assert.equal(submissions[0].requestType, "Workflow automation");
  assert.ok(!("budget" in submissions[0]));
  await page.getByRole("button", { name: "Share another idea" }).click();
  delivery = "failure";
  await page
    .getByLabel("The idea, the bottleneck, or the big ambition")
    .fill("Preserve this enquiry if delivery fails.");
  await page
    .getByRole("button", { name: "Let’s talk about your project" })
    .click();
  await page.getByRole("alert").waitFor();
  assert.equal(
    await page
      .getByLabel("The idea, the bottleneck, or the big ambition")
      .inputValue(),
    "Preserve this enquiry if delivery fails.",
  );
  assert.match(
    await page
      .getByRole("link", { name: "Open this enquiry in your email app" })
      .getAttribute("href"),
    /^mailto:sales@theharnesslab.com\?/,
  );
  results.push(
    "Mocked contact success and server failure pass; native validation blocks empty submission; failure preserves input and offers email fallback. No email sent.",
  );

  await page.reload({ waitUntil: "networkidle" });
  for (const width of [320, 390, 768, 1024, 1440]) {
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
        .getByRole("link", { name: "Our work", exact: true })
        .click();
      assert.equal(await toggle.getAttribute("aria-expanded"), "false");
      assert.equal(new URL(page.url()).hash, "#work");
    }
  }
  results.push(
    "No horizontal overflow at 320, 390, 768, 1024, or 1440 pixels. Mobile navigation opens and closes after selection.",
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
  for (const id of ["workflow", "work", "about", "contact"])
    await page
      .locator(`#${id}`)
      .screenshot({
        path: `${output}/desktop-${id}.png`,
        style: ".site-header, .skip-link { visibility: hidden !important; }",
      });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `${output}/mobile-hero.png` });
  await page.screenshot({ path: `${output}/mobile-full.png`, fullPage: true });
  assert.deepEqual(errors, []);
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
