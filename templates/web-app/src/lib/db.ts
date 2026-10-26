import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { migrations } from './migrations';

export type Db = DatabaseSync;

/** Opens a database and brings its schema up to date. Use ':memory:' in tests. */
export function openDb(path: string): Db {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  db.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');
  migrate(db);
  return db;
}

function migrate(db: Db) {
  db.exec('CREATE TABLE IF NOT EXISTS _migrations (version INTEGER PRIMARY KEY, applied_at INTEGER NOT NULL)');
  const row = db.prepare('SELECT MAX(version) AS v FROM _migrations').get() as { v: number | null };
  for (let version = (row.v ?? 0) + 1; version <= migrations.length; version++) {
    transaction(db, () => {
      db.exec(migrations[version - 1]);
      db.prepare('INSERT INTO _migrations (version, applied_at) VALUES (?, ?)').run(version, Date.now());
    });
  }
}

export function transaction<T>(db: Db, fn: () => T): T {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = fn();
    db.exec('COMMIT');
    return result;
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}

let shared: Db | undefined;

/** The app's database, opened once per server process. */
export function getDb(): Db {
  shared ??= openDb(process.env.DATABASE_PATH || 'data/app.db');
  return shared;
}
