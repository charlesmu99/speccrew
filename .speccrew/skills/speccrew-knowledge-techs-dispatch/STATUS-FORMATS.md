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
      "workers": {
        "conventions": {
          "status": "completed | failed",
          "skill": "string",
          "done_file": "string",
          "analysis_file": "string"
        },
        "ui_style": {
          "status": "completed | skipped | failed",
          "skill": "string",
          "done_file": "string",
          "analysis_file": "string"
        }
      },
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
      "workers": {
        "conventions": {
          "status": "completed",
          "skill": "speccrew-knowledge-techs-generate-conventions",
          "done_file": "web-react.done-conventions.json",
          "analysis_file": "web-react.analysis-conventions.json"
        },
        "ui_style": {
          "status": "completed",
          "skill": "speccrew-knowledge-techs-generate-ui-style",
          "done_file": "web-react.done-ui-style.json",
          "analysis_file": "web-react.analysis-ui-style.json"
        }
      },
      "content_quality": "good",
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
      "ui_style_complete": true,
      "ui_analysis_level": "full",
      "topics_coverage": 83,
      "topics_missing": ["logging"],
      "min_doc_lines": 45,
      "checks": {
        "doc_existence": "pass",
        "language_check": "pass",
        "source_traceability": "pass",
        "content_non_empty": "pass",
        "topic_coverage": "pass",
        "ui_style_completeness": "pass"
      },
      "output_path": "speccrew-workspace/knowledges/techs/web-react/"
    },
    {
      "platform_id": "mobile-uniapp",
      "platform_type": "mobile",
      "framework": "uniapp",
      "status": "complete",
      "workers": {
        "conventions": {
          "status": "completed",
          "skill": "speccrew-knowledge-techs-generate-conventions",
          "done_file": "mobile-uniapp.done-conventions.json",
          "analysis_file": "mobile-uniapp.analysis-conventions.json"
        },
        "ui_style": {
          "status": "completed",
          "skill": "speccrew-knowledge-techs-generate-ui-style",
          "done_file": "mobile-uniapp.done-ui-style.json",
          "analysis_file": "mobile-uniapp.analysis-ui-style.json"
        }
      },
      "content_quality": "warning",
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
      "ui_style_level": "minimal",
      "ui_style_complete": false,
      "ui_analysis_level": "minimal",
      "topics_coverage": 52,
      "topics_missing": ["i18n", "logging", "file_upload"],
      "min_doc_lines": 18,
      "checks": {
        "doc_existence": "pass",
        "language_check": "pass",
        "source_traceability": "pass",
        "content_non_empty": "warning",
        "topic_coverage": "warning",
        "ui_style_completeness": "fail"
      },
      "output_path": "speccrew-workspace/knowledges/techs/mobile-uniapp/"
    },
    {
      "platform_id": "backend-nestjs",
      "platform_type": "backend",
      "framework": "nestjs",
      "status": "complete",
      "workers": {
        "conventions": {
          "status": "completed",
          "skill": "speccrew-knowledge-techs-generate-conventions",
          "done_file": "backend-nestjs.done-conventions.json",
          "analysis_file": "backend-nestjs.analysis-conventions.json"
        },
        "ui_style": {
          "status": "skipped",
          "reason": "Backend platform - ui-style not applicable"
        }
      },
      "content_quality": "good",
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
      "ui_style_complete": false,
      "ui_analysis_level": "none",
      "topics_coverage": 78,
      "topics_missing": [],
      "min_doc_lines": 62,
      "checks": {
        "doc_existence": "pass",
        "language_check": "pass",
        "source_traceability": "pass",
        "content_non_empty": "pass",
        "topic_coverage": "pass",
        "ui_style_completeness": "not_applicable"
      },
      "output_path": "speccrew-workspace/knowledges/techs/backend-nestjs/"
    }
  ],
  "cross_platform_checks": {
    "coverage_imbalance": true,
    "max_coverage_diff": 31,
    "details": "web-react (83%) vs mobile-uniapp (52%) - difference exceeds 30% threshold"
  },
  "overall_quality": "warning",
  "summary": "3 platforms analyzed. 2 good, 1 warning. mobile-uniapp needs attention: low topic coverage and incomplete ui-style."
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
| `platforms[].workers` | object | Worker status for conventions and ui-style |
| `platforms[].workers.conventions` | object | Conventions worker status |
| `platforms[].workers.conventions.status` | string | `completed` \| `failed` |
| `platforms[].workers.conventions.skill` | string | Skill name for conventions worker |
| `platforms[].workers.conventions.done_file` | string | Path to .done-conventions.json |
| `platforms[].workers.conventions.analysis_file` | string | Path to .analysis-conventions.json |
| `platforms[].workers.ui_style` | object | UI-style worker status |
| `platforms[].workers.ui_style.status` | string | `completed` \| `skipped` \| `failed` |
| `platforms[].workers.ui_style.skill` | string | Skill name for ui-style worker (when not skipped) |
| `platforms[].workers.ui_style.done_file` | string | Path to .done-ui-style.json (when not skipped) |
| `platforms[].workers.ui_style.analysis_file` | string | Path to .analysis-ui-style.json (when not skipped) |
| `platforms[].workers.ui_style.reason` | string | Reason for skipped status (backend platforms) |
| `platforms[].content_quality` | string | Overall quality: `good` \| `warning` \| `poor` |
| `platforms[].documents_generated` | array | List of generated document filenames |
| `platforms[].documents_missing` | array | List of missing required document filenames |
| `platforms[].ui_style_level` | string | UI analysis level: full, minimal, reference_only, not_applicable |
| `platforms[].ui_style_complete` | boolean | Whether all 5 ui-style files exist (frontend only) |
| `platforms[].ui_analysis_level` | string | From .done.json: `full` / `minimal` / `reference_only` / `none` |
| `platforms[].topics_coverage` | number | 0-100, from analysis.json coverage_percent |
| `platforms[].topics_missing` | array | List of topic names with status "not_found" |
| `platforms[].min_doc_lines` | number | Minimum line count across all generated documents |
| `platforms[].checks` | object | Per-check pass/warning/fail status |
| `platforms[].checks.doc_existence` | string | Document existence check result |
| `platforms[].checks.language_check` | string | Language consistency check result |
| `platforms[].checks.source_traceability` | string | Source traceability check result |
| `platforms[].checks.content_non_empty` | string | Content non-empty verification result |
| `platforms[].checks.topic_coverage` | string | Topic coverage verification result |
| `platforms[].checks.ui_style_completeness` | string | UI style completeness check result |
| `cross_platform_checks` | object | Cross-platform comparison results (top-level) |
| `cross_platform_checks.coverage_imbalance` | boolean | Whether coverage difference exceeds threshold |
| `cross_platform_checks.max_coverage_diff` | number | Maximum coverage difference between platforms |
| `cross_platform_checks.details` | string | Human-readable comparison details |
| `overall_quality` | string | Worst quality classification across all platforms |
| `summary` | string | Human-readable summary of quality status |
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

