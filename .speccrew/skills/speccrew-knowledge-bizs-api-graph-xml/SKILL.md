---
name: speccrew-knowledge-bizs-api-graph-xml
description: Constructs knowledge graph data (nodes, edges, relationships) from API analysis results using XML workflow blocks. Generates graph JSON files and completion markers for the bizs knowledge pipeline.
tools: Read, Write, Glob, Grep, Bash
---

# API Knowledge Graph Constructor (XML Workflow)

> **CRITICAL CONSTRAINT**: DO NOT create temporary scripts, batch files, or workaround code files (`.py`, `.bat`, `.sh`, `.ps1`, etc.) under any circumstances. If execution encounters errors, STOP and report the exact error. Fixes must be applied to the Skill definition or source scripts — not patched at runtime.

Construct knowledge graph data structures (nodes and edges) from API analysis results. This skill transforms structured API documentation into graph JSON format for knowledge base integration.

## Language Adaptation

This skill automatically adapts to the user's input language. All documentation and output will be generated in the same language as the user's query.

## Trigger Scenarios

- "Construct graph data from API analysis results"
- "Generate knowledge graph nodes and edges for API feature"
- "Write graph JSON for API controller"

## Input Parameters

| Parameter | Required | Description | Example |
|-----------|----------|-------------|---------|
| `api_analysis_path` | Yes | Path to the API analysis document (from bizs-api-analyze) | `"speccrew-workspace/knowledges/bizs/admin-api/system/user/UserController.md"` |
| `platform_id` | Yes | Target platform identifier | `"admin-api"`, `"app-api"` |
| `output_dir` | Yes | Output directory for graph data | `"speccrew-workspace/knowledges/base/sync-state/knowledge-bizs/completed"` |
| `module` | Yes | Business module name | `"system"`, `"trade"`, `"ai"` |
| `fileName` | Yes | Controller class name (without extension) | `"UserController"` |
| `sourcePath` | Yes | Relative path to source file | `"yudao-module-system/.../UserController.java"` |
| `sourceFile` | Yes | Source features JSON filename | `"features-admin-api.json"` |
| `language` | Yes | Target language for content | `"zh"`, `"en"` |
| `subpath` | No | Subpath extracted from sourcePath (for marker naming) | `"controller-admin-user"` |

## Output Variables

| Variable | Type | Description |
|----------|------|-------------|
| `{{status}}` | string | Graph construction status: `"success"` or `"failed"` |
| `{{graph_file}}` | string | Path to the generated graph JSON file |
| `{{node_count}}` | integer | Number of nodes generated |
| `{{edge_count}}` | integer | Number of edges generated |

## Execution Requirements

This skill operates in **strict sequential execution mode**:
- Execute steps in exact order (Step 1 → Step 2 → ... → Step 6)
- Output step status after each step completion
- Do NOT skip any step

## Output

**Generated Files:**
1. `{{output_dir}}/{module}-{subpath}-{fileName}.graph.json` - Graph data with nodes and edges
2. `{{output_dir}}/{module}-{subpath}-{fileName}.graph-done.json` - Graph completion marker

**Return Value:**
```json
{
  "status": "success|failed",
  "module": "{{module}}",
  "fileName": "{{fileName}}",
  "graphFile": "{{output_dir}}/{module}-{subpath}-{fileName}.graph.json",
  "nodeCount": 15,
  "edgeCount": 23,
  "message": "Generated graph data with 15 nodes and 23 edges"
}
```

