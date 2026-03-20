# {{platform_name}} Design Conventions

> Platform: {{platform_id}}  
> Generated: {{generated_at}}

## Overview

This document provides design principles and patterns for detailed design work on the {{platform_name}} Angular platform.

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

### Angular-Specific Principles

**Single Responsibility:**
- One component per file
- One service per responsibility
- Small, focused methods

**Immutability:**
- Use readonly properties
- Avoid mutating inputs
- Return new objects/arrays

## Component Design Patterns

### Input/Output Decorators

{{input_output_patterns}}

**@Input() Best Practices:**
```typescript
@Component({
  selector: 'app-user-card',
  standalone: true,
  template: `
    <div class="user-card">
      <h3>{{ user()?.name }}</h3>
      <p>{{ user()?.email }}</p>
    </div>
  `
})
export class UserCardComponent {
  // Using signals (Angular 16+)
  user = input<User>();
  
  // Traditional with required
  @Input({ required: true }) userId!: string;
  
  // With transform
  @Input({ transform: booleanAttribute }) isActive = false;
}
```

**@Output() Best Practices:**
```typescript
@Component({
  selector: 'app-user-form'
})
export class UserFormComponent {
  // Using output() function (Angular 16+)
  save = output<User>();
  cancel = output<void>();
  
  // Traditional
  @Output() delete = new EventEmitter<string>();
}
```

### Content Projection (ng-content)

{{content_projection_patterns}}

```typescript
@Component({
  selector: 'app-card',
  template: `
    <div class="card">
      <div class="card-header">
        <ng-content select="[cardHeader]"></ng-content>
      </div>
      <div class="card-body">
        <ng-content></ng-content>
      </div>
      <div class="card-footer">
        <ng-content select="[cardFooter]"></ng-content>
      </div>
    </div>
  `
})
export class CardComponent { }
```

### ViewChild/ContentChild Patterns

{{viewchild_patterns}}

## Service Design

### Service Responsibilities

{{service_design}}

**Data Service Pattern:**
```typescript
@Injectable({ providedIn: 'root' })
export class UserDataService {
  private http = inject(HttpClient);
  private cache = new Map<string, User>();
  
  getUser(id: string): Observable<User> {
    if (this.cache.has(id)) {
      return of(this.cache.get(id)!);
    }
    return this.http.get<User>(`/api/users/${id}`).pipe(
      tap(user => this.cache.set(id, user))
    );
  }
}
```

**State Service Pattern:**
```typescript
@Injectable({ providedIn: 'root' })
export class UserStateService {
  private users = signal<User[]>([]);
  private loading = signal(false);
  
  readonly allUsers = computed(() => this.users());
  readonly isLoading = computed(() => this.loading());
  
  setUsers(users: User[]) {
    this.users.set(users);
  }
}
```

## Observable Patterns

### RxJS Best Practices

{{rxjs_patterns}}

**Subscription Management:**
```typescript
@Component({
  selector: 'app-user-list'
})
export class UserListComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  
  ngOnInit() {
    this.userService.getUsers().pipe(
      takeUntil(this.destroy$)
    ).subscribe(users => {
      this.users = users;
    });
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

**Async Pipe (Preferred):**
```typescript
@Component({
  template: `
    @if (users$ | async; as users) {
      @for (user of users; track user.id) {
        <app-user-card [user]="user" />
      }
    } @else {
      <app-loading />
    }
  `
})
export class UserListComponent {
  users$ = this.userService.getUsers();
}
```

### Operator Selection

{{operator_selection}}

| Scenario | Recommended Operator |
|----------|---------------------|
| HTTP requests | `switchMap` |
| Search/debounce | `debounceTime` + `distinctUntilChanged` |
| Error recovery | `catchError` |
| Side effects | `tap` |
| Data transformation | `map` |
| Multiple streams | `combineLatest` |

## Data Flow Design

### Unidirectional Data Flow

{{data_flow_design}}

```
Parent Component
    ↓ (Input binding)
Child Component
    ↓ (User interaction)
Event emitted
    ↓ (Output binding)
Parent handles event
    ↓ (Updates state)
Parent re-renders
    ↓ (New inputs)
Child updates
```

## Template Design

### Control Flow Syntax (Angular 17+)

{{control_flow_patterns}}

```angular
@if (user(); as u) {
  <div class="user-profile">
    <h2>{{ u.name }}</h2>
    
    @switch (u.role) {
      @case ('admin') {
        <admin-panel />
      }
      @case ('user') {
        <user-panel />
      }
      @default {
        <guest-panel />
      }
    }
  </div>
} @else {
  <loading-spinner />
}

@for (item of items(); track item.id) {
  <list-item [item]="item" />
} @empty {
  <p>No items found</p>
}
```

### Template Reference Variables

{{template_reference_patterns}}

## Form Design

### Reactive Forms Pattern

{{form_design}}

```typescript
@Component({
  selector: 'app-user-form'
})
export class UserFormComponent {
  private fb = inject(FormBuilder);
  
  userForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    address: this.fb.group({
      street: [''],
      city: ['']
    })
  });
  
  onSubmit() {
    if (this.userForm.valid) {
      this.save.emit(this.userForm.value);
    }
  }
}
```

## Error Handling Design

{{error_handling_design}}

**Global Error Handler:**
```typescript
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: Error) {
    console.error('Global error:', error);
    // Report to monitoring service
  }
}
```

**Component-Level Error Handling:**
```typescript
users$ = this.userService.getUsers().pipe(
  catchError(error => {
    this.error.set(error.message);
    return of([]);
  })
);
```

## Performance Design

{{performance_design}}

- Use `OnPush` change detection
- Use `track` in `@for` loops
- Lazy load routes
- Use virtual scrolling for large lists
- Debounce user input
- Memoize expensive computations with `computed()`

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
