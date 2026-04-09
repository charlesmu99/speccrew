---
name: speccrew-test-execute
description: Executes generated test code, collects results, performs deviation detection against expected outcomes, and generates comprehensive test reports and individual bug reports for failed test cases.
tools: Read, Write, Glob, Grep, Terminal
---

# Trigger Scenarios

- When speccrew-test-manager dispatches test execution after test code is confirmed
- When user explicitly requests test execution and reporting
- When user mentions "run tests", "execute tests", "generate test report"

# Workflow

## Absolute Constraints

> **These rules apply to ALL document generation steps. Violation = task failure.**

1. **FORBIDDEN: `create_file` for documents** — NEVER use `create_file` to write test reports or bug reports. Documents MUST be created by copying the template then filling sections with `search_replace`.

2. **FORBIDDEN: Full-file rewrite** — NEVER replace the entire document content in a single operation. Always use targeted `search_replace` on specific sections.

3. **MANDATORY: Template-first workflow** — Copy template MUST execute before filling sections.

## Step 1: Read Inputs

Read the following documents in order:

1. **Test Cases Document**: `test_cases_path`
   - Contains test case definitions with TC IDs, descriptions, and expected results
   - Used for deviation detection against actual results

2. **Test Code Plan**: `test_code_plan_path`
   - Contains mapping between TC IDs and test file locations
   - Identifies platform_id and corresponding test framework

3. **Platform Configuration**:
   - Confirm platform_id (frontend/backend/desktop/mobile)
   - Identify test framework (jest/vitest/pytest/junit/etc.)

**Input Validation**:
- Verify all required paths are provided and files exist
- If any input is missing, report to user and stop

## Step 2: Environment Pre-check

Before executing tests, verify the environment is ready:

### 2.1 Check Test Dependencies

| Platform | Dependency Check Command |
|----------|--------------------------|
| Frontend | `npm ls jest` or `npm ls vitest` |
| Backend (Node) | `npm ls jest` or `npm ls mocha` |
| Backend (Python) | `pip show pytest` |
| Desktop | Platform-specific dependency check |
| Mobile | Platform-specific dependency check |

If dependencies are missing:
```
Environment Error: Missing test dependencies
- Missing: {dependency_name}
- Install command: {install_command}

Please install dependencies before proceeding.
```

### 2.2 Check Test Configuration Files

Verify test configuration files exist:

| Framework | Config Files |
|-----------|--------------|
| Jest | `jest.config.js`, `jest.config.ts`, or `jest` field in `package.json` |
| Vitest | `vitest.config.ts` or `vite.config.ts` with test section |
| Pytest | `pytest.ini`, `pyproject.toml`, or `setup.cfg` |
| JUnit | `junit.xml` or build tool configuration |

### 2.3 Check Service Dependencies

Determine if the system under test requires:
- Database service running
- API server running
- Mock services configured

**Checkpoint A**: If any environment check fails, report specific missing items and stop execution.

✋ **STOP IF FAILED**: IF any pre-check fails THEN:
1. Stop workflow immediately
2. Report all failures to user
3. Do NOT proceed to test execution
4. Fix all environment issues before retry

## Step 3: Execute Tests

### 3.1 Determine Test Command

Based on platform and framework, execute appropriate test command:

| Platform | Framework | Default Command |
|----------|-----------|-----------------|
| Frontend | Jest | `npm test -- --json --outputFile=test-results.json` |
| Frontend | Vitest | `npx vitest run --reporter=json --outputFile=test-results.json` |
| Backend | Jest | `npm test -- --json --outputFile=test-results.json` |
| Backend | Pytest | `pytest --json-report --json-report-file=test-results.json` |
| Desktop | Platform-specific | Depends on technology stack |
| Mobile | Platform-specific | Depends on technology stack |

### 3.2 Execute and Collect Output