---

## Worker Completion Markers

After splitting techs-generate into two Workers (conventions + ui-style), completion markers are now separated by worker type.

### {platform_id}.done-conventions.json

Created by conventions Worker after completing conventions document generation.

```json
{
  "platform_id": "web-vue",
  "worker_type": "conventions",
  "status": "completed",
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
  "analysis_file": "web-vue.analysis-conventions.json",
  "completed_at": "2026-04-06T10:30:00Z"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `platform_id` | string | Yes | Platform identifier |
| `worker_type` | string | Yes | Always `"conventions"` |
| `status` | string | Yes | `completed` \| `failed` |
| `documents_generated` | string[] | Yes | List of generated document filenames |
| `analysis_file` | string | Yes | Path to corresponding analysis file |
| `completed_at` | string | Yes | ISO 8601 timestamp |

### {platform_id}.done-ui-style.json

Created by ui-style Worker after completing UI style document generation.

```json
{
  "platform_id": "web-vue",
  "worker_type": "ui-style",
  "status": "completed",
  "ui_analysis_level": "full",
  "documents_generated": [
    "ui-style/ui-style-guide.md",
    "ui-style/page-types/page-type-summary.md",
    "ui-style/components/component-library.md",
    "ui-style/components/common-components.md",
    "ui-style/components/business-components.md",
    "ui-style/layouts/page-layouts.md",
    "ui-style/layouts/navigation-patterns.md",
    "ui-style/styles/color-system.md",
    "ui-style/styles/typography.md",
    "ui-style/styles/spacing-system.md"
  ],
  "analysis_file": "web-vue.analysis-ui-style.json",
  "completed_at": "2026-04-06T10:35:00Z"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `platform_id` | string | Yes | Platform identifier |
| `worker_type` | string | Yes | Always `"ui-style"` |
| `status` | string | Yes | `completed` \| `failed` |
| `ui_analysis_level` | string | Yes | `full` \| `minimal` \| `reference_only` |
| `documents_generated` | string[] | Yes | List of generated document filenames |
| `analysis_file` | string | Yes | Path to corresponding analysis file |
| `completed_at` | string | Yes | ISO 8601 timestamp |

---

## Analysis Report Formats

### {platform_id}.analysis-conventions.json

Created by conventions Worker containing source code coverage analysis for conventions topics.

```json
{
  "platform_id": "web-vue",
  "platform_type": "web",
  "worker_type": "conventions",
  "analyzed_at": "2026-04-06T10:30:00Z",
  "topics": {
    "i18n": { "status": "found", "files_analyzed": [...], "notes": "..." },
    "authorization": { "status": "found", "files_analyzed": [...], "notes": "..." },
    "menu_registration": { "status": "found", "files_analyzed": [...], "notes": "..." },
    "data_dictionary": { "status": "not_found", "files_analyzed": [], "notes": "..." },
    "logging": { "status": "found", "files_analyzed": [...], "notes": "..." },
    "api_request_layer": { "status": "found", "files_analyzed": [...], "notes": "..." },
    "data_validation": { "status": "found", "files_analyzed": [...], "notes": "..." },
    "file_upload": { "status": "partial", "files_analyzed": [...], "notes": "..." }
  },
  "config_files_analyzed": ["package.json", "tsconfig.json", ".eslintrc.js", ...],
  "source_dirs_scanned": ["src/utils/", "src/store/", "src/router/", ...],
  "documents_generated": ["INDEX.md", "tech-stack.md", ...],
  "coverage_summary": {
    "total_topics": 8,
    "found": 5,
    "not_found": 1,
    "partial": 2,
    "coverage_percent": 75
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `platform_id` | string | Yes | Platform identifier |
| `platform_type` | string | Yes | Platform type |
| `worker_type` | string | Yes | Always `"conventions"` |
| `analyzed_at` | string | Yes | ISO 8601 timestamp |
| `topics` | object | Yes | Map of topic_name → { status, files_analyzed, notes } |
| `config_files_analyzed` | string[] | Yes | Config files read during analysis |
| `source_dirs_scanned` | string[] | Yes | Directories scanned |
| `documents_generated` | string[] | Yes | Documents created |
| `coverage_summary` | object | Yes | { total_topics, found, not_found, partial, coverage_percent } |

### {platform_id}.analysis-ui-style.json

Created by ui-style Worker containing source code coverage analysis for UI style topics.

```json
{
  "platform_id": "web-vue",
  "platform_type": "web",
  "worker_type": "ui-style",
  "analyzed_at": "2026-04-06T10:35:00Z",
  "ui_analysis_level": "full",
  "topics": {
    "page_types": { "status": "found", "count": 5, "files_analyzed": [...], "notes": "..." },
    "components": { "status": "found", "common_count": 12, "business_count": 8, "files_analyzed": [...], "notes": "..." },
    "layouts": { "status": "found", "count": 3, "files_analyzed": [...], "notes": "..." },
    "styles": { "status": "found", "files_analyzed": [...], "notes": "..." }
  },
  "source_dirs_scanned": ["src/views/", "src/components/", "src/layouts/", "src/styles/"],
  "documents_generated": ["ui-style/ui-style-guide.md", ...],
  "coverage_summary": {
    "total_topics": 4,
    "found": 4,
    "not_found": 0,
    "partial": 0,
    "coverage_percent": 100
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `platform_id` | string | Yes | Platform identifier |
| `platform_type` | string | Yes | Platform type |
| `worker_type` | string | Yes | Always `"ui-style"` |
| `analyzed_at` | string | Yes | ISO 8601 timestamp |
| `ui_analysis_level` | string | Yes | `full` \| `minimal` \| `reference_only` |
| `topics` | object | Yes | Map of topic_name → { status, count/common_count/business_count, files_analyzed, notes } |
| `source_dirs_scanned` | string[] | Yes | Directories scanned |
| `documents_generated` | string[] | Yes | Documents created |
| `coverage_summary` | object | Yes | { total_topics, found, not_found, partial, coverage_percent } |

### File Location

All marker files are stored in: `{knowledges_base}/techs/.sync-status/`

This directory should be created by the Dispatcher before launching Workers if it doesn't exist.

---

## Platform Completion Status Rules

A platform's overall status is determined by the combined status of its workers:

| conventions Worker | ui_style Worker | Platform Status | Notes |
|-------------------|-----------------|-----------------|-------|
| completed | completed | completed | All docs generated successfully |
| completed | skipped | completed | Backend platform, ui-style N/A |
| completed | failed | partial | Conventions usable, ui-style missing |
| failed | completed | failed | Core docs missing, platform unusable |
| failed | failed | failed | Complete failure |
| failed | skipped | failed | Backend platform, core docs missing |

**Key rule**: A platform is "completed" only when ALL expected workers have succeeded. For backend platforms, only the conventions worker is expected.
