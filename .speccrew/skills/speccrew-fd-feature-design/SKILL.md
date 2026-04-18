---
name: speccrew-fd-feature-design
description: Unified Feature Analysis & Design SOP. Performs complete feature analysis (read PRD, load system knowledge, function breakdown with [NEW]/[MODIFIED]/[EXISTING] markers) followed by detailed design (frontend/backend/data) and generates complete Feature Spec document using template-first workflow. Combines analysis and design in a single unified workflow without producing intermediate analysis artifacts. Use when Feature Designer needs to analyze PRD requirements and produce Feature Spec in one pass.
tools: Read, Write, Glob, Grep, search_replace
---

# Methodology Foundation

This skill applies ISA-95 Stages 1-6 as an internal thinking framework:

| ISA-95 Stage | Phase | Purpose |
|--------------|-------|---------|
| Stage 1: Domain Description | Analysis | Understand business context, scope boundaries, glossary |
| Stage 2: Information Flows | Analysis | Identify data sources, destinations, and cross-module exchanges |
| Stage 3: Categories of Information | Analysis | Classify data entities and establish information hierarchy |
| Stage 4: Information Flows | Design | Map cross-module data flows, identify API endpoints |
| Stage 5: Categories of Information | Design | Classify data entities, build data dictionary |
| Stage 6: Information Descriptions | Design | Define validation rules, output standards, traceability |

> No separate modeling documents. Methodology guides thinking quality.

# Trigger Scenarios

- PRD has been confirmed, user requests to start feature analysis and design
- Feature Designer Agent needs to analyze PRD and produce Feature Spec in one pass
- User asks "Design this feature" or "Analyze and design this requirement"

## AgentFlow Definition

<!-- @agentflow: workflow.agentflow.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `speccrew-workspace/docs/rules/agentflow-spec.md`

## Workflow

**MANDATORY:**
- **Business Perspective Only** — Feature Analysis is a PURE BUSINESS document. It describes WHAT the system does from a business/user perspective, NOT HOW it's technically implemented.
- **Mermaid for all diagrams** — ALL business flows, interaction sequences, and cross-function flows MUST use Mermaid syntax (`flowchart TB`, `sequenceDiagram`). Plain text ASCII flowcharts are FORBIDDEN.

## Absolute Constraints

> **Violation = task failure**

**ABORT CONDITIONS:**
- PRD document missing → HARD STOP
- Template file missing → HARD STOP
- System overview missing → HARD STOP

1. **FORBIDDEN: Script execution failure** — If `update-progress.js` fails, HARD STOP and report error
2. **FORBIDDEN: Hand-written `.checkpoints.json`** — ALWAYS use `update-progress.js` script
3. **FORBIDDEN: Skip Checkpoint A** — User confirmation required before proceeding to design phase (unless `skip_analysis_checkpoint=true`)
4. **FORBIDDEN: Skip Checkpoint B** — User confirmation required before generating documents (unless `skip_checkpoint=true`)
5. **FORBIDDEN: Rename features** — Output filename MUST use the exact `feature_name` parameter value. DO NOT translate, abbreviate, paraphrase, or substitute with alternative names found in PRD content. The `feature_name` parameter is the SINGLE SOURCE OF TRUTH for file naming.

> **CRITICAL: Script Path Rule**
> ALL update-progress.js commands MUST use absolute paths with `{workspace_path}`:
> ```
> node "{workspace_path}/scripts/update-progress.js" update-task --file "{workspace_path}/iterations/..." ...
> ```
> NEVER use relative paths like `node scripts/update-progress.js` or `cd ... ; node scripts/...`
> The Worker may execute from project root directory, NOT from speccrew-workspace directory.

⛔ **ABSOLUTE PROHIBITION — Phase B Content Filling:**
- NEVER use `create_file` to rewrite or recreate the document after Step 5 skeleton creation
- NEVER abandon `search_replace` mid-way and switch to `create_file`
- Even if the document is very long, you MUST continue using `search_replace` for EVERY section
- Violation of this rule invalidates the entire output

