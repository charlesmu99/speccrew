---
name: speccrew-pm-requirement-analysis
description: PRD Writing SOP with ISA-95 business modeling. Guide PM Agent through requirements clarification, business domain analysis, and PRD document generation. For complex requirements, applies ISA-95 six-stage methodology for structured domain modeling before PRD writing. Use when PM needs to write PRD, organize requirements, model business domains, or create structured requirement documents.
tools: Read, Write, Glob, Grep
---

# Trigger Scenarios

- PM Agent receives user requirement description
- User requests "Write a PRD" or "Help organize requirements" or "New feature requirements"
- User requests "Create business model" or "Model business requirements"
- User needs structured requirement document with UML diagrams

# Workflow

## Absolute Constraints

> **These rules apply to ALL document generation steps. Violation = task failure.**

1. **FORBIDDEN: `create_file` for documents** — NEVER use `create_file` to write PRD or modeling documents. Documents MUST be created by copying the template then filling sections with `search_replace`.

2. **FORBIDDEN: Full-file rewrite** — NEVER replace the entire document content in a single operation. Always use targeted `search_replace` on specific sections.

3. **MANDATORY: Template-first workflow** — Copy template MUST execute before filling sections. Skipping copy and writing content directly is FORBIDDEN.

## Step 1: Requirements Clarification (MANDATORY)

⚠️ **MANDATORY: This step CANNOT be skipped.**

```
IF user provided a complete requirement document:
  → Perform at least 1 confirmation round (verify understanding, scope, priorities)
  → Generate clarification summary
IF user provided incomplete input:
  → Perform full progressive clarification (Round 1 → Round 2 → optional Round 3)
```

Use progressive questioning to clarify requirements. Do NOT ask all questions at once.

### Round 1: Core Understanding

Ask these first (2-3 questions max per round):

| Question | Purpose |
|----------|---------|
| What problem does this feature solve? What is the business context? | Confirm background and motivation |
| Who are the target users and what are the core usage scenarios? | Identify user scope and mainstream use cases |

### Round 2: Scope & Boundaries

Based on Round 1 answers, ask:

| Question | Purpose |
|----------|---------|
| What is explicitly out of scope? | Clarify boundaries |
| Does this overlap with any existing system capabilities? | Identify reuse vs new build |
| Are there constraints (timeline, technology, budget)? | Clarify constraints early |

### Round 3: Detail & Acceptance (if needed)

| Question | Purpose |
|----------|---------|
| What does "done" look like? Any specific acceptance criteria? | Confirm definition of done |
| Are there non-functional requirements (performance, security)? | Identify NFRs |
| What is the priority relative to other work? | Confirm priority |

### Sufficiency Check

After each round, evaluate whether collected information is sufficient to proceed:

```
Sufficient to proceed when ALL of:
- [ ] Business problem is clearly understood
- [ ] Target users and core scenarios identified
- [ ] Scope boundaries (in/out) are defined
- [ ] Relationship to existing system is understood

If ANY is unclear → ask follow-up questions targeting the gap
If ALL are clear → proceed to Step 1 Output
```

### Step 1 Output: Generate Clarification Summary

After Sufficiency Check passes, generate a clarification summary file:

```
Path: speccrew-workspace/iterations/{iteration}/01.product-requirement/.clarification-summary.md
```

**Content template:**
```markdown
# Clarification Summary

## Input Type
- [ ] Complete requirement document provided
- [ ] Incomplete input (progressive clarification performed)

## Clarification Rounds
- Round 1 (Core Understanding): [Summary of Q&A]
- Round 2 (Scope & Boundaries): [Summary of Q&A]
- Round 3 (Detail & Acceptance): [If applicable, Summary of Q&A]

## Sufficiency Check Status
- [x] Business problem is clearly understood
- [x] Target users and core scenarios identified
- [x] Scope boundaries (in/out) are defined
- [x] Relationship to existing system is understood

## Key Decisions
- [Record any key decisions made during clarification]

## Proceed Gate
✅ All checks passed. Ready for Step 2.
```

