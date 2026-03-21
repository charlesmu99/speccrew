# {{platform_name}} Architecture Conventions

> Platform: {{platform_id}}  
> Generated: {{generated_at}}

## Overview

This document defines the architecture patterns and conventions for the {{platform_name}} Angular platform.

## Module Architecture

### NgModules vs Standalone Components

{{module_architecture}}

**Standalone Components (Recommended for Angular 14+):**
```typescript
@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent { }
```

**Traditional NgModules:**
```typescript
@NgModule({
  declarations: [UserProfileComponent],
  imports: [CommonModule, ReactiveFormsModule],
  exports: [UserProfileComponent]
})
export class UserModule { }
```

### Feature Module Organization

{{feature_module_organization}}

| Module Type | Purpose | Example |
|-------------|---------|---------|
{{#each module_types}}
| {{type}} | {{purpose}} | {{example}} |
{{/each}}

## Component Architecture

### Component Types

{{component_architecture}}

**Smart/Container Components:**
- Handle business logic
- Interact with services
- Pass data to presentational components

**Presentational/Dumb Components:**
- Receive data via @Input()
- Emit events via @Output()
- No direct service dependencies

### Component Lifecycle

{{lifecycle_patterns}}

## Services and Dependency Injection

### Service Patterns

{{service_patterns}}

**Singleton Services:**
```typescript
@Injectable({
  providedIn: 'root'
})
export class UserService { }
```

**Feature-Scoped Services:**
```typescript
@Injectable()
export class FeatureService { }

@NgModule({
  providers: [FeatureService]
})
export class FeatureModule { }
```

### Injection Token Pattern

{{injection_token_pattern}}

## Directory Structure

```
{{directory_structure}}
```

### Recommended Structure

```
src/
├── app/
│   ├── core/                    # Singleton services, guards, interceptors
│   │   ├── services/
│   │   ├── guards/
│   │   ├── interceptors/
│   │   └── core.config.ts
│   ├── shared/                  # Shared modules, components, pipes, directives
│   │   ├── components/
│   │   ├── directives/
│   │   ├── pipes/
│   │   └── shared.module.ts
│   ├── features/                # Feature modules
│   │   ├── users/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── models/
│   │   │   ├── users.routes.ts
│   │   │   └── users.component.ts
│   │   └── orders/
│   ├── layouts/                 # Layout components
│   └── app.config.ts           # App-level configuration
├── assets/
├── environments/
└── styles/
```

## Routing Patterns

### Route Configuration

{{routing_patterns}}

**Lazy Loading:**
```typescript
export const routes: Routes = [
  {
    path: 'users',
    loadComponent: () => import('./features/users/users.component')
      .then(m => m.UsersComponent)
  },
  {
    path: 'orders',
    loadChildren: () => import('./features/orders/orders.routes')
      .then(m => m.ORDERS_ROUTES)
  }
];
```

### Route Guards

{{route_guards}}

## State Management

### NgRx Store (if used)

{{ngrx_patterns}}

**Store Structure:**
```
state/
├── actions/
├── reducers/
├── selectors/
├── effects/
└── models/
```

### Angular Signals (Angular 16+)

{{signals_patterns}}

```typescript
export class UserStore {
  private users = signal<User[]>([]);
  readonly allUsers = this.users.asReadonly();
  
  addUser(user: User) {
    this.users.update(users => [...users, user]);
  }
}
```

### Component State

{{component_state_patterns}}

## HTTP/API Integration

### HttpClient Patterns

{{http_patterns}}

**Service Implementation:**
```typescript
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = '/api';
  
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/users`);
  }
}
```

### Interceptors

{{interceptor_patterns}}

## Change Detection Strategy

{{change_detection}}

**OnPush Strategy (Recommended):**
```typescript
@Component({
  selector: 'app-user-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})
export class UserListComponent { }
```

## Best Practices

{{#each best_practices}}
- {{this}}
{{/each}}

## Anti-Patterns to Avoid

{{#each anti_patterns}}
- {{this}}
{{/each}}
