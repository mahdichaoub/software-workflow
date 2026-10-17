// SessionStart: if the git working tree is dirty, remind to start the slice from a clean tree.
// stdout becomes session context. Fails open.
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(process.env.CLAUDE_PROJECT_DIR || process.cwd());
const r = spawnSync('git status --porcelain', { cwd: root, shell: true, encoding: 'utf8', timeout: 10000 });
if (r.status !== 0) process.exit(0);
const n = r.stdout.split('\n').filter(Boolean).length;
if (n > 0) {
  process.stdout.write(
    `Working tree has ${n} uncommitted change(s). Start the next slice from a clean tree: commit the finished slice, ` +
      'and keep deletions/cleanups in their own commit. (AGENTS.md, Git hygiene)\n',
  );
}
process.exit(0);
