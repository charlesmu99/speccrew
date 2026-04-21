---
name: speccrew-pm-module-matcher
description: Match user requirement text against business knowledge base features to identify related modules. Reads features-*.json and performs semantic matching.
tools: Read
---

# Module Matcher

Match user requirement text against business knowledge base features to identify related modules. Performs semantic matching based on keywords, module names, and feature definitions.

## Language Adaptation

**CRITICAL**: Generate all content in the language specified by the `language` parameter.

- `language: "zh"` → Generate all content in 中文
- `language: "en"` → Generate all content in English
- Other languages → Use the specified language

**All output content must be in the target language only.**

## Trigger Scenarios

- "Find modules for requirement X"
- "Which modules handle user management?"
- "Match requirement to knowledge base"
- "Identify relevant modules"

## Input

| Variable | Type | Description | Required |
|----------|------|-------------|----------|
| `requirement_text` | string | User requirement text to match | **Yes** |
| `features_files` | string[] | Array of paths to features-*.json files | **Yes** |
| `language` | string | Target language for output | **Yes** |

## Output JSON

```json
{
  "matched_modules": [
    {
      "platform_id": "web-vue3",
      "module_name": "system",
      "platform_type": "web",
      "confidence": "high | medium | low",
      "matching_features": ["user-management", "role-management"],
      "feature_count": 15,
      "analyzed_count": 8,
      "source_path": "src/views/system"
    }
  ],
  "unmatched_keywords": ["workflow", "approval"],
  "recommendation": "Suggested modules based on requirement analysis",
  "total_platforms_scanned": 3,
  "total_modules_scanned": 12,
  "message": "Matching completed"
}
```

**Confidence Levels**:

| Level | Condition |
|-------|-----------|
| `high` | Direct keyword match with module name or feature fileName |
| `medium` | Partial match or synonym match |
| `low` | Related concept match only |

## AgentFlow Definition

<!-- @agentflow: SKILL.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `speccrew-workspace/docs/rules/agentflow-spec.md`

## Constraints

1. **READ-ONLY**: This skill does not modify any files
2. **Handle Chinese+English**: Support bilingual text matching
3. **Skip unreadable files**: Continue processing even if some files fail
4. **No external API**: Matching is done locally without LLM calls

## Error Handling

| Scenario | Action |
|----------|--------|
| File not found | Skip file, log warning |
| Invalid JSON | Skip file, log error |
| Empty features array | Continue with empty module list |
| No keywords extracted | Return empty matches with warning |

## Task Completion Report

When the task is complete, report:

```json
{
  "status": "success | partial | failed",
  "skill": "speccrew-pm-module-matcher",
  "matching_result": {
    "matched_count": 3,
    "high_confidence_count": 1,
    "medium_confidence_count": 1,
    "low_confidence_count": 1
  },
  "message": "Module matching completed"
}
```

## Checklist

- [ ] Step 1: Parsed requirement text and extracted keywords
- [ ] Step 2: Read all features files and built index
- [ ] Step 3: Performed semantic matching
- [ ] Step 4: Sorted results and generated recommendation
- [ ] Returned complete JSON output
