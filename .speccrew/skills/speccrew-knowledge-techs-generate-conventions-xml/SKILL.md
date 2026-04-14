---
name: speccrew-knowledge-techs-generate-conventions-xml
description: Generate technology convention documents (INDEX, tech-stack, architecture, conventions-*) for a specific platform using XML Block workflow. Extracts tech stack, architecture, and development conventions from configuration files and source code. Split from techs-generate for parallel execution with ui-style worker.
tools: Read, Write, Glob, Grep
---

# Stage 2: Generate Platform Convention Documents (XML Block Workflow)

Generate comprehensive convention documentation for a specific platform by analyzing its configuration files and source code structure. This skill focuses on conventions documents only; UI style analysis is handled by the separate techs-generate-ui-style worker.

## Trigger Scenarios

- "Generate convention documents for {platform}"
- "Create tech stack and architecture documentation"
- "Extract development conventions from {platform}"
- "Generate platform conventions docs"
- "Create INDEX, tech-stack, and conventions-* files"

## User

Worker Agent (speccrew-task-worker)

## Input Variables

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `${platform_id}` | string | Platform identifier | `"web-react"`, `"backend-nestjs"` |
| `${platform_type}` | string | Platform type | `web`, `mobile`, `backend`, `desktop`, `api` |
| `${framework}` | string | Primary framework | `react`, `nestjs`, `flutter`, etc. |
| `${source_path}` | string | Platform source directory | `"frontend-web"` |
| `${config_files}` | array | List of configuration file paths | `["package.json", "tsconfig.json"]` |
| `${convention_files}` | array | List of convention file paths | `[".eslintrc.js", ".prettierrc"]` |
| `${output_path}` | string | Output directory for generated documents | `speccrew-workspace/knowledges/techs/{platform_id}/` |
| `${language}` | string | Target language for generated content | `"zh"`, `"en"` |
| `${completed_dir}` | string | (Optional) Directory for analysis coverage report output | `speccrew-workspace/iterations/...` |

## Output Variables

| Variable | Type | Description |
|----------|------|-------------|
| `${status}` | string | Generation status: `"success"`, `"partial"`, or `"failed"` |
| `${documents_generated}` | array | List of generated document filenames |
| `${analysis_file}` | string | Path to the analysis coverage report |
| `${message}` | string | Summary message for status update |

## Output

Generate the following documents in `${output_path}/`:

```
${output_path}/
├── INDEX.md                    # Platform technology index (Required)
├── tech-stack.md              # Technology stack details (Required)
├── architecture.md            # Architecture conventions (Required)
├── conventions-design.md      # Design conventions (Required)
├── conventions-dev.md         # Development conventions (Required)
├── conventions-unit-test.md   # Unit testing conventions (Required)
├── conventions-system-test.md # System testing conventions (Required)
├── conventions-build.md       # Build & Deployment conventions (Required)
└── conventions-data.md        # Data conventions (Optional)
```

### Platform Type to Document Mapping

| Platform Type | Required Documents | Optional Documents | Generate conventions-data.md? |
|---------------|-------------------|-------------------|------------------------------|
| `backend` | All 8 docs | - | **Must Generate** - Contains ORM, data modeling, caching strategy |
| `web` | All 8 docs | conventions-data.md | **Conditional** - Only when using ORM/data layer (Prisma, TypeORM, Sequelize, etc.) |
| `mobile` | All 8 docs | conventions-data.md | **Default No** - Based on actual tech stack |
| `desktop` | All 8 docs | conventions-data.md | **Default No** - Based on actual tech stack |
| `api` | All 8 docs | conventions-data.md | **Conditional** - Based on whether data layer exists |

## Workflow

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `docs/rules/xml-workflow-spec.md`

