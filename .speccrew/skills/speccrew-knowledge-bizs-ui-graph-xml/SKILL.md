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

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `docs/rules/xml-workflow-spec.md`

<workflow id="ui-knowledge-graph-construction" version="1.0" status="pending" desc="Construct graph data from UI analysis results">

  <!-- ============================================================
       Input Parameters Definition
       ============================================================ -->
  <block type="input" id="I1" desc="Workflow input parameters">
    <field name="feature" required="true" type="object" desc="Complete feature object from features.json"/>
    <field name="fileName" required="true" type="string" desc="Feature file name without extension"/>
    <field name="sourcePath" required="true" type="string" desc="Relative path to source file"/>
    <field name="documentPath" required="true" type="string" desc="Path to generated documentation"/>
    <field name="module" required="true" type="string" desc="Business module name"/>
    <field name="platform_type" required="true" type="string" desc="Platform type"/>
    <field name="platform_subtype" required="true" type="string" desc="Platform subtype"/>
    <field name="completed_dir" required="true" type="string" desc="Marker files output directory"/>
    <field name="sourceFile" required="true" type="string" desc="Source features JSON file name"/>
    <field name="status" required="false" type="string" default="success" desc="Analysis status from UI analysis"/>
    <field name="analysisNotes" required="false" type="string" default="" desc="Analysis notes from UI analysis"/>
  </block>

  <!-- ============================================================
       Global Continuous Execution Rules
       ============================================================ -->
  <block type="rule" id="GLOBAL-R1" level="forbidden" desc="Continuous execution constraints — NEVER violate">
    <field name="text">DO NOT ask user "Should I continue?" or "How would you like to proceed?" during execution</field>
    <field name="text">DO NOT offer options like "Full execution / Partial / Stop" — always execute ALL tasks to completion</field>
    <field name="text">DO NOT suggest "Due to context window limits, let me pause" — complete current task, use checkpoint for resumption</field>
    <field name="text">DO NOT estimate workload and suggest breaking it into phases — execute ALL items in sequence</field>
    <field name="text">DO NOT warn about "large number of files" or "this may take a while" — proceed with generation</field>
    <field name="text">Context window management: if approaching limit, save progress to checkpoint file and resume — do NOT ask user for guidance</field>
  </block>

  <!-- ============================================================
       Step 1: Read Source File
       ============================================================ -->
  <sequence id="S1" name="Step 1: Read Source File" status="pending" desc="Read source file and extract components">
    <block type="task" id="B1" action="read-file" desc="Read source file content">
      <field name="path" value="${sourcePath}"/>
      <field name="output" var="sourceContent"/>
    </block>

    <block type="task" id="B2" action="analyze" desc="Extract API imports from source content">
      <field name="input" value="${sourceContent}"/>
      <field name="output" var="apiImports"/>
    </block>

    <block type="task" id="B3" action="analyze" desc="Extract component usage from source content">
      <field name="input" value="${sourceContent}"/>
      <field name="output" var="componentUsage"/>
    </block>

    <block type="task" id="B4" action="analyze" desc="Extract navigation patterns from source content">
      <field name="input" value="${sourceContent}"/>
      <field name="output" var="navigationPatterns"/>
    </block>

    <block type="event" id="E1" action="log" level="info" desc="Log Step 1 completion">
