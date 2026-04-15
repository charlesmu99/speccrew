---
name: speccrew-test-code-gen
description: Generates executable test code from confirmed test case documents. Reads test case matrix, platform technical conventions, and system design to produce well-structured test files with full traceability to test case IDs.
tools: Read, Write, Glob, Grep
---

# Trigger Scenarios

- When speccrew-test-manager dispatches test code generation after test cases are confirmed
- When user explicitly requests test code generation from confirmed test cases
- When user asks "Generate test code", "Create test files from test cases"

## AgentFlow Definition

<!-- @agentflow: workflow.agentflow.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `speccrew-workspace/docs/rules/agentflow-spec.md`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<workflow id="test-code-gen-main" status="pending" version="1.0" desc="Generate executable test code from confirmed test case documents">

  <!-- Input Parameters -->
  <block type="input" id="I1" desc="Workflow input parameters">
    <field name="test_cases_path" required="true" type="string" desc="Path to test cases document"/>
    <field name="system_design_path" required="false" type="string" desc="Path to system design document"/>
    <field name="output_dir" required="true" type="string" desc="Directory for test code output"/>
    <field name="feature_name" required="true" type="string" desc="Feature name for output file naming"/>
    <field name="platform_id" required="true" type="string" desc="Target platform identifier"/>
    <field name="module" required="true" type="string" desc="Module name for file organization"/>
  </block>

  <!-- Global Constraints -->
  <block type="rule" id="R1" level="forbidden" desc="Document generation constraints">
    <field name="text">NEVER use create_file to write the test code plan document directly</field>
    <field name="text">MUST copy template first, then fill sections with search_replace for plan document</field>
    <field name="text">NEVER replace entire document content in a single operation</field>
  </block>

  <block type="rule" id="R2" level="mandatory" desc="Template-first workflow for plan document">
    <field name="text">Copy template MUST execute before filling sections for code plan document</field>
    <field name="text">Test source code files are written directly (NOT template-filled)</field>
  </block>

  <block type="rule" id="R3" level="mandatory" desc="TC ID traceability">
    <field name="text">Every test function MUST have a TC ID comment</field>
    <field name="text">Format: // TC-{MODULE}-{SEQ}: {description}</field>
  </block>

  <!-- Main Processing Sequence -->
  <sequence id="S1" name="Test Code Generation" status="pending" desc="Generate test code from test cases">

    <!-- Step 1: Read Test Cases -->
    <block type="task" id="B1" action="read-file" desc="Read confirmed test case document">
      <field name="path" value="${test_cases_path}"/>
      <field name="output" var="test_cases"/>
    </block>

    <!-- Step 2: Read Technical Conventions -->
    <block type="task" id="B2" action="read-file" desc="Read platform testing conventions">
      <field name="path" value="speccrew-workspace/knowledges/techs/${platform_id}/conventions-system-test.md"/>
      <field name="optional" value="true"/>
      <field name="output" var="system_test_conventions"/>
    </block>

    <!-- Fallback: Read unit test conventions -->
    <block type="gateway" id="G1" mode="exclusive" desc="Check if system test conventions found">
      <branch test="${system_test_conventions} == null">
        <block type="task" id="B3" action="read-file" desc="Read unit test conventions as fallback">
          <field name="path" value="speccrew-workspace/knowledges/techs/${platform_id}/conventions-unit-test.md"/>
          <field name="optional" value="true"/>
          <field name="output" var="unit_test_conventions"/>
        </block>
      </branch>
    </block>

    <!-- Step 3: Read System Design (if provided) -->
    <block type="gateway" id="G2" mode="exclusive" desc="Check if system design path is provided">
      <branch test="${system_design_path} != null AND ${system_design_path} != ''">
        <block type="task" id="B4" action="read-file" desc="Read system design document">
          <field name="path" value="${system_design_path}"/>
          <field name="output" var="system_design"/>
        </block>
      </branch>
    </block>

    <!-- Step 4: Generate Code Plan -->
    <block type="task" id="B5" action="analyze" desc="Determine file grouping strategy">
      <field name="grouping_rules">
        - IF test cases share same module/component THEN group into single test file
        - IF test cases are independent THEN one test file per test case
        - Maximum test cases per file: 10
        - Naming convention: {module-name}.test.{ext} or {module-name}.spec.{ext}
      </field>
      <field name="output" var="file_grouping_strategy"/>
    </block>

    <block type="task" id="B6" action="analyze" desc="Plan test file structure">
      <field name="analysis_focus">
        - Files per module
        - Single vs multiple files
        - Integration test separation
      </field>
      <field name="output" var="test_file_structure"/>
    </block>

    <block type="task" id="B7" action="analyze" desc="Plan shared resources">
      <field name="resource_types">
        - Fixtures: Common test data
        - Helpers: Reusable test utilities
        - Mocks: Shared mock definitions
      </field>
      <field name="output" var="shared_resources_plan"/>
    </block>

    <block type="task" id="B8" action="analyze" desc="Plan mock/stub strategy">
      <field name="dependency_types">
        - Database: Mock repository/DAO or use test database
        - External API: Mock HTTP client or use stub server
        - File System: Mock file operations or use temp directory
        - Message Queue: Mock producer/consumer
        - Cache: Mock cache client or use in-memory cache
      </field>
      <field name="output" var="mock_strategy"/>
    </block>

    <block type="task" id="B9" action="analyze" desc="Create file-to-testcase mapping">
      <field name="output" var="file_case_mapping"/>
    </block>

    <!-- Step 5: Checkpoint - Present Code Plan for Confirmation -->
    <block type="task" id="B10" action="generate" desc="Generate code plan summary">
      <field name="output" var="code_plan_summary"/>
    </block>

    <block type="event" id="E1" action="confirm" title="Confirm Test Code Plan" type="yesno" desc="Wait for user confirmation before generating code">
      <field name="preview" value="${code_plan_summary}"/>
      <on-confirm>
        <field name="confirmed" value="true"/>
      </on-confirm>
      <on-cancel>
        <field name="workflow.status" value="cancelled"/>
      </on-cancel>
    </block>

    <!-- Step 6: Generate Test Code -->
    <block type="task" id="B11" action="generate" desc="Generate fixtures">
      <field name="output_dir" value="${output_dir}/__fixtures__"/>
      <field name="output" var="fixtures_generated"/>
    </block>

    <block type="task" id="B12" action="generate" desc="Generate helpers">
      <field name="output_dir" value="${output_dir}/__helpers__"/>
      <field name="output" var="helpers_generated"/>
    </block>

    <block type="task" id="B13" action="generate" desc="Generate mocks">
      <field name="output_dir" value="${output_dir}/__mocks__"/>
      <field name="output" var="mocks_generated"/>
    </block>

    <block type="loop" id="L1" over="${file_case_mapping.files}" as="file_mapping" desc="Generate test files">
      <block type="task" id="B14" action="generate" desc="Generate test file ${file_mapping.file_name}">
        <field name="tc_annotation_format">// TC-{MODULE}-{SEQ}: {description}</field>
        <field name="test_structure">Arrange-Act-Assert</field>
        <field name="output_path" value="${output_dir}/${file_mapping.file_name}"/>
      </block>
    </block>

    <!-- Step 7: Write Code Plan Document -->
    <block type="task" id="B15" action="read-file" desc="Read test code plan template">
      <field name="path" value="speccrew-test-code-gen/templates/TEST-CODE-PLAN-TEMPLATE.md"/>
      <field name="output" var="plan_template"/>
    </block>

    <block type="task" id="B16" action="write-file" desc="Create test code plan document">
      <field name="path" value="${output_dir}/${feature_name}-test-code-plan.md"/>
      <field name="template" value="${plan_template}"/>
      <field name="output" var="plan_document_created"/>
    </block>

    <block type="task" id="B17" action="edit-file" desc="Fill File-to-TestCase Mapping section">
      <field name="path" value="${output_dir}/${feature_name}-test-code-plan.md"/>
      <field name="section">File-to-TestCase Mapping</field>
    </block>

    <block type="task" id="B18" action="edit-file" desc="Fill Mock Strategy section">
      <field name="path" value="${output_dir}/${feature_name}-test-code-plan.md"/>
      <field name="section">Mock Strategy</field>
    </block>

    <block type="task" id="B19" action="edit-file" desc="Fill Shared Resources section">
      <field name="path" value="${output_dir}/${feature_name}-test-code-plan.md"/>
      <field name="section">Shared Resources</field>
    </block>

    <block type="task" id="B20" action="edit-file" desc="Fill Test File Structure section">
      <field name="path" value="${output_dir}/${feature_name}-test-code-plan.md"/>
      <field name="section">Test File Structure</field>
    </block>

    <!-- Checkpoint -->
    <block type="checkpoint" id="CP1" name="code-generation-complete" desc="Verify test code generation complete">
      <field name="file" value="${output_dir}/${feature_name}-test-code-plan.md"/>
    </block>

  </sequence>

  <!-- Output Results -->
  <block type="output" id="O1" desc="Workflow output results">
    <field name="test_code_plan_path" value="${output_dir}/${feature_name}-test-code-plan.md" type="string" desc="Path to test code plan document"/>
    <field name="test_files" type="array" desc="List of generated test files"/>
    <field name="total_test_cases" type="number" desc="Total number of test cases implemented"/>
  </block>

