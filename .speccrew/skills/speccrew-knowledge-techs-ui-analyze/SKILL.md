---
name: speccrew-knowledge-techs-ui-analyze
description: Analyze existing frontend UI codebase to extract and summarize page styles, layout patterns, component usage, and design conventions. Generates comprehensive UI style guides for each platform (PC, Mobile, etc.) including page type classifications, component libraries, layout patterns, and styling conventions. Used to ensure new pages maintain consistency with existing system design.
tools: Read, Write, Glob, Grep
---

# Trigger Scenarios
- "Analyze UI styles from existing codebase"
- "Extract page layout patterns from {platform}"
- "Summarize component usage in {project}"

## AgentFlow Definition
<!-- @agentflow: SKILL.xml -->
> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
