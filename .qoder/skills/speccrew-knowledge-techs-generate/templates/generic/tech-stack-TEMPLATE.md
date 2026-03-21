# {{platform_name}} Technology Stack

> Platform: {{platform_id}}  
> Generated: {{generated_at}}

## Overview

{{overview}}

## Core Technologies

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
{{#each core_technologies}}
| {{category}} | {{name}} | {{version}} | {{purpose}} |
{{/each}}

## Dependencies

### Production Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
{{#each production_dependencies}}
| {{name}} | {{version}} | {{purpose}} |
{{/each}}

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
{{#each development_dependencies}}
| {{name}} | {{version}} | {{purpose}} |
{{/each}}

## Build & Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
{{#each build_tools}}
| {{name}} | {{version}} | {{purpose}} |
{{/each}}

## Configuration Files

| File | Purpose |
|------|---------|
{{#each config_files}}
| [{{name}}]({{path}}) | {{purpose}} |
{{/each}}

## Package Scripts (if applicable)

{{#if package_scripts}}
| Script | Command | Purpose |
|--------|---------|---------|
{{#each package_scripts}}
| {{name}} | {{command}} | {{purpose}} |
{{/each}}
{{/if}}

## Environment Requirements

{{environment_requirements}}

## Notes

- Framework documentation: {{framework_docs_url}}
- Language documentation: {{language_docs_url}}
