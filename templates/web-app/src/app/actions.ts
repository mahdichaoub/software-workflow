'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { AuthError, logIn, signUp } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { addNote, deleteNote, NoteError } from '@/lib/notes';
import { endSession, requireUser, startSession } from '@/lib/session';

const field = (form: FormData, name: string) => String(form.get(name) ?? '');
const withError = (path: string, message: string) => `${path}?error=${encodeURIComponent(message)}`;

export async function signUpAction(form: FormData) {
  let userId: number;
  try {
    userId = signUp(getDb(), field(form, 'email'), field(form, 'password')).id;
  } catch (err) {
    if (err instanceof AuthError) redirect(withError('/signup', err.message));
    throw err;
  }
  await startSession(userId);
  redirect('/notes');
}

export async function logInAction(form: FormData) {
  let userId: number;
  try {
    userId = logIn(getDb(), field(form, 'email'), field(form, 'password')).id;
  } catch (err) {
    if (err instanceof AuthError) redirect(withError('/login', err.message));
    throw err;
  }
  await startSession(userId);
  redirect('/notes');
}

export async function logOutAction() {
  await endSession();
  redirect('/login');
}

export async function addNoteAction(form: FormData) {
  const user = await requireUser();
  try {
    addNote(getDb(), user.id, field(form, 'body'));
  } catch (err) {
    if (err instanceof NoteError) redirect(withError('/notes', err.message));
    throw err;
  }
  revalidatePath('/notes');
  redirect('/notes');
}

export async function deleteNoteAction(form: FormData) {
  const user = await requireUser();
  deleteNote(getDb(), user.id, Number(field(form, 'id')));
  revalidatePath('/notes');
}
