---
name: speccrew-knowledge-bizs-api-analyze
description: Analyze a single API controller from source code to extract business features and generate API documentation. Used by Worker Agent in parallel execution during knowledge base initialization Stage 2. Each worker analyzes one API controller file.
tools: Read, Write, Glob, Grep, SearchCodebase, Bash
---

# API Feature Analysis - Single Controller

> **CRITICAL CONSTRAINT**: DO NOT create temporary scripts, batch files, or workaround code files (`.py`, `.bat`, `.sh`, `.ps1`, etc.) under any circumstances. If execution encounters errors, STOP and report the exact error. Fixes must be applied to the Skill definition or source scripts — not patched at runtime.

Analyze one specific API controller from source code, extract all business features (API endpoints), and generate feature documentation. This skill operates at controller granularity - one worker per controller file.

## Trigger Scenarios

- "Analyze API controller {fileName} from source code"
- "Extract API features from controller {fileName}"
- "Generate documentation for API controller {fileName}"
- "Analyze API feature from features.json"

## Input Variables

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `{{feature}}` | object | Complete feature object from features.json | - |
| `{{fileName}}` | string | Controller file name | `"UserController"`, `"OrderController"` |
| `{{sourcePath}}` | string | Relative path to source file | `"yudao-module-system/yudao-module-system-biz/src/main/java/cn/iocoder/yudao/module/system/controller/admin/user/UserController.java"` |
| `{{documentPath}}` | string | Target path for generated document | `"speccrew-workspace/knowledges/bizs/admin-api/system/user/UserController.md"` |
| `{{module}}` | string | Business module name (from feature.module) | `"system"`, `"trade"`, `"_root"` |
| `{{analyzed}}` | boolean | Analysis status flag | `true` / `false` |
| `{{platform_type}}` | string | Platform type | `"admin-api"`, `"app-api"` |
| `{{platform_subtype}}` | string | Platform subtype | `"spring-boot"`, `"java"` |
| `{{tech_stack}}` | array | Platform tech stack | `["java", "spring-boot", "mybatis-plus"]` |
| `{{completed_dir}}` | string | Directory for completion marker files (`sync_state_path/completed`) | `"speccrew-workspace/knowledges/base/sync-state/knowledge-bizs/completed"` |
| `{{sourceFile}}` | string | Source features JSON file name | `"features-admin-api.json"` |
| `{{language}}` | string | **REQUIRED** - Target language for generated content | `"zh"`, `"en"` |

## Language Adaptation

**CRITICAL**: Generate all content in the language specified by the `{{language}}` parameter.

- `{{language}} == "zh"` → Generate all content in 中文
- `{{language}} == "en"` → Generate all content in English
- Other languages → Use the specified language

**All output content (feature names, descriptions, business rules) must be in the target language only.**

## Output Variables

| Variable | Type | Description |
|----------|------|-------------|
| `{{status}}` | string | Analysis status: `"success"`, `"partial"`, or `"failed"` |
| `{{feature_name}}` | string | Name of the analyzed controller |
| `{{generated_file}}` | string | Path to the generated documentation file |
| `{{message}}` | string | Summary message for status update |

## Execution Requirements

This skill operates in **strict sequential execution mode**:
- Execute steps in exact order (Step 1 → Step 2 → ... → Step 7)
- Output step status after each step completion
- Do NOT skip any step

## Output

**Generated Files:**
1. `{{documentPath}}` - Controller documentation file
2. `{{completed_dir}}/{{fileName}}.done` - Completion status marker
3. `{{completed_dir}}/{{fileName}}.graph.json` - Graph data marker

**Return Value:**
```json
{
  "status": "success|partial|failed",
  "feature": {
    "fileName": "UserController",
    "sourcePath": "yudao-module-system/.../controller/admin/user/UserController.java"
  },
  "platformType": "admin-api",
  "module": "system",
  "featureName": "user-management-api",
  "generatedFile": "speccrew-workspace/knowledges/bizs/admin-api/system/user/UserController.md",
  "message": "Successfully analyzed UserController with 8 API endpoints"
}
```

The return value is used by dispatch to update the feature status in `features-{platform}.json`.

## Execution Checklist

Before executing the workflow, verify the following inputs:

- Controller: `{{fileName}}` (`{{sourcePath}}`)
- Target: `{{documentPath}}`
- Language: `{{language}}`
- Module: `{{module}}`
- Platform: `{{platform_type}}`/`{{platform_subtype}}`

## Workflow

```mermaid
graph TB
    Start([Start]) --> Step1[Step 1 Read Analysis Template]
    Step1 --> Step2[Step 2 Read Controller and Analyze API Structure]
    Step2 --> Step3[Step 3 Extract API Features]
    Step3 --> Step4[Step 4 Find API Consumers]
    Step4 --> Step5a[Step 5a Copy Template to Document Path]
    Step5a --> Step5b[Step 5b Fill Each Section Using search_replace]
    Step5b --> Step6[Step 6 Report Results]
    Step6 --> Step7[Step 7 Write Completion Markers]
    Step7 --> End([End])
```

---

### Step 1: Read Analysis Template

**Step 1 Status: 🔄 IN PROGRESS**

