// Run: node --test scripts/new-project.test.mjs
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, test } from 'node:test';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./new-project.mjs', import.meta.url));
const kit = fileURLToPath(new URL('..', import.meta.url));
const tmp = mkdtempSync(join(tmpdir(), 'new-project-'));
after(() => rmSync(tmp, { recursive: true, force: true }));

const run = (...args) => spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });
const read = (...p) => readFileSync(join(...p), 'utf8');

test('web-app: copies kit + template and fills the docs', () => {
  const dir = join(tmp, 'my-app');
  const r = run(dir, '--name', 'My App', '--no-git');
  assert.equal(r.status, 0, r.stderr);
  for (const f of ['AGENTS.md', 'CLAUDE.md', '.claude/settings.json', '.claude/hooks/require-agent.mjs', 'docs/CURRENT.md', 'src/lib/limits.ts', '.gitignore']) {
    assert.ok(existsSync(join(dir, f)), `${f} missing`);
  }
  for (const f of ['AGENTS.template.md', 'CLAUDE.template.md', 'template.json', '.claude/enforce-agents', 'node_modules']) {
    assert.ok(!existsSync(join(dir, f)), `${f} should not be copied`);
  }
  assert.match(read(dir, 'AGENTS.md'), /^# My App/);
  assert.match(read(dir, 'AGENTS.md'), /Stack and pinned versions \(see lockfile\): Next\.js/);
  assert.match(read(dir, 'CLAUDE.md'), /check\s+npm run check/);
  assert.match(read(dir, 'docs', 'CURRENT.md'), /all `npm run check`/);
  assert.equal(JSON.parse(read(dir, 'package.json')).name, 'my-app');
});

test('blank template, enforce-agents marker and first commit', () => {
  const dir = join(tmp, 'blank');
  const r = run(dir, '--template', 'blank', '--enforce-agents');
  assert.equal(r.status, 0, r.stderr);
  assert.ok(existsSync(join(dir, '.claude', 'enforce-agents')));
  assert.ok(!existsSync(join(dir, 'package.json')));
  assert.match(read(dir, 'CLAUDE.md'), /<!-- fill in/);
  assert.ok(existsSync(join(dir, '.git')));
});

test('refuses a non-empty target, the kit itself and unknown templates', () => {
  const busy = join(tmp, 'busy');
  mkdirSync(busy);
  writeFileSync(join(busy, 'keep.txt'), 'x');
  assert.notEqual(run(busy).status, 0);
  assert.equal(read(busy, 'keep.txt'), 'x');
  assert.notEqual(run(join(kit, 'inside')).status, 0);
  assert.ok(!existsSync(join(kit, 'inside')));
  assert.notEqual(run(join(tmp, 'x'), '--template', 'nope').status, 0);
});
