import { addNoteAction, deleteNoteAction, logOutAction } from '@/app/actions';
import { getDb } from '@/lib/db';
import { NOTE_MAX_LENGTH, NOTES_PER_USER_MAX } from '@/lib/limits';
import { listNotes } from '@/lib/notes';
import { requireUser } from '@/lib/session';

export default async function NotesPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser();
  const { error } = await searchParams;
  const notes = listNotes(getDb(), user.id);
  return (
    <>
      <div className="row">
        <h1>Notes</h1>
        <form action={logOutAction}>
          <button type="submit" className="link">Log out {user.email}</button>
        </form>
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      <form action={addNoteAction} className="stack">
        <textarea name="body" rows={3} maxLength={NOTE_MAX_LENGTH} placeholder="Write a note" required />
        <div className="row">
          <span className="muted">
            {notes.length} / {NOTES_PER_USER_MAX} notes
          </span>
          <button type="submit">Add note</button>
        </div>
      </form>
      <ul className="notes">
        {notes.map((note) => (
          <li key={note.id} className="row">
            <span>{note.body}</span>
            <form action={deleteNoteAction}>
              <input type="hidden" name="id" value={note.id} />
              <button type="submit" className="link" aria-label="Delete note">Delete</button>
            </form>
          </li>
        ))}
      </ul>
    </>
  );
}