<workflow id="platform-conventions-generation" status="pending" version="1.0" desc="Platform conventions generation workflow">

  <!-- ==================== INPUT PARAMETERS ==================== -->
  <block type="input" id="I1" desc="Platform conventions generation input parameters">
    <field name="platform_id" required="true" type="string" desc="Platform identifier (e.g., web-react, backend-nestjs)"/>
    <field name="platform_type" required="true" type="string" desc="Platform type: web, mobile, backend, desktop, api"/>
    <field name="framework" required="true" type="string" desc="Primary framework (react, nestjs, flutter, etc.)"/>
    <field name="source_path" required="true" type="string" desc="Platform source directory"/>
    <field name="config_files" required="true" type="array" desc="List of configuration file paths"/>
    <field name="convention_files" required="true" type="array" desc="List of convention file paths (eslint, prettier, etc.)"/>
    <field name="output_path" required="true" type="string" desc="Output directory for generated documents"/>
    <field name="language" required="true" type="string" desc="Target language (e.g., zh, en)"/>
    <field name="completed_dir" required="false" type="string" desc="Directory for analysis coverage report output"/>
  </block>

  <!-- ==================== GLOBAL CONSTRAINT RULES ==================== -->
  <block type="rule" id="GLOBAL-R1" level="mandatory" desc="Continuous execution rules">
    <field name="text">This skill MUST execute continuously without user interruption</field>
    <field name="text">All steps must complete in a single session</field>
    <field name="text">If context window is running low, save checkpoint and inform user - DO NOT create false done marker</field>
  </block>

  <block type="rule" id="GLOBAL-R-TECHSTACK" level="mandatory" desc="Technology stack constraints">
    <field name="text">Extract actual values from config files: "React 18.2.0" (from package.json) - NOT "React (version varies)"</field>
    <field name="text">Focus on actionable conventions: "Use PascalCase for component files: UserProfile.tsx" - NOT vague statements</field>
    <field name="text">Include concrete examples wherever possible</field>
  </block>

  <block type="rule" id="GLOBAL-R-DONE-MARKER" level="forbidden" desc="Done marker integrity rules">
    <field name="text">DO NOT create done marker file until ALL required documents have been verified to exist on disk</field>
    <field name="text">Required documents: INDEX.md, tech-stack.md, architecture.md, conventions-design.md, conventions-dev.md, conventions-unit-test.md, conventions-system-test.md, conventions-build.md</field>
    <field name="text">If context window is running low, save checkpoint and inform user - DO NOT create false done marker</field>
  </block>

  <block type="rule" id="GLOBAL-R-CONTEXT" level="mandatory" desc="Context management rules">
    <field name="text">Write each document to file immediately after generation - DO NOT accumulate all documents in memory</field>
    <field name="text">Use search_replace to fill template sections - NEVER use create_file to rewrite entire document</field>
    <field name="text">Preserve all template section headers and structure</field>
  </block>

  <block type="rule" id="GLOBAL-R-SOURCE" level="mandatory" desc="Source traceability rules">
    <field name="text">All source file links MUST use RELATIVE PATHS - Absolute paths and file:// protocol are STRICTLY FORBIDDEN</field>
    <field name="text">Use ../../../../ as prefix to reference source files from document location</field>
    <field name="text">Add File Reference Block at beginning of each document</field>
    <field name="text">Add Diagram Source annotations after each Mermaid diagram</field>
    <field name="text">Add Section Source annotations at end of major sections</field>
  </block>

  <block type="rule" id="GLOBAL-R-MERMAID" level="mandatory" desc="Mermaid diagram compatibility rules">
    <field name="text">Use only basic node definitions: A[text content]</field>
    <field name="text">No HTML tags (e.g., &lt;br/&gt;)</field>
    <field name="text">No nested subgraphs</field>
    <field name="text">No direction keyword</field>
    <field name="text">No style definitions</field>
    <field name="text">Use standard graph TB/LR syntax only</field>
  </block>

  <!-- ==================== STEP 0: READ DOCUMENT TEMPLATES ==================== -->
  <!-- Read INDEX Template -->
  <block type="task" id="B0-1" action="read-file" desc="Read INDEX template">
    <field name="target" value="../speccrew-knowledge-techs-generate/templates/INDEX-TEMPLATE.md"/>
    <field name="output" var="template_index" from="file.content"/>
  </block>

  <!-- Read TECH-STACK Template -->
  <block type="task" id="B0-2" action="read-file" desc="Read tech-stack template">
    <field name="target" value="../speccrew-knowledge-techs-generate/templates/TECH-STACK-TEMPLATE.md"/>
    <field name="output" var="template_tech_stack" from="file.content"/>
  </block>

  <!-- Read ARCHITECTURE Template -->
  <block type="task" id="B0-3" action="read-file" desc="Read architecture template">
    <field name="target" value="../speccrew-knowledge-techs-generate/templates/ARCHITECTURE-TEMPLATE.md"/>
    <field name="output" var="template_architecture" from="file.content"/>
  </block>

  <!-- Read CONVENTIONS-DESIGN Template -->
  <block type="task" id="B0-4" action="read-file" desc="Read conventions-design template">
    <field name="target" value="../speccrew-knowledge-techs-generate/templates/CONVENTIONS-DESIGN-TEMPLATE.md"/>
    <field name="output" var="template_conventions_design" from="file.content"/>
  </block>

  <!-- Read CONVENTIONS-DEV Template -->
  <block type="task" id="B0-5" action="read-file" desc="Read conventions-dev template">
    <field name="target" value="../speccrew-knowledge-techs-generate/templates/CONVENTIONS-DEV-TEMPLATE.md"/>
    <field name="output" var="template_conventions_dev" from="file.content"/>
  </block>

  <!-- Read CONVENTIONS-UNIT-TEST Template -->
  <block type="task" id="B0-6" action="read-file" desc="Read conventions-unit-test template">
    <field name="target" value="../speccrew-knowledge-techs-generate/templates/CONVENTIONS-UNIT-TEST-TEMPLATE.md"/>
    <field name="output" var="template_conventions_unit_test" from="file.content"/>
  </block>

  <!-- Read CONVENTIONS-SYSTEM-TEST Template -->
  <block type="task" id="B0-7" action="read-file" desc="Read conventions-system-test template">
    <field name="target" value="../speccrew-knowledge-techs-generate/templates/CONVENTIONS-SYSTEM-TEST-TEMPLATE.md"/>
    <field name="output" var="template_conventions_system_test" from="file.content"/>
  </block>

  <!-- Read CONVENTIONS-BUILD Template -->
  <block type="task" id="B0-8" action="read-file" desc="Read conventions-build template">
    <field name="target" value="../speccrew-knowledge-techs-generate/templates/CONVENTIONS-BUILD-TEMPLATE.md"/>
    <field name="output" var="template_conventions_build" from="file.content"/>
  </block>

  <!-- Read CONVENTIONS-DATA Template (Optional) -->
  <block type="task" id="B0-9" action="read-file" desc="Read conventions-data template">
    <field name="target" value="../speccrew-knowledge-techs-generate/templates/CONVENTIONS-DATA-TEMPLATE.md"/>
    <field name="output" var="template_conventions_data" from="file.content"/>
  </block>

  <!-- Read Mermaid Rules -->
  <block type="task" id="B0-10" action="read-file" desc="Read Mermaid rules">
    <field name="target" value="speccrew-workspace/docs/rules/mermaid-rule.md"/>
    <field name="output" var="mermaid_rules" from="file.content"/>
  </block>

  <block type="checkpoint" id="CP0" name="templates-loaded" desc="Templates loaded">
    <field name="verify" value="${template_index} != null AND ${template_tech_stack} != null"/>
  </block>
  <block type="event" id="E0" action="log" level="info" desc="Log templates loaded">
    <field name="message" value="Step 0 Status: COMPLETED - All templates loaded"/>
  </block>

  <!-- ==================== STEP 1: ANALYZE PROJECT SOURCE CODE STRUCTURE ==================== -->
  <!-- Read Primary Config Files -->
  <block type="loop" id="L1" over="${config_files}" as="config_file" desc="Read config files">
    <block type="task" id="B1-1" action="read-file" desc="Read config file">
      <field name="target" value="${source_path}/${config_file}"/>
      <field name="output" var="config_${config_file}" from="file.content"/>
    </block>
  </block>

  <!-- Read Convention Files -->
  <block type="loop" id="L2" over="${convention_files}" as="convention_file" desc="Read convention files">
    <block type="task" id="B1-2" action="read-file" desc="Read convention file">
      <field name="target" value="${source_path}/${convention_file}"/>
      <field name="output" var="convention_${convention_file}" from="file.content"/>
    </block>
  </block>

  <!-- Extract Technology Stack -->
  <block type="task" id="B1-3" action="extract-tech-stack" desc="Extract tech stack">
    <field name="config_files" value="${config_files}"/>
    <field name="config_content" value="${config_content}"/>
    <field name="output" var="framework" from="extraction.framework"/>
    <field name="output" var="framework_version" from="extraction.framework_version"/>
    <field name="output" var="language" from="extraction.language"/>
    <field name="output" var="language_version" from="extraction.language_version"/>
    <field name="output" var="build_tool" from="extraction.build_tool"/>
    <field name="output" var="dependencies" from="extraction.dependencies"/>
    <field name="output" var="dev_dependencies" from="extraction.dev_dependencies"/>
  </block>

  <!-- Extract Conventions from Config Files -->
  <block type="task" id="B1-4" action="extract-conventions" desc="Extract conventions">
    <field name="convention_files" value="${convention_files}"/>
    <field name="convention_content" value="${convention_content}"/>
    <field name="output" var="eslint_rules" from="extraction.eslint"/>
    <field name="output" var="prettier_config" from="extraction.prettier"/>
    <field name="output" var="testing_config" from="extraction.testing"/>
    <field name="output" var="naming_conventions" from="extraction.naming"/>
  </block>

  <!-- Analyze Directory Structure -->
  <block type="task" id="B1-5" action="analyze-structure" desc="Analyze directory structure">
    <field name="target" value="${source_path}"/>
    <field name="output" var="directory_structure" from="analysis.directories"/>
    <field name="output" var="file_patterns" from="analysis.patterns"/>
  </block>

  <!-- Detect Data Layer for conventions-data.md decision -->
  <block type="task" id="B1-6" action="detect-data-layer" desc="Detect data layer">
    <field name="dependencies" value="${dependencies}"/>
    <field name="platform_type" value="${platform_type}"/>
    <field name="output" var="data_layer_detected" from="detection.found"/>
    <field name="output" var="data_technology" from="detection.technology"/>
    <field name="output" var="generate_data_doc" from="detection.should_generate"/>
  </block>

  <block type="event" id="E1-1" action="log" level="info" desc="Log platform info">
    <field name="message" value="Platform: ${platform_id}, Type: ${platform_type}, Framework: ${framework}"/>
  </block>
  <block type="event" id="E1-2" action="log" level="info" desc="Log data layer info">
    <field name="message" value="Data Layer Detected: ${data_layer_detected}, Technology: ${data_technology}"/>
  </block>
  <block type="event" id="E1-3" action="log" level="info" desc="Log data doc decision">
    <field name="message" value="Generate conventions-data.md: ${generate_data_doc}"/>
  </block>

  <block type="checkpoint" id="CP1" name="structure-analyzed" desc="Structure analyzed">
    <field name="verify" value="${framework} != null"/>
  </block>
  <block type="event" id="E1-4" action="log" level="info" desc="Log step 1 status">
    <field name="message" value="Step 1 Status: COMPLETED - Project structure analyzed"/>
  </block>

  <!-- ==================== STEP 2: DOMAIN-SPECIFIC CONVENTION EXTRACTION ==================== -->
  <!-- Frontend Topics Extraction -->
  <block type="gateway" id="G2-1" mode="guard" desc="Frontend topics gate">
    <branch test="${platform_type} == 'web' OR ${platform_type} == 'mobile' OR ${platform_type} == 'desktop'" name="Frontend platform">
      <block type="task" id="B2-1" action="search-topic" desc="Search i18n topic">
        <field name="topic" value="i18n"/>
        <field name="paths" value="[&quot;locales/&quot;, &quot;i18n/&quot;, &quot;lang/&quot;]"/>
        <field name="output" var="topic_i18n_status" from="search.status"/>
        <field name="output" var="topic_i18n_files" from="search.files"/>
      </block>
      <block type="task" id="B2-2" action="search-topic" desc="Search authorization topic">
        <field name="topic" value="authorization"/>
        <field name="paths" value="[&quot;permission/&quot;, &quot;router/&quot;, &quot;store/&quot;, &quot;utils/auth&quot;]"/>
        <field name="output" var="topic_auth_status" from="search.status"/>
        <field name="output" var="topic_auth_files" from="search.files"/>
      </block>
      <block type="task" id="B2-3" action="search-topic" desc="Search menu registration topic">
        <field name="topic" value="menu_registration"/>
        <field name="paths" value="[&quot;router/&quot;, &quot;store/&quot;, &quot;layout/&quot;]"/>
        <field name="output" var="topic_menu_status" from="search.status"/>
        <field name="output" var="topic_menu_files" from="search.files"/>
      </block>
      <block type="task" id="B2-4" action="search-topic" desc="Search data dictionary topic">
        <field name="topic" value="data_dictionary"/>
        <field name="paths" value="[&quot;components/Dict&quot;, &quot;utils/dict&quot;, &quot;store/&quot;]"/>
        <field name="output" var="topic_dict_status" from="search.status"/>
        <field name="output" var="topic_dict_files" from="search.files"/>
      </block>
      <block type="task" id="B2-5" action="search-topic" desc="Search logging topic">
        <field name="topic" value="logging"/>
        <field name="paths" value="[&quot;utils/log&quot;, &quot;plugins/sentry&quot;]"/>
        <field name="output" var="topic_logging_status" from="search.status"/>
        <field name="output" var="topic_logging_files" from="search.files"/>
      </block>
      <block type="task" id="B2-6" action="search-topic" desc="Search API request layer topic">
        <field name="topic" value="api_request_layer"/>
        <field name="paths" value="[&quot;utils/request&quot;, &quot;api/&quot;, &quot;config/&quot;, &quot;interceptors/&quot;]"/>
        <field name="output" var="topic_api_status" from="search.status"/>
        <field name="output" var="topic_api_files" from="search.files"/>
      </block>
      <block type="task" id="B2-7" action="search-topic" desc="Search data validation topic">
        <field name="topic" value="data_validation"/>
        <field name="paths" value="[&quot;utils/validate&quot;]"/>
        <field name="output" var="topic_validation_status" from="search.status"/>
        <field name="output" var="topic_validation_files" from="search.files"/>
      </block>
      <block type="task" id="B2-8" action="search-topic" desc="Search file upload topic">
        <field name="topic" value="file_upload"/>
        <field name="paths" value="[&quot;components/Upload&quot;, &quot;api/file&quot;, &quot;utils/upload&quot;]"/>
        <field name="output" var="topic_upload_status" from="search.status"/>
        <field name="output" var="topic_upload_files" from="search.files"/>
      </block>
    </branch>
  </block>

  <!-- Backend Topics Extraction -->
  <block type="gateway" id="G2-2" mode="guard" desc="Backend topics gate">
    <branch test="${platform_type} == 'backend'" name="Backend platform">
      <block type="task" id="B2-9" action="search-topic" desc="Search backend i18n topic">
        <field name="topic" value="backend_i18n"/>
        <field name="paths" value="[&quot;resources/i18n/&quot;, &quot;messages*.properties&quot;]"/>
        <field name="output" var="topic_backend_i18n_status" from="search.status"/>
        <field name="output" var="topic_backend_i18n_files" from="search.files"/>
      </block>
      <block type="task" id="B2-10" action="search-topic" desc="Search authorization permissions topic">
        <field name="topic" value="authorization_permissions"/>
        <field name="paths" value="[&quot;security/&quot;, &quot;controller/&quot;, &quot;framework/&quot;]"/>
        <field name="output" var="topic_backend_auth_status" from="search.status"/>
        <field name="output" var="topic_backend_auth_files" from="search.files"/>
      </block>
      <block type="task" id="B2-11" action="search-topic" desc="Search backend data dictionary topic">
        <field name="topic" value="data_dictionary"/>
        <field name="paths" value="[&quot;dict/&quot;, &quot;system/&quot;]"/>
        <field name="output" var="topic_backend_dict_status" from="search.status"/>
        <field name="output" var="topic_backend_dict_files" from="search.files"/>
      </block>
      <block type="task" id="B2-12" action="search-topic" desc="Search multi-tenancy topic">
        <field name="topic" value="multi_tenancy"/>
        <field name="paths" value="[&quot;framework/tenant/&quot;, &quot;base/entity/&quot;]"/>
        <field name="output" var="topic_tenant_status" from="search.status"/>
        <field name="output" var="topic_tenant_files" from="search.files"/>
      </block>
      <block type="task" id="B2-13" action="search-topic" desc="Search logging audit topic">
        <field name="topic" value="logging_audit"/>
        <field name="paths" value="[&quot;logback*.xml&quot;, &quot;log4j2*.xml&quot;, &quot;operatelog/&quot;]"/>
        <field name="output" var="topic_backend_logging_status" from="search.status"/>
        <field name="output" var="topic_backend_logging_files" from="search.files"/>
      </block>
      <block type="task" id="B2-14" action="search-topic" desc="Search exception handling topic">
        <field name="topic" value="exception_handling"/>
        <field name="paths" value="[&quot;handler/&quot;, &quot;exception/&quot;, &quot;enums/ErrorCode&quot;]"/>
        <field name="output" var="topic_exception_status" from="search.status"/>
        <field name="output" var="topic_exception_files" from="search.files"/>
      </block>
      <block type="task" id="B2-15" action="search-topic" desc="Search caching topic">
        <field name="topic" value="caching"/>
        <field name="paths" value="[&quot;cache/&quot;, &quot;redis/&quot;, &quot;CacheConfig&quot;]"/>
        <field name="output" var="topic_cache_status" from="search.status"/>
        <field name="output" var="topic_cache_files" from="search.files"/>
      </block>
      <block type="task" id="B2-16" action="search-topic" desc="Search scheduled jobs topic">
        <field name="topic" value="scheduled_jobs"/>
        <field name="paths" value="[&quot;job/&quot;, &quot;task/&quot;, &quot;schedule/&quot;]"/>
        <field name="output" var="topic_jobs_status" from="search.status"/>
        <field name="output" var="topic_jobs_files" from="search.files"/>
      </block>
      <block type="task" id="B2-17" action="search-topic" desc="Search file storage topic">
        <field name="topic" value="file_storage"/>
        <field name="paths" value="[&quot;file/&quot;, &quot;infra/file/&quot;, &quot;FileClient&quot;]"/>
        <field name="output" var="topic_storage_status" from="search.status"/>
        <field name="output" var="topic_storage_files" from="search.files"/>
      </block>
    </branch>
  </block>

  <block type="checkpoint" id="CP2" name="domain-conventions-extracted" desc="Domain conventions extracted">
    <field name="verify" value="true"/>
  </block>
  <block type="event" id="E2" action="log" level="info" desc="Log step 2 status">
    <field name="message" value="Step 2 Status: COMPLETED - Domain-specific conventions extracted"/>
  </block>

  <!-- ==================== STEP 2.1: GENERATE INDEX.MD ==================== -->
  <block type="task" id="B3-1" action="copy-template" desc="Copy INDEX template">
    <field name="source" value="${template_index}"/>
    <field name="target" value="${output_path}/INDEX.md"/>
    <field name="platform_id" value="${platform_id}"/>
    <field name="platform_type" value="${platform_type}"/>
    <field name="framework" value="${framework}"/>
  </block>
  <block type="task" id="B3-2" action="search_replace" desc="Replace platform name in INDEX">
    <field name="target" value="${output_path}/INDEX.md"/>
    <field name="search" value="{Platform Name}"/>
    <field name="replace" value="${platform_id}"/>
  </block>
  <block type="task" id="B3-3" action="search_replace" desc="Replace platform type in INDEX">
    <field name="target" value="${output_path}/INDEX.md"/>
    <field name="search" value="{Platform Type}"/>
    <field name="replace" value="${platform_type}"/>
  </block>
  <block type="checkpoint" id="CP3" name="index-generated" desc="INDEX.md generated">
    <field name="verify" value="file.exists(${output_path}/INDEX.md)"/>
  </block>
  <block type="event" id="E3" action="log" level="info" desc="Log step 2.1 status">
    <field name="message" value="Step 2.1 Status: COMPLETED - INDEX.md generated"/>
  </block>

  <!-- ==================== STEP 2.2: GENERATE TECH-STACK.MD ==================== -->
  <block type="task" id="B4-1" action="copy-template" desc="Copy tech-stack template">
    <field name="source" value="${template_tech_stack}"/>
    <field name="target" value="${output_path}/tech-stack.md"/>
    <field name="framework" value="${framework}"/>
    <field name="framework_version" value="${framework_version}"/>
    <field name="dependencies" value="${dependencies}"/>
  </block>
  <block type="task" id="B4-2" action="fill-tech-stack-sections" desc="Fill tech-stack sections">
    <field name="target" value="${output_path}/tech-stack.md"/>
    <field name="framework" value="${framework}"/>
    <field name="framework_version" value="${framework_version}"/>
    <field name="language" value="${language}"/>
    <field name="build_tool" value="${build_tool}"/>
    <field name="dependencies" value="${dependencies}"/>
    <field name="dev_dependencies" value="${dev_dependencies}"/>
  </block>
  <block type="checkpoint" id="CP4" name="tech-stack-generated" desc="tech-stack.md generated">
    <field name="verify" value="file.exists(${output_path}/tech-stack.md)"/>
  </block>
  <block type="event" id="E4" action="log" level="info" desc="Log step 2.2 status">
    <field name="message" value="Step 2.2 Status: COMPLETED - tech-stack.md generated"/>
  </block>

  <!-- ==================== STEP 2.3: GENERATE ARCHITECTURE.MD ==================== -->
  <block type="task" id="B5-1" action="copy-template" desc="Copy architecture template">
    <field name="source" value="${template_architecture}"/>
    <field name="target" value="${output_path}/architecture.md"/>
    <field name="platform_type" value="${platform_type}"/>
    <field name="directory_structure" value="${directory_structure}"/>
  </block>
  <block type="task" id="B5-2" action="fill-architecture-sections" desc="Fill architecture sections">
    <field name="target" value="${output_path}/architecture.md"/>
    <field name="platform_type" value="${platform_type}"/>
    <field name="framework" value="${framework}"/>
    <field name="directory_structure" value="${directory_structure}"/>
    <field name="file_patterns" value="${file_patterns}"/>
  </block>
  <block type="checkpoint" id="CP5" name="architecture-generated" desc="architecture.md generated">
    <field name="verify" value="file.exists(${output_path}/architecture.md)"/>
  </block>
  <block type="event" id="E5" action="log" level="info" desc="Log step 2.3 status">
    <field name="message" value="Step 2.3 Status: COMPLETED - architecture.md generated"/>
  </block>

  <!-- ==================== STEP 2.4: GENERATE CONVENTIONS-DESIGN.MD ==================== -->
  <block type="task" id="B6-1" action="copy-template" desc="Copy conventions-design template">
    <field name="source" value="${template_conventions_design}"/>
    <field name="target" value="${output_path}/conventions-design.md"/>
    <field name="platform_type" value="${platform_type}"/>
  </block>
  <block type="task" id="B6-2" action="fill-design-sections" desc="Fill design sections">
    <field name="target" value="${output_path}/conventions-design.md"/>
    <field name="platform_type" value="${platform_type}"/>
    <field name="framework" value="${framework}"/>
    <field name="naming_conventions" value="${naming_conventions}"/>
  </block>
  <block type="checkpoint" id="CP6" name="conventions-design-generated" desc="conventions-design.md generated">
    <field name="verify" value="file.exists(${output_path}/conventions-design.md)"/>
  </block>
  <block type="event" id="E6" action="log" level="info" desc="Log step 2.4 status">
    <field name="message" value="Step 2.4 Status: COMPLETED - conventions-design.md generated"/>
  </block>

  <!-- ==================== STEP 2.5: GENERATE CONVENTIONS-DEV.MD ==================== -->
  <block type="task" id="B7-1" action="copy-template" desc="Copy conventions-dev template">
    <field name="source" value="${template_conventions_dev}"/>
    <field name="target" value="${output_path}/conventions-dev.md"/>
    <field name="eslint_rules" value="${eslint_rules}"/>
    <field name="prettier_config" value="${prettier_config}"/>
  </block>
  <block type="task" id="B7-2" action="fill-dev-sections" desc="Fill dev sections">
    <field name="target" value="${output_path}/conventions-dev.md"/>
    <field name="eslint_rules" value="${eslint_rules}"/>
    <field name="prettier_config" value="${prettier_config}"/>
    <field name="naming_conventions" value="${naming_conventions}"/>
    <field name="file_patterns" value="${file_patterns}"/>
  </block>
  <block type="checkpoint" id="CP7" name="conventions-dev-generated" desc="conventions-dev.md generated">
    <field name="verify" value="file.exists(${output_path}/conventions-dev.md)"/>
  </block>
  <block type="event" id="E7" action="log" level="info" desc="Log step 2.5 status">
    <field name="message" value="Step 2.5 Status: COMPLETED - conventions-dev.md generated"/>
  </block>

  <!-- ==================== STEP 2.6: GENERATE CONVENTIONS-UNIT-TEST.MD ==================== -->
  <block type="task" id="B8-1" action="copy-template" desc="Copy conventions-unit-test template">
    <field name="source" value="${template_conventions_unit_test}"/>
    <field name="target" value="${output_path}/conventions-unit-test.md"/>
    <field name="testing_config" value="${testing_config}"/>
  </block>
  <block type="task" id="B8-2" action="fill-unit-test-sections" desc="Fill unit-test sections">
    <field name="target" value="${output_path}/conventions-unit-test.md"/>
    <field name="testing_config" value="${testing_config}"/>
    <field name="framework" value="${framework}"/>
    <field name="platform_type" value="${platform_type}"/>
  </block>
  <block type="checkpoint" id="CP8" name="conventions-unit-test-generated" desc="conventions-unit-test.md generated">
    <field name="verify" value="file.exists(${output_path}/conventions-unit-test.md)"/>
  </block>
  <block type="event" id="E8" action="log" level="info" desc="Log step 2.6 status">
    <field name="message" value="Step 2.6 Status: COMPLETED - conventions-unit-test.md generated"/>
  </block>

  <!-- ==================== STEP 2.7: GENERATE CONVENTIONS-SYSTEM-TEST.MD ==================== -->
  <block type="task" id="B9-1" action="copy-template" desc="Copy conventions-system-test template">
    <field name="source" value="${template_conventions_system_test}"/>
    <field name="target" value="${output_path}/conventions-system-test.md"/>
    <field name="platform_type" value="${platform_type}"/>
  </block>
  <block type="task" id="B9-2" action="fill-system-test-sections" desc="Fill system-test sections">
    <field name="target" value="${output_path}/conventions-system-test.md"/>
    <field name="platform_type" value="${platform_type}"/>
    <field name="framework" value="${framework}"/>
  </block>
  <block type="checkpoint" id="CP9" name="conventions-system-test-generated" desc="conventions-system-test.md generated">
    <field name="verify" value="file.exists(${output_path}/conventions-system-test.md)"/>
  </block>
  <block type="event" id="E9" action="log" level="info" desc="Log step 2.7 status">
    <field name="message" value="Step 2.7 Status: COMPLETED - conventions-system-test.md generated"/>
  </block>

  <!-- ==================== STEP 2.8: GENERATE CONVENTIONS-BUILD.MD ==================== -->
  <block type="task" id="B10-1" action="copy-template" desc="Copy conventions-build template">
    <field name="source" value="${template_conventions_build}"/>
    <field name="target" value="${output_path}/conventions-build.md"/>
    <field name="build_tool" value="${build_tool}"/>
  </block>
  <block type="task" id="B10-2" action="fill-build-sections" desc="Fill build sections">
    <field name="target" value="${output_path}/conventions-build.md"/>
    <field name="build_tool" value="${build_tool}"/>
    <field name="config_files" value="${config_files}"/>
    <field name="dependencies" value="${dependencies}"/>
  </block>
  <block type="checkpoint" id="CP10" name="conventions-build-generated" desc="conventions-build.md generated">
    <field name="verify" value="file.exists(${output_path}/conventions-build.md)"/>
  </block>
  <block type="event" id="E10" action="log" level="info" desc="Log step 2.8 status">
    <field name="message" value="Step 2.8 Status: COMPLETED - conventions-build.md generated"/>
  </block>

  <!-- ==================== STEP 2.9: GENERATE CONVENTIONS-DATA.MD (CONDITIONAL) ==================== -->
  <block type="gateway" id="G11" mode="exclusive" desc="Generate data doc decision">
    <branch test="${generate_data_doc} == true" name="Generate data doc">
      <block type="task" id="B11-1" action="copy-template" desc="Copy conventions-data template">
        <field name="source" value="${template_conventions_data}"/>
        <field name="target" value="${output_path}/conventions-data.md"/>
        <field name="data_technology" value="${data_technology}"/>
      </block>
      <block type="task" id="B11-2" action="fill-data-sections" desc="Fill data sections">
        <field name="target" value="${output_path}/conventions-data.md"/>
        <field name="data_technology" value="${data_technology}"/>
        <field name="platform_type" value="${platform_type}"/>
        <field name="dependencies" value="${dependencies}"/>
      </block>
      <block type="checkpoint" id="CP11" name="conventions-data-generated" desc="conventions-data.md generated">
        <field name="verify" value="file.exists(${output_path}/conventions-data.md)"/>
      </block>
      <block type="event" id="E11" action="log" level="info" desc="Log step 2.9 status">
        <field name="message" value="Step 2.9 Status: COMPLETED - conventions-data.md generated"/>
      </block>
    </branch>
    <branch default="true" name="Skip data doc">
      <block type="event" id="E12" action="log" level="info" desc="Log skip status">
        <field name="message" value="Step 2.9 Status: SKIPPED - No data layer detected, conventions-data.md not generated"/>
      </block>
    </branch>
  </block>

  <!-- ==================== STEP 3: VERIFY ALL FILES GENERATED ==================== -->
  <block type="task" id="B12-1" action="verify-file-exists" desc="Verify INDEX.md">
    <field name="target" value="${output_path}/INDEX.md"/>
    <field name="output" var="index_exists" from="verify.result"/>
  </block>
  <block type="task" id="B12-2" action="verify-file-exists" desc="Verify tech-stack.md">
    <field name="target" value="${output_path}/tech-stack.md"/>
    <field name="output" var="tech_stack_exists" from="verify.result"/>
  </block>
  <block type="task" id="B12-3" action="verify-file-exists" desc="Verify architecture.md">
    <field name="target" value="${output_path}/architecture.md"/>
    <field name="output" var="architecture_exists" from="verify.result"/>
  </block>
  <block type="task" id="B12-4" action="verify-file-exists" desc="Verify conventions-design.md">
    <field name="target" value="${output_path}/conventions-design.md"/>
    <field name="output" var="conventions_design_exists" from="verify.result"/>
  </block>
  <block type="task" id="B12-5" action="verify-file-exists" desc="Verify conventions-dev.md">
    <field name="target" value="${output_path}/conventions-dev.md"/>
    <field name="output" var="conventions_dev_exists" from="verify.result"/>
  </block>
  <block type="task" id="B12-6" action="verify-file-exists" desc="Verify conventions-unit-test.md">
    <field name="target" value="${output_path}/conventions-unit-test.md"/>
    <field name="output" var="conventions_unit_test_exists" from="verify.result"/>
  </block>
  <block type="task" id="B12-7" action="verify-file-exists" desc="Verify conventions-system-test.md">
    <field name="target" value="${output_path}/conventions-system-test.md"/>
    <field name="output" var="conventions_system_test_exists" from="verify.result"/>
  </block>
  <block type="task" id="B12-8" action="verify-file-exists" desc="Verify conventions-build.md">
    <field name="target" value="${output_path}/conventions-build.md"/>
    <field name="output" var="conventions_build_exists" from="verify.result"/>
  </block>

  <block type="task" id="B12-9" action="compile-verification" desc="Compile verification results">
    <field name="index_exists" value="${index_exists}"/>
    <field name="tech_stack_exists" value="${tech_stack_exists}"/>
    <field name="architecture_exists" value="${architecture_exists}"/>
    <field name="conventions_design_exists" value="${conventions_design_exists}"/>
    <field name="conventions_dev_exists" value="${conventions_dev_exists}"/>
    <field name="conventions_unit_test_exists" value="${conventions_unit_test_exists}"/>
    <field name="conventions_system_test_exists" value="${conventions_system_test_exists}"/>
    <field name="conventions_build_exists" value="${conventions_build_exists}"/>
    <field name="output" var="all_required_exist" from="compilation.all_exist"/>
    <field name="output" var="missing_files" from="compilation.missing"/>
  </block>

  <block type="gateway" id="G13" mode="exclusive" desc="Verification result">
    <branch test="${all_required_exist} == true" name="All files exist">
      <block type="event" id="E13" action="log" level="info" desc="Log verification success">
        <field name="message" value="Step 3 Status: COMPLETED - All required documents verified to exist"/>
      </block>
    </branch>
    <branch default="true" name="Files missing">
      <block type="event" id="E14" action="log" level="error" desc="Log verification failure">
        <field name="message" value="Step 3 Status: FAILED - Missing files: ${missing_files}"/>
      </block>
      <block type="output" id="O-fail" desc="Failed output">
        <field name="status" value="failed"/>
        <field name="message" value="Verification failed - missing required documents"/>
      </block>
    </branch>
  </block>

  <block type="checkpoint" id="CP12" name="files-verified" desc="Files verified">
    <field name="verify" value="${all_required_exist} == true"/>
  </block>

  <!-- ==================== STEP 4: CREATE COMPLETION MARKER ==================== -->
  <block type="gateway" id="G14" mode="guard" desc="Pre-create check">
    <branch test="${all_required_exist} == true" name="Can create marker">
      <block type="task" id="B14" action="create-file" desc="Create done marker">
        <field name="target" value="${output_path}/conventions.done"/>
        <field name="content" value="{
  &quot;platform_id&quot;: &quot;${platform_id}&quot;,
  &quot;worker_type&quot;: &quot;conventions&quot;,
  &quot;status&quot;: &quot;completed&quot;,
  &quot;documents_generated&quot;: [&quot;INDEX.md&quot;, &quot;tech-stack.md&quot;, &quot;architecture.md&quot;, &quot;conventions-design.md&quot;, &quot;conventions-dev.md&quot;, &quot;conventions-unit-test.md&quot;, &quot;conventions-system-test.md&quot;, &quot;conventions-build.md&quot;],
  &quot;conventions_data_generated&quot;: ${generate_data_doc},
  &quot;analysis_file&quot;: &quot;${platform_id}.analysis-conventions.json&quot;,
  &quot;completed_at&quot;: &quot;${iso_timestamp}&quot;
}"/>
      </block>
      <block type="event" id="E15" action="log" level="info" desc="Log done marker created">
        <field name="message" value="Step 4 Status: COMPLETED - Done marker created"/>
      </block>
    </branch>
  </block>

  <block type="checkpoint" id="CP13" name="done-marker-created" desc="Done marker created">
    <field name="verify" value="file.exists(${output_path}/conventions.done)"/>
  </block>

  <!-- ==================== STEP 5: GENERATE ANALYSIS COVERAGE REPORT ==================== -->
  <block type="task" id="B15-1" action="determine-output-dir" desc="Determine output directory">
    <field name="completed_dir" value="${completed_dir}"/>
    <field name="output_path" value="${output_path}"/>
    <field name="output" var="report_output_dir" from="determination.dir"/>
  </block>

  <block type="task" id="B15-2" action="create-file" desc="Create analysis report">
    <field name="target" value="${report_output_dir}/${platform_id}.analysis-conventions.json"/>
    <field name="content" value="{
  &quot;platform_id&quot;: &quot;${platform_id}&quot;,
  &quot;platform_type&quot;: &quot;${platform_type}&quot;,
  &quot;worker_type&quot;: &quot;conventions&quot;,
  &quot;analyzed_at&quot;: &quot;${iso_timestamp}&quot;,
  &quot;topics&quot;: {
    &quot;i18n&quot;: {
      &quot;status&quot;: &quot;${topic_i18n_status}&quot;,
      &quot;files_analyzed&quot;: ${topic_i18n_files},
      &quot;notes&quot;: &quot;&quot;
    },
    &quot;authorization&quot;: {
      &quot;status&quot;: &quot;${topic_auth_status}&quot;,
      &quot;files_analyzed&quot;: ${topic_auth_files},
      &quot;notes&quot;: &quot;&quot;
    },
    &quot;menu_registration&quot;: {
      &quot;status&quot;: &quot;${topic_menu_status}&quot;,
      &quot;files_analyzed&quot;: ${topic_menu_files},
      &quot;notes&quot;: &quot;&quot;
    },
    &quot;data_dictionary&quot;: {
      &quot;status&quot;: &quot;${topic_dict_status}&quot;,
      &quot;files_analyzed&quot;: ${topic_dict_files},
      &quot;notes&quot;: &quot;&quot;
    },
    &quot;logging&quot;: {
      &quot;status&quot;: &quot;${topic_logging_status}&quot;,
      &quot;files_analyzed&quot;: ${topic_logging_files},
      &quot;notes&quot;: &quot;&quot;
    },
    &quot;api_request_layer&quot;: {
      &quot;status&quot;: &quot;${topic_api_status}&quot;,
      &quot;files_analyzed&quot;: ${topic_api_files},
      &quot;notes&quot;: &quot;&quot;
    },
    &quot;data_validation&quot;: {
      &quot;status&quot;: &quot;${topic_validation_status}&quot;,
      &quot;files_analyzed&quot;: ${topic_validation_files},
      &quot;notes&quot;: &quot;&quot;
    },
    &quot;file_upload&quot;: {
      &quot;status&quot;: &quot;${topic_upload_status}&quot;,
      &quot;files_analyzed&quot;: ${topic_upload_files},
      &quot;notes&quot;: &quot;&quot;
    }
  },
  &quot;config_files_analyzed&quot;: ${config_files},
  &quot;source_dirs_scanned&quot;: [&quot;${source_path}&quot;],
  &quot;documents_generated&quot;: [&quot;INDEX.md&quot;, &quot;tech-stack.md&quot;, &quot;architecture.md&quot;, &quot;conventions-design.md&quot;, &quot;conventions-dev.md&quot;, &quot;conventions-unit-test.md&quot;, &quot;conventions-system-test.md&quot;, &quot;conventions-build.md&quot;],
  &quot;coverage_summary&quot;: {
    &quot;topics_found&quot;: 0,
    &quot;topics_partial&quot;: 0,
    &quot;topics_not_found&quot;: 0,
    &quot;topics_total&quot;: 8,
    &quot;coverage_percent&quot;: 0
  }
}"/>
  </block>

  <block type="checkpoint" id="CP14" name="analysis-report-generated" desc="Analysis report generated">
    <field name="verify" value="file.exists(${report_output_dir}/${platform_id}.analysis-conventions.json)"/>
  </block>
  <block type="event" id="E16" action="log" level="info" desc="Log step 5 status">
    <field name="message" value="Step 5 Status: COMPLETED - Analysis coverage report generated"/>
  </block>

  <!-- ==================== STEP 6: REPORT RESULTS ==================== -->
  <block type="event" id="E17" action="log" level="info" desc="Log separator">
    <field name="message" value="==============================================="/>
  </block>
  <block type="event" id="E18" action="log" level="info" desc="Log header">
    <field name="message" value="Platform Convention Documents Generated: ${platform_id}"/>
  </block>
  <block type="event" id="E19" action="log" level="info" desc="Log INDEX">
    <field name="message" value="- INDEX.md: ✓"/>
  </block>
  <block type="event" id="E20" action="log" level="info" desc="Log tech-stack">
    <field name="message" value="- tech-stack.md: ✓"/>
  </block>
  <block type="event" id="E21" action="log" level="info" desc="Log architecture">
    <field name="message" value="- architecture.md: ✓"/>
  </block>
  <block type="event" id="E22" action="log" level="info" desc="Log conventions-design">
    <field name="message" value="- conventions-design.md: ✓"/>
  </block>
  <block type="event" id="E23" action="log" level="info" desc="Log conventions-dev">
    <field name="message" value="- conventions-dev.md: ✓"/>
  </block>
  <block type="event" id="E24" action="log" level="info" desc="Log conventions-unit-test">
    <field name="message" value="- conventions-unit-test.md: ✓"/>
  </block>
  <block type="event" id="E25" action="log" level="info" desc="Log conventions-system-test">
    <field name="message" value="- conventions-system-test.md: ✓"/>
  </block>
  <block type="event" id="E26" action="log" level="info" desc="Log conventions-build">
    <field name="message" value="- conventions-build.md: ✓"/>
  </block>
  <block type="event" id="E27" action="log" level="info" desc="Log conventions-data">
    <field name="message" value="- conventions-data.md: ${generate_data_doc ? '✓' : 'SKIPPED'}"/>
  </block>
  <block type="event" id="E28" action="log" level="info" desc="Log analysis file">
    <field name="message" value="- ${platform_id}.analysis-conventions.json: ✓"/>
  </block>
  <block type="event" id="E29" action="log" level="info" desc="Log output directory">
    <field name="message" value="- Output Directory: ${output_path}"/>
  </block>
  <block type="event" id="E30" action="log" level="info" desc="Log footer">
    <field name="message" value="==============================================="/>
  </block>

  <block type="output" id="O-vals" desc="Final output values">
    <field name="status" value="success"/>
    <field name="documents_generated" value="[INDEX.md, tech-stack.md, architecture.md, conventions-design.md, conventions-dev.md, conventions-unit-test.md, conventions-system-test.md, conventions-build.md]"/>
    <field name="analysis_file" value="${report_output_dir}/${platform_id}.analysis-conventions.json"/>
    <field name="message" value="Convention documents generated for ${platform_id}"/>
  </block>

  <block type="checkpoint" id="CP15" name="workflow-complete" desc="Workflow complete">
    <field name="verify" value="true"/>
  </block>

  <!-- ==================== FINAL OUTPUT ==================== -->
  <block type="output" id="O1" desc="Final workflow outputs">
    <field name="status" from="step6-report-results.status"/>
    <field name="documents_generated" from="step6-report-results.documents_generated"/>
    <field name="analysis_file" from="step6-report-results.analysis_file"/>
    <field name="message" from="step6-report-results.message"/>
  </block>

  <!-- ==================== ERROR HANDLING ==================== -->
  <block type="error-handler" id="EH1" desc="Global error handling">
    <catch error-type="file-not-found">
      <block type="event" id="E-err1" action="log" level="error" desc="Log file not found">
        <field name="message" value="File not found: ${error.file}"/>
      </block>
      <block type="output" id="O-err1" desc="Error output">
        <field name="status" value="failed"/>
        <field name="message" value="Required file not found: ${error.file}"/>
      </block>
    </catch>
    <catch error-type="template-error">
      <block type="event" id="E-err2" action="log" level="error" desc="Log template error">
        <field name="message" value="Template processing error: ${error.message}"/>
      </block>
      <block type="output" id="O-err2" desc="Error output">
        <field name="status" value="failed"/>
        <field name="message" value="Failed to process template: ${error.message}"/>
      </block>
    </catch>
    <catch error-type="verification-failed">
      <block type="event" id="E-err3" action="log" level="error" desc="Log verification error">
        <field name="message" value="Verification failed: ${error.message}"/>
      </block>
      <block type="output" id="O-err3" desc="Error output">
        <field name="status" value="failed"/>
        <field name="message" value="Document verification failed: ${error.message}"/>
      </block>
    </catch>
    <catch error-type="context-limit">
      <block type="event" id="E-err4" action="log" level="warning" desc="Log context limit">
        <field name="message" value="Context window running low - checkpoint saved"/>
      </block>
      <block type="output" id="O-err4" desc="Partial output">
        <field name="status" value="partial"/>
        <field name="message" value="Execution paused due to context limit. Checkpoint saved, can resume."/>
      </block>
    </catch>
    <finally>
      <block type="event" id="E-finally" action="log" level="info" desc="Log workflow complete">
        <field name="message" value="Workflow execution completed with status: ${status}"/>
      </block>
    </finally>
  </block>

