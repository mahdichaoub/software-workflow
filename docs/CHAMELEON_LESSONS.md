# Lessons from Chameleon Studio (for the software factory)

Source: the Chameleon Studio repo setup and one advisory session. Not a full audit of every session.

## What worked
- **A hook enforcing the role split.** `require-agent.mjs` blocked main-session edits of project files. Enforced by code, so it held.
- **Specs with acceptance criteria and phase gates.** Scope stayed bounded; the owner decided phase transitions.
- **Server-side authorization pattern.** RLS plus an explicit server check (`getClaims`, ownership) on every data access.
- **Cost safety.** Quote then explicit approval for paid calls; no automatic retry of billable work; secrets server-only.
- **Durable decisions file.** `docs/DECISIONS.md` for decisions and lessons only, not a command log.

## What hurt
- **Unverified UI flows.** Typecheck and build were the only static checks; no lint, no automated tests, no browser tests. Phase 3 slice 4 was recorded as unverified; the guided-flow slices relied on manual looks.
- **Heavy ceremony on light work.** The full chain applied even to small fixes; the rule "even a small fix goes to the Builder" adds round trips.
- **Rules in several places.** `CLAUDE.md`, `AGENTS.md`, docs and memory repeated or drifted from each other.
- **Dirty working tree.** Feature edits mixed with large deletions (prototype, env example) and untracked agent folders, which also blocked moving the session to the cloud.
- **Stale framework knowledge.** Next.js 16 changed APIs; agents had to be told to read the installed docs.
- **Long French docs re-read each time.** Costly in tokens; the live state needed a one-page file.

## Fixes now in the kit
Triage levels, `UNVERIFIED:` markers plus a commit guard, typecheck-after-edit hook, `docs/CURRENT.md`, a clean-tree warning, a single source of truth in `AGENTS.md`, framework-docs rule.

## Still missing for a factory
Playwright + Vitest + ESLint baseline, CI workflow, a cross-project status script reading each `CURRENT.md`, per-stack check commands (non-Node projects), and a decision on how Codex and Claude Code share agents.
