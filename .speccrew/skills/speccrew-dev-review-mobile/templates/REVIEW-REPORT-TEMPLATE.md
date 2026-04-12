# Mobile Code Review Report

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
| Pages | {n} | {n} | {n} |
| Components | {n} | {n} | {n} |
| Store | {n} | {n} | {n} |
| API | {n} | {n} | {n} |
| Utils | {n} | {n} | {n} |
| Native Modules | {n} | {n} | {n} |
| **Total** | **{n}** | **{n}** | **{n}** |

## Missing Files

1. `{expected_path_1}`
2. `{expected_path_2}`
...

## Mobile Component Issues

| Severity | File | Issue Description |
|----------|------|-------------------|
| ERROR | `{file}` | {description} |
| WARN | `{file}` | {description} |

## Platform Adaptation Issues

| Severity | Aspect | Issue Description |
|----------|--------|-------------------|
| ERROR | iOS/Android | {description} |
| ERROR | Screen Adapt | {description} |
| ERROR | Safe Area | {description} |
| WARN | Platform API | {description} |

## Permission Handling Issues

| Severity | Permission | Issue Description |
|----------|------------|-------------------|
| ERROR | `{permission}` | {description} |
| WARN | `{permission}` | {description} |

## Offline Support Issues

| Severity | Aspect | Issue Description |
|----------|--------|-------------------|
| ERROR | Local Storage | {description} |
| ERROR | Sync Mechanism | {description} |
| ERROR | Network State | {description} |
| WARN | Queue Management | {description} |

## Performance Issues

| Severity | Aspect | Issue Description |
|----------|--------|-------------------|
| ERROR | List Rendering | {description} |
| ERROR | Memory Management | {description} |
| WARN | Image Optimization | {description} |
| WARN | Bundle Size | {description} |

## Verdict

{Detailed verdict explanation based on findings.}

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
