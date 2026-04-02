import { describe, it, expect, afterEach } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { takeScreenshot } from '../src/screenshot.js';

const HTML = `<!DOCTYPE html><html><body style="background:#0d1117;color:#fff;width:1200px;height:630px;">
  <h1>Test</h1>
</body></html>`;

const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47]); // \x89PNG

describe('takeScreenshot', () => {
  const tmpFiles: string[] = [];

  afterEach(async () => {
    for (const f of tmpFiles) {
      await fs.unlink(f).catch(() => {});
    }
    tmpFiles.length = 0;
  });

  it('generates a PNG file with valid magic bytes', async () => {
    const output = path.join(os.tmpdir(), `gitcard-test-${Date.now()}`);
    const result = await takeScreenshot(HTML, {
      format: 'png',
      output,
      width: 1200,
      height: 630,
    });
    tmpFiles.push(result);

    expect(result).toMatch(/\.png$/);
    const buf = await fs.readFile(result);
    expect(buf.slice(0, 4)).toEqual(PNG_MAGIC);
    expect(buf.length).toBeGreaterThan(1000);
  }, 30000);

  it('generates a PDF file', async () => {
    const output = path.join(os.tmpdir(), `gitcard-test-${Date.now()}`);
    const result = await takeScreenshot(HTML, {
      format: 'pdf',
      output,
      width: 1200,
      height: 630,
    });
    tmpFiles.push(result);

    expect(result).toMatch(/\.pdf$/);
    const buf = await fs.readFile(result);
    // PDF magic: %PDF
    expect(buf.slice(0, 4).toString()).toBe('%PDF');
  }, 30000);
});