Run the test command and collect:
- **Standard Output (stdout)**: Test progress and summary
- **Standard Error (stderr)**: Error messages and stack traces
- **Exit Code**: Success (0) or failure (non-zero)
- **Execution Duration**: Total time taken
- **Result Files**: JSON/XML reports if supported by framework

### 3.3 Handle Execution Errors

If test execution fails completely (e.g., syntax errors, configuration errors):
```
Test Execution Failed
- Error Type: {error_type}
- Error Message: {error_message}
- Suggested Fix: {suggestion}

Please fix the issue and retry.
```

## Step 4: Parse Results

### 4.1 Extract Test Summary

Parse test framework output to extract:

| Metric | Description |
|--------|-------------|
| Total | Total number of test cases executed |
| Passed | Number of passed tests |
| Failed | Number of failed tests |
| Errors | Number of tests with runtime errors |
| Skipped | Number of skipped tests |
| Duration | Total execution time |

### 4.2 Extract Failed Test Details

For each failed test, extract:
- **Test Function Name**: Full test name/suite
- **Error Message**: Primary error description
- **Stack Trace**: Call stack leading to failure
- **Assertion Details**: Expected vs actual values (if available)

### 4.3 Map Tests to TC IDs

Use TC ID comments in test code to reverse-map:
```
// TC-ID: TC-001
test('should validate user input', () => { ... });
```

Extract TC IDs from:
- Test file comments
- Test description patterns
- Test code plan mapping

## Step 5: Deviation Detection

### 5.1 Compare Expected vs Actual

For each test case:
1. Read expected result from test cases document
2. Compare with actual test result
3. Classify deviation type

### 5.2 Classify Deviation Types

| Type | Code | Description | Severity |
|------|------|-------------|----------|
| FAIL | FAIL | Test assertion failed - actual result differs from expected | High |
| ERROR | ERROR | Runtime error - code threw exception or crashed | Critical |
| SKIP | SKIP | Test was skipped - preconditions not met | Medium |
| FLAKY | FLAKY | Intermittent failure - non-deterministic behavior | High |

### 5.3 Root Cause Analysis

For each deviation, analyze:
- **Assertion Failure**: Which specific assertion failed and why
- **Runtime Error**: Exception type and location
- **Skip Reason**: Why test could not execute
- **Flaky Pattern**: Conditions causing intermittent failure

> 📋 **Output Requirement**: These root cause analysis results MUST be included in Step 6 Report under the "Recommendations" section. Each root cause should map to its corresponding test case ID for traceability.

## Step 6: Generate Test Report

### 6.1 Read Template

Read template: `speccrew-test-execute/templates/TEST-REPORT-TEMPLATE.md`

### 6.2 Copy Template to Report Path

1. **Read template** from Step 6.1
2. **Replace top-level placeholders** (feature name, platform, execution date, etc.)
3. **Create the document** using `create_file` at: `{output_dir}/{feature}-test-report.md`
4. **Verify**: Document has complete section structure

### 6.3 Fill Each Section Using search_replace

Fill each section with test execution data.

> ⚠️ **CRITICAL CONSTRAINTS:**
> - **FORBIDDEN: `create_file` to rewrite the entire document**
> - **MUST use `search_replace` to fill each section individually**
> - **All section titles MUST be preserved**

**Section Filling Guide:**

| Section | Content |
|---------|---------|
| **Execution Summary** | Feature name and platform, test framework and version, execution date and duration, overall pass rate |
| **Results Overview** | Counts and percentages for all result types, visual pass/fail indication |
| **Results by Test Dimension** | Breakdown by test type (happy path, boundary, exception, etc.), pass rate per dimension |
| **Failed Test Details** | Table of all failed tests, links to corresponding bug reports |
| **Coverage Status** | Requirement-to-test-case mapping, status per requirement |
| **Environment Information** | OS, runtime, framework versions, key dependencies |
| **Recommendations** | Priority fixes needed, suggested next steps |

## Step 7: Generate Bug Reports

### 7.1 Read Template