**MANDATORY:**
- Template-first workflow — Step 5 (copy template) MUST precede Step 6 (fill content)
- **Mermaid for all diagrams** — ALL interaction flows, processing logic flows, and cross-function sequences MUST use Mermaid syntax (`sequenceDiagram`, `flowchart TD`). Plain text ASCII flowcharts are FORBIDDEN for these sections. Reference: `speccrew-workspace/docs/rules/mermaid-rule.md`.

**NOTE:** Analysis and design process is internal — no intermediate analysis or design-data files are produced.

**FORBIDDEN: Rename features** — Output filename MUST use the exact `feature_name` parameter value. DO NOT translate, abbreviate, paraphrase, or substitute with names derived from analysis content. The `feature_name` parameter is the SINGLE SOURCE OF TRUTH for file naming.

## Step 0: Input Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `prd_path` | Yes | Path to the Sub-PRD document |
| `feature_id` | No | Feature identifier (e.g., `F-CRM-01`) |
| `feature_name` | No | Feature name in English (e.g., `customer-list`) |
| `feature_type` | No | `Page+API` or `API-only` |
| `iteration_id` | No | Current iteration identifier |
| `frontend_platforms` | No | List of frontend platforms (auto-discover if not provided) |
| `skip_analysis_checkpoint` | No | Boolean, default `false`. Skip Checkpoint A if `true` (batch mode) |
| `skip_checkpoint` | No | Boolean, default `false`. Skip Checkpoint B if `true` (batch mode) |
| `output_path` | No | Custom output path for Feature Spec (auto-generated if not provided) |

## Step 0.1: Read PRD Input

### 0.1.1 Read PRD

Read the PRD document at `{prd_path}` (typically `speccrew-workspace/iterations/{number}-{type}-{name}/01.product-requirement/[module-name]-prd.md`)

### 0.1.2 Focus on Specific Feature (when feature_id provided)

If `feature_id` is provided:
- Locate the specific Feature in PRD Section 3.4 "Feature Breakdown"
- Extract only the user stories and requirements related to this Feature
- Ignore other Features in the same PRD

### 0.1.3 Backward Compatibility (when feature_id not provided)

If `feature_id` is NOT provided, process entire PRD using legacy mode.

## Step 0.2: Load System Knowledge

### 0.2.1 Read System Overview

Read: `speccrew-workspace/knowledges/bizs/system-overview.md`

### 0.2.2 Load Related Module Overviews

Based on PRD content, identify related modules and read:
```
speccrew-workspace/knowledges/bizs/{module-name}/{module-name}-overview.md
```

### 0.2.3 Discover Frontend Platforms

Read `speccrew-workspace/knowledges/techs/techs-manifest.json` to identify frontend platforms:

| Platform Type | Examples |
|---------------|----------|
| `web-*` | web-vue, web-react |
| `mobile-*` | mobile-uniapp, mobile-flutter |

- If `frontend_platforms` parameter provided, use that list
- Otherwise, read techs-manifest.json directly

### 0.2.4 Query Knowledge Graph (Optional)

If cross-module relationships need analysis, use `speccrew-knowledge-graph-query` skill.

## Step 0.3: Function Breakdown

Break down PRD functional requirements into implementable system functions.

### 0.3.1 Feature-Based Decomposition (when feature_id provided)

When processing a single Feature:

1. **Extract Feature Scope**: From PRD Section 3.4, locate the specific Feature by `feature_id`
2. **Identify Related User Stories**: Extract only user stories mapped to this Feature
3. **Decompose into Functions**: Break down into 3-8 focused Functions
4. **Check feature_type**: Mark `API-only` for backend-only design

### 0.3.2 Full PRD Decomposition (backward compatibility)

When `feature_id` is NOT provided (legacy mode):
- Decompose entire PRD into all required Functions
- May result in 10-20 Functions for complex modules

### 0.3.3 Function Analysis

For each function, identify:

| Aspect | Analysis Content |
|--------|------------------|
| **Frontend Changes** | New pages, components, or modifications to existing UI |
| **Backend Changes** | New interfaces or modifications to existing logic |
| **Data Changes** | New data structures or modifications to existing data |
| **System Relationship** | How this relates to existing system capabilities |

