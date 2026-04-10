---
name: speccrew-pm-requirement-analysis
description: PRD Writing SOP with ISA-95 methodology integration. Guide PM Agent through requirements clarification, business domain analysis, and PRD document generation. Applies ISA-95 Stages 1-3 as internal thinking framework for clarification, functional decomposition, and prioritization — no separate modeling documents. Use when PM needs to write PRD, organize requirements, or create structured requirement documents.
tools: Read, Write, Glob, Grep
---

# Trigger Scenarios

- PM Agent receives user requirement description
- User requests "Write a PRD" or "Help organize requirements" or "New feature requirements"
- User needs structured requirement document with UML diagrams

## Methodology Foundation

This skill applies the ISA-95 six-stage methodology (Stages 1-3) as an internal thinking framework:

| ISA-95 Stage | Integrated Into | Purpose |
|---|---|---|
| Stage 1: Domain Description | Clarification process | Define domain boundary, participants, glossary |
| Stage 2: Functions in Domain | PRD Section 3 (Functional Requirements) | WBS decomposition, capability mapping |
| Stage 3: Functions of Interest | PRD Section 3.4 (Feature Breakdown) | MoSCoW prioritization, MVP scoping |

> ⚠️ **No separate modeling documents.** The methodology guides thinking quality, not document quantity.

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

> **ISA-95 Stage 1 Thinking — Domain Description**
> During clarification, apply domain description methodology:
> - **Domain Boundary**: Explicitly define what is in-scope and out-of-scope. Record in clarification summary.
> - **External Participants**: Identify all user roles, external systems, and integration points.
> - **Domain Glossary**: Unify key business terms to eliminate ambiguity across stakeholders.
> These elements should naturally flow into the clarification summary, NOT as a separate document.

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
| Template | PRD-TEMPLATE.md only | PRD-TEMPLATE.md (with deeper analysis) |

**Workflow Path:**
- **Simple path**: Skip to Step 7 (Read PRD Template)
- **Complex path**: Proceed to Step 5 (ISA-95 Business Modeling) → Step 6 (Module Decomposition)

## Step 5: ISA-95 Business Modeling Thinking (Complex Requirements Only)

> ⚠️ **This step is a THINKING PROCESS, not a document generation step.**
> Apply ISA-95 methodology internally to deepen your analysis. Results flow into the PRD.

Apply ISA-95 six stages as internal thinking framework:

### 5.1 Stage 1 - Domain Description (Thinking)
- Define domain boundary (in-scope, out-of-scope)
- Identify external participants (users, systems, agents)
- Create domain glossary
- Visualize system context (mental model or rough sketch)

**Checkpoint A: Briefly confirm domain boundary with user before proceeding.**
Ask: "Here is the domain boundary and key participants. Does this match your understanding?"

### 5.2 Stage 2 - Functions in Domain (Thinking)
- Create WBS decomposition (mental or rough sketch)
- Map functions to business capabilities
- Identify module boundaries

### 5.3 Stage 3 - Functions of Interest (Thinking)
- Apply MoSCoW prioritization
- Identify core vs non-core functions
- Document non-core functions and their iteration plan

**Checkpoint B: Confirm MVP scope with user before proceeding.**
Ask: "Here are the core functions (Must have) and deferred functions. Is the MVP scope correct?"

### 5.4 Stage 4 - Information Flows (Thinking)
- Document core information flows
- Identify key interfaces
- Understand data movement patterns

### 5.5 Stage 5 - Categories of Information (Thinking)
- Define information categories
- Identify core entities
- Understand data relationships

### 5.6 Stage 6 - Information Descriptions (Thinking)
- Consider technical implications
- Identify component boundaries
- Note implementation considerations

**Checkpoint C: Present analysis summary to user for final confirmation.**

> All ISA-95 thinking results will be reflected in the PRD document, NOT as a separate modeling file.

**Key rules for this step:**
- Use 3 checkpoints (A/B/C) for progressive confirmation, not all-at-once
- This is an analysis phase — focus on understanding, not documentation
- Results integrate into PRD Sections 3-7 during Step 9

## Step 6: Module Decomposition & Ordering (Complex Requirements Only)

Based on ISA-95 analysis from Step 5, map identified modules into independent units. For each module:

