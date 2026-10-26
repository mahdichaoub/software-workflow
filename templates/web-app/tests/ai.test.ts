import { afterEach, describe, expect, it } from 'vitest';
import { getProvider } from '@/lib/ai';

describe('AI provider', () => {
  const original = process.env.LIVE_AI;
  afterEach(() => {
    process.env.LIVE_AI = original;
  });

  it('uses the fake provider unless LIVE_AI=1', async () => {
    delete process.env.LIVE_AI;
    expect(getProvider().name).toBe('fake');
    process.env.LIVE_AI = '0';
    expect(getProvider().name).toBe('fake');
    expect(await getProvider().complete('hello')).toContain('fake');
  });

  it('refuses LIVE_AI=1 until a real provider is wired in', () => {
    process.env.LIVE_AI = '1';
    expect(() => getProvider()).toThrow(/no real provider/);
  });
});
