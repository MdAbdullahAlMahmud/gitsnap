import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Handlebars from 'handlebars';
import { formatNumber } from './utils/format.js';
import type { RepoSnapshot } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.join(__dirname, '../templates');

// Register helpers
Handlebars.registerHelper('formatNum', (n: number) => formatNumber(n));
Handlebars.registerHelper('formatPercent', (n: number) => (Math.round(n * 10) / 10).toFixed(1));
Handlebars.registerHelper('formatDate', (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
});

// Template + style cache keyed by name
const templateCache = new Map<string, Handlebars.TemplateDelegate>();
const styleCache = new Map<string, string>();

async function getTemplate(name: string): Promise<Handlebars.TemplateDelegate> {
  if (!templateCache.has(name)) {
    const src = await fs.readFile(path.join(TEMPLATES_DIR, `${name}.hbs`), 'utf-8');
    templateCache.set(name, Handlebars.compile(src));
  }
  return templateCache.get(name)!;
}

async function getStyles(name: string): Promise<string> {
  if (!styleCache.has(name)) {
    styleCache.set(name, await fs.readFile(path.join(TEMPLATES_DIR, `${name}.css`), 'utf-8'));
  }
  return styleCache.get(name)!;
}

export async function renderCard(snapshot: RepoSnapshot): Promise<string> {
  const templateName = snapshot.layout === 'terminal' ? 'card.terminal' : 'card';
  const stylesName   = snapshot.layout === 'terminal' ? 'styles.terminal' : 'styles';

  const [template, styles] = await Promise.all([
    getTemplate(templateName),
    getStyles(stylesName),
  ]);

  return template({ ...snapshot, styles });
}
