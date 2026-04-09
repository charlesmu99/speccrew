---
name: speccrew-fd-feature-design
description: Feature Design SOP. Guide Feature Designer Agent to transform PRD requirements into system feature specifications, including frontend prototypes, backend interface logic, and data model design. Does not involve specific technology implementation details. Use when Feature Designer needs to create feature spec from confirmed PRD.
tools: Read, Write, Glob, Grep
---

# Trigger Scenarios

- PRD has been confirmed, user requests to start feature design
- User asks "Design this feature" or "Create feature specification" or "How should this feature work"
- Feature Designer Agent receives task to design system features from PRD

# Workflow

## Absolute Constraints

> **These rules apply to ALL steps. Violation = task failure.**

1. **FORBIDDEN: `create_file` for documents** — NEVER use `create_file` to write the feature spec document. Documents MUST be created by copying the template (Step 10.2a) then filling sections with `search_replace` (Step 10.2b). `create_file` produces truncated output on large files.

2. **FORBIDDEN: Full-file rewrite** — NEVER replace the entire document content in a single operation. Always use targeted `search_replace` on specific sections.

3. **MANDATORY: Template-first workflow** — Step 10.2a (copy template) MUST execute before Step 10.2b (fill sections). Skipping Step 10.2a and writing content directly is FORBIDDEN.

## Step 1: Read PRD Input

### 1.1 Input Parameters

The skill receives the following parameters from the calling agent:

| Parameter | Required | Description |
|-----------|----------|-------------|
| `feature_id` | No | Feature identifier (e.g., `F-CRM-01`). If not provided, processes entire PRD (backward compatibility) |
| `feature_name` | No | Feature name in English (e.g., `customer-list`). Used for file naming |
| `feature_type` | No | `Page+API` or `API-only`. `API-only` skips frontend design steps |
| `iteration_id` | No | Current iteration identifier. Paths come from `prd_path`/`output_path`; `iteration_id` is used only for progress messages when available |
| `prd_path` | Yes | Path to the Sub-PRD document |

### 1.2 Read PRD

Read in order:

1. **Current iteration PRD**: `{prd_path}` (typically `speccrew-workspace/iterations/{number}-{type}-{name}/01.product-requirement/[module-name]-prd.md`)
2. **Feature spec template**: `speccrew-fd-feature-design/templates/FEATURE-SPEC-TEMPLATE.md`

### 1.3 Focus on Specific Feature (when feature_id provided)

If `feature_id` is provided:
- Locate the specific Feature in PRD Section 3.4 "Feature Breakdown"
- Extract only the user stories and requirements related to this Feature
- Ignore other Features in the same PRD
- Use the Feature's scope to guide function breakdown

### 1.4 Backward Compatibility (when feature_id not provided)

If `feature_id` is NOT provided, process entire PRD using legacy mode. For Master-Sub PRD structure, read master PRD and all sub PRDs. See Reference Guides for detailed behavior.

## Step 2: Load System Knowledge

### 2.1 Read System Overview

Read the file to understand system context:
```
speccrew-workspace/knowledges/bizs/system-overview.md
```

### 2.2 Load Related Module Overviews

Based on PRD content, identify related modules and read their overview files:
```
speccrew-workspace/knowledges/bizs/{module-name}/{module-name}-overview.md
```

### 2.2b Discover Frontend Platforms

Read `speccrew-workspace/knowledges/techs/techs-manifest.json` to identify frontend platforms:

| Platform Type | Examples | Design Implications |
|---------------|----------|---------------------|
| `web-*` | web-vue, web-react | Desktop-width layouts, tables, modals, sidebars |
| `mobile-*` | mobile-uniapp, mobile-flutter | Compact layouts, card lists, bottom nav, swipe actions |

- If `frontend_platforms` parameter is provided by the agent, use that list
- Otherwise, read techs-manifest.json directly
- Store the platform list for use in Step 5

