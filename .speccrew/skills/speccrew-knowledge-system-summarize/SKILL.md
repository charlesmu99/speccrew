---
name: speccrew-knowledge-system-summarize
description: Generate complete system-overview.md by reading all {{module_name}}-overview.md files using XML workflow blocks. Aggregates module information, builds dependency graph, and creates system-level documentation.
tools: Read, Write, Glob, Skill
---

# Trigger Scenarios
- "Generate system overview from modules"
- "Complete system documentation"
- "Summarize all modules into system view"

## AgentFlow Definition
<!-- @agentflow: SKILL.xml -->
> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
