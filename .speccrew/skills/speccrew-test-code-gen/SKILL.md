---
name: speccrew-test-code-gen
description: Generates executable test code from confirmed test case documents. Reads test case matrix, platform technical conventions, and system design to produce well-structured test files with full traceability to test case IDs.
tools: Read, Write, Glob, Grep
---

# Trigger Scenarios

- When speccrew-test-manager dispatches test code generation after test cases are confirmed
- When user explicitly requests test code generation from confirmed test cases
- When user asks "Generate test code", "Create test files from test cases"

# Workflow

## Absolute Constraints

> **These rules apply to document generation steps (Step 7). Violation = task failure.**

1. **FORBIDDEN: `create_file` for plan document** — NEVER use `create_file` to write the test code plan document. It MUST be created by copying the template then filling sections with `search_replace`.

2. **FORBIDDEN: Full-file rewrite** — NEVER replace the entire document content in a single operation. Always use targeted `search_replace` on specific sections.

3. **MANDATORY: Template-first workflow** — Copy template MUST execute before filling sections.

4. **CLARIFICATION: Test source code is NOT template-filled** — Actual test code files in Step 6 are written directly. The template-fill workflow applies ONLY to the Code Plan document in Step 7.

## Step 1: Read Test Cases

Read the confirmed test case document specified by `test_cases_path`:

1. **Parse Test Case Matrix**: Extract TC ID, test steps, inputs, expected results
2. **Statistics**: Count total test cases and distribution by dimension (module, priority, type)
3. **Extract Test Data**: Identify test data definitions and fixtures required

### Test Case Document Structure Expected

| Section | Content to Extract |
|---------|-------------------|
| Test Case Matrix | TC ID, Description, Steps, Input, Expected Result |
| Test Data | Fixture definitions, test data sets |
| Preconditions | Setup requirements, mock data needs |

## Step 2: Read Technical Conventions

Load platform testing conventions to understand the target test framework:

### 2.1 Primary Convention Path

```
speccrew-workspace/knowledges/techs/{platform_id}/conventions-system-test.md
```

### 2.2 Unit Test Convention Path (Fallback)

If `conventions-system-test.md` does not exist or for unit test specifics, read:

```
speccrew-workspace/knowledges/techs/{platform_id}/conventions-unit-test.md
```

### 2.3 Generic Convention Path (Last Resort)

If neither conventions file exists, read `conventions-dev.md` and infer:

| Convention File | Inference Strategy |
|-----------------|-------------------|
| conventions-dev.md | Extract framework from tech stack, infer unit test framework |

### 2.4 Information to Extract

| Item | Purpose |
|------|---------|
| Test Framework | Jest, JUnit, pytest, Mocha, Go test, etc. |
| Test Directory | Where test files should be placed |
| File Naming | Test file naming conventions |
| Mock Strategy | How mocking is handled (jest.mock, unittest.mock, etc.) |
| Assertion Style | expect, assert, should, etc. |
| Fixture Location | Where to place shared fixtures |
| Helper Location | Where to place test helpers |

## Step 3: Read System Design

Read the system design document specified by `system_design_path`:

### 3.1 Understand Module Structure

- Identify module boundaries and responsibilities
- Map test cases to corresponding modules

### 3.2 Identify External Dependencies

For mocking strategy planning:

| Dependency Type | Mock Approach |
|-----------------|---------------|
| Database | Mock repository/DAO or use test database |
| External API | Mock HTTP client or use stub server |
| File System | Mock file operations or use temp directory |
| Message Queue | Mock producer/consumer |
| Cache | Mock cache client or use in-memory cache |

### 3.3 Confirm Interface Signatures

- Extract function/method signatures from design
- Identify parameter types and return types
- Note any complex data models that need test fixtures

## Step 4: Generate Code Plan

Create a comprehensive test code generation plan:

### 4.0 Determine File Grouping Strategy

Before organizing test files, determine the grouping strategy:

| Condition | Grouping Strategy |
|-----------|-------------------|
| Test cases share same module/component | Group into single test file |
| Test cases are independent | One test file per test case |
| Test cases span multiple modules | Create separate test files per module |

**File Grouping Rules:**

