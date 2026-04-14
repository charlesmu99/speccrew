---
name: speccrew-knowledge-bizs-ui-graph-xml
description: Constructs knowledge graph data (nodes, edges, relationships) from UI analysis results using XML workflow blocks. Generates graph JSON files and completion markers for the bizs knowledge pipeline.
tools: Read, Write, Glob, Grep, Bash
---

# UI Knowledge Graph Constructor (XML Workflow)

> **CRITICAL CONSTRAINT**: DO NOT create temporary scripts, batch files, or workaround code files (`.py`, `.bat`, `.sh`, `.ps1`, etc.) under any circumstances.

Construct knowledge graph data (nodes, edges, relationships) from UI feature analysis results and write completion marker files for the bizs knowledge pipeline.

## Language Adaptation

This skill automatically adapts to the user's input language. All documentation and output will be generated in the same language as the user's query.

## Trigger Scenarios

- "Construct graph data for UI feature {fileName}"
- "Generate graph nodes and edges from UI analysis"
- "Write completion markers for feature {fileName}"

## Input Variables

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `{{feature}}` | object | Complete feature object from features.json | - |
| `{{fileName}}` | string | Feature file name | `"index"`, `"UserForm"` |
| `{{sourcePath}}` | string | Relative path to source file | `"frontend-web/src/views/system/user/index.vue"` |
| `{{documentPath}}` | string | Path to generated documentation | `"speccrew-workspace/knowledges/bizs/..."` |
| `{{module}}` | string | Business module name | `"system"`, `"trade"`, `"_root"` |
| `{{platform_type}}` | string | Platform type | `"web"`, `"mobile"` |
| `{{platform_subtype}}` | string | Platform subtype | `"vue"`, `"react"` |
| `{{completed_dir}}` | string | Marker files output directory | `"speccrew-workspace/knowledges/base/sync-state/knowledge-bizs/completed"` |
| `{{sourceFile}}` | string | Source features JSON file name | `"features-web-vue.json"` |
| `{{status}}` | string | Analysis status from UI analysis | `"success"`, `"partial"`, `"failed"` |
| `{{analysisNotes}}` | string | Analysis notes from UI analysis | `"Successfully analyzed..."` |

## Output

**Generated Files (MANDATORY):**
1. `{{completed_dir}}/{module}-{subpath}-{fileName}.graph.json` - Graph data with nodes and edges
2. `{{completed_dir}}/{module}-{subpath}-{fileName}.graph-done.json` - Graph completion marker

## Workflow

<!--
== Block Types ==
input      : Workflow input parameters (required=mandatory, default=default value)
output     : Workflow output results (from=data source variable)
task       : Execute action (action: run-skill | run-script | dispatch-to-worker)
gateway    : Conditional branch/gate (mode: exclusive | guard | parallel)
loop       : Iterate over collection (over=collection, as=current item)
event      : Log/confirm/signal (action: log | confirm | signal)
error-handler : Exception handling (try > catch > finally)
checkpoint : Persistent milestone (name=checkpoint name, verify=verification condition)
rule       : Constraint declaration (level: forbidden | mandatory | note)
-->

