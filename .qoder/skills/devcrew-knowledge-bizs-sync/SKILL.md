---
name: devcrew-knowledge-bizs-sync
description: Synchronize bizs business knowledge index with RepoWiki. Check consistency between knowledge/bizs/INDEX.md and current RepoWiki state, report differences.
tools: Read, Write, Glob, Grep
---

# Sync bizs Business Knowledge

Check consistency between `knowledge/bizs/INDEX.md` and RepoWiki, generate sync report.

## Trigger Scenarios

- "Sync bizs knowledge"
- "Check bizs knowledge outdated"
- "Verify business knowledge consistency"

## User

Solution Agent

## Input

None (reads existing INDEX.md and scans RepoWiki)

## Output

- Sync report (console output or file)

## Workflow

### Step 1: Read Current Index

Read `knowledge/bizs/INDEX.md` to get current state:
- List of modules
- List of flows
- List of models

### Step 2: Scan RepoWiki

Scan `.qoder/repowiki/` for current business documents.

### Step 3: Compare

Compare INDEX.md entries with RepoWiki reality:

| Status | Meaning |
|--------|---------|
| ‚ú?Sync | Document exists in both, no changes |
| ‚ö†Ô∏è Modified | Document exists but content changed |
| ‚ù?Missing | In INDEX.md but not in RepoWiki |
| üÜï New | In RepoWiki but not in INDEX.md |

### Step 4: Generate Report

```markdown
## bizs Knowledge Sync Report - {{Date}}

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

### Step 5: Output

Write report to `devcrew-workspace/docs/bizs-sync-{{Date}}.md` or display in console.

## Checklist

- [ ] Current INDEX.md read
- [ ] RepoWiki scanned
- [ ] Comparison completed
- [ ] Sync report generated
- [ ] Output delivered
