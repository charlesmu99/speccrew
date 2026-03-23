---
name: speccrew-knowledge-module-analyze
description: Analyze a single module from source code to extract features and generate feature details. Used by Worker Agent in parallel execution during knowledge base initialization. In incremental mode, this skill is only invoked for NEW/CHANGED modules determined by speccrew-knowledge-dispatch.
tools: Read, Write, Glob, Grep, SearchCodebase
---

# Module Analysis - Single Module

Analyze one specific module from source code, extract all features, generate {name}-overview.md (initial version with feature list) and all {feature-name}.md files.

## Language Adaptation

**CRITICAL**: Generate all content in the language specified by the `language` parameter.

- `language: "zh"` → Generate all content in 中文
- `language: "en"` → Generate all content in English
- Other languages →Use the specified language

**All output content (feature names, descriptions, business rules) must be in the target language only.**

## Trigger Scenarios

- "Analyze module {name} from source code"
- "Extract features from module {name}"
- "Generate module documentation for {name}"

## User

Worker Agent (speccrew-task-worker)

## Input

- `module_name`: Module code_name from modules.json
- `platform_name`: Platform name (e.g., "Web Frontend", "Mobile App")
- `platform_type`: Platform type (e.g., "web", "mobile-flutter", "api")
- `system_type`: Module system type - `"ui"` or `"api"` (from modules.json)
- `source_path`: Platform-specific source path (from platform.source_path)
- `tech_stack`: Platform tech stack array (e.g., ["react", "typescript"])
- `entry_points`: Module entry points (relative file paths from modules.json)
- `backend_apis`: Associated backend API endpoints for this module (only when `system_type: "ui"`)
- `output_path`: Output directory for the module (e.g., `speccrew-workspace/knowledges/bizs/{platform_type}/{module_name}/`)
- `language`: Target language for generated content (e.g., "zh", "en") - **REQUIRED**

## Output

- `{output_path}/{name}-overview.md` - Initial module overview with feature list
- `{output_path}/features/{feature-name}.md` - Feature detail documents (one per feature)

## Workflow

### Step 1: Locate Module Source

Use `entry_points` from input to locate module source files directly:

**System Type Determination:**

Use `system_type` parameter to determine analysis approach:
- `system_type: "ui"` → Follow UI-based analysis
- `system_type: "api"` → Follow API-based analysis

**For UI-based modules (system_type = "ui"):**
- Entry points are page/component files (e.g., `src/pages/orders/index.tsx`)
- Analyze page structure, components, props, state management
- Extract user interactions and navigation flows

**For API-based modules (system_type = "api"):**
- Entry points are controller/handler files (e.g., `src/controllers/order.controller.ts`)
- Parse decorators and method signatures to extract features
- Extract request/response DTOs and validation rules

**Fallback (if entry_points analysis insufficient):**
- Search: `**/{module_name}/**/*.{ts,js,java,go,py}`
- Consider `tech_stack` to determine file extensions (e.g., Flutter → `.dart`, Python → `.py`)

### Step 2: Extract Module Information

Based on `system_type`, extract different information:

**For UI-based modules (system_type = "ui"):**

| Information | Source |
|-------------|--------|
| Module Purpose | Page comments, README, or route config comments |
| Pages/Screens | Entry point files and their imports |
| Components | Imported component files |
| State Management | Store files, hooks (e.g., `useStore`, `redux`, `pinia`) |
| User Interactions | Event handlers, form submissions |
| Navigation | Router configurations, navigation links |

**For API-based modules (system_type = "api"):**

| Information | Source |
|-------------|--------|
| Module Purpose | JSDoc comments, README, or code comments |
| Controllers/Handlers | Files matching `*controller.*`, `*handler.*` |
| Services | Files matching `*service.*`, `*provider.*` |
| Entities/Models | Files matching `*entity.*`, `*model.*`, `*dto.*` |
| Public APIs | Route decorators: `@Get`, `@Post`, `@Put`, `@Delete` |

### Step 3: Identify Features

#### 3.1 Feature Granularity Rules

Determine splitting strategy based on feature complexity:

| Complexity | Criteria | Splitting Strategy | Example |
|--------|---------|---------|------|
| Simple | ≤3 API endpoints, no complex business flow | Merge into single document | Data Dictionary Management |
| Medium | 3-8 API endpoints, independent business scenarios | Split by operation type | User CRUD, User Status Management |
| Complex | >8 API endpoints, multiple business scenarios | Split by business scenario | Payment Order Management, Payment Security Mechanism |

**Feature Naming Convention:**
- Feature group document: `{module-name}-overview.md` (Module Overview)
- Feature detail document: `{feature-name}.md` (Named by core feature)
- Use target language for naming, maintain semantic clarity

#### 3.2 Feature Extraction

**For UI-based modules (system_type = "ui"):**

Each page/screen or major user interaction = one feature:

```typescript
// Example: From page component
export default function OrderListPage() {
  // Feature: list-orders
  const [orders, setOrders] = useState([]);
  
  // API call analysis
  useEffect(() => {
    fetchOrders();  // → Find and analyze: GET /api/orders
  }, []);
  
  // Feature: create-order (navigation)
  const handleCreate = () => router.push('/orders/create');
  
  // Feature: get-order-detail (navigation)
  const handleView = (id) => router.push(`/orders/${id}`);
}
```

For each feature, extract:
- **Frontend Layer:**
  - Feature name (from page name or user action)
  - Page/Component file path
  - User interactions (clicks, form submissions)
  - State management (local state, store)
  - Navigation paths
  
