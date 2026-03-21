---
name: SpecCrew-knowledge-module-analyze
description: Analyze a single module from source code to extract features and generate feature details. Used by Worker Agent in parallel execution during knowledge base initialization. In incremental mode, this skill is only invoked for NEW/CHANGED modules determined by SpecCrew-knowledge-dispatch.
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

Worker Agent (SpecCrew-task-worker)

## Input

- `module_name`: Module code_name from modules.json
- `platform_name`: Platform name (e.g., "Web Frontend", "Mobile App")
- `platform_type`: Platform type (e.g., "web", "mobile-flutter", "api")
- `system_type`: Module system type - `"ui"` or `"api"` (from modules.json)
- `source_path`: Platform-specific source path (from platform.source_path)
- `tech_stack`: Platform tech stack array (e.g., ["react", "typescript"])
- `entry_points`: Module entry points (relative file paths from modules.json)
- `backend_apis`: Associated backend API endpoints for this module (only when `system_type: "ui"`)
- `output_path`: Output directory for the module (e.g., `knowledge/bizs/{platform_type}/{module_name}/`)
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

### Step 4: Generate {feature-name}.md Files

For each feature, use template `SpecCrew-knowledge-module-analyze/templates/feature-detail-template.md`:

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

Use template `SpecCrew-knowledge-module-analyze/templates/module-overview-template.md`, fill sections:

**Mermaid Diagram Requirements**

When generating Mermaid diagrams, you **MUST** follow the compatibility guidelines defined in:
- **Reference**: `SpecCrew-workspace/docs/rules/mermaid-rule.md`

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
| create-order | POST /orders | → Generated | [View](features/create-order.md) |
| list-orders | GET /orders | → Generated | [View](features/list-orders.md) |

**Section 3-6**: Mark as "TBD - Will be completed in summarize stage"

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
- [ ] Features extracted from entry point analysis
- [ ] Request/Response DTOs analyzed (API) or Props/State analyzed (UI)
- [ ] Validation rules documented
- [ ] {feature-name}.md generated for each feature
- [ ] {name}-overview.md (initial) generated with feature list
- [ ] Results reported with platform context