</workflow>

## Constraints

1. **DO NOT create temporary scripts, batch files, or workaround code files (`.py`, `.bat`, `.sh`, `.ps1`, etc.)** under any circumstances
2. **DO NOT analyze files outside the specified `${source_path}`**
3. **All content MUST be in the language specified by `${language}`**
4. **Use `search_replace` for section filling, NEVER rewrite entire document**
5. **Mermaid diagrams MUST follow the rules in `mermaid-rule.md`**
6. **All links MUST use relative paths, NEVER `file://` protocol**
7. **Write each document to file immediately after generation - DO NOT accumulate all documents in memory**
8. **DO NOT create done marker file until ALL required documents have been verified to exist on disk**

## Task Completion Report

When the task is complete, report the following:

**Status:** `success` | `partial` | `failed`

**Summary:**
- Platform: `${platform_id}`
- Type: `${platform_type}`
- Framework: `${framework}`
- Documents generated: 8 required + (1 optional if data layer detected)

**Files Generated:**
- `${output_path}/INDEX.md` - Platform technology index
- `${output_path}/tech-stack.md` - Technology stack details
- `${output_path}/architecture.md` - Architecture conventions
- `${output_path}/conventions-design.md` - Design conventions
- `${output_path}/conventions-dev.md` - Development conventions
- `${output_path}/conventions-unit-test.md` - Unit testing conventions
- `${output_path}/conventions-system-test.md` - System testing conventions
- `${output_path}/conventions-build.md` - Build and deployment conventions
- `${output_path}/conventions-data.md` - Data conventions (optional)
- `${completed_dir}/${platform_id}.analysis-conventions.json` - Analysis coverage report

