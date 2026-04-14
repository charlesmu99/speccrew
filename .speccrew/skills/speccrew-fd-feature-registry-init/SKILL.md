---
name: speccrew-fd-feature-registry-init
description: Extract Feature Breakdown from Master PRD and Sub-PRD files to generate Feature Registry. Scans PRD directory, parses Feature Breakdown tables from all Sub-PRDs, and outputs .feature-registry.json with module-grouped features and summary statistics.
tools: Read, Write, Glob
---

# Feature Registry Initialization

Extract Feature Breakdown from Master PRD and Sub-PRD files to generate a centralized Feature Registry. This Skill discovers all PRD files, parses Feature Breakdown tables, and produces a structured registry with summary statistics.

## Trigger Scenarios

- "Initialize feature registry from PRDs"
- "Extract features from all Sub-PRDs"
- "Build feature registry for the project"
- "Generate feature breakdown summary"

## Input Parameters

| Parameter | Type | Description | Required |
|-----------|------|-------------|----------|
| `prd_dir` | string | Path to PRD documents directory (contains Master PRD and all Sub-PRDs) | **Yes** |
| `workspace_path` | string | Workspace root path for reading techs-manifest.json | **Yes** |
| `language` | string | Target language for output content | **Yes** |

## Output

- **JSON File**: `{prd_dir}/.feature-registry.json` - Structured feature registry
- **Summary**: Markdown table with module statistics and feature distribution

---

## Workflow

### Step 0: Read Template / Validate Inputs

1. **Validate prd_dir exists**
   - Check if `{prd_dir}` directory exists
   - If not found, report error and stop

2. **Validate Sub-PRD files exist**
   - Scan for files matching `*-sub-*.md` pattern in `{prd_dir}`
   - If no Sub-PRD files found, report error and stop

3. **Output**: "Step 0 Status: ✅ COMPLETED - Found {sub_prd_count} Sub-PRD files"

### Step 1: Discover PRD Files

1. **Scan PRD Directory**
   - Find **Master PRD**: files matching `*-master-prd.md`
   - Find **Sub-PRDs**: files matching `*-sub-*.md`
   - Record file paths and names

2. **Discover Frontend Platforms**
   - Read `{workspace_path}/knowledges/techs/techs-manifest.json`
   - Extract platform list from the manifest
   - Platforms typically include: `web-vue`, `mobile-uniapp`, etc.

3. **Output**: 
   - "Step 1 Status: ✅ COMPLETED - Found 1 Master PRD, {count} Sub-PRDs"
   - "Frontend Platforms: {platform_list}"

### Step 2: Extract Feature Breakdown from Each Sub-PRD

For each Sub-PRD file:

1. **Read Sub-PRD Content**
   - Parse the markdown file

2. **Locate Section 3.4 "Feature Breakdown"**
   - Find the section header (may be in different languages based on `language`)
   - Common patterns: "3.4 Feature Breakdown", "3.4 功能分解", etc.

3. **Parse Feature Table**
   - Extract table rows containing feature information
   - For each feature, extract:

| Field | Description | Example |
|-------|-------------|---------|
| `feature_id` | Feature identifier | F-SYS-01, F-CRM-05 |
| `feature_name` | Human-readable feature name | User Management, Order List |
| `type` | Feature type | User Interaction / Backend Process |
| `priority` | Priority level | P0 / P1 / P2 |
| `sub_features` | List of sub-feature IDs | ["M1-F01-01", "M1-F01-02"] |
| `description` | Brief description | Manage system users and permissions |
| `source_prd` | Source file name | litemes-sub-system-management.md |
| `module_key` | Module identifier | system-management |

4. **Extract Module Information**
   - Derive `module_id` from PRD (e.g., M1, M2)
   - Derive `module_name` from PRD header or content
   - Map to `module_key` (kebab-case identifier)

5. **Output**: "Step 2 Status: ✅ COMPLETED - Extracted {feature_count} features from {prd_name}"

### Step 3: Build Feature Registry

1. **Merge All Features**
   - Combine features from all Sub-PRDs into a single collection
   - Group features by module

2. **Calculate Summary Statistics**

| Statistic | Calculation |
|-----------|-------------|
| `total_modules` | Count of unique modules |
| `total_features` | Total count of all features |
| `by_priority` | Count by priority (P0, P1, P2) |
| `by_type` | Count by type (User Interaction, Backend Process) |
| `frontend_platforms` | List from techs-manifest.json |

