---
name: speccrew-pm-prd
description: PRD Writing SOP. Guide PM Agent through requirements clarification, business module boundary confirmation, and PRD document generation.
tools: Read, Write, Glob, Grep
---

# Trigger Scenarios

- PM Agent receives user requirement description
- User requests "Write a PRD" or "Help organize requirements" or "New feature requirements"

# Workflow

## Step 1: Requirements Clarification

Ask the user questions to confirm the following (ask for anything unclear):

| Question | Purpose |
|----------|---------|
| What problem does this feature solve? | Confirm background and motivation |
| Who are the target users? | Confirm user scope |
| What are the core scenarios? | Identify mainstream use cases |
| What is out of scope? | Clarify boundaries |
| Are there acceptance criteria? | Confirm definition of done |

**Principle**: Better to ask more questions than to make assumptions.

## Step 2: Confirm Business Boundaries

After loading knowledge (per Agent's Knowledge Loading Strategy), confirm:

- [ ] Does the requirement overlap with existing modules? If so, is it an extension or new build?
- [ ] Which existing business processes does the requirement involve?
- [ ] Are there relevant industry standards to reference? (If yes, read `domain/standards/`)

### 2.1 Check Active Iterations

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

**Principle**: Avoid duplicate or conflicting PRDs for the same feature. Always confirm with user before proceeding.

## Step 3: Read PRD Template

Read the template file:
```
speccrew-pm-prd/templates/PRD-TEMPLATE.md
```

After reading the template, check if any required information is missing based on:
- Template structure requirements
- Previously clarified requirements from Step 1

If there are gaps or unclear points, ask the user to confirm before proceeding to Step 4.

## Step 4: Determine PRD Structure

Before writing, determine the PRD structure based on requirement complexity:

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
01.prd/
├── [feature-name]-prd.md          # Master PRD: Overview, goals, architecture
├── [feature-name]-sub-[module1].md  # Sub-PRD: Module 1 detailed requirements
├── [feature-name]-sub-[module2].md  # Sub-PRD: Module 2 detailed requirements
└── ...
```

**Master PRD Content:**
- Overall background and goals
- High-level architecture
- Module breakdown and relationships
- Cross-module dependencies
- Timeline and milestones

**Sub-PRD Content:**
- Module-specific user stories
- Detailed functional requirements
- Module-specific acceptance criteria
- Interface contracts with other modules

## Step 5: Write PRD

Fill in according to the template structure, requirements:
- **Background & Goals**: Explain why we're doing this and what success looks like
- **User Stories**: `As a [user role], I want [to do something], so that [I can achieve some goal]`
- **Functional Requirements**: Group by priority (P0 Core / P1 Important / P2 Optional)
- **Non-functional Requirements**: Performance, security, compatibility, etc.
- **Acceptance Criteria**: Quantifiable, verifiable definition of done
- **Boundary Description**: Clearly define Not In Scope content
- **Assumptions & Dependencies**: Prerequisites, external dependencies

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

## Step 6: Task Granularity Check

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

If stories need splitting, update the PRD before proceeding to the next step.

**For Master-Sub PRD Structure:**
- Ensure each Sub-PRD can be completed within a single iteration
- If a Sub-PRD is still too large, further split into smaller Sub-PRDs
- Document dependencies between Sub-PRDs in the Master PRD

## Step 7: Determine Storage Path

Ask the user for the current iteration number and determine the file path:

### Single PRD Structure
```
speccrew-workspace/iterations/{number}-{type}-{name}/01.prd/[feature-name]-prd.md
```

### Master-Sub PRD Structure
```
speccrew-workspace/iterations/{number}-{type}-{name}/01.prd/
├── [feature-name]-prd.md
├── [feature-name]-sub-[module1].md
├── [feature-name]-sub-[module2].md
└── ...
```

If the iteration directory does not exist, refer to the `000-sample` directory structure to create it.

## Step 8: Write File and Request Confirmation

After writing the PRD to file, show the summary to the user and explicitly request confirmation:

### Single PRD Output
```
PRD generated: speccrew-workspace/iterations/XXX-{type}-{name}/01.prd/[feature-name]-prd.md
```

### Master-Sub PRD Output
```
Master PRD generated: speccrew-workspace/iterations/XXX-{type}-{name}/01.prd/[feature-name]-prd.md
Sub-PRDs generated:
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
```

# Checklist

- [ ] All unclear requirements have been clarified with the user
- [ ] Business module list has been read to confirm boundaries with existing features
- [ ] Active iterations have been checked for similar/related requirements
- [ ] **[If similar requirements found]** User has confirmed whether to create new iteration or extend existing
- [ ] PRD structure (single vs master-sub) has been determined appropriately
- [ ] PRD is completely filled according to template structure
- [ ] User story granularity aligns with "single iteration completable" principle (split if too large)
- [ ] Acceptance criteria are quantifiable and verifiable
- [ ] Boundary description includes clear Not In Scope
- [ ] **[If modifying existing features]** All changes marked with [EXISTING]/[MODIFIED]/[NEW]
- [ ] File has been written to the correct path
- [ ] Summary has been shown to user and confirmation requested

