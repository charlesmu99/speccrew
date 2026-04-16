---
name: speccrew-pm-phase2-complexity-assess
description: Complexity assessment and skill routing for PM Phase 2. Validates knowledge initialization completeness, evaluates requirement complexity across 5 dimensions, and routes to appropriate PRD workflow (simple vs full pipeline). Use after Phase 1 knowledge detection completes.
tools: Read, Grep
---

# Phase 2: Complexity Assessment & Skill Routing

Assess requirement complexity and determine the appropriate skill routing path for PRD generation.

## Trigger Scenarios

- "Assess requirement complexity"
- "Determine PRD workflow path"
- "Should I use simple or complex PRD workflow?"
- "Route to appropriate PRD skill"
- "Check if knowledge initialization is complete"

## User

PM Agent (speccrew-product-manager)

## Input

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_requirement | string | Yes | User requirement description or document path |
| workspace_path | string | Yes | Absolute path to speccrew-workspace root |
| knowledge_status | object | Yes | Knowledge status from Phase 1 (status, system_overview_path) |
| language | string | No | Target language for output (auto-detected) |

## Output

| Field | Type | Description |
|-------|------|-------------|
| complexity_level | string | simple / moderate / complex |
| route | string | speccrew-pm-requirement-simple or full-pipeline |
| complexity_details | object | Detailed breakdown of 5-dimension assessment |
| verification_status | string | Knowledge initialization verification result |

## AgentFlow Definition

<!-- @agentflow: workflow.agentflow.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `speccrew-workspace/docs/rules/agentflow-spec.md`

## Complexity Assessment Matrix

### 5-Dimension Evaluation

| Dimension | Simple | Moderate | Complex |
|-----------|--------|----------|---------|
| **Functional Scope** | 1-2 modules, 1-5 features | 2-3 modules, 5-10 features | 3+ modules, 6+ features |
| **Technical Complexity** | No new tech, 0-2 integrations | 1 new tech, 2-4 integrations | 2+ new techs, 5+ integrations |
| **Business Rules** | Simple conditions, no state machine | Moderate branching, basic state machine | Complex branching, full state machine |
| **Data Complexity** | 1-3 entities, simple relationships | 4-6 entities, moderate relationships | 7+ entities, complex relationships |
| **Team/Time Constraints** | Standard timeline, single team | Moderate constraints | Tight deadline, multiple teams |

### Decision Rules

**→ Simple** (ANY of these):
- Adding/modifying fields on an existing page
- Minor feature enhancement within 1-2 modules
- Business logic adjustment
- Bug fix documentation
- Scope: ≤ 5 features, ≤ 2 modules

**→ Moderate** (ANY of these):
- 2-3 modules involved
- 5-10 features expected
- Some cross-module dependencies
- Standard new feature development

**→ Complex** (ANY of these):
- New system or major subsystem development
- Involves 3+ modules
- Requires 6+ features
- Needs cross-module dependency management
- User explicitly requests comprehensive analysis

### Skill Routing

| Complexity | Route | Workflow |
|------------|-------|----------|
| simple | speccrew-pm-requirement-simple | Single PRD, streamlined 6-step flow |
| moderate | full-pipeline | clarify → model → analysis (Master-Sub PRD) |
| complex | full-pipeline | clarify → model → analysis (Master-Sub PRD) |

> **Default to Simple when in doubt**. It's easier to escalate from simple to complex than to simplify an over-engineered analysis.

## Checklist

- [ ] DISPATCH-PROGRESS.json exists and counts.pending == 0
- [ ] Knowledge initialization verified complete
- [ ] User requirement analyzed for module count
- [ ] Functional scope assessed (modules, features)
- [ ] Technical complexity evaluated (new tech, integrations)
- [ ] Business rules complexity determined (conditions, state machine)
- [ ] Data complexity assessed (entities, relationships)
- [ ] Team/time constraints considered
- [ ] Complexity level determined (simple/moderate/complex)
- [ ] Skill route selected and output

## Key Rules

1. **MANDATORY Verification**: Phase 2.0 knowledge initialization verification CANNOT be skipped
2. **Pending Tasks Block**: If `counts.pending > 0`, return to Phase 1 Path B - do NOT proceed
3. **Read-Only Assessment**: This skill performs assessment only, no file modifications
4. **Escalation Path**: Simple workflow can escalate to complex if scope expands during execution
5. **Single Gateway**: Use exclusive gateway for routing decision - only one path selected