### 2.3 Query Knowledge Graph (Optional)

If cross-module relationships need analysis, use `speccrew-knowledge-graph-query` skill:

| Action | Use Case |
|--------|----------|
| `query-nodes` | Find all nodes in a module |
| `search` | Find related entities by keyword |
| `trace-upstream` | Impact analysis for existing entities |
| `trace-downstream` | Dependency analysis |

## Step 3: Function Breakdown

Break down PRD functional requirements into implementable system functions.

### 3.1 Feature-Based Decomposition (when feature_id provided)

When processing a single Feature:

1. **Extract Feature Scope**: From PRD Section 3.4, locate the specific Feature by `feature_id`
2. **Identify Related User Stories**: Extract only user stories mapped to this Feature
3. **Decompose into Functions**: Break down into 3-8 focused Functions (not 10-20)
4. **Check feature_type**:
   - If `feature_type = API-only`: Mark for backend-only design (skip frontend in Step 5)
   - If `feature_type = Page+API`: Include both frontend and backend design

### 3.2 Full PRD Decomposition (backward compatibility)

When `feature_id` is NOT provided (legacy mode):
- Decompose entire PRD into all required Functions
- May result in 10-20 Functions for complex modules

### 3.3 Function Analysis

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

**Checkpoint A: Present function breakdown to user for confirmation before proceeding.**

Ask: "Here is the function breakdown with [EXISTING]/[MODIFIED]/[NEW] markers. Does this align with your understanding of the requirements?"

### Checkpoint A Progress Update

After user confirms the function breakdown:

1. **Write/Update `.checkpoints.json`**:
   - Path: `speccrew-workspace/iterations/{iteration-id}/02.feature-design/.checkpoints.json`
   - Content:
     ```json
     {
       "stage": "02_feature_design",
       "checkpoints": {
         "function_decomposition": {
           "passed": true,
           "confirmed_at": "{current_timestamp}",
           "description": "Function decomposition confirmed"
         },
         "feature_spec_review": {
           "passed": false,
           "confirmed_at": null
         },
         "api_contract_joint": {
           "passed": false,
           "confirmed_at": null
         }
       }
     }
     ```

2. If the file already exists, merge with existing content (preserve other checkpoints)

3. Log: "✅ Checkpoint A (function_decomposition) passed and recorded"

## Step 4: Determine Output Structure

### 4.1 Single Feature Output (when feature_id provided)

When processing a single Feature:

| Output | Description |
|--------|-------------|
| **Single File** | One Feature Spec document for this Feature only |
| **File Naming** | `[feature-id]-[feature-name]-feature-spec.md` |
| **Example** | `F-CRM-01-customer-list-feature-spec.md` |

**No Master-Sub structure** for single Feature mode.

### 4.2 Legacy Output (backward compatibility)

When `feature_id` is NOT provided:

| PRD Structure | Feature Spec Structure |
|---------------|------------------------|
| **Single PRD** | Single Feature Spec |
| **Master-Sub PRD** | Master Feature Spec + Sub Feature Specs (one per module) |

#### Master Feature Spec Structure (Legacy)

```
02.feature-design/
├── [feature-name]-feature-spec.md          # Master Feature Spec (overview + cross-module)
├── [feature-name]-sub-[module1]-spec.md    # Sub Feature Spec: Module 1
├── [feature-name]-sub-[module2]-spec.md    # Sub Feature Spec: Module 2
└── ...
```

**Master Feature Spec MUST include:**
- Overall feature overview and goals
- Cross-module interaction diagram
- Module list with scope boundaries
- Cross-module interface contracts
- Shared data structures

**Each Sub Feature Spec covers ONE module:**
- Module-specific frontend design
- Module-specific backend interfaces
- Module-internal data model
- Interface contracts with other modules

## Step 5: Frontend Design (Per Function)

### 5.0 Conditional Execution Based on feature_type

