---
name: devcrew-knowledge-bizs-init
description: Stage 1 of knowledge base initialization - Scan source code to identify all modules and generate module list. Used by Worker Agent to kick off the 4-stage pipeline.
tools: Read, Write, Glob, Grep, SearchCodebase
---

# Stage 1: Generate Module List

Scan source code, detect technology stack, identify all business modules, and generate modules.json for downstream parallel processing.

## Trigger Scenarios

- "Scan source code for modules"
- "Identify business modules from codebase"
- "Generate module list for documentation"

## User

Worker Agent (devcrew-task-worker)

## Input

- `source_path`: Source code directory path (default: project root)
- `output_path`: Output directory for modules.json (default: `devcrew-workspace/.tasks/knowledge-bizs-init/`)

## Output

- `{output_path}/modules.json` - Module list for pipeline orchestration

## Workflow

### Step 1: Detect Technology Stack

Analyze project structure:

| Indicator | Technology | Detection Method |
|-----------|------------|------------------|
| `package.json` with `@nestjs` | NestJS | Check dependencies |
| `pom.xml` or `build.gradle` | Java Spring | Check build files |
| `go.mod` | Go | Module definition |
| `Gemfile` | Ruby on Rails | Dependency file |

### Step 2: Identify Modules

Scan source code for module patterns:

**NestJS Pattern:**
```
src/modules/
├── order/          → Module: order
├── payment/        → Module: payment
├── inventory/      → Module: inventory
└── user/           → Module: user
```

**Detection Rules:**
- Directory contains `@Module()` decorator
- Directory contains controller files
- Directory name follows PascalCase or kebab-case

### Step 3: Extract Module Metadata

For each identified module, extract:

| Field | Source | Example |
|-------|--------|---------|
| name | Directory name | "order" |
| path | Relative path | "src/modules/order" |
| purpose | JSDoc comment or README | "Order lifecycle management" |
| has_controller | File existence | true |
| has_service | File existence | true |
| has_entity | File existence | true |

### Step 4: Generate modules.json

Create JSON file for pipeline orchestration:

```json
{
  "generated_at": "2024-01-15T10:30:00Z",
  "tech_stack": "nestjs",
  "source_path": "/project/src",
  "module_count": 4,
  "modules": [
    {
      "name": "order",
      "path": "src/modules/order",
      "purpose": "Order lifecycle management",
      "features_detected": 8
    },
    {
      "name": "payment",
      "path": "src/modules/payment",
      "purpose": "Payment processing",
      "features_detected": 5
    }
  ]
}
```

**Output Path**: `{output_path}/modules.json`

### Step 5: Report Results

```
Stage 1 completed: Module List Generated
- Technology: [Detected Stack]
- Modules Found: [N]
- Output: {output_path}/modules.json
- Next: Dispatch parallel tasks for Stage 2 (Module Analysis)
```

## Checklist

- [ ] Technology stack detected from project files
- [ ] Module directories identified
- [ ] Module metadata extracted (name, path, purpose)
- [ ] modules.json generated with complete module list
- [ ] Output path verified
- [ ] Results reported