### Mark Relationship to Existing System

| Marker | Meaning | Example |
|--------|---------|---------|
| `[EXISTING]` | Reuse current system capability | `[EXISTING] User authentication system` |
| `[MODIFIED]` | Enhance/change existing feature | `[MODIFIED] Add validation to user profile form` |
| `[NEW]` | Create brand new functionality | `[NEW] Order management module` |

## Step 0.4: Checkpoint A — Function Breakdown Confirmation

**Conditional Execution:** If `skip_analysis_checkpoint=true`, skip user confirmation and proceed to Step 1.

If `skip_analysis_checkpoint=false` (default):
1. Present function breakdown with [EXISTING]/[MODIFIED]/[NEW] markers to user
2. Ask: "Does this function breakdown align with your understanding of the requirements?"
3. **HARD STOP** — Wait for user confirmation before proceeding

### Checkpoint A Progress Update

After user confirms (or if skipped):

```bash
node "{workspace_path}/scripts/update-progress.js" write-checkpoint \
  --file "{workspace_path}/iterations/{iteration_id}/02.feature-design/.checkpoints.json" \
  --stage 02_feature_design \
  --checkpoint function_decomposition \
  --passed true
```

Log: "✅ Checkpoint A (function_decomposition) passed and recorded"

### OUTPUT EFFICIENCY RULES

> **MANDATORY: Direct-to-File Output**
> 
> When generating Feature Spec content:
> - **DO NOT** display design content (wireframes, interaction flows, API specs, data models) in the conversation
> - **DO NOT** output intermediate design results as chat messages
> - **DO** think through the design internally, then write directly to the output file
> - **DO** only report brief status messages: "[Block X] Designing frontend for Function N..." 
> 
> **Rationale**: In batch mode, multiple Workers run simultaneously. Displaying full design content in chat wastes context window and creates confusion.
>
> **Allowed output in conversation**:
> - Block execution announcements (1 line each)
> - Error messages
> - Checkpoint confirmation requests (when not skipped)
> - Final completion summary (1-2 lines)
>
> **FORBIDDEN output in conversation**:
> - ASCII wireframes / UI prototypes
> - Mermaid diagrams (these go in the file only)
> - API endpoint lists
> - Data model tables
> - Full section content

## Step 1: Frontend Design

> ⚠️ **OUTPUT REMINDER**: Design content goes directly into the output file. DO NOT display wireframes or UI elements in conversation.

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

**Output format: Mermaid `sequenceDiagram`** — Generate interaction flows as Mermaid sequence diagrams showing: User → Frontend → Backend API → Data Store. DO NOT use ASCII text charts.

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

> ⚠️ **OUTPUT REMINDER**: Backend API designs go directly into the output file. DO NOT display API lists or processing logic in conversation.

> **CRITICAL CONSTRAINT**: Backend design in Feature Spec must remain at the BUSINESS API level:
> - Describe API endpoints as business operations (e.g., "Create Shop" operation with business parameters)
> - Describe business validation rules in plain language (e.g., "Shop name must be unique within tenant")
> - Describe data entities as business concepts with business field types (Text, Number, Date, Enum)
> - Do NOT include: Java class names, SQL statements, ORM mappings, framework annotations, Maven module paths

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

**Output format: Mermaid `flowchart TD`** — Generate processing logic as Mermaid flowcharts showing: business validation → data operation → response. DO NOT use ASCII text charts.

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

> ⚠️ **OUTPUT REMINDER**: Data models and business rules go directly into the output file. DO NOT display tables or validation rules in conversation.

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

6. **CRITICAL — Business Perspective Validation**: "Does the specification contain ONLY business concepts and rules? Verify there are NO:
   - ❌ File paths or code directory structures
   - ❌ Framework names or specific technologies (Java, MyBatis, Vue component names, etc.)
   - ❌ Actual code snippets or SQL statements
   - ❌ Component library names or framework-specific syntax
   - ❌ Database table/column names or technical data types
   If ANY of these are present, you MUST revise the affected sections to use pure business descriptions before proceeding."