**Execution Logic:**
```
IF feature_type = "Page+API" THEN
  → Execute Step 5 (Full frontend design)
IF feature_type = "API-only" THEN
  → Skip Step 5 entirely (No frontend design needed)
IF feature_type is NOT provided THEN
  → Execute Step 5 (backward compatibility)
```

**Multi-Platform Rule**: If multiple frontend platforms are identified, repeat the frontend design (5.1 UI Prototype + 5.2 Interface Elements + 5.3 Interaction Flow) for EACH platform. Use platform-specific section headers:

| Platforms | Section Structure |
|-----------|-------------------|
| Single platform | `#### 2.N.1 Frontend Prototype` (as-is) |
| Multiple platforms | `#### 2.N.1 Frontend Prototype - Web` + `#### 2.N.1b Frontend Prototype - Mobile` |

**Mobile-specific wireframe patterns:**

> **Note**: These are ASCII wireframe design specifications, NOT actual template files in the `templates/` directory.

```
Pattern M-A: Card List (replaces PC table list)
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
|                                  |
|  [Load More / Pull to Refresh]   |
+----------------------------------+
|  [Tab1] [Tab2] [Tab3] [Tab4]    |
+----------------------------------+

Pattern M-B: Mobile Form (replaces PC wide form)
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

Pattern M-C: Action Sheet (replaces PC modal)
+----------------------------------+
| (dimmed background)              |
|                                  |
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

For each function requiring frontend changes:

### 5.1 UI Prototype

Create ASCII wireframes showing:
- Page/component layout
- Key UI elements and their positions
- Navigation structure

**Example ASCII Wireframe:**
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

### 5.2 Interface Element Descriptions

| Element | Type | Behavior |
|---------|------|----------|
| {element name} | {component type} | {description of behavior} |

### 5.3 Interaction Flow

Document user actions and system responses:

```
User Action → Frontend Response → Backend API Call
```

**Example:**
```
1. User clicks "New User" button
   → Frontend displays modal form
   → No API call yet

2. User fills form and clicks "Save"
   → Frontend validates input
   → Calls POST /api/users
   → On success: closes modal, refreshes list
   → On error: displays error message
```

### 5.4 Backend API Mapping

| Frontend Action | Backend API | Purpose |
|-----------------|-------------|---------|
| {action} | {API endpoint} | {what data is exchanged} |

## Step 6: Backend Design (Per Function)

For each function requiring backend changes:

### 6.1 API/Interface List

| Interface | Method | Description |
|-----------|--------|-------------|
| {name} | {GET/POST/PUT/DELETE} | {purpose, no technical implementation details} |

### 6.2 Processing Logic Flow

For each interface, document:

| Stage | Description |
|-------|-------------|
| **Input Validation** | What business rules validate the input |
| **Business Logic** | Core processing steps (conceptual, not code) |
| **Data Operations** | What data to read/write |
| **Response** | What data to return |

**Example:**
```
Interface: Create Order

Input Validation:
- User must be authenticated
- Product must be available
- Quantity must be positive

Business Logic:
1. Check product inventory
2. Calculate total price
3. Create order record
4. Reserve inventory

Data Operations:
- Read: product info, inventory count
- Write: order record, inventory reservation