```xml
<workflow name="ui-knowledge-graph-construction" version="1.0">
  
  <!-- Input Parameters -->
  <input name="feature" type="object" required="true" description="Complete feature object from features.json"/>
  <input name="fileName" type="string" required="true" description="Feature file name without extension"/>
  <input name="sourcePath" type="string" required="true" description="Relative path to source file"/>
  <input name="documentPath" type="string" required="true" description="Path to generated documentation"/>
  <input name="module" type="string" required="true" description="Business module name"/>
  <input name="platform_type" type="string" required="true" description="Platform type"/>
  <input name="platform_subtype" type="string" required="true" description="Platform subtype"/>
  <input name="completed_dir" type="string" required="true" description="Marker files output directory"/>
  <input name="sourceFile" type="string" required="true" description="Source features JSON file name"/>
  <input name="status" type="string" required="true" default="success" description="Analysis status from UI analysis"/>
  <input name="analysisNotes" type="string" required="true" default="" description="Analysis notes from UI analysis"/>
  
  <!-- Step 1: Read Source File -->
  <checkpoint name="step-1-read-source">
    <task action="read" target="{{sourcePath}}" output="sourceContent"/>
    <task action="extract-api-imports" input="{{sourceContent}}" output="apiImports"/>
    <task action="extract-component-usage" input="{{sourceContent}}" output="componentUsage"/>
    <task action="extract-navigation-patterns" input="{{sourceContent}}" output="navigationPatterns"/>
    <event action="log" message="Step 1 Status: COMPLETED - Read {{sourcePath}}, found {{apiImports.count}} APIs, {{componentUsage.count}} components, {{navigationPatterns.count}} navigations"/>
  </checkpoint>
  
  <!-- Step 2: Construct Graph Nodes -->
  <checkpoint name="step-2-construct-nodes">
    <task action="construct-node" type="page" id="page-{{module}}-{{fileName}}" 
          name="{{fileName}}" module="{{module}}" 
          sourcePath="{{sourcePath}}" documentPath="{{documentPath}}"
          context-route="{{extractedRoute}}" context-components="{{componentUsage.list}}"
          context-platform="{{platform_type}}-{{platform_subtype}}"
          output="pageNode"/>
    <loop over="{{componentUsage.list}}" as="component">
      <task action="construct-node" type="component" id="component-{{module}}-{{component.name}}"
            name="{{component.name}}" module="{{module}}"
            sourcePath="{{component.path}}" documentPath="{{documentPath}}"
            context-props="{{component.props}}" context-events="{{component.events}}"
            output="componentNodes[]"/>
    </loop>
    <event action="log" message="Step 2 Status: COMPLETED - Constructed {{nodeCount}} nodes"/>
  </checkpoint>
  
  <!-- Step 3: Construct Graph Edges -->
  <checkpoint name="step-3-construct-edges">
    <!-- API Call Edges -->
    <loop over="{{apiImports.list}}" as="api">
      <task action="construct-edge" source="page-{{module}}-{{fileName}}"
            target="api-{{api.module}}-{{api.name}}" type="calls"
            metadata-trigger="{{api.trigger}}" metadata-method="{{api.method}}"
            metadata-context="{{api.context}}"
            output="apiEdges[]"/>
    </loop>
    <!-- Navigation Edges -->
    <loop over="{{navigationPatterns.list}}" as="nav">
      <task action="construct-edge" source="page-{{module}}-{{fileName}}"
            target="page-{{nav.targetModule}}-{{nav.targetPage}}" type="navigates-to"
            metadata-trigger="{{nav.trigger}}" metadata-method="{{nav.method}}"
            output="navEdges[]"/>
    </loop>
    <!-- Component Usage Edges -->
    <loop over="{{componentUsage.list}}" as="comp">
      <task action="construct-edge" source="page-{{module}}-{{fileName}}"
            target="component-{{module}}-{{comp.name}}" type="uses"
            metadata-context="{{comp.usageContext}}"
            output="useEdges[]"/>
    </loop>
    <event action="log" message="Step 3 Status: COMPLETED - Constructed {{edgeCount}} edges ({{apiEdges.count}} API calls, {{navEdges.count}} navigations, {{useEdges.count}} component uses)"/>
  </checkpoint>
  
  <!-- Step 4: Write Graph JSON -->
  <checkpoint name="step-4-write-graph-json" verify="valid-json-structure">
    <task action="calculate-marker-filename" module="{{module}}" subpath="{{extractSubpath sourcePath}}"
          fileName="{{fileName}}" output="markerFilename"/>
    <task action="write" target="{{completed_dir}}/{{markerFilename}}.graph.json">
      <content>
        {
          "module": "{{module}}",
          "nodes": [
            {{pageNode}},
            {{#each componentNodes}}
            {{this}}{{#unless @last}},{{/unless}}
            {{/each}}
          ],
          "edges": [
            {{#each apiEdges}}
            {{this}}{{#unless @last}},{{/unless}}
            {{/each}},
            {{#each navEdges}}
            {{this}}{{#unless @last}},{{/unless}}
            {{/each}},
            {{#each useEdges}}
            {{this}}{{#unless @last}},{{/unless}}
            {{/each}}
          ]
        }
      </content>
    </task>
    <event action="log" message="Step 4 Status: COMPLETED - Graph JSON written to {{completed_dir}}/{{markerFilename}}.graph.json"/>
  </checkpoint>
  
  <!-- Step 5: Write Completion Marker -->
  <checkpoint name="step-5-write-marker" verify="valid-marker-structure">
    <task action="write" target="{{completed_dir}}/{{markerFilename}}.graph-done.json">
      <content>
        {
          "fileName": "{{fileName}}",
          "sourcePath": "{{sourcePath}}",
          "sourceFile": "{{sourceFile}}",
          "module": "{{module}}",
          "documentPath": "{{documentPath}}",
          "marker": "graph_completed",
          "graphFile": "{{markerFilename}}.graph.json",
          "nodeCount": {{nodeCount}},
          "edgeCount": {{edgeCount}},
          "status": "{{status}}",
          "analysisNotes": "{{analysisNotes}}"
        }
      </content>
    </task>
    <event action="log" message="Step 5 Status: COMPLETED - Graph completion marker written to {{completed_dir}}/{{markerFilename}}.graph-done.json"/>
  </checkpoint>
  
  <!-- Output Results -->
  <output name="status" from="success"/>
  <output name="module" from="{{module}}"/>
  <output name="fileName" from="{{fileName}}"/>
  <output name="graphFile" from="{{completed_dir}}/{{markerFilename}}.graph.json"/>
  <output name="nodeCount" from="{{nodeCount}}"/>
  <output name="edgeCount" from="{{edgeCount}}"/>
  <output name="message" from="Generated graph data with {{nodeCount}} nodes and {{edgeCount}} edges"/>
  
  <!-- Constraints -->
  <rule level="mandatory" description="100% API coverage - ALL imported API functions MUST be represented as calls edges"/>
  <rule level="mandatory" description="Valid JSON format - Both .graph.json and .graph-done.json MUST be valid JSON"/>
  <rule level="mandatory" description="Root-level module field - .graph.json MUST include module at root level"/>
  <rule level="mandatory" description="Correct filename pattern - Use {module}-{subpath}-{fileName} composite naming"/>
  <rule level="mandatory" description="No file extension in fileName - The fileName field in .graph-done.json MUST NOT include extension"/>
  <rule level="mandatory" description="documentPath as N/A - Use N/A when no document exists, never empty string"/>
  
</workflow>
```