Step 1 Status: COMPLETED - Read ${sourcePath}, found ${apiImports.count} APIs, ${componentUsage.count} components, ${navigationPatterns.count} navigations
    </block>

    <block type="checkpoint" id="CP1" name="step-1-read-source" desc="Source file read complete">
      <field name="file" value="${completed_dir}/.progress.json"/>
      <field name="verify" value="${sourceContent} != null"/>
    </block>
  </sequence>

  <!-- ============================================================
       Step 2: Construct Graph Nodes
       ============================================================ -->
  <sequence id="S2" name="Step 2: Construct Graph Nodes" status="pending" desc="Build page and component nodes">
    <block type="task" id="B5" action="analyze" desc="Construct page node">
      <field name="type" value="page"/>
      <field name="id" value="page-${module}-${fileName}"/>
      <field name="name" value="${fileName}"/>
      <field name="module" value="${module}"/>
      <field name="sourcePath" value="${sourcePath}"/>
      <field name="documentPath" value="${documentPath}"/>
      <field name="context_route" value="${extractedRoute}"/>
      <field name="context_components" value="${componentUsage.list}"/>
      <field name="context_platform" value="${platform_type}-${platform_subtype}"/>
      <field name="output" var="pageNode"/>
    </block>

    <block type="loop" id="L1" over="${componentUsage.list}" as="component" desc="Construct component nodes">
      <block type="task" id="B6" action="analyze" desc="Construct component node for ${component.name}">
        <field name="type" value="component"/>
        <field name="id" value="component-${module}-${component.name}"/>
        <field name="name" value="${component.name}"/>
        <field name="module" value="${module}"/>
        <field name="sourcePath" value="${component.path}"/>
        <field name="documentPath" value="${documentPath}"/>
        <field name="context_props" value="${component.props}"/>
        <field name="context_events" value="${component.events}"/>
        <field name="output" var="componentNodes[]" append="true"/>
      </block>
    </block>

    <block type="event" id="E2" action="log" level="info" desc="Log Step 2 completion">
Step 2 Status: COMPLETED - Constructed ${nodeCount} nodes
    </block>

    <block type="checkpoint" id="CP2" name="step-2-construct-nodes" desc="Graph nodes constructed">
      <field name="file" value="${completed_dir}/.progress.json"/>
      <field name="verify" value="${nodeCount} > 0"/>
    </block>
  </sequence>

  <!-- ============================================================
       Step 3: Construct Graph Edges
       ============================================================ -->
  <sequence id="S3" name="Step 3: Construct Graph Edges" status="pending" desc="Build API call, navigation, and component usage edges">
    <!-- API Call Edges -->
    <block type="loop" id="L2" over="${apiImports.list}" as="api" desc="Construct API call edges">
      <block type="task" id="B7" action="analyze" desc="Construct calls edge for ${api.name}">
        <field name="source" value="page-${module}-${fileName}"/>
        <field name="target" value="api-${api.module}-${api.name}"/>
        <field name="type" value="calls"/>
        <field name="metadata_trigger" value="${api.trigger}"/>
        <field name="metadata_method" value="${api.method}"/>
        <field name="metadata_context" value="${api.context}"/>
        <field name="output" var="apiEdges[]" append="true"/>
      </block>
    </block>

    <!-- Navigation Edges -->
    <block type="loop" id="L3" over="${navigationPatterns.list}" as="nav" desc="Construct navigation edges">
      <block type="task" id="B8" action="analyze" desc="Construct navigates-to edge">
        <field name="source" value="page-${module}-${fileName}"/>
        <field name="target" value="page-${nav.targetModule}-${nav.targetPage}"/>
        <field name="type" value="navigates-to"/>
        <field name="metadata_trigger" value="${nav.trigger}"/>
        <field name="metadata_method" value="${nav.method}"/>
        <field name="output" var="navEdges[]" append="true"/>
      </block>
    </block>

    <!-- Component Usage Edges -->
    <block type="loop" id="L4" over="${componentUsage.list}" as="comp" desc="Construct component usage edges">
      <block type="task" id="B9" action="analyze" desc="Construct uses edge for ${comp.name}">
        <field name="source" value="page-${module}-${fileName}"/>
        <field name="target" value="component-${module}-${comp.name}"/>
        <field name="type" value="uses"/>
        <field name="metadata_context" value="${comp.usageContext}"/>
        <field name="output" var="useEdges[]" append="true"/>
      </block>
    </block>

    <block type="event" id="E3" action="log" level="info" desc="Log Step 3 completion">