1. **IF test cases share same module/component THEN** group into single test file
2. **IF test cases are independent THEN** one test file per test case
3. **Maximum test cases per file:** 10 (split into multiple files if exceeded)
4. **Naming convention:** `{module-name}.test.{ext}` or `{module-name}.spec.{ext}`

### 4.1 Test File Structure Planning

Determine how test files are organized:

| Decision | Consideration |
|----------|---------------|
| Files per Module | Group tests by module or by feature |
| Single vs Multiple | One test file per source file, or split by test type |
| Integration Tests | Separate integration test files if needed |

### 4.2 Shared Resources Planning

| Resource Type | Decision Points |
|---------------|-----------------|
| Fixtures | Common test data (users, products, etc.) |
| Helpers | Reusable test utilities (setup, teardown, assertions) |
| Mocks | Shared mock definitions |

### 4.3 Mock/Stub Strategy

For each external dependency:

| Dependency | Mock Type | Implementation Approach |
|-----------|-----------|------------------------|
| {dependency_name} | mock/stub/spy | {how to implement} |

### 4.4 File-to-TestCase Mapping Table

| Test File | Test Cases Covered | Description |
|-----------|-------------------|-------------|
| {file_path} | TC-{MOD}-001, TC-{MOD}-002 | {brief description} |

## Step 5: Checkpoint - Present Code Plan for Confirmation

Present the code generation plan to user before generating actual code:

### Plan Summary Structure

```
Test Code Plan Summary: {feature_name}

Platform: {platform_id}
Test Framework: {framework}

Test Cases: {count} total
├── Module A: {count} cases
├── Module B: {count} cases
└── Module C: {count} cases

Test Files: {file_count} files
├── {file_1}: {case_count} cases
├── {file_2}: {case_count} cases
└── ...

Shared Resources:
├── Fixtures: {count} files
├── Helpers: {count} files
└── Mocks: {count} modules

Mock Strategy:
├── {dependency_1}: {mock_type}
├── {dependency_2}: {mock_type}
└── ...
```

### Confirmation Questions

Ask user to confirm:

1. Is the test file grouping appropriate?
2. Is the mock strategy correct for your environment?
3. Are there any additional shared resources needed?
4. Should I proceed with code generation?

**Wait for user confirmation before proceeding to Step 6.**

## Step 6: Generate Test Code

Execute the code plan, generating test files one by one:

### 6.1 TC ID Annotation Format

Every test function/method MUST have a TC ID comment:

```javascript
// TC-{MOD}-{SEQ}: {test case description}
test('should validate user input', () => {
  // test implementation
});
```

**Format Pattern**: `// TC-{MODULE}-{SEQUENCE}: {description}`

| Component | Format | Example |
|-----------|--------|---------|
| MODULE | 2-4 character module code | USR, ORD, PAY |
| SEQUENCE | 3-digit zero-padded number | 001, 002, 003 |
| description | Brief test case description | User login with valid credentials |

### 6.2 Test Code Structure (Arrange-Act-Assert)

Each test should follow clear structure:

```
// TC-{MOD}-{SEQ}: {description}
test('{test name}', () => {
  // Arrange - Setup test data and mocks
  const input = { ... };
  mockDependency.method.mockReturnValue(expectedValue);

  // Act - Execute the function under test
  const result = functionUnderTest(input);

  // Assert - Verify the outcome
  expect(result).toEqual(expectedOutput);
  expect(mockDependency.method).toHaveBeenCalledWith(expectedParams);
});
```

### 6.3 Platform-Specific Conventions

Follow conventions from `conventions-unit-test.md`:

| Platform | Convention Examples |
|----------|---------------------|
| Node.js/Jest | `describe`/`test`/`expect`, `jest.mock()` |
| Java/JUnit | `@Test`, `@Mock`, `when().thenReturn()` |
| Python/pytest | `def test_`, `@pytest.fixture`, `mocker.patch` |
| Go | `func TestXxx(t *testing.T)`, `gomock` |

### 6.4 Generate Shared Resources

Create fixtures and helpers:

**Fixtures** (`__fixtures__` or `fixtures/`):
```javascript
// users.fixture.js
module.exports = {
  validUser: {
    id: 'user-001',
    username: 'testuser',
    email: 'test@example.com'
  },
  adminUser: {
    id: 'admin-001',
    username: 'admin',
    role: 'ADMIN'
  }
};
```

