---
name: speccrew-fd-feature-design
description: Feature Design & Spec Generation SOP. Reads .feature-analysis.md and PRD documents, performs frontend/backend/data design, and generates complete Feature Spec document using template-first workflow. Combines design thinking with document generation in a single pass, without producing any intermediate design-data artifacts. Use when Feature Designer needs to produce Feature Spec from completed analysis.
tools: Read, Write, Glob, Grep, search_replace
---

# Methodology Foundation

ISA-95 Stages 4-6 as internal thinking framework:

| Stage | Integrated Into | Purpose |
|-------|-----------------|---------|
| Stage 4: Information Flows | Interaction Flow | Map cross-module data flows, identify API endpoints |
| Stage 5: Categories of Information | Data Model | Classify data entities, build data dictionary |
| Stage 6: Information Descriptions | Business Rules | Define validation rules, output standards, traceability |

> No separate modeling documents. Methodology guides thinking quality.

# Trigger Scenarios

- Function decomposition completed (`.feature-analysis.md` exists)
- Checkpoint A passed (function breakdown confirmed)
- Feature Spec document generation needed

# Workflow

## Absolute Constraints

**ABORT CONDITIONS:**
- `.feature-analysis.md` missing OR Checkpoint A not passed → HARD STOP
- Template file missing → HARD STOP

**FORBIDDEN:**
- `create_file` for final documents in section-fill phase — use template + search_replace
- Full-file rewrite — use targeted search_replace per section

**MANDATORY:**
- Template-first workflow — Step 5 (copy template) MUST precede Step 6 (fill content)

**NOTE:** Design process is internal — no intermediate design-data files are produced.

## Step 0: Precondition Check

### Step 0 Input Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `feature_analysis_path` | Yes | Path to `.feature-analysis.md` |
| `prd_path` | Yes | Path to the Sub-PRD document |
| `feature_id` | No | Feature identifier (e.g., `F-CRM-01`) |
| `feature_name` | No | Feature name in English |
| `feature_type` | No | `Page+API` or `API-only` |
| `frontend_platforms` | No | List of frontend platforms |
| `output_path` | No | Custom output path for Feature Spec (auto-generated if not provided) |
| `skip_checkpoint` | No | Boolean, default `false`. Skip Checkpoint B if `true` (batch mode) |

### Step 0 Actions

1. Read `.feature-analysis.md` at `feature_analysis_path`
2. Verify Checkpoint A: `function_decomposition.passed == true`
3. IF not passed → ABORT: `ERROR: Checkpoint A not passed. Run speccrew-fd-feature-analysis first.`
4. Extract key data:
   - `feature_id`: From analysis file or parameter
   - `feature_name`: From analysis file or parameter
   - `feature_type`: From analysis file or parameter (`Page+API` or `API-only`)
   - `functions[]`: Function breakdown list
   - `platforms[]`: Frontend platforms list

## Step 1: Frontend Design

### 1.0 Conditional Execution

`feature_type = "Page+API"` → Execute design; `feature_type = "API-only"` → Skip; Not provided → Execute (backward compatibility)

**Multi-Platform Rule:** Repeat design for EACH platform with platform-specific headers.

**Mobile Wireframe Patterns:**

```
Pattern M-A: Card List
+----------------------------------+
|  [Search...]            [Filter] |
+----------------------------------+
|  +----------------------------+  |
|  | Title          Status Tag  |  |
|  | Subtitle / Key info        |  |
|  | Detail line      [Action]  |  |
|  +----------------------------+  |
|  +----------------------------+  |
|  | Title          Status Tag  |  |
|  | Subtitle / Key info        |  |
|  | Detail line      [Action]  |  |
|  +----------------------------+  |
|  [Load More / Pull to Refresh]   |
+----------------------------------+
|  [Tab1] [Tab2] [Tab3] [Tab4]    |
+----------------------------------+

Pattern M-B: Mobile Form
+----------------------------------+
|  < Back     Title       [Save]   |
+----------------------------------+
|  Label                           |
|  [Full-width input          ]    |
|                                  |
|  Label                           |
|  [Full-width input          ]    |
|                                  |
|  Label                           |
|  [Picker / Selector         >]   |
|                                  |
|  Label                           |
|  [Switch toggle            O ]   |
+----------------------------------+

Pattern M-C: Action Sheet
+----------------------------------+
| (dimmed background)              |
|  +----------------------------+  |
|  | Action Sheet Title         |  |
|  +----------------------------+  |
|  | Option 1                   |  |
|  +----------------------------+  |
|  | Option 2                   |  |
|  +----------------------------+  |
|  | Cancel                     |  |
|  +----------------------------+  |
+----------------------------------+
```

