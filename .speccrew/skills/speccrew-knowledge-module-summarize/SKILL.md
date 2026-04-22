---
name: speccrew-knowledge-module-summarize
description: Summarize a module's features to complete MODULE-OVERVIEW.md using XML workflow blocks. Reads all FEATURE-DETAIL.md files of a module and generates the complete module overview with entities, dependencies, and business rules.
tools: Read, Write, Glob
---

# Trigger Scenarios
- "Summarize module {name} features"
- "Complete module overview for {name}"
- "Finalize module documentation for {name}"

## AgentFlow Definition
<!-- @agentflow: SKILL.xml -->
> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