### 6.1 Define Module List

| Module | Scope | Key Entities | Owner Domain |
|--------|-------|-------------|--------------|
| {module} | {what it covers} | {core entities} | {business domain} |

### 6.2 Cross-Module Dependency Matrix

Based on information flow analysis from Step 5, identify dependencies:

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

> **ISA-95 Stage 2 Thinking — Functions in Domain**
> When decomposing functional requirements:
> - **WBS Decomposition**: Break down the system into functional modules using Work Breakdown Structure logic. Each module should map to a clear business capability.
> - **Function-Capability Mapping**: Every function must answer "what business capability does this deliver?"
> - **Module Boundaries**: Ensure modules have clear boundaries with minimal coupling.
> This thinking drives PRD Section 3 content quality — no separate WBS document needed.

- **Feature Breakdown**: Extract business operation units for downstream Feature Design (see Step 9.1)
- **Non-functional Requirements**: Performance, security, compatibility, etc.
- **Acceptance Criteria**: Quantifiable, verifiable definition of done
- **Boundary Description**: Clearly define Not In Scope content
- **Assumptions & Dependencies**: Prerequisites, external dependencies

### Step 9.1: Extract Feature Breakdown

For both simple and complex requirements, extract Feature Breakdown to guide downstream Feature Design:

> **ISA-95 Stage 3 Thinking — Functions of Interest**
> When creating the Feature Breakdown table:
> - **MoSCoW Prioritization**: Classify each feature as Must-have (P0), Should-have (P1), Could-have (P2), or Won't-have (deferred).
> - **MVP Focus**: The Feature Breakdown table IS the MVP definition. Features marked P0 form the core scope.
> - **Non-core Exclusion**: Explicitly note deferred features in Section 6 (Boundary & Constraints) with planned iteration.
> The Feature Breakdown table in Section 3.4 serves as the core function selection — no separate priority matrix needed.

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

## Step 12: Write PRD Files

### Step 12a: Plan File List (MANDATORY FIRST STEP)

Before writing any file, create a complete list of ALL files to generate:

**For Single PRD Structure:**

| # | File | Path |
|---|------|------|
| 1 | PRD | {iteration}/01.prd/{feature-name}-prd.md |

**For Master-Sub Structure (present this table to user):**

| # | File Type | Module | Path |
|---|-----------|--------|------|
| 1 | Master PRD | (system overview) | {iteration}/01.prd/{feature-name}-prd.md |
| 2 | Sub-PRD | {module-1-name} | {iteration}/01.prd/{feature-name}-sub-{module-1-key}.md |
| 3 | Sub-PRD | {module-2-name} | {iteration}/01.prd/{feature-name}-sub-{module-2-key}.md |
| ... | ... | ... | ... |
| N+1 | Sub-PRD | {module-N-name} | {iteration}/01.prd/{feature-name}-sub-{module-N-key}.md |

Total files: 1 (Master) + N (Sub-PRDs) = N+1 files.

⚠️ **Present this file list to user for confirmation before proceeding.**

---

### Step 12b: Generate Master PRD

1. Read `templates/PRD-TEMPLATE.md` (already loaded in Step 7)
2. Create document using `create_file` at: `{iteration}/01.prd/{feature-name}-prd.md`

3. Fill content using `search_replace` per section:

**For Single PRD Structure** — fill ALL sections with full detail:
   - Section 1 (Background & Goals): Full background, goals
   - Section 2 (User Stories): All user stories with scenarios
   - Section 3 (Functional Requirements): All requirements including Feature Breakdown (3.4)
   - Section 4 (Non-functional Requirements): Performance, security, etc.
   - Section 5 (Acceptance Criteria): All criteria
   - Section 6 (Boundary Description): In/out scope
   - Section 7 (Assumptions & Dependencies)

