---
name: speccrew-fd-feature-design
description: Unified Feature Analysis & Design SOP. Performs complete feature analysis (read PRD, load system knowledge, function breakdown with [NEW]/[MODIFIED]/[EXISTING] markers) followed by detailed design (frontend/backend/data) and generates complete Feature Spec document using template-first workflow. Combines analysis and design in a single unified workflow without producing intermediate analysis artifacts. Use when Feature Designer needs to analyze PRD requirements and produce Feature Spec in one pass.
tools: Read, Write, Glob, Grep, search_replace
---

# Trigger Scenarios
- PRD has been confirmed, user requests to start feature analysis and design
- Feature Designer Agent needs to analyze PRD and produce Feature Spec in one pass
- User asks "Design this feature" or "Analyze and design this requirement"

## AgentFlow Definition
<!-- @agentflow: SKILL.xml -->
> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
