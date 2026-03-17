---
name: devcrew-knowledge-dispatch
description: Dispatch knowledge base initialization and synchronization tasks to appropriate Agents. Used by Leader Agent to orchestrate Solution Agent and Designer Agents for bizs and architecture knowledge management.
tools: Read, Write, Skill
---

# Knowledge Base Dispatch

Orchestrate knowledge base operations by dispatching tasks to Solution Agent and Designer Agents.

## Trigger Scenarios

- "Initialize knowledge base"
- "Sync knowledge base"
- "Dispatch knowledge tasks"

## User

Leader Agent

## Prerequisites

Project diagnosis report must exist at `devcrew-workspace/diagnosis-reports/`

## Input

- `mode`: "init" or "sync"

## Workflow

### Step 1: Read Diagnosis Report

Read latest diagnosis report to extract:
- Technology stack (Section 2)
- Project type
- Available platforms: frontend, backend, mobile, desktop

### Step 2: Determine Target Agents

Based on diagnosis report:

| Platform | Agent to Invoke | Skill to Use |
|----------|-----------------|--------------|
| N/A | Solution Agent | devcrew-knowledge-bizs-{{mode}} |
| frontend | Frontend Designer Agent | devcrew-knowledge-arch-{{mode}} |
| backend | Backend Designer Agent | devcrew-knowledge-arch-{{mode}} |
| mobile | Mobile Designer Agent | devcrew-knowledge-arch-{{mode}} |
| desktop | Desktop Designer Agent | devcrew-knowledge-arch-{{mode}} |

### Step 3: Dispatch Tasks

**Task A: bizs Knowledge**

Invoke Solution Agent with instruction:
```
Execute devcrew-knowledge-bizs-{{mode}}
Input: none
Output: knowledge/bizs/INDEX.md or sync report
```

**Task B: Architecture Knowledge (Parallel)**

For each platform detected in diagnosis report:

Invoke corresponding Designer Agent with instruction:
```
Execute devcrew-knowledge-arch-{{mode}}
Input: platform="{{platform}}"
Output: knowledge/architecture/{{platform}}/INDEX.md or sync report
```

### Step 4: Collect Results

Wait for all dispatched Agents to complete:
- Solution Agent result
- Each Designer Agent result

### Step 5: Generate Summary Report

```
Knowledge base {{mode}} completed:

bizs:
- Status: [success/failed]
- Output: [path or error message]

Architecture:
{{#each platforms}}
- {{platform}}:
  - Status: [success/failed]
  - Agent: [agent name]
  - Output: [path or error message]
{{/each}}

Next steps:
- Review generated indexes in knowledge/
- [If init] Start using PM Agent for requirements
- [If sync] Apply recommended updates
```

## Checklist

- [ ] Diagnosis report read
- [ ] Target Agents determined
- [ ] Solution Agent dispatched for bizs
- [ ] Designer Agents dispatched for each platform
- [ ] All results collected
- [ ] Summary report generated
