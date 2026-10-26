// Example feature. Replace or delete it in your first slice; keep the pattern:
// pure functions that take the db, enforce limits on the server, and are unit-tested.
import { transaction, type Db } from './db';
import { NOTE_MAX_LENGTH, NOTES_PER_USER_MAX } from './limits';

export type Note = { id: number; body: string; created_at: number };

export class NoteError extends Error {}

export function listNotes(db: Db, userId: number): Note[] {
  return db
    .prepare('SELECT id, body, created_at FROM notes WHERE user_id = ? ORDER BY created_at DESC, id DESC')
    .all(userId) as Note[];
}

export function addNote(db: Db, userId: number, body: string): Note {
  const text = body.trim();
  if (!text) throw new NoteError('A note cannot be empty.');
  if (text.length > NOTE_MAX_LENGTH) throw new NoteError(`A note can be at most ${NOTE_MAX_LENGTH} characters.`);
  // Count and insert in one transaction so two requests can't both pass the limit.
  return transaction(db, () => {
    const { n } = db.prepare('SELECT COUNT(*) AS n FROM notes WHERE user_id = ?').get(userId) as { n: number };
    if (n >= NOTES_PER_USER_MAX) throw new NoteError(`You can keep at most ${NOTES_PER_USER_MAX} notes.`);
    const createdAt = Date.now();
    const r = db.prepare('INSERT INTO notes (user_id, body, created_at) VALUES (?, ?, ?)').run(userId, text, createdAt);
    return { id: Number(r.lastInsertRowid), body: text, created_at: createdAt };
  });
}

/** Deletes only the caller's own note; returns false if it doesn't exist or belongs to someone else. */
export function deleteNote(db: Db, userId: number, noteId: number): boolean {
  return db.prepare('DELETE FROM notes WHERE id = ? AND user_id = ?').run(noteId, userId).changes > 0;
}
