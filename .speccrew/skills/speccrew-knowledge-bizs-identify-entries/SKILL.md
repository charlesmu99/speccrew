---
name: speccrew-knowledge-bizs-identify-entries
description: Analyze source directory structures to identify business module entry directories for each platform using XML workflow blocks. Use when initializing or updating business knowledge base to determine which directories contain user-facing entry points.
tools: Read, Write, Glob, Grep, Bash
---

# Trigger Scenarios
- Called by speccrew-knowledge-bizs-dispatch Stage 1
- "Identify business module entry directories"
- "Analyze source structure for business modules"

## AgentFlow Definition
<!-- @agentflow: SKILL.xml -->
> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