3. **Organize Registry Structure**
   - Group features under their respective modules
   - Sort modules by module_id (M1, M2, M3...)
   - Sort features by feature_id within each module

4. **Output**: "Step 3 Status: ✅ COMPLETED - Registry contains {total_features} features across {total_modules} modules"

### Step 4: Write Output Files

1. **Write `.feature-registry.json`**

Output path: `{prd_dir}/.feature-registry.json`

Structure:
```json
{
  "created_at": "2026-01-15T10:30:00Z",
  "summary": {
    "total_modules": 8,
    "total_features": 42,
    "by_priority": {
      "P0": 35,
      "P1": 5,
      "P2": 2
    },
    "by_type": {
      "User Interaction": 30,
      "Backend Process": 12
    },
    "frontend_platforms": ["web-vue", "mobile-uniapp"]
  },
  "modules": [
    {
      "module_id": "M1",
      "module_name": "System Management",
      "module_key": "system-management",
      "source_prd": "litemes-sub-system-management.md",
      "features": [
        {
          "feature_id": "F-SYS-01",
          "feature_name": "User Management",
          "type": "User Interaction",
          "priority": "P0",
          "sub_features": ["M1-F01-01", "M1-F01-02"],
          "description": "Manage system users and permissions"
        }
      ]
    }
  ]
}
```

2. **Output**: "Step 4 Status: ✅ COMPLETED - Written .feature-registry.json"

### Step 5: Output Summary

Generate and output a Markdown summary table for Agent display:

```markdown
## Feature Registry Summary

| Module | Features | P0 | P1 | P2 | Types |
|--------|----------|----|----|----|-------|
| M1 System Management | 4 | 4 | 0 | 0 | UI: 4, Backend: 0 |
| M2 User Center | 6 | 5 | 1 | 0 | UI: 5, Backend: 1 |
| ... | ... | ... | ... | ... | ... |
| **Total** | **42** | **35** | **5** | **2** | **UI: 30, Backend: 12** |

**Frontend Platforms:** web-vue, mobile-uniapp

**Registry File:** `{prd_dir}/.feature-registry.json`
```

**Output**: "Step 5 Status: ✅ COMPLETED - Summary generated"

---

## Task Completion Report

When the task is complete, report:

```json
{
  "status": "success",
  "skill": "speccrew-fd-feature-registry-init",
  "result": {
    "registry_file": "{prd_dir}/.feature-registry.json",
    "total_modules": 8,
    "total_features": 42,
    "by_priority": {
      "P0": 35,
      "P1": 5,
      "P2": 2
    },
    "by_type": {
      "User Interaction": 30,
      "Backend Process": 12
    }
  },
  "message": "Feature registry initialized successfully"
}
```

---

## Constraints

1. **READ-ONLY on PRDs**: Do not modify any PRD files
2. **JSON Output**: Registry must be valid JSON
3. **Feature ID Uniqueness**: Each feature_id should be unique across all modules
4. **Module Grouping**: Features must be grouped by their source module
5. **Priority Validation**: Only accept P0, P1, P2 as valid priority values
6. **Type Validation**: Only accept "User Interaction" or "Backend Process" as valid types

## Error Handling

| Scenario | Action |
|----------|--------|
| prd_dir not found | Report error, stop execution |
| No Sub-PRD files found | Report error, stop execution |
| Master PRD not found | Log warning, continue with Sub-PRDs only |
| techs-manifest.json not found | Use empty platform list, log warning |
| Feature table not found in Sub-PRD | Skip that PRD, log warning |
| Invalid feature data | Skip invalid row, log warning |
| Duplicate feature_id | Keep first occurrence, log warning |

## Checklist

- [ ] Step 0: Validated prd_dir exists
- [ ] Step 0: Found at least one Sub-PRD file
- [ ] Step 1: Discovered Master PRD and all Sub-PRDs
- [ ] Step 1: Read techs-manifest.json for frontend platforms
- [ ] Step 2: All Sub-PRD files scanned
- [ ] Step 2: Feature Breakdown tables parsed from each Sub-PRD
- [ ] Step 3: Features merged and grouped by module
- [ ] Step 3: Summary statistics calculated (total, by_priority, by_type)
- [ ] Step 4: `.feature-registry.json` written to correct path
- [ ] Step 5: Summary table generated and output
