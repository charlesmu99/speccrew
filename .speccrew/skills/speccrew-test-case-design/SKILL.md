---
name: speccrew-test-case-design
description: Designs structured test cases from Feature Spec and API Contract documents. Focuses on comprehensive test scenario analysis, test case matrix generation, and coverage traceability without involving any code implementation.
tools: Read, Write, Glob, Grep
---

# Trigger Scenarios

- When speccrew-test-manager dispatches test case design for a specific platform/feature
- When user explicitly requests test case design from feature specification
- When user asks "Design test cases for this feature" or "Create test case matrix"

## AgentFlow Definition

<!-- @agentflow: SKILL.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `speccrew-workspace/docs/rules/agentflow-spec.md`

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

---

# Task Completion Report

Upon completion (success or failure), output the following report format:

## Success Report
```
## Task Completion Report
- **Status**: SUCCESS
- **Task ID**: <from dispatch context, e.g., "test-case-web-vue">
- **Platform**: <platform_id, e.g., "web-vue">
- **Phase**: test_case_design
- **Output Files**:
  - `speccrew-workspace/iterations/{iteration}/06.system-test/cases/{platform_id}/[feature]-test-cases.md`
- **Summary**: Test case design completed with {count} test cases covering {dimensions} dimensions
```

## Failure Report
```
## Task Completion Report
- **Status**: FAILED
- **Task ID**: <from dispatch context>
- **Platform**: <platform_id>
- **Phase**: test_case_design
- **Output Files**: None
- **Summary**: Test case design failed during {step}
- **Error**: <detailed error description>
- **Error Category**: DEPENDENCY_MISSING | BUILD_FAILURE | VALIDATION_ERROR | RUNTIME_ERROR | BLOCKED
- **Partial Outputs**: <list of partially generated files or "None">
- **Recovery Hint**: <suggestion for recovery, e.g., "Check feature spec document exists at specified path">
```
