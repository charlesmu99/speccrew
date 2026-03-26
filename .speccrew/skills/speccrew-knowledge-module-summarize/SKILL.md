---
name: speccrew-knowledge-module-summarize
description: Summarize a module's features to complete MODULE-OVERVIEW.md. Reads all FEATURE-DETAIL.md files of a module and generates the complete module overview with entities, dependencies, and business rules.
tools: Read, Write, Glob
---

# Module Summarize - Complete Module Overview

Read all {{feature_name}}.md files of a specific module, extract and summarize information to complete {{module_name}}-overview.md (full version with entities, dependencies, flows, and rules).

## Language Adaptation

**CRITICAL**: Generate all content in the language specified by the `language` parameter.

- `language: "zh"` → Generate all content in 中文
- `language: "en"` → Generate all content in English
- Other languages → Use the specified language

**All output content (entity names, descriptions, business rules, flow descriptions) must be in the target language only.**

## Trigger Scenarios

- "Summarize module {name} features"
- "Complete module overview for {name}"
- "Finalize module documentation for {name}"

## User

Worker Agent (speccrew-task-worker)

## Input

- `module_name`: Module name to summarize
- `module_path`: Path to module directory (e.g., `speccrew-workspace/knowledges/bizs/{{platform_type}}/{{module_name}}/`) containing:
  - {{module_name}}-overview.md (initial version)
  - features/{{feature_name}}.md files
- `language`: Target language for generated content (e.g., "zh", "en") - **REQUIRED**

## Output

- `{{module_path}}/{{module_name}}-overview.md` - Complete module overview (overwritten)

## Workflow

```mermaid
flowchart TD
    Start([Start]) --> Step0[Step 0: Read Module Overview Template]
    Step0 --> Step1[Step 1: Read Initial Module Overview]
    Step1 --> Step2[Step 2: Read All Feature Details]
    Step2 --> Step3[Step 3: Extract Entities]
    Step3 --> Step4[Step 4: Identify Dependencies]
    Step4 --> Step5[Step 5: Summarize Business Rules]
    Step5 --> Step6[Step 6: Generate Complete MODULE-OVERVIEW.md]
    Step6 --> Step7[Step 7: Report Results]
    Step7 --> End([End])
```

### Step 0: Read Module Overview Template

Before processing, read the template file to understand the required content structure:
- **Read**: `templates/MODULE-OVERVIEW-TEMPLATE.md`
- **Purpose**: Understand the template chapters and example content requirements for module overview documents
- **Key sections to follow**:
  - Section 1: Module Basic Information (Module Positioning, Module Boundary with Mermaid diagram)
  - Section 2: Feature List (Feature Tree with mindmap, Feature List Table with status)
  - Section 3: Business Entities and Relationships (Core Entity List, Entity Relationship Diagram with ER diagram, Entity State Transition with state diagram)
  - Section 4: External Dependencies and Interfaces (Module Dependency Relationships, External Interfaces Provided, Dependent Module Interfaces)
  - Section 5: Core Business Processes (Core Process Within Module with flowchart, Exception Handling Rules)
  - Section 6: Business Rules and Constraints (Business Rules, Data Constraints, Permission Rules)
  - Section 7: Related Pages and Prototypes (Page List, Page Prototype reference)
  - Section 8: Change History (version tracking table)

### Step 1: Read Initial Module Overview

Read existing {{module_name}}-overview.md (initial version) to get:
- Module basic info (name, purpose, domain)
- Feature list with links to detail docs

### Step 2: Read All Feature Details

Find and read all `{{module_path}}/features/{{feature_name}}.md` files.

For each feature, extract:
- API endpoint information
- Request/Response data structures
- Validation rules
- Business rules
- Error handling patterns

### Step 3: Extract Entities

Aggregate entities from all features:

```
From Feature A: Order, OrderItem
From Feature B: Order, Payment
---------------------------------
Module Entities: Order, OrderItem, Payment
```

