---
name: speccrew-knowledge-bizs-api-analyze
description: Analyze a single API controller from source code to extract business features and generate API documentation using XML Block workflow. Used by Worker Agent in parallel execution during knowledge base initialization Stage 2. Each worker analyzes one API controller file.
tools: Read, Write, Edit, Glob, Grep, Bash
---

# API Feature Analysis - Single Controller (XML Block Workflow)

> **CRITICAL CONSTRAINT**: DO NOT create temporary scripts, batch files, or workaround code files (`.py`, `.bat`, `.sh`, `.ps1`, etc.) under any circumstances. If execution encounters errors, STOP and report the exact error. Fixes must be applied to the Skill definition or source scripts — not patched at runtime.

Analyze one specific API controller from source code, extract all business features (API endpoints), and generate feature documentation. This skill operates at controller granularity - one worker per controller file.

## Trigger Scenarios

- "Analyze API controller {fileName} from source code"
- "Extract API features from controller {fileName}"
- "Generate documentation for API controller {fileName}"
- "Analyze API feature from features.json"

## Input Variables

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `${feature}` | object | Complete feature object from features.json | - |
| `${fileName}` | string | Controller file name | `"UserController"`, `"OrderController"` |
| `${sourcePath}` | string | Relative path to source file | `"yudao-module-system/yudao-module-system-biz/src/main/java/cn/iocoder/yudao/module/system/controller/admin/user/UserController.java"` |
| `${documentPath}` | string | Target path for generated document | `"speccrew-workspace/knowledges/bizs/admin-api/system/user/UserController.md"` |
| `${module}` | string | Business module name (from feature.module) | `"system"`, `"trade"`, `"_root"` |
| `${analyzed}` | boolean | Analysis status flag | `true` / `false` |
| `${platform_type}` | string | Platform type | `"admin-api"`, `"app-api"` |
| `${platform_subtype}` | string | Platform subtype | `"spring-boot"`, `"java"` |
| `${tech_stack}` | array | Platform tech stack | `["java", "spring-boot", "mybatis-plus"]` |
| `${completed_dir}` | string | Marker files output directory | `"speccrew-workspace/knowledges/base/sync-state/knowledge-bizs/completed"` |
| `${sourceFile}` | string | Source features JSON file name | `"features-admin-api.json"` |
| `${language}` | string | Target language for content | `"zh"`, `"en"` |

## Language Adaptation

**CRITICAL**: Generate all content in the language specified by the `${language}` parameter.

- `${language} == "zh"` → Generate all content in 中文
- `${language} == "en"` → Generate all content in English
- Other languages → Use the specified language

**All output content (feature names, descriptions, business rules) must be in the target language only.**

## Output Variables

| Variable | Type | Description |
|----------|------|-------------|
| `${status}` | string | Analysis status: `"success"`, `"partial"`, or `"failed"` |
| `${feature_name}` | string | Name of the analyzed controller |
| `${generated_file}` | string | Path to the generated documentation file |
| `${message}` | string | Summary message for status update |

## Execution Requirements

This skill operates in **strict sequential execution mode**:
- Execute steps in exact order (Step 1 → Step 2 → ... → Step 7)
- Output step status after each step completion
- Do NOT skip any step

## Output

**Generated Files:**
1. `${documentPath}` - Controller documentation file
2. `${completed_dir}/{module}-{subpath}-{fileName}.done.json` - Completion status marker

**Graph Data Generation:**
Graph data (nodes, edges) construction is handled by `speccrew-knowledge-bizs-api-graph` Skill.
After completing API analysis, dispatch will invoke the graph skill to generate `.graph.json` files.

**See Also:**
- `speccrew-knowledge-bizs-api-graph` - Constructs knowledge graph data from API analysis results

**Return Value:**
```json
{
  "status": "success|partial|failed",
  "feature": {
    "fileName": "UserController",
    "sourcePath": "yudao-module-system/.../controller/admin/user/UserController.java"
  },
  "platformType": "admin-api",
  "module": "system",
  "featureName": "user-management-api",
  "generatedFile": "speccrew-workspace/knowledges/bizs/admin-api/system/user/UserController.md",
  "message": "Successfully analyzed UserController with 8 API endpoints"
}
```

The return value is used by dispatch to update the feature status in `features-{platform}.json`.

## Execution Checklist

Before executing the workflow, verify the following inputs:

- Controller: `${fileName}` (`${sourcePath}`)
- Target: `${documentPath}`
- Language: `${language}`
- Module: `${module}`
- Platform: `${platform_type}`/`${platform_subtype}`
- Completed Dir: `${completed_dir}`
- Source File: `${sourceFile}`

## AgentFlow Definition

<!-- @agentflow: workflow.agentflow.xml -->

## Reference Guides

### Mermaid Guide

When generating Mermaid diagrams, follow compatibility guidelines:
- Use `graph TB` or `graph LR` syntax (not `flowchart`)
- No parentheses `()` in node text
- No HTML tags like `<br/>`
- No `style` definitions

### Business Flow Guidelines

- One diagram per API request
- Focus on business operations
- Refer to `templates/FEATURE-DETAIL-TEMPLATE.md`

## Constraints

1. **DO NOT analyze files outside the specified `${sourcePath}`**
2. **DO NOT generate separate documents for internal/private methods**
3. **All content MUST be in the language specified by `${language}`**
4. **Use `search_replace` for section filling, NEVER rewrite entire document**
5. **Mermaid diagrams MUST follow the rules in `mermaid-rule.md`**
6. **All links MUST use relative paths, NEVER `file://` protocol**
7. **Marker files MUST follow naming convention: `{module}-{subpath}-{fileName}.done.json`**
8. **fileName in .done.json MUST NOT include file extension**
9. **ALL paths in JSON MUST be relative, not absolute**

## Checklist

- [ ] Template file selected based on `${tech_stack}`
- [ ] Template content read successfully
- [ ] Controller file read and analyzed
- [ ] API endpoints extracted with business flows
- [ ] API consumers found
- [ ] Template copied to document path
- [ ] All sections filled using search_replace
- [ ] All content in target language (`${language}`)
- [ ] Results reported in JSON format
- [ ] .done.json marker file written successfully
- [ ] .graph.json generation dispatched to graph skill
