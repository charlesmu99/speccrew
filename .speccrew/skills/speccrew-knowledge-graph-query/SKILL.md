---
name: speccrew-knowledge-graph-query
description: Query the knowledge graph to find nodes, edges, relationships, and perform impact analysis. Used by any agent that needs cross-referencing capabilities (e.g., finding which pages call an API, tracing table dependencies).
tools: Bash
---

# Trigger Scenarios
- "Find all APIs in module {module}"
- "What pages call API {apiId}?"
- "Show impact analysis for table {tableId}"

## AgentFlow Definition
<!-- @agentflow: SKILL.xml -->
> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