### 1.1 UI Prototype

Create ASCII wireframes showing layout, UI elements, navigation.

**PC Wireframe Example:**
```
+--------------------------------------------------+
|  Header: User Management                          |
+--------------------------------------------------+
|  [Search] [Filter v]        [+ New User]         |
+--------------------------------------------------+
|  +---------------------------------------------+ |
|  | ID | Username | Email    | Status | Actions | |
|  |----|----------|----------|--------|---------| |
|  | 1  | john_doe | john@... | Active | [Edit]  | |
|  | 2  | jane_smith|jane@... | Active | [Edit]  | |
|  +---------------------------------------------+ |
|  [Previous] Page 1 of 5 [Next]                   |
+--------------------------------------------------+
```

### 1.2 Interface Element Descriptions

| Element | Type | Behavior |
|---------|------|----------|
| {name} | {component type} | {behavior description} |

### 1.3 Interaction Flow

Document: `User Action → Frontend Response → Backend API Call`

> **ISA-95 Stage 4 Thinking — Information Flows**
> - Cross-module flows: Map data flows between feature and other modules
> - Sequence coverage: Complete chain user→frontend→backend→database→external
> - Interface identification: Every data exchange point = potential API endpoint
> - Exception flows: Document alternative paths, not just happy path

### 1.4 Backend API Mapping

| Frontend Action | Backend API | Purpose |
|-----------------|-------------|---------|
| {action} | {API endpoint} | {data exchanged} |

## Step 2: Backend Design

### 2.1 API/Interface List

| Interface | Method | Description |
|-----------|--------|-------------|
| {name} | {GET/POST/PUT/DELETE} | {purpose} |

### 2.2 Processing Logic Flow

| Stage | Description |
|-------|-------------|
| Input Validation | Business rules validating input |
| Business Logic | Core processing steps (conceptual) |
| Data Operations | What data to read/write |
| Response | What data to return |

### 2.3 Data Access Scheme

| Operation | Data Target | Type |
|-----------|-------------|------|
| Read | {data} | [EXISTING]/[NEW] |
| Write | {data} | [EXISTING]/[NEW] |

### 2.4 Cross-Module Interactions

| This Module | Interacts With | Interface | Data Exchanged |
|-------------|----------------|-----------|----------------|
| {module} | {other module} | {API/Event} | {what data} |

## Step 3: Data Model & Business Rules

### 3.1 New Data Structures

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| {field} | {data type} | {required/unique} | {purpose} |

> **ISA-95 Stage 5 Thinking — Categories of Information**
> - Classification: Categorize data (master, transactional, reference, computed)
> - Dictionary rigor: Every field needs name, type, constraints, semantic description
> - Semantic consistency: Align with domain glossary
> - Relationships: Identify core relationships (1:1, 1:N, N:N)

### 3.2 Modifications to Existing Data Structures

| Entity | Change Type | Details | Impact |
|--------|-------------|---------|--------|
| {entity} | Add/Modify/Remove field | {description} | {affected areas} |

### 3.3 Data Relationships

**New Relationships:** `EntityA --1:N--> EntityB`

| New Entity | Existing Entity | Relationship |
|------------|-----------------|--------------|
| {new} | {existing} | {1:1 / 1:N / N:M} |

### 3.4 Data Source Descriptions

| Data | Source | Update Frequency |
|------|--------|------------------|
| {item} | {internal/external/user} | {real-time/periodic/on-demand} |

### 3.5 Permission Rules

> **ISA-95 Stage 6 Thinking — Information Descriptions**
> - Validation: Field-level, cross-field, business logic rules
> - Output standards: Format specifications for downstream API Contract
> - Permissions: Data access rules mapping to API authorization
> - Traceability: Every rule traces back to PRD requirement

| Function | Required Permission | Scope |
|----------|---------------------|-------|
| {function} | {permission} | {global/module/resource-specific} |

### 3.6 Business Logic Rules

| Rule ID | Description | Trigger | Action |
|---------|-------------|---------|--------|
| BR-{number} | {description} | {when applies} | {what happens} |

### 3.7 Validation Rules

