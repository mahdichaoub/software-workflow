import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { Db } from './db';
import { PASSWORD_MIN_LENGTH, SESSION_MS } from './limits';

export type User = { id: number; email: string };

export class AuthError extends Error {}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64');
  const actual = scryptSync(password, Buffer.from(salt, 'base64'), expected.length);
  return timingSafeEqual(expected, actual);
}

export function signUp(db: Db, email: string, password: string): User {
  const clean = email.trim().toLowerCase();
  if (!EMAIL_RE.test(clean)) throw new AuthError('Enter a valid email address.');
  if (password.length < PASSWORD_MIN_LENGTH) {
    throw new AuthError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters.`);
  }
  if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(clean)) {
    throw new AuthError('An account with this email already exists.');
  }
  const r = db
    .prepare('INSERT INTO users (email, password_hash, created_at) VALUES (?, ?, ?)')
    .run(clean, hashPassword(password), Date.now());
  return { id: Number(r.lastInsertRowid), email: clean };
}

export function logIn(db: Db, email: string, password: string): User {
  const row = db
    .prepare('SELECT id, email, password_hash FROM users WHERE email = ?')
    .get(email.trim().toLowerCase()) as { id: number; email: string; password_hash: string } | undefined;
  // Same message for unknown email and wrong password, so accounts can't be probed.
  if (!row || !verifyPassword(password, row.password_hash)) throw new AuthError('Wrong email or password.');
  return { id: row.id, email: row.email };
}

export function createSession(db: Db, userId: number, now = Date.now()): { id: string; expiresAt: number } {
  const id = randomBytes(32).toString('base64url');
  const expiresAt = now + SESSION_MS;
  db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)').run(id, userId, expiresAt);
  return { id, expiresAt };
}

export function userForSession(db: Db, sessionId: string, now = Date.now()): User | null {
  const row = db
    .prepare('SELECT u.id, u.email, s.expires_at FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ?')
    .get(sessionId) as { id: number; email: string; expires_at: number } | undefined;
  if (!row) return null;
  if (row.expires_at <= now) {
    deleteSession(db, sessionId);
    return null;
  }
  return { id: row.id, email: row.email };
}

export function deleteSession(db: Db, sessionId: string): void {
  db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
}
