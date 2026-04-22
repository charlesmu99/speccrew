---
name: speccrew-system-deployer-orchestration
description: System Deployer 的编排调度技能，负责执行部署工作流：阶段门禁验证、IDE目录检测、准备阶段、技能调度（构建→迁移→启动→冒烟测试）、部署总结确认。
tools: Read, Write, Glob, Grep, Bash
---

# Trigger Scenarios

- System Deployer Agent starts deployment workflow after development confirmation
- Development stage confirmed and build-migrate-startup-smoke pipeline needs execution
- User requests application deployment or build verification

## AgentFlow Definition

<!-- @agentflow: SKILL.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
