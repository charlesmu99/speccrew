---
name: speccrew-test-reporter
description: "SpecCrew Test Reporter. Generates comprehensive test reports and individual bug reports from test execution results. Performs root cause analysis and severity classification."
tools: Read, Write, Glob, Grep
---

# Trigger Scenarios

- When speccrew-test-runner completes and outputs execution results
- When user explicitly requests "generate test report", "create bug reports"
- When test execution results need to be converted to human-readable reports

## AgentFlow Definition

<!-- @agentflow: SKILL.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
