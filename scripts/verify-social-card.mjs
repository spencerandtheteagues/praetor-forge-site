import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const indexPath = resolve(root, 'index.html');
const cardPath = resolve(root, 'public/social-card.png');
const maxCardBytes = 5 * 1024 * 1024;
const failures = [];

const html = readFileSync(indexPath, 'utf8');

function parseAttributes(tag) {
  const attrs = {};
  const pattern = /([^\s"'=<>`]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;
  let match;

  while ((match = pattern.exec(tag)) !== null) {
    attrs[match[1].toLowerCase()] = match[2] ?? match[3] ?? match[4] ?? '';
  }

  return attrs;
}

const tags = [...html.matchAll(/<\s*(meta|link)\b[^>]*>/gi)].map((match) => ({
  tag: match[0],
  attrs: parseAttributes(match[0]),
}));

function findTag(kind, key, value) {
  const lowerValue = value.toLowerCase();

  return tags.find(({ attrs }) => {
    if (!attrs[key]) return false;
    if (attrs[key].toLowerCase() !== lowerValue) return false;
    return kind === 'meta' ? attrs.content !== undefined : attrs.href !== undefined;
  });
}

function expectMeta(key, name, expected) {
  const tag = findTag('meta', key, name);
  const actual = tag?.attrs.content;

  if (actual !== expected) {
    failures.push(`${key}="${name}" expected "${expected}", found "${actual ?? 'missing'}"`);
  }
}

function expectLink(rel, expected) {
  const tag = findTag('link', 'rel', rel);
  const actual = tag?.attrs.href;

  if (actual !== expected) {
    failures.push(`link rel="${rel}" expected "${expected}", found "${actual ?? 'missing'}"`);
  }
}

const description =
  'We build custom AI agent harnesses: Hermes/OpenClaw setup, customer-owned builds, rescue work, and audits — smoke tests, runbooks, and handoff with no hosted secrets.';

expectLink('canonical', 'https://theharnesslab.com/');
expectMeta('property', 'og:url', 'https://theharnesslab.com/');
expectMeta('property', 'og:type', 'website');
expectMeta('property', 'og:title', 'The Harness Lab');
expectMeta('property', 'og:description', description);
expectMeta('property', 'og:image', 'https://theharnesslab.com/social-card.png');
expectMeta('property', 'og:image:secure_url', 'https://theharnesslab.com/social-card.png');
expectMeta('property', 'og:image:type', 'image/png');
expectMeta('property', 'og:image:width', '1200');
expectMeta('property', 'og:image:height', '630');
expectMeta('property', 'og:image:alt', 'The Harness Lab logo');
expectMeta('name', 'twitter:card', 'summary_large_image');
expectMeta('name', 'twitter:title', 'The Harness Lab');
expectMeta('name', 'twitter:description', description);
expectMeta('name', 'twitter:image', 'https://theharnesslab.com/social-card.png');
expectMeta('name', 'twitter:image:alt', 'The Harness Lab logo');

let cardStats;
let card;

try {
  cardStats = statSync(cardPath);
  card = readFileSync(cardPath);
} catch (error) {
  failures.push(`social-card.png could not be read: ${error.message}`);
}

if (card) {
  const pngSignature = '89504e470d0a1a0a';

  if (card.subarray(0, 8).toString('hex') !== pngSignature) {
    failures.push('social-card.png is not a valid PNG file');
  }

  const width = card.readUInt32BE(16);
  const height = card.readUInt32BE(20);

  if (width !== 1200 || height !== 630) {
    failures.push(`social-card.png expected 1200x630, found ${width}x${height}`);
  }

  if (cardStats.size >= maxCardBytes) {
    failures.push(`social-card.png expected under 5 MB, found ${cardStats.size} bytes`);
  }
}

if (failures.length > 0) {
  console.error('Social preview verification failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('Social preview verification passed.');
console.log(`social-card.png: ${card.readUInt32BE(16)}x${card.readUInt32BE(20)}, ${cardStats.size} bytes`);
