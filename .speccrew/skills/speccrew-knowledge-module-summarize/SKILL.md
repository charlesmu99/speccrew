---
name: SpecCrew-knowledge-module-summarize
description: Summarize a module's features to complete MODULE-OVERVIEW.md. Reads all FEATURE-DETAIL.md files of a module and generates the complete module overview with entities, dependencies, and business rules.
tools: Read, Write, Glob
---

# Module Summarize - Complete Module Overview

Read all {feature-name}.md files of a specific module, extract and summarize information to complete {name}-overview.md (full version with entities, dependencies, flows, and rules).

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

Worker Agent (SpecCrew-task-worker)

## Input

- `module_name`: Module name to summarize
- `module_path`: Path to module directory containing:
  - {name}-overview.md (initial version)
  - features/{feature-name}.md files
- `language`: Target language for generated content (e.g., "zh", "en") - **REQUIRED**

## Output

- `{module_path}/{name}-overview.md` - Complete module overview (overwritten)

## Workflow

### Step 1: Read Initial Module Overview

Read existing {name}-overview.md (initial version) to get:
- Module basic info (name, purpose, domain)
- Feature list with links to detail docs

### Step 2: Read All Feature Details

Find and read all `{module_path}/features/{feature-name}.md` files.

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

Use `templates/MODULE-OVERVIEW-TEMPLATE.md` (in this skill directory), fill all sections:

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

**Section 1: Module Basic Info** (from initial version)
- Keep existing information

**Section 2: Feature List** (from initial version)
- Keep feature list table
- Ensure all links to {feature-name}.md are correct

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

### Step 7: Report Results

```
Module summarization completed:
- Module: {module_name}
- Features Processed: {N}
- Entities Extracted: {N}
- Dependencies Identified: {N}
- Business Rules Summarized: {N}
- Output: {name}-overview.md (complete)
- Status: success
```

## Checklist

- [ ] Initial {name}-overview.md read
- [ ] All {feature-name}.md files read
- [ ] Entities extracted and aggregated
- [ ] Dependencies identified
- [ ] Business rules collected
- [ ] Section 3-6 completed in {name}-overview.md
- [ ] Results reported

