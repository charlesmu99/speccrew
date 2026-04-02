---
name: speccrew-knowledge-bizs-module-classify
description: Classify features into business modules by analyzing source code structure. Overrides directory-based module assignments from init-features with semantically meaningful business module groupings.
tools: Read, Write
---

# Bizs Module Classify

Reclassify features in `features-{platform}.json` files into proper business modules based on source code analysis.

## Language Adaptation

**CRITICAL**: All generated documents must match the user's language. Detect the language from the user's input and use it consistently.

- User writes in 中文 → Generate Chinese content, use `language: "zh"`
- User writes in English → Generate English content, use `language: "en"`
- User writes in other languages → Use appropriate language code

## User

Worker Agent (speccrew-task-worker)

## Input

| Variable | Description | Default |
|----------|-------------|---------|
| `features_file` | Path to features-{platform}.json file to reclassify | **REQUIRED** |
| `source_path` | Source code root path for context | **REQUIRED** |
| `language` | User's language code (e.g., "zh", "en") | **REQUIRED** |

## Output

- Updated `features-{platform}.json` with reclassified `module` fields
- Updated top-level `modules` array to reflect new module groupings

## Workflow

### Step 1: Read Feature Inventory

- Read the `features_file` JSON file
- Extract: `platformType`, `platformSubtype`, `sourcePath`, `techStack`, `features` array
- Note current module assignments (directory-based from init-features)
- Count total features and unique modules before reclassification

### Step 2: Analyze Source Structure

- Read the source directory structure under `source_path`
- Identify logical business domains based on platform type:

**For web/mobile platforms:**
- Examine router configuration files (e.g., `router/index.ts`, `pages.json`)
- Examine navigation/menu configuration
- Examine directory naming patterns under views/pages
- Cross-reference with backend module structure if available

**For backend platforms:**
- Examine controller/module directory structure
- Examine package organization (e.g., Java packages, Python modules)
- Identify domain boundaries from module/package naming

- Build a **business module map**: a list of logical business domains with descriptions
  - Example: `system` (system management), `trade` (trade/order), `bpm` (business process), `infra` (infrastructure)

### Step 3: Reclassify Modules

- For each feature in the `features` array:
  - Analyze `sourcePath`, `fileName`, and directory context
  - Match to the most appropriate business module from the module map
  - Assign the business module name as the new `module` value

**Naming rules:**
- Use lowercase for module names (e.g., `system`, `trade`, `bpm`)
- Use kebab-case for multi-word names (e.g., `order-management`)
- Module names must reflect business domains, NOT page types or UI components

**Classification rules:**
- Pages/controllers clearly belonging to a business domain → use that domain name
  - Example: `system/user/index.vue` → module: `system`
  - Example: `trade/order/OrderController.java` → module: `trade`
- Utility/common pages that don't belong to a specific domain → module: `_common`
  - Example: `Error/404.vue` → module: `_common`
  - Example: `Redirect/index.vue` → module: `_common`
  - Example: `Home/index.vue` → module: `_common`
- Login/authentication pages → module: `system` (or domain-appropriate)
  - Example: `Login/index.vue` → module: `system`

**Validation:**
- Every feature MUST have a non-empty `module`
- No feature should retain a page-type module name (e.g., `Error`, `Login`, `Home`, `Profile`, `Redirect`)
- All features from the original inventory must be present (zero loss)

### Step 4: Update Features File

- **⚠️ IMPORTANT**: Do NOT modify the `id` field. The `id` is an immutable unique identifier set by generate-inventory. Use it (not `{module}-{fileName}`) to construct `documentPath`: `{newModule}/{id}.md`
- Update each feature's `module` field with the reclassified value
- Update each feature's `documentPath` to reflect the new module:
  - Use the feature's `id` field (not fileName) to construct the new path
  - Format: `{newModule}/{id}.md`
  - Example: feature id is `dict-index`, reclassified to `system` module → `documentPath` becomes `system/dict-index.md`
- Rebuild top-level `modules` array from unique reclassified module names (sorted)
- Keep all other fields unchanged: `id`, `totalFiles`, `analyzedCount`, `pendingCount`, `generatedAt`, and all feature-level status fields (`analyzed`, `status`, `startedAt`, `completedAt`, `analysisNotes`)
- Write back to the same `features_file` path (overwrite)

## Return

```json
{
  "status": "success",
  "modules_before": ["Error", "Home", "Login", "Profile", "Redirect", "ai", "bpm", "infra", "system"],
  "modules_after": ["_common", "ai", "bpm", "infra", "system"],
  "reclassified_count": 12,
  "total_features": 193
}
```

## Checklist

- [ ] All features from original inventory are present (zero loss)
- [ ] No page-type module names remain (Error, Login, Home, Profile, Redirect)
- [ ] All module names are lowercase or kebab-case
- [ ] `id` field is NOT modified (immutable unique identifier)
- [ ] documentPath updated to `{newModule}/{id}.md` for every reclassified feature
- [ ] Top-level `modules` array matches unique modules from features
- [ ] Status fields (analyzed, startedAt, completedAt, analysisNotes) unchanged
