# Test Report - [Feature Name]

> Test Cases: [Link to 05.tests/cases/[feature-name]-test-cases.md]
> Test Date: [Date]
> Test Executor: [Name]

---

## Overall Conclusion

| Item | Result |
|------|--------|
| Test Conclusion | Pass / Fail |
| Total Cases | [Count] |
| Passed | [Count] |
| Failed | [Count] |
| Skipped | [Count] |
| Pass Rate | [XX%] |
| Remaining Defects | [Count] |

---

## Quality Score

> Multi-dimensional metrics for code quality assessment beyond functional testing

| Metric | Scoring Criteria | Result | Notes |
|--------|------------------|--------|-------|
| **Convention Deviation Count** | 0 = Excellent / 1-2 = Acceptable / >2 = Needs Improvement | [N] | [Deviation summary] |
| **Unreported Deviation Count** | 0 = Excellent / 1 = Acceptable / >1 = Needs Improvement | [N] | [Deviation summary] |
| **Drift Detection Result** | No Drift / Warning: Reported Deviation / Unreported Drift | [Conclusion] | [Notes] |
| **Code Convention Compliance** | Pass lint / Has warnings / Has errors | [Result] | [Notes] |
| **Test Coverage** | [XX%] | [Result] | [Notes] |

**Scoring Notes**:
- **Convention Deviation**: Number of deviations between code implementation and development conventions (naming, layering, etc.)
- **Unreported Deviation**: Number of deviations between implementation and design documents not explained in task records
- **Drift Detection**: Check for unreported implementation deviations against detailed design documents

---

## Acceptance Test Results

| Case ID | Test Scenario | Result | Defect ID | Notes |
|---------|---------------|--------|-----------|-------|
| AC-001 | [Scenario] | Pass | - | |
| AC-002 | [Scenario] | Fail | BUG-001 | |

## Unit Test Results

| Case ID | Test Target | Result | Defect ID | Notes |
|---------|-------------|--------|-----------|-------|
| UT-FE-001 | [Component/Function] | Pass | - | |
| UT-BE-001 | [Function/Method] | Pass | - | |

---

## Defect List

### BUG-001: [Defect Title]

| Field | Content |
|-------|---------|
| Severity | High / Medium / Low |
| Reproduction Steps | 1. [Step] 2. [Step] |
| Expected Result | [Expected] |
| Actual Result | [Actual] |
| Status | Pending / In Fix / Fixed |
| Handler | [Name] |

---

## Outstanding Issues

[Explain which issues will not be fixed this time, reasons, and follow-up plans]

---

**Report Conclusion:** Recommended for deployment / Retest after fix / Not recommended for deployment
**Confirmed by:** [Name]
**Confirmation Date:** [Date]
