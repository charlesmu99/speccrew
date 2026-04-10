---
name: speccrew-fd-feature-generate
description: Feature Spec Generation SOP. Reads .feature-analysis.md and .feature-design-data.md interface contracts, assembles complete Feature Spec document using template-first workflow. Handles Checkpoint B user confirmation before writing files. Use when Feature Designer needs to generate final Feature Spec document from completed design data.
tools: Read, Write, Glob, Grep
---

# Skill Overview

Generates final Feature Spec document from completed design data. Reads intermediate artifacts and assembles complete specification using template-first workflow.

## Trigger Scenarios

- Feature design data ready (`.feature-design-data.md` exists)
- Feature analysis complete (`.feature-analysis.md` exists)
- Final Feature Spec document generation needed

---

# Workflow

## Absolute Constraints

> **Violation = task failure**

### ABORT CONDITIONS
- `.feature-analysis.md` missing → **HARD STOP**
- `.feature-design-data.md` missing → **HARD STOP**
- Template file missing → **HARD STOP**
- **NEVER skip preconditions verification**

### FORBIDDEN
- `create_file` for final documents — use template + `search_replace`
- Full-file rewrite — use targeted `search_replace` per section

### MANDATORY
- **Template-first workflow** — Step 4 (copy template) MUST precede Step 5 (fill content)

---

## Step 1: Read Input & Verify Preconditions

### 1.1 Input Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `feature_analysis_path` | Yes | Path to `.feature-analysis.md` |
| `feature_design_data_path` | Yes | Path to `.feature-design-data.md` |
| `feature_id` | No | Feature identifier (e.g., F-CRM-01) |
| `feature_name` | No | Feature name |
| `feature_type` | No | Page+API or API-only |
| `output_path` | No | Custom output path (auto-generated if not provided) |
| `skip_checkpoint` | No | Boolean. If true, skip Checkpoint B (batch mode) |

### 1.2 Verify Input Files

**IF either file missing → ABORT:**
```
❌ ERROR: Prerequisite files not found.
   Missing: [filename]
   
   This skill requires completed feature analysis and design.
   Please run speccrew-fd-feature-analyze and speccrew-fd-feature-design first.
```

### 1.3 Read Files

1. Read `.feature-analysis.md` — extract: Function Breakdown, [EXISTING]/[MODIFIED]/[NEW] counts
2. Read `.feature-design-data.md` — extract: Frontend Design, Backend Design, Data Model, Business Rules
3. Read Feature Spec template: `speccrew-fd-feature-design/templates/FEATURE-SPEC-TEMPLATE.md`

---

## Step 2: Build Design Summary

Extract statistics from intermediate artifacts:

| Metric | Source |
|--------|--------|
| Functions Designed | `.feature-analysis.md` Function Breakdown section |
| [EXISTING] / [MODIFIED] / [NEW] counts | Function markers in analysis |
| Frontend Components | `.feature-design-data.md` Frontend Design (0 if API-only) |
| Backend Interfaces | `.feature-design-data.md` Backend Design API count |
| Data Entities | `.feature-design-data.md` Data Model (new/modified) |

---

## Step 3: Checkpoint B — User Confirmation

> **Skip this step if `skip_checkpoint=true`**

### 3.1 Present Summary

```
Feature Design Summary for: {feature-name}

Functions Designed: {count}
├── [EXISTING] {count} functions reuse existing capabilities
├── [MODIFIED] {count} functions enhance existing features
└── [NEW] {count} functions are brand new

Frontend Components: {count} pages/components
Backend Interfaces: {count} APIs
Data Entities: {count} new, {count} modified

Output File: {filename}
```

### 3.2 Confirm 5 Questions

**HARD STOP** — Wait for user confirmation on:

1. Is the frontend prototype appropriate? (if applicable)
2. Is the backend logic flow correct and complete?
3. Is the data model reasonable and extensible?
4. Are all business rules captured?
5. [Legacy Master-Sub] Is the module breakdown appropriate?