**For Master-Sub Structure** — fill ONLY system-level overview content:

   > ⚠️ **Master PRD = System Overview ONLY. All module-specific details go into Sub-PRDs.**
   > The Master PRD should read like an "executive summary" — a reader should understand
   > WHAT the system does and HOW modules relate, but NOT the detailed features of each module.

   - Section 1 (Background & Goals): System-wide background and goals (keep concise, 2-3 paragraphs max)
   - Section 2 (User Stories):
     - 2.1 Target Users: List all user roles with brief descriptions
     - 2.2 User Scenarios: **Maximum 3-5 HIGH-LEVEL system stories.** Each story describes a MODULE-LEVEL capability, NOT individual features.
       - ✅ Good: "As a store manager, I want a CRM system to manage customer relationships across all stores"
       - ❌ Bad: "As a beautician, I want to upload before/after photos" (this is module-specific, belongs in Sub-PRD)
   - Section 3 (Functional Requirements):
     - 3.1 Use Case Diagram: System-level use case diagram showing modules as use case groups (NOT individual features)
     - 3.2 Business Process Flow: ONE cross-module end-to-end process flow (the main business flow only)
     - 3.3 Feature List: **ONE row per MODULE** (NOT per feature). Columns: Module, Priority, Scope Summary, Key Capabilities (brief). Maximum N rows for N modules.
       - ✅ Good: `| M2-会员管理 | P0 | 顾客信息CRUD、自定义字段、公共池 |`
       - ❌ Bad: Listing 24 individual features across all modules
     - 3.4 Feature Breakdown: Write "See individual Sub-PRDs for module-specific Feature Breakdown"
     - 3.5 Feature Details: Write "See individual Sub-PRDs for module-specific Feature Details"
   - Section 4 (Non-functional Requirements): System-wide NFRs only (performance, security, compatibility — 1 line each)
   - Section 5 (Acceptance Criteria): **System-wide milestones only** (e.g., "All Phase 1 modules deployed"). NOT module-specific acceptance items.
   - Section 6 (Boundary Description): System-wide scope boundaries
   - Section 7 (Assumptions & Dependencies): System-wide dependencies
   - **APPEND after Section 7** using `search_replace` on the PRD Status line:
     - **Section 8: Module Overview** — Module list table (from Step 6.1), Cross-module dependency matrix (from Step 6.2), Implementation phases (from Step 6.3)
     - **Section 9: Sub-PRD Index** — List all Sub-PRD file paths with module names

> ⚠️ **CRITICAL CONSTRAINTS:**
> - **FORBIDDEN: `create_file` to rewrite the entire document**
> - **MUST use `search_replace` to fill each section individually**
> - **For Master-Sub: DO NOT include module-specific user stories, requirements, or Feature Breakdowns in the Master PRD**

---

### Step 12c: Sub-PRD Dispatch Plan (MANDATORY for Master-Sub)

**IF Step 8 determined Master-Sub structure:**

⚠️ **IMPORTANT: Sub-PRD generation is handled by the PM Agent through parallel worker dispatch.**
**DO NOT generate Sub-PRD files sequentially in this skill.**

Prepare and output the dispatch plan for the PM Agent:

**Sub-PRD Dispatch Plan:**

For each module from Step 6.1, prepare worker context:

| # | Module | module_key | Sub-PRD Path | Feature Count |
|---|--------|-----------|--------------|---------------|
| 1 | {module-1-name} | {module-1-key} | {feature-name}-sub-{module-1-key}.md | {count} |
| 2 | {module-2-name} | {module-2-key} | {feature-name}-sub-{module-2-key}.md | {count} |
| ... | ... | ... | ... | ... |

For each module, collect and output the following context data:
- `module_name`: Module name
- `module_key`: Module identifier (for file naming)
- `module_scope`: What this module covers (from Step 6.1)
- `module_entities`: Core entities (from Step 6.1)
- `module_user_stories`: User stories specific to this module (from Steps 1-5 analysis)
- `module_requirements`: Functional requirements for this module (P0/P1/P2)
- `module_features`: Feature Breakdown entries for this module (from Step 9.1 analysis)
- `module_dependencies`: Dependencies on other modules (from Step 6.2)

After outputting the dispatch plan:

```
→ RETURN to PM Agent for parallel worker dispatch.
→ PM Agent will invoke speccrew-task-worker for each module.
→ Each worker uses speccrew-pm-sub-prd-generate/SKILL.md to generate one Sub-PRD.
```

**IF Single PRD Structure:** Skip this step (no Sub-PRDs needed).

---

### Step 12d: Verification Checklist (Execute after all Sub-PRDs are generated)

**After PM Agent confirms all workers have completed, verify:**

