import { describe, expect, it } from 'vitest';
import { signUp } from '@/lib/auth';
import { openDb } from '@/lib/db';
import { NOTE_MAX_LENGTH, NOTES_PER_USER_MAX } from '@/lib/limits';
import { addNote, deleteNote, listNotes, NoteError } from '@/lib/notes';

function setup() {
  const db = openDb(':memory:');
  const ada = signUp(db, 'ada@example.com', 'password1');
  const bob = signUp(db, 'bob@example.com', 'password1');
  return { db, ada, bob };
}

describe('notes', () => {
  it('adds, lists newest first and keeps users apart', () => {
    const { db, ada, bob } = setup();
    addNote(db, ada.id, ' first ');
    addNote(db, ada.id, 'second');
    addNote(db, bob.id, 'bob only');
    expect(listNotes(db, ada.id).map((n) => n.body)).toEqual(['second', 'first']);
    expect(listNotes(db, bob.id).map((n) => n.body)).toEqual(['bob only']);
  });

  it('rejects empty and too-long notes', () => {
    const { db, ada } = setup();
    expect(() => addNote(db, ada.id, '   ')).toThrow(NoteError);
    expect(() => addNote(db, ada.id, 'x'.repeat(NOTE_MAX_LENGTH + 1))).toThrow(NoteError);
    expect(addNote(db, ada.id, 'x'.repeat(NOTE_MAX_LENGTH)).body).toHaveLength(NOTE_MAX_LENGTH);
  });

  it('enforces the per-user limit on the server', () => {
    const { db, ada, bob } = setup();
    for (let i = 0; i < NOTES_PER_USER_MAX; i++) addNote(db, ada.id, `note ${i}`);
    expect(() => addNote(db, ada.id, 'one too many')).toThrow(NoteError);
    expect(listNotes(db, ada.id)).toHaveLength(NOTES_PER_USER_MAX);
    expect(() => addNote(db, bob.id, 'bob is unaffected')).not.toThrow();
  });

  it('only deletes the owner\'s note', () => {
    const { db, ada, bob } = setup();
    const note = addNote(db, ada.id, 'mine');
    expect(deleteNote(db, bob.id, note.id)).toBe(false);
    expect(listNotes(db, ada.id)).toHaveLength(1);
    expect(deleteNote(db, ada.id, note.id)).toBe(true);
    expect(listNotes(db, ada.id)).toHaveLength(0);
  });

  it('deletes a user\'s notes with the user', () => {
    const { db, ada } = setup();
    addNote(db, ada.id, 'mine');
    db.prepare('DELETE FROM users WHERE id = ?').run(ada.id);
    expect(listNotes(db, ada.id)).toHaveLength(0);
  });
});
