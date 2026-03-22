---
name: speccrew-knowledge-techs-generate
description: Stage 2 of technology knowledge initialization - Generate technology documentation for a specific platform. Extracts tech stack, architecture, and conventions from configuration files and source code. Creates INDEX.md, tech-stack.md, architecture.md, and conventions-*.md files. Used by Worker Agent in parallel for each detected platform.
tools: Read, Write, Glob, Grep
---

# Stage 2: Generate Platform Technology Documents

Generate comprehensive technology documentation for a specific platform by analyzing its configuration files and source code structure.

## Language Adaptation

**CRITICAL**: Generate all content in the language specified by the `language` parameter.

- `language: "zh"` â†?Generate all content in ä¸­æ–‡
- `language: "en"` â†?Generate all content in English
- Other languages â†?Use the specified language

## Trigger Scenarios

- "Generate technology documents for {platform}"
- "Create tech stack documentation"
- "Extract conventions from {platform}"
- "Generate platform tech docs"

## User

Worker Agent (speccrew-task-worker)

## Input

- `platform_id`: Platform identifier (e.g., "web-react", "backend-nestjs")
- `platform_type`: Platform type (web, mobile, backend, desktop)
- `framework`: Primary framework (react, nestjs, flutter, etc.)
- `source_path`: Platform source directory
- `config_files`: List of configuration file paths
- `convention_files`: List of convention file paths (eslint, prettier, etc.)
- `output_path`: Output directory for generated documents
- `language`: Target language (e.g., "zh", "en") - **REQUIRED**

## Output

Generate the following documents in `{output_path}/`:

```
{output_path}/
â”œâ”€â”€ INDEX.md                    # Platform technology index
â”œâ”€â”€ tech-stack.md              # Technology stack details
â”œâ”€â”€ architecture.md            # Architecture conventions
â”œâ”€â”€ conventions-design.md      # Design conventions
â”œâ”€â”€ conventions-dev.md         # Development conventions
â”œâ”€â”€ conventions-test.md        # Testing conventions
â””â”€â”€ conventions-data.md        # Data conventions (optional)
```

## Workflow

### Step 1: Read Configuration Files

Read and parse all configuration files for the platform:

**Primary Config Files:**
- package.json / pom.xml / requirements.txt / pubspec.yaml / go.mod
- tsconfig.json / jsconfig.json
- Build config: vite.config.* / webpack.config.* / next.config.* / nest-cli.json

**Convention Files:**
- ESLint: .eslintrc.* / eslint.config.*
- Prettier: .prettierrc.* / prettier.config.*
- Testing: jest.config.* / vitest.config.* / pytest.ini
- Git: .gitignore, .gitattributes

### Step 2: Extract Technology Stack

Parse configuration files to extract:

**Core Framework:**
- Name and version from dependencies
- Primary language (TypeScript, JavaScript, Dart, etc.)

**Dependencies:**
- Production dependencies (grouped by purpose)
- Development dependencies
- Key library versions

**Build Tools:**
- Bundler (Vite, Webpack, Rollup)
- Transpiler (TypeScript, Babel)
- Task runner (npm scripts, Gradle, Maven)

**Example Extraction:**
```json
{
  "framework": "React",
  "framework_version": "18.2.0",
  "language": "TypeScript",
  "language_version": "5.3.0",
  "build_tool": "Vite 5.0.0",
  "key_dependencies": [
    { "name": "react-router-dom", "version": "6.20.0", "purpose": "Routing" },
    { "name": "zustand", "version": "4.4.0", "purpose": "State Management" }
  ]
}
```

### Step 3: Analyze Conventions

Extract conventions from configuration files:

**From ESLint Config:**
- Enabled rules
- Code style preferences
- Import/export patterns

**From Prettier Config:**
- Formatting rules (semi, quotes, tabWidth)
- Print width

**From Project Structure:**
- Directory conventions (src/, components/, utils/)
- File naming patterns
- Module organization

**Mermaid Diagram Requirements**

When generating Mermaid diagrams in architecture.md, you **MUST** follow the compatibility guidelines defined in:
- **Reference**: `speccrew-workspace/docs/rules/mermaid-rule.md`

Key requirements:
- Use only basic node definitions: `A[text content]`
- No HTML tags (e.g., `<br/>`)
- No nested subgraphs
- No `direction` keyword
- No `style` definitions
- Use standard `graph TB/LR` syntax only

