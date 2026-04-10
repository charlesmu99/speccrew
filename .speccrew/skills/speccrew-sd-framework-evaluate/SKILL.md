---
name: speccrew-sd-framework-evaluate
description: Framework Evaluation Skill for System Designer. Analyzes Feature Spec requirements against current technology stack capabilities, identifies capability gaps, evaluates potential open-source frameworks/libraries, and generates a framework-evaluation.md report. Invoked by System Designer Agent during Phase 3.
tools: Read, Write, Glob, Grep
---

# Trigger Scenarios

- System Designer Agent dispatches this skill with Feature Spec paths and techs knowledge paths
- User requests framework evaluation for current iteration
- Need to assess technology stack gaps before system design

# Workflow

## Absolute Constraints

> **These rules apply to ALL steps. Violation = task failure.**

1. **READ-ONLY on Feature Spec and API Contract** — NEVER modify Feature Spec or API Contract documents. Only read for analysis.
2. **READ-ONLY on techs knowledge** — NEVER modify techs knowledge files. Only read for capability assessment.
3. **Evidence-based evaluation** — Every recommendation MUST cite specific Feature Spec requirements and specific tech stack limitations.
4. **No assumptions** — DO NOT assume framework capabilities. Only recommend frameworks with documented capabilities.

## Step 1: Read Inputs

**Input Parameters** (from agent context):

| Parameter | Required | Description |
|-----------|----------|-------------|
| `feature_spec_paths` | Yes | Array of Feature Spec file paths |
| `api_contract_paths` | Yes | Array of API Contract file paths |
| `techs_knowledge_paths` | Yes | Object with platform_id → knowledge paths mapping |
| `iteration_path` | Yes | Current iteration directory path |
| `output_path` | No | Output file path (default: `iteration_path/03.system-design/framework-evaluation.md`) |

Read in order:

1. **All Feature Spec documents** — Extract functional requirements, especially:
   - Real-time features (WebSocket, SSE, push notifications)
   - File processing (upload, download, preview, conversion)
   - Data visualization (charts, dashboards, reports)
   - Rich text / editor features
   - Map / geolocation features
   - Payment / third-party integrations
   - Search / filtering / pagination patterns
   - Media processing (image, video, audio)

2. **All API Contract documents** — Extract:
   - Communication protocols (REST, GraphQL, WebSocket, gRPC)
   - Authentication patterns (JWT, OAuth, Session)
   - Data formats (JSON, protobuf, multipart)

3. **Techs knowledge per platform**:
   - `tech-stack.md` — Current frameworks, libraries, versions
   - `architecture.md` — Current architecture patterns
   - `conventions-design.md` — Design conventions
   - `conventions-dev.md` — Development conventions

## Step 2: Gap Analysis

For each requirement extracted in Step 1, evaluate against current tech stack:

### 2.1 Build Capability Matrix

| Requirement Category | Specific Requirement | Source (Feature ID) | Current Stack Support | Gap? |
|---------------------|---------------------|--------------------|-----------------------|------|
| Real-time | WebSocket connections | F-CRM-01 | Not in current stack | YES |
| File Processing | PDF preview | F-ORD-02 | Not in current stack | YES |
| Data Viz | Dashboard charts | F-RPT-01 | Not in current stack | YES |
| Authentication | JWT token | F-SYS-01 | Already supported | NO |

### 2.2 Categorize Gaps

Group identified gaps by category:

- **Critical Gaps**: Core functionality cannot be implemented without new framework
- **Enhancement Gaps**: Functionality possible but significantly better with dedicated library
- **Optional Gaps**: Nice-to-have improvements, current stack can handle acceptably

## Step 3: Framework Research

For each identified gap (Critical and Enhancement only):

### 3.1 Evaluate Candidates

For each gap, research and evaluate 1-3 candidate frameworks/libraries:

| Evaluation Criteria | Description |
|--------------------|-------------|
| **Functionality Fit** | Does it solve the specific capability gap? |
| **License** | MIT, Apache 2.0, BSD preferred. GPL requires flagging. |
| **Maturity** | GitHub stars, npm downloads, last release date, version stability |
| **Bundle Size** | Impact on frontend bundle (if applicable) |
| **Integration Complexity** | How much existing code needs modification? |
| **Community & Docs** | Documentation quality, community support, ecosystem |

### 3.2 Make Recommendations

