---
name: devcrew-knowledge-system-summarize
description: Generate complete SYSTEM-OVERVIEW.md by reading all MODULE-OVERVIEW.md files. Aggregates module information, builds dependency graph, and creates system-level documentation.
tools: Read, Write, Glob
---

# System Summarize - Complete System Overview

Read all MODULE-OVERVIEW.md files, aggregate information to generate complete SYSTEM-OVERVIEW.md with module index, topology, and business flows.

## Trigger Scenarios

- "Generate system overview from modules"
- "Complete system documentation"
- "Summarize all modules into system view"

## User

Worker Agent (devcrew-task-worker)

## Input

- `modules_path`: Path to modules directory containing all MODULE-*/MODULE-*-OVERVIEW.md files
- `output_path`: Output path for SYSTEM-OVERVIEW.md

## Output

- `{output_path}/SYSTEM-OVERVIEW.md` - Complete system overview

## Workflow

### Step 1: Discover All Modules

Find all `{modules_path}/MODULE-*/MODULE-*-OVERVIEW.md` files.

Extract module list:
```
MODULE-ORDER/
  └── MODULE-ORDER-OVERVIEW.md
MODULE-PAYMENT/
  └── MODULE-PAYMENT-OVERVIEW.md
MODULE-INVENTORY/
  └── MODULE-INVENTORY-OVERVIEW.md
```

### Step 2: Read All Module Overviews

Read each MODULE-OVERVIEW.md and extract:
- Module name and purpose
- Business domain
- Entity list
- Dependencies (internal and external)
- Feature count
- API count

### Step 3: Build Module Index

Create module index table:

| Module | Domain | Purpose | Entities | APIs | Detail Doc |
|--------|--------|---------|----------|------|------------|
| ORDER | Sales | Order lifecycle | Order, OrderItem | 8 | [View](MODULE-ORDER/MODULE-ORDER-OVERVIEW.md) |
| PAYMENT | Finance | Payment processing | Payment, Refund | 5 | [View](MODULE-PAYMENT/MODULE-PAYMENT-OVERVIEW.md) |

### Step 4: Build Dependency Graph

Aggregate dependencies from all modules:

```
ORDER depends on: USER, INVENTORY, PAYMENT
PAYMENT depends on: ORDER, THIRD-PAYMENT-API
INVENTORY depends on: PRODUCT
```

Generate Mermaid dependency diagram.

### Step 5: Identify Business Domains

Group modules by business domain:

| Domain | Modules | Description |
|--------|---------|-------------|
| Sales | ORDER, PROMOTION | Sales-related modules |
| Finance | PAYMENT, INVOICE | Financial modules |
| Logistics | INVENTORY, SHIPPING | Logistics modules |

### Step 6: Identify End-to-End Flows

Analyze cross-module dependencies to identify business flows:

**Order-to-Payment Flow:**
```
USER → ORDER → INVENTORY → PAYMENT → NOTIFICATION
```

**Refund Flow:**
```
ORDER → PAYMENT → INVENTORY → NOTIFICATION
```

Create flow-module mapping matrix:

| Flow / Module | ORDER | INVENTORY | PAYMENT | NOTIFICATION |
|---------------|-------|-----------|---------|--------------|
| Order-Payment | ✅ | ✅ | ✅ | ✅ |
| Refund | ✅ | ✅ | ✅ | ✅ |

### Step 7: Generate SYSTEM-OVERVIEW.md

Use SYSTEM-OVERVIEW-TEMPLATE.md, fill all sections:

**Section: Index and Overview** (NEW)
- Generation timestamp
- Technology stack (from project config)
- Statistics: module count, entity count, API count, flow count
- Module quick index table

**Section 1: System Overview**
- System name from project config
- Core positioning
- Target users
- Deployment type

**Section 2: Module Topology**
- Business domain diagram
- Module hierarchy diagram
- Module dependency diagram
- Module index table (from Step 3)

**Section 3: End-to-End Business Flows**
- Core business process list
- Flow-module mapping matrix (from Step 6)
- Typical flow diagrams

**Section 4: System Boundaries and Integration**
- External system integration diagram
- Integration interface list

**Section 5: Requirement Assessment Guide**
- Reference to `devcrew-pm-requirement-assess` skill
- Quick location guide (which section to reference)

### Step 8: Report Results

```
System summarization completed:
- Modules Processed: {N}
- Entities Aggregated: {N}
- APIs Counted: {N}
- Dependencies Mapped: {N}
- Business Flows Identified: {N}
- Output: SYSTEM-OVERVIEW.md (complete)
- Status: success
```

## Checklist

- [ ] All MODULE-OVERVIEW.md files discovered
- [ ] Module information extracted
- [ ] Module index table created
- [ ] Dependency graph built
- [ ] Business domains identified
- [ ] End-to-end flows mapped
- [ ] SYSTEM-OVERVIEW.md generated with all sections
- [ ] Results reported
