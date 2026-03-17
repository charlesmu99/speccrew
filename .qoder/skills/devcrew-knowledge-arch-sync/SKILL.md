---
name: devcrew-knowledge-arch-sync
description: Synchronize architecture knowledge index with RepoWiki for a specific platform. Check consistency between knowledge/architecture/{platform}/INDEX.md and current RepoWiki state, report differences.
tools: Read, Write, Glob, Grep
---

# Sync Architecture Knowledge

Check consistency between `knowledge/architecture/{platform}/INDEX.md` and RepoWiki, generate sync report.

## Trigger Scenarios

- "Sync {{platform}} architecture knowledge"
- "Check {{platform}} arch knowledge outdated"
- "Verify {{platform}} tech consistency"

## User

Designer Agents

## Input

- `platform`: Platform type (frontend/backend/mobile/desktop)

## Output

- Sync report (console output or file)

## Workflow

### Step 1: Receive Platform Parameter

Input must specify platform type to sync.

### Step 2: Read Current Index

Read `knowledge/architecture/{platform}/INDEX.md` to get current state:
- List of tech stack entries
- List of components
- List of conventions

### Step 3: Scan RepoWiki

Scan `.qoder/repowiki/` for current platform-specific documents.

### Step 4: Compare

Compare INDEX.md entries with RepoWiki reality:

| Status | Meaning |
|--------|---------|
| ✅ Sync | Document exists in both, no changes |
| ⚠️ Modified | Document exists but content changed |
| ❌ Missing | In INDEX.md but not in RepoWiki |
| 🆕 New | In RepoWiki but not in INDEX.md |

### Step 5: Generate Report

```markdown
## {{platform}} Architecture Sync Report - {{Date}}

### Summary
- Total in INDEX: [N]
- Total in RepoWiki: [N]
- Sync: [N]
- Modified: [N]
- Missing: [N]
- New: [N]

### Modified Documents
| Name | Location |
|------|----------|
| [name] | [link] |

### Missing Documents (need removal from INDEX)
| Name | Current Location |
|------|------------------|
| [name] | [link] |

### New Documents (need addition to INDEX)
| Name | Location |
|------|----------|
| [name] | [link] |

### Recommendations
- [ ] Update modified entries
- [ ] Remove missing entries
- [ ] Add new entries
```

### Step 6: Output

Write report to `devcrew-workspace/docs/{{platform}}-arch-sync-{{Date}}.md` or display in console.

## Checklist

- [ ] Platform parameter received
- [ ] Current INDEX.md read
- [ ] RepoWiki scanned
- [ ] Comparison completed
- [ ] Sync report generated
- [ ] Output delivered
