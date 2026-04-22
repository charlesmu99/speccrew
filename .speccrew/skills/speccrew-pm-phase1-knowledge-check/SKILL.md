---
name: speccrew-pm-phase1-knowledge-check
description: SpecCrew PM Phase 1 Knowledge Base Availability Check Skill. Detects knowledge base status and initializes business knowledge as needed. Supports three-path routing with Path B deep initialization sequence.
tools: Read, Write, Glob, Grep, Bash
---

# Trigger Scenarios
- PM Agent starts new requirement processing
- Knowledge base status unknown
- Module matching and deep initialization required

## AgentFlow Definition
<!-- @agentflow: SKILL.xml -->
> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
