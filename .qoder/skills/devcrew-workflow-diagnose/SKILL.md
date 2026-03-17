---
name: devcrew-workflow-diagnose
description: Diagnose issues in AI engineering workflows. Analyze workflow bottlenecks, Agent behavior anomalies, deliverable quality issues, and provide solutions. Trigger scenarios: user mentions "workflow stuck", "diagnose problem", "Agent not working as expected", "poor deliverable quality"
tools: Read, Glob, Grep
---

# Trigger Scenarios

- AI engineering workflow stuck at a certain stage
- Agent output does not meet expectations
- Deliverable quality does not meet standards
- User mentions "workflow issues", "diagnose", "Agent behavior anomaly"

# Workflow

## 1. Collect Problem Information

Ask or identify the following information:
- Which stage did the problem occur? (PM / Solution / Design / Development / Testing)
- What are the specific symptoms?
- What solutions have been tried?

## 2. Read Related Deliverables

Based on the problem stage, read the corresponding deliverables:

| Problem Stage | Deliverables to Read |
|---------------|----------------------|
| PM Stage | `se/prd.md` |
| Solution Stage | `se/solution.md` |
| Design Stage | `se/*-design.md` |
| Development Stage | Related code files |
| Testing Stage | Test cases, test reports |

## 3. Analyze Root Cause

Common problem types and diagnostic directions:

### Agent Behavior Issues

| Symptom | Possible Cause | Solution |
|---------|----------------|----------|
| Output too generic | Agent prompt lacks project-specific information | Use `agent-optimize` Skill to supplement specific tech stack |
| Skipping necessary steps | Workflow description unclear | Add checklists (checkboxes) |
| Output format chaotic | Output specification unclear | Provide specific template examples |
| Responsibility overreach | Insufficient constraints | Clearly define prohibited actions |

### Workflow Handoff Issues

| Symptom | Possible Cause | Solution |
|---------|----------------|----------|
| Design document unclear | Missing transition from Solution to design | Add context input requirements for design Agent |
| Code does not match design | Design document not detailed enough | Output pseudo-code level details in design stage |
| Test cases incomplete coverage | Testing Agent lacks design input | Ensure testing Agent reads design documents |

### Deliverable Quality Issues

| Symptom | Possible Cause | Solution |
|---------|----------------|----------|
| PRD requirements vague | PM Agent did not fully explore requirements | Add multi-round dialogue confirmation |
| Solution lacks feasibility analysis | Technical constraints not identified | Add technical feasibility checkpoints |
| Design document too complex | Not following simple design principles | Split modules, design in phases |

## 4. Provide Solutions

For identified problems, provide:
1. **Immediate Solution** - Actions that can be taken immediately
2. **Long-term Improvement** - Mechanisms to prevent similar issues
3. **Files to Modify** - Specific configurations or documents to adjust

## 5. Execute Fixes (Optional)

If user agrees, execute fixes:
- Use `agent-optimize` to adjust Agent prompts
- Use `skill-develop` to create new check Skills
- Update related deliverable templates

# Diagnostic Checklist

Standard checklist items when analyzing problems:

- [ ] Problem stage accurately identified
- [ ] Related deliverables have been read
- [ ] Root cause analysis is well-founded
- [ ] Solutions are specific and feasible
- [ ] Long-term prevention measures considered

# Common Diagnostic Scenarios

## Scenario 1: Agent Output Does Not Meet Expectations

**Diagnostic Steps:**
1. Read the corresponding Agent file
2. Check if description contains trigger scenarios
3. Check if workflow has checklists
4. Check if constraints are clear

**Fix Solutions:**
- Optimize Agent prompts (call `agent-optimize`)
- Add example outputs
- Clearly define prohibited actions

## Scenario 2: Workflow Loops at a Certain Stage

**Diagnostic Steps:**
1. Check if previous stage deliverables are complete
2. Check if current stage input requirements are clear
3. Check if deliverable standards are too high or vague

**Fix Solutions:**
- Adjust deliverable acceptance standards
- Add intermediate checkpoints
- Split overly long workflow steps

## Scenario 3: Multiple Agent Responsibility Conflicts

**Diagnostic Steps:**
1. Compare responsibility descriptions of related Agents
2. Check for overlaps (what can/cannot be done)
3. Check deliverable definitions at handoff points

**Fix Solutions:**
- Redefine responsibility boundaries
- Clarify deliverable handoff standards
- Add dedicated handoff Agent

# Verification Checklist

- [ ] Problem root cause identified
- [ ] Solutions provided
- [ ] User understands and agrees with solution
- [ ] If fixes needed, fixes completed

# Output Format

```
## Workflow Diagnostic Report

### Problem Description
[User described problem]

### Root Cause Analysis
[Analyzed root cause]

### Solutions
1. **Immediate Measures**: [What can be done immediately]
2. **Long-term Improvement**: [Prevention mechanism]

### Files to Modify
- [File path] - [Modification content]

### Recommendations
[Next step action recommendations]
```
