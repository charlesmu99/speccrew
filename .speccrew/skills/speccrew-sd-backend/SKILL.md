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

## Absolute Constraints

> **These rules apply to ALL steps. Violation = task failure.**

1. **FORBIDDEN: `create_file` for documents** — NEVER use `create_file` to write design documents or INDEX. Documents MUST be created by copying the template (Step 4.2a / Step 5.2a) then filling sections with `search_replace` (Step 4.2b / Step 5.2b). `create_file` produces truncated output on large files.

2. **FORBIDDEN: Full-file rewrite** — NEVER replace the entire document content in a single operation. Always use targeted `search_replace` on specific sections.

3. **MANDATORY: Template-first workflow** — Copy template MUST execute before fill sections. Skipping copy and writing content directly is FORBIDDEN.

## Step 1: Read Inputs

**Input Parameters** (from agent context):
- `feature_id` (optional): Feature identifier, e.g., `F-CRM-01`. If provided, use new naming format.
- `feature_name`: Feature name, e.g., `customer-list`.
- `platform_id`: Target platform, e.g., `backend-spring`, `backend-nestjs`.

Read in order:

1. **Feature Spec document(s)**: `speccrew-workspace/iterations/{number}-{type}-{name}/02.feature-design/{feature-id}-{feature-name}-feature-spec.md`
2. **API Contract**: `speccrew-workspace/iterations/{number}-{type}-{name}/02.feature-design/{feature-id}-{feature-name}-api-contract.md`
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

> **Note**: With the new fine-grained Feature Spec format, each Feature Spec typically contains **3-8 functions** (previously 10-20). The extraction logic remains the same, but the scope is more focused.

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

### 4.2a Copy Template to Document Path

1. **Read the design template**: `templates/SD-BACKEND-TEMPLATE.md`
2. **Replace top-level placeholders** with known variables:
   - Module name, feature name, platform ID, etc.
3. **Create the document file** using `create_file`:
   - **Target path pattern**:
     - With `feature_id`: `speccrew-workspace/iterations/{number}-{type}-{name}/03.system-design/{platform_id}/{feature-id}-{feature-name}-design.md`
       - Example: `03.system-design/backend-spring/F-CRM-01-customer-list-design.md`
     - Without `feature_id` (backward compatibility): `speccrew-workspace/iterations/{number}-{type}-{name}/03.system-design/{platform_id}/{module}-design.md`
   - Content: Template with top-level placeholders replaced
4. **Verify**: Document should have complete section structure ready for filling

### 4.2b Fill Each Section Using search_replace

Fill each section with technology-specific implementation details.

> ⚠️ **CRITICAL CONSTRAINTS:**
> - **FORBIDDEN: `create_file` to rewrite the entire document** — it destroys template structure
> - **MUST use `search_replace` to fill each section individually**
> - **All section titles and numbering MUST be preserved**
> - If a section has no applicable content, keep the section title and replace placeholder with "N/A"

| Section | Content Source |
|---------|----------------|
| **Module Structure** | Use actual framework layering from techs knowledge |
| **Interface Pseudo-code** | Use actual framework decorators/annotations |
| **Database Design** | Use actual ORM entity definitions from conventions-data.md |
| **Transaction Boundaries** | Use actual framework transaction mechanism |
| **Exception Handling** | Use actual exception classes and error codes |

**How to Reference Techs Knowledge for Pseudo-code:**

1. **Read relevant techs knowledge file for the platform**:
   - Core syntax: `tech-stack.md` for framework version and key libraries
   - ORM patterns: `conventions-data.md` for entity definitions and transaction management
   - Design patterns: `conventions-design.md` for layer structure and naming conventions
2. **Extract framework-specific syntax patterns**:
   - Controller annotations/decorators
   - Service injection patterns
   - Repository/DAO method signatures
   - Transaction management annotations
