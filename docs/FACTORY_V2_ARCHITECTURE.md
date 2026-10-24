# Software Factory v2 — Unified Architecture

## Source concepts
The existing software-workflow starter kit supplies role-based planning, design, coding, review, short handoffs, and small slices. Founder OS contributes governance principles only; it is not loaded as a large always-on agent.

## Three planes
1. **Control plane (deterministic):** task state machine, dependency graph, approval policy, token and cost limits, recovery. Planned TypeScript + SQLite.
2. **Intelligence plane (on demand):** product planning, architecture, coding, code review, debugging. Load the relevant skill only when selected.
3. **Execution plane (isolated):** scoped repository checkout/worktree, coding worker, test runner, GitHub pull request.

## Workflow
Discovery → scoped PRD → architecture and UX decisions → task decomposition → founder approval where required → isolated implementation → independent tests and review → pull request → approved release → monitored improvements.

## Context protocol
Each task has a compact capsule containing objective, acceptance criteria, immutable specification revision, affected file references, interface contracts, policy, and budget. Retrieve additional files only when necessary. Never substitute stale memory for an approved spec.

## Task lifecycle
REQUESTED → PLANNED → AWAITING_APPROVAL → APPROVED → RUNNING → VERIFYING → COMPLETED.
Exceptional states: BLOCKED, FAILED, CANCELLED. A repair returns VERIFYING to RUNNING only if retries and budget remain.

## Approval and security
Prompt instructions and Claude hooks are defense in depth, not authorization boundaries. Worker credentials and network access must be scoped outside the LLM. The controller checks approvals before launching any worker. Production deploys, paid APIs, destructive migrations and secret access require separate policies.

## Verification
Tests must run independently of the coding agent and produce command, exit code, timestamps, artifact references, and commit SHA. Passing unit tests alone does not establish production readiness. Browser, integration, security and operational checks depend on task risk.

## Costs and autonomy
Deterministic routing first. Cheap classifier only for ambiguous work. Strong model for architecture or complex code. Track input/output tokens, cache usage, cost per accepted feature, first-pass pass rate, and retries. Default max automatic repair attempts: 2.

## Explicit exclusions for foundation
No vector database, permanent multi-agent chat, Kubernetes, unrestricted shell agent, or autonomous production deployment.
