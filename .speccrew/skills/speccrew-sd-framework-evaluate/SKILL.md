---
name: speccrew-sd-framework-evaluate
description: Framework Evaluation Skill for System Designer. Analyzes Feature Spec requirements against current technology stack capabilities, identifies capability gaps, evaluates potential open-source frameworks/libraries, and generates a framework-evaluation.md report. Invoked by System Designer Agent during Phase 3.
tools: Read, Write, Glob, Grep
---

# Trigger Scenarios

- System Designer Agent dispatches this skill with Feature Spec paths and techs knowledge paths
- User requests framework evaluation for current iteration
- Need to assess technology stack gaps before system design

## AgentFlow Definition

<!-- @agentflow: SKILL.xml -->

> **REQUIRED**: Read and execute the XML workflow above. The XML contains the complete workflow definition including all steps, rules, conditions, and checklist.