| Field | Frontend Validation | Backend Validation |
|-------|---------------------|---------------------|
| {field} | {client rules} | {server rules} |

## Step 4: Checkpoint B — User Confirmation

**Conditional Execution:** Skip if `skip_checkpoint=true`

### 4.1 Present Design Summary

```
╔══════════════════════════════════════════════════════════════╗
║           FEATURE DESIGN SUMMARY - CHECKPOINT B              ║
╠══════════════════════════════════════════════════════════════╣
║ Feature: {feature_name} ({feature_id})                       ║
╠══════════════════════════════════════════════════════════════╣
║ FUNCTIONS DESIGNED                                           ║
║ Total: {N} functions                                         ║
║                                                              ║
║ Function Breakdown:                                          ║
║ • {Function 1} - [EXISTING/MODIFIED/NEW]                     ║
║ • {Function 2} - [EXISTING/MODIFIED/NEW]                     ║
║ • {Function 3} - [EXISTING/MODIFIED/NEW]                     ║
╠══════════════════════════════════════════════════════════════╣
║ SYSTEM RELATIONSHIP SUMMARY                                  ║
║ • [EXISTING]: {count} - Reuse existing capabilities          ║
║ • [MODIFIED]: {count} - Enhance existing features            ║
║ • [NEW]: {count} - Create new functionality                  ║
╠══════════════════════════════════════════════════════════════╣
║ FRONTEND COMPONENTS                                          ║
║ • Platforms: {platform list}                                 ║
║ • UI Patterns: {list of wireframe patterns used}             ║
║ • Total Functions with UI: {count}                           ║
╠══════════════════════════════════════════════════════════════╣
║ BACKEND INTERFACES                                           ║
║ • Total APIs: {count}                                        ║
║ • New APIs: {count}                                          ║
║ • Modified APIs: {count}                                     ║
║ • Cross-Module Interactions: {count}                         ║
╠══════════════════════════════════════════════════════════════╣
║ DATA ENTITIES                                                ║
║ • New Entities: {count}                                      ║
║ • Modified Entities: {count}                                 ║
║ • Business Rules: {count}                                    ║
╚══════════════════════════════════════════════════════════════╝
```

### 4.2 HARD STOP — 5 Confirmation Questions

**STOP — DO NOT PROCEED until user confirms:**

1. **Function Coverage**: "Does this design cover all functions from the analysis? Are any functions missing?"

2. **System Relationship Markers**: "Are the [EXISTING]/[MODIFIED]/[NEW] markers accurate for each component?"

3. **UI/UX Approach**: "Do the ASCII wireframes and interaction flows match your expectations?"

4. **Backend Interface Scope**: "Are the API endpoints and cross-module interactions correctly identified?"

5. **Data Model Completeness**: "Does the data model cover all fields and relationships needed?"

**WAIT for user confirmation before proceeding to document generation.**

### 4.3 Update Checkpoints

After user confirms (or if skipped):

```bash
node speccrew-workspace/scripts/update-progress.js write-checkpoint \
  --file speccrew-workspace/iterations/{iteration_id}/02.feature-design/.checkpoints.json \
  --stage 02_feature_design \
  --checkpoint feature_design_review \
  --passed true
```

Log: "✅ Checkpoint B (feature_design_review) passed and recorded"

## Step 5: Determine Output Path & Copy Template

### 5.1 Determine Output Path

**Single Feature Mode** (when `feature_id` provided):
```
{iteration_path}/02.feature-design/{feature_id}-{feature_name}-feature-spec.md
```

**Legacy Single Mode** (backward compatibility):
```
{iteration_path}/02.feature-design/[feature-name]-feature-spec.md
```

**Legacy Master-Sub Mode** (backward compatibility):
- Master Spec: `{iteration_path}/02.feature-design/[master-name]-feature-spec.md`
- Sub Specs: `{iteration_path}/02.feature-design/[sub-name]-feature-spec.md` (one per sub-feature)

### 5.2 Copy Template

1. Read template: `templates/FEATURE-SPEC-TEMPLATE.md` (relative path from skill directory)
2. Replace top-level placeholders:
   - `[Feature Name]` → actual feature name
   - `{Feature ID}` → actual feature ID
   - `{Feature Name}` → actual feature name
   - `{Page+API / API-only}` → actual feature type
   - `{Link to Sub-PRD document}` → `prd_path` value