## Checklist

### Pre-Generation
- [ ] All template files read successfully
- [ ] All configuration files read and parsed
- [ ] Technology stack extracted accurately
- [ ] Conventions analyzed from config files

### Document Generation
- [ ] INDEX.md generated with navigation
- [ ] tech-stack.md generated with dependency tables
- [ ] architecture.md generated with platform-specific patterns
- [ ] conventions-design.md generated with design principles
- [ ] conventions-dev.md generated with naming and style rules
- [ ] conventions-unit-test.md generated with unit testing requirements
- [ ] conventions-system-test.md generated with system testing requirements
- [ ] conventions-build.md generated with build and deployment conventions
- [ ] conventions-data.md generated (only if applicable per platform type mapping)

### Quality Checks
- [ ] All files written to output_path
- [ ] **Source traceability**: File reference block added to each document
- [ ] **Source traceability**: Diagram Source annotations added after each Mermaid diagram
- [ ] **Source traceability**: Section Source annotations added at end of major sections
- [ ] **Mermaid compatibility**: No `style`, `direction`, `<br/>`, or nested subgraphs
- [ ] **Document completeness**: All 8 required documents exist (verified in Step 3)
- [ ] **Done marker integrity**: Done marker only created after verification
- [ ] **Analysis Coverage Report**: `${platform_id}.analysis-conventions.json` generated

## CONTINUOUS EXECUTION RULES

This skill MUST execute continuously without user interruption:

1. **All steps must complete in a single session** - from template reading to done marker creation
2. **If context window is running low**: Save checkpoint and inform user - DO NOT create false done marker
3. **No intermediate user confirmation required** between steps
4. **Error handling**: On error, log details and stop - do not proceed with incomplete data
5. **Verification gate**: Step 3 verification MUST pass before Step 4 done marker creation
6. **Memory management**: Write each document immediately after generation, do not accumulate in memory
