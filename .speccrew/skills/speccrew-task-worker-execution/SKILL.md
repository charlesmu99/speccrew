---
name: speccrew-task-worker-execution
description: Task Worker 的通用任务执行技能，负责接收任务参数、加载 Skill 定义、读取 AgentFlow 规范、逐 Block 执行工作流并输出结构化完成报告。
tools: Read, Grep, Glob, Write, Bash, Edit, WebFetch, WebSearch
---

# Trigger Scenarios

- Orchestration Agent dispatches a task via dispatch-to-worker action
- Task Worker Agent receives skill_path or skill_name to execute
- User explicitly requests execution of a specific skill workflow

## AgentFlow Definition

<!-- @agentflow: SKILL.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
