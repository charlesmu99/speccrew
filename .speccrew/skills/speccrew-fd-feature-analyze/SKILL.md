---
name: speccrew-fd-feature-analyze
description: Feature Analysis SOP. Reads PRD documents and system knowledge to produce function decomposition with system relationship markers. Outputs .feature-analysis.md as interface contract for downstream design skills. Use when Feature Designer needs to analyze and decompose PRD requirements before design phase.
tools: Read, Write, Glob, Grep
---

# Methodology Foundation

This skill applies ISA-95 Stages 1-3 as an internal thinking framework for analysis:

| ISA-95 Stage | Analysis Purpose |
|--------------|------------------|
| Stage 1: Domain Description | Understand business context, scope boundaries, glossary |
| Stage 2: Information Flows | Identify data sources, destinations, and cross-module exchanges |
| Stage 3: Categories of Information | Classify data entities and establish information hierarchy |

> ⚠️ **No separate modeling documents.** The methodology guides thinking quality, not document quantity.

# Trigger Scenarios

- PRD has been confirmed, user requests to start feature analysis
- Feature Designer Agent needs to decompose PRD into functions before design
- User asks "Analyze this feature" or "Break down this requirement"

# Workflow

## Absolute Constraints

> **Violation = task failure**

1. **FORBIDDEN: Script execution failure** — If `update-progress.js` fails, HARD STOP and report error
2. **FORBIDDEN: Hand-written `.checkpoints.json`** — ALWAYS use `update-progress.js` script
3. **FORBIDDEN: Skip Checkpoint A** — User confirmation required before proceeding to design phase (unless `skip_checkpoint=true`)
4. **FORBIDDEN: Rename features** — Output filename MUST use the exact `feature_name` parameter value. DO NOT translate, abbreviate, paraphrase, or substitute with alternative names found in PRD content. The `feature_name` parameter is the SINGLE SOURCE OF TRUTH for file naming.

## Step 1: Read PRD Input

### 1.1 Input Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `prd_path` | Yes | Path to the Sub-PRD document |
| `feature_id` | No | Feature identifier (e.g., `F-CRM-01`) |
| `feature_name` | No | Feature name in English (e.g., `customer-list`) |
| `feature_type` | No | `Page+API` or `API-only` |
| `iteration_id` | No | Current iteration identifier |
| `frontend_platforms` | No | List of frontend platforms (auto-discover if not provided) |
| `skip_checkpoint` | No | Boolean, default `false`. Skip Checkpoint A if `true` |

### 1.2 Read PRD

Read the PRD document at `{prd_path}` (typically `speccrew-workspace/iterations/{number}-{type}-{name}/01.product-requirement/[module-name]-prd.md`)

### 1.3 Focus on Specific Feature (when feature_id provided)

If `feature_id` is provided:
- Locate the specific Feature in PRD Section 3.4 "Feature Breakdown"
- Extract only the user stories and requirements related to this Feature
- Ignore other Features in the same PRD

### 1.4 Backward Compatibility (when feature_id not provided)

If `feature_id` is NOT provided, process entire PRD using legacy mode.

## Step 2: Load System Knowledge

### 2.1 Read System Overview

Read: `speccrew-workspace/knowledges/bizs/system-overview.md`

### 2.2 Load Related Module Overviews

Based on PRD content, identify related modules and read:
```
speccrew-workspace/knowledges/bizs/{module-name}/{module-name}-overview.md
```

### 2.2b Discover Frontend Platforms

Read `speccrew-workspace/knowledges/techs/techs-manifest.json` to identify frontend platforms:

| Platform Type | Examples |
|---------------|----------|
| `web-*` | web-vue, web-react |
| `mobile-*` | mobile-uniapp, mobile-flutter |

- If `frontend_platforms` parameter provided, use that list
- Otherwise, read techs-manifest.json directly

### 2.3 Query Knowledge Graph (Optional)

If cross-module relationships need analysis, use `speccrew-knowledge-graph-query` skill.

## Step 3: Function Breakdown

Break down PRD functional requirements into implementable system functions.

### 3.1 Feature-Based Decomposition (when feature_id provided)

When processing a single Feature:

1. **Extract Feature Scope**: From PRD Section 3.4, locate the specific Feature by `feature_id`
2. **Identify Related User Stories**: Extract only user stories mapped to this Feature
3. **Decompose into Functions**: Break down into 3-8 focused Functions
4. **Check feature_type**: Mark `API-only` for backend-only design

### 3.2 Full PRD Decomposition (backward compatibility)

When `feature_id` is NOT provided (legacy mode):
- Decompose entire PRD into all required Functions
- May result in 10-20 Functions for complex modules

### 3.3 Function Analysis

For each function, identify:

| Aspect | Analysis Content |
|--------|------------------|
| **Frontend Changes** | New pages, components, or modifications to existing UI |
| **Backend Changes** | New interfaces or modifications to existing logic |
| **Data Changes** | New data structures or modifications to existing data |
| **System Relationship** | How this relates to existing system capabilities |

### Mark Relationship to Existing System

| Marker | Meaning | Example |
|--------|---------|---------|
| `[EXISTING]` | Reuse current system capability | `[EXISTING] User authentication system` |
| `[MODIFIED]` | Enhance/change existing feature | `[MODIFIED] Add validation to user profile form` |
| `[NEW]` | Create brand new functionality | `[NEW] Order management module` |

### Checkpoint A: Present Function Breakdown for Confirmation

**Conditional Execution:** If `skip_checkpoint=true`, skip user confirmation and proceed to Step 4.

If `skip_checkpoint=false` (default):
1. Present function breakdown with [EXISTING]/[MODIFIED]/[NEW] markers to user
2. Ask: "Does this function breakdown align with your understanding of the requirements?"
3. **HARD STOP** — Wait for user confirmation before proceeding

### Checkpoint A Progress Update

After user confirms (or if skipped):

```bash
node speccrew-workspace/scripts/update-progress.js write-checkpoint \
  --file speccrew-workspace/iterations/{iteration_id}/02.feature-design/.checkpoints.json \
  --stage 02_feature_design \
  --checkpoint function_decomposition \
  --passed true
```

Log: "✅ Checkpoint A (function_decomposition) passed and recorded"

## Step 4: Write Output Contract

Write analysis results to `.feature-analysis.md`:

### Output Path

| Mode | Output Path |
|------|-------------|
| With feature_id | `{prd_parent}/02.feature-design/{feature-id}-{feature-name}.feature-analysis.md` |
| Legacy mode | `{prd_parent}/02.feature-design/.feature-analysis.md` |

**CRITICAL — Filename Lock Rule:**
- `{feature-name}` in the output path MUST be the exact value of the `feature_name` parameter
- If PRD uses a different name for the same feature → use `feature_name` parameter for filename, note the discrepancy in the document header
- Example: parameter `feature_name = "店铺信息管理"` → filename MUST contain "店铺信息管理", NOT "shop-management" or "多店切换"

### Output Structure

```markdown
# Feature Analysis: {feature-name}

## Feature Information
- Feature ID: {feature_id}
- Feature Name: {feature_name}
- Feature Type: {feature_type}
- Source PRD: {prd_path}

## System Context Summary
[System knowledge and module overviews summary]

## Frontend Platforms
[List from techs-manifest.json]

## Function Breakdown (Total: {N} functions)

| # | Function Name | Type | Related User Stories | System Relationship |
|---|--------------|------|---------------------|---------------------|
| 1 | {name} | {frontend/backend/both} | {story refs} | [EXISTING]/[MODIFIED]/[NEW] |

## Function Details
### F1: {function-name}
- **Frontend Changes**: {description or N/A}
- **Backend Changes**: {description}
- **Data Changes**: {description}
- **System Relationship**: [EXISTING]/[MODIFIED]/[NEW] — {explanation}

## Name Discrepancy Notice (if applicable)
- Parameter feature_name: {feature_name}
- PRD actual feature name: {prd_name}
- Discrepancy: {description}
- File naming follows: parameter value (as per Filename Lock Rule)

## Decomposition Status
- Checkpoint A: {passed/pending}
- Confirmed at: {timestamp or null}
```

---

# Key Rules

| Rule | Description |
|------|-------------|
| **Analysis Only** | Do NOT design UI wireframes, API specs, or data models |
| **Clear Markers** | Always use [EXISTING]/[MODIFIED]/[NEW] to indicate system relationship |
| **Checkpoint A Required** | User confirmation required before design phase (unless skipped) |
| **Use Script for JSON** | Always use `update-progress.js` for checkpoint files |
| **Output Contract** | `.feature-analysis.md` serves as interface for downstream design skills |

# Checklist

- [ ] PRD has been read, all P0 requirements covered
- [ ] **[Single Feature Mode]** Feature ID and name parameters received
- [ ] **[Single Feature Mode]** Only related Feature content extracted from PRD
- [ ] **[Legacy Mode]** All sub PRDs have been read (if master-sub structure)
- [ ] System overview loaded for context
- [ ] Related module overviews loaded
- [ ] **[Cross-module]** Knowledge graph queried for relationship analysis
- [ ] Function breakdown completed with [EXISTING]/[MODIFIED]/[NEW] markers
- [ ] **[Single Feature Mode]** 3-8 focused Functions defined
- [ ] Checkpoint A passed: function breakdown confirmed with user (or skipped)
- [ ] `.checkpoints.json` updated via script
- [ ] `.feature-analysis.md` written to correct path
