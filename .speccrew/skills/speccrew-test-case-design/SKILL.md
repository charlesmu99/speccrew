---
name: speccrew-test-case-design
description: Designs structured test cases from Feature Spec and API Contract documents. Focuses on comprehensive test scenario analysis, test case matrix generation, and coverage traceability without involving any code implementation.
tools: Read, Write, Glob, Grep
---

# Trigger Scenarios

- When speccrew-test-manager dispatches test case design for a specific platform/feature
- When user explicitly requests test case design from feature specification
- When user asks "Design test cases for this feature" or "Create test case matrix"

## AgentFlow Definition

<!-- @agentflow: workflow.agentflow.xml -->

> **REQUIRED**: Before executing this workflow, read the XML workflow specification: `speccrew-workspace/docs/rules/agentflow-spec.md`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<workflow id="test-case-design-main" status="pending" version="1.0" desc="Design structured test cases from Feature Spec and API Contract documents">

  <!-- Input Parameters -->
  <block type="input" id="I1" desc="Workflow input parameters">
    <field name="feature_spec_path" required="true" type="string" desc="Path to feature specification document"/>
    <field name="api_contract_path" required="false" type="string" desc="Path to API contract document"/>
    <field name="system_design_path" required="false" type="string" desc="Path to system design document"/>
    <field name="output_dir" required="true" type="string" desc="Directory for test case design output"/>
    <field name="feature_name" required="true" type="string" desc="Feature name for output file naming"/>
    <field name="platform_id" required="true" type="string" desc="Target platform identifier"/>
    <field name="module" required="true" type="string" desc="Module abbreviation (3-4 letters)"/>
  </block>

  <!-- Global Constraints -->
  <block type="rule" id="R1" level="forbidden" desc="Document generation constraints">
    <field name="text">NEVER use create_file to write the test case design document directly</field>
    <field name="text">MUST copy template first, then fill sections with search_replace</field>
    <field name="text">NEVER replace entire document content in a single operation</field>
  </block>

  <block type="rule" id="R2" level="mandatory" desc="Template-first workflow">
    <field name="text">Copy template MUST execute before filling sections</field>
    <field name="text">All section titles MUST be preserved</field>
  </block>

  <!-- Main Processing Sequence -->
  <sequence id="S1" name="Test Case Design" status="pending" desc="Design test cases from feature specifications">

    <!-- Step 1: Read Feature Spec -->
    <block type="task" id="B1" action="read-file" desc="Read feature specification document">
      <field name="path" value="${feature_spec_path}"/>
      <field name="output" var="feature_spec"/>
    </block>

    <!-- Step 2: Read API Contract (if provided) -->
    <block type="gateway" id="G1" mode="exclusive" desc="Check if API contract path is provided">
      <branch test="${api_contract_path} != null AND ${api_contract_path} != ''">
        <block type="task" id="B2" action="read-file" desc="Read API contract document">
          <field name="path" value="${api_contract_path}"/>
          <field name="output" var="api_contract"/>
        </block>
      </branch>
      <branch default="true" name="No API Contract">
        <block type="event" id="E1" action="log" level="info" desc="Log API contract skip">
          <field name="message">API contract path not provided, skipping API contract analysis</field>
        </block>
      </branch>
    </block>

    <!-- Step 3: Read System Design (if provided) -->
    <block type="gateway" id="G2" mode="exclusive" desc="Check if system design path is provided">
      <branch test="${system_design_path} != null AND ${system_design_path} != ''">
        <block type="task" id="B3" action="read-file" desc="Read system design document">
          <field name="path" value="${system_design_path}"/>
          <field name="output" var="system_design"/>
        </block>
      </branch>
      <branch default="true" name="No System Design">
        <block type="event" id="E2" action="log" level="info" desc="Log system design skip">
          <field name="message">System design path not provided, skipping system design analysis</field>
        </block>
      </branch>
    </block>

    <!-- Step 4: Read Testing Conventions (optional) -->
    <block type="task" id="B4" action="read-file" desc="Read testing conventions if available">
      <field name="path" value="speccrew-workspace/knowledges/techs/${platform_id}/conventions-system-test.md"/>
      <field name="optional" value="true"/>
      <field name="output" var="testing_conventions"/>
    </block>

    <!-- Step 5: Analyze Test Dimensions -->
    <block type="task" id="B5" action="analyze" desc="Analyze test dimensions for comprehensive coverage">
      <field name="analysis_dimensions">
        - Functional Positive Tests (Happy Path)
        - Boundary Value Tests
        - Exception/Error Handling Tests
        - Business Rule Constraint Tests
        - Permission/Security Tests
        - Data Validation Tests
        - State Transition Tests (if applicable)
      </field>
      <field name="output" var="test_dimensions_analysis"/>
    </block>

    <!-- Step 6: Generate Test Case Matrix -->
    <block type="task" id="B6" action="generate" desc="Generate structured test case matrix">
      <field name="module" value="${module}"/>
      <field name="naming_convention">TC-{MODULE}-{SEQ}</field>
      <field name="priority_mapping">
        - P0 (Critical) → P0-Critical
        - P1 (Important) → P1-High
        - P2 (Standard) → P2-Medium
        - P3 (Minor) → P3-Low
      </field>
      <field name="output" var="test_case_matrix"/>
    </block>

    <!-- Step 7: Coverage Self-Check -->
    <block type="task" id="B7" action="analyze" desc="Perform coverage self-check against acceptance criteria">
      <field name="validation_rules">
        - Each acceptance criterion has corresponding test case(s)
        - Test case fully validates the criterion
        - Coverage status marked for each requirement
      </field>
      <field name="output" var="coverage_check"/>
    </block>

    <!-- Step 8: Read Template -->
    <block type="task" id="B8" action="read-file" desc="Read test case design template">
      <field name="path" value="speccrew-test-case-design/templates/TEST-CASE-DESIGN-TEMPLATE.md"/>
      <field name="output" var="template_content"/>
    </block>

    <!-- Step 9: Create Output Document -->
    <block type="task" id="B9" action="write-file" desc="Create test case design document from template">
      <field name="path" value="${output_dir}/${feature_name}-test-case-design.md"/>
      <field name="template" value="${template_content}"/>
      <field name="output" var="document_created"/>
    </block>

    <!-- Step 10: Fill Document Sections -->
    <block type="task" id="B10" action="edit-file" desc="Fill Test Overview section">
      <field name="path" value="${output_dir}/${feature_name}-test-case-design.md"/>
      <field name="section">Test Overview</field>
    </block>

    <block type="task" id="B11" action="edit-file" desc="Fill Test Case Matrix section">
      <field name="path" value="${output_dir}/${feature_name}-test-case-design.md"/>
      <field name="section">Test Case Matrix</field>
    </block>

    <block type="task" id="B12" action="edit-file" desc="Fill Test Data Definition section">
      <field name="path" value="${output_dir}/${feature_name}-test-case-design.md"/>
      <field name="section">Test Data Definition</field>
    </block>

    <block type="task" id="B13" action="edit-file" desc="Fill Coverage Traceability section">
      <field name="path" value="${output_dir}/${feature_name}-test-case-design.md"/>
      <field name="section">Coverage Traceability</field>
    </block>

    <!-- Checkpoint -->
    <block type="checkpoint" id="CP1" name="document-complete" desc="Verify test case design document is complete">
      <field name="file" value="${output_dir}/${feature_name}-test-case-design.md"/>
    </block>

  </sequence>

  <!-- Output Results -->
  <block type="output" id="O1" desc="Workflow output results">
    <field name="test_case_design_path" value="${output_dir}/${feature_name}-test-case-design.md" type="string" desc="Path to generated test case design document"/>
    <field name="test_case_count" type="number" desc="Total number of test cases designed"/>
    <field name="coverage_status" type="string" desc="Coverage status (full/partial)"/>
  </block>

