---
template_name: page-type-summary
description: Page type summary and classification template
output_file: page-types/page-type-summary.md
---

# Page Type Overview

<cite>
**Files Referenced in This Document**
{{source_files}}
</cite>

> **Target Audience**: devcrew-designer-{{platform_id}}, devcrew-dev-{{platform_id}}

## Analysis Methodology

Page types were identified through automated analysis of the source codebase:

1. **File Name Pattern Analysis**: Extracted naming conventions from `src/views/` and `src/pages/`
2. **Component Usage Analysis**: Identified dominant component patterns in each file group
3. **Content Pattern Recognition**: Scanned templates for functional keywords
4. **Route Configuration Analysis**: Reviewed router configuration for page organization

## Page Type Statistics

| Page Type | Detection Pattern | File Count | Percentage | Typical Files |
|-----------|-------------------|------------|------------|---------------|
{{page_type_statistics_table}}

## Naming Conventions Summary

| Page Type | Recommended Naming | Example |
|-----------|-------------------|---------|
{{naming_conventions_table}}

## New Page Selection Guide

When creating a new page, use this guide to select the appropriate page type:

| Business Scenario | Recommended Page Type | Reference Document |
|-------------------|----------------------|-------------------|
{{page_selection_guide_table}}

## Page Type Details

### Quick Reference

{{page_type_quick_reference}}

### Documentation Links

{{page_type_documentation_links}}

---

**Section Source**
{{section_source_files}}