1. **Check Analysis Status:**
   - If `{{analyzed}}` is `true`, output "Step 1 Status: ⏭️ SKIPPED (already analyzed)" and skip to Step 6 with status="skipped"
   - If `{{analyzed}}` is `false`, proceed

2. **Read the appropriate template based on tech stack:**
   - Java/Spring Boot: Read `templates/FEATURE-DETAIL-TEMPLATE.md`
   - FastAPI: Read `templates/FEATURE-DETAIL-TEMPLATE-FASTAPI.md`
   - .NET: Read `templates/FEATURE-DETAIL-TEMPLATE-NET.md`
   - **Other/Unknown**: Default to `templates/FEATURE-DETAIL-TEMPLATE.md` (generic template)

3. **Understand template structure and required information dimensions:**
   - Review all sections in the template
   - Identify what information needs to be extracted from source code
   - Note the expected format for each section

**Template Analysis Scope:**

| Template Section | Information to Extract | Source |
|------------------|------------------------|--------|
| 1. Content Overview | Controller name, document path, source path, description | `{{fileName}}`, `{{documentPath}}`, `{{sourcePath}}` |
| 2. API Endpoints | All public API methods with HTTP methods and paths | Controller method annotations |
| 3. Business Flow | Request handling flow: validation → business logic → persistence | Controller → Service → Mapper/Repository |
| 4. Data Fields | Request DTOs, Response DTOs, Entity fields | DTO classes, Entity classes |
| 5. References | Services, Mappers, other controllers this controller uses | Field injections, imports |
| 6. Business Rules | Permission rules, validation rules, business logic rules | Code logic, annotations, comments |

**Handling VO/DTO Source Files:**
If the source file is a VO/DTO class (not a Controller), certain sections may be simplified, but ALL section headers and numbering must still be preserved:
- Section 2 (API Endpoint Definitions): Note "This is a VO/DTO class containing only data structure definitions, no API endpoints"
- Section 4 (References): Document fields and their types as the primary content
- Other sections: Use "N/A" or "Not applicable for VO/DTO classes"
- NEVER skip sections or reorganize the template structure

> ⚠️ CRITICAL: The template defines the EXACT output structure. You MUST:
> - Generate ALL sections listed in the template, in the SAME order
> - Fill ALL tables defined in the template (use "N/A" for unavailable data, never skip a table)
> - Follow the EXACT heading hierarchy and numbering from the template
> - Do NOT invent your own section structure or reorganize sections

**Output:** "Step 1 Status: ✅ COMPLETED - Template loaded, {{sectionCount}} sections identified for analysis"

### Step 2: Read Controller and Analyze API Structure

**Step 2 Status: 🔄 IN PROGRESS**

**Prerequisites:**
- Template has been loaded and understood from Step 1
- Controller file is a Java/Kotlin controller file (e.g., `UserController.java`)

**Actions:**
1. **Locate and Read the controller file:**
   - Use `{{sourcePath}}` as the relative file path from project root
   - Read the controller file content

2. **Analyze API handler structure based on template guidance:**
   - **Java**: Parse `@RestController`, `@RequestMapping`, `@GetMapping`, etc.
   - **FastAPI**: Parse `@router.get()`, `@router.post()`, Pydantic models
   - **.NET**: Parse `[ApiController]`, `[Route]`, `[HttpGet]`, etc.
   - **Other**: Parse based on common patterns (class/method definitions, decorators, attributes)

3. **Identify all public API endpoint methods**

4. **Extract method signatures, HTTP methods, and paths**

5. **Systematically gather information for EVERY section in the template:**
   - For each template section, identify what source code information is needed
   - If source code doesn't provide enough info for a section, note it for "N/A" filling later
   - Do NOT skip gathering info just because it seems minor

**Output:** "Step 2 Status: ✅ COMPLETED - Read {{sourcePath}} ({{lineCount}} lines), Analyzed {{endpointCount}} endpoints, {{serviceCount}} services"

### Step 3: Extract API Features

**Step 3 Status: 🔄 IN PROGRESS**

Each public API endpoint in the controller = one feature.

**CRITICAL - Analysis Scope Limitation:**

- **ONLY analyze the single controller file specified by `{{sourcePath}}`**
- **DO NOT analyze or generate documentation for other controllers in the same package**
- **DO NOT generate separate documents for internal/private methods**

**Extraction Guidelines:**

- Document ALL public API endpoints with their HTTP methods and paths
- For **internal service methods**: only record references, do not document as separate features
- Document business flows for each API endpoint: request validation → business logic → data persistence → response
- **Generate Mermaid flowcharts following `speccrew-workspace/docs/rules/mermaid-rule.md` guidelines:**
  - Use `graph TB` or `graph LR` syntax (not `flowchart`)
  - No parentheses `()` in node text (e.g., use `validate request` instead of `validate()`)
  - No HTML tags like `<br/>`
  - No `style` definitions
  - No nested `subgraph`
  - No special characters in node text
- Use `{{language}}` for all extracted content naming

**Example Code Analysis:**

```java
// From controller file (UserController.java)
@RestController
@RequestMapping("/admin-api/system/user")
public class UserController {
    
    @GetMapping("/page")           → Feature: list-users (Paged Query)
    @PostMapping("/create")        → Feature: create-user (Create User)
    @PutMapping("/update")         → Feature: update-user (Update User)
    @DeleteMapping("/delete/{id}")  → Feature: delete-user (Delete User)
    @GetMapping("/get/{id}")       → Feature: get-user-detail (Get User Detail)
}
```

