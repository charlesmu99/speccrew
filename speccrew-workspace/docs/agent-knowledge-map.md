# Agent Knowledge Map

> This document defines the **input knowledge** and **output deliverables** required by each Agent during task execution, following two core principles: "Determinism" and "On-Demand Loading".
>
> - **Determinism**: Each Agent knows exactly where to read what, with explicit paths, no reliance on traversal or guessing
> - **On-Demand Loading**: Only load content essential for the current task, no pre-reading of full documentation

---

## Knowledge Sources Overview

Agent knowledge sources are organized in three layers:

| Layer | Directory | Content | Update Frequency |
|-------|-----------|---------|------------------|
| **L1 System Knowledge** | `SpecCrew-workspace/knowledge/` | Current system technology, business functions, development conventions | Low frequency, evolves with system |
| **L2 Domain Knowledge** | `SpecCrew-workspace/knowledge/domain/` | Industry standards, business terminology, QA experience | Irregular supplementation |
| **L3 Iteration Deliverables** | `SpecCrew-workspace/projects/pXXX/` | Current iteration PRD, Solution, design documents | Produced each iteration |

---

## Agent Knowledge Maps

### PM Agent (Product Manager)

**Responsibility**: Uncover real requirements through multi-round dialogue, output structured PRD

#### Input Knowledge

| Knowledge Type | Path | Loading Timing | Purpose |
|----------------|------|----------------|---------|
| System Overview | `knowledge/bizs/system-overview.md` | Required, load first | Understand overall system structure, platforms, and modules |
| Module Business Function | `knowledge/bizs/{platform}/{module}/{module}-overview.md` | On-demand | Understand specific module functions, entities, and business rules |
| Industry Knowledge & Standards | `knowledge/domain/standards/` | On-demand | Requirement rationality judgment |
| Business Glossary | `knowledge/domain/glossary/` | On-demand | Unified terminology, avoid ambiguity |
| FAQ | `knowledge/domain/qa/` | On-demand | Identify known issues, avoid repetition |
| User Raw Requirements | Dialogue input | Real-time | Core input |

#### Loading Strategy

```
1. Must load: knowledge/bizs/system-overview.md �?Understand overall system structure and existing modules
2. On-demand load: Load specific module overview files based on business domain
3. On-demand load: Consult domain/standards/ when requirements involve industry standards
4. Do not load: System architecture, technical details (PM doesn't need)
```

#### Deliverables

| Deliverable | Path | Format | Description |
|-------------|------|--------|-------------|
| PRD Document | `projects/pXXX/01.prds/[feature-name]-prd.md` | Per template | Can only proceed after user confirmation |
| Feature PRD Documents | `projects/pXXX/01.prds/[module-name]/[feature-name]-prd.md` | Per template | For complex requirements, organized by module |

---

### Solution Agent (Solution Planning)

**Responsibility**: Output business process solution based on PRD, describing frontend, backend, and database operations to implement business requirements

#### Input Knowledge

| Knowledge Type | Path | Loading Timing | Purpose |
|----------------|------|----------------|---------|
| PRD Document | `projects/pXXX/01.prds/[feature-name]-prd.md` | Required, load first | Core input |
| System Business Overview | `knowledge/bizs/system-overview.md` | Required | Understand system modules and their relationships |
| Module Business Details | `knowledge/bizs/{platform}/{module}/{module}-overview.md` | On-demand | Understand specific module features, entities, and business rules |

#### Loading Strategy

```
1. Must load: PRD + System Business Overview
2. On-demand load: Load specific module overview files when requirement involves existing modules
3. Do not load: System architecture, technical details, development conventions (Solution focuses on business solution only)
```

#### Deliverables

| Deliverable | Path | Format | Description |
|-------------|------|--------|-------------|
| Solution Document | `projects/pXXX/02.solutions/[feature-name]-solution.md` | Per template (with Mermaid sequence/ER diagrams) | Can only proceed after user confirmation |
| Feature Solution Documents | `projects/pXXX/02.solutions/[module-name]/[feature-name]-solution.md` | Per template | For complex requirements, organized by module |
| API Contract Document | `projects/pXXX/02.solutions/[feature-name]-api-contract.md` | Structured table | Frontend-backend shared boundary, read-only during design/development |

---

### Designer Agent (Frontend/Backend)

**Responsibility**: Output pseudo-code level detailed design based on Solution

#### Input Knowledge

| Knowledge Type | Path | Loading Timing | Purpose |
|----------------|------|----------------|---------|
| Solution Document | `projects/pXXX/02.solutions/[feature-name]-solution.md` | Required, load first | Core input |
| Frontend Architecture Details | `knowledge/techs/frontend/` | Required for frontend design | Component conventions, state management agreements |
| Backend Architecture Details | `knowledge/techs/backend/` | Required for backend design | Service layering conventions, DI agreements |
| Data Architecture Details | `knowledge/techs/data/` | On-demand | When involving database operations |
| Development Conventions | `knowledge/techs/conventions/` | Required | Naming conventions, directory agreements, code style |
| Similar Implemented Modules | `knowledge/bizs/{platform}/{module}/{module}-overview.md` | On-demand | Reference existing implementations for consistency |

#### Loading Strategy

```
Frontend Designer Agent:
1. Must load: Solution + Frontend Architecture Details + Development Conventions (frontend part)
2. On-demand load: Reference existing implementations of similar components

Backend Designer Agent:
1. Must load: Solution + Backend Architecture Details + Development Conventions (backend part)
2. On-demand load: Load architecture/data/ when involving database
```

#### Deliverables