## Node Structure Reference

```json
{
  "id": "page-{module}-{feature-name}",
  "type": "page",
  "name": "<display name>",
  "module": "{{module}}",
  "sourcePath": "{{sourcePath}}",
  "documentPath": "{{documentPath}}",
  "description": "...",
  "tags": [...],
  "keywords": [...],
  "context": {
    "route": "...",
    "components": [...],
    "platform": "{{platform_type}}-{{platform_subtype}}"
  }
}
```

## Edge Structure Reference

```json
{
  "source": "page-{module}-{name}",
  "target": "api-{module}-{api-name}",
  "type": "calls",
  "metadata": {
    "trigger": "onClick|onMounted|onSubmit|...",
    "method": "getUserList",
    "context": "Page initialization - load user list"
  }
}
```

## Node ID Naming Convention

```
{type}-{module}-{name}

Examples:
  page-system-user-list
  page-system-user-detail
  component-system-user-form
  component-shared-delete-confirm
```

## Marker File Naming Convention

```
{completed_dir}/{module}-{subpath}-{fileName}.graph.json
```

**Naming Rule Explanation:**

The marker filename MUST follow the composite naming pattern `{module}-{subpath}-{fileName}` to prevent conflicts between same-named source files.

**How to Extract Each Component from `{{sourcePath}}`:**