**For Each API Feature, Document:**

1. **Feature Identification:**
   - Feature name (from endpoint path and HTTP method)
   - API method and path
   - Entry point file path

2. **Request/Response Analysis:**
   - Request DTO fields with validation rules
   - Response DTO fields
   - Error response codes

3. **Deep Backend Business Flow Analysis** (per API endpoint):
   
   **CRITICAL**: Trace the complete call chain based on tech stack:
   
   **Java/Spring Boot**: Controller → Service → Mapper → Database
   **FastAPI**: Router → Service → CRUD/Repository → SQLAlchemy Model → Database
   **.NET**: Controller → Service → Repository → EF Core → Database
   
   - **API Handler Layer** (Controller/Router):
     - Request receiving and parameter extraction
     - Permission/role validation
     - DTO/Schema validation
     - Service method invocation
   
   - **Service Layer** (Business Logic):
     - Business rule validation
     - Data transformation/processing
     - Cross-module service calls (if any)
     - Transaction boundaries
     - Data access layer invocation
   
   - **Data Access Layer** (Mapper/CRUD/Repository):
     - SQL operations (SELECT/INSERT/UPDATE/DELETE)
     - Database table names
     - Join conditions and filters
   
   - **Database Layer**:
     - Table structure (fields, types, constraints)
     - Index usage
     - Relationships with other tables
   
   **MANDATORY Analysis for Template Sections 6-7:**
   - Trace the complete call chain to Service → Mapper/DAO → Database tables
   - Analyze transaction boundaries (methods with @Transactional or equivalent)
   - Analyze database operation types (SELECT/INSERT/UPDATE/DELETE) for each table
   - Identify service dependencies and cross-module calls for Dependency Analysis section
   - Note potential performance considerations (N+1 queries, large batch operations, missing indexes)

4. **Business Flow Visualization**:
   - Generate Mermaid flowchart for **each API endpoint**
   - Show complete flow: Request → Controller → Service → Mapper → Database → Response
   - Include detailed business logic steps in Service layer
   - Mark each step with source file reference (Controller/Service/Mapper)

5. **Build Graph Data** (per controller):
   
   While analyzing the controller, simultaneously extract graph nodes and edges:
   
   **Nodes to Extract:**
   
   | Node Type | Source | ID Format | Context Fields |
   |-----------|--------|-----------|----------------|
   | `api` | Each public API endpoint | `api-{module}-{name}` | `method`, `path`, `params`, `tables`, `permissions` |
   | `service` | Each injected service | `service-{module}-{name}` | `methods`, `dependencies` |
   | `table` | Each database table accessed | `table-{module}-{tableName}` | `fields`, `indexes`, `engine` |
   | `dto` | Each request/response DTO | `dto-{module}-{name}` | `fields`, `validation` |
   
   **Edges to Extract:**
   
   | Edge Type | Direction | When to Create |
   |-----------|-----------|----------------|
   | `operates` | api → table | API endpoint reads/writes a database table |
   | `invokes` | api → service | Controller calls a service method |
   | `references` | api → dto | API endpoint uses a request/response DTO |
   | `depends-on` | service → service | Service depends on another service |
   | `maps-to` | dto → table | DO/Entity maps to database table |
   
   **Node ID Naming Convention:**
   ```
   {type}-{module}-{name}
   Examples:
     api-system-user-list
     api-system-user-create
     service-system-user-service
     table-system-system_user
     dto-system-user-create-req
   ```
   
   **IMPORTANT:**
   - `module` comes from `{{module}}` input variable
   - `name` should be a short, readable slug derived from the entity name
   - Each node must include `sourcePath` and `documentPath` (if applicable)
   - Edge `metadata` should include operation details (method name, SQL operation type, etc.)

**Output:** "Step 3 Status: ✅ COMPLETED - Extracted {{endpointCount}} API endpoints, {{flowCount}} business flows, {{nodeCount}} graph nodes, {{edgeCount}} graph edges"

### Step 4: Find API Consumers

**Step 4 Status: 🔄 IN PROGRESS**

Search frontend page files in the codebase to find which pages call the APIs in this controller.

**Search Methods:**
- Search for API client/service calls matching this controller's endpoints
- Search for imports of the API client class
- Search for HTTP requests to this controller's base path

**For Each Consumer Page, Record:**
| Field | Description |
|-------|-------------|
| Page Name | Name of the page that consumes this API |
| Function Description | How/why it uses this API (e.g., "Load user list on page init") |
| Source Path | Relative path to the consumer page source file |
| Document Path | Path to the consumer page's generated document |

**Output:** "Step 4 Status: ✅ COMPLETED - Found {{consumerCount}} API consumers"

---

### Step 5a: Copy Template to Document Path

**Step 5a Status: 🔄 IN PROGRESS**

Copy the appropriate template to the target document path and replace top-level placeholders.

**Template Selection:**

