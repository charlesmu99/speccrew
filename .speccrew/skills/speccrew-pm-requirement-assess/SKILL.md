---
name: speccrew-pm-requirement-assess
description: Assess new requirements by analyzing impact scope, affected modules, and change type based on existing system documentation. Use when PM Agent needs to evaluate new requirements, determine impact range, or plan implementation approach.
tools: Read, SearchCodebase
---

# Requirement Assessment for Product Manager

Guide PM Agent to quickly assess new requirements using system documentation and module knowledge.

## Trigger Scenarios

- "Assess impact scope of new requirement"
- "Analyze which modules are affected by requirement"
- "Determine if requirement is new or modification"
- "Quick requirement assessment"
- "New requirement impact analysis"
- "Requirement change type determination"

## User

PM Agent (speccrew-product-manager)

## Input

- New requirement description
- system-overview.md (system documentation)
- Related {name}-overview.md files (if specific modules identified)

## Output

- Requirement assessment report with:
  - Impact scope (modules affected)
  - Change type (New/Modify/Mixed/Cross-module/Config)
  - Risk level
  - Implementation approach suggestion

## Assessment Workflow

### Step 1: Understand the Requirement

Analyze the new requirement:
- What business problem does it solve?
- What entities are involved?
- What processes are affected?

### Step 2: Locate in System Context

Refer to system-overview.md:
- Section 1.2: Identify which business domain
- Section 2.3: Find related modules
- Section 3.2: Check process-module mapping matrix

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
- **Dependency modules**: Upstream/downstream dependencies (Section 2.2)
- **External integrations**: Third-party systems (Section 4.2)
- **Data entities**: New or modified entities

### Step 5: Assess Risk Level

| Risk Factor | High Risk Indicators |
|-------------|---------------------|
| Scope | Affects 3+ modules |
| Data | Modifies core entity structure |
| Integration | Changes external API contracts |
| Process | Alters critical business flow |
| State | Modifies entity state machine |

### Step 6: Generate Assessment Report

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
| Module | Impact Type | Details |
|--------|-------------|---------|
| {Module A} | Direct | New API needed |
| {Module B} | Indirect | Data structure change |

### Risk Level
[ ] Low  [ ] Medium  [ ] High

**Risk Factors**:
- [List specific risks]

### Implementation Approach
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Related Documentation
- [Links to relevant module docs]
```

## Quick Reference

### Module Location Checklist

- [ ] Which business domain? (system-overview.md Section 1.2)
- [ ] Which modules in that domain? (Section 2.3)
- [ ] What processes are involved? (Section 3.1)
- [ ] Which modules does the process touch? (Section 3.2 matrix)
- [ ] Any external dependencies? (Section 4.2)

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
- [ ] Business domain identified
- [ ] Related modules located
- [ ] Change type determined
- [ ] Impact scope mapped (direct + indirect)
- [ ] Risk level assessed
- [ ] Implementation approach outlined
- [ ] Assessment report generated

