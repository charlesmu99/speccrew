---
name: speccrew-test-case-design
description: Designs structured test cases from Feature Spec and API Contract documents. Focuses on comprehensive test scenario analysis, test case matrix generation, and coverage traceability without involving any code implementation.
tools: Read, Write, Glob, Grep
---

# Trigger Scenarios

- When speccrew-test-manager dispatches test case design for a specific platform/feature
- When user explicitly requests test case design from feature specification
- When user asks "Design test cases for this feature" or "Create test case matrix"

# Workflow

## Step 1: Read Feature Spec

Read the feature spec document specified by `feature_spec_path`:

**Default Path Pattern:**
```
speccrew-workspace/iterations/{number}-{type}-{name}/02.feature-design/[feature-name]-feature-spec.md
```

**Extract Key Information:**

| Section | What to Extract |
|---------|-----------------|
| Interaction Flow Description | User scenarios and interaction flows |
| Business Rule Constraints | Business rules and validation constraints |
| Data Field Definition | Field definitions, types, and constraints |
| Acceptance Criteria | Criteria for feature acceptance |

**For Master-Sub PRD Structure:**
- Read Master Feature Spec for cross-module scenarios
- Read Sub Feature Specs for module-specific scenarios

## Step 2: Read API Contract

If `api_contract_path` is provided, read the API contract document:

**Default Path Pattern:**
```
speccrew-workspace/iterations/{number}-{type}-{name}/02.feature-design/[feature-name]-api-contract.md
```

**Extract API Information:**

| Item | What to Extract |
|------|-----------------|
| Interface Endpoints | API paths and HTTP methods |
| Request/Response Format | Request body and response structure |
| Error Codes | Error code definitions and meanings |
| Interface Constraints | Rate limits, validation rules, etc. |

## Step 3: Read System Design

If `system_design_path` is provided, read the system design document:

**Default Path Pattern:**
```
speccrew-workspace/iterations/{number}-{type}-{name}/03.system-design/{platform_id}/[feature-name]-design.md
```

**Extract System Context:**

| Item | What to Extract |
|------|-----------------|
| Module Dependencies | How this feature depends on other modules |
| Platform Constraints | Platform-specific interaction constraints |
| Exception Handling | Error handling mechanisms |
| State Transitions | State flow if applicable |

## Step 3.5: Read Testing Conventions (Optional)

If available, read the system testing conventions for the platform:

**Path Pattern:**
```
speccrew-workspace/knowledges/techs/{platform_id}/conventions-system-test.md
```

**Extract Testing Conventions:**

| Item | What to Extract |
|------|-----------------|
| E2E Framework | End-to-end testing framework (Cypress, Playwright, etc.) |
| Integration Test Patterns | How integration tests are structured |
| Test Data Management | Fixtures, seeding, mock strategies |
| API Contract Testing | Contract testing conventions if applicable |

## Step 4: Analyze Test Dimensions

Systematically analyze test dimensions to ensure comprehensive coverage:

### 4.1 Functional Positive Tests (Happy Path)

| Analysis Focus | Description |
|----------------|-------------|
| Core User Scenarios | Main user flows from entry to completion |
| Data CRUD Operations | Create, Read, Update, Delete operations |
| Integration Points | Cross-module or external system interactions |

### 4.2 Boundary Value Tests

| Analysis Focus | Description |
|----------------|-------------|
| Numeric Boundaries | Min, max, zero, negative values |
| String Boundaries | Empty, max length, special characters |
| Time/Date Boundaries | Timezone, date range, format edge cases |
| Collection Boundaries | Empty list, single item, max items |

### 4.3 Exception/Error Handling Tests

| Analysis Focus | Description |
|----------------|-------------|
| Input Validation Errors | Invalid format, missing required fields |
| Business Rule Violations | Constraint violations, state conflicts |
| System Errors | Timeout, service unavailable |
| Data Errors | Not found, duplicate, conflict |

### 4.4 Business Rule Constraint Tests

| Analysis Focus | Description |
|----------------|-------------|
| Permission Rules | Role-based access, authorization checks |
| Data Constraints | Uniqueness, referential integrity |
| Workflow Rules | State transitions, approval flows |
| Calculation Rules | Price calculation, quantity limits |

### 4.5 Permission/Security Tests

| Analysis Focus | Description |
|----------------|-------------|
| Authentication | Unauthenticated access attempts |
| Authorization | Unauthorized operation attempts |
| Data Visibility | Cross-tenant or cross-user data access |
| Sensitive Data | PII handling, data masking |

### 4.6 Data Validation Tests

| Analysis Focus | Description |
|----------------|-------------|
| Format Validation | Email, phone, URL formats |
| Type Validation | String, number, boolean, date types |
| Constraint Validation | Required fields, length limits, ranges |
| Relationship Validation | Foreign key references, dependencies |