### Proceed Gate to Step 2

**Before proceeding to Step 2, verify BOTH conditions:**

```
□ All Sufficiency Check items marked as ✅
□ .clarification-summary.md file exists and is complete

IF both conditions met → Proceed to Step 2
IF any condition fails → STOP and complete the missing items
```

**Principles:**
- Ask 2-3 questions per round, not 5+ at once
- Adapt questions based on previous answers (skip what's already clear)
- For vague inputs like "Build a WMS system", Round 1 may need extra probing: "What specific pain points in your current warehouse operations?" / "Which warehouse processes are highest priority?"
- Never assume — if uncertain, ask

## Step 2: Load System Knowledge

### 2.1 Read System Overview

Read the file to understand system context:
```
speccrew-workspace/knowledges/bizs/system-overview.md
```

### 2.2 Load Related Module Overviews

Based on user input, identify related modules and read their overview files:
```
speccrew-workspace/knowledges/bizs/{module-name}/{module-name}-overview.md
```

### 2.3 Query Knowledge Graph (Optional)

If cross-module relationships need analysis, use `speccrew-knowledge-graph-query` skill:

| Action | Use Case |
|--------|----------|
| `query-nodes` | Find all nodes in a module |
| `search` | Find related entities by keyword |
| `trace-upstream` | Impact analysis for existing entities |
| `trace-downstream` | Dependency analysis |

## Step 3: Confirm Business Boundaries

After loading knowledge, confirm:

- [ ] Does the requirement overlap with existing modules? If so, is it an extension or new build?
- [ ] Which existing business processes does the requirement involve?
- [ ] Are there relevant industry standards to reference? (If yes, read `domain/standards/`)

### 3.1 Check Active Iterations

Before creating a new PRD, check if there are ongoing iterations with similar requirements:

1. List the `speccrew-workspace/iterations/` directory
2. Review PRD files in active iterations (non-archived)
3. Compare current requirements with existing iteration PRDs

**If similar requirements found:**

| Scenario | Action |
|----------|--------|
| Same feature, different scope | Ask user: "Found similar PRD in iteration XXX. Create new iteration or extend existing?" |
| Same feature, same scope | Ask user: "This requirement already exists in iteration XXX. Skip or update existing PRD?" |
| Related feature, same module | Ask user: "Found related feature in iteration XXX. Create new iteration or merge requirements?" |

**Decision options:**
- **New iteration**: Create a new iteration directory for this requirement
- **Extend existing**: Update the existing PRD with additional requirements
- **Merge**: Combine requirements into a single PRD

**Principle**: Avoid duplicate or conflicting PRDs for the same feature.

## Step 4: Determine Complexity & Select Approach

Evaluate requirement complexity to determine the appropriate workflow path:

| Criteria | Simple | Complex |
|----------|--------|---------|
| Modules involved | 1 module | 2+ modules or new domain |
| Domain clarity | Well-understood domain | New/unclear domain |
| Cross-module deps | None or minimal | Significant |
| Template | PRD-TEMPLATE.md only | BIZS-MODELING-TEMPLATE.md + PRD-TEMPLATE.md |

**Workflow Path:**
- **Simple path**: Skip to Step 7 (Read PRD Template)
- **Complex path**: Proceed to Step 5 (ISA-95 Business Modeling) → Step 6 (Module Decomposition)

## Step 5: ISA-95 Business Modeling (Complex Requirements Only)

Read the modeling template:
```
speccrew-pm-requirement-analysis/templates/BIZS-MODELING-TEMPLATE.md
```

Execute ISA-95 six stages **in condensed form**:

### 5.1 Stage 1 - Domain Description
- Define domain boundary (in-scope, out-of-scope)
- Identify external participants (users, systems, agents)
- Create domain glossary
- Draw system context diagram (graph TD)

**Checkpoint A: Briefly confirm domain boundary with user before proceeding.**
Ask: "Here is the domain boundary and key participants. Does this match your understanding?"

### 5.2 Stage 2 - Functions in Domain
- Create WBS decomposition (graph TD)
- Map functions to business capabilities
- Select UML visualization as needed (Use Case / Activity / State Machine)

### 5.3 Stage 3 - Functions of Interest
- Apply MoSCoW prioritization
- Create focused use case diagram (graph TB)
- Document non-core functions and their iteration plan

**Checkpoint B: Confirm MVP scope with user before proceeding.**
Ask: "Here are the core functions (Must have) and deferred functions. Is the MVP scope correct?"

### 5.4 Stage 4 - Information Flows
- Document core information flows
- Create sequence diagram (sequenceDiagram)
- Create Data Flow Diagram (graph TD)
- List interface interactions

### 5.5 Stage 5 - Categories of Information
- Define information categories
- Create data dictionary
- Draw conceptual class diagram (classDiagram)

### 5.6 Stage 6 - Information Descriptions
- Create design class diagram with technical details
- Create component diagram (graph TB)
- Document implementation standards

**Checkpoint C: Present complete modeling results (Stages 4-6) to user for final confirmation.**

**Key rules for this step:**
- Use 3 checkpoints (A/B/C) for progressive confirmation, not all-at-once
- All Mermaid diagrams MUST follow mermaid-rule.md:
  - No HTML tags (`<br/>`)
  - No nested subgraphs
  - No `direction` keyword
  - No `style` definitions
  - No special characters in node text
- **Write modeling document using template-fill workflow:**

  **5.7a Copy Template to Document Path:**
  1. Read `templates/BIZS-MODELING-TEMPLATE.md`
  2. Replace top-level placeholders (feature name, domain name, etc.)
  3. Create document using `create_file` at: `iterations/{number}-{type}-{name}/01.product-requirement/{feature-name}-bizs-modeling.md`

  **5.7b Fill Each Section Using search_replace:**
  Fill each modeling stage section with results from Stages 1-6 above, using `search_replace` per section.
  > ⚠️ FORBIDDEN: `create_file` to rewrite entire document. MUST use `search_replace` per section.

**ISA-95 Quick Reference:**

| Stage | Focus | Key Output | UML Type |
|-------|-------|------------|----------|
| 1. Domain Description | Boundary, terminology | System context diagram | graph TD |
| 2. Functions in Domain | All functions | WBS, use case diagram | graph TD, graph TB |
| 3. Functions of Interest | Core functions (MVP) | MoSCoW table | graph TB |
| 4. Information Flows | Interactions, interfaces | Sequence diagram, DFD | sequenceDiagram, graph TD |
| 5. Categories of Information | Entities, data dictionary | Conceptual class diagram | classDiagram |
| 6. Information Descriptions | Design details | Design class diagram | classDiagram, graph TB |

## Step 6: Module Decomposition & Ordering (Complex Requirements Only)

Map WBS Level-1 nodes from Stage 2 into independent modules. For each module:

### 6.1 Define Module List

| Module | Scope | Key Entities | Owner Domain |
|--------|-------|-------------|--------------|
| {module} | {what it covers} | {core entities} | {business domain} |

### 6.2 Cross-Module Dependency Matrix

Extract dependencies from Stage 4 information flows and graph query results:

| Module | Depends On | Dependency Type | Shared Entities |
|--------|-----------|-----------------|-----------------|
| {module A} | {module B} | Data / API / Event | {entities} |

### 6.3 Implementation Order

Based on dependency matrix, determine module priority:

```
Phase 1 (Foundation): Modules with no upstream dependencies
Phase 2 (Core): Modules depending only on Phase 1
Phase 3 (Extension): Remaining modules
```

**Present module decomposition to user for confirmation before proceeding.**

## Step 7: Read PRD Template

Read the template file:
```
speccrew-pm-requirement-analysis/templates/PRD-TEMPLATE.md
```

After reading the template, check if any required information is missing based on:
- Template structure requirements
- Previously clarified requirements from Step 1

If there are gaps or unclear points, ask the user to confirm before proceeding.

## Step 8: Determine PRD Structure

Before writing, determine the PRD structure based on requirement complexity:

### Structure Decision (MANDATORY IF/THEN)

```
IF modules_count >= 2 OR cross_module_dependencies exist:
  → MANDATORY: Use Master-Sub Structure
  → Record: sub_prd_count = len(module_list)
ELSE:
  → Use Single PRD Structure
```

### Simple Requirements (Single Document)
- Single feature with clear boundaries
- Minimal dependencies on existing modules
- Can be completed in 1-2 iterations

### Complex Requirements (Master-Sub Structure)
- Multiple related features or sub-modules
- Cross-domain changes involving multiple modules
- Requires phased implementation

**Master-Sub Structure:**
```
01.product-requirement/
├── [feature-name]-prd.md            # Master PRD
├── [feature-name]-sub-[module1].md   # Sub-PRD: Module 1
├── [feature-name]-sub-[module2].md   # Sub-PRD: Module 2
└── ...
```

**Master PRD MUST include:**
- Overall background, goals, and success metrics
- System architecture overview (Mermaid graph TB)
- Module list with scope boundaries (from Step 6.1)
- Cross-module dependency matrix (from Step 6.2)
- Implementation phases and ordering (from Step 6.3)
- Shared entities and data contracts across modules
- Global non-functional requirements (performance, security, scalability)

**Each Sub-PRD covers ONE module:**
- Module-specific user stories and functional requirements
- Module-internal process flows and use cases
- **Feature Breakdown** (required): List all business operation units with Feature ID, Type, and dependencies
- Module-specific acceptance criteria
- Interface contracts with other modules (referencing Master PRD dependency matrix)

## Step 9: Write PRD

Fill in according to the template structure, requirements:
- **Background & Goals**: Explain why we're doing this and what success looks like
- **User Stories**: `As a [user role], I want [to do something], so that [I can achieve some goal]`
- **Functional Requirements**: Group by priority (P0 Core / P1 Important / P2 Optional)
- **Feature Breakdown**: Extract business operation units for downstream Feature Design (see Step 9.1)
- **Non-functional Requirements**: Performance, security, compatibility, etc.
- **Acceptance Criteria**: Quantifiable, verifiable definition of done
- **Boundary Description**: Clearly define Not In Scope content
- **Assumptions & Dependencies**: Prerequisites, external dependencies

### Step 9.1: Extract Feature Breakdown

For both simple and complex requirements, extract Feature Breakdown to guide downstream Feature Design:

**Analysis Steps:**
1. **Analyze user stories and functional requirements** for this module/feature
2. **Identify business operation units** - each unit should represent:
   - A complete business operation (e.g., "Customer List Management" includes search, filter, pagination, tag management)
   - Can span 1-2 pages but remains business-cohesive
   - Estimated implementation: no more than 15 code files (frontend + backend combined)
3. **Classify Feature Type:**
   - `Page+API`: Frontend page with corresponding backend APIs (for full-stack architecture)
   - `API-only`: Group of related APIs (for backend-only features)
4. **Assign Feature IDs**: Use format `F-{MODULE}-{NN}` (e.g., F-CRM-01, F-CRM-02)
5. **Document dependencies**: Identify data or workflow dependencies between features

**Granularity Guidelines:**
| Good Feature Size | Too Large (Split Further) |
|-------------------|--------------------------|
| Single CRUD operation group | Complete module with 5+ CRUDs |
| One list page with filters | Entire reporting subsystem |
| One form with validation | Multi-step wizard with 10+ steps |
| Single API endpoint group | All APIs for a domain |

**Output:** Complete the Feature Breakdown table in Section 3.4 of the PRD template.

**Note:** Even simple requirements (single-file PRD) should include Feature Breakdown, typically with 1-3 features.

### Marking Existing vs New Features

When the requirement involves modifying existing system functions, clearly mark each item:

| Marker | Meaning | Example |
|--------|---------|---------|
| `[EXISTING]` | Current system capability being reused | `[EXISTING] User authentication via OAuth` |
| `[MODIFIED]` | Existing feature being enhanced/changed | `[MODIFIED] Add email field to user profile` |
| `[NEW]` | Brand new functionality | `[NEW] Export report to PDF` |

**Apply markers in:**
- User stories (prefix the story)
- Functional requirements (prefix each requirement)
- UI mockups descriptions
- API specifications

**Example:**
```markdown
## Functional Requirements

### P0 Core
- [EXISTING] User login system - reuse current JWT-based auth
- [MODIFIED] User profile page - add "Department" dropdown field
- [NEW] Department management module - CRUD operations for departments
```

## Step 10: Task Granularity Check

After PRD completion, check if each user story's granularity aligns with the "single iteration completable" principle.

**Appropriate Granularity (completable in one iteration)**:
- Add a database field and write migration
- Add a UI component in an existing page
- Modify existing server-side logic
- Add a filter condition to a list page

**Granularity Requiring Splitting (too large)**:
- Implement a complete dashboard
- Add a whole authentication/login system
- Overall refactoring of existing APIs
- Cross-domain changes involving multiple modules

**Splitting Strategy**:
- Break large user stories into multiple small user stories
- Each small user story has independent acceptance criteria
- Mark dependencies between user stories

If stories need splitting, update the PRD before proceeding.

## Step 11: Determine Storage Path

Ask the user for the current iteration number and determine the file path:

### Single PRD Structure
```
speccrew-workspace/iterations/{number}-{type}-{name}/01.product-requirement/[feature-name]-prd.md
```

### Master-Sub PRD Structure
```
speccrew-workspace/iterations/{number}-{type}-{name}/01.product-requirement/
├── [feature-name]-prd.md
├── [feature-name]-sub-[module1].md
├── [feature-name]-sub-[module2].md
└── ...
```

If the iteration directory does not exist, refer to the `000-sample` directory structure to create it.

## Step 12: Write Files Using Template-Fill Workflow

⚠️ **CRITICAL: For Master-Sub structure, you MUST generate ALL Sub-PRD files.**
- **DO NOT put all module content into the Master PRD.**
- **Each Sub-PRD is a SEPARATE file containing ONLY that module's requirements.**

---

### Step 12a: Generate Master PRD

**For BOTH Single and Master-Sub structures:**

1. **Copy template to document path:**
   - Read `templates/PRD-TEMPLATE.md` (already loaded in Step 7)
   - Replace top-level placeholders (feature name, iteration, date)
   - Create document using `create_file` at: `{iteration}/01.product-requirement/{feature-name}-prd.md`

2. **Fill Master-only content using `search_replace`:**
   - Section 1: Overall background, goals, success metrics
   - Section 2: System architecture overview (Mermaid graph TB)
   - Section 3: Module list with scope boundaries (from Step 6.1)
   - Section 4: Cross-module dependency matrix (from Step 6.2)
   - Section 5: Implementation phases and ordering (from Step 6.3)
   - Section 6: Shared entities and data contracts
   - Section 7: Global non-functional requirements

3. **DO NOT include module-specific content in Master:**
   - No module-specific user stories
   - No module-specific functional requirements
   - No module-specific Feature Breakdown tables

> ⚠️ **CRITICAL CONSTRAINTS:**
> - **FORBIDDEN: `create_file` to rewrite the entire document**
> - **MUST use `search_replace` to fill each section individually**
> - **All section titles MUST be preserved**

---

### Step 12b: Generate Sub-PRDs (LOOP - MANDATORY for Master-Sub)

**IF Step 8 determined Master-Sub structure, execute this loop:**

```
FOR each module in module_list from Step 6.1:
  
  12b.1: Copy template to sub_prd_path
    sub_prd_name = "{feature-name}-sub-{module-key}.md"
    sub_prd_path = "{iteration}/01.product-requirement/{sub_prd_name}"
    
    Action:
    1. Read templates/PRD-TEMPLATE.md
    2. Replace top-level placeholders
    3. Create document using create_file at sub_prd_path

  12b.2: Fill module-specific content using search_replace:
    - Section 1: Module-specific background and context
    - Section 2: Module-specific user stories
    - Section 3: Module-specific functional requirements
    - Section 3.4: Module-specific Feature Breakdown (REQUIRED)
    - Section 5: Module-specific acceptance criteria
    - Add: Interface Contracts (from Master dependency matrix)

  12b.3: Verify file exists and is non-empty
    - Read sub_prd_path to confirm file was created
    - Verify file size > 1KB (not empty placeholder)

NEXT module

⚠️ STOP condition: All modules in module_list have been processed.
```

**Example loop execution:**
```
Iteration 1: Process module "inventory"
  → Create: inventory-management-sub-inventory.md
  → Fill: inventory-specific content
  → Verify: file exists and has content

Iteration 2: Process module "order"
  → Create: inventory-management-sub-order.md
  → Fill: order-specific content
  → Verify: file exists and has content

... continue until all modules processed
```

---

### Step 12c: Verification Checklist (MANDATORY)

**After all PRD files are generated, verify:**

```
□ Master PRD exists at {iteration}/01.product-requirement/{feature-name}-prd.md
□ Master PRD file size > 2KB (not empty placeholder)

[For Master-Sub structure ONLY:]
  □ All {sub_prd_count} Sub-PRD files exist
  □ Each Sub-PRD file size > 3KB (not empty placeholder)
  □ Master PRD Section index links match actual Sub-PRD files
  □ No broken file references
  □ Each Sub-PRD contains module-specific Feature Breakdown

IF any check fails → STOP and report error, fix before proceeding
IF all checks pass → Proceed to Step 12d
```

---

### Step 12d: Request Confirmation

After verification passes, show summary and request user confirmation:

**Simple PRD Output:**
```
PRD generated: speccrew-workspace/iterations/XXX-{type}-{name}/01.product-requirement/[feature-name]-prd.md
```

**Complex PRD Output (with modeling):**
```
Business Modeling generated: speccrew-workspace/iterations/XXX-{type}-{name}/01.product-requirement/[feature-name]-bizs-modeling.md
PRD generated: speccrew-workspace/iterations/XXX-{type}-{name}/01.product-requirement/[feature-name]-prd.md
```

**Master-Sub PRD Output:**
```
Master PRD generated: speccrew-workspace/iterations/XXX-{type}-{name}/01.product-requirement/[feature-name]-prd.md
Sub-PRDs generated ({sub_prd_count} files):
  - [feature-name]-sub-[module1].md
  - [feature-name]-sub-[module2].md
  - ...
```

Please confirm the following key points:
1. Is the feature boundary accurate?
2. Are the acceptance criteria quantifiable?
3. Is the Not In Scope complete?
4. **[For complex requirements]** Is the Master-Sub structure appropriate?
5. **[For existing features]** Are the [EXISTING]/[MODIFIED]/[NEW] markers accurate?

After confirmation, you can start the Solution Agent for solution planning.

## Step 13: Write Progress Files

After user confirms the PRD, write progress tracking files:

### 13a Write Checkpoint File

Write or update the checkpoint file at:
```
speccrew-workspace/iterations/{iteration}/01.product-requirement/.checkpoints.json
```

Content:
```json
{
  "stage": "01_prd",
  "checkpoints": {
    "prd_review": {
      "passed": true,
      "confirmed_at": "<current-ISO-timestamp>",
      "description": "PRD review and confirmation"
    }
  }
}
```

### 13b Update Workflow Progress

Read and update the WORKFLOW-PROGRESS.json file:

1. **Read**: `speccrew-workspace/iterations/{iteration}/WORKFLOW-PROGRESS.json`
2. **Update the following fields**:
   - `current_stage` = "02_feature_design"
   - `01_prd.status` = "confirmed"
   - `01_prd.completed_at` = `<current-ISO-timestamp>`
   - `01_prd.confirmed_at` = `<current-ISO-timestamp>`
   - `01_prd.outputs` = `["01.product-requirement/{feature-name}-prd.md"]`

**Example updated stage entry**:
```json
{
  "01_prd": {
    "status": "confirmed",
    "started_at": "2026-04-08T10:00:00Z",
    "completed_at": "2026-04-08T11:30:00Z",
    "confirmed_at": "2026-04-08T11:35:00Z",
    "outputs": [
      "01.product-requirement/user-management-prd.md"
    ]
  }
}
```

### 13c Handle Missing Progress File

If WORKFLOW-PROGRESS.json does not exist (backward compatibility):
- Create the file with initial structure
- Set `01_prd` to confirmed state directly
- Other stages remain as `pending`

**Status Flow**: `pending` → `in_progress` → `completed` → `confirmed`

---

# Knowledge Loading Strategy

1. **First**: Read `system-overview.md` for system context
2. **Then**: Load related `{module}-overview.md` files
3. **As needed**: Query graph for cross-module relationships

# Checklist

- [ ] All unclear requirements have been clarified with the user (progressive multi-round)
- [ ] Sufficiency check passed: problem, users, scenarios, scope, existing system relationship all clear
- [ ] System overview and related module overviews loaded
- [ ] Business module boundaries confirmed with existing features
- [ ] Active iterations have been checked for similar/related requirements
- [ ] **[If similar requirements found]** User has confirmed whether to create new iteration or extend existing
- [ ] Complexity assessed and appropriate workflow path selected
- [ ] **[Complex path]** ISA-95 Checkpoint A passed: domain boundary confirmed
- [ ] **[Complex path]** ISA-95 Checkpoint B passed: MVP scope confirmed
- [ ] **[Complex path]** ISA-95 Checkpoint C passed: complete modeling confirmed
- [ ] **[Complex path]** All Mermaid diagrams follow mermaid-rule.md
- [ ] **[Complex path]** Module decomposition completed: module list, dependency matrix, implementation order
- [ ] **[Complex path]** Module decomposition confirmed with user
- [ ] PRD structure (single vs master-sub) determined appropriately
- [ ] **[Master-Sub]** Master PRD includes architecture overview, module list, dependency matrix, implementation phases
- [ ] **[Master-Sub]** Each Sub-PRD covers exactly one module with interface contracts
- [ ] **Feature Breakdown** extracted with appropriate granularity (each feature ≤ 15 code files)
- [ ] **Feature Breakdown** includes Feature IDs, Types (Page+API / API-only), and dependencies
- [ ] PRD completely filled according to template structure
- [ ] User story granularity aligns with "single iteration completable" principle
- [ ] Acceptance criteria are quantifiable and verifiable
- [ ] Boundary description includes clear Not In Scope
- [ ] **[If modifying existing features]** All changes marked with [EXISTING]/[MODIFIED]/[NEW]
- [ ] Files written to correct paths
- [ ] Summary shown to user and confirmation requested
- [ ] **[After confirmation]** Checkpoint file written to `01.product-requirement/.checkpoints.json`
- [ ] **[After confirmation]** WORKFLOW-PROGRESS.json updated with confirmed status and outputs