### 3.3 Update Checkpoint

Update `.checkpoints.json`:
```json
{
  "feature_spec_review": {
    "passed": true,
    "confirmed_at": "{timestamp}",
    "description": "Feature specification confirmed"
  }
}
```

---

## Step 4: Determine Output Path & Copy Template

### 4.1 Determine Output Path

| Mode | Path Pattern |
|------|--------------|
| Single Feature | `{iteration}/02.feature-design/{feature-id}-{feature-name}-feature-spec.md` |
| Legacy Single | `{iteration}/02.feature-design/[feature-name]-feature-spec.md` |
| Legacy Master-Sub | Multiple files (master + sub-specs) |

### 4.2 Copy Template

1. Read template: `speccrew-fd-feature-design/templates/FEATURE-SPEC-TEMPLATE.md`
2. Replace top-level placeholders: `{Feature Name}`, `{Feature ID}`, etc.
3. **Create document** using `create_file` with template content
4. Verify complete section structure exists

---

## Step 5: Fill Sections Using search_replace

Map data sources to template sections:

| Template Section | Data Source |
|------------------|-------------|
| Feature Overview | `.feature-analysis.md` Feature Information + summary |
| Function Breakdown | `.feature-analysis.md` Function Breakdown |
| Frontend Design | `.feature-design-data.md` Frontend Design |
| Backend Design | `.feature-design-data.md` Backend Design |
| Data Model | `.feature-design-data.md` Data Model |
| Business Rules | `.feature-design-data.md` Business Rules |
| Cross-Module Interactions | `.feature-design-data.md` Cross-Module (if applicable) |

**Rules:**
- Use `search_replace` for each section individually
- Preserve all section titles and numbering
- No applicable content → replace placeholder with "N/A"
- Legacy Master-Sub: repeat Step 4+5 for each sub-spec

---

## Step 6: Mermaid Diagram Compliance

Verify all Mermaid diagrams follow compatibility rules:

- Use only basic node definitions: `A[text content]`
- No HTML tags (e.g., `<br/>`)
- No nested subgraphs
- No `direction` keyword
- No `style` definitions
- Standard `graph TB/LR` or `sequenceDiagram` syntax only

Reference: `speccrew-workspace/docs/rules/mermaid-rule.md`

---

## Step 7: Update Checkpoints

Update `.checkpoints.json`:
- Set `feature_spec_review.passed = true`
- Set `confirmed_at` timestamp
- Preserve existing checkpoint states

---

# Reference Guides

## Legacy Mode Backward Compatibility

When `feature_id` is NOT provided:

**Single Feature Spec:**
```
02.feature-design/[feature-name]-feature-spec.md
```

**Master-Sub Feature Specs:**
```
02.feature-design/
├── [feature-name]-feature-spec.md          # Master (overview + cross-module)
├── [feature-name]-sub-[module1]-spec.md    # Sub: Module 1
└── [feature-name]-sub-[module2]-spec.md    # Sub: Module 2
```

Master spec MUST include: overall overview, cross-module diagram, module list, interface contracts.

---

# Key Rules

| Rule | Description |
|------|-------------|
| **Template-First** | Copy template before filling content |
| **search_replace Only** | Never use `create_file` for section updates |
| **Checkpoint B** | Get user confirmation before writing files |
| **Mermaid Compliance** | Follow mermaid-rule.md guidelines |
| **Clear Markers** | Use [EXISTING]/[MODIFIED]/[NEW] consistently |

---

# Output Checklist

- [ ] Both input files verified and read
- [ ] Design summary built with statistics
- [ ] Checkpoint B passed (or skipped via flag)
- [ ] Output path determined
- [ ] Template copied using `create_file`
- [ ] All sections filled using `search_replace`
- [ ] Mermaid diagrams verified compliant
- [ ] `.checkpoints.json` updated
- [ ] [Legacy Master-Sub] All sub-specs generated