| Tech Stack | Template File | Description |
|------------|---------------|-------------|
| Java/Spring Boot/MyBatis | `templates/FEATURE-DETAIL-TEMPLATE.md` | Controller → Service → Mapper → Database |
| Python/FastAPI/SQLAlchemy | `templates/FEATURE-DETAIL-TEMPLATE-FASTAPI.md` | Router → Service → CRUD → SQLAlchemy Model |
| .NET/ASP.NET Core/EF Core | `templates/FEATURE-DETAIL-TEMPLATE-NET.md` | Controller → Service → Repository → EF Core |
| Other/Unknown | `templates/FEATURE-DETAIL-TEMPLATE.md` | Use as default/generic template |

**Actions:**

1. **Read the selected template file** based on `{{tech_stack}}`

2. **Replace top-level placeholders** with known variables:

| Placeholder | Replace With | Source |
|-------------|--------------|--------|
| `{Controller}` | `{{fileName}}` | Input variable |
| `{sourcePath}` | `{{sourcePath}}` | Input variable |
| `{documentPath}` | `{{documentPath}}` | Input variable |
| `{module}` | `{{module}}` | Input variable |
| `[Feature Name]` | `{{fileName}}` | Document title |

3. **Create the document file** using `create_file`:
   - Target path: `{{documentPath}}`
   - Content: Template with top-level placeholders replaced
   - Ensure parent directory exists

4. **Verify the document skeleton**:
   - Document should now have complete Section 1-10 structure
   - Each section should have placeholder content waiting to be filled

**Output:** "Step 5a Status: ✅ COMPLETED - Template copied to {{documentPath}}, ready for section filling"

---

### Step 5b: Fill Each Section Using search_replace

**Step 5b Status: 🔄 IN PROGRESS**

Fill each section of the document with actual data extracted from source code analysis.

> ⚠️ **CRITICAL CONSTRAINTS:**
> - **禁止使用 create_file 重写整个文档** - 会丢失模板结构
> - **必须使用 search_replace 逐块替换**
> - **每个 Section 的标题和编号必须保留**，不得删除或修改
> - 若某 Section 无对应源码信息，保留 Section 标题，将占位内容替换为 "N/A - No applicable data found in source code"

**Section Filling Order:**

Fill sections in order (1 → 10), using `search_replace` for each content block.

---

#### Section 1: Content Overview

**Locate anchor:** `<!-- AI-TAG: OVERVIEW -->`

**Fill Basic Information Table:**

Replace placeholder rows in the Basic Information table:

```
original: "| Controller Name | {Fill in controller name} |"
new: "| Controller Name | {{fileName}} |"

original: "| Module | {e.g., Order Management Module} |"
new: "| Module | {{module}} Module |"

original: "| Core Function | {1-3 sentences describing core API functionality} |"
new: "| Core Function | {从源码提取的实际功能描述} |"

original: "| Base Path | {e.g., /admin-api/system/user} |"
new: "| Base Path | {从 @RequestMapping 提取的实际路径} |"
```

**Fill API Scope List:**

Replace placeholder list items with actual endpoints:

```
original: "- [ ] {GET /page} - {Description}"
new: "- [x] GET /page - 分页查询用户列表"
```

Repeat for each endpoint discovered in Step 3.

---

#### Section 2: API Endpoint Definitions

**Locate anchor:** `<!-- AI-TAG: API_ENDPOINTS -->`

For each API endpoint found in Step 3, fill the corresponding subsection:

**Fill Endpoint Information Table:**

```
original: "| Method | {GET/POST/PUT/DELETE} |"
new: "| Method | GET |"

original: "| Path | {/admin-api/system/user/page} |"
new: "| Path | /admin-api/system/user/page |"

original: "| Description | {Brief description of what this endpoint does} |"
new: "| Description | 分页查询用户列表 |"

original: "| Permission | {Required permission code or role} |"
new: "| Permission | system:user:query |"
```

**Fill Request Parameters Table:**

Replace placeholder rows with actual parameters:

```
original: "| {param1} | {String/Integer/Long} | {Yes/No} | {Description} | {e.g., Length 1-50, Not blank} |"
new: "| username | String | No | 用户名 | Length 1-50 |"
```

**Fill Response Data Table:**

Replace placeholder rows with actual response fields:

```
original: "| {id} | {Long} | {Record ID} | {No} |"
new: "| id | Long | 用户ID | No |"
```

**Fill Error Codes Table:**

```
original: "| {ERR_001} | {Error description} | {When this error occurs} |"
new: "| 400 | 参数校验失败 | 请求参数不合法 |"
```

**Fill Business Flow Mermaid Diagram:**

Replace the entire example Mermaid block with actual business flow:

```
original: "```mermaid\ngraph TB\n    Start([Request Received]) --> Auth{Permission Check}\n    ... (整个示例图)\n```"
new: "```mermaid\ngraph TB\n    Start([请求到达]) --> Auth{权限检查}\n    Auth -->|无权限| Err403[返回403]\n    ...\n```"
```

**Fill Flow Step Description Table:**

```
original: "| 1 | Permission Check | Controller | {Controller} | Request + Token | Permission result | Return 403 |"
new: "| 1 | 权限检查 | Controller | UserController | Request + Token | 权限校验结果 | 返回403 |"
```

**Fill Detailed Call Chain Table:**

```
original: "| 1 | Controller | {UserController} | {createUser} | Receive request, validate params, call service | [Source](../../{controllerSourcePath}) |"
new: "| 1 | Controller | UserController | createUser | 接收请求，校验参数，调用服务 | [Source](../../yudao-module-system/.../UserController.java) |"
```