For each entity, collect:
- Fields and types
- Validation constraints
- Relationships (from multiple features)

### Step 4: Identify Dependencies

Analyze feature details to identify:
- **Internal dependencies**: Other modules this module calls
- **External dependencies**: Third-party services, APIs
- **Data dependencies**: Shared entities, common DTOs

### Step 5: Summarize Business Rules

Collect all business rules from feature details:
- Validation rules
- State transition rules
- Authorization rules
- Data consistency rules

### Step 6: Generate Complete MODULE-OVERVIEW.md

1. **Read Configuration**:
   - Read `speccrew-workspace/docs/rules/mermaid-rule.md` - Get Mermaid diagram compatibility guidelines

2. **Use template `templates/MODULE-OVERVIEW-TEMPLATE.md`, fill all sections**:
   - Follow [Mermaid Diagram Guide](#mermaid-diagram-guide) for diagram generation

**Section 1: Module Basic Info** (from initial version)
- Keep existing information

**Section 2: Feature List** (from initial version)
- Keep feature list table
- Ensure all links to {{feature_name}}.md are correct

**Section 3: Business Entities** (NEW)

| Entity | Description | Key Fields | Relationships |
|--------|-------------|------------|---------------|
| Order | Order main table | id, status, amount | 1:N OrderItem |
| OrderItem | Order line items | id, productId, qty | N:1 Order |

Include ER diagram based on entity relationships.

**Section 4: Dependencies** (NEW)

| Dependency Direction | Module/Service | Purpose | Interface |
|---------------------|----------------|---------|-----------|
| This module uses | UserService | Get user info | API call |
| Uses this module | PaymentService | Query orders | API call |

**Section 5: Core Business Flows** (NEW)

Based on feature interactions, identify core flows:
- Order creation flow
- Order status change flow
- etc.

**Section 6: Business Rules** (NEW)

| Rule ID | Rule Name | Description | Related Features |
|---------|-----------|-------------|------------------|
| R001 | Order amount > 0 | Order total must be positive | create-order |
| R002 | Stock check | Must check inventory before order | create-order |

**Source Traceability:**

Aggregate source file references from all feature documents:

1. **File Reference Block** (at document start):
```markdown
<cite>
**Referenced Files**
- [OrderController.java](file://path/to/controller)
- [OrderService.java](file://path/to/service)
</cite>
```

2. **Diagram Source** (after each Mermaid diagram):
```markdown
**Diagram Source**
- [OrderController.java](file://path/to/controller#L45-L60)
```

3. **Section Source** (at end of document):
```markdown
**Section Source**
- [OrderController.java](file://path/to/controller#L1-L100)
- [OrderService.java](file://path/to/service#L1-L80)
```

### Step 7: Report Results

```
Module summarization completed:
- Module: {{module_name}}
- Features Processed: {{feature_count}}
- Entities Extracted: {{entity_count}}
- Dependencies Identified: {{dependency_count}}
- Business Rules Summarized: {{rule_count}}
- Output: {{module_name}}-overview.md (complete)
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
| `graph TB/LR` | Module structure, dependencies | Project structure diagram, dependency graph |
| `sequenceDiagram` | Interaction flow, API calls | User operation flow, service call chain |
| `flowchart TD` | Business logic, conditional branches | State transition, exception handling |
| `classDiagram` | Class structure, entity relationships | Data model, service interface |
| `erDiagram` | Database table relationships | Entity relationship diagram |
| `stateDiagram-v2` | State machine | Order status, approval status |

---

## Checklist

- [ ] Initial {{module_name}}-overview.md read
- [ ] All {{feature_name}}.md files read
- [ ] Source file references extracted from feature documents
- [ ] Entities extracted and aggregated
- [ ] Dependencies identified
- [ ] Business rules collected
- [ ] Section 3-6 completed in {{module_name}}-overview.md
- [ ] Source traceability information included
- [ ] Mermaid diagrams follow compatibility guidelines
- [ ] Results reported

