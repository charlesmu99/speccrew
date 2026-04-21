---
name: speccrew-system-designer-orchestration
description: System Designer orchestration skill. Manages the complete system design workflow from stage gate checking through platform dispatch to joint confirmation. Coordinates framework evaluation, design overview generation, and parallel platform-specific design tasks across web, mobile, desktop platforms.
tools: Read, Write, Glob, Grep, Bash, Agent
---

# Trigger Scenarios

- System Designer Agent starts system design workflow
- Feature Spec and API Contract have been confirmed (02_feature_design stage = confirmed)
- User requests system design execution for confirmed features

## AgentFlow Definition

<!-- @agentflow: SKILL.xml -->

> **REQUIRED**: Read and execute the XML workflow above. The XML contains the complete workflow definition including all phases (Stage Gate → Preparation → Resource Verification → Framework Evaluation → Design Overview → Platform Dispatch → Joint Confirmation), rules, conditions, and checklist.
