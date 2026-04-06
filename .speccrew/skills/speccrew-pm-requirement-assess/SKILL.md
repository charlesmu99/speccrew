---
name: speccrew-pm-requirement-assess
description: Quick impact assessment for new requirements. Analyzes affected modules, change type, risk level, and cross-module dependencies using system documentation and knowledge graph. Use when PM Agent needs a lightweight evaluation before deciding whether to run full requirement-analysis workflow.
tools: Read, Glob, Grep
---

# Requirement Assessment for Product Manager

Guide PM Agent to quickly assess new requirements using system documentation, module knowledge, and knowledge graph.

## Trigger Scenarios

- "Assess impact scope of new requirement"
- "Analyze which modules are affected by requirement"
- "Determine if requirement is new or modification"
- "Quick requirement assessment"
- "New requirement impact analysis"
- "How big is this requirement?"

## User

PM Agent (speccrew-product-manager)

## Input

- New requirement description
- system-overview.md (system documentation)
- Related {name}-overview.md files (if specific modules identified)
- Knowledge graph (for cross-module dependency analysis)

## Output

- Requirement assessment report with:
  - Impact scope (modules affected, direct + indirect)
  - Change type (New/Modify/Mixed/Cross-module/Config)
  - Risk level with specific factors
  - Recommended workflow path (simple PRD vs full ISA-95 modeling)

## Assessment Workflow

### Step 1: Understand the Requirement

Analyze the new requirement:
- What business problem does it solve?
- What entities are involved?
- What processes are affected?

### Step 2: Load System Context

#### 2.1 Read System Overview

```
speccrew-workspace/knowledges/bizs/system-overview.md
```

Identify:
- Which business domain the requirement belongs to
- Which modules are potentially related
- Which business processes are involved

#### 2.2 Load Related Module Overviews

For each potentially affected module:
```
speccrew-workspace/knowledges/bizs/{module-name}/{module-name}-overview.md
```

#### 2.3 Query Knowledge Graph (for cross-module analysis)

Use `speccrew-knowledge-graph-query` skill to trace dependencies:

| Action | Use Case |
|--------|----------|
| `search` | Find entities related to requirement keywords |
| `trace-upstream` | What depends on the affected entities? |
| `trace-downstream` | What do the affected entities depend on? |
| `query-nodes` | List all entities in a suspected module |

### Step 3: Determine Change Type

Use decision tree:

```
New Requirement
    |
    +-- Involves new business entity?
    |      +-- NEW FEATURE
    |
    +-- Modifies core attributes of existing entity?
    |      +-- MODIFICATION
    |
    +-- Adds new process steps but reuses existing entities?
    |      +-- MIXED (New + Modify)
    |
    +-- Affects cross-module data flow?
    |      +-- CROSS-MODULE CHANGE
    |
    +-- Can be handled by configuration?
           +-- CONFIGURATION
```

### Step 4: Identify Impact Scope

Check for impact on:
- **Direct modules**: Modules explicitly mentioned in requirement
- **Dependency modules**: Upstream/downstream from graph query (Step 2.3)
- **External integrations**: Third-party systems
- **Data entities**: New or modified entities

### Step 5: Assess Risk Level

| Risk Factor | High Risk Indicators |
|-------------|---------------------|
| Scope | Affects 3+ modules |
| Data | Modifies core entity structure |
| Integration | Changes external API contracts |
| Process | Alters critical business flow |
| State | Modifies entity state machine |

### Step 6: Recommend Workflow Path

Based on assessment results, recommend the appropriate next step:

| Assessment Result | Recommended Path |
|-------------------|-----------------|
| 1 module, low risk, clear domain | Simple PRD (skip ISA-95 modeling) |
| 2+ modules, medium risk | Full requirement-analysis with ISA-95 modeling |
| Cross-module, high risk | Full requirement-analysis with ISA-95 modeling + Master-Sub PRD |
| Configuration only | Direct implementation, PRD optional |

### Step 7: Generate Assessment Report

## Assessment Report Template

```markdown
# Requirement Assessment Report

## Requirement Summary
- **Description**: [Brief description]
- **Source**: [Who requested / Which scenario]

## Assessment Result

### Change Type
[ ] New Feature  [ ] Modification  [ ] Mixed  [ ] Cross-module  [ ] Configuration

### Impact Scope
| Module | Impact Type | Evidence |
|--------|-------------|----------|
| {Module A} | Direct | [from system-overview / graph query] |
| {Module B} | Indirect | [upstream dependency via graph] |

### Risk Level
[ ] Low  [ ] Medium  [ ] High

**Risk Factors**:
- [List specific risks with evidence]

### Recommended Workflow
- [ ] Simple PRD (speccrew-pm-requirement-analysis, simple path)
- [ ] Full ISA-95 Modeling + PRD (speccrew-pm-requirement-analysis, complex path)
- [ ] Full ISA-95 Modeling + Master-Sub PRD (complex path, multi-module)
- [ ] Configuration change only

### Key Findings from Graph Analysis
- [Cross-module dependencies discovered]
- [Upstream/downstream impacts identified]

### Related Documentation
- [Links to relevant module docs and graph nodes]
```

## Quick Reference

### Change Type Quick Guide

| Scenario | Change Type | Example |
|----------|-------------|---------|
| New entity + new process | New Feature | Add "Refund" entity and refund process |
| Existing entity, new attribute | Modification | Add "priority" field to Order |
| Existing entity, new process step | Mixed | Add "approval" step to existing order flow |
| Changes module interface | Cross-module | Order module needs new API from Inventory |
| Toggle/feature flag | Configuration | Enable/disable feature per tenant |

## Checklist

- [ ] Requirement understood and categorized
- [ ] System overview and related module overviews loaded
- [ ] Knowledge graph queried for cross-module dependencies
- [ ] Change type determined
- [ ] Impact scope mapped (direct + indirect with graph evidence)
- [ ] Risk level assessed with specific factors
- [ ] Workflow path recommended
- [ ] Assessment report generated