- **Backend API Layer:**
  - API calls made by the feature (trace `fetch`, `axios`, `apiClient` calls)
  - API endpoint (method + path)
  - Request parameters and payload structure
  - Response data structure
  - Error handling patterns
  
- **Data Storage Layer:**
  - Database entities/models referenced by the API
  - Data relationships (foreign keys, associations)
  - Key data fields and their purposes
  - Data flow: UI → API →Database → API →UI

**For API-based modules (system_type = "api"):**

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

#### 3.3 Source File Tracking

**CRITICAL**: For each extracted feature, track the source files:

| Feature | Controller File | Service File | Entity/DTO Files |
|---------|----------------|--------------|------------------|
| create-order | OrderController.java#L45-L60 | OrderService.java#L30-L50 | CreateOrderDTO.java, OrderDO.java |
| list-orders | OrderController.java#L62-L75 | OrderService.java#L52-L70 | OrderQueryVO.java, OrderDO.java |

These source file references will be used in the generated documents for traceability.

### Step 4: Generate {feature-name}.md Files

For each feature, use template `speccrew-knowledge-module-analyze/templates/feature-detail-template.md`:

**Template placeholders:**
- `{{FeatureName}}`: Feature name (e.g., "create-order")
- `{{ModuleName}}`: Parent module name
- `{{ApiMethod}}`: HTTP method (GET/POST/PUT/DELETE)
- `{{ApiPath}}`: Endpoint path
- `{{RequestDto}}`: Request DTO fields
- `{{ResponseDto}}`: Response DTO fields
- `{{ValidationRules}}`: Validation decorators
- `{{BusinessRules}}`: Extracted from code comments
- `{{SourceFiles}}`: Source file references for traceability

**Output:** `{output_path}/features/{feature-name}.md`

**Source Traceability Requirements:**

Each generated document must include source code traceability information:

1. **File Reference Block** (at document start):
```markdown
<cite>
**Referenced Files**
- [OrderController.java](file://path/to/controller)
- [OrderService.java](file://path/to/service)
</cite>
```

2. **Diagram Source** (after each Mermaid diagram):
```markdown
**Diagram Source**
- [OrderController.java](file://path/to/controller#L45-L60)
```

3. **Section Source** (at end of each major section):
```markdown
**Section Source**
- [OrderService.java](file://path/to/service#L30-L50)
```

### Step 5: Generate {name}-overview.md (Initial)

Use template `speccrew-knowledge-module-analyze/templates/module-overview-template.md`, fill sections:

**Mermaid Diagram Requirements**

When generating Mermaid diagrams, you **MUST** follow the compatibility guidelines defined in:
- **Reference**: `speccrew-workspace/docs/rules/mermaid-rule.md`

Key requirements:
- Use only basic node definitions: `A[text content]`
- No HTML tags (e.g., `<br/>`)
- No nested subgraphs
- No `direction` keyword
- No `style` definitions
- Use standard `graph TB/LR` syntax only

**Mermaid Diagram Types:**

Select appropriate diagram type based on scenario:

| Diagram Type | Use Case | Example |
|---------|---------|------|
| `graph TB/LR` | Module structure, dependencies | Project structure diagram, dependency graph |
| `sequenceDiagram` | Interaction flow, API calls | User operation flow, service call chain |
| `flowchart TD` | Business logic, conditional branches | State transition, exception handling |
| `classDiagram` | Class structure, entity relationships | Data model, service interface |
| `erDiagram` | Database table relationships | Entity relationship diagram |
| `stateDiagram-v2` | State machine | Order status, approval status |

**Section 1: Module Basic Info**
- Module name from input
- Purpose from code analysis
- Belongs to domain (inferred from directory structure)

**Section 2: Feature List (Key Section)**

| Feature | API | Status | Detail Doc |
|---------|-----|--------|------------|
| create-order | POST /orders | → Generated | [View](features/create-order.md) |
| list-orders | GET /orders | → Generated | [View](features/list-orders.md) |

**Section 3-6**: Mark as "TBD - Will be completed in summarize stage"

**Source Traceability:**

Module overview document must also include source code traceability information:

```markdown
<cite>
**Referenced Files**
- [OrderController.java](file://path/to/controller)
- [OrderService.java](file://path/to/service)
</cite>
```

### Step 6: Report Results

```
Module analysis completed:
- Platform: {platform_name} ({platform_type})
- Module: {module_name}
- Source Path: {source_path}
- Tech Stack: {tech_stack}
- Entry Points Analyzed: {entry_points.length}
- Features Found: {N}
- Generated
  - {name}-overview.md (initial)
  - features/{feature-name}.md ({N} files)
- Status: success/partial-failed
- Issues: [if any]
```

## Checklist

- [ ] Platform context received (platform_name, platform_type, tech_stack)
- [ ] Entry points resolved from source_path + entry_points
- [ ] Module source files located using entry points
- [ ] Controllers/Handlers identified (API) or Pages/Components identified (UI)
- [ ] Features extracted with complexity assessment (Simple/Medium/Complex)
- [ ] Feature granularity strategy determined (Merge/Split by operation/Split by scenario)
- [ ] Source files tracked for each feature (Controller, Service, Entity/DTO)
- [ ] Request/Response DTOs analyzed (API) or Props/State analyzed (UI)
- [ ] Validation rules documented
- [ ] {feature-name}.md generated with source traceability for each feature
- [ ] {name}-overview.md (initial) generated with feature list and source traceability
- [ ] Mermaid diagrams follow compatibility guidelines
- [ ] Results reported with platform context

