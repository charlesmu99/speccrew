## Mermaid Usage Guidelines (Compatibility-First Version)

### 1. Basic Syntax Principles

| Rule | Correct Example | Incorrect Example |
|------|-----------------|-------------------|
| **Use only basic node definitions** | `A[text content]` | `A["[quoted text]"]` |
| **Avoid HTML tags** | `A[use short phrases for multi-line text]` | `A[first line<br/>second line]` |
| **No nested subgraphs** | Single-layer subgraph or none | `subgraph A { subgraph B { } }` |
| **No direction keyword** | Rely on graph default direction | `subgraph X { direction TB }` |
| **No style styling** | Plain text nodes | `style A fill:#color` |

### 2. Recommended Syntax Structure

```mermaid
graph TB
    %% Basic node definitions
    A[User Authentication Module]
    B[Agent Management]
    C[Knowledge Base Management]
    
    %% Connections (three types)
    A --> B           %% Solid arrow
    A -.-> C          %% Dashed arrow
    B ==> C           %% Thick arrow (if needed)
    
    %% Simple subgraph (optional)
    subgraph Core Modules
        B
        C
    end
```

### 3. Node Naming Conventions

| Scenario | Naming Convention | Example |
|----------|-------------------|---------|
| Module nodes | Uppercase letter abbreviation | `AM[Agent Management]` |
| Function nodes | R+number prefix | `R1[Lifecycle Management]` |
| Dependency nodes | D+number prefix | `D1[Knowledge Base Module]` |
| External nodes | U+number prefix | `U1[Frontend Interface]` |

### 4. Prohibited Syntax

```
❌ Prohibited:
- <br/> line break tags
- Nested subgraphs
- direction keyword
- style color definitions
- classDef / class
- erDiagram syntax
- flowchart instead of graph
- mindmap syntax (compatibility issues)
- Quoted node text ["text"]
- Special characters: @ # < > & [ ] / ( ) etc.
```

**Special Character Handling:**
| Character | Source | Fix |
|-----------|--------|-----|
| `@` | Java annotations (`@RestController`) | Remove `@` prefix: `RestController` |
| `#` | Markdown headers | Spell out or omit |
| `<` `>` | Generics (`List<String>`) | Use parentheses: `List(String)` |
| `&` | HTML entities | Spell out: `and` |
| `[` `]` | Array index (`arr[0]`) | Use parentheses or omit: `arr(0)` or `arr0` |
| `/` | File paths (`/pages/index`) | Remove leading `/` or use parentheses: `pages/index` |
| `(` `)` | Function calls (`handleQuery()`) | Remove parentheses: `handleQuery` |

### 5. Multi-line Text Handling

```
❌ Not recommended:
A[first line<br/>second line]

✅ Recommended:
A[short title]
A1[detailed description as separate node]
A --> A1
```

### 6. Diagram Type Selection

| Type | Compatibility | Use Case |
|------|---------------|----------|
| `graph TB/LR` | ⭐⭐⭐ Highest | Architecture diagrams, dependency graphs |
| `sequenceDiagram` | ⭐⭐ Medium | Sequence diagrams (avoid complex syntax) |
| `erDiagram` | ⭐ Low | Avoid use, use graph TB instead |
| `flowchart` | ⭐ Low | Avoid use, use graph instead |
| `mindmap` | ❌ Prohibited | Use graph TB/LR instead (compatibility issues) |

### 7. Validation Checklist

After generating Mermaid diagrams, check:
- [ ] No `<br/>` tags
- [ ] No `style` definitions
- [ ] No nested `subgraph`
- [ ] No `direction` keyword
- [ ] No special symbols in node text
- [ ] Use standard `graph TB/LR` syntax

### 8. Quick Fix Script (Reference)

For batch fixes, replace the following patterns:
```regex
Find: \[([^]]+)<br/>([^]]+)\]
Replace: [$1 - $2]

Find: style \w+ fill:#[\w]+
Replace: (delete this line)

Find: direction (TB|LR|RL|BT)
Replace: (delete this line)
```