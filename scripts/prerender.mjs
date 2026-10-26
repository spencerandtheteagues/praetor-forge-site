// Publish the same React content for readers and crawlers before JavaScript runs.
// Uses the project's existing Vite and React dependencies; no network requests.
import { build } from 'vite';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(import.meta.dirname, '..');
const temporary = await mkdtemp(join(root, '.prerender-'));
try {
  await build({
    root,
    configFile: false,
    esbuild: { jsx: 'automatic' },
    logLevel: 'warn',
    build: {
      ssr: 'src/prerender.jsx',
      outDir: temporary,
      copyPublicDir: false,
      rollupOptions: { output: { entryFileNames: 'render.mjs' } },
    },
  });
  const { render } = await import(pathToFileURL(join(temporary, 'render.mjs')));
  const html = await readFile(join(root, 'dist/index.html'), 'utf8');
  const marker = '<div id="root"></div>';
  if (html.split(marker).length !== 2) throw new Error('Expected exactly one empty app root');
  const content = render();
  if (!content.includes('Landman title') || !content.includes('contact-form')) {
    throw new Error('Pre-rendered content is incomplete');
  }
  const form = content.match(/<form\b[^>]*class="contact-form"[^>]*>[\s\S]*?<\/form>/)?.[0];
  if (!form?.includes('method="post"') || !/<fieldset disabled(?:="")?>/.test(form)) {
    throw new Error('Contact controls must stay disabled until the client is ready');
  }
  await writeFile(join(root, 'dist/index.html'), html.replace(marker, () => `<div id="root">${content}</div>`));
  console.log('Pre-rendered the full homepage with service links and contact content.');
} finally {
  await rm(temporary, { recursive: true, force: true });
}
