#!/usr/bin/env node
// Creates a new project from this kit in one command (Windows, macOS, Linux; Node 20+).
//
//   node scripts/new-project.mjs <target-dir> [--template web-app|blank] [--name "My App"]
//                                [--enforce-agents] [--no-git]
//
// Copies project/ (workflow, agents, hooks, docs), renames the *.template files, overlays the
// chosen starter template, fills the stack and commands into AGENTS.md, CLAUDE.md and
// docs/CURRENT.md, then makes the first git commit.
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, readdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const KIT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TEMPLATES = join(KIT, 'templates');
const SKIP = new Set(['node_modules', '.next', 'data', 'template.json', 'next-env.d.ts']);

function fail(message) {
  console.error(`new-project: ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const opts = { template: 'web-app', git: true, enforce: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--template') opts.template = argv[++i];
    else if (a === '--name') opts.name = argv[++i];
    else if (a === '--enforce-agents') opts.enforce = true;
    else if (a === '--no-git') opts.git = false;
    else if (a === '-h' || a === '--help') opts.help = true;
    else if (a.startsWith('-')) fail(`unknown option ${a}`);
    else if (opts.target) fail(`unexpected argument ${a}`);
    else opts.target = a;
  }
  return opts;
}

function templateNames() {
  return readdirSync(TEMPLATES, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
}

function edit(file, fn) {
  writeFileSync(file, fn(readFileSync(file, 'utf8')));
}

const opts = parseArgs(process.argv.slice(2));
const templates = templateNames();
if (opts.help || !opts.target) {
  console.log(
    'Usage: node scripts/new-project.mjs <target-dir> [--template <name>] [--name "My App"] [--enforce-agents] [--no-git]\n' +
      `Templates: ${['blank', ...templates].join(', ')} (default: web-app)`,
  );
  process.exit(opts.help ? 0 : 1);
}
if (opts.template !== 'blank' && !templates.includes(opts.template)) {
  fail(`unknown template "${opts.template}". Available: blank, ${templates.join(', ')}`);
}

const target = resolve(opts.target);
const rel = relative(KIT, target);
if (rel === '' || (!rel.startsWith('..') && !isAbsolute(rel))) {
  fail('create the project outside the kit folder, e.g. ../my-app');
}
if (existsSync(target) && readdirSync(target).length > 0) fail(`${target} exists and is not empty`);
const name = opts.name || basename(target);

// 1. Workflow kit.
cpSync(join(KIT, 'project'), target, { recursive: true });
renameSync(join(target, 'AGENTS.template.md'), join(target, 'AGENTS.md'));
renameSync(join(target, 'CLAUDE.template.md'), join(target, 'CLAUDE.md'));
renameSync(join(target, '.claude', 'settings.template.json'), join(target, '.claude', 'settings.json'));
if (opts.enforce) writeFileSync(join(target, '.claude', 'enforce-agents'), '');

// 2. Starter template.
let meta = { stack: '', commands: {} };
if (opts.template !== 'blank') {
  const src = join(TEMPLATES, opts.template);
  cpSync(src, target, {
    recursive: true,
    filter: (p) => p === src || !relative(src, p).split(sep).some((part) => SKIP.has(part)),
  });
  meta = JSON.parse(readFileSync(join(src, 'template.json'), 'utf8'));
  const pkg = join(target, 'package.json');
  if (existsSync(pkg)) {
    const slug = name.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '') || 'app';
    edit(pkg, (s) => s.replace(/"name": "[^"]*"/, `"name": "${slug}"`));
  }
}

// 3. Fill the docs.
const c = meta.commands;
edit(join(target, 'AGENTS.md'), (s) =>
  s
    .replace('# <Project name>', `# ${name}`)
    .replace('- Stack and pinned versions (see lockfile):', `- Stack and pinned versions (see lockfile): ${meta.stack}`.trimEnd()),
);
if (Object.keys(c).length > 0) {
  const block = ['```', ...Object.entries(c).map(([k, v]) => `${k.padEnd(10)}${v}`), '```'].join('\n');
  edit(join(target, 'CLAUDE.md'), (s) => s.replace('<!-- fill in: dev, build, typecheck, test, lint -->', block));
  edit(join(target, 'docs', 'CURRENT.md'), (s) =>
    s.replace(
      /^- Commands: .*$/m,
      `- Commands: dev \`${c.dev}\` | typecheck \`${c.typecheck}\` | build \`${c.build}\` | tests \`${c.test}\` | all \`${c.check}\``,
    ),
  );
}

// 4. Git.
let committed = false;
if (opts.git) {
  const git = (...args) => spawnSync('git', args, { cwd: target, encoding: 'utf8' });
  if (git('init', '-q').status === 0) {
    git('add', '-A');
    committed = git('commit', '-q', '-m', `chore: start ${name} from software-workflow kit (${opts.template})`).status === 0;
    if (!committed) console.warn('new-project: git commit failed (set git user.name/user.email), files are staged.');
  } else {
    console.warn('new-project: git not available, skipped git init.');
  }
}

console.log(`Created ${target} (template: ${opts.template}${committed ? ', first commit made' : ''})

Next:
  cd ${relative(process.cwd(), target) || '.'}${opts.template === 'web-app' ? '\n  npm install\n  npm run check        # typecheck + tests + build\n  npm run dev' : ''}
  Fill sections 1-2 of AGENTS.md (product, users, phases), then open Claude Code there and
  describe your first slice.`);
