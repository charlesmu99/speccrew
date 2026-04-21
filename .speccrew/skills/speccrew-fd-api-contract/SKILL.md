---
name: speccrew-fd-api-contract
description: API Contract Generation SOP. Based on feature spec document, outputs structured frontend-backend API contract document. Once confirmed, the contract cannot be modified in downstream stages.
tools: Read, Write, Glob, Grep
---

# Trigger Scenarios

- Automatically triggered by speccrew-fd-feature-design Skill after feature spec document completion
- User requests "Generate API documentation" or "Define API contract"

## AgentFlow Definition

<!-- @agentflow: SKILL.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `speccrew-workspace/docs/rules/agentflow-spec.md`

## Workflow

## Absolute Constraints

> **These rules apply to ALL steps. Violation = task failure.**

1. **FORBIDDEN: `create_file` for documents** — NEVER use `create_file` to write the API contract document. It MUST be created by copying the template (Step 4a) then filling sections with `search_replace` (Step 4b). `create_file` produces truncated output on large files.

2. **FORBIDDEN: Full-file rewrite** — NEVER replace the entire document content in a single operation. Always use targeted `search_replace` on specific sections.

3. **MANDATORY: Template-first workflow** — Step 4a (copy template) MUST execute before Step 4b (fill sections). Skipping Step 4a and writing content directly is FORBIDDEN.

4. **ABORT CONDITIONS** — If any of the following occur, STOP immediately and report to user:
   - Feature Spec document (`feature_spec_path`) does not exist or is empty → STOP
   - API Contract template file does not exist → STOP
   - `node ... update-progress.js` script execution fails → **HARD STOP**: Do NOT manually create or edit JSON progress files. Report the script error and wait for user resolution.

### Error Categories

| Category | Condition | Recovery |
|----------|-----------|----------|
| `DEPENDENCY_MISSING` | Feature Spec document not found or empty | Ensure feature design phase completed for this feature |
| `DEPENDENCY_MISSING` | API Contract template not found | Verify skill installation integrity |
| `VALIDATION_ERROR` | Feature Spec missing required API sections | Review and fix feature spec content |
| `RUNTIME_ERROR` | update-progress.js script execution failed | Check script errors; do NOT manually edit JSON |

> **NOTE**: This skill does NOT include user confirmation. Confirmation is handled at the orchestrator/dispatcher level after all features are processed. This enables continuous batch execution.

## Step 1: Read Input

### Input Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `feature_id` | Optional | Feature 唯一标识符，如 `F-CRM-01`（向后兼容：不传则使用当前逻辑） |
| `feature_name` | Optional | Feature 名称，如 `customer-list`（向后兼容：不传则使用当前逻辑） |

### Input Files

1. **Feature Spec 文档**：
   - **新格式（推荐）**：`speccrew-workspace/iterations/{number}-{type}-{name}/02.feature-design/{feature-id}-{feature-name}-feature-spec.md`
   - **旧格式（向后兼容）**：`speccrew-workspace/iterations/{number}-{type}-{name}/02.feature-design/[feature-name]-feature-spec.md`
   - 优先检查新格式，不存在则回退到旧格式

2. API Contract template: `speccrew-fd-api-contract/templates/API-CONTRACT-TEMPLATE.md`
3. System architecture (API specification part): Refer to project tech-stack-mappings.json for API naming conventions

## Step 2: Organize API List

Extract all APIs from feature spec document and organize into a list:

| API Name | Method | URL | Description | Caller |
|----------|--------|-----|-------------|--------|
| [API] | GET/POST/PUT/DELETE | `/api/v1/...` | [Description] | Frontend |

Naming conventions:
- URL uses RESTful style, plural nouns
- Follow API specifications in project tech-stack-mappings.json

## Step 3: Define Contract for Each API

Complete definition for each API:
- Request method, URL, authentication required or not
- Request parameters (including type, required or not, example values)
- Response structure (including type and description for each field)
- Success response example (JSON)
- Error code list

## Step 4: Write API Contract Document

### 4a Copy Template to Document Path

1. **Read the template file**: `templates/API-CONTRACT-TEMPLATE.md`
2. **Replace top-level placeholders** (feature name, date, feature_id if provided, etc.)
3. **Create the document** using `create_file`:
   - **新格式（当提供了 feature_id 时）**：`speccrew-workspace/iterations/{number}-{type}-{name}/03.api-contract/{feature-id}-{feature-name}-api-contract.md`
     - 示例：`F-CRM-01-customer-list-api-contract.md`
   - **旧格式（向后兼容，未提供 feature_id 时）**：`speccrew-workspace/iterations/{number}-{type}-{name}/03.api-contract/[feature-name]-api-contract.md`
   - Content: Template with top-level placeholders replaced
4. **Verify**: Document has complete section structure ready for filling

### 4b Fill Each Section Using search_replace

Fill each section with API contract details from Step 2 and Step 3.

> ⚠️ **CRITICAL CONSTRAINTS:**
> - **FORBIDDEN: `create_file` to rewrite the entire document** — it destroys template structure
> - **MUST use `search_replace` to fill each section individually**
> - **All section titles MUST be preserved**

**Section Filling Order:**

