---
name: speccrew-fd-feature-analyze
description: Feature Analysis SOP. Reads PRD documents and system knowledge to produce function decomposition with system relationship markers. Outputs .feature-analysis.md as interface contract for downstream design skills. Use when Feature Designer needs to analyze and decompose PRD requirements before design phase.
tools: Read, Write, Glob, Grep
---

# Trigger Scenarios
- PRD has been confirmed, user requests to start feature analysis
- Feature Designer Agent needs to decompose PRD into functions before design
- User asks "Analyze this feature" or "Break down this requirement"

## AgentFlow Definition
<!-- @agentflow: SKILL.xml -->
> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
