// AI / paid providers go through this module only. The fake is the default; a real provider
// runs only with LIVE_AI=1, which the owner turns on for a specific, approved use.
// Never auto-retry a billable call.

export interface AiProvider {
  readonly name: string;
  complete(prompt: string): Promise<string>;
}

export const fakeProvider: AiProvider = {
  name: 'fake',
  async complete(prompt) {
    return `[fake reply to: ${prompt.slice(0, 60)}]`;
  },
};

export function getProvider(): AiProvider {
  if (process.env.LIVE_AI !== '1') return fakeProvider;
  // Wire the real provider here in a High-risk slice (cost, consent and data leaving the app
  // are decided with the owner first). Keys are read server-side only, never logged.
  throw new Error('LIVE_AI=1 but no real provider is configured in src/lib/ai.ts.');
}
