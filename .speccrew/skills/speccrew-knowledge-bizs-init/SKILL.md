---
name: speccrew-knowledge-bizs-init
description: Identify business functional modules by analyzing UI routes or API endpoints. Use when generating business module list for knowledge base initialization.
tools: Read, Write, Glob, Grep, SearchCodebase, Skill
---

## User

Worker Agent (speccrew-task-worker)

## Input

- `source_path`: Source code directory path (default: project root)
- `output_path`: Output directory for modules.json (default: `speccrew-workspace/knowledges/base/sync-state/knowledge-bizs/`)
- `language`: Target language for generated content (e.g., "zh", "en") - **REQUIRED**

## Output

- `{output_path}/modules.json` - Business module list for pipeline orchestration

## Workflow

### Step 1: Determine System Type

1. **Read Configuration**:
   - Read `speccrew-workspace/docs/configs/platform-mapping.json` - Map detected framework to standardized platform_id, platform_type, and platform_subtype
   - Read `speccrew-workspace/docs/configs/tech-stack-mappings.json` - Identify platform indicators by file extensions and project files

2. **Analyze project to determine if it has a UI layer**:

**Check for UI Indicators:**

| Platform Category | platform_type | platform_subtype | Indicators | Evidence |
|-------------------|---------------|------------------|------------|----------|
| **Web Frontend** | `web` | See `platform-mapping.json` | Frontend frameworks | React, Vue, Angular, Next.js, Nuxt in package.json |
| | | | Page directories | `pages/`, `views/`, `app/`, `routes/` |
| | | | Route config | `router/`, `routes.ts`, `router.config.js` |
| | | | UI components | `components/`, `ui/`, `antd/`, `material-ui/` |
| **Mobile** | `mobile` | See `platform-mapping.json` | Android projects | `build.gradle`, `AndroidManifest.xml`, `res/layout/`, `.kt`/`.java` files |
| | | | Jetpack Compose | `@Composable` functions, `setContent { }` blocks |
| | | | iOS projects | `.xcodeproj`, `Info.plist`, `Storyboard`, `.swift`/`.m` files |
| | | | SwiftUI | `SwiftUI` imports, `struct ContentView: View` |
| | | | Flutter | `pubspec.yaml`, `lib/main.dart`, `flutter/` directory |
| | | | React Native | `react-native` in package.json, `ios/`, `android/` directories |
| | | | UniApp | `manifest.json`, `pages.json`, `uni-app` in package.json |
| | | | Mini Programs | `app.json`, `project.config.json`, `pages/` directory |
| **Desktop Client** | `desktop` | See `platform-mapping.json` | WPF | `.csproj`, `.xaml` files, `App.xaml` |
| | | | WinForms | `.cs`/`.vb` files, `Form` classes, `Designer.cs` |
| | | | Electron | `electron` in package.json, `main.js`, `preload.js` |
| | | | Tauri | `tauri.conf.json`, `src-tauri/` directory |
| | | | Qt | `.pro`, `.qml`, `CMakeLists.txt` with Qt references |

> **Reference**: For complete platform type and subtype values, see `speccrew-workspace/docs/configs/platform-mapping.json`

**Decision - Branch to Appropriate Analysis Flow:**

**IF** any UI platform detected:
- → Execute **Step 2A: UI-Based Analysis** below
- → **SKIP** Step 2B entirely
- → All modules will have `system_type: "ui"`

**IF** only backend indicators (no UI):
- → **SKIP** Step 2A entirely
- → Execute **Step 2B: API-Based Analysis** below
- → All modules will have `system_type: "api"`

---

### Step 2A: UI-Based Analysis (Systems with Frontend)

**Execute this step ONLY if UI platforms were detected in Step 1.**

For systems with UI, analyze from user-facing perspective:

1. **Analyze Frontend Routes**

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

2. **Analyze Navigation/Menu Structure**

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

3. **Map Pages to Business Modules**

   Group related pages into business modules:

   | Module Name | User Value | Pages/Routes |
   |-------------|------------|--------------|
   | Order Management | Handle customer orders from creation to fulfillment | /orders, /orders/:id, /order-create |
   | Product Catalog | Manage product information and categories | /products, /categories, /inventory |
   | Customer Center | Manage customer profiles and relationships | /customers, /customer/:id, /crm |
   | Payment & Billing | Process payments and manage invoices | /payments, /invoices, /billing |

---

### Step 2B: API-Based Analysis (Backend-Only Systems)

**Execute this step ONLY if NO UI platform was detected in Step 1.**

For systems without UI, analyze from API perspective:

1. **Identify API Controllers/Handlers**

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

2. **Group APIs by Business Domain**

   Analyze API paths to identify business modules:

   ```
   API Pattern Analysis:

   /orders, /orders/:id, /orders/:id/cancel        → Order Management
   /payments, /payments/:id/refund, /invoices      → Payment & Billing
   /products, /categories, /inventory/stock        → Product & Inventory
   /users, /users/:id/profile, /auth/login         → User & Authentication
   /reports/sales, /reports/inventory              → Reporting & Analytics
   ```

3. **Map APIs to Business Modules**

   | Module Name | User Value | API Endpoints |
   |-------------|------------|---------------|
   | Order Management | Process and track customer orders | GET/POST/PUT /orders, /orders/:id/* |
   | Payment Processing | Handle payments and refunds | /payments, /invoices, /refunds |
   | Product Catalog | Manage products and categories | /products, /categories |
   | User Management | Handle user accounts and auth | /users, /auth/* |

---

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

1. **Read Configuration**:
   - Read `speccrew-workspace/docs/configs/validation-rules.json` - Validate platform_id, module names, and file naming conventions

2. **Get Timestamp**:
   - **CRITICAL**: Use the Skill tool to invoke `speccrew-get-timestamp` with parameter: `format=ISO`
   - Store the returned timestamp as `generated_at` value

3. **Create JSON file**:
   - Read `examples/modules.json` for output format reference
   - Generate file at `{output_path}/modules.json` following the exact structure

### Step 5: Report Results

```
Business Module List Generated
- Analysis Method: [UI-Based / API-Based]
- Platforms Found: [N]
  - Platform 1: [platform_name] ([platform_type]) - [module_count] modules
  - Platform 2: [platform_name] ([platform_type]) - [module_count] modules
- Total Business Modules: [N]
- Output: {output_path}/modules.json
```

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

