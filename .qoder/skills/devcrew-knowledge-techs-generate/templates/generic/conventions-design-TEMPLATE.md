# {{platform_name}} Design Conventions

> Platform: {{platform_id}}  
> Generated: {{generated_at}}

## Overview

This document provides design principles and patterns for detailed design work on the {{platform_name}} platform.

## Design Principles

{{#each design_principles}}
### {{name}}

{{description}}

{{#if examples}}
**Examples:**
{{#each examples}}
- {{this}}
{{/each}}
{{/if}}

{{/each}}

## Component/Module Design Patterns

{{component_design_patterns}}

## Data Flow Design

{{data_flow_design}}

## Interface Design

{{interface_design}}

## State Design

{{state_design}}

## Error Handling Design

{{error_handling_design}}

## Security Design

{{security_design}}

## Performance Design

{{performance_design}}

## Design Checklist

Before finalizing design, verify:

{{#each design_checklist}}
- [ ] {{item}}
{{/each}}

## Common Design Scenarios

{{#each common_scenarios}}
### {{name}}

{{description}}

**Recommended Approach:**
{{approach}}

{{/each}}
