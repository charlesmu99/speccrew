---
name: speccrew-pm-module-initializer
description: Generate analyze task plan for a single business module. Reads features-*.json, filters matched module's pending features, and outputs a task plan JSON. Used by Worker Agent, invoked by PM Agent for on-demand module task planning.
tools: Read, Write, Skill, Bash
---

# Trigger Scenarios
- "Generate task plan for module {name}"
- "Plan module {name} initialization"
- "List pending features for module {name}"

## AgentFlow Definition
<!-- @agentflow: SKILL.xml -->
> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
