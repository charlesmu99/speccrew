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

## Step 2: Load Business Knowledge

Read the system overview file to understand the current system status:

```
speccrew-workspace/knowledges/bizs/system-overview.md
```

The system overview contains:
- Module list and brief descriptions
- Business flow summary
- Key domain concepts
- Links to detailed module documentation

If more details are needed, follow the links in system-overview.md to navigate to specific module documentation.

Confirmation items:
- [ ] Does the requirement overlap with existing modules? If so, is it an extension or new build?
- [ ] Which existing business processes does the requirement involve?
- [ ] Are there relevant industry standards to reference? (If yes, read `domain/standards/`)

## Step 3: Read PRD Template

Read the template file:
```
speccrew-pm-prd/templates/PRD-TEMPLATE.md
```

## Step 4: Write PRD

Fill in according to the template structure, requirements:
- **Background & Goals**: Explain why we're doing this and what success looks like
- **User Stories**: `As a [user role], I want [to do something], so that [I can achieve some goal]`
- **Functional Requirements**: Group by priority (P0 Core / P1 Important / P2 Optional)
- **Non-functional Requirements**: Performance, security, compatibility, etc.
- **Acceptance Criteria**: Quantifiable, verifiable definition of done
- **Boundary Description**: Clearly define Not In Scope content
- **Assumptions & Dependencies**: Prerequisites, external dependencies

## Step 5: Task Granularity Check

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

## Step 6: Determine Storage Path

Ask the user for the current iteration number and determine the file path:
```
speccrew-workspace/iterations/{number}-{type}-{name}/01.prd/[feature-name]-prd.md
```

If the iteration directory does not exist, refer to the `000-sample` directory structure to create it.

## Step 7: Write File and Request Confirmation

After writing the PRD to file, show the summary to the user and explicitly request confirmation:

```
PRD generated: speccrew-workspace/iterations/XXX-{type}-{name}/01.prd/[feature-name]-prd.md
```
Please confirm the following key points:
1. Is the feature boundary accurate?
2. Are the acceptance criteria quantifiable?
3. Is the Not In Scope complete?

After confirmation, you can start the Solution Agent for solution planning.
```

# Checklist

- [ ] All unclear requirements have been clarified with the user
- [ ] Business module list has been read to confirm boundaries with existing features
- [ ] PRD is completely filled according to template structure
- [ ] User story granularity aligns with "single iteration completable" principle (split if too large)
- [ ] Acceptance criteria are quantifiable and verifiable
- [ ] Boundary description includes clear Not In Scope
- [ ] File has been written to the correct path
- [ ] Summary has been shown to user and confirmation requested

