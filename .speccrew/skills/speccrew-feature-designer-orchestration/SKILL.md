---
name: speccrew-feature-designer-orchestration
description: Feature Designer 的核心编排技能，负责加载功能清单、协调功能分析、功能规格设计与 API 契约生成。处理单个功能（直接调用）和多个功能（Worker 分发）两种工作流路径。
tools: Read, Write, Glob, Grep, Bash, Agent
---

# Trigger Scenarios

- Feature Designer Agent starts feature design workflow after PRD confirmation
- PRD stage confirmed and feature list needs to be loaded
- User requests feature specification design or API contract generation

## AgentFlow Definition

<!-- @agentflow: SKILL.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
