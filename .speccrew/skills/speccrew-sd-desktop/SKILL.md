---
name: speccrew-sd-desktop
description: Desktop System Design SOP. Guide System Designer Agent to generate platform-specific desktop detailed design documents by filling technology implementation details into the Feature Spec skeleton. Reads techs knowledge to determine actual framework syntax (Electron/Tauri/Qt) and conventions.
tools: Read, Write, Glob, Grep
---

# Trigger Scenarios

- System Designer Agent dispatches this skill with platform context (platform_id, techs paths, Feature Spec paths)
- Feature Spec has been confirmed, user requests desktop system design
- User asks "Create desktop design for this platform" or "Generate desktop module design"

## AgentFlow Definition

<!-- @agentflow: SKILL.xml -->

> **REQUIRED**: Read and execute the XML workflow above. The XML contains the complete workflow definition including all steps, rules, conditions, and checklist.
