// PostToolUse (Write|Edit): after a sub-agent edits a .ts/.tsx file, run `npm run typecheck` and feed errors back.
// Exit 2 = errors shown to Claude. Fails open if there is no typecheck script. Edit the command if needed.
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

let input;
try {
  input = JSON.parse(readFileSync(0, 'utf8') || '{}');
} catch {
  process.exit(0);
}

if (!input.agent_id) process.exit(0);
const file = input.tool_input?.file_path;
if (typeof file !== 'string' || !/\.(ts|tsx)$/.test(file)) process.exit(0);

const root = resolve(process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd());
const pkgPath = resolve(root, 'package.json');
if (!existsSync(pkgPath)) process.exit(0);
try {
  if (!JSON.parse(readFileSync(pkgPath, 'utf8')).scripts?.typecheck) process.exit(0);
} catch {
  process.exit(0);
}

const r = spawnSync('npm run typecheck --silent', { cwd: root, shell: true, encoding: 'utf8', timeout: 110000 });
if (r.status === 0) process.exit(0);
const out = `${r.stdout ?? ''}${r.stderr ?? ''}`.trim().split('\n').slice(-30).join('\n');
process.stderr.write(`Typecheck failed after editing ${file}:\n${out}\n`);
process.exit(2);