**Fill Database Operations Table:**

```
original: "| {INSERT} | {user} | {INSERT} | {Insert new user record} |"
new: "| INSERT | system_user | INSERT | 插入新用户记录 |"
```

**Fill Transaction Boundaries Table:**

```
original: "| {UserService.createUser} | {User + UserRole} | {READ_COMMITTED} | {Atomic operation} |"
new: "| UserService.createUser | system_user + system_user_role | READ_COMMITTED | 原子操作 |"
```

---

#### Section 3: Data Field Definition

**Locate anchor:** `<!-- AI-TAG: DATA_DEFINITION -->`

**Fill Database Table Structure:**

```
original: "**Table Name:** {table_name}"
new: "**Table Name:** system_user"

original: "| {id} | {Long} | {BIGINT} | {20} | {No} | {Auto increment} | {PRIMARY KEY} | {PRIMARY} | {Primary key} |"
new: "| id | Long | BIGINT | 20 | No | Auto increment | PRIMARY KEY | PRIMARY | 主键ID |"
```

**Fill Indexes Table:**

```
original: "| {idx_name} | {INDEX} | {field1} | {Query optimization} |"
new: "| idx_username | UNIQUE | username | 用户名唯一索引 |"
```

**Fill Relationships Table:**

```
original: "| {related_table} | {One-to-Many} | {this_table.related_id} | {Relationship description} |"
new: "| system_user_role | One-to-Many | system_user.id = system_user_role.user_id | 用户角色关联 |"
```

---

#### Section 4: References

**Locate anchor:** `<!-- AI-TAG: REFERENCES -->`

**Fill Internal Services Table:**

```
original: "| {ServiceName} | {e.g., User business logic} | [Source](../../{serviceSourcePath}) |"
new: "| UserService | 用户业务逻辑处理 | [Source](../../yudao-module-system/.../UserService.java) |"
```

**Fill Data Access Layer Table:**

```
original: "| {MapperName} | {EntityName} | {e.g., User CRUD operations} | [Source](../../{mapperSourcePath}) |"
new: "| UserMapper | UserDO | 用户CRUD操作 | [Source](../../yudao-module-system/.../UserMapper.java) |"
```

**Fill DTOs and Entities Table:**

```
original: "| {DTOClass} | Request DTO | {e.g., Create user request} | [Source](../../{dtoSourcePath}) |"
new: "| UserCreateReqVO | Request DTO | 创建用户请求 | [Source](../../yudao-module-system/.../UserCreateReqVO.java) |"
```

**Fill API Consumers Table:**

```
original: "| {PageName} | {e.g., User management list page} | [Source](../../{pageSourcePath}) | [Doc](../../{pageDocumentPath}) |"
new: "| 用户管理页面 | 用户列表展示与管理 | [Source](../../yudao-ui-admin/src/views/system/user/index.vue) | [Doc](../../speccrew-workspace/knowledges/bizs/web-vue3/src/views/system/user/index.md) |"
```

---

#### Section 5: Business Rule Constraints

**Locate anchor:** `<!-- AI-TAG: BUSINESS_RULES -->`

**Fill Permission Rules Table:**

```
original: "| {GET /page} | Have {permission code} permission | Return 403 Forbidden |"
new: "| GET /page | 需要 system:user:query 权限 | 返回 403 Forbidden |"
```

**Fill Business Logic Rules:**

```
original: "1. **{Rule 1}**: {e.g., User name must be unique across system}"
new: "1. **用户名唯一性**: 用户名在系统中必须唯一，不能重复"
```

**Fill Validation Rules Table:**

```
original: "| Parameter validation | {Field} cannot be empty | Return 400 Bad Request | ERR_001 |"
new: "| 参数校验 | 用户名不能为空 | 返回 400 Bad Request | 400 |"
```

---

#### Section 6: Dependency Analysis

**Locate anchor:** `<!-- AI-TAG: DEPENDENCIES -->`

**Fill Module Dependencies Table:**

```
original: "| {Module A} | Strong | {Purpose description} | {Impact when unavailable} |"
new: "| system | Strong | 用户权限校验 | 权限功能不可用 |"
```

**Fill Service Dependencies Mermaid:**

Replace example diagram with actual dependencies:

```
original: "```mermaid\ngraph LR\n    A[This Feature] --> B[Dependency Service 1]\n    ...\n```"
new: "```mermaid\ngraph LR\n    A[UserController] --> B[UserService]\n    B --> C[UserMapper]\n    ...\n```"
```

**Fill External Dependencies Table:**

```
original: "| {Payment Gateway} | REST API | {Payment processing} | {Queue and retry} |"
new: "| N/A | N/A | 无外部依赖 | N/A |"
```

---

#### Section 7: Performance Considerations

**Locate anchor:** `<!-- AI-TAG: PERFORMANCE -->`

**Fill Performance Bottlenecks Table:**

```
original: "| {List query} | {Large data volume} | {Add index, pagination} | High |"
new: "| 分页查询 | 大数据量时性能下降 | 添加索引，强制分页 | High |"
```

**Fill Index Suggestions Table:**

