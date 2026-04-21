---
name: speccrew-sd-design-overview-generate
version: 1.0.0
description: Design Overview Generation Skill for System Designer. Reads Feature Registry, techs-manifest platforms, and framework evaluation results to generate a comprehensive DESIGN-OVERVIEW.md with Feature×Platform matrix index. Invoked by System Designer Agent during Phase 4 via worker dispatch.
tools: Read, Write, Glob, Grep
---

# Trigger Scenarios

- System Designer Agent dispatches this skill during Phase 4 to generate DESIGN-OVERVIEW.md
- User requests a design overview document for the current iteration
- Need to establish a Feature×Platform matrix index before per-platform system design begins

## AgentFlow Definition

<!-- @agentflow: workflow.agentflow.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `speccrew-workspace/docs/rules/agentflow-spec.md`

## Workflow

## Absolute Constraints

> **These rules apply to ALL steps. Violation = task failure.**

1. **READ-ONLY on Feature Spec and API Contract** — NEVER modify Feature Spec or API Contract documents. Only read for reference.
2. **READ-ONLY on techs-manifest.json** — NEVER modify the techs manifest. Only read for platform information.
3. **READ-ONLY on framework-evaluation.md** — NEVER modify the framework evaluation report. Only read for technology decisions.
4. **Single Output Only** — Only create DESIGN-OVERVIEW.md at the specified output_path. No other files.
5. **Direct-to-File Output** — Write all content directly to DESIGN-OVERVIEW.md. DO NOT display document content in conversation.

## Step 1: Read Inputs

**Input Parameters** (from agent context):

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `workspace_path` | string | Yes | speccrew-workspace root directory path |
| `iteration_path` | string | Yes | Current iteration directory path |
| `feature_registry_path` | string | Yes | Path to .prd-feature-list.json |
| `techs_manifest_path` | string | Yes | Path to techs-manifest.json |
| `framework_evaluation_path` | string | Yes | Path to framework-evaluation.md |
| `output_path` | string | No | Output file path (default: iteration_path/03.system-design/DESIGN-OVERVIEW.md) |

Read in order:

1. **Read .prd-feature-list.json** — Extract features array:
   - `feature_id` (e.g., F-CRM-01) or `module_name` for legacy format
   - `feature_name` or `module_name`
   - `feature_spec` path
   - `api_contract` path
   - `module`
   - `type`

2. **Read techs-manifest.json** — Extract platforms array:
   - `platform_id` (e.g., web-react, backend-nodejs)
   - `friendly_name`
   - `tech_stack`

3. **Read framework-evaluation.md** — Extract Technology Decisions:
   - Framework evaluation results
   - New dependencies introduced (if any)
   - Version constraints

## Step 2: Build Feature×Platform Matrix

For each feature × platform combination, generate one matrix row:

| Field | Source |
|-------|--------|
| `feature_id` | feature.feature_id (or "-" for legacy format) |
| `feature_name` | feature.feature_name (or feature.module_name for legacy) |
| `platform` | platform.friendly_name |
| `platform_id` | platform.platform_id |
| `skill` | Map platform_id prefix → speccrew-sd-{type} (see below) |
| `design_directory` | {platform_id}/{feature_id}-{feature_name}-design.md (new) or {platform_id}/{module}-design.md (legacy) |
| `status` | Always "pending" |

### Platform ID Prefix → Skill Mapping

| Platform ID Prefix | Target Skill |
|-------------------|--------------|
| web-* | speccrew-sd-frontend |
| backend-* | speccrew-sd-backend |
| mobile-* | speccrew-sd-mobile |
| desktop-* | speccrew-sd-desktop |

### Legacy Format Compatibility

If a feature does NOT have a Feature ID (no "F-" prefix):
- Feature ID column displays `-`
- Use `module_name` as Feature Name
- Design Directory uses `{platform_id}/{module_name}-design.md` (legacy format)

## Step 3: Generate DESIGN-OVERVIEW.md

Write the design overview document to `output_path`.

### Document Structure

