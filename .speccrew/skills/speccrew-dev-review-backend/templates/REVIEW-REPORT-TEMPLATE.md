# Backend Code Review Report

## Summary

- **Task ID**: {task_id}
- **Platform**: {platform_id}
- **Module**: {module_name}
- **Review Date**: {review_date}
- **Review Result**: PASS | PARTIAL | FAIL
- **Completeness**: {completed_files}/{total_files} ({percentage}%)

## File Completeness

| Category | Required | Created | Missing |
|----------|----------|---------|---------|
| Enums | {n} | {n} | {n} |
| DO | {n} | {n} | {n} |
| VO | {n} | {n} | {n} |
| Mapper | {n} | {n} | {n} |
| Service | {n} | {n} | {n} |
| Controller | {n} | {n} | {n} |
| Convert | {n} | {n} | {n} |
| **Total** | **{n}** | **{n}** | **{n}** |

## Missing Files

1. `{expected_path_1}`
2. `{expected_path_2}`
...

## Code Compliance Issues

### DO/VO/DTO Issues

| Severity | File | Issue Description |
|----------|------|-------------------|
| ERROR | `{file}` | {description} |
| WARN | `{file}` | {description} |

### Service Layer Issues

| Severity | File | Issue Description |
|----------|------|-------------------|
| ERROR | `{file}` | {description} |
| WARN | `{file}` | {description} |

### Controller Layer Issues

| Severity | File | Issue Description |
|----------|------|-------------------|
| ERROR | `{file}` | {description} |
| WARN | `{file}` | {description} |

### Database Mapping Issues

| Severity | File | Issue Description |
|----------|------|-------------------|
| ERROR | `{file}` | {description} |
| WARN | `{file}` | {description} |

## API Consistency Issues

| Severity | Endpoint | Issue Description |
|----------|----------|-------------------|
| ERROR | `{endpoint}` | {description} |
| WARN | `{endpoint}` | {description} |

## Business Logic Issues

| Severity | Method | Issue Description |
|----------|--------|-------------------|
| ERROR | `{method}` | {description} |
| WARN | `{method}` | {description} |

## Verdict

{Detailed verdict explanation based on findings. Explain why PASS, PARTIAL, or FAIL was assigned.}

## Re-dispatch Guidance

Priority items for next dev worker:

1. **{priority_item_1}** - {detailed description}
2. **{priority_item_2}** - {detailed description}
3. **{priority_item_3}** - {detailed description}

## Issue Statistics

| Severity | Count |
|----------|-------|
| CRITICAL | {n} |
| ERROR | {n} |
| WARN | {n} |
| LOW | {n} |
