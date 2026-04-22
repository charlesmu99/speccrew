---
name: speccrew-knowledge-bizs-init-features
description: Execute generate-inventory.js script to create features.json inventory for a single platform. Called by bizs-dispatch Stage 1b for each platform.
tools: Read, Write, Bash
---

# Trigger Scenarios
- Called by speccrew-knowledge-bizs-dispatch Stage 1b
- "Generate feature inventory for platform"
- "Create features.json from entry-dirs"

## AgentFlow Definition
<!-- @agentflow: SKILL.xml -->
> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
