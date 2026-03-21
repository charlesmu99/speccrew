# {{platform_name}} Architecture Conventions

> Platform: {{platform_id}}  
> Framework: React {{react_version}}  
> Generated: {{generated_at}}

## Overview

This document defines React-specific architecture patterns and conventions.

## Component Architecture

### Component Types

| Type | Purpose | Example |
|------|---------|---------|
| **Page Components** | Route-level pages | `UserProfilePage.tsx` |
| **Container Components** | Data fetching & logic | `UserProfileContainer.tsx` |
| **Presentational Components** | Pure UI rendering | `UserCard.tsx` |
| **Layout Components** | Page layout structure | `MainLayout.tsx` |
| **UI Components** | Reusable atomic components | `Button.tsx`, `Input.tsx` |

### Component Organization

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Atomic components (Button, Input)
│   ├── forms/           # Form-specific components
│   └── layout/          # Layout components
├── pages/               # Page components (route-level)
├── containers/          # Container components (data logic)
├── hooks/               # Custom React hooks
├── stores/              # State management (Zustand/Redux)
├── services/            # API services
└── utils/               # Utility functions
```

## Hooks Patterns

### Custom Hooks Naming
- Prefix with `use`: `useAuth`, `useFetch`
- One responsibility per hook
- Return object or array consistently

### Built-in Hooks Usage

| Hook | Use Case | Avoid |
|------|----------|-------|
| `useState` | Local component state | Complex state logic (use useReducer) |
| `useEffect` | Side effects, subscriptions | Synchronous calculations |
| `useContext` | Global/shared state | Deep prop drilling only |
| `useReducer` | Complex state logic | Simple boolean toggles |
| `useMemo` | Expensive calculations | Cheap calculations |
| `useCallback` | Function memoization | Functions passed to DOM elements |

## State Management

### State Location Decision Tree

```
Is this state used by multiple components?
├── No → useState in component
└── Yes → Is it global app state?
    ├── No → Lift to common parent + props
    └── Yes → Use global store (Zustand/Redux)
```

### Recommended Stores

| Store Type | Library | Use Case |
|------------|---------|----------|
| Global State | Zustand | App-wide state (auth, theme) |
| Server State | React Query | API data, caching |
| Form State | React Hook Form | Form handling |

## Data Flow

### Props Drilling Prevention
- Use Context for theme/auth data
- Use composition to avoid deep nesting
- Use state management for cross-cutting concerns

### Event Handling
- Pass callbacks via props: `onClick`, `onSubmit`
- Use custom events for complex interactions
- Lift state up for shared data

## Routing

### Route Organization
- Use React Router v6
- Define routes in centralized config
- Lazy load page components

```typescript
// routes.tsx
const routes = [
  { path: '/', element: lazy(() => import('./pages/Home')) },
  { path: '/users/:id', element: lazy(() => import('./pages/UserDetail')) },
];
```

## Performance Patterns

### Memoization Strategy
- `React.memo` for pure components
- `useMemo` for expensive calculations
- `useCallback` for callback props to memoized children

### Code Splitting
- Route-level lazy loading
- Component-level dynamic imports for heavy features

## Anti-Patterns

- ❌ Prop drilling more than 2 levels
- ❌ useEffect without dependency array
- ❌ Inline object/array in useEffect deps
- ❌ setState in render (infinite loops)
- ❌ Direct DOM manipulation

## Best Practices

- ✅ Keep components small (< 200 lines)
- ✅ Use TypeScript for type safety
- ✅ Colocate related files (component + styles + tests)
- ✅ Use ESLint React hooks rules
