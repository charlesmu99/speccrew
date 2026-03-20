---
name: devcrew-solution-plan
description: Solution Planning SOP. Guide Solution Agent to complete solution analysis, technology selection, data model design, and output Solution document.
tools: Read, Write, Glob, Grep
---

# Trigger Scenarios

- PRD manually confirmed, user requests to start solution planning
- User asks "How to implement this" or "Technical planning" or "How to achieve this requirement"

# Workflow

## Step 1: Read Input

Read in order:

1. Current iteration PRD: `projects/pXXX/01.prds/[feature-name]-prd.md`
2. System architecture status: `devcrew-workspace/knowledge/architecture/system/system-arch.md`
3. Business module list: `devcrew-workspace/knowledge/bizs/modules/modules.md`
4. Solution template: `.qoder/skills/devcrew-solution-plan/templates/SOLUTION-TEMPLATE.md`

## Step 2: Solution Analysis

Based on PRD and architecture status, analyze the following:

**Function Breakdown**
- Break down functional requirements in PRD into implementable technical subtasks
- Identify change scope in frontend, backend, and database layers

**Technical Decisions**
- Reuse existing modules or create new ones?
- Any third-party dependencies?
- How to store data? (Relational / Vector / Graph)
- Any asynchronous tasks involved?

**UI/Interaction Solution**
- What new pages or components?
- What is the key interaction flow? (Describe main flow in text)

**Data Model**
- What new/modified data tables?
- What are the key fields and relationships?

## Step 3: Write Solution Document

Fill in according to template structure, requirements:
- **Solution Overview**: One paragraph explaining overall approach
- **Function Breakdown**: Implementation ideas for each functional requirement in PRD
- **Sequence Diagram**: Mermaid sequence diagram for core flow (at least one)
- **Data Model**: ER diagram or table structure description
- **UI Solution**: Page/component list and interaction description
- **Risks & Constraints**: Identify potential risks in implementation

**Mermaid Diagram Requirements**

When generating Mermaid diagrams (sequence diagrams, architecture diagrams, etc.), you **MUST** follow the compatibility guidelines defined in:
- **Reference**: `devcrew-workspace/docs/rules/mermaid-rule.md`

Key requirements:
- Use only basic node definitions: `A[text content]`
- No HTML tags (e.g., `<br/>`)
- No nested subgraphs
- No `direction` keyword
- No `style` definitions
- Use standard `graph TB/LR` or `sequenceDiagram` syntax only

## Step 4: Write to File

Write path: `projects/pXXX/02.solutions/[feature-name]-solution.md`

If iteration directory does not exist, refer to `p000-sample` to create complete directory structure.

## Step 5: Synchronously Execute API Contract

After Solution document is complete, continue calling `devcrew-solution-api-contract/SKILL.md` to generate API contract document.

# Checklist

- [ ] PRD has been read, solution covers all P0 functional requirements
- [ ] System architecture has been read, solution is compatible with existing architecture
- [ ] Sequence diagram includes core flow
- [ ] Data model has clear table structure description
- [ ] UI solution has page/component list
- [ ] File has been written to correct path
