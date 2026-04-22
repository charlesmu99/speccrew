---
name: speccrew-knowledge-graph-write
description: Write, update, and initialize knowledge graph data (nodes, edges, index, metadata). Used by Dispatch Agent after receiving graphData from analysis skills. Handles batch writes, deduplication, index updates, and module initialization.
tools: Bash
---

# Trigger Scenarios
- "Write graphData from skill analysis result to graph"
- "Initialize graph structure for module {module}"
- "Batch add nodes and edges for module {module}"

## AgentFlow Definition
<!-- @agentflow: SKILL.xml -->
> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
