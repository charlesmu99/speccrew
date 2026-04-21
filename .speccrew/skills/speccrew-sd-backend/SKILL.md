---
name: speccrew-sd-backend
description: Backend System Design SOP. Guide System Designer Agent to generate platform-specific backend detailed design documents by filling technology implementation details into the Feature Spec skeleton. Reads techs knowledge to determine actual framework syntax, ORM patterns, and conventions.
tools: Read, Write, Glob, Grep
---

# Trigger Scenarios

- System Designer Agent dispatches this skill with platform context (platform_id, techs paths, Feature Spec paths)
- Feature Spec has been confirmed, user requests backend system design
- User asks "Create backend design for this platform" or "Generate backend module design"

## AgentFlow Definition

<!-- @agentflow: SKILL.xml -->

> **REQUIRED**: Read and execute the XML workflow above. The XML contains the complete workflow definition including all steps, rules, conditions, and checklist.
