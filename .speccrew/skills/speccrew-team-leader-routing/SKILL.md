---
name: speccrew-team-leader-routing
description: Team Leader 的意图识别与路由调度技能，负责识别用户意图并路由到对应 Skill/Agent。处理项目初始化、知识库同步、工作流诊断等基础设施请求。
tools: Read, Write, Bash, Skill, Task
---

# Trigger Scenarios

- Team Leader Agent needs to route user intent to the correct Skill or Agent
- User submits a message requiring intent recognition and dispatch
- Auto-orchestration or new user onboarding request

## AgentFlow Definition

<!-- @agentflow: SKILL.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
