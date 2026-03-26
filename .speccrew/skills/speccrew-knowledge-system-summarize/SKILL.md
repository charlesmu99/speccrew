---
name: speccrew-knowledge-system-summarize
description: Generate complete system-overview.md by reading all {{module_name}}-overview.md files. Aggregates module information, builds dependency graph, and creates system-level documentation. In incremental mode, this skill always regenerates the system overview from the latest module overviews.
tools: Read, Write, Glob, Skill
---

# System Summarize - Complete System Overview

Read all {{module_name}}-overview.md files, aggregate information to generate complete system-overview.md with module index, topology, and business flows.

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

Worker Agent (speccrew-task-worker)

## Input

- `modules_path`: Path to modules directory (e.g., `speccrew-workspace/knowledges/bizs/`) containing all {{platform_type}}/{{module_name}}/{{module_name}}-overview.md files
- `output_path`: Output path for system-overview.md (e.g., `speccrew-workspace/knowledges/bizs/`)
- `language`: Target language for generated content (e.g., "zh", "en") - **REQUIRED**

## Output

- `{{output_path}}/system-overview.md` - Complete system overview

## Workflow

```mermaid
flowchart TD
    Start([Start]) --> Step0[Step 0: Read System Overview Template]
    Step0 --> Step1[Step 1: Discover All Modules]
    Step1 --> Step2[Step 2: Read All Module Overviews]
    Step2 --> Step3[Step 3: Build Module Index]
    Step3 --> Step4[Step 4: Build Dependency Graph]
    Step4 --> Step5[Step 5: Identify Business Domains]
    Step5 --> Step6[Step 6: Identify End-to-End Flows]
    Step6 --> Step7[Step 7: Generate system-overview.md]
    Step7 --> Step8[Step 8: Report Results]
    Step8 --> End([End])
```

### Step 0: Read System Overview Template

Before processing, read the template file to understand the required content structure:
- **Read**: `templates/SYSTEM-OVERVIEW-TEMPLATE.md`
- **Purpose**: Understand the template chapters and example content requirements for system overview documents
- **Key sections to follow**:
  - Index and Overview (Statistics Overview, Module Quick Index)
  - Section 1: System Overview (System Positioning, Business Domain Division with Mermaid diagram)
  - Section 2: Functional Module Topology (Module Hierarchy, Module Dependency Diagram, Module List Index)
  - Section 3: End-to-End Business Processes (Core Business Process List, Process-Module Mapping Matrix, Typical Business Process Diagram)
  - Section 4: System Boundaries and Integration (External System Integration Diagram, Integration Interface List)
  - Section 5: Requirement Assessment Guide
  - Section 6: Change History

### Step 1: Discover All Modules

Find all `{{modules_path}}/{{module_name}}/{{module_name}}-overview.md` files.

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

Read each {{module_name}}-overview.md and extract:
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

Generate Mermaid dependency diagram (see [Mermaid Diagram Guide](#mermaid-diagram-guide)).

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

1. **Read Configuration**:
   - Read `speccrew-workspace/docs/configs/document-templates.json` - Get template structure and placeholder requirements
   - Read `speccrew-workspace/docs/rules/mermaid-rule.md` - Get Mermaid diagram compatibility guidelines

2. **Get Timestamp**:
   - **CRITICAL**: Use the Skill tool to invoke `speccrew-get-timestamp` with parameter: `format=ISO`
   - Use the returned timestamp as generation timestamp in document

3. **Use template `templates/SYSTEM-OVERVIEW-TEMPLATE.md`, fill all sections**:
   - Follow [Mermaid Diagram Guide](#mermaid-diagram-guide) for diagram generation

**Section: Index and Overview** (NEW)
- Generation timestamp (from get-timestamp skill)
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
- Reference to `speccrew-pm-requirement-assess` skill
- Quick location guide (which section to reference)

**Source Traceability:**

Aggregate source file references from all module overview documents:

1. **File Reference Block** (at document start):
```markdown
<cite>
**Referenced Files**
- Aggregated from all module overview documents
- [OrderController.java](file://path/to/controller)
- [PaymentController.java](file://path/to/controller)
</cite>
```

2. **Diagram Source** (after each Mermaid diagram):
```markdown
**Diagram Source**
- Aggregated from: order-overview.md, payment-overview.md
```

3. **Section Source** (at end of document):
```markdown
**Section Source**
- Aggregated from all module overview documents
```

### Step 8: Report Results

```
System summarization completed:
- Modules Processed: {{module_count}}
- Entities Aggregated: {{entity_count}}
- APIs Counted: {{api_count}}
- Dependencies Mapped: {{dependency_count}}
- Business Flows Identified: {{flow_count}}
- Output: system-overview.md (complete)
- Status: success
```

## Reference Guides

### Mermaid Diagram Guide

When generating Mermaid diagrams, follow these compatibility guidelines:

**Key Requirements:**
- Use only basic node definitions: `A[text content]`
- No HTML tags (e.g., `<br/>`)
- No nested subgraphs
- No `direction` keyword
- No `style` definitions
- Use standard `graph TB/LR` syntax only

**Diagram Types:**

| Diagram Type | Use Case | Example |
|---------|---------|------|
| `graph TB/LR` | System structure, module dependencies | System architecture, module dependency graph |
| `sequenceDiagram` | Cross-module interaction flow | User operation flow, service call chain |
| `flowchart TD` | Business logic, conditional branches | State transition, exception handling |
| `classDiagram` | Class structure, entity relationships | Data model, service interface |
| `erDiagram` | Database table relationships | Entity relationship diagram |
| `stateDiagram-v2` | State machine | Order status, approval status |

---

## Checklist

- [ ] All {{module_name}}-overview.md files discovered
- [ ] Module information extracted
- [ ] Source file references aggregated from module documents
- [ ] Module index table created
- [ ] Dependency graph built
- [ ] Business domains identified
- [ ] End-to-end flows mapped
- [ ] system-overview.md generated with all sections
- [ ] Source traceability information included
- [ ] Mermaid diagrams follow compatibility guidelines
- [ ] Results reported

