---
name: devcrew-knowledge-module-analyze
description: Analyze a single module from source code to extract features and generate feature details. Used by Worker Agent in parallel execution during knowledge base initialization.
tools: Read, Write, Glob, Grep, SearchCodebase
---

# Module Analysis - Single Module

Analyze one specific module from source code, extract all features, generate {name}-overview.md (initial version with feature list) and all {feature-name}.md files.

## Language Adaptation

**CRITICAL**: Generate all content in the language specified by the `language` parameter.

- `language: "zh"` → Generate all content in 中文
- `language: "en"` → Generate all content in English
- Other languages → Use the specified language

**All output content (feature names, descriptions, business rules) must be in the target language only.**

## Trigger Scenarios

- "Analyze module {name} from source code"
- "Extract features from module {name}"
- "Generate module documentation for {name}"

## User

Worker Agent (devcrew-task-worker)

## Input

- `module_name`: Module name to analyze
- `source_path`: Source code root path
- `output_path`: Output directory for generated documents
- `language`: Target language for generated content (e.g., "zh", "en") - **REQUIRED**

## Output

- `{output_path}/{name}-overview.md` - Initial module overview with feature list
- `{output_path}/features/{feature-name}.md` - Feature detail documents (one per feature)

## Workflow

### Step 1: Locate Module Source

Find module source files:
- Directory: `src/modules/{module_name}/` or `modules/{module_name}/`
- Pattern: `**/{module_name}/**/*.{ts,js,java,go}`

### Step 2: Extract Module Information

From module source code, extract:

| Information | Source |
|-------------|--------|
| Module Purpose | JSDoc comments, README, or code comments |
| Controllers/Handlers | Files matching `*controller.*`, `*handler.*` |
| Services | Files matching `*service.*`, `*provider.*` |
| Entities/Models | Files matching `*entity.*`, `*model.*`, `*dto.*` |
| Public APIs | Route decorators: `@Get`, `@Post`, `@Put`, `@Delete` |

### Step 3: Identify Features

Each public API endpoint = one feature:

```typescript
// Example: From controller
@Controller('orders')
export class OrderController {
  @Post()           → Feature: create-order
  @Get()            → Feature: list-orders
  @Get(':id')       → Feature: get-order-detail
  @Patch(':id')     → Feature: update-order
  @Delete(':id')    → Feature: delete-order
}
```

For each feature, extract:
- Feature name (from endpoint path)
- API method and path
- Request/Response DTOs
- Validation rules
- Business rules from code comments

### Step 4: Generate {feature-name}.md Files

For each feature, use template `.qoder/skills/devcrew-knowledge-module-analyze/templates/feature-detail-template.md`:

**Template placeholders:**
- `{{FeatureName}}`: Feature name (e.g., "create-order")
- `{{ModuleName}}`: Parent module name
- `{{ApiMethod}}`: HTTP method (GET/POST/PUT/DELETE)
- `{{ApiPath}}`: Endpoint path
- `{{RequestDto}}`: Request DTO fields
- `{{ResponseDto}}`: Response DTO fields
- `{{ValidationRules}}`: Validation decorators
- `{{BusinessRules}}`: Extracted from code comments

**Output:** `{output_path}/features/{feature-name}.md`

### Step 5: Generate {name}-overview.md (Initial)

Use template `.qoder/skills/devcrew-knowledge-module-analyze/templates/module-overview-template.md`, fill sections:

**Mermaid Diagram Requirements**

When generating Mermaid diagrams, you **MUST** follow the compatibility guidelines defined in:
- **Reference**: `devcrew-workspace/rules/mermaid-rule.md`

Key requirements:
- Use only basic node definitions: `A[text content]`
- No HTML tags (e.g., `<br/>`)
- No nested subgraphs
- No `direction` keyword
- No `style` definitions
- Use standard `graph TB/LR` syntax only

**Section 1: Module Basic Info**
- Module name from input
- Purpose from code analysis
- Belongs to domain (inferred from directory structure)

**Section 2: Feature List (Key Section)**

| Feature | API | Status | Detail Doc |
|---------|-----|--------|------------|
| create-order | POST /orders | ✅ Generated | [View](features/create-order.md) |
| list-orders | GET /orders | ✅ Generated | [View](features/list-orders.md) |

**Section 3-6**: Mark as "TBD - Will be completed in summarize stage"

### Step 6: Report Results

```
Module analysis completed:
- Module: {module_name}
- Features Found: {N}
- Generated:
  - {name}-overview.md (initial)
  - features/{feature-name}.md ({N} files)
- Status: success/partial-failed
- Issues: [if any]
```

## Checklist

- [ ] Module source files located
- [ ] Controllers/Handlers identified
- [ ] Features extracted from API endpoints
- [ ] Request/Response DTOs analyzed
- [ ] Validation rules documented
- [ ] {feature-name}.md generated for each feature
- [ ] {name}-overview.md (initial) generated with feature list
- [ ] Results reported
