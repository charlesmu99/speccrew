---
name: speccrew-knowledge-graph-query
description: Query the knowledge graph to find nodes, edges, relationships, and perform impact analysis. Used by any agent that needs cross-referencing capabilities (e.g., finding which pages call an API, tracing table dependencies).
tools: Bash
---

# Knowledge Graph Query

Query the knowledge graph stored in `speccrew-workspace/knowledges/bizs/graph/` to find nodes, edges, and trace relationships. This skill wraps `graph-query.js` script for all read operations.

## Trigger Scenarios

- "Find all APIs in module {module}"
- "What pages call API {apiId}?"
- "Show impact analysis for table {tableId}"
- "Search for entities related to {keyword}"
- "Trace upstream dependencies of {nodeId}"
- "Get all edges for node {nodeId}"

## User

Any Agent (speccrew-task-worker, speccrew-knowledge-dispatch, or other agents)

## Input Variables

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `{{action}}` | string | Query action to perform | `"get-node"`, `"query-nodes"`, `"get-edges"`, `"search"`, `"trace-upstream"`, `"trace-downstream"` |
| `{{id}}` | string | Node ID (for get-node, trace-*) | `"api-system-user-list"` |
| `{{module}}` | string | Filter by module (for query-nodes, search) | `"system"`, `"trade"` |
| `{{type}}` | string | Filter by node type (for query-nodes, search) | `"api"`, `"page"`, `"table"` |
| `{{keyword}}` | string | Search keyword (for search) | `"user"`, `"order"` |
| `{{direction}}` | string | Edge direction (for get-edges) | `"in"`, `"out"`, `"both"` |
| `{{depth}}` | number | Trace depth (for trace-*) | `2`, `3` |
| `{{graphRoot}}` | string | Path to graph root directory | `"speccrew-workspace/knowledges/bizs/graph"` |

## Output Variables

| Variable | Type | Description |
|----------|------|-------------|
| `{{status}}` | string | Query result: `"success"` or `"not-found"` |
| `{{resultCount}}` | number | Number of results returned |
| `{{data}}` | object/array | Query result data |

## Output

**Return Value (JSON format):**
```json
{
  "status": "success",
  "action": "query-nodes",
  "resultCount": 5,
  "data": [
    {
      "id": "api-system-user-list",
      "type": "api",
      "name": "List Users API",
      "module": "system",
      "sourcePath": "yudao-module-system/.../UserController.java",
      "description": "Paginated query of system users"
    }
  ]
}
```

## AgentFlow Definition

<!-- @agentflow: workflow.agentflow.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `speccrew-workspace/docs/rules/agentflow-spec.md`

---

## Common Query Patterns

| Scenario | Action | Parameters | Agent Use Case |
|----------|--------|-----------|---------------|
| Page → API | `get-edges` | nodeId=page-*, direction=out | UI agent: which APIs does this page use |
| API → Table | `get-edges` | nodeId=api-*, direction=out | Dev: which tables does this API touch |
| Table Impact | `trace-upstream` | id=table-*, depth=3 | Assess schema change impact |
| Module Overview | `query-nodes` | module=system | Generate module summary |
| Cross-Module Deps | `get-edges` | direction=out, filter cross-module | Inter-module dependency analysis |
| Keyword Search | `search` | keyword=user, type=api | Find all user-related APIs |

---

## Script Reference

Scripts location: `scripts/graph-query.js` (relative to this skill directory)

| Action | Parameters | Returns |
|--------|-----------|---------|
| `get-node` | `--id <id> --graphRoot <root>` | Single node JSON |
| `query-nodes` | `[--module <m>] [--type <t>] --graphRoot <root>` | Node array |
| `get-edges` | `--nodeId <id> --direction <in\|out\|both> --graphRoot <root>` | Edge array |
| `search` | `--keyword <kw> [--type <t>] [--module <m>] --graphRoot <root>` | Node array |
| `trace-upstream` | `--id <id> [--depth <n>] --graphRoot <root>` | Node + Edge tree |
| `trace-downstream` | `--id <id> [--depth <n>] --graphRoot <root>` | Node + Edge tree |

---

## Checklist

- [ ] `{{action}}` is one of: `get-node`, `query-nodes`, `get-edges`, `search`, `trace-upstream`, `trace-downstream`
- [ ] `{{graphRoot}}` path is correct (`speccrew-workspace/knowledges/bizs/graph`)
- [ ] For `get-node` / `trace-*`: `{{id}}` follows `{type}-{module}-{name}` format
- [ ] For `get-edges`: `{{direction}}` is one of `in`, `out`, `both`
- [ ] For `trace-*`: `{{depth}}` is a positive integer (default: 2)
- [ ] Script executed with Node.js (`node graph-query.js`)
- [ ] Result JSON parsed and used by calling agent
