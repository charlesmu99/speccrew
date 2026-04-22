---
name: speccrew-knowledge-techs-init
description: Stage 1 of technology knowledge initialization - Scan source code to detect technology platforms and generate techs-manifest.json using XML workflow blocks. Identifies web, mobile, backend, and desktop platforms by analyzing configuration files and project structure. Used by Worker Agent to kick off the techs pipeline.
tools: Read, Write, Glob, Grep, SearchCodebase, Skill
---

# Trigger Scenarios
- "Initialize technology knowledge base"
- "Scan source code for technology platforms"
- "Detect tech stacks in project"

## AgentFlow Definition
<!-- @agentflow: SKILL.xml -->
> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
