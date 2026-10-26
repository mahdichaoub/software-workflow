## Engineering workflow (default for code projects)

Starter kit with agents, hooks and templates: https://github.com/mahdichaoub/software-workflow (local copy: `C:\Users\Asus\.claude\starter-kit\`). A project's own AGENTS.md/CLAUDE.md overrides this section.
1. Triage first: small (Builder + targeted check), medium (short spec, Builder, Reviewer), high impact (auth, data, cost, provider, phase change: full chain + owner approval).
2. Work in thin slices: one user-visible behavior, acceptance criteria before code.
3. Done = checks pass AND each criterion is verified in the running app, or written in the spec as `UNVERIFIED: <reason>`. Never claim a check that was not run.
4. Read the project's docs/CURRENT.md first, then only what the task touches. No re-reading unchanged docs; handoffs stay short.
5. One commit per slice, deletions/cleanups in their own commit, start from a clean tree.
6. Ask the owner only for phase gates, spend/provider calls, external data transfer, irreversible actions, or the same failure three times; otherwise decide, log one line, continue.
7. Check installed framework docs (Context7 or package docs) before using APIs that may have changed.
8. Rules that must hold get a hook, not a paragraph. Shared rules live in AGENTS.md; CLAUDE.md only points to it.
9. New project: `node <kit>/scripts/new-project.mjs <dir> [--template web-app|blank]`, then fill in AGENTS.md only. Propose it, do not run it unasked.