Response:
- Order ID, status, estimated delivery
```

### 6.3 Data Access Scheme

| Operation | Data Target | Type |
|-----------|-------------|------|
| Read | {existing/new data} | [EXISTING]/[NEW] |
| Write | {existing/new data} | [EXISTING]/[NEW] |

### 6.4 Cross-Module Interactions

**[Cross-module functions only]**

| This Module | Interacts With | Interface | Data Exchanged |
|-------------|----------------|-----------|----------------|
| {module} | {other module} | {API/Event} | {what data} |

## Step 7: Data Model Design

### 7.1 New Data Structures

For each new entity:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| {field name} | {data type} | {required/unique/etc} | {purpose} |

### 7.2 Modifications to Existing Data Structures

| Entity | Change Type | Details | Impact |
|--------|-------------|---------|--------|
| {entity} | Add field / Modify field / Remove field | {description} | {affected areas} |

### 7.3 Data Relationships

**New Entity Relationships:**
```
EntityA --1:N--> EntityB
EntityA --N:1--> EntityC
```

**Relationships with Existing Entities:**
| New Entity | Existing Entity | Relationship |
|------------|-----------------|--------------|
| {new} | {existing} | {1:1 / 1:N / N:M} |

### 7.4 Data Source Descriptions

| Data | Source | Update Frequency |
|------|--------|------------------|
| {data item} | {internal system / external API / user input} | {real-time / periodic / on-demand} |

## Step 8: Business Rules and Constraints

### 8.1 Permission Rules

| Function | Required Permission | Scope |
|----------|---------------------|-------|
| {function} | {permission name} | {global / module-specific / resource-specific} |

### 8.2 Business Logic Rules

| Rule ID | Description | Trigger | Action |
|---------|-------------|---------|--------|
| BR-{number} | {rule description} | {when it applies} | {what happens} |

### 8.3 Validation Rules

| Field | Frontend Validation | Backend Validation |
|-------|---------------------|---------------------|
| {field} | {client-side rules} | {server-side rules} |

## Step 9: Present Complete Feature Spec for Confirmation (Checkpoint B)

Present summary to user before writing files:

### Summary Structure

```
Feature Design Summary for: {feature-name}

Functions Designed: {count}
├── [EXISTING] {count} functions reuse existing capabilities
├── [MODIFIED] {count} functions enhance existing features
└── [NEW] {count} functions are brand new

Frontend Components: {count} pages/components
Backend Interfaces: {count} APIs
Data Entities: {count} new, {count} modified

