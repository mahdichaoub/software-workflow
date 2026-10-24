# Factory v2 — Delivery Plan

## M0 — Contracts and repository integration (this PR)
- Preserve original starter kit and its Claude Code hooks.
- Add project master, architecture, task schema and implementation plan.
- Document risks and acceptance gates.

## M1 — Durable coordinator
- TypeScript CLI and SQLite transactions.
- Strict state transitions, run IDs, idempotency, leases and restart recovery.
- Approval records, task budgets and two-repair limit.
- Tests: cannot run unapproved task; retry cap; restart; budget stop; conflicting spec rejection.

## M2 — Real coding loop
- Worker adapter (Codex or Claude Code), scoped Git worktree, no unrestricted production credentials.
- Run test commands in sandbox and capture independent evidence.
- Open a draft PR; never auto-merge.
- Demonstrate one complete feature reaching PR.

## M3 — Context and model routing
- Versioned task capsule, targeted code retrieval, skill registry, context-size and token accounting.
- Compare costs and success rates against baseline.

## M4 — Hardening
- Permission and network restrictions; integration and browser tests; policy-bypass tests.
- Staging release, monitoring, backup/restore, rollback.
- Validate with a real small application.

## Acceptance for next PR
A reproducible test suite must prove the coordinator's state transitions, approvals and repair limits. Avoid claiming security enforcement before sandbox controls exist.
