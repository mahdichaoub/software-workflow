import Link from 'next/link';
import { redirect } from 'next/navigation';
import { signUpAction } from '@/app/actions';
import { PASSWORD_MIN_LENGTH } from '@/lib/limits';
import { currentUser } from '@/lib/session';

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await currentUser()) redirect('/notes');
  const { error } = await searchParams;
  return (
    <>
      <h1>Create an account</h1>
      {error && <p className="error" role="alert">{error}</p>}
      <form action={signUpAction} className="stack">
        <input name="email" type="email" placeholder="Email" autoComplete="email" required />
        <input
          name="password"
          type="password"
          placeholder={`Password (at least ${PASSWORD_MIN_LENGTH} characters)`}
          autoComplete="new-password"
          minLength={PASSWORD_MIN_LENGTH}
          required
        />
        <button type="submit">Sign up</button>
      </form>
      <p className="muted">
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </>
  );
}
