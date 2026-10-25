# Starter kit: slice workflow with agent roles

Derived from building Chameleon Studio. Copy into a new project, fill in only `AGENTS.md`.

## Install in a new project (from the project root)

```powershell
$k = "$env:USERPROFILE\.claude\starter-kit"
Copy-Item "$k\project\*" . -Recurse -Force
Rename-Item AGENTS.template.md AGENTS.md
Rename-Item CLAUDE.template.md CLAUDE.md
Rename-Item .claude\settings.template.json settings.json
```

For UI projects, install the design skill and create the design context (the Designer role depends on it):

```powershell
npx impeccable install      # skill + post-edit detector hook (Claude Code: .claude/settings.local.json)
# then, inside Claude Code: /impeccable init   -> writes PRODUCT.md
```

Then edit `AGENTS.md` (product, stack, palette, limits, phases) and the test/typecheck commands in
`CURRENT.md`. Replace `<TYPECHECK_CMD>` mentions if the project has no `typecheck` script.

## What is inside

| Path | Job |
|---|---|
| `AGENTS.md` | Project constitution: product, stack, limits, workflow summary. The only file you must fill in. |
| `CLAUDE.md` | Thin pointer to `AGENTS.md`. |
| `.claude/agents/*.md` | Planner, Architect, Builder, Reviewer, Designer. Designer and Builder use [Impeccable](https://github.com/pbakaus/impeccable): Designer runs read-only `critique`/`audit`/`shape` and `npx impeccable detect`; Builder runs the editing commands. |
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
- Real users, spend, auth or data: create the marker (`New-Item .claude\enforce-agents`) and use the full chain.
- Playbook page (discussion that produced this kit): https://claude.ai/artifact/Lrkw1AThimykCWsNDFjP8j
