---
name: speccrew-pm-requirement-simple
description: SpecCrew PM Simple Requirement Skill. Handles lightweight requirements with a streamlined PRD generation process. Produces a single concise PRD document without Master-Sub structure.
tools: Read, Write, Glob, Grep, Terminal
---

# Trigger Scenarios
- User requests a small change (add field, modify behavior, fix workflow)
- Requirement scope is within 1-2 modules
- Estimated 1-5 Features

## AgentFlow Definition
<!-- @agentflow: SKILL.xml -->
> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
