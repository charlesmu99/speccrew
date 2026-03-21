# {{platform_name}} Development Conventions

> Platform: {{platform_id}}  
> Generated: {{generated_at}}

## Overview

This document defines coding standards and conventions for development on the {{platform_name}} Angular platform.

## File Naming Conventions

### Component Files

{{file_naming}}

| Type | Pattern | Example |
|------|---------|---------|
| Component | `*.component.ts` | `user-profile.component.ts` |
| Template | `*.component.html` | `user-profile.component.html` |
| Styles | `*.component.scss` | `user-profile.component.scss` |
| Spec | `*.component.spec.ts` | `user-profile.component.spec.ts` |
| Service | `*.service.ts` | `user.service.ts` |
| Module | `*.module.ts` | `user.module.ts` |
| Directive | `*.directive.ts` | `highlight.directive.ts` |
| Pipe | `*.pipe.ts` | `date-format.pipe.ts` |
| Guard | `*.guard.ts` | `auth.guard.ts` |
| Interceptor | `*.interceptor.ts` | `error.interceptor.ts` |
| Resolver | `*.resolver.ts` | `user.resolver.ts` |
| Model/Interface | `*.model.ts` or `*.types.ts` | `user.model.ts` |
| Enum | `*.enum.ts` | `user-role.enum.ts` |
| Config | `*.config.ts` | `app.config.ts` |
| Routes | `*.routes.ts` | `user.routes.ts` |

### File Organization

**Feature-Based Structure:**
```
users/
├── components/
│   ├── user-list/
│   │   ├── user-list.component.ts
│   │   ├── user-list.component.html
│   │   ├── user-list.component.scss
│   │   └── user-list.component.spec.ts
│   └── user-detail/
├── services/
│   └── user.service.ts
├── models/
│   └── user.model.ts
├── users.routes.ts
└── users.component.ts
```

## Class Naming Conventions

### PascalCase with Suffix

{{class_naming}}

| Type | Suffix | Example |
|------|--------|---------|
| Component | `Component` | `UserProfileComponent` |
| Service | `Service` | `UserService` |
| Directive | `Directive` | `HighlightDirective` |
| Pipe | `Pipe` | `DateFormatPipe` |
| Guard | `Guard` | `AuthGuard` |
| Interceptor | `Interceptor` | `ErrorInterceptor` |
| Module | `Module` | `UserModule` |
| Resolver | `Resolver` | `UserResolver` |
| Interface | Prefix `I` (optional) | `IUser` or `User` |
| Enum | None | `UserRole` |
| Abstract Class | Prefix `Abstract` | `AbstractBaseService` |

### Selector Naming

{{selector_naming}}

- Use `app-` prefix for application-wide components
- Use feature prefix for feature-specific components: `user-`, `admin-`
- Use kebab-case: `user-profile`, not `userProfile`

```typescript
@Component({
  selector: 'app-user-profile',  // Application component
  // or
  selector: 'user-card',         // Feature component
})
```

## Variable and Function Naming

### TypeScript Conventions

{{naming_conventions}}

| Type | Pattern | Example |
|------|---------|---------|
| Variables | camelCase | `currentUser`, `userList` |
| Constants | UPPER_SNAKE_CASE | `API_BASE_URL`, `MAX_RETRY` |
| Functions | camelCase | `getUserById()`, `handleSubmit()` |
| Private members | prefix `_` | `_privateVar` (optional) |
| Observables | suffix `$` | `users$`, `data$` |
| Signals | no suffix | `users()`, `count()` |
| Boolean | prefix `is`, `has`, `can` | `isLoading`, `hasError` |

## Import Organization

### Import Order

{{import_organization}}

```typescript
// 1. Angular core and common
import { Component, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// 2. Third-party libraries
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';

// 3. Application core
import { UserService } from '@core/services/user.service';
import { AuthGuard } from '@core/guards/auth.guard';

// 4. Shared modules
import { SharedModule } from '@shared/shared.module';
import { ButtonComponent } from '@shared/components/button.component';

// 5. Feature-specific
import { User } from './models/user.model';
import { UserComponent } from './user.component';
```

