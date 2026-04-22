---
name: speccrew-pm-requirement-analysis
description: SpecCrew PM PRD Generation Skill. Generates PRD documents from clarified requirements and module design. Produces Master PRD and Sub-PRD Dispatch Plan for downstream Feature Design.
tools: Read, Write, Glob, Grep
---

# Trigger Scenarios
- Modeling completed (.module-design.md exists)
- PRD document generation needed
- Feature breakdown and dispatch planning required

## AgentFlow Definition
<!-- @agentflow: SKILL.xml -->
> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