Step 3 Status: COMPLETED - Constructed ${edgeCount} edges (${apiEdges.count} API calls, ${navEdges.count} navigations, ${useEdges.count} component uses)
    </block>

    <block type="checkpoint" id="CP3" name="step-3-construct-edges" desc="Graph edges constructed">
      <field name="file" value="${completed_dir}/.progress.json"/>
      <field name="verify" value="${edgeCount} >= 0"/>
    </block>
  </sequence>

  <!-- ============================================================
       Step 4: Write Graph JSON
       ============================================================ -->
  <sequence id="S4" name="Step 4: Write Graph JSON" status="pending" desc="Generate and write graph data file">
    <block type="task" id="B10" action="analyze" desc="Calculate marker filename">
      <field name="module" value="${module}"/>
      <field name="subpath" value="${extractSubpath sourcePath}"/>
      <field name="fileName" value="${fileName}"/>
      <field name="output" var="markerFilename"/>
    </block>

    <block type="task" id="B11" action="write-file" desc="Write graph JSON file">
      <field name="path" value="${completed_dir}/${markerFilename}.graph.json"/>
      <field name="content_json">
        {
          "module": "${module}",
          "nodes": [
            ${pageNode},
            ${componentNodes}
          ],
          "edges": [
            ${apiEdges},
            ${navEdges},
            ${useEdges}
          ]
        }
      </field>
    </block>

    <block type="event" id="E4" action="log" level="info" desc="Log Step 4 completion">
Step 4 Status: COMPLETED - Graph JSON written to ${completed_dir}/${markerFilename}.graph.json
    </block>

    <block type="checkpoint" id="CP4" name="step-4-write-graph-json" desc="Graph JSON written">
      <field name="file" value="${completed_dir}/.progress.json"/>
      <field name="verify" value="valid-json-structure"/>
    </block>
  </sequence>

  <!-- ============================================================
       Step 5: Write Completion Marker
       ============================================================ -->
  <sequence id="S5" name="Step 5: Write Completion Marker" status="pending" desc="Generate and write completion marker file">
    <block type="task" id="B12" action="write-file" desc="Write graph completion marker">
      <field name="path" value="${completed_dir}/${markerFilename}.graph-done.json"/>
      <field name="content_json">
        {
          "fileName": "${fileName}",
          "sourcePath": "${sourcePath}",
          "sourceFile": "${sourceFile}",
          "module": "${module}",
          "documentPath": "${documentPath}",
          "marker": "graph_completed",
          "graphFile": "${markerFilename}.graph.json",
          "nodeCount": ${nodeCount},
          "edgeCount": ${edgeCount},
          "status": "${status}",
          "analysisNotes": "${analysisNotes}"
        }
      </field>
    </block>

    <block type="event" id="E5" action="log" level="info" desc="Log Step 5 completion">
Step 5 Status: COMPLETED - Graph completion marker written to ${completed_dir}/${markerFilename}.graph-done.json
    </block>

    <block type="checkpoint" id="CP5" name="step-5-write-marker" desc="Completion marker written">
      <field name="file" value="${completed_dir}/.progress.json"/>
      <field name="verify" value="valid-marker-structure"/>
    </block>
  </sequence>

  <!-- ============================================================
       Output Results
       ============================================================ -->
  <block type="output" id="O1" desc="Workflow output results">
    <field name="status" from="success" type="string" desc="Execution status"/>
    <field name="module" from="${module}" type="string" desc="Module name"/>
    <field name="fileName" from="${fileName}" type="string" desc="Feature file name"/>
    <field name="graphFile" from="${completed_dir}/${markerFilename}.graph.json" type="string" desc="Graph JSON file path"/>
    <field name="nodeCount" from="${nodeCount}" type="number" desc="Number of nodes constructed"/>
    <field name="edgeCount" from="${edgeCount}" type="number" desc="Number of edges constructed"/>
    <field name="message" from="Generated graph data with ${nodeCount} nodes and ${edgeCount} edges" type="string" desc="Summary message"/>
  </block>

  <!-- ============================================================
       Constraints
       ============================================================ -->
  <block type="rule" id="R1" level="mandatory" desc="Graph data constraints">
    <field name="text">100% API coverage - ALL imported API functions MUST be represented as calls edges</field>
    <field name="text">Valid JSON format - Both .graph.json and .graph-done.json MUST be valid JSON</field>
    <field name="text">Root-level module field - .graph.json MUST include module at root level</field>
    <field name="text">Correct filename pattern - Use {module}-{subpath}-{fileName} composite naming</field>
    <field name="text">No file extension in fileName - The fileName field in .graph-done.json MUST NOT include extension</field>
    <field name="text">documentPath as N/A - Use N/A when no document exists, never empty string</field>
  </block>

</workflow>

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
