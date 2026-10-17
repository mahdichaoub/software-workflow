# Workflow playbook

Derived from building Chameleon Studio (Next.js 16 + Supabase, agent team). Session of 2026-10-17.

## Ideal workflow
1. **Size the process to the risk.** Small and reversible: Builder only, then a targeted check. Medium: short spec, Builder, Reviewer. Data, auth, cost, provider or phase change: Planner, owner approval, Architect, Builder, Reviewer, owner acceptance.
2. **Thin vertical slices.** One screen or behavior end to end, acceptance criteria written first.
3. **Verify in the running app**, not only typecheck and build. Slice 4 of Chameleon stayed unverified because this step was skipped.
4. **Keep the repo clean between slices.** One commit per slice; cleanup deletions in their own commit.
5. **Keep context small.** Short structured handoffs, targeted reads, no re-reading unchanged docs.

## Tools that fill the gaps
| Gap | Add | Why |
|---|---|---|
| No UI verification | Playwright (MCP or scripts) | Repeatable click-through checks of each flow |
| No tests or lint | Vitest + ESLint | Cheap regression safety on auth checks and money/quote flows |
| Supabase / RLS mistakes | Supabase MCP | Inspect schema, policies, advisors on the local DB |
| Stale framework knowledge | Context7 MCP | Current docs for pinned versions |
| Design drift | Figma MCP | One source of truth for Designer and Builder |
| Process discipline | superpowers: verification-before-completion, systematic-debugging | No "done" without evidence |

Trim: brainstorming/writing-plans duplicate the Planner agent; heavy agent-chain systems are overkill for a personal tool; media skills wait until a media provider is connected.

## Five layers
| Layer | File | Holds |
|---|---|---|
| Global rules | `~/.claude/CLAUDE.md` (or Codex equivalent) | Short project-independent rules |
| Project constitution | `AGENTS.md` | Product, stack, limits, phase status |
| Roles | `.claude/agents/*.md` (Claude) or `.codex/agents/` (Codex) | Planner, Architect, Builder, Reviewer, Designer |
| Enforcement | hooks + settings | Rules that must not depend on memory |
| Live state | `docs/CURRENT.md`, `docs/specs/`, `docs/DECISIONS.md` | Active slice, UNVERIFIED items, decisions |

Instructions that matter get a hook, not a paragraph.

## Slice loop
`Triage > (Spec) > Build > Verify in app > Review > Commit > Update CURRENT.md`

## Calibration
Personal tool: default to the medium path, full chain only for high impact. Do not duplicate rules across files.
