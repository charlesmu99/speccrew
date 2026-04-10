---
name: speccrew-pm-sub-prd-generate
description: Generate a single Sub-PRD document for one module. Used by PM Agent's worker dispatch to parallelize Sub-PRD generation across multiple modules. Each worker invocation generates one complete Sub-PRD file based on the PRD template.
tools: Read, Write, Glob, Grep
---

## PM Stage Content Boundary

> ⚠️ **This Sub-PRD MUST adhere to PM Stage Content Boundary:**
> - NO API endpoint definitions, HTTP methods, request/response JSON
> - NO Database table structures, ER diagrams, SQL queries
> - NO Design class diagrams, component diagrams, deployment diagrams
> - NO Code snippets, pseudocode, implementation logic
> - NO Technical terminology (e.g., UUID, JWT, REST, Microservice, JSON)
> - NO Technical metrics (e.g., "code files", "latency < 100ms", "CPU usage")
>
> **Required:** Use BUSINESS LANGUAGE ONLY.
> Describe WHAT business operation needs to happen, not HOW the system implements it.
>
> **ABORT CONDITIONS:**
> - IF any section being generated contains SQL, API definitions, or code → STOP
> - IF inherited module_requirements contain technical details → Strip them, use business descriptions only

# Trigger Scenarios

- PM Agent dispatches worker to generate Sub-PRD for a specific module
- Worker receives module context from PM Agent's dispatch plan

# Input Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| module_name | Yes | Human-readable module name (e.g., "Customer Management") |
| module_key | Yes | Module identifier for file naming (e.g., "customer") |
| module_scope | Yes | What this module covers |
| module_entities | Yes | Core business entities in this module |
| module_user_stories | Yes | User stories specific to this module |
| module_requirements | Yes | Functional requirements for this module (P0/P1/P2) |
| module_features | Yes | Feature Breakdown entries for this module (Feature IDs, Types, Dependencies) |
| module_dependencies | No | Dependencies on other modules |
| master_prd_path | Yes | Path to the Master PRD (for cross-referencing) |
| feature_name | Yes | System-level feature name (for file naming prefix) |
| template_path | Yes | Path to PRD-TEMPLATE.md |
| output_path | Yes | Full path for the Sub-PRD output file |

# Absolute Constraints

> **These rules apply to ALL document generation steps. Violation = task failure.**

1. **FORBIDDEN: Full-file rewrite** — NEVER replace the entire document content in a single operation. Always use targeted `search_replace` on specific sections.
2. **MANDATORY: Template-first workflow** — Copy template MUST execute before filling sections.

# Workflow

## Step 1: Load Context

1. Read Master PRD at `{master_prd_path}` to understand:
   - System-wide background and goals
   - Cross-module dependency matrix
   - This module's position in the overall system

2. Read PRD template at `{template_path}`

## Step 2: Create Sub-PRD File

1. Copy template content to `{output_path}` using `create_file`
2. Replace the title: `# PRD - [Feature Name]` → `# Sub-PRD - {module_name}`

## Step 3: Fill Module-Specific Content

Fill each section using `search_replace`:

### 3.1 Section 1: Background & Goals
- 1.1 Background: Why this module exists within the system, what problem it solves
- 1.2 Goals: Module-specific business objectives

### 3.2 Section 2: User Stories
- 2.1 Target Users: Users who interact with this specific module
- 2.2 User Scenarios: Module-specific user stories in "As a / I want / So that" format

### 3.3 Section 3: Functional Requirements
- 3.1 Use Case Diagram: Module-specific use case diagram (Mermaid flowchart TB) — **Business use cases showing user interactions — NOT system APIs or technical components**
- 3.2 Business Process Flow: Module-internal process flow — **Business process steps — NOT database operations or API calls**
- 3.3 Feature List: Module features with P0/P1/P2 priority — **Business feature descriptions — NOT technical implementation**
- 3.4 Feature Breakdown: **REQUIRED** — Fill with `{module_features}` data:
  - Feature ID, Feature Name, Type (User Interaction / Backend Process), Scope, Description
  - Feature Dependencies table
- 3.5 Feature Details: Detailed descriptions for each feature including:
  - Requirement Description — **Business requirements in business language**
  - Interaction Flow — **User interaction steps in business terms**
  - Boundary Conditions table — **Business scenarios and business handling rules**
  - Exception Scenarios — **Business exception handling in business language**

### 3.4 Section 4: Non-functional Requirements
- Module-specific performance, security, compatibility requirements
- Reference Master PRD for system-wide NFRs

### 3.5 Section 5: Acceptance Criteria
- 5.1 Must Have: Module-specific acceptance items
- 5.2 Should Have: Module-specific nice-to-have items

### 3.6 Section 6: Boundary Description
- 6.1 In Scope: What this module covers
- 6.2 Out of Scope: What this module explicitly does NOT cover

### 3.7 Section 7: Assumptions & Dependencies
- Dependencies on other modules (reference Master PRD dependency matrix)
- External system dependencies
- Prerequisites

> ⚠️ **FORBIDDEN: `create_file` to rewrite the entire document. MUST use `search_replace` per section.**

### ⚠️ Content Boundary Validation

Before filling each section, verify:
- Feature descriptions use BUSINESS language (✅ "Customer can view order history" ❌ "GET /api/orders returns JSON")
- Boundary conditions describe BUSINESS scenarios (✅ "Customer name is empty" ❌ "null pointer exception")
- Exception handling describes BUSINESS rules (✅ "Show friendly error message" ❌ "return HTTP 400")
- Process flows show BUSINESS steps (✅ "Customer submits order" ❌ "POST request to order service")

## Step 4: Verify Output

1. Read the generated file to verify:
   - File exists and is non-empty
   - File size > 3KB (not a placeholder)
   - Section 3.4 Feature Breakdown is populated
   - Title contains module name

2. Report result:

```
IF verification passes:
  → Output: "✅ Sub-PRD generated: {output_path}"
IF verification fails:
  → Output: "❌ Sub-PRD verification failed: {reason}"
  → Attempt to fix the specific issue
```