| Section | Content Source |
|---------|---------------|
| **API List Overview** | API list table from Step 2 |
| **API Contract Details** | Full contract definitions from Step 3 (per API) |
| **Error Code Summary** | Aggregated error codes across all APIs |

For each API, locate its section anchor in the template and use `search_replace` to fill request parameters, response structure, success example, and error codes.

## Step 5: Update Progress Files

> **SCRIPT ENFORCEMENT RULE**: All `.checkpoints.json` and `WORKFLOW-PROGRESS.json` updates MUST be performed via `node speccrew-workspace/scripts/update-progress.js` commands. Manually creating or editing these JSON files is FORBIDDEN. If the script fails, STOP and report the error — do NOT attempt manual JSON construction.

### 5a: Update Checkpoints File

Update the `.checkpoints.json` file to record confirmation status.

Write/Update `.checkpoints.json`：

- Path: `speccrew-workspace/iterations/{iteration-id}/02.feature-design/.checkpoints.json`

**情况 A：提供了 feature_id（Feature 粒度）**
```json
{
  "stage": "02_feature_design",
  "feature_checkpoints": {
    "{feature_id}": {
      "feature_spec_review": {
        "passed": true,
        "confirmed_at": "..."
      },
      "api_contract_joint": {
        "passed": true,
        "confirmed_at": "{current_timestamp}",
        "description": "API contract joint confirmation passed for {feature_id}"
      }
    }
  },
  "checkpoints": {
    "function_decomposition": {
      "passed": true,
      "confirmed_at": "..."
    }
  }
}
```

- 使用 `feature_checkpoints.{feature_id}` 作为 key 存储单个 Feature 的状态
- 保留原有的 `checkpoints` 用于全局检查点
- Log: "✅ Checkpoint (api_contract_joint) passed and recorded for Feature {feature_id}"

**情况 B：未提供 feature_id（向后兼容，模块级）**
```json
{
  "stage": "02_feature_design",
  "checkpoints": {
    "function_decomposition": {
      "passed": true,
      "confirmed_at": "..."
    },
    "feature_spec_review": {
      "passed": true,
      "confirmed_at": "..."
    },
    "api_contract_joint": {
      "passed": true,
      "confirmed_at": "{current_timestamp}",
      "description": "API contract joint confirmation passed"
    }
  }
}
```

- Preserve existing checkpoint statuses when updating
- Log: "✅ Checkpoint (api_contract_joint) passed and recorded"

### 5b: Update Workflow Progress

Update `WORKFLOW-PROGRESS.json` to reflect current feature/module status.

- Path: `speccrew-workspace/iterations/{iteration-id}/WORKFLOW-PROGRESS.json`

**情况 A：提供了 feature_id（Feature 粒度）**
```json
{
  "current_stage": "02_feature_design",
  "stages": {
    "02_feature_design": {
      "status": "in_progress",
      "features": {
        "{feature_id}": {
          "status": "confirmed",
          "completed_at": "{current_timestamp}",
          "confirmed_at": "{current_timestamp}",
          "outputs": [
            "02.feature-design/{feature-id}-{feature-name}-feature-spec.md",
            "03.api-contract/${feature_id}-${feature_name}-api-contract.md"
          ]
        }
      }
    }
  }
}
```

- **重要**：单个 Feature 完成时，**不修改** `02_feature_design.status`（保持 `in_progress`）
- **重要**：**不修改** `current_stage`（保持 `02_feature_design`）
- 仅在 `stages.02_feature_design.features.{feature_id}` 中记录该 Feature 的完成状态
- Log: "✅ Feature {feature_id} API Contract confirmed. Feature Designer Agent will update global stage status when all features are completed."

**情况 B：未提供 feature_id（向后兼容，模块级）**
```json
{
  "current_stage": "03_system_design",
  "stages": {
    "02_feature_design": {
      "status": "confirmed",
      "completed_at": "{current_timestamp}",
      "confirmed_at": "{current_timestamp}",
      "outputs": [
        "02.feature-design/[feature-name]-feature-spec.md",
        "03.api-contract/${feature_name}-api-contract.md"
      ]
    }
  }
}
```

- Set `02_feature_design.status` to `confirmed`
- Set `current_stage` to `03_system_design`
- Record all output file paths
- Log: "✅ Stage 02_feature_design confirmed. Ready for System Design phase."

> **Note**: On Windows PowerShell, do not use backslash (`\`) for line continuation. Write the entire command on a single line.

**关于全局状态管理的说明**：
> Feature 粒度的 API Contract 完成后，全局阶段状态（`02_feature_design.status` 和 `current_stage`）**不由本 Skill 更新**。
> 全局状态由 **Feature Designer Agent** 统一管理，当检测到所有 Feature 都完成时，统一更新为 `confirmed` 并推进到下一阶段。

### 5.3 Backward Compatibility

If `WORKFLOW-PROGRESS.json` does not exist:
- Log: "⚠️ No workflow progress file found. Skipping workflow update."
- Still update `.checkpoints.json` if the directory exists

---

# Checklist

- [ ] All APIs mentioned in feature spec have defined contracts
- [ ] Each API has complete request/response structure definition
- [ ] URL naming conforms to backend architecture specifications
- [ ] Error code list is complete
- [ ] File has been written to correct path (with proper naming convention based on feature_id)
- [ ] API Contract document has been generated at the correct path
