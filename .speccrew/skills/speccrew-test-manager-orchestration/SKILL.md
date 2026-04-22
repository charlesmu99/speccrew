---
name: speccrew-test-manager-orchestration
description: Test Manager 的编排调度技能，负责执行三阶段测试工作流：测试用例设计 → 测试代码生成 → 测试执行与报告。支持单平台直接调用和多平台 Worker 并行调度。
tools: Read, Write, Glob, Grep, Bash, Agent
---

# Trigger Scenarios

- Test Manager Agent starts the three-phase testing workflow after development confirmation
- Development stage confirmed and test case design needs to begin
- User requests test execution or test report generation

## AgentFlow Definition

<!-- @agentflow: SKILL.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
