---
name: speccrew-sd-design-overview-generate
description: Design Overview Generation Skill for System Designer. Reads Feature Registry, techs-manifest platforms, and framework evaluation results to generate a comprehensive DESIGN-OVERVIEW.md with Feature×Platform matrix index. Invoked by System Designer Agent during Phase 4 via worker dispatch.
tools: Read, Write, Glob, Grep
---

# Trigger Scenarios

- System Designer Agent dispatches this skill during Phase 4 to generate DESIGN-OVERVIEW.md
- User requests a design overview document for the current iteration
- Need to establish a Feature×Platform matrix index before per-platform system design begins

## AgentFlow Definition

<!-- @agentflow: SKILL.xml -->

> **REQUIRED**: Read and execute the XML workflow above. The XML contains the complete workflow definition including all steps, rules, conditions, and checklist.
