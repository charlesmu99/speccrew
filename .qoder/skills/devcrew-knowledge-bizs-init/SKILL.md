---
name: devcrew-knowledge-bizs-init
description: Initialize bizs business knowledge index by scanning RepoWiki documents. Used by Solution Agent to generate knowledge/bizs/INDEX.md linking to business-related RepoWiki files.
tools: Read, Write, Glob, Grep
---

# Initialize bizs Business Knowledge

Generate `knowledge/bizs/INDEX.md` by scanning RepoWiki for business-related documents.

## Trigger Scenarios

- "Initialize bizs knowledge"
- "Generate business knowledge index"
- "Scan RepoWiki for business modules"

## User

Solution Agent

## Input

None (automatically scans RepoWiki)

## Output

- `knowledge/bizs/INDEX.md` - Business knowledge index with links to RepoWiki

## Workflow

### Step 1: Scan RepoWiki

Scan `.qoder/repowiki/` directory for business-related documents:

**Identify by:**
- File names containing: module, business, flow, process, domain
- Content mentioning: user, order, product, payment, etc.
- Directory structure: bizs/, modules/, flows/, domain/

### Step 2: Categorize Documents

| Category | Criteria | Examples |
|----------|----------|----------|
| Modules | Standalone business capabilities | user-management, order-system |
| Flows | Business processes spanning modules | user-registration, order-payment |
| Models | Data entities | user, order, product |

### Step 3: Extract Information

For each document, extract:
- `name`: Document title or file name
- `description`: First paragraph or summary section
- `link`: Relative path in RepoWiki

### Step 4: Fill Template

Use `templates/INDEX-TEMPLATE.md`:
- `{{GeneratedAt}}`: Current timestamp
- `{{#each modules}}`: List of module entries
- `{{#each flows}}`: List of flow entries
- `{{#each models}}`: List of model entries

### Step 5: Write Output

Write filled template to `knowledge/bizs/INDEX.md`

### Step 6: Report

```
bizs knowledge index generated:
- Modules: [N]
- Flows: [N]
- Models: [N]
- Output: knowledge/bizs/INDEX.md
```

## Checklist

- [ ] RepoWiki scanned for business documents
- [ ] Documents categorized into modules/flows/models
- [ ] Information extracted from each document
- [ ] Template filled and written to output path
- [ ] Report generated
