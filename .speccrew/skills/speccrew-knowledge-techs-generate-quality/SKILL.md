---
name: speccrew-knowledge-techs-generate-quality
description: Quality assurance for generated tech documentation using XML workflow blocks. Performs cross-validation, consistency checks, completeness verification, and generates quality reports.
tools: Read, Write, Glob, Grep, Bash
---

# Trigger Scenarios
- "Verify tech documentation quality for {platform}"
- "Run quality checks on generated docs"
- "Validate platform tech docs"

## AgentFlow Definition
<!-- @agentflow: SKILL.xml -->
> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
