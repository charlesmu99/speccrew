---
name: SpecCrew-test-report
description: Test execution and reporting SOP. Based on PRD acceptance criteria and test cases, execute tests, record results, output test reports, and request deployment confirmation.
tools: Read, Write, Glob, Grep
---

# Trigger Scenarios

- Dev Agent completes code, user requests to start testing
- User mentions "start testing", "acceptance testing", "run tests"

# Workflow

## Step 1: Read Inputs

1. PRD Acceptance Criteria: `projects/pXXX/01.prds/[feature-name]-prd.md` (focus on "Acceptance Criteria" section)
2. API Contract: `projects/pXXX/02.solutions/[feature-name]-api-contract.md`
3. Development Task Records: `projects/pXXX/04.tasks/[frontend|backend]/[feature-name]-task.md` (understand deviations)
4. Testing Conventions: `SpecCrew-workspace/knowledge/architecture/conventions/testing.md`

## Step 2: Prepare Test Cases

Check if test case file exists: `projects/pXXX/05.tests/cases/[feature-name]-test-cases.md`

**If not, create one**, read template:
```
.qoder/skills/SpecCrew-test-report/templates/TEST-CASE-TEMPLATE.md
```

Decompose test cases from PRD acceptance criteria:

| Case ID | Test Scenario | Precondition | Steps | Expected Result |
|---------|---------------|--------------|-------|-----------------|
| AC-001 | [Scenario corresponding to acceptance criteria] | [Precondition] | [Steps] | [Expectation] |

**Coverage Requirements**:
- Each P0 acceptance criterion must have at least one corresponding test case
- Include both normal and exception flows

## Step 3: Execute Tests

Execute test cases one by one, record actual results:

| Case ID | Test Scenario | Result | Defect ID | Notes |
|---------|---------------|--------|-----------|-------|
| AC-001 | [Scenario] | Pass | - | |
| AC-002 | [Scenario] | Fail | BUG-001 | |

**When Bug Found**:
- Record complete reproduction steps, expected result, actual result
- Assign severity level (High/Medium/Low)
- **Do not modify code yourself**, record in report and continue testing remaining cases

## Step 4: Drift Detection (Implementation vs Design)

Read detailed design document: `projects/pXXX/03.designs/[frontend|backend]/[feature-name]-design.md`

Compare with actual code implementation, check for **unreported deviations**:

| Check Item | Design Description | Actual Implementation | Deviation? |
|------------|-------------------|----------------------|------------|
| [API path/response structure/business logic, etc.] | [Design requirement] | [Actual situation] | No / Warning Deviation |

**Check Strategy**:
- Whether API path, request parameters, response structure match API contract
- Whether key business logic is implemented as designed, without self-extension or simplification
- Whether deviations marked in task records have clear explanations

**When unreported deviation found**: List separately in test report, prompt user to decide whether to accept or rollback and fix

## Step 5: Generate Test Report

Read template: `.qoder/skills/SpecCrew-test-report/templates/TEST-REPORT-TEMPLATE.md`

Fill in test report, including:
- Overall conclusion (pass rate, remaining defects count)
- Acceptance test results details
- Defect list (complete description of each defect)
- Outstanding issues explanation (which defects will not be fixed this time and reasons)

Write path: `projects/pXXX/05.tests/reports/[feature-name]-test-report.md`

## Step 6: Handle Failed Cases

If any tests fail:
1. Inform user of defect details
2. Ask user to decide: rollback to Dev Agent for fix or accept as outstanding
3. Retest failed cases after fix is complete
4. Update test report

## Step 7: Request Deployment Confirmation

After all tests pass (or outstanding issues have clear resolution plans):

```
Testing Complete
- Test Report: projects/pXXX/05.tests/reports/[feature-name]-test-report.md
- Pass Rate: [X/Y] ([XX%])
- Remaining Defects: [N]

Please confirm the following:
1. Is the test conclusion acceptable?
2. Is the handling method for remaining defects approved?

Warning: After confirmation, the feature will enter the deployment process
```

# Checklist

- [ ] PRD acceptance criteria read, test cases correspond one-to-one with acceptance criteria
- [ ] All P0 acceptance criteria have corresponding test cases
- [ ] Test cases cover normal flow and main exception flows
- [ ] All test cases have been executed and results recorded
- [ ] Each defect has complete reproduction steps
- [ ] Checked against detailed design document for unreported deviations
- [ ] Test report generated and written to correct path
- [ ] Test summary displayed to user and deployment confirmation requested

