import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSession, deleteSession, userForSession, type User } from './auth';
import { getDb } from './db';

const COOKIE = 'session';

export async function currentUser(): Promise<User | null> {
  const id = (await cookies()).get(COOKIE)?.value;
  return id ? userForSession(getDb(), id) : null;
}

/** For pages and actions that need a signed-in user. */
export async function requireUser(): Promise<User> {
  const user = await currentUser();
  if (!user) redirect('/login');
  return user;
}

export async function startSession(userId: number): Promise<void> {
  const session = createSession(getDb(), userId);
  (await cookies()).set(COOKIE, session.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(session.expiresAt),
  });
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  const id = jar.get(COOKIE)?.value;
  if (id) deleteSession(getDb(), id);
  jar.delete(COOKIE);
}
