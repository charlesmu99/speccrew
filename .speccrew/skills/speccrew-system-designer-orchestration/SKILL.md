---
name: speccrew-system-designer-orchestration
description: System Designer orchestration skill. Manages the complete system design workflow from stage gate checking through platform dispatch to joint confirmation. Coordinates framework evaluation, design overview generation, and parallel platform-specific design tasks across web, mobile, desktop platforms.
tools: Read, Write, Glob, Grep, Bash, Agent
---

# Trigger Scenarios

- System Designer Agent starts system design workflow
- Feature Spec and API Contract have been confirmed (02_feature_design stage = confirmed)
- User requests system design execution for confirmed features

## EXECUTION PROTOCOL

### Action-to-Tool Mapping

| XML Block Action | IDE Tool | How to Execute |
|---|---|---|
| `action="run-script"` | **Terminal tool** | Execute command in terminal |
| `action="dispatch-to-worker"` | **Agent tool** | Create new `speccrew-task-worker` agent session (NOT Skill tool) |
| `action="read-file"` | **Read tool** | Read file at specified path |
| `action="log"` | **Output** | Log message directly to conversation |
| `action="confirm"` | **Output + Wait** | Present message and wait for user response |

### Worker Dispatch Protocol

When executing any block with `action="dispatch-to-worker"`:

1. **Use Agent tool** to create a new `speccrew-task-worker` agent
2. Pass `skill_path` from the XML `<field name="skill_path">` to worker
3. Pass all context parameters from XML `<field name="context">` block
4. **Wait** for worker agent to complete before proceeding to next block
5. Verify worker's output file exists at expected path

**CRITICAL DISTINCTION**:
- **Agent tool** = creates a NEW autonomous worker session (for dispatch-to-worker)
- **Skill tool** = executes skill inline in current session (for run-skill)
- Using the WRONG tool will cause dispatch failure

### Phase 5 Batch Dispatch

- Dispatch ONE worker per Feature×Platform combination via Agent tool
- Max concurrent workers per batch: defined in XML
- Pass `skip_confirmation: true` and `skip_index_generation: true` in batch context
- Wait for all workers in current batch to complete before dispatching next batch

## AgentFlow Definition

<!-- @agentflow: SKILL.xml -->

> **REQUIRED**: Read and execute the XML workflow above. The XML contains the complete workflow definition including all phases (Stage Gate → Preparation → Resource Verification → Framework Evaluation → Design Overview → Platform Dispatch → Joint Confirmation), rules, conditions, and checklist.
