---
name: SpecCrew-knowledge-bizs-init
description: Stage 1 of knowledge base initialization - Analyze system from product manager perspective to identify business functional modules. Distinguish system types and use appropriate analysis entry points (UI for frontend systems, API for backend-only systems). Used by Worker Agent to kick off the 4-stage pipeline.
tools: Read, Write, Glob, Grep, SearchCodebase
---

# Stage 1: Generate Business Module List

Analyze system from user/product manager perspective, identify business functional modules based on system type, and generate modules.json for downstream parallel processing.

## Language Adaptation

**CRITICAL**: Generate all content in the language specified by the `language` parameter.

- `language: "zh"` → Generate all content in 中文
- `language: "en"` → Generate all content in English
- Other languages → Use the specified language

**All output content (module names, descriptions, user_value fields) must be in the target language only.**

## Core Principle

**User-centric perspective**: Identify modules from how users interact with the system, not from code structure.

- **Systems with UI** (frontend/full-stack): Analyze from frontend pages, routes, and navigation
- **Backend-only systems**: Analyze from exposed APIs and endpoints

## Trigger Scenarios

- "Scan source code for business modules"
- "Identify functional modules from product perspective"
- "Generate business module list from UI/API"
- "Analyze system modules from user viewpoint"

## User

Worker Agent (SpecCrew-task-worker)

## Input

- `source_path`: Source code directory path (default: project root)
- `output_path`: Output directory for modules.json (default: `SpecCrew-workspace/docs/crew-init/knowledge-bizs/`)
- `language`: Target language for generated content (e.g., "zh", "en") - **REQUIRED**

## Output

- `{output_path}/modules.json` - Business module list for pipeline orchestration

## Workflow

### Step 1: Determine System Type

Analyze project to determine if it has a UI layer:

**Check for UI Indicators:**

| Platform Type | Indicators | Evidence |
|---------------|------------|----------|
| **Web Frontend** | Frontend frameworks | React, Vue, Angular, Next.js, Nuxt in package.json |
| | Page directories | `pages/`, `views/`, `app/`, `routes/` |
| | Route config | `router/`, `routes.ts`, `router.config.js` |
| | UI components | `components/`, `ui/`, `antd/`, `material-ui/` |
| **Mobile (Android)** | Android projects | `build.gradle`, `AndroidManifest.xml`, `res/layout/`, `.kt`/`.java` files |
| | Jetpack Compose | `@Composable` functions, `setContent { }` blocks |
| **Mobile (iOS)** | iOS projects | `.xcodeproj`, `Info.plist`, `Storyboard`, `.swift`/`.m` files |
| | SwiftUI | `SwiftUI` imports, `struct ContentView: View` |
| **Cross-Platform Mobile** | Flutter | `pubspec.yaml`, `lib/main.dart`, `flutter/` directory |
| | React Native | `react-native` in package.json, `ios/`, `android/` directories |
| | UniApp | `manifest.json`, `pages.json`, `uni-app` in package.json |
| | Mini Programs | `app.json`, `project.config.json`, `pages/` directory |
| **Desktop Client** | WPF | `.csproj`, `.xaml` files, `App.xaml` |
| | WinForms | `.cs`/`.vb` files, `Form` classes, `Designer.cs` |
| | Electron | `electron` in package.json, `main.js`, `preload.js` |
| | Tauri | `tauri.conf.json`, `src-tauri/` directory |
| | Qt | `.pro`, `.qml`, `CMakeLists.txt` with Qt references |

**Decision:**
- If any UI platform detected → **ONLY** generate UI platform(s), skip backend API platform generation
  - Analyze each UI platform (Web, Mobile, Desktop, Mini Program) separately
  - All modules will have `system_type: "ui"`
  - Backend API analysis will be done by downstream skills when tracing feature implementations
- If only backend indicators (no UI) → Generate API platform(s)
  - Create single platform with `platform_type: "api"`
  - All modules will have `system_type: "api"`

