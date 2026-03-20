# {{platform_name}} Data Conventions

> Platform: {{platform_id}}  
> Generated: {{generated_at}}

## Overview

This document defines data layer conventions for the {{platform_name}} platform.

## Data Technology Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
{{#each data_technologies}}
| {{component}} | {{technology}} | {{version}} | {{purpose}} |
{{/each}}

## ORM/Database Tool Configuration

{{orm_configuration}}

## Data Modeling Conventions

### Entity/Model Naming

| Type | Pattern | Example |
|------|---------|---------|
{{#each entity_naming}}
| {{type}} | {{pattern}} | {{example}} |
{{/each}}

### Field/Property Naming

{{field_naming}}

### Relationship Naming

{{relationship_naming}}

## Database Schema Conventions

### Table Naming

{{table_naming}}

### Column Naming

{{column_naming}}

### Index Naming

{{index_naming}}

## Migration Patterns

{{migration_patterns}}

## Query Patterns

{{query_patterns}}

## Caching Strategies

{{caching_strategies}}

## Data Validation

{{data_validation}}

## Security Considerations

{{data_security}}

## Best Practices

{{#each data_best_practices}}
- {{this}}
{{/each}}
