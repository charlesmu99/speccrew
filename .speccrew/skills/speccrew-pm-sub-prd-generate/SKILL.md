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
| module_id | Yes | Module ID for feature registry (e.g., "M1", "M2") |
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

> **⚠️ CRITICAL: Two-Phase Strategy (Skeleton-First, Content-After)**
>
> This step MUST be executed in two phases to ensure consistent document structure.

### Phase A: Skeleton Construction (BEFORE any content filling)

1. Read PRD-TEMPLATE.md to identify the complete section structure
2. Count the number of features from `{module_features}` input
3. For Section 3.5 Feature Details, replicate the template's Feature block structure for EACH feature:
   - Copy the EXACT template structure (all 6 sub-sections) from PRD-TEMPLATE.md
   - Create `#### Feature 1: {feature_name}` through `#### Feature N: {feature_name}`
   - Each feature block MUST contain these 6 sub-section headers (copied from template):
     ```
     **Requirement Description:**
     [TO BE FILLED]
     
     **Interaction Flow:**
     [TO BE FILLED]
     
     **Boundary Conditions:**
     [TO BE FILLED]
     
     **Exception Scenarios:**
     [TO BE FILLED]
     
     **Operation Flow Diagram:**
     [TO BE FILLED]
     
     **Operation Steps Detail:**
     [TO BE FILLED]
     ```
4. Verify skeleton: confirm ALL features have ALL 6 sub-section headers before proceeding

> ⚠️ DO NOT start filling content until the complete skeleton is verified.

### Phase B: Content Filling (AFTER skeleton is complete)

Fill each `[TO BE FILLED]` placeholder with actual content:
- Requirement Description → Business requirements in business language
- Interaction Flow → User interaction steps (numbered list)
- Boundary Conditions → Table with Condition Type | Scenario | Handling Rule
- Exception Scenarios → Bullet list of exception handling
- Operation Flow Diagram → Mermaid `graph LR` diagram showing operation flow
- Operation Steps Detail → Table with Step | Action | Expected Outcome | Exception Handling

---

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
- 3.5 Feature Details: **FOR EACH feature in module_features, fill ALL 6 sub-sections below:**
  
  **Complete structure (MUST repeat for every Feature 1, 2, ... N):**
  - Requirement Description — **Business requirements in business language**
  - Interaction Flow — **User interaction steps in business terms**
  - Boundary Conditions table — **Business scenarios and business handling rules**
  - Exception Scenarios — **Business exception handling in business language**
  - Operation Flow Diagram — **Mermaid `graph LR` showing business operation steps (REQUIRED for EVERY feature)**
  - Operation Steps Detail — **Table: Step | Action | Expected Outcome | Business Exception Handling (REQUIRED for EVERY feature)**
  
  > ⚠️ **CRITICAL**: ALL features MUST have the SAME 6-section structure. DO NOT skip Operation Flow Diagram or Operation Steps Detail for ANY feature. Check the PRD-TEMPLATE.md for the exact format.

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

## Step 5: Write Module Features to Feature List

> **Purpose:** Separate feature data from dispatch plan into dedicated `.prd-feature-list.json` file.
> Each Sub-PRD Worker writes its module's features upon completion.

### 5.1 Determine Feature List File Path

```
feature_list_path = dirname(output_path) + '/.prd-feature-list.json'
```

This is the same directory containing `.sub-prd-dispatch-plan.json`.

### 5.2 Read or Initialize Feature List File

```javascript
IF file exists at feature_list_path:
  feature_list = read_json(feature_list_path)
ELSE:
  feature_list = {
    "created_at": "{timestamp from update-progress.js}",
    "updated_at": "{timestamp from update-progress.js}",
    "modules": []
  }
```

> ⚠️ **Timestamp constraint:** Use `node scripts/update-progress.js write-checkpoint` or similar script to get accurate timestamps. DO NOT fabricate timestamps.

### 5.3 Build Current Module Feature Entry

Construct the module entry from input parameters:

```json
{
  "module_id": "{module_id}",
  "module_name": "{module_name}",
  "module_key": "{module_key}",
  "source_prd": "{feature_name}-sub-{module_key}.md",
  "feature_count": {module_features.length},
  "features": [
    // Map each item in module_features to:
    {
      "feature_id": "{item.feature_id}",
      "feature_name": "{item.feature_name}",
      "type": "{item.type}",
      "priority": "{item.priority}",
      "sub_features": "{item.sub_features}",
      "description": "{item.description}"
    }
  ]
}
```

### 5.4 Merge into Feature List

```javascript
existing_index = find_index(feature_list.modules, m => m.module_key === module_key)

IF existing_index >= 0:
  // Retry scenario: replace existing entry
  feature_list.modules[existing_index] = module_entry
ELSE:
  // New module: append
  feature_list.modules.push(module_entry)

// Update timestamp
feature_list.updated_at = "{current timestamp}"
```

### 5.5 Write Feature List File

Write the updated `feature_list` to `{feature_list_path}` using `create_file`.

### 5.6 Report Result

```
IF write succeeds:
  → Output: "✅ Feature list updated: {feature_count} features for module {module_id}"
IF write fails:
  → Output: "⚠️ Feature list write failed: {error}"
  → Continue without blocking Sub-PRD completion
```

---

> **Note:** Step 5 is a pure incremental operation. Failure here should NOT affect the Sub-PRD file generation result. The primary deliverable is the Sub-PRD document itself.
