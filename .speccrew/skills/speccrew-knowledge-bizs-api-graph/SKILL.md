---
name: speccrew-knowledge-bizs-api-graph
description: Constructs knowledge graph data (nodes, edges, relationships) from API analysis results using XML workflow blocks. Generates graph JSON files and completion markers for the bizs knowledge pipeline.
tools: Read, Write, Glob, Grep, Bash
---

# Trigger Scenarios
- "Construct graph data from API analysis results"
- "Generate knowledge graph nodes and edges for API feature"
- "Write graph JSON for API controller"

## AgentFlow Definition
<!-- @agentflow: SKILL.xml -->
> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
