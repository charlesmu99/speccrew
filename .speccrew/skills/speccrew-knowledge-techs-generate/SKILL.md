---
name: speccrew-knowledge-techs-generate
description: Stage 2 of technology knowledge initialization - Generate technology documentation for a specific platform using XML workflow blocks. Extracts tech stack, architecture, and conventions from configuration files and source code. Creates INDEX.md, tech-stack.md, architecture.md, and conventions-*.md files. Used by Worker Agent in parallel for each detected platform.
tools: Read, Write, Glob, Grep, Skill
---

# Trigger Scenarios
- "Generate tech docs for {platform}"
- "Create technology documentation"
- "Extract tech stack and conventions"

## AgentFlow Definition
<!-- @agentflow: SKILL.xml -->
> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
