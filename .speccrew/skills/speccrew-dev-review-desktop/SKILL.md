---
name: speccrew-dev-review-desktop
description: SpecCrew Desktop Code Review Skill. Reviews desktop app implementation code (Electron/Tauri) against system design documents and security standards. Generates structured review reports with PASS/PARTIAL/FAIL verdict.
tools: Read, Glob, Grep
---

# Trigger Scenarios

- When speccrew-system-developer dispatches desktop code review for a completed module
- When user requests "Review this desktop module's implementation"
- When incremental review is needed after partial desktop implementation

## AgentFlow Definition

<!-- @agentflow: SKILL.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
