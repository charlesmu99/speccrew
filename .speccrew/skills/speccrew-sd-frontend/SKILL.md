---
name: speccrew-sd-frontend
description: Frontend System Design SOP. Guide System Designer Agent to generate platform-specific frontend detailed design documents by filling technology implementation details into the Feature Spec skeleton. Reads techs knowledge to determine actual framework syntax and conventions.
tools: Read, Write, Glob, Grep
---

# Trigger Scenarios

- System Designer Agent dispatches this skill with platform context (platform_id, techs paths, Feature Spec paths)
- Feature Spec has been confirmed, user requests frontend system design
- User asks "Create frontend design for this platform" or "Generate frontend module design"

# Workflow

## Absolute Constraints

> **These rules apply to ALL steps. Violation = task failure.**

1. **FORBIDDEN: `create_file` for documents** — NEVER use `create_file` to write design documents or INDEX. Documents MUST be created by copying the template (Step 4.2a / Step 5.2a) then filling sections with `search_replace` (Step 4.2b / Step 5.2b). `create_file` produces truncated output on large files.

2. **FORBIDDEN: Full-file rewrite** — NEVER replace the entire document content in a single operation. Always use targeted `search_replace` on specific sections.

3. **MANDATORY: Template-first workflow** — Copy template MUST execute before fill sections. Skipping copy and writing content directly is FORBIDDEN.

## Step 1: Read Inputs

Read in order:

1. **Feature Spec document(s)**: `speccrew-workspace/iterations/{number}-{type}-{name}/02.feature-design/[feature-name]-feature-spec.md`
2. **API Contract**: `speccrew-workspace/iterations/{number}-{type}-{name}/02.feature-design/[feature-name]-api-contract.md`
3. **Frontend techs knowledge** (paths from agent context):
   - `speccrew-workspace/knowledges/techs/{platform_id}/tech-stack.md`
   - `speccrew-workspace/knowledges/techs/{platform_id}/architecture.md`
   - `speccrew-workspace/knowledges/techs/{platform_id}/conventions-design.md`
   - `speccrew-workspace/knowledges/techs/{platform_id}/conventions-dev.md`
   - `speccrew-workspace/knowledges/techs/{platform_id}/ui-style/ui-style-guide.md` (if exists)
4. **Design template**: `speccrew-sd-frontend/templates/SD-FRONTEND-TEMPLATE.md`
5. **Index template**: `speccrew-sd-frontend/templates/INDEX-TEMPLATE.md`

## Step 2: Analyze Existing Code Structure

Use Glob/Grep to understand current codebase:

| Target | Glob Pattern | Purpose |
|--------|-------------|---------|
| Component directory | `src/components/**/*.vue` or `src/components/**/*.tsx` | Understand component organization |
| Shared/base components | `src/components/base/**/*` | Identify reusable components |
| State management | `src/stores/**/*.ts` or `src/store/**/*.ts` | Understand store pattern |
| Router configuration | `src/router/**/*.ts` | Understand routing structure |
| API layer | `src/apis/**/*.ts` or `src/api/**/*.ts` | Understand API encapsulation pattern |
| Naming conventions | Various | Identify actual naming patterns in use |

Document findings for reference in later steps.

## Step 3: Extract Functions from Feature Spec

Parse Feature Spec to identify all functions (Section 2.N pattern).

For each function, extract:

| Aspect | Content to Extract |
|--------|-------------------|
| Frontend prototype | ASCII wireframe from Feature Spec |
| Interaction flow | User actions and system responses |
| Backend API calls | Required API endpoints from API Contract |
| Data requirements | Fields and structures needed |

Mark each function's components as:

| Marker | Meaning | Example |
|--------|---------|---------|
| `[EXISTING]` | Reuse current component/store | `[EXISTING] UserSelect component` |
| `[MODIFIED]` | Enhance/change existing | `[MODIFIED] OrderTable - add new column` |
| `[NEW]` | Create brand new | `[NEW] ProductDetailDrawer` |

**Checkpoint A: Present function extraction summary to user for confirmation.**

## Step 4: Generate Module Design Documents

For each function (or logical group of closely related functions = one module):

### 4.1 Read Template

Read `SD-FRONTEND-TEMPLATE.md` for document structure.

### 4.2a Copy Template to Document Path