### Step 4: Generate Documents

Use templates to generate each document. Templates located at:
- `speccrew-knowledge-techs-generate/templates/{platform-type}-{framework}/`
- Fallback: `speccrew-knowledge-techs-generate/templates/generic/`

#### Document 1: INDEX.md

Platform overview and navigation hub.

**Content:**
- Platform summary (type, framework, language)
- Technology stack overview
- Quick links to all convention documents
- Agent usage guide

#### Document 2: tech-stack.md

Detailed technology stack information.

**Sections:**
- Overview (framework, language, build tool)
- Core Technologies (table with versions)
- Dependencies (grouped by category)
  - UI/Framework
  - State Management
  - Routing
  - HTTP/API
  - Utilities
- Development Tools
- Configuration Files (list with paths)

#### Document 3: architecture.md

Architecture patterns and conventions.

**Sections (Platform-Specific):**

**For Web (React/Vue/Angular):**
- Component Architecture (Atomic Design, Container/Presentational)
- State Management Patterns
- Routing Conventions
- API Integration Patterns
- Styling Approach

**For Backend (NestJS/Spring/Express):**
- Layered Architecture (Controller/Service/Repository)
- Dependency Injection
- Module Organization
- API Design Patterns
- Middleware/Interceptor Usage

**For Mobile (Flutter/React Native):**
- Widget/Component Structure
- State Management
- Navigation Patterns
- Platform-Specific Considerations

#### Document 4: conventions-design.md

Design principles and patterns for detailed design.

**Sections:**
- Design Principles (SOLID, DRY, etc.)
- Component/Module Design Patterns
- Data Flow Design
- Error Handling Patterns
- Security Considerations
- Performance Guidelines

#### Document 5: conventions-dev.md

Development conventions for coding.

**Sections:**
- Naming Conventions (files, variables, classes, components)
- Directory Structure
- Code Style (from ESLint/Prettier)
- Import/Export Patterns
- Git Commit Conventions
- Code Review Checklist

#### Document 6: conventions-test.md

Testing conventions and requirements.

**Sections:**
- Testing Framework
- Test File Naming and Location
- Coverage Requirements
- Unit Testing Patterns
- Integration Testing Patterns
- Mocking Strategies

#### Document 7: conventions-data.md (Optional)

Data layer conventions (if applicable).

**Sections:**
- ORM/Database Tool
- Data Modeling Conventions
- Migration Patterns
- Query Optimization
- Caching Strategies

### Step 5: Write Output Files

Create output directory if not exists, then write all generated documents.

### Step 6: Report Results

```
Platform Technology Documents Generated: {platform_id}
- INDEX.md: âœ?
- tech-stack.md: âœ?
- architecture.md: âœ?
- conventions-design.md: âœ?
- conventions-dev.md: âœ?
- conventions-test.md: âœ?
- conventions-data.md: âœ?(or skipped if not applicable)
- Output Directory: {output_path}
```

## Template Selection

1. Look for specific template: `templates/{platform_type}-{framework}/`
2. If not found, look for generic platform template: `templates/{platform_type}/`
3. If not found, use generic template: `templates/generic/`

## Document Generation Guidelines

### Be Specific

Extract actual values from config files:
- âœ?"React 18.2.0" (from package.json)
- âœ?"React (version varies)"

### Be Concise

Focus on actionable conventions:
- âœ?"Use PascalCase for component files: UserProfile.tsx"
- âœ?"There are many naming conventions to consider..."

### Include Examples

Wherever possible, include concrete examples:
```markdown
### Component Naming
- âœ?UserProfile.tsx
- âœ?OrderList.tsx
- âœ?userProfile.tsx
- âœ?order-list.tsx
```

## Checklist

- [ ] All configuration files read and parsed
- [ ] Technology stack extracted accurately
- [ ] Conventions analyzed from config files
- [ ] INDEX.md generated with navigation
- [ ] tech-stack.md generated with dependency tables
- [ ] architecture.md generated with platform-specific patterns
- [ ] conventions-design.md generated with design principles
- [ ] conventions-dev.md generated with naming and style rules
- [ ] conventions-test.md generated with testing requirements
- [ ] conventions-data.md generated (if applicable)
- [ ] All files written to output_path
- [ ] Results reported

