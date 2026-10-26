import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { openDb } from '@/lib/db';
import { migrations } from '@/lib/migrations';

describe('migrations', () => {
  it('applies every migration once, even when reopened', () => {
    const dir = mkdtempSync(join(tmpdir(), 'app-db-'));
    try {
      const path = join(dir, 'nested', 'app.db');
      openDb(path).close();
      const db = openDb(path);
      const rows = db.prepare('SELECT version FROM _migrations ORDER BY version').all() as { version: number }[];
      expect(rows.map((r) => r.version)).toEqual(migrations.map((_, i) => i + 1));
      db.close();
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
