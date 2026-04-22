---
name: speccrew-test-code-gen
description: Generates executable test code from confirmed test case documents. Reads test case matrix, platform technical conventions, and system design to produce well-structured test files with full traceability to test case IDs.
tools: Read, Write, Glob, Grep
---

# Trigger Scenarios

- When speccrew-test-manager dispatches test code generation after test cases are confirmed
- When user explicitly requests test code generation from confirmed test cases
- When user asks "Generate test code", "Create test files from test cases"

## AgentFlow Definition

<!-- @agentflow: SKILL.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