Read template: `speccrew-test-execute/templates/BUG-REPORT-TEMPLATE.md`

### 7.2 Copy Template for Each Bug Report

For each FAIL type failure:
1. **Read template** from Step 7.1: `templates/BUG-REPORT-TEMPLATE.md`
2. **Replace top-level placeholders** (Bug ID, feature name, TC ID)
3. **Create document** using `create_file` at: `{output_dir}/bugs/{feature}-bug-{seq}.md`

### 7.3 Fill Each Bug Report Using search_replace

For each bug report created in 7.2, fill sections using `search_replace`:

> ⚠️ **CRITICAL CONSTRAINTS:**
> - **FORBIDDEN: `create_file` to rewrite the entire document**
> - **MUST use `search_replace` to fill each section individually**

**Section Filling Guide:**

1. **Assign Bug ID**: `BUG-{feature}-{seq}` (sequential numbering)

2. **Determine Severity**:
   | Criteria | Severity |
   |----------|----------|
   | Blocks core functionality, no workaround | Critical |
   | Major feature broken, workaround exists | High |
   | Minor feature issue, cosmetic problem | Medium |
   | Enhancement, minor improvement | Low |

3. **Fill Bug Report Content**:
   - Bug title reflecting the failure
   - Related TC ID for traceability
   - Clear reproduction steps
   - Expected result from test case
   - Actual result from execution
   - Relevant error log excerpt
   - Suggested fix direction

### 7.4 Bug Report Quality Checklist

Each bug report must include:
- [ ] Unique Bug ID
- [ ] Related TC ID
- [ ] Severity classification
- [ ] Clear reproduction steps
- [ ] Expected vs actual result
- [ ] Relevant log excerpt
- [ ] Suggested fix direction

# Key Rules

| Rule | Description |
|------|-------------|
| **Environment First** | Always verify environment before running tests |
| **Complete Output Capture** | Capture both stdout and stderr for diagnostics |
| **TC ID Traceability** | Every failed test must be traced back to its TC ID |
| **One Bug Per File** | Each bug gets its own report file for tracking |
| **Severity Classification** | Always classify bug severity for prioritization |
| **Actionable Reports** | Bug reports must include suggested fix direction |

# Checklist

- [ ] Environment pre-check passed before execution
- [ ] All test files from code plan were executed
- [ ] Failed tests are correctly traced back to TC IDs
- [ ] Test report includes pass rate and failure details
- [ ] Each FAIL has a corresponding bug report with reproduction steps
- [ ] Bug severity is classified (Critical/High/Medium/Low)
- [ ] All bug reports written to correct output path
- [ ] Test report written to correct output path

---

# Task Completion Report

Upon completion (success or failure), output the following report format:

## Success Report
```
## Task Completion Report
- **Status**: SUCCESS
- **Task ID**: <from dispatch context, e.g., "test-exec-web-vue">
- **Platform**: <platform_id, e.g., "web-vue">
- **Phase**: test_execution
- **Output Files**:
  - `speccrew-workspace/iterations/{iteration}/05.system-test/reports/[feature]-test-report.md`
  - `speccrew-workspace/iterations/{iteration}/05.system-test/bugs/[feature]-bug-{seq}.md` (if any failures)
- **Summary**: Test execution completed with {passed}/{total} passed, {failed} failed, {skipped} skipped
```

## Failure Report
```
## Task Completion Report
- **Status**: FAILED
- **Task ID**: <from dispatch context>
- **Platform**: <platform_id>
- **Phase**: test_execution
- **Output Files**: <list of partial outputs or "None">
- **Summary**: Test execution failed during {step}
- **Error**: <detailed error description>
- **Error Category**: DEPENDENCY_MISSING | BUILD_FAILURE | VALIDATION_ERROR | RUNTIME_ERROR | BLOCKED
- **Partial Outputs**: <list of partially generated files or "None">
- **Recovery Hint**: <suggestion for recovery, e.g., "Check test dependencies are installed and test configuration is valid">
```
