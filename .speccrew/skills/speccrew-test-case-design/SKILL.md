---
name: speccrew-test-case-design
description: Designs structured test cases from Feature Spec and API Contract documents. Focuses on comprehensive test scenario analysis, test case matrix generation, and coverage traceability without involving any code implementation.
tools: Read, Write, Glob, Grep
---

# Trigger Scenarios

- When speccrew-test-manager dispatches test case design for a specific platform/feature
- When user explicitly requests test case design from feature specification
- When user asks "Design test cases for this feature" or "Create test case matrix"

## AgentFlow Definition

<!-- @agentflow: SKILL.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
