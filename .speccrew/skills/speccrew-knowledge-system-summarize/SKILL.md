---
name: SpecCrew-knowledge-system-summarize
description: Generate complete system-overview.md by reading all {name}-overview.md files. Aggregates module information, builds dependency graph, and creates system-level documentation. In incremental mode, this skill always regenerates the system overview from the latest module overviews.
tools: Read, Write, Glob
---

# System Summarize - Complete System Overview

Read all {name}-overview.md files, aggregate information to generate complete system-overview.md with module index, topology, and business flows.

## Language Adaptation

**CRITICAL**: Generate all content in the language specified by the `language` parameter.

- `language: "zh"` → Generate all content in 中文
- `language: "en"` → Generate all content in English
- Other languages → Use the specified language

**All output content (system description, module summaries, flow descriptions) must be in the target language only.**

## Trigger Scenarios

- "Generate system overview from modules"
- "Complete system documentation"
- "Summarize all modules into system view"

## User

Worker Agent (SpecCrew-task-worker)

## Input

- `modules_path`: Path to modules directory containing all {name}/{name}-overview.md files
- `output_path`: Output path for system-overview.md
- `language`: Target language for generated content (e.g., "zh", "en") - **REQUIRED**

## Output

- `{output_path}/system-overview.md` - Complete system overview

## Workflow

### Step 1: Discover All Modules

Find all `{modules_path}/{name}/{name}-overview.md` files.

Extract module list:
```
order/
  └── order-overview.md
payment/
  └── payment-overview.md
inventory/
  └── inventory-overview.md
```

### Step 2: Read All Module Overviews

Read each {name}-overview.md and extract:
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
| order | Sales | Order lifecycle | Order, OrderItem | 8 | [View](order/order-overview.md) |
| payment | Finance | Payment processing | Payment, Refund | 5 | [View](payment/payment-overview.md) |

### Step 4: Build Dependency Graph

Aggregate dependencies from all modules:

```
ORDER depends on: USER, INVENTORY, PAYMENT
PAYMENT depends on: ORDER, THIRD-PAYMENT-API
INVENTORY depends on: PRODUCT
```

Generate Mermaid dependency diagram.

**Mermaid Diagram Requirements**

When generating Mermaid diagrams, you **MUST** follow the compatibility guidelines defined in:
- **Reference**: `SpecCrew-workspace/docs/rules/mermaid-rule.md`

Key requirements:
- Use only basic node definitions: `A[text content]`
- No HTML tags (e.g., `<br/>`)
- No nested subgraphs
- No `direction` keyword
- No `style` definitions
- Use standard `graph TB/LR` syntax only

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
| Order-Payment | ✓ | ✓ | ✓ | ✓ |
| Refund | ✓ | ✓ | ✓ | ✓ |

### Step 7: Generate system-overview.md

Use template `SpecCrew-knowledge-system-summarize/templates/system-overview-template.md`, fill all sections:

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
- Reference to `SpecCrew-pm-requirement-assess` skill
- Quick location guide (which section to reference)

### Step 8: Report Results

```
System summarization completed:
- Modules Processed: {N}
- Entities Aggregated: {N}
- APIs Counted: {N}
- Dependencies Mapped: {N}
- Business Flows Identified: {N}
- Output: system-overview.md (complete)
- Status: success
```

## Checklist

- [ ] All {name}-overview.md files discovered
- [ ] Module information extracted
- [ ] Module index table created
- [ ] Dependency graph built
- [ ] Business domains identified
- [ ] End-to-end flows mapped
- [ ] system-overview.md generated with all sections
- [ ] Results reported

