import Link from 'next/link';
import { redirect } from 'next/navigation';
import { logInAction } from '@/app/actions';
import { currentUser } from '@/lib/session';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await currentUser()) redirect('/notes');
  const { error } = await searchParams;
  return (
    <>
      <h1>Log in</h1>
      {error && <p className="error" role="alert">{error}</p>}
      <form action={logInAction} className="stack">
        <input name="email" type="email" placeholder="Email" autoComplete="email" required />
        <input name="password" type="password" placeholder="Password" autoComplete="current-password" required />
        <button type="submit">Log in</button>
      </form>
      <p className="muted">
        No account? <Link href="/signup">Sign up</Link>
      </p>
    </>
  );
}
