# Desktop Code Review Report

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
| Main Process | {n} | {n} | {n} |
| Renderer | {n} | {n} | {n} |
| Preload | {n} | {n} | {n} |
| IPC Handlers | {n} | {n} | {n} |
| Native Modules | {n} | {n} | {n} |
| **Total** | **{n}** | **{n}** | **{n}** |

## Missing Files

1. `{expected_path_1}`
2. `{expected_path_2}`
...

## Process Separation Issues

| Severity | File | Issue Description |
|----------|------|-------------------|
| CRITICAL | `{file}` | {description} |
| ERROR | `{file}` | {description} |

## IPC Channel Issues

| Severity | Channel | Issue Description |
|----------|---------|-------------------|
| CRITICAL | `{channel}` | {description} |
| ERROR | `{channel}` | {description} |
| WARN | `{channel}` | {description} |

## Security Isolation Issues

| Severity | Aspect | Issue Description |
|----------|--------|-------------------|
| CRITICAL | contextBridge | {description} |
| CRITICAL | Preload Script | {description} |
| ERROR | CSP Headers | {description} |
| CRITICAL | Remote Content | {description} |

## Native Integration Issues

| Severity | Feature | Issue Description |
|----------|---------|-------------------|
| CRITICAL | File System | {description} |
| ERROR | Native Menus | {description} |
| ERROR | System Tray | {description} |
| WARN | Notifications | {description} |

## Packaging Configuration Issues

| Severity | Aspect | Issue Description |
|----------|--------|-------------------|
| ERROR | Build Config | {description} |
| ERROR | Assets | {description} |
| WARN | Signing | {description} |
| WARN | Auto-Update | {description} |

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
