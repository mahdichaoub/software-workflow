# Starter kit: slice workflow with agent roles

Derived from building Chameleon Studio. One command creates a new project with the workflow and,
optionally, a working starter app; then you fill in only `AGENTS.md`.

## Start a new project (Windows, macOS, Linux; Node 22.13+)

From this kit's folder:

```bash
node scripts/new-project.mjs ../my-app --name "My App"            # web-app starter (default)
node scripts/new-project.mjs ../my-tool --template blank          # workflow only, any stack
node scripts/new-project.mjs ../my-app --enforce-agents           # high-risk: main session can't edit files
```

The script copies `project/`, renames the `*.template` files, overlays the starter template, writes the
stack and commands into `AGENTS.md`, `CLAUDE.md` and `docs/CURRENT.md`, and makes the first git commit.
Then:

```bash
cd ../my-app
npm install && npm run check   # typecheck + tests + build
npm run dev
```

Fill sections 1–2 of `AGENTS.md` (product, users, phases), open Claude Code in the project and describe
your first slice.

## Starter templates (`templates/`)

| Template | What you get |
|---|---|
| `web-app` | Next.js 16 + React 19 + TypeScript. SQLite through Node's built-in `node:sqlite` (no native build, works on Windows). Email/password sign-up and log-in (scrypt, httpOnly session cookie, expiry). Append-only migrations. `src/lib/limits.ts` owns every shown-and-enforced number. `src/lib/ai.ts`: fake AI provider by default, real one only with `LIVE_AI=1`. Example "notes" feature showing the pattern (server-side limits, owner-only delete). Vitest tests; `npm run check` = typecheck + tests + build. |
| `blank` | Workflow files only, for any other stack (mobile, CLI tool, Python...). |

The notes feature is an example: replace it in your first slice. Node prints an `ExperimentalWarning`
for `node:sqlite` on Node 22; it is harmless.

To add a template: create `templates/<name>/` with a `template.json` (`stack`, `commands`) and the files.

Kit tests: `node --test scripts/new-project.test.mjs`.

## What is inside `project/` (copied into every new project)

| Path | Job |
|---|---|
| `AGENTS.md` | Project constitution: product, stack, limits, workflow summary. The only file you must fill in. |
| `CLAUDE.md` | Thin pointer to `AGENTS.md`. |
| `.claude/agents/*.md` | Planner, Architect, Builder, Reviewer, Designer. |
| `.claude/hooks/require-agent.mjs` | Blocks main-session edits of project files. Active only if `.claude/enforce-agents` exists. |
| `.claude/hooks/typecheck-after-edit.mjs` | After a sub-agent edits `.ts/.tsx`, runs the typecheck and returns errors. |
| `.claude/hooks/unverified-guard.mjs` | Refuses `git commit` while the active spec has an unresolved `UNVERIFIED:` line. |
| `.claude/hooks/dirty-tree-warn.mjs` | At session start, warns if the git tree is dirty. |
| `docs/CURRENT.md` | One-page live state. Read first, update last. |
| `docs/DECISIONS.md` | Durable decisions and lessons only. |
| `docs/specs/TEMPLATE.md` | Spec template with a verification-evidence section. |

## Using it with Codex

- `AGENTS.md` is the shared entry point; Codex reads it natively, and `CLAUDE.md` only points to it.
- The role files are Claude Code subagents (`.claude/agents/`). For Codex, copy the same five role files to `.codex/agents/` (or paste each role's instructions into your Codex setup); the text is tool-neutral.
- Claude Code hooks (`.claude/hooks/`, `settings.json`) do not run in Codex. Reproduce the checks as scripts or CI: typecheck on push, and a commit-time check for `UNVERIFIED:` in the active spec.
- Global rules for either tool: `global-CLAUDE-section.md`.

## More docs

- `docs/PLAYBOOK.md`: the workflow, tools and five-layer system.
- `docs/CHAMELEON_LESSONS.md`: what worked and what hurt in Chameleon Studio.

## Calibration

- Personal or low-risk project: leave `.claude/enforce-agents` out. Triage still applies.
- Real users, spend, auth or data: pass `--enforce-agents` (or create `.claude/enforce-agents` later) and use the full chain.
- Playbook page (discussion that produced this kit): https://claude.ai/artifact/Lrkw1AThimykCWsNDFjP8j