- [ ] Master PRD exists and file size > 2KB
- [ ] [Master-Sub] All {sub_prd_count} Sub-PRD files exist
- [ ] [Master-Sub] Each Sub-PRD file size > 3KB
- [ ] [Master-Sub] Master PRD Section 9 (Sub-PRD Index) matches actual files
- [ ] [Master-Sub] Each Sub-PRD contains Section 3.4 Feature Breakdown

IF any check fails → Report error and fix before proceeding.

---

### Step 12e: Present Documents for User Review

Present the generated document summary to user:

**Single PRD:**
```
PRD generated: {path}
```

**Master-Sub PRD:**
```
Master PRD: {master_path}
Sub-PRDs ({sub_prd_count} files):
  1. {module-1}: {sub_prd_1_path}
  2. {module-2}: {sub_prd_2_path}
  ...
  N. {module-N}: {sub_prd_N_path}

Total files generated: {sub_prd_count + 1}
```

Ask user to review the documents and check:
1. Feature boundary accurate?
2. Acceptance criteria quantifiable?
3. Not In Scope complete?
4. [Master-Sub] Module decomposition appropriate?
5. [Existing features] EXISTING/MODIFIED/NEW markers accurate?

⚠️ **HARD STOP — WAIT FOR USER CONFIRMATION**

```
DO NOT proceed to Step 13 until user explicitly confirms.
DO NOT update any status files or mark documents as confirmed.
DO NOT suggest moving to the next stage.

Wait for user to respond with confirmation (e.g., "确认", "OK", "没问题").
IF user requests changes → make the changes, then re-present for review.
ONLY after user explicitly confirms → proceed to Step 13.
```

## Step 13: Finalize PRD Stage (ONLY after user explicitly confirms)

⚠️ **PREREQUISITE: User has explicitly confirmed the PRD documents in Step 12e.**
IF user has NOT confirmed yet → DO NOT execute this step. Return to Step 12e and wait.

### 13a Update Workflow Progress

Use the `update-progress.js` script to update workflow status with real timestamps:

```bash
node speccrew-workspace/scripts/update-progress.js update-workflow \
  --file speccrew-workspace/iterations/{iteration}/WORKFLOW-PROGRESS.json \
  --stage 01_prd --status confirmed \
  --output "01.product-requirement/{feature-name}-prd.md,01.product-requirement/{feature-name}-sub-{module1}.md,..."
```

> The script automatically generates real ISO timestamps for `completed_at` and `confirmed_at`.
> **DO NOT manually construct timestamps** — LLM-generated timestamps are always incorrect.

IF the script is not available or fails, use the following shell command to get the real timestamp:
```bash
node -e "console.log(new Date().toISOString())"
```
Then use the output to fill in the JSON fields manually.

### 13b Write Checkpoint File

1. First, get the real current timestamp:
```bash
node -e "console.log(new Date().toISOString())"
```

2. Write or update the checkpoint file using the REAL timestamp from the command above:
```
speccrew-workspace/iterations/{iteration}/01.product-requirement/.checkpoints.json
```

Content (use the REAL timestamp from the command output):
```json
{
  "stage": "01_prd",
  "checkpoints": {
    "prd_review": {
      "passed": true,
      "confirmed_at": "{REAL_TIMESTAMP_FROM_COMMAND}",
      "description": "PRD review and confirmation"
    }
  }
}
```

### 13c Update PRD Document Status

Update the PRD document status line from Draft to Confirmed:

Use `search_replace` on the Master PRD (and all Sub-PRDs if Master-Sub structure):
- Replace `📝 Draft` with `✅ Confirmed`
- Replace `[Date]` with the real date from the timestamp command
- Replace `[Name]` with `User`

### 13d Handle Missing Progress File

If WORKFLOW-PROGRESS.json does not exist (backward compatibility):
- Create the file with initial structure
- Set `01_prd` to confirmed state directly
- Other stages remain as `pending`

**Status Flow**: `pending` → `in_progress` → `completed` → `confirmed`

### 13e Output Completion Message

After all status files are updated:

```
✅ PRD documents have been confirmed. PRD stage is complete.
When you are ready to proceed with Feature Design, please start a new conversation and invoke the Feature Designer Agent.
```

**END** — Do not proceed further.

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
