---
name: speccrew-knowledge-bizs-ui-analyze
description: Analyze a single UI feature from source code to extract business functionality and generate feature documentation using XML Block workflow. Used by Worker Agent in parallel execution during knowledge base initialization Stage 2. Each worker analyzes one feature (e.g., one Vue/React page component).
tools: Read, Write, Edit, Glob, Grep, Bash
---

# Trigger Scenarios
- "Analyze feature {fileName} from source code"
- "Extract UI functionality from feature {fileName}"
- "Generate documentation for feature {fileName}"

## AgentFlow Definition
<!-- @agentflow: SKILL.xml -->
> **REQUIRED**: Before executing this workflow, read the XML workflow specification: speccrew-workspace/docs/rules/agentflow-spec.md
> Then read and execute the XML workflow in SKILL.xml block-by-block as the authoritative execution plan.
