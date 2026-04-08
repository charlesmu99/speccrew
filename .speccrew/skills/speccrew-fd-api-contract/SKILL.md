---
name: speccrew-fd-api-contract
description: API Contract Generation SOP. Based on feature spec document, outputs structured frontend-backend API contract document. Once confirmed, the contract cannot be modified in downstream stages.
tools: Read, Write, Glob, Grep
---

# Trigger Scenarios

- Automatically triggered by speccrew-fd-feature-design Skill after feature spec document completion
- User requests "Generate API documentation" or "Define API contract"

# Workflow

## Absolute Constraints

> **These rules apply to ALL steps. Violation = task failure.**

1. **FORBIDDEN: `create_file` for documents** — NEVER use `create_file` to write the API contract document. It MUST be created by copying the template (Step 4a) then filling sections with `search_replace` (Step 4b). `create_file` produces truncated output on large files.

2. **FORBIDDEN: Full-file rewrite** — NEVER replace the entire document content in a single operation. Always use targeted `search_replace` on specific sections.

3. **MANDATORY: Template-first workflow** — Step 4a (copy template) MUST execute before Step 4b (fill sections). Skipping Step 4a and writing content directly is FORBIDDEN.

## Step 1: Read Input

1. Feature spec document: `speccrew-workspace/iterations/{number}-{type}-{name}/02.feature-design/[feature-name]-feature-spec.md`
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
2. **Replace top-level placeholders** (feature name, date, etc.)
3. **Create the document** using `create_file`:
   - Target path: `speccrew-workspace/iterations/{number}-{type}-{name}/02.feature-design/[feature-name]-api-contract.md`
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

## Step 5: Joint Confirmation

After both documents (Feature Spec + API Contract) are ready, request confirmation from user:

```
Feature design phase deliverables are ready:
- Feature Spec: speccrew-workspace/iterations/{number}-{type}-{name}/02.feature-design/[feature-name]-feature-spec.md
- API Contract: speccrew-workspace/iterations/{number}-{type}-{name}/02.feature-design/[feature-name]-api-contract.md

Please confirm the following key points:
1. Is the overall technical solution feasible?
2. Does the API definition meet frontend requirements?
3. Is the data model reasonable?

⚠️ After confirmation, the API contract will be the sole baseline for frontend-backend collaboration.
   Read-only reference in design/development phase, no modifications allowed.
   If changes are needed, must return to this phase for re-confirmation.

After confirmation, you can start frontend and backend Designer Agents separately.
```

# Checklist

- [ ] All APIs mentioned in feature spec have defined contracts
- [ ] Each API has complete request/response structure definition
- [ ] URL naming conforms to backend architecture specifications
- [ ] Error code list is complete
- [ ] File has been written to correct path
- [ ] Summary of both documents has been shown to user and confirmation requested