```
original: "| {table_name} | {field1, field2} | {COMPOSITE INDEX} | {Query optimization} |"
new: "| system_user | username, status | INDEX | 用户名和状态联合查询优化 |"
```

**Fill Caching Strategy Table:**

```
original: "| {User info} | {Redis} | {30 minutes} | {Write-through} |"
new: "| 用户信息 | Redis | 30 minutes | 写穿透 |"
```

**Fill Transaction Boundaries Table:**

```
original: "| {Create order} | {Order + Details} | {READ_COMMITTED} | {30 seconds} |"
new: "| 创建用户 | system_user + system_user_role | READ_COMMITTED | 30 seconds |"
```

---

#### Section 8: Troubleshooting Guide

**Locate anchor:** `<!-- AI-TAG: TROUBLESHOOTING -->`

**Fill Common Issues Table:**

```
original: "| {Query timeout} | {Missing index} | {Check execution plan} | {Add index} |"
new: "| 查询超时 | 缺少索引 | 检查执行计划 | 添加索引 |"
```

**Fill Error Code Reference Table:**

```
original: "| ERR_001 | {Required field empty} | {Form submission} | {Check required fields} |"
new: "| 400 | 参数校验失败 | 表单提交 | 检查必填字段 |"
```

**Fill Key Log Points Table:**

```
original: "| {Service layer} | ERROR | {Exception stack trace} | {Locate error root cause} |"
new: "| UserService | ERROR | 异常堆栈信息 | 定位错误根因 |"
```

---

#### Section 9: Notes and Additional Information

**Locate anchor:** `<!-- AI-TAG: ADDITIONAL_NOTES -->`

**Fill Pending Confirmations:**

```
original: "- [ ] **{Pending 1}**: {e.g., Whether product category dropdown needs to support fuzzy search}"
new: "- [ ] **待确认1**: 是否需要支持批量导出用户数据"
```

---

#### Section 10: Appendix

Fill Best Practices and Configuration Examples based on analysis:

```
original: "- {Best practice 1: e.g., Use batch operations for large datasets}"
new: "- 批量操作用户时使用事务确保数据一致性"
```

---

**Link Format Rules:**

❌ **NEVER use `file://` protocol in links** - This breaks Markdown preview
✅ **ALWAYS use relative paths** - Markdown links work correctly

**Source Traceability Format:**
- Format: `[Source](../../{sourcePath})`
- Example: `[Source](../../yudao-module-system/yudao-module-system-biz/src/main/java/cn/iocoder/yudao/module/system/controller/admin/user/UserController.java)`
- The `../../` goes from `speccrew-workspace/knowledges/bizs/admin-api/system/user/` to project root

**Document Link Format:**
- Format: `[Doc](../../{documentPath})`
- Example: `[Doc](../../speccrew-workspace/knowledges/bizs/web-vue3/src/views/system/user/index.md)`

**N/A Handling Rule:**
If a section has no applicable data from source code:
1. Keep the section header and structure
2. Replace placeholder content with: "N/A - No applicable data found in source code"
3. DO NOT remove the section or change its numbering

**Output:** "Step 5b Status: ✅ COMPLETED - All sections filled at {{documentPath}} ({{fileSize}} bytes)"

### Step 6: Report Results

**Step 6 Status: 🔄 IN PROGRESS**

Return analysis result summary to dispatch:

```json
{
  "status": "{{status}}",
  "feature": {
    "fileName": "{{fileName}}",
    "sourcePath": "{{sourcePath}}"
  },
  "platformType": "{{platform_type}}",
  "module": "{{module}}",
  "featureName": "{{feature_name}}",
  "generatedFile": "{{generated_file}}",
  "message": "{{message}}"
}
```

Or in case of failure:

```json
{
  "status": "{{status}}",
  "feature": {
    "fileName": "{{fileName}}",
    "sourcePath": "{{sourcePath}}"
  },
  "message": "{{message}}"
}
```

**Output:** "Step 6 Status: ✅ COMPLETED - Analysis {{status}}: {{message}}"

---

### Step 7: Write Completion Markers

**Step 7 Status: 🔄 IN PROGRESS**

**⚠️ MANDATORY - This step MUST be executed. The task is NOT complete until marker files are written.**

分析完成后，将结果写入标记文件，供 dispatch 批量处理。

**Prerequisites:**
- Step 6 completed successfully
- `{{completed_dir}}` - Marker files output directory (e.g., `speccrew-workspace/knowledges/base/sync-state/knowledge-bizs/completed`)
- `{{sourceFile}}` - Source features JSON file name

**MANDATORY - Create Directory First:**
Before writing ANY marker files, you MUST create the completed_dir if it doesn't exist:
- Use Bash: `mkdir -p "{{completed_dir}}"`
- Or use Write tool to create a test file, which will auto-create the directory

Then proceed with writing .done and .graph.json files.

### Pre-write Checklist (VERIFY before writing each file):
- [ ] Filename follows `{fileName}` pattern (Java class name only)
- [ ] File content is valid JSON (not empty)
- [ ] All required fields are present and non-empty
- [ ] File is written with UTF-8 encoding