**Helpers** (`__helpers__` or `helpers/`):
```javascript
// test.helpers.js
function createMockResponse(data) {
  return {
    json: jest.fn().mockReturnValue(data),
    status: jest.fn().mockReturnThis()
  };
}
module.exports = { createMockResponse };
```

### 6.5 Generation Order

Generate files in dependency order:

1. **Fixtures** - Test data definitions
2. **Helpers** - Test utilities
3. **Mocks** - Mock definitions (if separate files)
4. **Test Files** - Actual test code

## Step 7: Write Code Plan Document

Output the code plan document for traceability:

### 7.1 Copy Template to Document Path

1. **Read the template**: `templates/TEST-CODE-PLAN-TEMPLATE.md`
2. **Replace top-level placeholders** (feature name, platform, date, etc.)
3. **Create the document** using `create_file`:
   - Target path: `speccrew-workspace/iterations/{number}-{type}-{name}/05.system-test/code/{platform_id}/[feature]-test-code-plan.md`
   - Content: Template with top-level placeholders replaced
4. **Verify**: Document has complete section structure

### 7.2 Fill Each Section Using search_replace

Fill each section with code plan data from Step 4.

> ⚠️ **CRITICAL CONSTRAINTS:**
> - **FORBIDDEN: `create_file` to rewrite the entire document**
> - **MUST use `search_replace` to fill each section individually**
> - **All section titles MUST be preserved**

**Section Filling Guide:**

| Section | Content Source |
|---------|---------------|
| **File-to-TestCase Mapping** | From Step 4.4 |
| **Mock Strategy** | From Step 4.3 |
| **Shared Resources** | From Step 4.2 |
| **Test File Structure** | From Step 4.1 |

### Document Purpose

- Records file-to-test-case mapping
- Documents mock strategy decisions
- Provides reference for future test maintenance
- Enables traceability from test code to test cases

# Key Rules

| Rule | Description |
|------|-------------|
| **TC ID Traceability** | Every test function MUST have a TC ID comment |
| **Checkpoint Required** | Must confirm code plan with user before generating |
| Convention Compliance | Follow platform-specific conventions-unit-test.md |
| **Arrange-Act-Assert** | Maintain clear test structure |
| **Mock Strategy Documented** | All mocks documented in code plan |
| **No Test Execution** | This skill only generates code, does not run tests |

# Checklist

- [ ] Test case document read, all cases parsed
- [ ] Technical conventions loaded (conventions-unit-test.md or inferred)
- [ ] System design read, dependencies identified
- [ ] Code plan generated with file-to-case mapping
- [ ] Checkpoint passed: code plan confirmed with user
- [ ] Every test case ID has a corresponding test function
- [ ] Each test function has a TC ID annotation comment
- [ ] Mock/stub strategy covers all external dependencies
- [ ] Test code follows platform conventions-unit-test.md style
- [ ] Shared fixtures and helpers are extracted properly
- [ ] Arrange-Act-Assert structure maintained in tests
- [ ] Code plan document written to correct path

---

# Task Completion Report

Upon completion (success or failure), output the following report format:

## Success Report
```
## Task Completion Report
- **Status**: SUCCESS
- **Task ID**: <from dispatch context, e.g., "test-code-web-vue">
- **Platform**: <platform_id, e.g., "web-vue">
- **Phase**: test_code_gen
- **Output Files**:
  - `speccrew-workspace/iterations/{iteration}/05.system-test/code/{platform_id}/[feature]-test-code-plan.md`
  - <list of generated test source files>
- **Summary**: Test code generation completed with {file_count} files covering {case_count} test cases
```

## Failure Report
```
## Task Completion Report
- **Status**: FAILED
- **Task ID**: <from dispatch context>
- **Platform**: <platform_id>
- **Phase**: test_code_gen
- **Output Files**: <list of partial outputs or "None">
- **Summary**: Test code generation failed during {step}
- **Error**: <detailed error description>
- **Error Category**: DEPENDENCY_MISSING | BUILD_FAILURE | VALIDATION_ERROR | RUNTIME_ERROR | BLOCKED
- **Partial Outputs**: <list of partially generated files or "None">
- **Recovery Hint**: <suggestion for recovery, e.g., "Verify test case document format is valid">
```