**WAIT for user confirmation before proceeding to document generation.**

### 4.3 Update Checkpoints

After user confirms (or if skipped):

```bash
node "{workspace_path}/scripts/update-progress.js" write-checkpoint \
  --file "{workspace_path}/iterations/{iteration_id}/02.feature-design/.checkpoints.json" \
  --stage 02_feature_design \
  --checkpoint feature_design_review \
  --passed true
```

Log: "✅ Checkpoint B (feature_design_review) passed and recorded"

## Step 5: Determine Output Path & Copy Template

> **⚠️ CRITICAL: Two-Phase Strategy (Skeleton-First, Content-After)**
>
> Steps 5 and 6 MUST be executed in two phases to ensure consistent document structure.

### Phase A: Skeleton Construction (BEFORE any content filling)

1. Read FEATURE-SPEC-TEMPLATE.md to identify the complete section structure
2. Count the number of functions from Step 0.3 function breakdown results
3. For Section 2 Function Details, replicate the template's Function block structure for EACH function:
   - Copy the EXACT template structure (all 4 sub-sections) from FEATURE-SPEC-TEMPLATE.md
   - Create `### 2.1 Function: {function_name}` through `### 2.N Function: {function_name}`
   - Each function block MUST contain these 4 sub-section headers (copied from template):
     ```
     #### 2.N.1 Frontend Prototype
     [TO BE FILLED]
     
     #### 2.N.2 Interaction Flow
     [TO BE FILLED]
     
     #### 2.N.3 Backend Interface
     [TO BE FILLED]
     
     #### 2.N.4 Data Definition
     [TO BE FILLED]
     ```
4. Verify skeleton: confirm ALL functions have ALL 4 sub-section headers before proceeding

> ⚠️ DO NOT start filling content until the complete skeleton is verified.

### Phase B: Content Filling (AFTER skeleton is complete)

Fill each `[TO BE FILLED]` placeholder with actual content:
- **Frontend Prototype** → ASCII wireframes (Pattern A/B/C/M-A/M-B/M-C) + Interface Element Description table
- **Interaction Flow** → Mermaid `sequenceDiagram` + Interaction Rules table
- **Backend Interface** → Interface List table + Mermaid `flowchart TD` for Processing Logic + Data Access table
- **Data Definition** → Fields table + Data Source table

---

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

**CRITICAL — Filename Lock Rule:**
- `{feature_name}` in the output path MUST be the exact value of the `feature_name` parameter
- If analysis file uses a different name → use `feature_name` parameter for filename
- Example: parameter `feature_name = "店铺信息管理"` → filename MUST contain "店铺信息管理", NOT "shop-management" or "多店切换"

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

#### ⛔ HARD RULE — NO FULL-FILE REWRITE

Even if the document is very long or complex:
- You MUST use `search_replace` to fill each `[TO BE FILLED]` placeholder individually
- You MUST NOT use `create_file` to recreate the document
- You MUST NOT give up on `search_replace` and switch strategies mid-execution
- If a `search_replace` fails, fix the search pattern — do NOT fall back to `create_file`

This rule has ZERO exceptions. "Document too long" is NOT a valid reason to switch to `create_file`.

> **⚠️ CRITICAL: Section 2 Function Details Skeleton Verification**
>
> Before proceeding with content filling, verify the two-phase strategy was correctly applied:
> 1. Confirm ALL functions in Section 2 have complete 4 sub-section skeletons (Frontend Prototype, Interaction Flow, Backend Interface, Data Definition)
> 2. Confirm no `[TO BE FILLED]` placeholders remain unfilled after content filling
> 3. Confirm each function follows the exact template structure from FEATURE-SPEC-TEMPLATE.md

### Section Mapping Table

