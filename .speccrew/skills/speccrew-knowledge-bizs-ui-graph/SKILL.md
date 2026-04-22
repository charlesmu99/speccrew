---
name: speccrew-knowledge-bizs-ui-graph
description: Constructs knowledge graph data (nodes, edges, relationships) from UI analysis results using XML workflow blocks. Generates graph JSON files and completion markers for the bizs knowledge pipeline.
tools: Read, Write, Glob, Grep, Bash
---

# Trigger Scenarios
- "Construct graph data for UI feature {fileName}"
- "Generate graph nodes and edges from UI analysis"
- "Write completion markers for feature {fileName}"

## AgentFlow Definition
<!-- @agentflow: SKILL.xml -->
> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
