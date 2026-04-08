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

Read in order:

1. **Current iteration PRD**: `speccrew-workspace/iterations/{number}-{type}-{name}/01.product-requirement/[feature-name]-prd.md`
2. **Feature spec template**: `speccrew-fd-feature-design/templates/FEATURE-SPEC-TEMPLATE.md`

**[Master-Sub PRD structure]** If master PRD exists, also read all sub PRDs:
- Master PRD: `[feature-name]-prd.md`
- Sub PRDs: `[feature-name]-sub-[module1].md`, `[feature-name]-sub-[module2].md`, etc.

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

## Step 4: Determine Output Structure

Based on PRD structure, determine feature spec output structure:

| PRD Structure | Feature Spec Structure |
|---------------|------------------------|
| **Single PRD** | Single Feature Spec |
| **Master-Sub PRD** | Master Feature Spec + Sub Feature Specs (one per module) |

### Master Feature Spec Structure

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

**Multi-Platform Rule**: If multiple frontend platforms are identified, repeat the frontend design (5.1 UI Prototype + 5.2 Interface Elements + 5.3 Interaction Flow) for EACH platform. Use platform-specific section headers:

| Platforms | Section Structure |
|-----------|-------------------|
| Single platform | `#### 2.N.1 Frontend Prototype` (as-is) |
| Multiple platforms | `#### 2.N.1 Frontend Prototype - Web` + `#### 2.N.1b Frontend Prototype - Mobile` |

**Mobile-specific wireframe patterns:**

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

[Master-Sub] Output Structure:
- Master Feature Spec: {filename}
- Sub Feature Specs: {list of filenames}
```

**Ask user to confirm:**
1. Is the frontend prototype appropriate for user needs?
2. Is the backend logic flow correct and complete?
3. Is the data model reasonable and extensible?
4. Are all business rules and constraints captured?
5. **[Master-Sub]** Is the module breakdown appropriate?

## Step 10: Write Files

### 10.1 Determine Output Paths

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

For Master-Sub specs, repeat Step 10.2a + 10.2b for each sub-spec document.

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
- [ ] **[Master-Sub]** All sub PRDs have been read
- [ ] System overview loaded for context
- [ ] Related module overviews loaded
- [ ] **[Cross-module]** Knowledge graph queried for relationship analysis
- [ ] Function breakdown completed with [EXISTING]/[MODIFIED]/[NEW] markers
- [ ] Checkpoint A passed: function breakdown confirmed with user
- [ ] Output structure determined (single vs master-sub)
- [ ] Frontend design includes ASCII wireframes and interaction flows
- [ ] **[Multi-platform]** Each frontend platform has separate wireframes and interaction flows
- [ ] Backend design includes interface list and logic flows
- [ ] Data model includes new entities and modifications to existing
- [ ] Business rules and constraints documented
- [ ] Checkpoint B passed: complete feature spec confirmed with user
- [ ] **[Master-Sub]** Master spec includes cross-module overview and contracts
- [ ] **[Master-Sub]** Each sub spec covers exactly one module
- [ ] All Mermaid diagrams follow mermaid-rule.md
- [ ] No specific technology decisions included
- [ ] Files written to correct paths
- [ ] API contract skill called after writing