```markdown
# System Design Overview - {Iteration Name}

## 1. Design Scope

- **Iteration**: {iteration_identifier}
- **Platforms**: {platform_list}
- **Features**: {count} features discovered

### 1.1 Feature List

| Feature ID | Feature Name | Feature Spec | API Contract |
|------------|--------------|--------------|--------------|
| (from feature registry, one row per feature) |

> **Legacy Format Compatibility**: If file uses legacy format (no Feature ID), Feature ID column shows `-`, using module name as Feature Name

## 2. Technology Decisions

(from framework-evaluation.md - Phase 3 results)

- Framework evaluation results
- New dependencies introduced (if any)
- Version constraints

## 3. Platform Design Index

| Feature ID | Feature Name | Platform | Platform ID | Skill | Design Directory | Status |
|------------|--------------|----------|-------------|-------|------------------|--------|
| (Feature × Platform matrix from Step 2) |

> **Notes**:
> - New Format: Design Directory contains `{feature-id}-{feature-name}` (e.g., `F-CRM-01-customer-list-design.md`)
> - Legacy Format: Design Directory uses `{module}-design.md`

## 4. Feature Summary (Optional - when Feature count > 5)

### 4.1 Feature by Module

| Module | Feature Count | Feature IDs |
|--------|---------------|-------------|
| (group features by module) |

### 4.2 Feature Type Distribution

| Type | Count | Features |
|------|-------|----------|
| (group features by type) |

## 5. Cross-Platform Concerns

- Shared data structures
- Cross-platform API contracts
- Authentication/authorization strategy
- Error handling conventions

## 6. Design Constraints

- API Contract is READ-ONLY — do not modify
- All pseudo-code must use actual framework syntax from techs knowledge
- Each module design document maps 1:1 to a Feature Spec function
```

## Step 4: Validate Output

After writing DESIGN-OVERVIEW.md, verify:

- [ ] File exists at output_path
- [ ] Contains "## 1. Design Scope" section
- [ ] Contains "## 2. Technology Decisions" section
- [ ] Contains "## 3. Platform Design Index" table
- [ ] Platform Design Index covers all Feature × Platform combinations
- [ ] Feature count matches feature registry
- [ ] Platform count matches techs-manifest
- [ ] All index entries have status "pending"

## Step 5: Output Task Completion Report

After validation, output:

```
--- TASK COMPLETION REPORT ---
Task: Design Overview Generation
Status: SUCCESS
Output: {output_path}
Features: {feature_count}
Platforms: {platform_count}
Matrix Entries: {feature_count × platform_count}
--- END REPORT ---
```

If any step fails:

```
--- TASK COMPLETION REPORT ---
Task: Design Overview Generation
Status: FAILED
Error: {specific error description}
Failed At: Step {N}
--- END REPORT ---
```

## OUTPUT EFFICIENCY RULES

When executing this skill:

1. **Direct-to-File Output**: All design overview content MUST be written directly to DESIGN-OVERVIEW.md
2. **Minimal Conversation Output**: Only output:
   - Block execution announcements (1 line each): `[Block XX] Building matrix...`
   - Error messages requiring attention
   - Task Completion Report (final summary)
3. **FORBIDDEN in conversation**:
   - Full document sections or drafts
   - Feature × Platform matrix tables
   - Feature list tables
   - Technology decision excerpts longer than 2 lines
4. **Rationale**: Workers run in batch mode. Displaying design content in conversation wastes context window and provides no value since content goes to file anyway.

# Key Rules

| Rule | Description |
|------|-------------|
| **FORBIDDEN: Input Modification** | Do NOT modify feature specs, API contracts, techs-manifest, or framework-evaluation |
| **FORBIDDEN: Extra Files** | Do NOT create any files other than DESIGN-OVERVIEW.md |
| **FORBIDDEN: Conversation Output** | Do NOT display DESIGN-OVERVIEW content in conversation — write directly to file |
| **MANDATORY: Complete Matrix** | Platform Design Index MUST cover ALL Feature × Platform combinations |
| **MANDATORY: Pending Status** | ALL Platform Design Index entries MUST have status "pending" |

# Checklist

- [ ] .prd-feature-list.json read and features array extracted
- [ ] techs-manifest.json read and platforms array extracted
- [ ] framework-evaluation.md read and technology decisions extracted
- [ ] Feature format detected (new or legacy)
- [ ] Feature × Platform matrix built with all combinations
- [ ] Platform ID prefix correctly mapped to target skills
- [ ] DESIGN-OVERVIEW.md generated with all required sections
- [ ] Feature Summary section included only when feature count > 5
- [ ] Output validated against checklist
- [ ] Task Completion Report output
