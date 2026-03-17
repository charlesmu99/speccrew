---
name: devcrew-knowledge-module-analyze
description: Analyze a single module from source code to extract features and generate feature details. Used by Worker Agent in parallel execution during knowledge base initialization.
tools: Read, Write, Glob, Grep, SearchCodebase
---

# Module Analysis - Single Module

Analyze one specific module from source code, extract all features, generate MODULE-OVERVIEW.md (initial version with feature list) and all FEATURE-DETAIL.md files.

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

## Output

- `{output_path}/MODULE-{NAME}-OVERVIEW.md` - Initial module overview with feature list
- `{output_path}/features/FEATURE-{NAME}-DETAIL.md` - Feature detail documents (one per feature)

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

### Step 4: Generate FEATURE-DETAIL.md Files

For each feature, use FEATURE-DETAIL-TEMPLATE.md:

**Template placeholders:**
- `{{FeatureName}}`: Feature name (e.g., "create-order")
- `{{ModuleName}}`: Parent module name
- `{{ApiMethod}}`: HTTP method (GET/POST/PUT/DELETE)
- `{{ApiPath}}`: Endpoint path
- `{{RequestDto}}`: Request DTO fields
- `{{ResponseDto}}`: Response DTO fields
- `{{ValidationRules}}`: Validation decorators
- `{{BusinessRules}}`: Extracted from code comments

**Output:** `{output_path}/features/FEATURE-{FEATURE-NAME}-DETAIL.md`

### Step 5: Generate MODULE-OVERVIEW.md (Initial)

Use MODULE-OVERVIEW-TEMPLATE.md, fill sections:

**Section 1: Module Basic Info**
- Module name from input
- Purpose from code analysis
- Belongs to domain (inferred from directory structure)

**Section 2: Feature List (Key Section)**

| Feature | API | Status | Detail Doc |
|---------|-----|--------|------------|
| create-order | POST /orders | ✅ Generated | [View](features/FEATURE-create-order-DETAIL.md) |
| list-orders | GET /orders | ✅ Generated | [View](features/FEATURE-list-orders-DETAIL.md) |

**Section 3-6**: Mark as "TBD - Will be completed in summarize stage"

### Step 6: Report Results

```
Module analysis completed:
- Module: {module_name}
- Features Found: {N}
- Generated:
  - MODULE-{NAME}-OVERVIEW.md (initial)
  - features/FEATURE-*-DETAIL.md ({N} files)
- Status: success/partial-failed
- Issues: [if any]
```

## Checklist

- [ ] Module source files located
- [ ] Controllers/Handlers identified
- [ ] Features extracted from API endpoints
- [ ] Request/Response DTOs analyzed
- [ ] Validation rules documented
- [ ] FEATURE-DETAIL.md generated for each feature
- [ ] MODULE-OVERVIEW.md (initial) generated with feature list
- [ ] Results reported
