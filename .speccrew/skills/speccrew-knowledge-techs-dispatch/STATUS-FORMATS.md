# Status File Formats (Techs Pipeline)

This document defines the JSON formats for techs pipeline status tracking files.

## File Locations

| Stage | File Path |
|-------|-----------|
| Stage 2 | `speccrew-workspace/knowledges/base/sync-state/knowledge-techs/stage2-status.json` |
| Stage 3 | `speccrew-workspace/knowledges/base/sync-state/knowledge-techs/stage3-status.json` |

---

## Stage 2: Platform Document Generation

**Generation Timing**: After Stage 2.5 Quality Synchronization completes

**Schema**:
```json
{
  "generated_at": "ISO-8601 timestamp",
  "stage": "platform-doc-generation",
  "total_platforms": "number",
  "completed": "number",
  "incomplete": "number",
  "failed": "number",
  "language": "string",
  "quality_checks": {
    "all_required_docs_present": "boolean",
    "language_consistent": "boolean",
    "traceability_verified": "boolean",
    "ui_analyzer_results": {
      "full": ["array of platform_ids"],
      "minimal": ["array of platform_ids"],
      "reference_only": ["array of platform_ids"],
      "not_applicable": ["array of platform_ids"]
    }
  },
  "platforms": [
    {
      "platform_id": "string",
      "platform_type": "string",
      "framework": "string",
      "status": "complete | incomplete | failed",
      "documents_generated": ["array of filenames"],
      "documents_missing": ["array of filenames"],
      "ui_style_level": "full | minimal | reference_only | not_applicable",
      "output_path": "string"
    }
  ]
}
```

**Example**:
```json
{
  "generated_at": "2024-01-15T10:30:00Z",
  "stage": "platform-doc-generation",
  "total_platforms": 3,
  "completed": 3,
  "incomplete": 0,
  "failed": 0,
  "language": "zh",
  "quality_checks": {
    "all_required_docs_present": true,
    "language_consistent": true,
    "traceability_verified": true,
    "ui_analyzer_results": {
      "full": ["web-react"],
      "minimal": [],
      "reference_only": [],
      "not_applicable": ["backend-nestjs"]
    }
  },
  "platforms": [
    {
      "platform_id": "web-react",
      "platform_type": "web",
      "framework": "react",
      "status": "complete",
      "documents_generated": [
        "INDEX.md",
        "tech-stack.md",
        "architecture.md",
        "conventions-design.md",
        "conventions-dev.md",
        "conventions-test.md",
        "conventions-build.md"
      ],
      "documents_missing": [],
      "ui_style_level": "full",
      "output_path": "speccrew-workspace/knowledges/techs/web-react/"
    },
    {
      "platform_id": "backend-nestjs",
      "platform_type": "backend",
      "framework": "nestjs",
      "status": "complete",
      "documents_generated": [
        "INDEX.md",
        "tech-stack.md",
        "architecture.md",
        "conventions-design.md",
        "conventions-dev.md",
        "conventions-test.md",
        "conventions-build.md",
        "conventions-data.md"
      ],
      "documents_missing": [],
      "ui_style_level": "not_applicable",
      "output_path": "speccrew-workspace/knowledges/techs/backend-nestjs/"
    }
  ]
}
```

---

## Stage 3: Root Index Generation

**Generation Timing**: After Stage 3 Worker completes

**Schema**:
```json
{
  "generated_at": "ISO-8601 timestamp",
  "stage": "root-index-generation",
  "status": "completed | failed",
  "platforms_indexed": "number",
  "index_file": "string (path to INDEX.md)"
}
```

**Example**:
```json
{
  "generated_at": "2024-01-15T10:35:00Z",
  "stage": "root-index-generation",
  "status": "completed",
  "platforms_indexed": 3,
  "index_file": "speccrew-workspace/knowledges/techs/INDEX.md"
}
```

---

## Field Reference

| Field | Type | Description |
|-------|------|-------------|
| `generated_at` | string | ISO 8601 timestamp |
| `stage` | string | Pipeline stage identifier |
| `total_platforms` | number | Total platforms dispatched (Stage 2) |
| `completed` | number | Platforms with all required documents (Stage 2) |
| `incomplete` | number | Platforms with missing required documents (Stage 2) |
| `failed` | number | Platforms with missing INDEX.md (Stage 2) |
| `language` | string | Language code used for document generation |
| `quality_checks` | object | Quality verification results from Stage 2.5 |
| `quality_checks.all_required_docs_present` | boolean | Whether all platforms have 7 required documents |
| `quality_checks.language_consistent` | boolean | Whether all documents match the target language |
| `quality_checks.traceability_verified` | boolean | Whether source traceability (<cite> blocks) verified |
| `quality_checks.ui_analyzer_results` | object | UI style analysis level per platform category |
| `quality_checks.ui_analyzer_results.full` | array | Platform IDs with full UI analysis |
| `quality_checks.ui_analyzer_results.minimal` | array | Platform IDs with minimal UI analysis |
| `quality_checks.ui_analyzer_results.reference_only` | array | Platform IDs with reference-only UI analysis |
| `quality_checks.ui_analyzer_results.not_applicable` | array | Backend platform IDs (no UI analysis) |
| `platforms[].platform_id` | string | Platform identifier |
| `platforms[].platform_type` | string | Platform type (web, mobile, backend, desktop) |
| `platforms[].framework` | string | Framework name |
| `platforms[].status` | string | Platform status: complete, incomplete, or failed |
| `platforms[].documents_generated` | array | List of generated document filenames |
| `platforms[].documents_missing` | array | List of missing required document filenames |
| `platforms[].ui_style_level` | string | UI analysis level: full, minimal, reference_only, not_applicable |
| `platforms_indexed` | number | Number of platforms in root index (Stage 3) |
| `index_file` | string | Path to generated INDEX.md (Stage 3) |

---

## Document Classification

### Required Documents (7)
All platforms MUST generate these documents:

1. `INDEX.md` - Platform overview and navigation
2. `tech-stack.md` - Technology stack specifications
3. `architecture.md` - Architecture patterns and decisions
4. `conventions-design.md` - Design conventions and patterns
5. `conventions-dev.md` - Development conventions and coding standards
6. `conventions-test.md` - Testing conventions and practices
7. `conventions-build.md` - Build configuration and deployment conventions

### Optional Documents (1)
Generated conditionally based on platform type and data layer detection:

- `conventions-data.md` - Data layer conventions (ORM, modeling, caching)
  - **Required for**: `backend` platforms
  - **Optional for**: `web`, `mobile`, `desktop` platforms (only if using ORM/data layer like Prisma, TypeORM, etc.)

### Platform-Specific Directories

- `ui-style/` - UI style documentation (frontend platforms only: web, mobile, desktop)
  - `ui-style-guide.md` - Generated by techs Stage 2
  - `styles/` - Generated by techs Stage 2
  - `page-types/`, `components/`, `layouts/` - Populated by bizs pipeline Stage 3.5