| Template Section | Data Source |
|------------------|-------------|
| 0. Feature Analysis Summary | Step 0.3 Function Breakdown results (internal memory) |
| 1. Overview (Basic Information, Feature Scope) | PRD Feature Information + Step 0 analysis summary |
| 1.3 Relationship to Existing System | Step 0.3 System Relationship markers |
| 2. Function Details | Step 1 Frontend Design + Step 2 Backend Design results (internal) |
| 2.1.x Frontend Prototype | Step 1.1 UI Prototype results |
| 2.1.x Interaction Flow | Step 1.3 Interaction Flow results |
| 2.1.x Backend Interface | Step 2.1-2.3 Backend Design results |
| 2.1.x Data Definition | Step 3.1-3.4 Data Model results |
| 3. Cross-Function Concerns | Step 2.4 Cross-Module results |
| 4. Business Rules & Constraints | Step 3.5-3.7 Business Rules results |
| 5. API Contract Summary | Aggregated from Step 2.1 API List |
| 6. Notes | Contextual notes from analysis |

**CRITICAL — Diagram Format Rule:**
- "交互流程" / "Interaction Flow" sections → MUST use Mermaid `sequenceDiagram`
- "核心业务逻辑" / "Processing Logic" sections → MUST use Mermaid `flowchart TD`
- "跨函数流程" / "Cross-Function Flow" sections → MUST use Mermaid `sequenceDiagram`
- Plain text / ASCII flowcharts are FORBIDDEN in these sections
- Reference: `speccrew-workspace/docs/rules/mermaid-rule.md` for syntax compliance

### Filling Rules

- Use `search_replace` for each section individually
- Preserve all section titles and numbering
- No applicable content → "N/A"
- Multi-platform: Create separate sub-sections per platform

⚠️ REMINDER: If you find yourself thinking "the document is too long, let me use create_file instead" — STOP. This is explicitly forbidden. Continue with search_replace.

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
node "{workspace_path}/scripts/update-progress.js" write-checkpoint \
  --file "{workspace_path}/iterations/{iteration_id}/02.feature-design/.checkpoints.json" \
  --stage 02_feature_design \
  --checkpoint feature_spec_review \
  --passed true
```

Log: "✅ Feature Spec generation completed. Checkpoint feature_spec_review passed."

## Step 9: Update Progress with Metadata

After generating the Feature Spec document, update the task in DISPATCH-PROGRESS.json with summary metadata:

```bash
node {workspace_path}/scripts/update-progress.js update-task \
  --file {dispatch_progress_path} \
  --task-id {feature_task_id} \
  --status completed \
  --metadata '{"function_count": X, "component_count": Y, "api_count": Z, "entity_count": W}'
