// PreToolUse (Bash): refuse `git commit` while the ACTIVE spec has an unresolved `UNVERIFIED:` line.
// Active spec = the path on the `Active spec:` line of docs/CURRENT.md. A waived item is written
// `UNVERIFIED (waived by owner <date>): ...` and is allowed. Exit 2 = block. Fails open.
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

let input;
try {
  input = JSON.parse(readFileSync(0, 'utf8') || '{}');
} catch {
  process.exit(0);
}

const cmd = input.tool_input?.command;
if (input.tool_name !== 'Bash' || typeof cmd !== 'string' || !/\bgit\s+commit\b/.test(cmd)) process.exit(0);

const root = resolve(process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd());
const currentPath = resolve(root, 'docs', 'CURRENT.md');
if (!existsSync(currentPath)) process.exit(0);

const m = readFileSync(currentPath, 'utf8').match(/^- Active spec:\s*(\S+\.md)/m);
if (!m) process.exit(0);
const specPath = resolve(root, m[1]);
if (!existsSync(specPath)) process.exit(0);

const open = readFileSync(specPath, 'utf8')
  .split('\n')
  .filter((l) => /UNVERIFIED:/.test(l) && !/waived/i.test(l));
if (open.length === 0) process.exit(0);

process.stderr.write(
  `Commit blocked: ${m[1]} has ${open.length} unresolved UNVERIFIED item(s):\n` +
    open.slice(0, 5).map((l) => `  ${l.trim()}`).join('\n') +
    '\nVerify them in the running app, or ask the owner to waive them (write "UNVERIFIED (waived by owner <date>): ...").\n',
);
process.exit(2);