### Step 2A: UI-Based Analysis (Systems with Frontend)

For systems with UI, analyze from user-facing perspective:

#### 2A.1 Analyze Frontend Routes

Find and parse route configurations:

**React Router Example:**
```typescript
// routes.ts or App.tsx
{ path: '/orders', component: OrderListPage },     → Order Management Module
{ path: '/orders/:id', component: OrderDetailPage },
{ path: '/payments', component: PaymentListPage }, → Payment Module
{ path: '/users', component: UserManagementPage }, → User Management Module
```

**Next.js Pages Router:**
```
pages/
├── orders/
    ├── index.tsx      → Order List Page
    └── [id].tsx       → Order Detail Page
├── payments/
    └── index.tsx      → Payment Management Page
└── users/
    └── index.tsx      → User Management Page
```

**Vue Router Example:**
```typescript
// router/index.ts
{
  path: '/inventory',
  component: InventoryLayout,
  children: [
    { path: 'products', component: ProductList },  → Inventory Module
    { path: 'stock', component: StockManagement }
  ]
}
```

#### 2A.2 Analyze Navigation/Menu Structure

Look for menu configurations that reveal business modules:

```typescript
// Typical menu config
const menuItems = [
  { key: 'dashboard', label: 'Dashboard', icon: 'Home' },
  { key: 'orders', label: 'Order Management', icon: 'ShoppingCart' },  → Order Module
  { key: 'products', label: 'Product Catalog', icon: 'Package' },       → Product Module
  { key: 'customers', label: 'Customer Center', icon: 'Users' },        → Customer Module
  { key: 'reports', label: 'Reports & Analytics', icon: 'BarChart' },   → Report Module
];
```

#### 2A.3 Map Pages to Business Modules

Group related pages into business modules:

| Module Name | User Value | Pages/Routes |
|-------------|------------|--------------|
| Order Management | Handle customer orders from creation to fulfillment | /orders, /orders/:id, /order-create |
| Product Catalog | Manage product information and categories | /products, /categories, /inventory |
| Customer Center | Manage customer profiles and relationships | /customers, /customer/:id, /crm |
| Payment & Billing | Process payments and manage invoices | /payments, /invoices, /billing |

### Step 2B: API-Based Analysis (Backend-Only Systems)

**⚠️ CONDITIONAL STEP**: Only execute this step if **NO UI platform was detected** in Step 1.

- If UI platforms were found → **SKIP this step entirely**, proceed to Step 3
- If only backend indicators exist (no UI) → Execute this step

For systems without UI, analyze from API perspective:

#### 2B.1 Identify API Controllers/Handlers

**NestJS Example:**
```typescript
// Controllers represent business modules
@Controller('orders')      → Order Management Module
@Controller('payments')    → Payment Processing Module
@Controller('users')       → User Management Module
@Controller('inventory')   → Inventory Management Module
```

**Spring Boot Example:**
```java
@RestController
@RequestMapping("/api/orders")     → Order Module
@RequestMapping("/api/inventory")  → Inventory Module
@RequestMapping("/api/customers")  → Customer Module
```

**Express.js Example:**
```javascript
// Route files represent modules
app.use('/api/orders', orderRoutes);      → Order Module
app.use('/api/products', productRoutes);  → Product Module
app.use('/api/auth', authRoutes);         → Authentication Module
```

#### 2B.2 Group APIs by Business Domain

Analyze API paths to identify business modules:

```
API Pattern Analysis:

/orders, /orders/:id, /orders/:id/cancel        → Order Management
/payments, /payments/:id/refund, /invoices      → Payment & Billing
/products, /categories, /inventory/stock        → Product & Inventory
/users, /users/:id/profile, /auth/login         → User & Authentication
/reports/sales, /reports/inventory              → Reporting & Analytics
```

#### 2B.3 Map APIs to Business Modules