```

Where:
- `function_count`: Number of functions defined in the Feature Spec
- `component_count`: Number of frontend components identified
- `api_count`: Number of API endpoints defined
- `entity_count`: Number of data entities defined

⚠️ This step is MANDATORY — the FD Agent relies on this metadata for batch summary in Phase 3c.

---

# Key Rules

| Rule | Description |
|------|-------------|
| **Business Perspective Only (Analysis)** | Feature Analysis describes business capabilities and functional requirements. Every section must describe WHAT from user/business perspective |
| No Technology Decisions | Do NOT specify frameworks, databases, technologies |
| Focus on WHAT not HOW | Describe what system does, not how it's implemented |
| ASCII Wireframes Only | Use ASCII art for UI prototypes |
| **FORBIDDEN: Analysis File Paths** | Do NOT include any file paths, code paths, or directory structures (e.g., views/appointment/AppointmentIndex.vue, yudao-module-appointment/...) |
| **FORBIDDEN: Framework Code in Analysis** | Do NOT include code snippets in any language — no Java classes, SQL DDL/DML, Vue templates, TypeScript API code, HTML markup, annotations (@PreAuthorize, @OperateLog, @TableLogic, @TableName) |
| **FORBIDDEN: Framework/Library Names in Analysis** | Do NOT reference specific framework/library names as implementation details (MyBatis-Plus, MapStruct, Element Plus, wot-design-uni, ElDatePicker, wd-cell, BaseMapperX, etc.) |
| **FORBIDDEN: Database Artifacts in Analysis** | Do NOT include database table names (appointment_info), column names (customer_id, staff_id), SQL types (BIGINT, VARCHAR), indexes, or any SQL statements |
| **FORBIDDEN: Technical Types in Analysis** | Do NOT use programming language types (Long, String, Integer). Use business types: Text, Number, Date, Boolean, Enum, Identifier |
| **FORBIDDEN: ASCII Diagrams in Analysis** | Do NOT use plain text or ASCII art flowcharts. ALL diagrams MUST use Mermaid syntax |
| **Mermaid Required** | Use `flowchart TB` for business process flows, `sequenceDiagram` for interaction flows. Reference mermaid-rule.md for syntax compliance |
| **FORBIDDEN: File Paths** | Do NOT include any file paths, code paths, or directory structures (e.g., src/views/..., yudao-module-base/..., pages/...) |
| **FORBIDDEN: Framework Code** | Do NOT include actual code snippets in any language — no Java classes, SQL DDL/DML, Vue templates, TypeScript API code, HTML markup |
| **FORBIDDEN: Framework Names as Implementation** | Do NOT reference specific framework/library names as implementation choices (MyBatis-Plus, Flyway, Element Plus component names like el-button, wot-design-uni widget names like wd-cell) |
| **FORBIDDEN: Technical Types** | Do NOT use database column types (VARCHAR, BIGINT, INT), Java types (Long, String), or ORM annotations (@TableName, @TableId). Use business types: Text, Number, Date, Boolean, Enum |
| **FORBIDDEN: Component Names** | Do NOT reference UI component library element names (ElDatePicker, ElMessageBox, wd-date-time-picker). Describe interaction behavior instead |
| **FORBIDDEN: Database Artifacts** | Do NOT include table names, column names, index names, or any SQL statements. Use conceptual entity names and business field names |
| **Business Perspective Priority** | Feature Spec is a BUSINESS document. Every section must describe WHAT from a user/business perspective, never HOW from a technical implementation perspective |
| Mermaid Compatibility | Follow mermaid-rule.md guidelines |
| Clear Markers | Use [EXISTING]/[MODIFIED]/[NEW] consistently |
| Template-First | Copy template before filling content |
| search_replace Only | Never use create_file for section updates after template copy |
| Checkpoint A | Get user confirmation on function breakdown before design (unless skipped) |
| Checkpoint B | Get user confirmation before writing files (unless skipped) |
| No Intermediate Files | Analysis and design process is internal — do NOT output any intermediate analysis or design-data artifacts |

# Checklist

- [ ] PRD has been read, all P0 requirements covered
- [ ] **[Single Feature Mode]** Feature ID and name parameters received
- [ ] **[Single Feature Mode]** Only related Feature content extracted from PRD
- [ ] **[Legacy Mode]** All sub PRDs have been read (if master-sub structure)
- [ ] System overview loaded for context
- [ ] Related module overviews loaded
- [ ] **[Cross-module]** Knowledge graph queried for relationship analysis
- [ ] Function breakdown completed with [EXISTING]/[MODIFIED]/[NEW] markers
- [ ] **[Single Feature Mode]** 3-8 focused Functions defined
- [ ] Checkpoint A passed: function breakdown confirmed with user (or skipped)
- [ ] `.checkpoints.json` updated via script for Checkpoint A
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
- [ ] Phase B used ONLY search_replace (no create_file after Step 5)
- [ ] **[CRITICAL]** Section 2 Function Details skeleton verified (all functions have 4 sub-sections)
- [ ] **[CRITICAL]** Interaction Flow uses Mermaid sequenceDiagram (NOT ASCII)
- [ ] **[CRITICAL]** Processing Logic uses Mermaid flowchart TD (NOT ASCII)
- [ ] All Mermaid diagrams follow mermaid-rule.md compliance rules
- [ ] `.checkpoints.json` updated via script
- [ ] **CRITICAL**: DISPATCH-PROGRESS.json updated with metadata (function_count, component_count, api_count, entity_count)
- [ ] No technology decisions included
- [ ] No intermediate design-data artifact created
- [ ] **CRITICAL — Business Content Only**: Verify ALL sections use business-level descriptions. Zero tolerance for: file paths, code snippets, SQL, framework names, component names, technical types
