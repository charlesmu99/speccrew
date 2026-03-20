# {{platform_name}} Architecture Conventions

> Platform: {{platform_id}}  
> Generated: {{generated_at}}

## Overview

This document defines the architecture patterns and conventions for the {{platform_name}} Express.js backend platform.

## Architecture Patterns

{{architecture_overview}}

### MVC Pattern

Express applications typically follow the MVC (Model-View-Controller) pattern or its variants:

- **Models**: Data layer (database schemas, ORM models)
- **Views**: Response templates (JSON responses for APIs)
- **Controllers**: Request handlers and business logic

### Layered Architecture

```
┌─────────────────────────────────────┐
│           Routes Layer              │
│    (URL routing & middleware)       │
├─────────────────────────────────────┤
│         Controllers Layer           │
│   (Request handling & validation)   │
├─────────────────────────────────────┤
│          Services Layer             │
│    (Business logic & workflows)     │
├─────────────────────────────────────┤
│        Data Access Layer            │
│    (Repositories & ORM models)      │
├─────────────────────────────────────┤
│         Database Layer              │
│    (Database connections)           │
└─────────────────────────────────────┘
```

## Route Organization

### Route Structure

```
src/
├── routes/
│   ├── index.js              # Route aggregator
│   ├── user.routes.js        # User-related routes
│   ├── auth.routes.js        # Authentication routes
│   └── api.routes.js         # API version aggregator
```

### Route Naming Conventions

| Pattern | Example | Description |
|---------|---------|-------------|
| RESTful | `GET /users` | Collection operations |
| RESTful | `GET /users/:id` | Single resource operations |
| Nested | `GET /users/:id/orders` | Sub-resource operations |
| Action | `POST /users/:id/activate` | Custom actions |

### Route Registration Pattern

```javascript
// routes/index.js
const express = require('express');
const router = express.Router();

const userRoutes = require('./user.routes');
const authRoutes = require('./auth.routes');

router.use('/users', userRoutes);
router.use('/auth', authRoutes);

module.exports = router;
```

## Middleware Patterns

### Middleware Categories

| Category | Purpose | Examples |
|----------|---------|----------|
| Application | Global middleware | cors, helmet, morgan |
| Router | Route-specific | authentication, authorization |
| Error | Error handling | errorHandler, notFound |
| Validation | Input validation | celebrate, express-validator |

### Middleware Ordering

```javascript
// Correct order
app.use(helmet());           // Security first
app.use(cors());             // CORS
app.use(express.json());     // Body parsing
app.use('/api', routes);     // Routes
app.use(errorHandler);       // Error handling last
```

### Custom Middleware Structure

```javascript
// middlewares/auth.middleware.js
const authMiddleware = (req, res, next) => {
  try {
    // Authentication logic
    const token = req.headers.authorization;
    const user = verifyToken(token);
    req.user = user;
    next();
  } catch (error) {
    next(error); // Pass to error handler
  }
};

module.exports = authMiddleware;
```

## Controller Structure

### Controller Pattern

```javascript
// controllers/user.controller.js
const userService = require('../services/user.service');

class UserController {
  async getAll(req, res, next) {
    try {
      const users = await userService.findAll();
      res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const user = await userService.findById(id);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UserController();
```

### Controller Responsibilities

- Extract and validate request data
- Call appropriate services
- Format and send responses
- Handle request-level errors
- **NOT** contain business logic

## Error Handling

### Error Handling Strategy

```javascript
// middlewares/error.middleware.js
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

module.exports = { AppError, errorHandler };
```

### Error Types

| Error Type | Status Code | Use Case |
|------------|-------------|----------|
| ValidationError | 400 | Invalid input data |
| UnauthorizedError | 401 | Authentication failed |
| ForbiddenError | 403 | Insufficient permissions |
| NotFoundError | 404 | Resource not found |
| ConflictError | 409 | Resource conflict |

## Directory Structure

```
src/
├── config/                   # Configuration files
│   ├── database.js
│   ├── env.js
│   └── logger.js
├── controllers/              # Route controllers
│   ├── user.controller.js
│   └── auth.controller.js
├── middlewares/              # Custom middlewares
│   ├── auth.middleware.js
│   ├── error.middleware.js
│   └── validation.middleware.js
├── models/                   # Database models
│   ├── user.model.js
│   └── index.js
├── routes/                   # Route definitions
│   ├── index.js
│   ├── user.routes.js
│   └── auth.routes.js
├── services/                 # Business logic
│   ├── user.service.js
│   └── auth.service.js
├── utils/                    # Utility functions
│   ├── helpers.js
│   └── constants.js
├── validations/              # Input validations
│   ├── user.validation.js
│   └── auth.validation.js
├── app.js                    # Express app setup
└── server.js                 # Server entry point
```

## Security Considerations

{{security_considerations}}

### Essential Security Middleware

- **helmet**: Security headers
- **cors**: Cross-origin resource sharing
- **express-rate-limit**: Rate limiting
- **express-mongo-sanitize**: NoSQL injection prevention
- **xss-clean**: XSS prevention

## Performance Guidelines

{{performance_guidelines}}

### Performance Best Practices

- Use compression middleware
- Implement caching strategies
- Use connection pooling for databases
- Implement pagination for list endpoints
- Use async/await for non-blocking operations

## Best Practices

{{#each best_practices}}
- {{this}}
{{/each}}

### Express-Specific Best Practices

- Use environment variables for configuration
- Implement centralized error handling
- Use async/await with try-catch in controllers
- Validate all inputs before processing
- Use proper HTTP status codes
- Implement request logging
- Use helmet for security headers
- Implement rate limiting

## Anti-Patterns to Avoid

{{#each anti_patterns}}
- {{this}}
{{/each}}

### Common Express Anti-Patterns

- Synchronous route handlers for I/O operations
- Storing sensitive data in JWT payload
- Not handling promise rejections
- Using `==` instead of `===`
- Not sanitizing user inputs
- Exposing stack traces in production
- Not implementing proper CORS configuration
