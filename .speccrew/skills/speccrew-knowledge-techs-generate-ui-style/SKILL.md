---
name: speccrew-knowledge-techs-generate-ui-style
description: Generate UI style analysis documents for a specific frontend platform using XML workflow blocks. Analyzes page types, components, layouts, and styling conventions from source code. Only applicable to frontend platforms (web, mobile, desktop).
tools: Read, Write, Glob, Grep, Skill
---

# Trigger Scenarios
- "Generate UI style documents for {platform}"
- "Analyze UI components and layouts"
- "Extract design system from {platform}"

## AgentFlow Definition
<!-- @agentflow: SKILL.xml -->
> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