3. Create document using `create_file` with template content
4. Verify section structure exists (Sections 1-6 with proper numbering)

## Step 6: Fill Sections Using search_replace

### Section Mapping Table

| Template Section | Data Source |
|------------------|-------------|
| 1. Overview (Basic Information, Feature Scope) | `.feature-analysis.md` Feature Information + summary |
| 1.3 Relationship to Existing System | `.feature-analysis.md` System Relationships |
| 2. Function Details | Step 1 Frontend Design + Step 2 Backend Design results (internal) |
| 2.1.x Frontend Prototype | Step 1.1 UI Prototype results |
| 2.1.x Interaction Flow | Step 1.3 Interaction Flow results |
| 2.1.x Backend Interface | Step 2.1-2.3 Backend Design results |
| 2.1.x Data Definition | Step 3.1-3.4 Data Model results |
| 3. Cross-Function Concerns | Step 2.4 Cross-Module results |
| 4. Business Rules & Constraints | Step 3.5-3.7 Business Rules results |
| 5. API Contract Summary | Aggregated from Step 2.1 API List |
| 6. Notes | Contextual notes from analysis |

### Filling Rules

- Use `search_replace` for each section individually
- Preserve all section titles and numbering
- No applicable content → "N/A"
- Multi-platform: Create separate sub-sections per platform

### Legacy Master-Sub Mode

If processing Master-Sub structure:
- Repeat Step 5+6 for each sub-spec
- Master spec contains: Overview, Cross-module diagram, shared data structures
- Sub specs contain: Per-feature detailed design

## Step 7: Mermaid Diagram Compliance

Verify all Mermaid diagrams follow compliance rules:

1. **NO style definitions** — No `classDef`, `style`, or CSS-like syntax
2. **NO HTML tags** — No `<br/>`, `<b>`, or other HTML in labels
3. **Use standard syntax only:**
   - `sequenceDiagram` for interaction flows
   - `flowchart TD` for processing logic
   - Plain text labels with standard characters
4. **Reference:** `speccrew-workspace/docs/rules/mermaid-rule.md`

**Validation:** Before finalizing, scan all Mermaid blocks for non-compliant syntax.

## Step 8: Update Checkpoints

Set final checkpoint status:

```bash
node speccrew-workspace/scripts/update-progress.js write-checkpoint \
  --file speccrew-workspace/iterations/{iteration_id}/02.feature-design/.checkpoints.json \
  --stage 02_feature_design \
  --checkpoint feature_spec_review \
  --passed true
```

Log: "✅ Feature Spec generation completed. Checkpoint feature_spec_review passed."

---

# Key Rules

| Rule | Description |
|------|-------------|
| No Technology Decisions | Do NOT specify frameworks, databases, technologies |
| Focus on WHAT not HOW | Describe what system does, not how it's implemented |
| ASCII Wireframes Only | Use ASCII art for UI prototypes |
| Mermaid Compatibility | Follow mermaid-rule.md guidelines |
| Clear Markers | Use [EXISTING]/[MODIFIED]/[NEW] consistently |
| Template-First | Copy template before filling content |
| search_replace Only | Never use create_file for section updates after template copy |
| Checkpoint B | Get user confirmation before writing files (unless skipped) |
| No Intermediate Files | Design process is internal — do NOT output any intermediate design-data artifacts |

# Checklist

- [ ] `.feature-analysis.md` verified and exists
- [ ] Checkpoint A passed (`function_decomposition.passed == true`)
- [ ] All input parameters resolved (feature_id, feature_name, feature_type)
- [ ] Template file `templates/FEATURE-SPEC-TEMPLATE.md` exists
- [ ] **[API-only]** Frontend design skipped
- [ ] **[Page+API]** ASCII wireframes created for all platforms
- [ ] **[Multi-platform]** Per-platform designs completed
- [ ] Backend interfaces and logic documented
- [ ] Data model with entities and modifications documented
- [ ] Business rules (permissions, logic, validation) documented
- [ ] ISA-95 Stage 4/5/6 thinking applied
- [ ] Checkpoint B passed: design summary confirmed with user (or skipped)
- [ ] Output path determined
- [ ] Template copied using `create_file`
- [ ] All sections filled using `search_replace`
- [ ] Mermaid diagrams verified for compliance
- [ ] `.checkpoints.json` updated via script
- [ ] No technology decisions included
- [ ] No intermediate design-data artifact created
