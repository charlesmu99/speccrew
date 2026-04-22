---
name: speccrew-dev-review-mobile
description: SpecCrew Mobile Code Review Skill. Reviews mobile app implementation code against system design documents, API contracts, and platform-specific standards. Generates structured review reports with PASS/PARTIAL/FAIL verdict.
tools: Read, Glob, Grep
---

# Trigger Scenarios

- When speccrew-system-developer dispatches mobile code review for a completed module
- When user requests "Review this mobile module's implementation"
- When incremental review is needed after partial mobile implementation

## AgentFlow Definition

<!-- @agentflow: SKILL.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
