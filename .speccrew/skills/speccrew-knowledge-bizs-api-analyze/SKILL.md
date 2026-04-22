---
name: speccrew-knowledge-bizs-api-analyze
description: Analyze a single API controller from source code to extract business features and generate API documentation using XML Block workflow. Used by Worker Agent in parallel execution during knowledge base initialization Stage 2. Each worker analyzes one API controller file.
tools: Read, Write, Edit, Glob, Grep, Bash
---

# Trigger Scenarios
- "Analyze API controller {fileName} from source code"
- "Extract API features from controller {fileName}"
- "Generate documentation for API controller {fileName}"

## AgentFlow Definition
<!-- @agentflow: SKILL.xml -->
> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
