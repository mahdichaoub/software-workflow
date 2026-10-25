# <Project name> — shared project instructions

> Fill in sections 1 and 2 per project. Section 3 onward is the reusable workflow; edit only to tune.

## 1. Product and stack
- What it is, for whom, the single user journey:
- Stack and pinned versions (see lockfile):
- Visual direction / palette / language of the UI (durable product truth lives in `PRODUCT.md`, visual system in `DESIGN.md`, both created by Impeccable):
- Hard limits (secrets server-side, no paid calls without approval, etc.):

## 2. Phases and status
- Current phase and approved scope:
- Next phase requires explicit Human Owner approval.
- Live state lives in `docs/CURRENT.md`, not here.

## 3. Roles
Planner (specs), Architect (design + decisions), Builder (code), Reviewer (read-only findings),
Designer (UI critique via Impeccable's read-only commands, no code; Builder runs the editing commands). Agents live in `.claude/agents/`. The Human Owner alone decides scope,
phase transitions, external data transfers and spend.

## 4. Triage first
Classify every task before choosing roles.
- **Small** (local, reversible, clear): Builder with concise criteria, targeted check, self-review.
- **Medium** (several files, new behavior inside approved scope): short spec, Builder, Reviewer.
- **High impact** (auth, data, migrations, cost, external provider, architecture, phase change): Planner, owner approval, Architect, Builder, Reviewer, owner acceptance.

## 5. Slice loop
`Triage > (Spec) > Build > Verify in app > Review > Commit > Update docs/CURRENT.md`
- One user-visible behavior per slice. Acceptance criteria are written before code.
- **Verify in app** is a separate step with its own evidence: run the app and exercise every criterion.
- Review is skipped for small changes and mandatory for auth, data or cost.

## 6. Definition of done
1. Typecheck/build (and tests/lint if present) pass, with output reported.
2. Every acceptance criterion was checked in the running app, or is written in the spec as
   `UNVERIFIED: <reason>`. Silence is not allowed. An owner waiver is written `UNVERIFIED (waived by owner <date>): <reason>`.
3. Report what was run and what it showed. Never write "should work". Never claim a check that was not run.

## 7. Context budget
Read `docs/CURRENT.md` first, then only the spec and code sections touched. Do not re-read unchanged docs;
re-read when a phase opens, something contradicts, a check fails, or a dependency changed. Handoffs are short.

Handoff template: `Role / Task / Approved scope / Inputs read / Deliverable / Decisions needed from owner / Evidence (run) / Evidence reused and why valid / Unverified / Next role`.

## 8. Git hygiene
One commit per slice. Deletions and cleanups are separate commits. Start each slice from a clean tree.
Commit or push only when the owner asked or standing autonomy allows it. Never skip hooks.

## 9. Stop conditions
Ask the Human Owner only for: phase gates, material product/architecture decisions, external data
transfer, spend or provider calls, irreversible actions, scope conflicts, or the same failure three times.
Otherwise choose the simpler/safer reversible option, note it in one line in `docs/DECISIONS.md`, continue.

## 10. Framework humility
Before using an API that may have changed, check the installed version's docs (Context7 MCP if
available, else `node_modules/<pkg>/docs` or official docs). Say when that was not possible.

## 11. Single source of truth
Shared rules live here. `CLAUDE.md` and other tool files only point to this file.
