---
name: speccrew-sd-mobile
description: Mobile System Design SOP. Guide System Designer Agent to generate platform-specific mobile detailed design documents by filling technology implementation details into the Feature Spec skeleton. Reads techs knowledge to determine actual framework syntax (Flutter/React Native) and conventions.
tools: Read, Write, Glob, Grep
---

# Trigger Scenarios

- System Designer Agent dispatches this skill with platform context (platform_id, techs paths, Feature Spec paths)
- Feature Spec has been confirmed, user requests mobile system design
- User asks "Create mobile design for this platform" or "Generate mobile module design"

## AgentFlow Definition

<!-- @agentflow: workflow.agentflow.xml -->

> **REQUIRED**: Read and execute the XML workflow above. The XML contains the complete workflow definition including all steps, rules, conditions, and checklist.
