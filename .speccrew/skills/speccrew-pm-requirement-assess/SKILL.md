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

## AgentFlow Definition

<!-- @agentflow: workflow.agentflow.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `speccrew-workspace/docs/rules/agentflow-spec.md`

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