### Path Mapping

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "paths": {
      "@core/*": ["src/app/core/*"],
      "@shared/*": ["src/app/shared/*"],
      "@features/*": ["src/app/features/*"],
      "@env/*": ["src/environments/*"]
    }
  }
}
```

## Angular CLI Usage

### CLI Commands

{{cli_usage}}

| Task | Command |
|------|---------|
| New component | `ng generate component feature/component-name` |
| New service | `ng generate service feature/services/service-name` |
| New module | `ng generate module feature-name --routing` |
| New directive | `ng generate directive directive-name` |
| New pipe | `ng generate pipe pipe-name` |
| New guard | `ng generate guard guard-name` |
| New interceptor | `ng generate interceptor interceptor-name` |
| New library | `ng generate library library-name` |
| Build | `ng build --configuration production` |
| Test | `ng test --watch=false --browsers=ChromeHeadless` |
| Lint | `ng lint` |

### Schematics Configuration

**angular.json:**
```json
{
  "schematics": {
    "@schematics/angular:component": {
      "style": "scss",
      "standalone": true,
      "changeDetection": "OnPush"
    },
    "@schematics/angular:service": {
      "skipTests": false
    }
  }
}
```

## Code Style

### Formatting Rules

{{formatting_rules}}

- **Indentation**: 2 spaces
- **Quote**: Single quotes for strings
- **Semicolons**: Required
- **Trailing commas**: ES2017 compatible
- **Line length**: 100-120 characters
- **Braces**: Same line for opening brace

### ESLint Rules

{{eslint_rules}}

```json
{
  "extends": [
    "@angular-eslint/recommended",
    "@angular-eslint/template/process-inline-templates"
  ],
  "rules": {
    "@angular-eslint/component-class-suffix": "error",
    "@angular-eslint/directive-class-suffix": "error",
    "@angular-eslint/no-host-metadata-property": "error",
    "@angular-eslint/no-input-rename": "error",
    "@angular-eslint/no-output-native": "error",
    "@angular-eslint/use-lifecycle-interface": "error",
    "@angular-eslint/use-pipe-transform-interface": "error"
  }
}
```

### Prettier Configuration

```json
{
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "semi": true,
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

## Git Conventions

### Commit Message Format

{{git_conventions}}

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting) |
| `refactor` | Code refactoring |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `chore` | Build process or auxiliary tool changes |

**Scopes:**
- `core` - Core module changes
- `shared` - Shared module changes
- `feature/*` - Specific feature changes
- `component/*` - Specific component changes
- `service/*` - Service changes
- `config` - Configuration changes

**Examples:**
```
feat(user): add user profile component

- Implement user profile display
- Add edit functionality
- Include unit tests

fix(auth): resolve login redirect issue

docs(api): update API endpoint documentation
```

### Branch Naming

{{branch_naming}}

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/<ticket>-<description>` | `feature/PROJ-123-user-profile` |
| Bugfix | `fix/<ticket>-<description>` | `fix/PROJ-456-login-redirect` |
| Hotfix | `hotfix/<description>` | `hotfix/critical-auth-bug` |
| Release | `release/<version>` | `release/v2.1.0` |

## Code Review Checklist

- [ ] Code follows naming conventions
- [ ] Code follows style guidelines (ESLint/Prettier)
- [ ] No `console.log` or debug code left
- [ ] Error handling is comprehensive
- [ ] Memory leaks prevented (subscriptions cleaned up)
- [ ] Change detection strategy considered
- [ ] Unit tests are included
- [ ] Component is standalone (Angular 14+)
- [ ] Inputs use proper typing (required/transform)
- [ ] Documentation is updated
- [ ] No hardcoded values (use constants/config)
- [ ] Accessibility (a11y) considerations

## Common Patterns

{{#each common_patterns}}
### {{name}}

{{description}}

```typescript
{{code_example}}
```

{{/each}}

## Environment Configuration

### Environment Files

```
src/
└── environments/
    ├── environment.ts           # Development
    ├── environment.prod.ts      # Production
    └── environment.staging.ts   # Staging
```

**Usage:**
```typescript
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = environment.apiBaseUrl;
}
```