</workflow>
```

# Key Rules

| Rule | Description |
|------|-------------|
| **TC ID Traceability** | Every test function MUST have a TC ID comment |
| **Checkpoint Required** | Must confirm code plan with user before generating |
| Convention Compliance | Follow platform-specific conventions-unit-test.md |
| **Arrange-Act-Assert** | Maintain clear test structure |
| **Mock Strategy Documented** | All mocks documented in code plan |
| **No Test Execution** | This skill only generates code, does not run tests |

# Checklist

- [ ] Test case document read, all cases parsed
- [ ] Technical conventions loaded (conventions-unit-test.md or inferred)
- [ ] System design read, dependencies identified
- [ ] Code plan generated with file-to-case mapping
- [ ] Checkpoint passed: code plan confirmed with user
- [ ] Every test case ID has a corresponding test function
- [ ] Each test function has a TC ID annotation comment
- [ ] Mock/stub strategy covers all external dependencies
- [ ] Test code follows platform conventions-unit-test.md style
- [ ] Shared fixtures and helpers are extracted properly
- [ ] Arrange-Act-Assert structure maintained in tests
- [ ] Code plan document written to correct path

---

# Task Completion Report

Upon completion (success or failure), output the following report format:

## Success Report
```
## Task Completion Report
- **Status**: SUCCESS
- **Task ID**: <from dispatch context, e.g., "test-code-web-vue">
- **Platform**: <platform_id, e.g., "web-vue">
- **Phase**: test_code_gen
- **Output Files**:
  - `speccrew-workspace/iterations/{iteration}/06.system-test/code/{platform_id}/[feature]-test-code-plan.md`
  - <list of generated test source files>
- **Summary**: Test code generation completed with {file_count} files covering {case_count} test cases
```

## Failure Report
```
## Task Completion Report
- **Status**: FAILED
- **Task ID**: <from dispatch context>
- **Platform**: <platform_id>
- **Phase**: test_code_gen
- **Output Files**: <list of partial outputs or "None">
- **Summary**: Test code generation failed during {step}
- **Error**: <detailed error description>
- **Error Category**: DEPENDENCY_MISSING | BUILD_FAILURE | VALIDATION_ERROR | RUNTIME_ERROR | BLOCKED
- **Partial Outputs**: <list of partially generated files or "None">
- **Recovery Hint**: <suggestion for recovery, e.g., "Verify test case document format is valid">
```
