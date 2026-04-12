# Test Execution Results: {Feature Name}

> **Document Type**: Structured Execution Results  
> **Consumer**: speccrew-test-reporter  
> **Format Version**: 1.0

---

## 1. Execution Summary

| Item | Value |
|------|-------|
| Feature Name | {feature_name} |
| Platform | {platform_id} |
| Test Framework | {framework} |
| Execution Date | {date} |
| Total Duration | {duration} |
| Executor | speccrew-test-runner |

## 2. Results Overview

| Metric | Count | Percentage |
|--------|-------|------------|
| Total | {total} | 100% |
| Passed | {passed} | {pass_rate}% |
| Failed | {failed} | {fail_rate}% |
| Error | {error} | {error_rate}% |
| Skipped | {skipped} | {skip_rate}% |

## 3. Test Results Detail

| TC ID | Test Name | Status | Duration | Error Message |
|-------|-----------|--------|----------|---------------|
| {tc_id} | {test_name} | PASS/FAIL/ERROR/SKIP | {duration} | {message_or_empty} |

## 4. Deviation Analysis

### 4.1 Failed Tests (FAIL)

| TC ID | Test Name | Severity | Description |
|-------|-----------|----------|-------------|
| {tc_id} | {test_name} | High | {description} |

### 4.2 Runtime Errors (ERROR)

| TC ID | Test Name | Severity | Description |
|-------|-----------|----------|-------------|
| {tc_id} | {test_name} | Critical | {description} |

### 4.3 Skipped Tests (SKIP)

| TC ID | Test Name | Severity | Description |
|-------|-----------|----------|-------------|
| {tc_id} | {test_name} | Medium | {description} |

## 5. Environment Information

| Item | Value |
|------|-------|
| OS | {os} |
| Runtime | {runtime_version} |
| Test Framework | {framework_version} |
| Dependencies | {key_dependencies} |

## 6. Raw Output Excerpts

### 6.1 Standard Output (stdout)
```
{stdout_excerpt}
```

### 6.2 Standard Error (stderr)
```
{stderr_excerpt}
```

---

**Results Generated:** {timestamp}  
**Next Action:** Dispatch to speccrew-test-reporter for report generation