1. **Read the design template**: `templates/SD-FRONTEND-TEMPLATE.md`
2. **Replace top-level placeholders** with known variables:
   - Module name, feature name, platform ID, etc.
3. **Create the document file** using `create_file`:
   - Target path: `speccrew-workspace/iterations/{number}-{type}-{name}/03.system-design/{platform_id}/{module}-design.md`
   - Content: Template with top-level placeholders replaced
4. **Verify**: Document should have complete section structure ready for filling

### 4.2b Fill Each Section Using search_replace

Fill each section with technology-specific implementation details.

> ⚠️ **CRITICAL CONSTRAINTS:**
> - **FORBIDDEN: `create_file` to rewrite the entire document** — it destroys template structure
> - **MUST use `search_replace` to fill each section individually**
> - **All section titles and numbering MUST be preserved**
> - If a section has no applicable content, keep the section title and replace placeholder with "N/A"

| Section | Technology-Specific Content |
|---------|----------------------------|
| Component tree | Use actual framework patterns (Vue 3 Composition API / React Hooks / etc.) |
| Props/Emits | TypeScript types from conventions-dev.md |
| State management | Actual store pattern (Pinia/Vuex/Redux/Zustand) |
| API layer | Actual request library and interceptor patterns |
| Routing | Actual router config format |
| Pseudo-code | MUST use actual framework syntax from techs knowledge |

**Key Rules for Pseudo-code**:
- MUST use actual framework API syntax from techs knowledge
- NOT generic pseudo-code
- Include actual import statements
- Use actual store/API patterns from conventions

### 4.3 Verify Output

Verify the completed design document:
- All sections filled with actual content (no remaining placeholders)
- Mermaid diagrams render correctly
- Pseudo-code uses actual framework syntax from techs knowledge

## Step 5: Generate Platform INDEX.md

After all module designs are complete:

### 5.1 Read Template

Read `INDEX-TEMPLATE.md` for document structure.

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

| Section | Content Source |
|---------|---------------|
| Tech stack summary | tech-stack.md |
| Shared design decisions | architecture.md, conventions-design.md |
| Global state strategy | architecture.md state management section |
| Base components | conventions-design.md shared components |
| API interceptor config | conventions-dev.md HTTP client section |
| Auth pattern | architecture.md authentication section |

### 5.3 Build Module List

Create table with links to each module design document.

### 5.4 Verify Output

Verify the completed INDEX.md:
- All sections filled with actual content (no remaining placeholders)
- All module design documents are correctly linked
- Platform-level summary is complete

## Step 6: Present Summary

Present to user:

```
Frontend System Design Summary for: {feature-name}
Platform: {platform_id}

Module Design Documents: {count}
├── {module1}-design.md
├── {module2}-design.md
└── ...

Key Design Decisions:
- State Management: {approach}
- Component Strategy: {approach}
- API Layer: {approach}

Concerns/Trade-offs:
- {list any concerns}
```

**Ask user to confirm:**
1. Are the component architectures appropriate?
2. Is the state management strategy correct?
3. Do the pseudo-code patterns match project conventions?
4. Are all API calls from API Contract covered?

# Key Rules

| Rule | Description |
|------|-------------|
| **Actual Framework Syntax** | All pseudo-code MUST use actual framework/library syntax from techs knowledge, NOT generic code |
| **API Contract READ-ONLY** | API Contract is reference only - do not modify |
| **One Module Per Function Group** | Each module design document maps to one or more related Feature Spec functions |
| **Status Markers Required** | Use [EXISTING], [MODIFIED], [NEW] markers for all components and store modules |
| **Follow Techs Conventions** | Naming, directory structure, patterns must follow techs knowledge |

# Checklist

- [ ] All techs knowledge documents loaded before design
- [ ] Existing code structure analyzed via Glob/Grep
- [ ] Every Feature Spec function covered in a module design
- [ ] All API calls from API Contract referenced correctly
- [ ] Pseudo-code uses actual framework syntax (not generic)
- [ ] Component naming follows conventions-dev.md
- [ ] State management follows architecture.md patterns
- [ ] Directory structure follows conventions-design.md
- [ ] INDEX.md generated with complete module list
- [ ] All files written to correct paths under 03.system-design/{platform_id}/
- [ ] Checkpoint A passed: function extraction confirmed with user