**Pre-write Verification (MUST check before writing):**
- [ ] `.done` JSON: `fileName` does NOT contain file extension
- [ ] `.done` JSON: `sourceFile` matches `features-{platform}.json` pattern  
- [ ] `.done` JSON: `module` field is present and non-empty
- [ ] `.graph.json` JSON: root-level `module` field is present (MANDATORY)
- [ ] `.graph.json` JSON: `nodes` and `edges` are arrays (can be empty)
- [ ] Both files: valid JSON (no trailing commas, all strings quoted)

---

### **CRITICAL - Marker File Naming Convention (STRICT RULES)**

**✅ CORRECT Format - MUST USE:**
```
{completed_dir}/{fileName}.done           ← Completion status marker (JSON format)
{completed_dir}/{fileName}.graph.json     ← Graph data marker (JSON format)
```

**Examples:**
- `d:/dev/speccrew/speccrew-workspace/knowledges/base/sync-state/knowledge-bizs/completed/UserController.done`
- `d:/dev/speccrew/speccrew-workspace/knowledges/base/sync-state/knowledge-bizs/completed/UserController.graph.json`

**❌ WRONG Format - NEVER USE:**
```
{fileName}.completed.json    ← WRONG extension
{fileName}.done.json         ← WRONG extension
{fileName}_done.json         ← WRONG separator and extension
{fileName}-completed.json    ← WRONG separator and extension
```

**❌ WRONG Filename Examples - NEVER USE:**
- `UserController.completed.json` - WRONG: uses `.completed.json` instead of `.done`
- `UserController.done.json` - WRONG: uses `.done.json` instead of `.done`
- `UserController_done.json` - WRONG: uses underscore and wrong extension
- `dict-UserController.done` - WRONG: has module prefix
- `system-UserController.done` - WRONG: has module prefix

---

### **CRITICAL - Path Format Rules (STRICT RULES)**

**Path Variables:**
- `{{completed_dir}}` - Absolute path to marker files directory (passed from dispatch)
- `{{sourcePath}}` - Relative path to source file (from features JSON)
- `{{documentPath}}` - Relative path to generated document (from features JSON)

**Path Format Requirements:**

| Field | Format | Example |
|-------|--------|---------|
| `sourcePath` in `.done` | Relative path (as-is from input) | `yudao-module-system/.../UserController.java` |
| `documentPath` in `.done` | Relative path (as-is from input) | `speccrew-workspace/knowledges/bizs/admin-api/system/user/UserController.md` |
| `sourcePath` in `.graph.json` nodes | Relative path (as-is from input) | `yudao-module-system/.../UserController.java` |
| `documentPath` in `.graph.json` nodes | Relative path (as-is from input) | `speccrew-workspace/knowledges/bizs/admin-api/system/user/UserController.md` |

**⚠️ CRITICAL: NEVER convert relative paths to absolute paths in the JSON content!**

**Correct vs Wrong Example:**
```json
// ✅ CORRECT - .done file content:
{
  "fileName": "UserController",
  "sourcePath": "yudao-module-system/yudao-module-system-biz/src/main/java/cn/iocoder/yudao/module/system/controller/admin/user/UserController.java",
  "sourceFile": "features-admin-api.json",
  "module": "system",
  "status": "success",
  "analysisNotes": "Successfully analyzed UserController"
}

// ❌ WRONG - .done file content (DO NOT DO THIS):
{
  "fileName": "UserController",
  "sourcePath": "d:/dev/project/yudao-module-system/.../UserController.java",  ← WRONG: absolute path
  "sourceFile": "features-admin-api.json",
  "module": "system",
  "status": "success"
}
```

---

**1. Write .done file (MANDATORY):**

> **⚠️ CRITICAL FORMAT REQUIREMENT**: The `.done` file MUST be valid JSON. Do NOT write plain text, key=value pairs, or any other format. The file content MUST start with `{` and end with `}`. Non-JSON content will cause pipeline failure.

Use the Write tool to create file at `{{completed_dir}}/{{fileName}}.done`:

**Full path example:** `d:/dev/speccrew/speccrew-workspace/knowledges/base/sync-state/knowledge-bizs/completed/UserController.done`

```json
{
  "fileName": "{{fileName}}",
  "sourcePath": "{{sourcePath}}",
  "sourceFile": "{{sourceFile}}",
  "module": "{{module}}",
  "status": "{{status}}",
  "analysisNotes": "{{message}}"
}
```

> **⚠️ CRITICAL - fileName Field Rules:**
> - The `fileName` field MUST contain only the Java class name **WITHOUT file extension**
> - ✅ CORRECT: `"fileName": "UserController"`
> - ✅ CORRECT: `"fileName": "AiKnowledgeDocumentCreateListReqVO"`
> - ❌ WRONG: `"fileName": "UserController.java"` (includes extension)
> - ❌ WRONG: `"fileName": "UserController.class"` (includes extension)

> **⚠️ CRITICAL**: The `sourceFile` field is MANDATORY. It MUST be the features JSON filename (e.g., `features-admin-api.json`). Missing this field will cause pipeline failure.

⚠️ **CRITICAL NAMING RULE:** Filename MUST be `{fileName}.done`, where `fileName` is the Java class name (e.g., `UserController`, `AiKnowledgeDocumentCreateListReqVO`).
- ✅ CORRECT: `UserController.done` (using Java class name directly)
- ✅ CORRECT: `AiKnowledgeDocumentCreateListReqVO.done` (using Java class name directly)
- ❌ WRONG: `dict-UserController.done` (using old featureId format)
- ❌ WRONG: `system-UserController.done` (using module prefix)

