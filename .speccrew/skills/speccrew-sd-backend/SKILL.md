---
name: speccrew-sd-backend
description: Backend System Design SOP. Guide System Designer Agent to generate platform-specific backend detailed design documents by filling technology implementation details into the Feature Spec skeleton. Reads techs knowledge to determine actual framework syntax, ORM patterns, and conventions.
tools: Read, Write, Glob, Grep
---

# Trigger Scenarios

- Feature Spec has been confirmed, user requests backend system design
- System Designer Agent receives task to create backend detailed design for a specific platform
- User asks "Design backend implementation" or "Create backend design for {platform}"

# Workflow

## Step 1: Read Inputs

Read in order:

1. **Feature Spec document(s)**: `speccrew-workspace/iterations/{number}-{type}-{name}/02.feature-design/[feature-name]-feature-spec.md`
2. **API Contract**: `speccrew-workspace/iterations/{number}-{type}-{name}/02.feature-design/[feature-name]-api-contract.md`
3. **Backend techs knowledge** (paths from agent context):
   - `speccrew-workspace/knowledges/techs/{platform_id}/tech-stack.md`
   - `speccrew-workspace/knowledges/techs/{platform_id}/architecture.md`
   - `speccrew-workspace/knowledges/techs/{platform_id}/conventions-design.md`
   - `speccrew-workspace/knowledges/techs/{platform_id}/conventions-dev.md`
   - `speccrew-workspace/knowledges/techs/{platform_id}/conventions-data.md` (critical for backend: ORM, data modeling, migration)
4. **Design template**: `speccrew-sd-backend/templates/SD-BACKEND-TEMPLATE.md`
5. **Index template**: `speccrew-sd-backend/templates/INDEX-TEMPLATE.md`

## Step 2: Analyze Existing Code Structure

Use Glob/Grep to understand current backend codebase:

| Analysis Target | Purpose |
|-----------------|---------|
| Controller/Router layer structure | Understand routing patterns and naming conventions |
| Service layer organization | Identify service boundaries and reuse opportunities |
| Repository/DAO layer patterns | Review data access patterns |
| Entity/Model definitions | Understand existing data models |
| Middleware stack | Identify cross-cutting concerns |
| Exception handling patterns | Review error handling approach |
| Database migration structure | Understand migration naming and structure |
| Naming conventions | Ensure consistency with existing code |

## Step 3: Extract Functions from Feature Spec

Parse Feature Spec to identify all backend-relevant functions.

For each function, extract:

| Aspect | Content |
|--------|---------|
| **API Interfaces** | From Feature Spec Section 2.N backend part |
| **Data Access Requirements** | What data needs to be read/written |
| **Business Logic Flow** | Core processing steps |
| **Cross-Module Dependencies** | Dependencies on other modules or services |

Cross-reference with API Contract for exact endpoint specifications.

Mark each function as:

| Marker | Meaning |
|--------|---------|
| `[EXISTING]` | Reuse current implementation, no changes needed |
| `[MODIFIED]` | Modify existing implementation |
| `[NEW]` | Create brand new implementation |

**Checkpoint A: Present function list with markers to user for confirmation before proceeding.**

## Step 4: Generate Module Design Documents

For each function (or logical group = one controller/module):

### 4.1 Read Template

Read the SD-BACKEND-TEMPLATE.md to understand document structure.

### 4.2 Fill Template Sections

Fill each section with technology-specific implementation details:

| Section | Content Source |
|---------|----------------|
| **Module Structure** | Use actual framework layering from techs knowledge |
| **Interface Pseudo-code** | Use actual framework decorators/annotations |
| **Database Design** | Use actual ORM entity definitions from conventions-data.md |
| **Transaction Boundaries** | Use actual framework transaction mechanism |
| **Exception Handling** | Use actual exception classes and error codes |

**Pseudo-code Requirements:**
- MUST use actual framework syntax from techs knowledge
- Spring Boot: `@RestController`, `@PostMapping`, `@Valid`, `@Transactional`, etc.
- NestJS: `@Controller`, `@Post`, `@Body`, `@UseGuards`, etc.
- Go: `gin.Context`, `echo.Context`, GORM annotations, etc.

### 4.3 Write Output

Write to: `speccrew-workspace/iterations/{number}-{type}-{name}/03.system-design/{platform_id}/{module}-design.md`

## Step 5: Generate Platform INDEX.md

After all module designs are complete:

### 5.1 Read Index Template

Read INDEX-TEMPLATE.md to understand platform-level document structure.

### 5.2 Fill Index Sections

| Section | Content |
|---------|---------|
| **Tech Stack Summary** | Extract from techs knowledge |
| **Shared Design Decisions** | Middleware stack, data source config, base service classes, common utilities |
| **Module List Table** | Links to each module design document |
| **Cross-Module Interaction Notes** | Shared services, event-driven patterns, dependencies |
| **Database Schema Overview** | New tables, modified tables, entity relationships |

### 5.3 Write Output

Write to: `speccrew-workspace/iterations/{number}-{type}-{name}/03.system-design/{platform_id}/INDEX.md`

## Step 6: Present Summary

Present to user:

```
Backend System Design Summary for: {feature-name}
Platform: {platform_id}

Module Designs: {count}
├── [NEW] {count} modules
├── [MODIFIED] {count} modules
└── [EXISTING] {count} modules (no design needed)

Database Changes:
├── New Tables: {count}
├── Modified Tables: {count}
└── Migration Files: {count}

Key Design Decisions:
- {decision 1}
- {decision 2}
- {decision 3}

Files Generated:
- {list all file paths}
```

# Key Rules

| Rule | Description |
|------|-------------|
| **Actual Framework Syntax** | All pseudo-code MUST use actual framework/library syntax from techs knowledge |
| **API Contract is READ-ONLY** | Do NOT modify API Contract, stop and report if issues found |
| **Migration Strategy Required** | Database design must include migration strategy, not just final schema |
| **Explicit Transaction Boundaries** | Transaction boundaries must be explicitly marked |
| **Exception Code Mapping** | Exception handling must map to API Contract error codes |
| **Follow Techs Conventions** | Naming, directory structure, patterns from techs knowledge |

# Mermaid Diagram Requirements

When generating Mermaid diagrams, follow compatibility guidelines:

- Use only basic node definitions: `A[text content]`
- No HTML tags (e.g., `<br/>`)
- No nested subgraphs
- No `direction` keyword
- No `style` definitions
- No special characters in node text
- Use standard `graph TB/LR` or `flowchart TD/LR` or `erDiagram` syntax only

# Checklist

- [ ] All techs knowledge documents loaded before design
- [ ] Feature Spec and API Contract read and understood
- [ ] Existing codebase structure analyzed (Glob/Grep)
- [ ] Function extraction completed with [EXISTING]/[MODIFIED]/[NEW] markers
- [ ] Checkpoint A passed: function list confirmed with user
- [ ] Every API in API Contract has a corresponding implementation design
- [ ] Database entities cover all data requirements from Feature Spec
- [ ] Transaction boundaries defined for multi-step operations
- [ ] Exception types map to API Contract error codes
- [ ] Pseudo-code uses actual framework syntax (not generic)
- [ ] conventions-data.md ORM patterns followed
- [ ] Migration requirements documented
- [ ] INDEX.md generated with complete module list
- [ ] All files written to correct paths under 03.system-design/{platform_id}/
- [ ] All Mermaid diagrams follow compatibility guidelines