| Deliverable | Path | Format | Description |
|-------------|------|--------|-------------|
| Frontend Detailed Design | `projects/pXXX/03.designs/frontend/[feature-name]-design.md` | Per template | Pseudo-code level, no actual code |
| Backend Detailed Design | `projects/pXXX/03.designs/backend/[feature-name]-design.md` | Per template | Pseudo-code level, no actual code |

> API contract documents are output by Solution Agent, path is `02.solutions/[feature-name]-api-contract.md`, **read-only reference during design phase, do not modify**. If contract changes are needed, escalate to Solution Agent for correction.

---

### Dev Agent (Frontend/Backend)

**Responsibility**: Implement feature code based on detailed design and write unit tests

#### Input Knowledge

| Knowledge Type | Path | Loading Timing | Purpose |
|----------------|------|----------------|---------|
| Frontend/Backend Detailed Design | `projects/pXXX/03.designs/[platform]/[feature-name]-design.md` | Required, load first | Core input |
| Development Conventions | `knowledge/techs/conventions/` | Required | Code conventions, commit conventions |
| Frontend/Backend Architecture Details | `knowledge/techs/[platform]/` | On-demand | Reference when design document is ambiguous |
| Unit Testing Conventions | `knowledge/techs/conventions/testing.md` | Required | Test writing conventions |

#### Loading Strategy

```
1. Must load: Detailed design document + Development conventions + Testing conventions
2. On-demand load: Load architecture details to supplement understanding when design document is ambiguous
3. Do not load: PRD, Solution (already extracted by design document, avoid context bloat)
4. When ambiguity found: Do not assume, must escalate to Designer Agent for correction
```

#### Deliverables

| Deliverable | Path | Description |
|-------------|------|-------------|
| Feature Code | Source repository corresponding directory | Organized per architecture conventions |
| Unit Test Code | Source repository test directory | Commit synchronously with feature code |
| Development Task Record | `projects/pXXX/04.tasks/[platform]/[feature-name]-tasks.md` | Record completion status and pending issues |

---

### Test Agent (Frontend/Backend)

**Responsibility**: Generate test cases based on design documents and code, execute tests, output reports

#### Input Knowledge

| Knowledge Type | Path | Loading Timing | Purpose |
|----------------|------|----------------|---------|
| Frontend/Backend Detailed Design | `projects/pXXX/03.designs/[platform]/[feature-name]-design.md` | Required, load first | Basis for generating test cases |
| Solution Document | `projects/pXXX/02.solutions/[feature-name]-solution.md` | Required | Basis for acceptance test cases |
| Testing Conventions | `knowledge/techs/conventions/testing.md` | Required | Test case format, coverage requirements |
| PRD Document | `projects/pXXX/01.prds/[feature-name]-prd.md` | On-demand | Trace back when acceptance criteria is disputed |

#### Loading Strategy

```
1. Must load: Detailed design + Solution + Testing conventions
2. On-demand load: Load PRD to trace back when acceptance criteria is ambiguous
3. Do not load: Architecture documents, development conventions (testing doesn't care about implementation)
```

#### Deliverables

| Deliverable | Path | Format | Description |
|-------------|------|--------|-------------|
| Test Case Document | `projects/pXXX/05.tests/cases/[feature-name]-test-cases.md` | Per template | Includes acceptance and unit tests |
| Test Report | `projects/pXXX/05.tests/reports/[feature-name]-test-report.md` | Structured report | Includes pass rate, failure details |

---

## Knowledge Flow Panorama

```
knowledge/                          projects/pXXX/
├── bizs/system-overview.md ───�?   ├── 01.prds/          ←── PM Agent output
├── bizs/{platform}/{module}/ ──�?  �?                        (user confirmed)
├── domain/standards/ ───────�?     �?                            �?
├── domain/glossary/  ───────�?     ├── 02.solutions/     ←── Solution Agent output
�?                  PM Agent ───────�? (user confirmed)
�?                                         �?
├── techs/system/   ─────────── Solution Agent
├── techs/frontend/ ───�?
├── techs/backend/  ───�?     ├── 03.designs/
├── techs/data/     ───�?     �? ├── frontend/   ←── Frontend Designer Agent output
├── techs/conventions/ �?     �? └── backend/    ←── Backend Designer Agent output
�?                Designer Agent ─────�?         �?
�?                                         ├── 04.tasks/
�?                                         �? ├── frontend/ ←── Frontend Dev Agent output
├── techs/conventions/ ─────────────�? └── backend/  ←── Backend Dev Agent output
�?                Dev Agent                              �?
�?                                         └── 05.tests/
└── techs/conventions/testing.md        ├── cases/    ←── Test Agent output
                   Test Agent ────────────────── └── reports/
```

---

## Escalation Mechanism

When downstream discovers issues, escalate and correct along the following path:

```
Test Failure
  └→ Dev Agent fixes code
       └→ If design issue �?Designer Agent corrects detailed design
            └→ If solution issue �?Solution Agent corrects Solution
                 └→ If requirement issue �?PM Agent + user confirmation
```

**Principle**: Do not assume, do not skip levels, must trace back to the root cause.

---

## Manual Confirmation Nodes

| Node | Trigger Condition | Description |
|------|-------------------|-------------|
| PRD Confirmation | PM Agent completes PRD draft | User confirms requirement boundaries are correct before starting Solution phase |
| Solution Confirmation | Solution Agent completes solution | User confirms overall solution (UI/API/data model) is correct before starting design phase |
| Detailed Design Confirmation | Designer Agent completes frontend/backend detailed design | User confirms design solution is correct before starting development phase |
| Launch Confirmation | Test Agent completes test report | User confirms tests pass, no pending defects before launch |