## Workflow

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `speccrew-workspace/docs/rules/xml-workflow-spec.md`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<workflow id="api-knowledge-graph-construction" version="1.0" status="pending" desc="API knowledge graph construction workflow">

  <!-- Input Parameters -->
  <block type="input" id="I1" desc="API graph construction input parameters">
    <field name="api_analysis_path" required="true" type="string" desc="Path to the API analysis document"/>
    <field name="platform_id" required="true" type="string" desc="Target platform identifier"/>
    <field name="output_dir" required="true" type="string" desc="Output directory for graph data"/>
    <field name="module" required="true" type="string" desc="Business module name"/>
    <field name="fileName" required="true" type="string" desc="Controller class name without extension"/>
    <field name="sourcePath" required="true" type="string" desc="Relative path to source file"/>
    <field name="sourceFile" required="true" type="string" desc="Source features JSON filename"/>
    <field name="language" required="true" type="string" desc="Target language for content"/>
    <field name="subpath" required="false" type="string" desc="Subpath extracted from sourcePath"/>
    <field name="workspace_path" required="true" type="string" desc="Workspace root path"/>
    <field name="sync_state_bizs_dir" required="true" type="string" desc="Sync state directory path"/>
  </block>

  <!-- ==================== GLOBAL CONTINUOUS EXECUTION RULES ==================== -->
  <block type="rule" id="GLOBAL-R1" level="forbidden" desc="Continuous execution constraints — NEVER violate">
    <field name="text">DO NOT ask user "Should I continue?" or "How would you like to proceed?" during execution</field>
    <field name="text">DO NOT offer options like "Full execution / Partial / Stop" — always execute ALL tasks to completion</field>
    <field name="text">DO NOT suggest "Due to context window limits, let me pause" — complete current task, use checkpoint for resumption</field>
    <field name="text">DO NOT estimate workload and suggest breaking it into phases — execute ALL items in sequence</field>
    <field name="text">DO NOT warn about "large number of files" or "this may take a while" — proceed with generation</field>
    <field name="text">Context window management: if approaching limit, save progress to checkpoint file and resume — do NOT ask user for guidance</field>
  </block>

  <!-- Step 1: Read API Analysis Document -->
  <sequence id="S1" name="Step 1: Read Document" status="pending" desc="Read and parse API analysis document">
    <block type="task" id="B1a" action="read-file" desc="Read API analysis document">
      <field name="path" value="${api_analysis_path}"/>
      <field name="output" var="apiAnalysisContent"/>
    </block>

    <block type="task" id="B1b" action="analyze" desc="Parse endpoints">
      <field name="content" value="${apiAnalysisContent}"/>
      <field name="output" var="endpoints"/>
    </block>

    <block type="task" id="B1c" action="analyze" desc="Parse service references">
      <field name="content" value="${apiAnalysisContent}"/>
      <field name="output" var="serviceReferences"/>
    </block>

    <block type="task" id="B1d" action="analyze" desc="Parse database tables">
      <field name="content" value="${apiAnalysisContent}"/>
      <field name="output" var="databaseTables"/>
    </block>

    <block type="task" id="B1e" action="analyze" desc="Parse DTOs">
      <field name="content" value="${apiAnalysisContent}"/>
      <field name="output" var="dtos"/>
    </block>

    <block type="task" id="B1f" action="analyze" desc="Parse business rules">
      <field name="content" value="${apiAnalysisContent}"/>
      <field name="output" var="businessRules"/>
    </block>

    <block type="checkpoint" id="CP1" name="step-1-read-document" desc="Document read checkpoint">
      <field name="verify" value="${apiAnalysisContent} != null"/>
    </block>

    <block type="event" id="E1" action="log" level="info" desc="Log step 1 completion">
      <field name="message">Step 1 Status: COMPLETED - Read ${api_analysis_path}, Found ${endpoints.length} endpoints</field>
    </block>
  </sequence>

  <!-- Step 2: Extract Graph Nodes -->
  <sequence id="S2" name="Step 2: Extract Nodes" status="pending" desc="Extract graph nodes from API analysis">
    <!-- API Endpoint Nodes -->
    <block type="loop" id="L2a" over="${endpoints}" as="endpoint" desc="Construct API nodes">
      <block type="task" id="B2a" action="analyze" desc="Construct API node">
        <field name="type" value="api"/>
        <field name="id" value="api-${module}-${endpoint.name}"/>
        <field name="name" value="${endpoint.displayName}"/>
        <field name="module" value="${module}"/>
        <field name="sourcePath" value="${sourcePath}"/>
        <field name="documentPath" value="${api_analysis_path}"/>
        <field name="description" value="${endpoint.description}"/>
        <field name="metadata-method" value="${endpoint.method}"/>
        <field name="metadata-path" value="${endpoint.path}"/>
        <field name="metadata-permissions" value="${endpoint.permissions}"/>
        <field name="output" var="apiNodes"/>
      </block>
    </block>

    <!-- Service Nodes -->
    <block type="loop" id="L2b" over="${serviceReferences}" as="service" desc="Construct service nodes">
      <block type="task" id="B2b" action="analyze" desc="Construct service node">
        <field name="type" value="service"/>
        <field name="id" value="service-${module}-${service.name}"/>
        <field name="name" value="${service.className}"/>
        <field name="module" value="${module}"/>
        <field name="sourcePath" value="${service.sourcePath}"/>
        <field name="documentPath" value="${api_analysis_path}"/>
        <field name="description" value="${service.description}"/>
        <field name="metadata-methods" value="${service.methods}"/>
        <field name="output" var="serviceNodes"/>
      </block>
    </block>

    <!-- Table Nodes -->
    <block type="loop" id="L2c" over="${databaseTables}" as="table" desc="Construct table nodes">
      <block type="task" id="B2c" action="analyze" desc="Construct table node">
        <field name="type" value="table"/>
        <field name="id" value="table-${module}-${table.name}"/>
        <field name="name" value="${table.tableName}"/>
        <field name="module" value="${module}"/>
        <field name="sourcePath" value=""/>
        <field name="documentPath" value="${api_analysis_path}"/>
        <field name="description" value="${table.description}"/>
        <field name="metadata-fields" value="${table.fields}"/>
        <field name="metadata-indexes" value="${table.indexes}"/>
        <field name="output" var="tableNodes"/>
      </block>
    </block>

    <!-- DTO Nodes -->
    <block type="loop" id="L2d" over="${dtos}" as="dto" desc="Construct DTO nodes">
      <block type="task" id="B2d" action="analyze" desc="Construct DTO node">
        <field name="type" value="dto"/>
        <field name="id" value="dto-${module}-${dto.name}"/>
        <field name="name" value="${dto.className}"/>
        <field name="module" value="${module}"/>
        <field name="sourcePath" value="${dto.sourcePath}"/>
        <field name="documentPath" value="${api_analysis_path}"/>
        <field name="description" value="${dto.description}"/>
        <field name="metadata-fields" value="${dto.fields}"/>
        <field name="metadata-validation" value="${dto.validation}"/>
        <field name="output" var="dtoNodes"/>
      </block>
    </block>

    <block type="checkpoint" id="CP2" name="step-2-extract-nodes" desc="Nodes extracted checkpoint">
      <field name="verify" value="${apiNodes.length} > 0 OR ${serviceNodes.length} > 0"/>
    </block>

    <block type="event" id="E2" action="log" level="info" desc="Log step 2 completion">
      <field name="message">Step 2 Status: COMPLETED - Extracted graph nodes (${apiNodes.length} APIs, ${serviceNodes.length} services, ${tableNodes.length} tables, ${dtoNodes.length} DTOs)</field>
    </block>
  </sequence>

  <!-- Step 3: Extract Graph Edges -->
  <sequence id="S3" name="Step 3: Extract Edges" status="pending" desc="Extract graph edges from API analysis">
    <!-- API to Table Edges (operates) -->
    <block type="loop" id="L3a" over="${endpoints}" as="endpoint" desc="Construct operates edges">
      <block type="loop" id="L3a1" over="${endpoint.tablesAccessed}" as="tableRef" desc="Construct operates edge">
        <block type="task" id="B3a" action="analyze" desc="Construct operates edge">
          <field name="source" value="api-${module}-${endpoint.name}"/>
          <field name="target" value="table-${module}-${tableRef.tableName}"/>
          <field name="type" value="operates"/>
          <field name="metadata-operation" value="${tableRef.operation}"/>
          <field name="metadata-description" value="${tableRef.description}"/>
          <field name="output" var="operatesEdges"/>
        </block>
      </block>
    </block>

    <!-- API to Service Edges (invokes) -->
    <block type="loop" id="L3b" over="${endpoints}" as="endpoint" desc="Construct invokes edges">
      <block type="loop" id="L3b1" over="${endpoint.servicesInvoked}" as="serviceRef" desc="Construct invokes edge">
        <block type="task" id="B3b" action="analyze" desc="Construct invokes edge">
          <field name="source" value="api-${module}-${endpoint.name}"/>
          <field name="target" value="service-${module}-${serviceRef.serviceName}"/>
          <field name="type" value="invokes"/>
          <field name="metadata-method" value="${serviceRef.method}"/>
          <field name="metadata-description" value="${serviceRef.description}"/>
          <field name="output" var="invokesEdges"/>
        </block>
      </block>
    </block>

    <!-- API to DTO Edges (references) -->
    <block type="loop" id="L3c" over="${endpoints}" as="endpoint" desc="Construct references edges">
      <block type="loop" id="L3c1" over="${endpoint.dtosUsed}" as="dtoRef" desc="Construct references edge">
        <block type="task" id="B3c" action="analyze" desc="Construct references edge">
          <field name="source" value="api-${module}-${endpoint.name}"/>
          <field name="target" value="dto-${module}-${dtoRef.dtoName}"/>
          <field name="type" value="references"/>
          <field name="metadata-usage" value="${dtoRef.usage}"/>
          <field name="metadata-description" value="${dtoRef.description}"/>
          <field name="output" var="referencesEdges"/>
        </block>
      </block>
    </block>

    <!-- Service to Service Edges (depends-on) -->
    <block type="loop" id="L3d" over="${serviceReferences}" as="service" desc="Construct depends-on edges">
      <block type="loop" id="L3d1" over="${service.dependencies}" as="dep" desc="Construct depends-on edge">
        <block type="task" id="B3d" action="analyze" desc="Construct depends-on edge">
          <field name="source" value="service-${module}-${service.name}"/>
          <field name="target" value="service-${module}-${dep.serviceName}"/>
          <field name="type" value="depends-on"/>
          <field name="metadata-description" value="${dep.description}"/>
          <field name="output" var="dependsOnEdges"/>
        </block>
      </block>
    </block>

    <!-- DTO to Table Edges (maps-to) -->
    <block type="loop" id="L3e" over="${dtos}" as="dto" desc="Construct maps-to edges">
      <block type="loop" id="L3e1" over="${dto.mappedTables}" as="mappedTable" desc="Construct maps-to edge">
        <block type="task" id="B3e" action="analyze" desc="Construct maps-to edge">
          <field name="source" value="dto-${module}-${dto.name}"/>
          <field name="target" value="table-${module}-${mappedTable.tableName}"/>
          <field name="type" value="maps-to"/>
          <field name="metadata-description" value="${mappedTable.description}"/>
          <field name="output" var="mapsToEdges"/>
        </block>
      </block>
    </block>

    <block type="checkpoint" id="CP3" name="step-3-extract-edges" desc="Edges extracted checkpoint">
      <field name="verify" value="${operatesEdges.length} >= 0"/>
    </block>

    <block type="event" id="E3" action="log" level="info" desc="Log step 3 completion">
      <field name="message">Step 3 Status: COMPLETED - Extracted graph edges (${operatesEdges.length + invokesEdges.length + referencesEdges.length + dependsOnEdges.length + mapsToEdges.length} total)</field>
    </block>
  </sequence>

  <!-- Step 4: Write Graph JSON -->
  <sequence id="S4" name="Step 4: Write Graph JSON" status="pending" desc="Write graph JSON file">
    <block type="task" id="B4a" action="analyze" desc="Calculate marker filename">
      <field name="module" value="${module}"/>
      <field name="subpath" value="${subpath}"/>
      <field name="fileName" value="${fileName}"/>
      <field name="output" var="markerFilename"/>
    </block>

    <block type="task" id="B4b" action="write-file" desc="Write graph JSON">
      <field name="path" value="${output_dir}/${markerFilename}.graph.json"/>
      <field name="content" desc="Graph JSON with nodes and edges arrays"/>
      <field name="note">Write valid JSON with module field, nodes array, and edges array</field>
    </block>

    <block type="checkpoint" id="CP4" name="step-4-write-graph-json" desc="Graph JSON written checkpoint">
      <field name="verify" value="valid-json-structure"/>
    </block>

    <block type="event" id="E4" action="log" level="info" desc="Log step 4 completion">
      <field name="message">Step 4 Status: COMPLETED - Graph JSON written to ${output_dir}/${markerFilename}.graph.json</field>
    </block>
  </sequence>

  <!-- Step 5: Write Graph Completion Marker -->
  <sequence id="S5" name="Step 5: Write Marker" status="pending" desc="Write completion marker">
    <block type="task" id="B5" action="write-file" desc="Write graph-done marker">
      <field name="path" value="${output_dir}/${markerFilename}.graph-done.json"/>
      <field name="content" desc="Marker JSON with fileName, module, marker, graphFile, nodeCount, edgeCount, status"/>
    </block>

    <block type="checkpoint" id="CP5" name="step-5-write-marker" desc="Marker written checkpoint">
      <field name="verify" value="valid-marker-structure"/>
    </block>

    <block type="event" id="E5" action="log" level="info" desc="Log step 5 completion">
      <field name="message">Step 5 Status: COMPLETED - Graph completion marker written to ${output_dir}/${markerFilename}.graph-done.json</field>
    </block>
  </sequence>

  <!-- Step 6: Report Results -->
  <sequence id="S6" name="Step 6: Report Results" status="pending" desc="Report graph construction results">
    <block type="gateway" id="G6" mode="exclusive" desc="Determine result status">
      <branch test="${success} == true" name="Success">
        <block type="event" id="E6a" action="log" level="info" desc="Log success">
          <field name="message">Step 6 Status: COMPLETED - Graph construction success: Generated graph data with ${node_count} nodes and ${edge_count} edges</field>
        </block>
      </branch>
      <branch test="${success} == false" name="Failure">
        <block type="event" id="E6b" action="log" level="error" desc="Log failure">
          <field name="message">Step 6 Status: COMPLETED - Graph construction failed: ${error_message}</field>
        </block>
      </branch>
    </block>
  </sequence>

  <!-- Output Block -->
  <block type="output" id="O1" desc="API graph construction output results">
    <field name="status" from="${success}"/>
    <field name="module" from="${module}"/>
    <field name="fileName" from="${fileName}"/>
    <field name="graphFile" from="${output_dir}/${markerFilename}.graph.json"/>
    <field name="nodeCount" from="${node_count}"/>
    <field name="edgeCount" from="${edge_count}"/>
    <field name="message" value="Generated graph data with ${node_count} nodes and ${edge_count} edges"/>
  </block>

  <!-- Constraints -->
  <block type="rule" id="R1" level="mandatory" desc="Single document input">
    <field name="text">This skill processes ONE API analysis document at a time</field>
  </block>
  <block type="rule" id="R2" level="mandatory" desc="JSON format">
    <field name="text">All output files MUST be valid JSON</field>
  </block>
  <block type="rule" id="R3" level="mandatory" desc="Module field">
    <field name="text">The root-level module field is MANDATORY in graph JSON</field>
  </block>
  <block type="rule" id="R4" level="mandatory" desc="Node uniqueness">
    <field name="text">Each node ID must be unique within the graph</field>
  </block>
  <block type="rule" id="R5" level="mandatory" desc="Edge validity">
    <field name="text">Edge source/target must reference existing node IDs</field>
  </block>
  <block type="rule" id="R6" level="mandatory" desc="Path format">
    <field name="text">Use relative paths, NEVER absolute paths in JSON content</field>
  </block>

