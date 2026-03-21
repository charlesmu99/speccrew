---
name: SpecCrew-knowledge-arch-init
description: Initialize architecture knowledge index for a specific platform by scanning RepoWiki documents. Used by Designer Agents to generate knowledge/architecture/{platform}/INDEX.md linking to technology-related RepoWiki files.
tools: Read, Write, Glob, Grep
---

# Initialize Architecture Knowledge

Generate `knowledge/architecture/{platform}/INDEX.md` by scanning RepoWiki for platform-specific technology documents.

## Trigger Scenarios

- "Initialize {{platform}} architecture knowledge"
- "Generate {{platform}} tech index"
- "Scan RepoWiki for {{platform}} docs"

## User

Designer Agents (frontend/backend/mobile/desktop)

## Input

- `platform`: Platform type (frontend/backend/mobile/desktop)

## Output

- `knowledge/architecture/{platform}/INDEX.md` - Architecture knowledge index

## Workflow

### Step 1: Receive Platform Parameter

Input must specify platform type:
- `frontend` - Web frontend technologies
- `backend` - Server-side technologies
- `mobile` - Mobile app technologies
- `desktop` - Desktop application technologies

### Step 2: Scan RepoWiki

Scan `repowiki/` for platform-specific documents:

**Identify by:**
- File/directory names containing platform keywords
- Content mentioning platform-specific technologies
- Related configuration files

| Platform | Keywords to Search |
|----------|-------------------|
| frontend | react, vue, angular, nextjs, frontend, web, ui |
| backend | api, server, backend, fastapi, express, django |
| mobile | ios, android, flutter, react-native, mobile |
| desktop | electron, tauri, desktop, windows, macos |

### Step 3: Categorize Documents

| Category | Criteria | Examples |
|----------|----------|----------|
| Tech Stack | Frameworks, libraries, tools | React 18, FastAPI, PostgreSQL |
| Components | Architecture components | router, service, repository |
| Conventions | Coding standards, patterns | naming, linting, structure |

### Step 4: Extract Information

For each document, extract:
- `name`: Component or technology name
- `version` or `description`: Version info or brief description
- `link`: Relative path in RepoWiki

### Step 5: Get Timestamp

Use `SpecCrew-get-timestamp` skill to get current timestamp:
```bash
bash SpecCrew-get-timestamp/scripts/get-timestamp.sh "ISO"
```

### Step 6: Fill Template

Use `templates/INDEX-TEMPLATE.md`:
- `{{platform}}`: Input platform type
- `{{GeneratedAt}}`: Timestamp from Step 5 (ISO format)
- `{{#each techStack}}`: List of technology entries
- `{{#each components}}`: List of component entries
- `{{#each conventions}}`: List of convention entries

### Step 7: Write Output

Create directory if not exists: `knowledge/architecture/{platform}/`

Write filled template to `knowledge/architecture/{platform}/INDEX.md`

### Step 8: Report

```
{{platform}} architecture index generated:
- Tech Stack: [N]
- Components: [N]
- Conventions: [N]
- Output: knowledge/architecture/{{platform}}/INDEX.md
```

## Checklist

- [ ] Platform parameter received
- [ ] RepoWiki scanned for platform-specific documents
- [ ] Documents categorized into techStack/components/conventions
- [ ] Information extracted from each document
- [ ] Template filled and written to output path
- [ ] Report generated

