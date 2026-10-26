import { describe, expect, it } from 'vitest';
import { AuthError, createSession, hashPassword, logIn, signUp, userForSession, verifyPassword } from '@/lib/auth';
import { openDb } from '@/lib/db';
import { PASSWORD_MIN_LENGTH, SESSION_MS } from '@/lib/limits';

const password = 'x'.repeat(PASSWORD_MIN_LENGTH);

describe('passwords', () => {
  it('verifies the right password and rejects a wrong one', () => {
    const stored = hashPassword(password);
    expect(verifyPassword(password, stored)).toBe(true);
    expect(verifyPassword(password + '!', stored)).toBe(false);
    expect(verifyPassword(password, 'garbage')).toBe(false);
  });
});

describe('sign up and log in', () => {
  it('creates an account and logs in case-insensitively', () => {
    const db = openDb(':memory:');
    const user = signUp(db, ' Ada@Example.com ', password);
    expect(user.email).toBe('ada@example.com');
    expect(logIn(db, 'ADA@example.com', password).id).toBe(user.id);
  });

  it('rejects short passwords, bad emails and duplicates', () => {
    const db = openDb(':memory:');
    expect(() => signUp(db, 'ada@example.com', 'x'.repeat(PASSWORD_MIN_LENGTH - 1))).toThrow(AuthError);
    expect(() => signUp(db, 'not-an-email', password)).toThrow(AuthError);
    signUp(db, 'ada@example.com', password);
    expect(() => signUp(db, 'ADA@example.com', password)).toThrow(AuthError);
  });

  it('gives the same error for unknown email and wrong password', () => {
    const db = openDb(':memory:');
    signUp(db, 'ada@example.com', password);
    const unknown = () => logIn(db, 'bob@example.com', password);
    const wrong = () => logIn(db, 'ada@example.com', password + '!');
    expect(unknown).toThrow('Wrong email or password.');
    expect(wrong).toThrow('Wrong email or password.');
  });
});

describe('sessions', () => {
  it('resolves a live session and drops an expired one', () => {
    const db = openDb(':memory:');
    const user = signUp(db, 'ada@example.com', password);
    const now = 1_000_000;
    const session = createSession(db, user.id, now);
    expect(userForSession(db, session.id, now + 1)).toEqual(user);
    expect(userForSession(db, session.id, now + SESSION_MS)).toBeNull();
    // Expired session was deleted, so it stays gone even "back in time".
    expect(userForSession(db, session.id, now + 1)).toBeNull();
    expect(userForSession(db, 'unknown', now)).toBeNull();
  });
});