</workflow>
```

## Node ID Naming Convention

```
{type}-{module}-{name}

Examples:
  api-system-user-list
  api-system-user-create
  service-system-user-service
  table-system-system_user
  dto-system-user-create-req
```

## Marker File Naming Convention

```
{output_dir}/{module}-{subpath}-{fileName}.graph.json
```

**How to Extract Each Component:**

1. **module**: Use `{{module}}` input variable directly (e.g., `system`, `trade`, `ai`)

2. **subpath**: Extract from `{{sourcePath}}`:
   - For Java: Remove package prefix up to the business layer (e.g., `controller/admin/`, `controller/app/`)
   - Remove the file name at the end
   - Replace path separators (`/`) with hyphens (`-`)
   - If the file is at module root, subpath will be empty → omit from filename

3. **fileName**: Use `{{fileName}}` input variable (class name WITHOUT extension)

**Examples:**

| sourcePath | module | subpath | fileName | Marker Filename |
|------------|--------|---------|----------|-----------------|
| `yudao-module-system/.../controller/admin/notify/NotifyMessageController.java` | `system` | `controller-admin-notify` | `NotifyMessageController` | `system-controller-admin-notify-NotifyMessageController.graph.json` |
| `yudao-module-system/.../controller/admin/user/UserController.java` | `system` | `controller-admin-user` | `UserController` | `system-controller-admin-user-UserController.graph.json` |
| `yudao-module-ai/.../controller/admin/chat/ChatConversationController.java` | `ai` | `controller-admin-chat` | `ChatConversationController` | `ai-controller-admin-chat-ChatConversationController.graph.json` |

## Node Type Reference

| Type | Description | Required Metadata |
|------|-------------|-------------------|
| `api` | API endpoint | `method`, `path`, `permissions` |
| `service` | Service class | `methods` |
| `table` | Database table | `fields`, `indexes` |
| `dto` | Data Transfer Object | `fields`, `validation` |

## Edge Type Reference

| Type | Description | Source → Target |
|------|-------------|-----------------|
| `operates` | API operates on table | api → table |
| `invokes` | API calls service | api → service |
| `references` | API uses DTO | api → dto |
| `depends-on` | Service dependency | service → service |
| `maps-to` | DTO maps to table | dto → table |

## Node Structure Examples

### API Node Example
```json
{
  "id": "api-{module}-{endpoint-name}",
  "type": "api",
  "name": "<display name>",
  "module": "{{module}}",
  "sourcePath": "{{sourcePath}}",
  "documentPath": "{{api_analysis_path}}",
  "description": "...",
  "metadata": {
    "method": "GET",
    "path": "/admin-api/system/user/page",
    "permissions": ["system:user:query"]
  }
}
```

### Service Node Example
```json
{
  "id": "service-{module}-{service-name}",
  "type": "service",
  "name": "UserService",
  "module": "{{module}}",
  "sourcePath": "relative/path/to/UserService.java",
  "description": "User business logic service",
  "metadata": {
    "methods": ["getUserPage", "createUser", "updateUser"]
  }
}
```

### Table Node Example
```json
{
  "id": "table-{module}-{table-name}",
  "type": "table",
  "name": "system_user",
  "module": "{{module}}",
  "sourcePath": "",
  "description": "User table",
  "metadata": {
    "fields": ["id", "username", "password", "status"],
    "indexes": ["idx_username"]
  }
}
```

### DTO Node Example
```json
{
  "id": "dto-{module}-{dto-name}",
  "type": "dto",
  "name": "UserCreateReqVO",
  "module": "{{module}}",
  "sourcePath": "relative/path/to/UserCreateReqVO.java",
  "description": "Create user request DTO",
  "metadata": {
    "fields": ["username", "password", "nickname"],
    "validation": ["@NotBlank username", "@Size(max=50) nickname"]
  }
}
```

## Edge Structure Examples

### API to Table Edge (operates)
```json
{
  "source": "api-system-user-list",
  "target": "table-system-system_user",
  "type": "operates",
  "metadata": {
    "operation": "SELECT",
    "description": "Query user list with pagination"
  }
}
```

### API to Service Edge (invokes)
```json
{
  "source": "api-system-user-create",
  "target": "service-system-user-service",
  "type": "invokes",
  "metadata": {
    "method": "createUser",
    "description": "Create user business logic"
  }
}
```

### API to DTO Edge (references)
```json
{
  "source": "api-system-user-create",
  "target": "dto-system-user-create-req",
  "type": "references",
  "metadata": {
    "usage": "request",
    "description": "Create user request body"
  }
}
```

### Service to Service Edge (depends-on)
```json
{
  "source": "service-system-user-service",
  "target": "service-system-permission-service",
  "type": "depends-on",
  "metadata": {
    "description": "User service depends on permission service for role checks"
  }
}
```

### DTO to Table Edge (maps-to)
```json
{
  "source": "dto-system-user-do",
  "target": "table-system-system_user",
  "type": "maps-to",
  "metadata": {
    "description": "UserDO maps to system_user table"
  }
}
```

## Pre-write Verification Checklist

### Graph JSON Verification:
- [ ] Root-level `module` field is present (MANDATORY)
- [ ] `nodes` and `edges` are arrays (can be empty)
- [ ] Valid JSON (no trailing commas, all strings quoted)
- [ ] All node IDs are unique
- [ ] All edge source/target references point to valid node IDs

### API Endpoint Coverage Check:
- [ ] ALL public API endpoint methods in the controller are represented as `api` nodes
- [ ] Status update endpoints (updateStatus, toggleEnable) are included
- [ ] Special operation endpoints (resetPassword, export, import, batch operations) are included
- [ ] Each `api` node has proper metadata with HTTP method and path
- [ ] No public endpoint method is left without a corresponding node

### Completion Marker Verification:
- [ ] Filename follows `{module}-{subpath}-{fileName}.graph-done.json` pattern
- [ ] JSON is valid
- [ ] All required fields are present
- [ ] `nodeCount` and `edgeCount` match actual graph data

## Constraints

1. **Single Document Input**: This skill processes ONE API analysis document at a time
2. **JSON Format**: All output files MUST be valid JSON
3. **Module Field**: The root-level `module` field is MANDATORY in graph JSON
4. **Node Uniqueness**: Each node ID must be unique within the graph
5. **Edge Validity**: Edge source/target must reference existing node IDs
6. **Path Format**: Use relative paths, NEVER absolute paths in JSON content
