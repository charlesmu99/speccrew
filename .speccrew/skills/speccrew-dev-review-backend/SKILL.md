---
name: speccrew-dev-review-backend
description: SpecCrew Backend Code Review Skill. Reviews backend implementation code against system design documents, API contracts, and coding standards. Generates structured review reports with PASS/PARTIAL/FAIL verdict.
tools: Read, Glob, Grep
---

# Trigger Scenarios

- When speccrew-system-developer dispatches backend code review for a completed module
- When user requests "Review this backend module's implementation"
- When incremental review is needed after partial backend implementation

## AgentFlow Definition

<!-- @agentflow: SKILL.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
