---
name: speccrew-knowledge-bizs-api-graph
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

## AgentFlow Definition

<!-- @agentflow: SKILL.xml -->

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
