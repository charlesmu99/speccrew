---
name: speccrew-test-code-gen
description: Generates executable test code from confirmed test case documents. Reads test case matrix, platform technical conventions, and system design to produce well-structured test files with full traceability to test case IDs.
tools: Read, Write, Glob, Grep
---

# Trigger Scenarios

- When speccrew-test-manager dispatches test code generation after test cases are confirmed
- When user explicitly requests test code generation from confirmed test cases
- When user asks "Generate test code", "Create test files from test cases"

## AgentFlow Definition

<!-- @agentflow: workflow.agentflow.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `speccrew-workspace/docs/rules/agentflow-spec.md`

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
  - `speccrew-workspace/iterations/{iteration}/06.system-test/code/{platform_id}/[feature]-test-code-plan.md`
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
