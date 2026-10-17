// PreToolUse (Write|Edit|NotebookEdit): the main session must not edit project files; sub-agents may.
// Active only when `.claude/enforce-agents` exists in the project (use it for high-risk projects).
// Sub-agent calls carry `agent_id`; the main session does not. Exit 2 = block. Fails open on bad input.
import { readFileSync, existsSync } from 'node:fs';
import { resolve, relative, isAbsolute } from 'node:path';

let input;
try {
  input = JSON.parse(readFileSync(0, 'utf8') || '{}');
} catch {
  process.exit(0);
}

if (!new Set(['Write', 'Edit', 'NotebookEdit']).has(input.tool_name) || input.agent_id) process.exit(0);

const root = resolve(process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd());
if (!existsSync(resolve(root, '.claude', 'enforce-agents'))) process.exit(0);

const target = input.tool_input?.file_path ?? input.tool_input?.notebook_path;
if (typeof target !== 'string' || !target) process.exit(0);

const norm = (p) => (process.platform === 'win32' ? p.toLowerCase() : p);
const rel = relative(norm(root), norm(resolve(root, target)));
if (rel !== '' && (rel.startsWith('..') || isAbsolute(rel))) process.exit(0);

process.stderr.write(
  'Blocked: the main session does not edit project files (AGENTS.md, roles). ' +
    'Delegate to planner, architect or builder via the Agent tool.\n',
);
process.exit(2);