1. **module**: Use `{{module}}` input variable directly (e.g., `system`, `trade`, `bpm`)

2. **subpath**: Extract the middle path between the platform source root and the file name:
   - Remove the top-level directory prefix (e.g., `yudao-ui/yudao-ui-admin-vue3/src/views/`)
   - Remove the file name at the end
   - Replace path separators (`/`) with hyphens (`-`)
   - If the file is at the module root directory, subpath will be empty → omit from filename

3. **fileName**: Use `{{fileName}}` input variable (file name WITHOUT extension)

**Examples:**

| sourcePath | module | subpath | fileName | Marker Filename |
|------------|--------|---------|----------|-----------------|
| `yudao-ui/.../system/notify/message/index.vue` | `system` | `notify-message` | `index` | `system-notify-message-index.graph.json` |
| `yudao-ui/.../system/user/index.vue` | `system` | `user` | `index` | `system-user-index.graph.json` |
| `yudao-ui/.../bpm/process-instance/index.vue` | `bpm` | `process-instance` | `index` | `bpm-process-instance-index.graph.json` |

**Special Case - Empty subpath:**
- If the file is directly in the module root directory: `{module}-{fileName}.graph.json`
- Example: `yudao-ui/.../system/index.vue` → `system-index.graph.json`

## Edge Types Reference

| Edge Type | Direction | When to Create |
|-----------|-----------|----------------|
| `calls` | page → api | Page calls an API endpoint |
| `navigates-to` | page → page | Page navigates to another page |
| `uses` | page → component | Page uses a shared/local component |

## API Coverage Verification Checklist

- [ ] List ALL imported API functions from the source file
- [ ] For each imported API, verify there is a corresponding `calls` edge
- [ ] Check event handlers for API calls
- [ ] Check lifecycle hooks for initialization API calls
- [ ] Check status toggles, action buttons for special operation APIs
- [ ] Verify no imported API is left unmapped

## Pre-write Verification Checklist

### Graph JSON Verification:
- [ ] Filename follows `{module}-{subpath}-{fileName}.graph.json` pattern
- [ ] JSON is valid (no trailing commas, all strings quoted)
- [ ] Root-level `module` field is present
- [ ] `nodes` and `edges` are arrays
- [ ] ALL imported API functions are represented as `calls` edges

### Completion Marker Verification:
- [ ] Filename follows `{module}-{subpath}-{fileName}.graph-done.json` pattern
- [ ] JSON is valid
- [ ] `fileName` does NOT contain file extension
- [ ] `sourceFile` matches `features-{platform}.json` pattern
- [ ] `module` field is present and non-empty
- [ ] `documentPath` is `"N/A"` when no document exists (not empty string)
- [ ] `nodeCount` and `edgeCount` match actual graph data

## Constraints

1. **100% API coverage** - ALL imported API functions MUST be represented as `calls` edges
2. **Valid JSON format** - Both `.graph.json` and `.graph-done.json` MUST be valid JSON
3. **Root-level module field** - `.graph.json` MUST include `module` at root level
4. **Correct filename pattern** - Use `{module}-{subpath}-{fileName}` composite naming
5. **No file extension in fileName** - The `fileName` field in `.graph-done.json` MUST NOT include extension
6. **documentPath as N/A** - Use `"N/A"` when no document exists, never empty string

## Task Completion Report

When the task is complete, report the following:

**Status:** `success` | `partial` | `failed`

**Summary:**
- Feature: `{{fileName}}`
- Module: `{{module}}`
- Nodes constructed: `{{nodeCount}}`
- Edges constructed: `{{edgeCount}}`

**Files Generated:**
- `{{completed_dir}}/{marker-filename}.graph.json`
- `{{completed_dir}}/{marker-filename}.graph-done.json`
