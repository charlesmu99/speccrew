---
name: speccrew-fd-feature-design
description: Feature Design SOP. Transforms function decomposition into complete feature specifications including frontend prototypes, backend interface logic, and data model design. Reads .feature-analysis.md as input and outputs .feature-design-data.md as interface contract for downstream generate skill. Does not involve specific technology implementation details.
tools: Read, Write, Glob, Grep
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
- User requests feature specifications design

# Workflow

## Absolute Constraints

**ABORT CONDITIONS:** `.feature-analysis.md` does not exist OR Checkpoint A not passed → HARD STOP

**FORBIDDEN:** `create_file` for final feature-spec documents (use template + search_replace in generate skill)

## Step 0: Precondition Check

**MANDATORY:** Verify `.feature-analysis.md` exists.

**IF missing → ABORT:** `ERROR: .feature-analysis.md not found. Run speccrew-fd-feature-analysis first.`

**Actions:**
1. Read `.feature-analysis.md`
2. Verify Checkpoint A: `function_decomposition.passed == true`
3. IF not passed → STOP
4. Extract: feature_id, feature_name, feature_type, functions[], platforms[]

## Step 1: Determine Output Structure

### 1.1 Single Feature Output (when feature_id provided)

| Output | File Naming | Example |
|--------|-------------|---------|
| Single File | `{feature-id}-{feature-name}.feature-design-data.md` | `F-CRM-01-customer-list.feature-design-data.md` |

### 1.2 Legacy Output (backward compatibility)

When `feature_id` is NOT provided: Single PRD → Single file; Master-Sub PRD → Master + Sub files

**Master Design Data MUST include:** overall overview, cross-module diagram, module boundaries, interface contracts, shared data structures.

## Step 2: Frontend Design (Per Function)

### 2.0 Conditional Execution

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

### 2.1 UI Prototype

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

### 2.2 Interface Element Descriptions

| Element | Type | Behavior |
|---------|------|----------|
| {name} | {component type} | {behavior description} |

### 2.3 Interaction Flow

Document: `User Action → Frontend Response → Backend API Call`

> **ISA-95 Stage 4 Thinking — Information Flows**
> - Cross-module flows: Map data flows between feature and other modules
> - Sequence coverage: Complete chain user→frontend→backend→database→external
> - Interface identification: Every data exchange point = potential API endpoint
> - Exception flows: Document alternative paths, not just happy path

### 2.4 Backend API Mapping

| Frontend Action | Backend API | Purpose |
|-----------------|-------------|---------|
| {action} | {API endpoint} | {data exchanged} |

## Step 3: Backend Design (Per Function)

### 3.1 API/Interface List

| Interface | Method | Description |
|-----------|--------|-------------|
| {name} | {GET/POST/PUT/DELETE} | {purpose} |

### 3.2 Processing Logic Flow

| Stage | Description |
|-------|-------------|
| Input Validation | Business rules validating input |
| Business Logic | Core processing steps (conceptual) |
| Data Operations | What data to read/write |
| Response | What data to return |

### 3.3 Data Access Scheme

| Operation | Data Target | Type |
|-----------|-------------|------|
| Read | {data} | [EXISTING]/[NEW] |
| Write | {data} | [EXISTING]/[NEW] |

### 3.4 Cross-Module Interactions

| This Module | Interacts With | Interface | Data Exchanged |
|-------------|----------------|-----------|----------------|
| {module} | {other module} | {API/Event} | {what data} |

## Step 4: Data Model Design

### 4.1 New Data Structures

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| {field} | {data type} | {required/unique} | {purpose} |

> **ISA-95 Stage 5 Thinking — Categories of Information**
> - Classification: Categorize data (master, transactional, reference, computed)
> - Dictionary rigor: Every field needs name, type, constraints, semantic description
> - Semantic consistency: Align with domain glossary
> - Relationships: Identify core relationships (1:1, 1:N, N:N)

### 4.2 Modifications to Existing Data Structures

| Entity | Change Type | Details | Impact |
|--------|-------------|---------|--------|
| {entity} | Add/Modify/Remove field | {description} | {affected areas} |

### 4.3 Data Relationships

**New Relationships:** `EntityA --1:N--> EntityB`

| New Entity | Existing Entity | Relationship |
|------------|-----------------|--------------|
| {new} | {existing} | {1:1 / 1:N / N:M} |

### 4.4 Data Source Descriptions

| Data | Source | Update Frequency |
|------|--------|------------------|
| {item} | {internal/external/user} | {real-time/periodic/on-demand} |

## Step 5: Business Rules and Constraints

> **ISA-95 Stage 6 Thinking — Information Descriptions**
> - Validation: Field-level, cross-field, business logic rules
> - Output standards: Format specifications for downstream API Contract
> - Permissions: Data access rules mapping to API authorization
> - Traceability: Every rule traces back to PRD requirement

### 5.1 Permission Rules

| Function | Required Permission | Scope |
|----------|---------------------|-------|
| {function} | {permission} | {global/module/resource-specific} |

### 5.2 Business Logic Rules

| Rule ID | Description | Trigger | Action |
|---------|-------------|---------|--------|
| BR-{number} | {description} | {when applies} | {what happens} |

### 5.3 Validation Rules

| Field | Frontend Validation | Backend Validation |
|-------|---------------------|---------------------|
| {field} | {client rules} | {server rules} |

## Step 6: Write Output Contract

Write to `{feature-id}-{feature-name}.feature-design-data.md`:

```markdown
# Feature Design Data: {feature-name}

## Output Structure
- Mode: {single-feature/legacy-master-sub}
- Output path: {planned path}

## Frontend Design
### Platforms: {list}
### UI Prototypes
[Per-platform ASCII wireframes]
### Interface Elements
[Element tables]
### Interaction Flows
[Mermaid diagrams + descriptions]
### Backend API Mapping
[Action → API mapping tables]

## Backend Design
### API/Interface List
[Interface tables]
### Processing Logic
[Logic flows]
### Data Access Scheme
[Operation tables]
### Cross-Module Interactions
[Cross-module tables]

## Data Model
### New Data Structures
[Entity field tables]
### Modified Data Structures
[Modification tables]
### Data Relationships
[Relationship diagrams]
### Data Sources
[Source tables]

## Business Rules
### Permission Rules
[Permission tables]
### Business Logic Rules
[Rule tables with BR-{number} IDs]
### Validation Rules
[Validation tables]
```

---

# Key Rules

| Rule | Description |
|------|-------------|
| No Technology Decisions | Do NOT specify frameworks, databases, technologies |
| Focus on WHAT not HOW | Describe what system does, not how it's implemented |
| ASCII Wireframes Only | Use ASCII art for UI prototypes |
| Mermaid Compatibility | Follow mermaid-rule.md guidelines |
| Clear Markers | Use [EXISTING]/[MODIFIED]/[NEW] markers |

# Checklist

- [ ] `.feature-analysis.md` verified
- [ ] Checkpoint A passed
- [ ] Output structure determined
- [ ] **[API-only]** Frontend design skipped
- [ ] **[Page+API]** ASCII wireframes and flows included
- [ ] **[Multi-platform]** Per-platform designs
- [ ] Backend interfaces and logic documented
- [ ] Data model with entities and modifications
- [ ] Business rules documented
- [ ] ISA-95 Stage 4/5/6 thinking applied
- [ ] `.feature-design-data.md` created
- [ ] No technology decisions included
