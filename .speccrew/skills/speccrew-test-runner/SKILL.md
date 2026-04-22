---
name: speccrew-test-runner
description: "SpecCrew Test Runner. Executes test code, parses results, and detects deviations between expected and actual outcomes. Reads test code files and system design to run platform-specific test suites."
tools: Read, Write, Bash, Glob, Grep
---

# Trigger Scenarios

- When speccrew-test-manager dispatches test execution after test code is confirmed
- When user explicitly requests "run tests", "execute tests", "run test suite"
- When speccrew-test-reporter needs raw execution results to generate reports

## AgentFlow Definition

<!-- @agentflow: SKILL.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
