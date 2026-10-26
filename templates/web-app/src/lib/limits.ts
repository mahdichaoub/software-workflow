// Every number the user sees AND the app enforces lives here, once.
// UI text, server checks and tests all import from this file; never repeat a literal elsewhere.

export const PASSWORD_MIN_LENGTH = 8;
export const NOTE_MAX_LENGTH = 500;
export const NOTES_PER_USER_MAX = 100;
export const SESSION_DAYS = 30;

export const SESSION_MS = SESSION_DAYS * 24 * 60 * 60 * 1000;
