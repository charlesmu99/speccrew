---
name: speccrew-knowledge-bizs-module-classify
description: Classify features into business modules by analyzing source code structure. Overrides directory-based module assignments from init-features with semantically meaningful business module groupings.
tools: None
---

# Bizs Module Classify

Reclassify features in `features-{platform}.json` files into proper business modules based on source code analysis.

## Language Adaptation

**CRITICAL**: All generated documents must match the user's language. Detect the language from the user's input and use it consistently.

- User writes in 中文 → Generate Chinese content, use `language: "zh"`
- User writes in English → Generate English content, use `language: "en"`
- User writes in other languages → Use appropriate language code

## Input

| Variable | Description | Default |
|----------|-------------|---------|
| `features_file` | Path to features-{platform}.json file (for reference only, Worker should NOT read it) | **REQUIRED** |
| `source_path` | Source code root path for context | **REQUIRED** |
| `module_summary` | JSON string containing module names, feature counts, and sample source paths (provided by dispatch via extract-module-summary.js) | **REQUIRED** |
| `language` | User's language code (e.g., "zh", "en") | **REQUIRED** |

## Output

Worker MUST return a JSON result containing the module mapping (NOT modify the features file directly):

```json
{
  "status": "success|failed",
  "message": "description of reclassification",
  "mapping": {
    "old_module_1": "new_module_1",
    "old_module_2": "new_module_2"
  },
  "modules_reclassified": N
}
```

**IMPORTANT**: 
- Only include modules that need to change in the `mapping` object
- Modules that remain the same should NOT be listed
- The `mapping` will be passed to `apply-module-mapping.js` by the dispatch agent to batch-update the features file
- Worker MUST NOT modify the features file directly

## Workflow

> **CRITICAL CONSTRAINT**: This skill is a PURE REASONING task. DO NOT use any tools (Read, Write, Bash, terminal, etc.). DO NOT read files — the module summary is provided as input parameter `module_summary`. DO NOT modify any files — output a mapping JSON only.

### Step 1: Parse Module Summary

- Parse the `module_summary` JSON parameter (pre-processed by dispatch via extract-module-summary.js)
- Extract: module names, feature counts per module, and sample source paths
- Note: The summary contains compact data for LLM analysis, not the full features file

### Step 2: Analyze Module Semantics

- Analyze each module's `sampleSourcePaths` to identify business semantics
- Identify logical business domains based on path patterns:

**Path pattern analysis for web/mobile platforms:**
- Examine sample paths under views/pages directories
- Match directory naming patterns to business domains
- Cross-reference with common business module patterns

**Path pattern analysis for backend platforms:**
- Examine controller/module directory patterns
- Identify domain boundaries from package naming

- Build a **business module map**: a list of logical business domains with descriptions
  - Example: `system` (system management), `trade` (trade/order), `bpm` (business process), `infra` (infrastructure)

### Step 3: Reclassify Modules

- For each module in the `module_summary`:
  - Analyze sample source paths and directory context
  - Match to the most appropriate business module from the module map
  - Determine if the module name needs to change

**Naming rules:**
- Use lowercase for module names (e.g., `system`, `trade`, `bpm`)
- Use kebab-case for multi-word names (e.g., `order-management`)
- Module names must reflect business domains, NOT page types or UI components

**Classification rules:**
- Modules clearly belonging to a business domain → use that domain name
  - Example: `system/user` paths → module: `system`
  - Example: `trade/order` paths → module: `trade`
- Utility/common modules that don't belong to a specific domain → module: `_common`
  - Example: `Error` module → module: `_common`
  - Example: `Home` module → module: `_common`
  - Example: `Redirect` module → module: `_common`
- Login/authentication modules → module: `system` (or domain-appropriate)
  - Example: `Login` module → module: `system`

**Validation:**
- Every module in the mapping must have a valid business domain name
- No page-type module names should remain as values (Error, Login, Home, Profile, Redirect)
- All new module names are lowercase or kebab-case

### Step 4: Output Module Mapping

> **CRITICAL CONSTRAINT**: This skill produces a module mapping as output only. DO NOT modify the features JSON file. DO NOT create any temporary scripts or files. The dispatch agent will apply the mapping using the `apply-module-mapping.js` script.

Based on the reclassification analysis, construct and return the mapping result:

1. **Build the mapping object**: For each module that needs to change:
   - Key: original module name (directory-based)
   - Value: new business module name
   - Example: `{ "Error": "_common", "Login": "system" }`

2. **Count reclassified features**: Calculate total number of features that will be affected by this mapping

3. **Return the JSON result**:
   ```json
   {
     "status": "success",
     "message": "Reclassified 12 features from 5 directory modules to 4 business modules",
     "mapping": {
       "Error": "_common",
       "Home": "_common",
       "Login": "system",
       "Profile": "_common",
       "Redirect": "_common"
     },
     "modules_reclassified": 12
   }
   ```

**Validation before returning**:
- Every mapping key-value pair has non-empty values
- No page-type module names remain as values (Error, Login, Home, Profile, Redirect should not appear as values)
- All new module names are lowercase or kebab-case
- `modules_reclassified` count is accurate

## Return

```json
{
  "status": "success",
  "message": "Reclassified 12 features from 5 directory modules to 4 business modules",
  "mapping": {
    "Error": "_common",
    "Home": "_common",
    "Login": "system",
    "Profile": "_common",
    "Redirect": "_common"
  },
  "modules_reclassified": 12
}
```

## Checklist

- [ ] All modules from `module_summary` are analyzed
- [ ] No page-type module names remain in mapping values (Error, Login, Home, Profile, Redirect)
- [ ] All new module names in mapping are lowercase or kebab-case
- [ ] Only modules that need to change are included in the `mapping` object
- [ ] `modules_reclassified` count is accurate
- [ ] Worker did NOT use any tools (Read, Write, Bash, terminal)
- [ ] Worker did NOT modify any files directly