3. **Apply patterns in pseudo-code**:
   - Use exact annotation/decorator syntax from techs knowledge
   - Follow naming conventions from conventions-design.md
   - Apply ORM patterns from conventions-data.md

**Pseudo-code Requirements:**
- MUST use actual framework syntax from techs knowledge
- Spring Boot: `@RestController`, `@PostMapping`, `@Valid`, `@Transactional`, etc.
- NestJS: `@Controller`, `@Post`, `@Body`, `@UseGuards`, etc.
- Go: `gin.Context`, `echo.Context`, GORM annotations, etc.

### 4.3 Verify Output

Verify the completed design document:
- All sections filled with actual content (no remaining placeholders)
- Mermaid diagrams render correctly
- Pseudo-code uses actual framework syntax from techs knowledge

## Step 5: Generate Platform INDEX.md

After all module designs are complete:

### 5.1 Read Index Template

Read INDEX-TEMPLATE.md to understand platform-level document structure.

### 5.2a Copy Index Template to Document Path

1. **Read the index template**: `templates/INDEX-TEMPLATE.md`
2. **Replace top-level placeholders** (platform name, feature name, etc.)
3. **Create the document file** using `create_file`:
   - Target path: `speccrew-workspace/iterations/{number}-{type}-{name}/03.system-design/{platform_id}/INDEX.md`
   - Content: Template with top-level placeholders replaced

### 5.2b Fill Index Sections Using search_replace

> ⚠️ **CRITICAL CONSTRAINTS:**
> - **FORBIDDEN: `create_file` to rewrite the entire document** — it destroys template structure
> - **MUST use `search_replace` to fill each section individually**
> - **All section titles and numbering MUST be preserved**

| Section | Content |
|---------|---------|
| **Tech Stack Summary** | Extract from techs knowledge |
| **Shared Design Decisions** | Middleware stack, data source config, base service classes, common utilities |
| **Module List Table** | Links to each module design document. Use `feature_id` as identifier if available (e.g., `F-CRM-01`), otherwise use module name. Example: `\| F-CRM-01 \| Customer List \| F-CRM-01-customer-list-design.md \| NEW \|` |
| **Cross-Module Interaction Notes** | Shared services, event-driven patterns, dependencies |
| **Database Schema Overview** | New tables, modified tables, entity relationships |

### 5.3 Verify Output

Verify the completed INDEX.md:
- All sections filled with actual content (no remaining placeholders)
- All module design documents are correctly linked
- Database schema overview is complete

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

## Step 7: Task Completion Report

After completing all steps, output a structured completion report for the System Designer Agent to parse and update DISPATCH-PROGRESS.json:

### On Success

```
## Task Completion Report
- **Status**: SUCCESS
- **Task ID**: {task_id from context}
- **Platform**: {platform_id}
- **Feature ID**: {feature_id}
- **Feature**: {feature_name}
- **Output Files**:
  - speccrew-workspace/iterations/{iter}/03.system-design/{platform_id}/INDEX.md
  - speccrew-workspace/iterations/{iter}/03.system-design/{platform_id}/{feature-id}-{feature-name}-design.md (or {module}-design.md if no feature_id)
- **Summary**: Backend system design completed for {feature_name} on {platform_id} with {count} module designs
```

### On Failure

```
## Task Completion Report
- **Status**: FAILED
- **Task ID**: {task_id from context}
- **Platform**: {platform_id}
- **Feature ID**: {feature_id}
- **Feature**: {feature_name}
- **Output Files**: []
- **Error**: {description of what went wrong}
- **Error Category**: DEPENDENCY_MISSING | VALIDATION_ERROR | BLOCKED
- **Recovery Hint**: {suggestion for how to resolve or retry}
```

**Error Categories:**
- `DEPENDENCY_MISSING`: Required input file or knowledge document not found
- `VALIDATION_ERROR`: Input validation failed (e.g., invalid Feature Spec format)
- `BLOCKED`: Blocked by external dependency or prerequisite not met

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