### 4.7 State Transition Tests (If Applicable)

| Analysis Focus | Description |
|----------------|-------------|
| Valid Transitions | Allowed state changes |
| Invalid Transitions | Prohibited state changes |
| Concurrent Transitions | Race conditions, locking |

## Step 5: Generate Test Case Matrix

Generate structured test cases based on the analysis. Each test case must include:

### 5.1 Test Case Naming Convention

**Format:** `TC-{MODULE}-{SEQ}`

| Component | Description | Example |
|-----------|-------------|---------|
| TC | Fixed prefix | TC |
| MODULE | Module abbreviation (3-4 letters) | ORD, USR, PRD |
| SEQ | Sequence number (3 digits) | 001, 002, 003 |

**Examples:**
- `TC-ORD-001` - Order module, test case 1
- `TC-USR-015` - User module, test case 15
- `TC-PRD-003` - Product module, test case 3

### 5.2 Test Case Structure

Each test case contains:

| Field | Description |
|-------|-------------|
| TC ID | Unique identifier following naming convention |
| Category | Test dimension classification |
| Description | Brief description of what is being tested |
| Preconditions | Required state before test execution |
| Steps | Numbered list of test execution steps |
| Input Data | Test data description or reference |
| Expected Result | Expected outcome after execution |
| Priority | P0-Critical / P1-High / P2-Medium / P3-Low |

### 5.3 Priority Definition

| Priority | Definition | Example Scenarios |
|----------|------------|-------------------|
| P0-Critical | Core functionality, blocks release | Happy path of main feature, security vulnerabilities |
| P1-High | Important functionality, significant impact | Key business rules, main error handling |
| P2-Medium | Standard functionality, moderate impact | Edge cases, secondary flows |
| P3-Low | Minor functionality, low impact | UI polish, rare edge cases |

## Step 6: Coverage Self-Check

### 6.1 Acceptance Criteria Coverage

Cross-reference test cases against Feature Spec acceptance criteria:

```
For each acceptance criterion:
  1. Find corresponding test case(s)
  2. Verify test case fully validates the criterion
  3. Mark coverage status
```

### 6.2 Coverage Traceability Matrix

Generate a matrix mapping requirements to test cases:

| Requirement ID | Requirement Description | Test Case IDs | Coverage Status |
|----------------|------------------------|---------------|-----------------|
| REQ-001 | {requirement text} | TC-{MOD}-001, TC-{MOD}-002 | Covered |
| REQ-002 | {requirement text} | - | Not Covered |

### 6.3 Uncovered Items Handling

For any uncovered acceptance criteria:

| Status | Action |
|--------|--------|
| Not Covered | Create new test case(s) or document reason for exclusion |
| Partially Covered | Add additional test cases for missing scenarios |

## Step 7: Write Output

### 7.1 Determine Output Path

**Test Case Design Document:**
```
speccrew-workspace/iterations/{number}-{type}-{name}/05.tests/cases/[feature-name]-test-case-design.md
```

### 7.2 Read Template

Read the template file:
```
speccrew-test-case-design/templates/TEST-CASE-DESIGN-TEMPLATE.md
```

### 7.3 Fill Template

Fill in the template with:

| Section | Content |
|---------|---------|
| Test Overview | Feature name, module, scope, related documents |
| Test Case Matrix | All test cases organized by category |
| Test Data Definition | Normal, boundary, and exception data sets |
| Coverage Traceability | Requirement-to-test-case mapping |
| Notes | Additional information and assumptions |

### 7.4 Write Document

Write the completed test case design document to the output path.

# Key Rules

| Rule | Description |
|------|-------------|
| **No Code Implementation** | Do NOT write actual test code, only test case specifications |
| **Coverage First** | Prioritize acceptance criteria coverage over exhaustive testing |
| **Clear Expected Results** | Every test case must have unambiguous expected result |
| **Traceability Required** | All test cases must trace back to requirements |
| **Naming Convention** | Strictly follow TC-{MODULE}-{SEQ} format |
| **Priority Alignment** | Test case priority should align with requirement priority |

# Checklist

- [ ] All acceptance criteria from Feature Spec have corresponding test cases
- [ ] Each test dimension has at least one test case (if applicable)
- [ ] Test case IDs follow naming convention (TC-{MODULE}-{SEQ})
- [ ] All test cases have clear expected results
- [ ] Coverage traceability matrix is complete
- [ ] Test data sets cover normal, boundary, and exception scenarios
- [ ] Priority assignments are consistent with requirement priorities
- [ ] Preconditions are clearly stated for each test case
- [ ] Steps are detailed enough for execution without ambiguity
- [ ] Document written to correct output path