Output File: {filename}
```

**Ask user to confirm:**
1. Is the frontend prototype appropriate for user needs? (if applicable)
2. Is the backend logic flow correct and complete?
3. Is the data model reasonable and extensible?
4. Are all business rules and constraints captured?
5. **[Legacy Master-Sub]** Is the module breakdown appropriate?

### Checkpoint B Progress Update

After user confirms the complete feature spec:

1. **Update `.checkpoints.json`**:
   - Path: `speccrew-workspace/iterations/{iteration-id}/02.feature-design/.checkpoints.json`
   - Update content:
     ```json
     {
       "stage": "02_feature_design",
       "checkpoints": {
         "function_decomposition": {
           "passed": true,
           "confirmed_at": "..."
         },
         "feature_spec_review": {
           "passed": true,
           "confirmed_at": "{current_timestamp}",
           "description": "Feature specification confirmed"
         },
         "api_contract_joint": {
           "passed": false,
           "confirmed_at": null
         }
       }
     }
     ```

2. Preserve `function_decomposition` checkpoint status when updating

3. Log: "✅ Checkpoint B (feature_spec_review) passed and recorded"

## Step 10: Write Files

### 10.1 Determine Output Paths

#### Single Feature Mode (when feature_id provided)

```
speccrew-workspace/iterations/{number}-{type}-{name}/02.feature-design/{feature-id}-{feature-name}-feature-spec.md
```

**Naming Rules:**
- `feature-id`: As provided in input (e.g., `F-CRM-01`)
- `feature-name`: Converted to kebab-case (lowercase with hyphens)
- **Example**: `F-CRM-01-customer-list-feature-spec.md`

#### Legacy Mode (backward compatibility)

**Single Feature Spec:**
```
speccrew-workspace/iterations/{number}-{type}-{name}/02.feature-design/[feature-name]-feature-spec.md
```

**Master-Sub Feature Specs:**
```
speccrew-workspace/iterations/{number}-{type}-{name}/02.feature-design/
├── [feature-name]-feature-spec.md
├── [feature-name]-sub-[module1]-spec.md
├── [feature-name]-sub-[module2]-spec.md
└── ...
```

If the iteration directory does not exist, refer to the `000-sample` directory structure to create it.

### 10.2a Copy Template to Document Path

1. **Read the template file**: `templates/FEATURE-SPEC-TEMPLATE.md`
2. **Replace top-level placeholders** in the template content:
   - `{Feature Name}` → actual feature name
   - Other top-level identifiers from PRD input
3. **Create the document file** using `create_file`:
   - Target path: determined in Step 10.1
   - Content: Template with top-level placeholders replaced
4. **Verify**: Document should have complete section structure ready for filling

### 10.2b Fill Each Section Using search_replace

Fill each section of the document with actual data from analysis steps.

> ⚠️ **CRITICAL CONSTRAINTS:**
> - **FORBIDDEN: `create_file` to rewrite the entire document** — it destroys template structure
> - **MUST use `search_replace` to fill each section individually**
> - **All section titles and numbering MUST be preserved** — do not delete or renumber
> - If a section has no applicable content, keep the section title and replace placeholder with "N/A"

**Section Filling Order:**

Fill sections sequentially using `search_replace` for each content block:

| Section | Content Source |
|---------|---------------|
| **Feature Overview** | One paragraph explaining what this feature does |
| **Function Breakdown** | All functions with [EXISTING]/[MODIFIED]/[NEW] markers |
| **Frontend Design** | ASCII wireframes, interaction flows, API mapping |
| **Backend Design** | Interface list, logic flows, data access schemes |
| **Data Model** | Entity definitions, relationships, modifications |
| **Business Rules** | Permissions, validation, business logic rules |
| **Cross-Module Interactions** | **[If applicable]** Interface contracts between modules |

For legacy Master-Sub specs (when feature_id not provided), repeat Step 10.2a + 10.2b for each sub-spec document.

### 10.3 Mermaid Diagram Requirements

When generating Mermaid diagrams (architecture diagrams, flow diagrams, etc.), you **MUST** follow the compatibility guidelines defined in:
- **Reference**: `speccrew-workspace/docs/rules/mermaid-rule.md`

Key requirements:
- Use only basic node definitions: `A[text content]`
- No HTML tags (e.g., `<br/>`)
- No nested subgraphs
- No `direction` keyword
- No `style` definitions
- No special characters in node text
- Use standard `graph TB/LR` or `sequenceDiagram` syntax only

### 10.4 Call API Contract Skill

After feature spec documents are complete, call `speccrew-fd-api-contract/SKILL.md` to generate API contract document.

### 10.5 Multi-Platform Dispatch Progress Management

**For multi-platform feature design (multiple frontend platforms):**

#### 10.5.1 Pre-Dispatch: Check Resume State

Before dispatching to multiple platforms:

1. **Read existing `DISPATCH-PROGRESS.json`**:
   - Path: `speccrew-workspace/iterations/{iteration-id}/02.feature-design/DISPATCH-PROGRESS.json`
   - If exists, analyze task status:
     ```json
     {
       "stage": "02_feature_design",
       "total": 3,
       "completed": 2,
       "failed": 0,
       "pending": 1,
       "tasks": [
         {
           "id": "fd-web-vue",
           "platform": "web-vue",
           "skill": "speccrew-fd-feature-design",
           "status": "completed",
           "started_at": "...",
           "completed_at": "...",
           "output": "02.feature-design/[feature]-web-vue-feature-spec.md",
           "error": null
         }
       ]
     }
     ```

2. **Resume Strategy**:
   - Skip tasks with `status == "completed"`
   - Re-execute tasks with `status == "failed"`
   - Execute tasks with `status == "pending"`

#### 10.5.2 Initialize/Update Dispatch Progress

Create or update `DISPATCH-PROGRESS.json` before starting dispatch:

```json
{
  "stage": "02_feature_design",
  "total": {count},
  "completed": 0,
  "failed": 0,
  "pending": {count},
  "tasks": [
    {
      "id": "fd-{platform}",
      "platform": "{platform}",
      "skill": "speccrew-fd-feature-design",
      "status": "pending",
      "started_at": null,
      "completed_at": null,
      "output": null,
      "error": null
    }
  ]
}
```

#### 10.5.3 Update Task Status on Completion

After each worker completes:

1. **Read current `DISPATCH-PROGRESS.json`**

2. **Update the corresponding task entry**:
   - On success:
     ```json
     {
       "status": "completed",
       "completed_at": "{timestamp}",
       "output": "{output_file_path}"
     }
     ```
   - On failure:
     ```json
     {
       "status": "failed",
       "completed_at": "{timestamp}",
       "error": "{error_message}"
     }
     ```

3. **Update summary counters** (`completed`, `failed`, `pending`)

4. **Write updated `DISPATCH-PROGRESS.json`**

5. Log progress: "📊 Dispatch progress: {completed}/{total} completed, {failed} failed, {pending} pending"

---

# Reference Guides

## Backward Compatibility Details (Legacy Mode)

When `feature_id` is NOT provided, the skill operates in legacy mode:

### Master-Sub PRD Structure

If master PRD exists, also read all sub PRDs:
- Master PRD: `[feature-name]-prd.md`
- Sub PRDs: `[feature-name]-sub-[module1].md`, `[feature-name]-sub-[module2].md`, etc.

### Output Structure (Legacy)

**Single Feature Spec:**
```
speccrew-workspace/iterations/{number}-{type}-{name}/02.feature-design/[feature-name]-feature-spec.md
```

**Master-Sub Feature Specs:**
```
02.feature-design/
├── [feature-name]-feature-spec.md          # Master Feature Spec (overview + cross-module)
├── [feature-name]-sub-[module1]-spec.md    # Sub Feature Spec: Module 1
├── [feature-name]-sub-[module2]-spec.md    # Sub Feature Spec: Module 2
```

**Master Feature Spec MUST include:**
- Overall feature overview and goals
- Cross-module interaction diagram
- Module list with scope boundaries
- Cross-module interface contracts
- Shared data structures

---

# Key Rules

| Rule | Description |
|------|-------------|
| **No Technology Decisions** | Do NOT specify frameworks, databases, or implementation technologies |
| **Focus on WHAT not HOW** | Describe what the system does, not how it's technically implemented |
| **ASCII Wireframes Only** | Use ASCII art for UI prototypes, not specific design tools |
| **Mermaid Compatibility** | All diagrams must follow mermaid-rule.md guidelines |
| **Clear Markers** | Always use [EXISTING]/[MODIFIED]/[NEW] to indicate system relationship |
| **Checkpoint Before Write** | Always get user confirmation at Checkpoint B before writing files |

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
- [ ] Checkpoint A passed: function breakdown confirmed with user
- [ ] Output structure determined (single file for Feature mode)
- [ ] **[API-only]** Frontend design step skipped correctly
- [ ] **[Page+API]** Frontend design includes ASCII wireframes and interaction flows
- [ ] **[Multi-platform]** Each frontend platform has separate wireframes and interaction flows
- [ ] Backend design includes interface list and logic flows
- [ ] Data model includes new entities and modifications to existing
- [ ] Business rules and constraints documented
- [ ] Checkpoint B passed: complete feature spec confirmed with user
- [ ] **[Legacy Master-Sub]** Master spec includes cross-module overview and contracts
- [ ] **[Legacy Master-Sub]** Each sub spec covers exactly one module
- [ ] All Mermaid diagrams follow mermaid-rule.md
- [ ] No specific technology decisions included
- [ ] Files written to correct paths with proper naming (`{feature-id}-{feature-name}-feature-spec.md`)
- [ ] API contract skill called after writing
