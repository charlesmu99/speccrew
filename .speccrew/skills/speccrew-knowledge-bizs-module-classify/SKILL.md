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

## AgentFlow Definition

<!-- @agentflow: workflow.agentflow.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `speccrew-workspace/docs/rules/agentflow-spec.md`

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