For each gap, provide a single primary recommendation with justification.

## Step 4: Generate Report

Write the framework evaluation report to `output_path`.

### Report Structure (When Gaps Found)

```markdown
# Framework Evaluation Report — iteration_name

## 1. Evaluation Summary

- **Iteration**: iteration_name
- **Feature Specs Analyzed**: feature_count
- **Platforms Evaluated**: platform_count
- **Capability Gaps Found**: gap_count
- **New Frameworks Recommended**: framework_count

## 2. Capability Gap Analysis

### 2.1 Gap Summary

| # | Gap Category | Specific Gap | Severity | Source Features | Recommendation |
|---|-------------|-------------|----------|----------------|---------------|
| 1 | Real-time | WebSocket support | Critical | F-CRM-01, F-MSG-01 | Socket.IO |
| 2 | Data Viz | Chart rendering | Enhancement | F-RPT-01 | ECharts |
| ... | ... | ... | ... | ... | ... |

### 2.2 Detailed Gap Analysis

#### Gap 1: {Gap Name}

**Requirement Source**: {Feature IDs and specific requirement text}
**Current Stack Status**: {What the current stack provides/lacks}
**Impact**: {What cannot be implemented without addressing this gap}

## 3. Framework Recommendations

### 3.1 Recommendation Summary

| # | Framework | Version | License | For Gap | Platform | Integration Impact |
|---|-----------|---------|---------|---------|----------|-------------------|
| 1 | Socket.IO | ^4.x | MIT | WebSocket support | backend + web | Medium |
| 2 | ECharts | ^5.x | Apache 2.0 | Chart rendering | web | Low |

### 3.2 Detailed Recommendations

#### Recommendation 1: {Framework Name}

- **Solves Gap**: {gap description}
- **License**: {license type}
- **Maturity**: {stars, downloads, last release}
- **Integration Impact**: Low / Medium / High
- **Integration Notes**: {specific integration considerations}
- **Alternatives Considered**: {other options and why not chosen}

## 4. No-Change Confirmations

Capabilities already covered by current stack:
- {capability 1}: Covered by {existing framework}
- {capability 2}: Covered by {existing framework}

## 5. Version Constraints

| Framework | Required Version | Constraint Reason |
|-----------|-----------------|-------------------|
| {name} | {version range} | {compatibility reason} |
```

### Simplified Report Structure (When No Gaps Found)

```markdown
# Framework Evaluation Report — iteration_name

## 1. Evaluation Summary

- **Feature Specs Analyzed**: feature_count
- **Platforms Evaluated**: platform_count
- **Capability Gaps Found**: 0
- **New Frameworks Recommended**: 0

## 2. Assessment

All Feature Spec requirements can be fully implemented with the current technology stack. No new frameworks or libraries are needed.

### Capabilities Confirmed
- {list each major capability confirmed as supported}

## 3. Conclusion

Current tech stack is sufficient. Proceed to system design without framework changes.
```

## Step 5: Output Task Completion Report

After writing the report, output:

```
--- TASK COMPLETION REPORT ---
Task: Framework Evaluation
Status: SUCCESS
Output: output_path
Gaps Found: gap_count
Frameworks Recommended: framework_count
--- END REPORT ---
```

If any step fails:

```
--- TASK COMPLETION REPORT ---
Task: Framework Evaluation  
Status: FAILED
Error: {specific error description}
Failed At: Step {N}
--- END REPORT ---
```

# Key Rules

| Rule | Description |
|------|-------------|
| **READ-ONLY Inputs** | Feature Spec, API Contract, and techs knowledge are reference only — never modify |
| **Evidence-based** | Every gap and recommendation must cite specific requirement sources |
| **Gap Categories** | Only Critical and Enhancement gaps require framework recommendations |
| **License Awareness** | GPL and copyleft licenses must be flagged in recommendations |
| **No Assumptions** | Only recommend frameworks with documented, verified capabilities |

# Checklist

- [ ] All Feature Spec documents read and requirements extracted
- [ ] All API Contract documents read and protocols identified
- [ ] Techs knowledge loaded for all platforms
- [ ] Capability matrix built with all requirements mapped
- [ ] Gaps categorized by severity (Critical/Enhancement/Optional)
- [ ] Framework candidates evaluated against criteria
- [ ] Primary recommendations made for each gap
- [ ] Report generated with correct structure
- [ ] Task Completion Report output