</workflow>
```

# Key Rules

| Rule | Description |
|------|-------------|
| **No Code Implementation** | Do NOT write actual test code, only test case specifications |
| **Coverage First** | Prioritize acceptance criteria coverage over exhaustive testing |
| **Clear Expected Results** | Every test case must have unambiguous expected result |
| **Traceability Required** | All test cases must trace back to requirements |
| **Naming Convention** | Strictly follow TC-{MODULE}-{SEQ} format |
| **Priority Alignment** | Test case priority should align with requirement priority |

# Checklist

- [ ] All acceptance criteria from Feature Spec have corresponding test cases
- [ ] Each test dimension has at least one test case (if applicable)
- [ ] Test case IDs follow naming convention (TC-{MODULE}-{SEQ})
- [ ] All test cases have clear expected results
- [ ] Coverage traceability matrix is complete
- [ ] Test data sets cover normal, boundary, and exception scenarios
- [ ] Priority assignments are consistent with requirement priorities
- [ ] Preconditions are clearly stated for each test case
- [ ] Steps are detailed enough for execution without ambiguity
- [ ] Document written to correct output path

---

# Task Completion Report

Upon completion (success or failure), output the following report format:

## Success Report
```
## Task Completion Report
- **Status**: SUCCESS
- **Task ID**: <from dispatch context, e.g., "test-case-web-vue">
- **Platform**: <platform_id, e.g., "web-vue">
- **Phase**: test_case_design
- **Output Files**:
  - `speccrew-workspace/iterations/{iteration}/06.system-test/cases/{platform_id}/[feature]-test-cases.md`
- **Summary**: Test case design completed with {count} test cases covering {dimensions} dimensions
```

## Failure Report
```
## Task Completion Report
- **Status**: FAILED
- **Task ID**: <from dispatch context>
- **Platform**: <platform_id>
- **Phase**: test_case_design
- **Output Files**: None
- **Summary**: Test case design failed during {step}
- **Error**: <detailed error description>
- **Error Category**: DEPENDENCY_MISSING | BUILD_FAILURE | VALIDATION_ERROR | RUNTIME_ERROR | BLOCKED
- **Partial Outputs**: <list of partially generated files or "None">
- **Recovery Hint**: <suggestion for recovery, e.g., "Check feature spec document exists at specified path">
```