⚠️ **CRITICAL:** The file MUST contain valid JSON content. Empty files or files with only whitespace will cause processing failures.

**2. Write .graph.json file (MANDATORY):**

> **⚠️ CRITICAL FORMAT REQUIREMENT**: The `.graph.json` file MUST be valid JSON and **MUST include the root-level `module` field**. Do NOT rely on scripts to infer the module from `.done` file - the `module` field MUST be explicitly present at the root level of `.graph.json`.

Use the Write tool to create file at `{{completed_dir}}/{{fileName}}.graph.json`:

**Full path example:** `d:/dev/speccrew/speccrew-workspace/knowledges/base/sync-state/knowledge-bizs/completed/UserController.graph.json`

```json
{
  "module": "{{module}}",
  "nodes": [
    {
      "id": "api-{{module}}-{{endpoint-name}}",
      "type": "api",
      "name": "<display name>",
      "module": "{{module}}",
      "sourcePath": "{{sourcePath}}",
      "documentPath": "{{documentPath}}",
      "description": "..."
    }
  ],
  "edges": [
    {
      "source": "api-...",
      "target": "service-... or table-...",
      "type": "operates|invokes|references|depends-on|maps-to",
      "metadata": { ... }
    }
  ]
}
```

> **⚠️ CRITICAL - module Field Requirement:**
> - The `.graph.json` file **MUST** have a root-level `module` field
> - Do NOT assume scripts will fall back to reading from `.done` file
> - Missing `module` field will cause the graph merge pipeline to reject this file

⚠️ **CRITICAL NAMING RULE:** Filename MUST be `{fileName}.graph.json`, where `fileName` is the Java class name (e.g., `UserController`, `AiKnowledgeDocumentCreateListReqVO`).
- ✅ CORRECT: `UserController.graph.json` (using Java class name directly)
- ✅ CORRECT: `AiKnowledgeDocumentCreateListReqVO.graph.json` (using Java class name directly)
- ❌ WRONG: `dict-UserController.graph.json` (using old featureId format)
- ❌ WRONG: `system-UserController.graph.json` (using module prefix)

⚠️ **CRITICAL:** The file MUST contain valid JSON content. Empty files or files with only whitespace will cause processing failures.

**CRITICAL - API Endpoint Coverage Check:**
Before writing the graph.json file, verify:
- [ ] ALL public API endpoint methods in the controller are represented as `api` nodes
- [ ] Status update endpoints (updateStatus, toggleEnable) are included
- [ ] Special operation endpoints (resetPassword, export, import, batch operations) are included
- [ ] Each `api` node has proper metadata with HTTP method and path
- [ ] No public endpoint method is left without a corresponding node

**节点类型说明:**
- `api`: API端点
- `service`: Service类
- `table`: 数据库表
- `dto`: 数据传输对象

**Output:** "Step 7 Status: ✅ COMPLETED - Marker files written to {{completed_dir}}"

**⚠️ IMPORTANT: If this step fails, the dispatch script will NOT be able to process your analysis results. You MUST ensure both marker files are written successfully.**

## Reference Guides

### Business Flow Diagram Guidelines

When generating business flow diagrams in feature documents, follow these principles:

**Business Flow vs Technical Call Chain:**

| Aspect | Business Flow (Target) | Technical Call Chain (Avoid) |
|--------|----------------------|---------------------------|
| Focus | What business operations happen | What technical components are involved |
| Audience | Product managers, solution architects | Developers, system architects |
| Content | Business rules, data transformations, decisions | Method names, class names, API endpoints |
| Example | "Validate inventory → Check permissions → Create order" | "OrderController.create() → OrderService.save()" |

**Key Principles:**

1. **One Diagram Per API Request**: Each API call triggered by the frontend should have its own business flow diagram
2. **Business Perspective**: Focus on business operations, not technical implementation details
3. **Source Traceability**: Add source file references for each business step

**Diagram Types by Scenario:**

| Scenario | Diagram Focus | Example Flow |
|----------|---------------|--------------|
| Page Initialization | Data loading sequence | Page Load → Parameter Fetch → Permission Check → Data Query → Render |
| User Action | Operation handling | Click Trigger → Data Validation → Business Check → Data Processing → Result Feedback |
| API Endpoint | Backend processing | Permission Check → Data Validation → Business Processing → Data Persistence |

**For detailed diagram examples and templates, refer to:**
- `templates/FEATURE-DETAIL-TEMPLATE.md` - Section 3 (Interaction Flow Description)

**Common Business Flow Patterns:**

1. **CRUD Operations:**
   - Create: Data Validation → Permission Check → Duplicate Check → Data Creation → Related Update → Log Recording
   - Read: Parameter Parsing → Permission Check → Data Query → Data Assembly → Return Result
   - Update: Data Validation → Permission Check → Existence Check → Data Update → Related Update → Log Recording
   - Delete: Permission Check → Existence Check → Dependency Check → Data Deletion → Log Recording

2. **Approval Workflows:**
   - Submit Application → Validate Data → Check Process Config → Create Approval Instance → Notify Approver → Record Log