| Module Name | User Value | API Endpoints |
|-------------|------------|---------------|
| Order Management | Process and track customer orders | GET/POST/PUT /orders, /orders/:id/* |
| Payment Processing | Handle payments and refunds | /payments, /invoices, /refunds |
| Product Catalog | Manage products and categories | /products, /categories |
| User Management | Handle user accounts and auth | /users, /auth/* |

### Step 3: Extract Business Module Metadata

For each identified module, extract:

| Field | Source | Example | Condition |
|-------|--------|---------|-----------|
| name | Business term from UI/API | "Order Management" | Always |
| code_name | Technical identifier | "order" | Always |
| user_value | What users accomplish | "Handle customer orders from creation to fulfillment" | Always |
| entry_points | Relative file paths to entry points | ["src/pages/orders/index.tsx", "src/pages/orders/[id].tsx"] | Always |
| system_type | UI or API-based | "ui" or "api" | Always |
| backend_apis | Associated backend API endpoints | ["GET /api/orders", "POST /api/orders", "GET /api/orders/:id"] | Only when `system_type: "ui"` |

**How to determine `backend_apis` for UI-based modules:**

1. From frontend API client calls:
   - Search in entry_point files and their imports for HTTP calls (e.g., `fetch`, `axios`, `apiClient`, `request`)
   - Extract method and URL pattern, normalize as `METHOD /path` (e.g., `GET /api/orders`)

2. From shared API client definitions (if exists):
   - Look for central API client modules (e.g., `src/api/orders.ts`, `src/services/orderService.ts`)
   - Map functions like `getOrders`, `createOrder` to endpoints (if clearly documented or named)

3. Heuristic fallback (optional, only when explicit mapping is missing):
   - Infer RESTful endpoints from module `code_name` and common patterns:
     - List: `GET /api/{code_name}s`
     - Detail: `GET /api/{code_name}s/:id`
     - Create: `POST /api/{code_name}s`
     - Update: `PUT /api/{code_name}s/:id`
     - Delete: `DELETE /api/{code_name}s/:id`
   - Mark inferred endpoints as *heuristic* in internal reasoning, but keep JSON clean

For API-based modules (`system_type: "api"`), do **NOT** populate `backend_apis`; their endpoints are already covered by `entry_points` or API grouping in Step 2B.

### Step 4: Generate modules.json

Create JSON file for pipeline orchestration using the unified format:

```json
{
  "generated_at": "2024-01-15T10:30:00Z",
  "analysis_method": "ui-based",
  "source_path": "/project",
  "language": "en",
  "platform_count": 2,
  "platforms": [
    {
      "platform_name": "Web Frontend",
      "platform_type": "web",
      "source_path": "/project/web",
      "tech_stack": ["react", "typescript"],
      "module_count": 4,
      "modules": [
        {
          "name": "Order Management",
          "code_name": "order",
          "user_value": "Handle customer orders from creation to fulfillment",
          "entry_points": [
            "src/pages/orders/index.tsx",
            "src/pages/orders/[id].tsx",
            "src/pages/orders/create.tsx"
          ],
          "system_type": "ui",
          "backend_apis": [
            "GET /api/orders",
            "POST /api/orders",
            "GET /api/orders/:id",
            "PUT /api/orders/:id",
            "DELETE /api/orders/:id"
          ]
        },
        {
          "name": "Payment & Billing",
          "code_name": "payment",
          "user_value": "Process payments and manage invoices",
          "entry_points": [
            "src/pages/payments/index.tsx",
            "src/pages/invoices/index.tsx"
          ],
          "system_type": "ui",
          "backend_apis": [
            "GET /api/payments",
            "POST /api/payments",
            "GET /api/invoices"
          ]
        }
      ]
    },
    {
      "platform_name": "Mobile App",
      "platform_type": "mobile-flutter",
      "source_path": "/project/mobile",
      "tech_stack": ["flutter", "dart"],
      "module_count": 4,
      "modules": [
        {
          "name": "Order Management",
          "code_name": "order",
          "user_value": "Handle customer orders from creation to fulfillment",
          "entry_points": [
            "lib/pages/orders/list.dart",
            "lib/pages/orders/detail.dart"
          ],
          "system_type": "ui"
        }
      ]
    }
  ]
}
```

**Field Descriptions:**

| Field | Type | Description |
|-------|------|-------------|
| `generated_at` | string | ISO 8601 timestamp |
| `analysis_method` | string | Analysis approach: `"ui-based"` if any UI platform found, `"api-based"` if only API platforms |
| `source_path` | string | Root path of analyzed source code |
| `language` | string | Language code used for generated content (e.g., "zh", "en") |
| `source_commit` | string | Git commit hash at generation time (if available) |
| `platform_count` | number | Number of platforms identified |
| `platforms` | array | List of platform objects |

**Platform Object:**

| Field | Type | Description |
|-------|------|-------------|
| `platform_name` | string | Human-readable platform name |
| `platform_type` | string | Platform identifier: `web`, `mobile-android`, `mobile-ios`, `mobile-flutter`, `mobile-react-native`, `miniprogram`, `desktop-electron`, `desktop-wpf`, `api` |
| `source_path` | string | Path to platform-specific source |
| `tech_stack` | array | Technologies used (languages, frameworks) |
| `module_count` | number | Modules in this platform |
| `modules` | array | Business module list |

**Module Object:**

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Business module name |
| `code_name` | string | Technical identifier (snake_case) |
| `user_value` | string | What users accomplish with this module |
| `entry_points` | array | Relative file paths (from `source_path`) to entry point files. For UI: page component files; For API: controller/handler files |
| `system_type` | string | `"ui"` or `"api"` |

**Output Path**: `{output_path}/modules.json`

### Step 5: Report Results

```
Stage 1 completed: Business Module List Generated
- Analysis Method: [UI-Based / API-Based]
- Platforms Found: [N]
  - Platform 1: [platform_name] ([platform_type]) - [module_count] modules
  - Platform 2: [platform_name] ([platform_type]) - [module_count] modules
- Total Business Modules: [N]
- Output: {output_path}/modules.json
- Next: Dispatch parallel tasks for Stage 2 (Module Feature Analysis)
```

## Analysis Guidelines

### For UI-Based Systems

1. **Focus on user journeys**: Group pages by user workflow
2. **Use business terminology**: "Order Management" not "OrderController"
3. **Consider navigation structure**: Menus often reveal module boundaries
4. **Look for CRUD patterns**: List → Detail → Edit → Create flows
5. **Identify platform boundaries**: Separate Web, Mobile, Desktop into different platforms

### For API-Based Systems

1. **Group by resource/domain**: APIs handling related entities
2. **Analyze URL patterns**: Common prefixes indicate modules
3. **Consider business capabilities**: What business function does this API enable?
4. **Look for controller boundaries**: One controller often equals one module
5. **Detect multi-language backends**: Identify if APIs are implemented across different languages

### For Multi-Platform Projects

1. **Create separate platform entries**: Each UI platform (Web, iOS, Android, Mini Program) gets its own platform object
2. **Use consistent module naming**: Same business concept should have same `code_name` across platforms
3. **Record platform-specific paths**: `entry_points` should reflect each platform's file structure
4. **Document tech stack**: Include languages and frameworks in `tech_stack` array

## Checklist

- [ ] Platforms identified (Web, Mobile, Desktop, or API)
- [ ] Each platform has `platform_name`, `platform_type`, `source_path`, `tech_stack`
- [ ] Modules grouped by platform
- [ ] `entry_points` are relative file paths (not URL routes)
- [ ] Business modules mapped from user/product perspective
- [ ] Module metadata extracted (name, code_name, user_value, entry_points, system_type)
- [ ] modules.json generated with unified platform-based structure
- [ ] Output path verified
- [ ] Results reported

