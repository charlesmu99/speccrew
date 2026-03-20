# {{platform_name}} Development Conventions

> Platform: {{platform_id}}  
> Generated: {{generated_at}}

## Overview

This document defines coding standards and conventions for development on the {{platform_name}} Express.js backend platform.

## Naming Conventions

### Files

| Type | Pattern | Example |
|------|---------|---------|
{{#each file_naming}}
| {{type}} | {{pattern}} | {{example}} |
{{/each}}
| Routes | `*.routes.js` | `user.routes.js` |
| Controllers | `*.controller.js` | `user.controller.js` |
| Services | `*.service.js` | `user.service.js` |
| Middlewares | `*.middleware.js` | `auth.middleware.js` |
| Models | `*.model.js` | `user.model.js` |
| Validations | `*.validation.js` | `user.validation.js` |
| Utils | `*.util.js` or `*.helper.js` | `date.util.js` |
| Config | `*.config.js` | `database.config.js` |
| Tests | `*.test.js` or `*.spec.js` | `user.test.js` |

### Variables & Functions

| Type | Pattern | Example |
|------|---------|---------|
{{#each naming_conventions}}
| {{type}} | {{pattern}} | {{example}} |
{{/each}}
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Environment Variables | UPPER_SNAKE_CASE | `DATABASE_URL` |
| Route handlers | camelCase | `getUserById` |
| Middleware functions | camelCase | `authenticateUser` |
| Service methods | camelCase | `createUser` |
| Private functions | _camelCase (prefix) | `_validateInput` |

### Classes & Types

| Type | Pattern | Example |
|------|---------|---------|
{{#each class_naming}}
| {{type}} | {{pattern}} | {{example}} |
{{/each}}
| Error Classes | PascalCase + Error suffix | `ValidationError` |
| Service Classes | PascalCase + Service suffix | `UserService` |
| Model Classes | PascalCase | `User` |

## Directory Structure

```
{{directory_structure}}
```

### Express Project Structure

```
project-root/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.js
│   │   ├── env.js
│   │   ├── logger.js
│   │   └── swagger.js
│   ├── controllers/         # Route controllers
│   │   ├── user.controller.js
│   │   ├── auth.controller.js
│   │   └── index.js
│   ├── middlewares/         # Custom middlewares
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   ├── validation.middleware.js
│   │   └── rateLimit.middleware.js
│   ├── models/              # Database models
│   │   ├── user.model.js
│   │   ├── index.js
│   │   └── schemas/         # Sub-schemas
│   ├── routes/              # Route definitions
│   │   ├── index.js         # Route aggregator
│   │   ├── user.routes.js
│   │   └── auth.routes.js
│   ├── services/            # Business logic layer
│   │   ├── user.service.js
│   │   ├── auth.service.js
│   │   └── index.js
│   ├── repositories/        # Data access layer (optional)
│   │   ├── user.repository.js
│   │   └── index.js
│   ├── utils/               # Utility functions
│   │   ├── helpers.js
│   │   ├── constants.js
│   │   ├── asyncHandler.js
│   │   └── apiResponse.js
│   ├── validations/         # Input validations
│   │   ├── user.validation.js
│   │   └── auth.validation.js
│   ├── errors/              # Custom error classes
│   │   ├── AppError.js
│   │   └── index.js
│   ├── app.js               # Express app configuration
│   └── server.js            # Server entry point
├── tests/                   # Test files
│   ├── unit/
│   ├── integration/
│   └── setup.js
├── docs/                    # Documentation
├── scripts/                 # Build/deployment scripts
├── .env                     # Environment variables
├── .env.example             # Environment template
├── .eslintrc.js             # ESLint configuration
├── .prettierrc              # Prettier configuration
├── jest.config.js           # Jest configuration
└── package.json
```

## Code Style

### Formatting Rules

{{#each formatting_rules}}
- **{{name}}**: {{value}}
{{/each}}

### Express-Specific Style Rules

- Use 2 spaces for indentation
- Use single quotes for strings
- Always use semicolons
- Maximum line length: 100 characters
- Trailing commas in objects and arrays

### ESLint Rules

{{#each eslint_rules}}
- `{{rule}}`: {{setting}} - {{description}}
{{/each}}

### Recommended ESLint Config for Express

```javascript
// .eslintrc.js
module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: ['eslint:recommended', 'plugin:node/recommended'],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    'no-console': 'warn',
    'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'prefer-const': 'error',
    'no-var': 'error',
    'object-shorthand': 'error',
    'prefer-template': 'error'
  }
};
```

## Import Organization

### Import Order

```javascript
// 1. Built-in modules
const path = require('path');
const fs = require('fs');

// 2. External packages
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// 3. Internal modules (alphabetical)
const config = require('./config/env');
const logger = require('./config/logger');

// 4. Local modules (relative paths, alphabetical)
const userController = require('./controllers/user.controller');
const authMiddleware = require('./middlewares/auth.middleware');
```

### Import Patterns

```javascript
// ✅ Preferred: Destructuring when needed
const { Router } = require('express');
const { body, validationResult } = require('express-validator');

// ✅ Preferred: Named imports from local modules
const { authenticate, authorize } = require('./middlewares/auth.middleware');

// ✅ Preferred: Index file exports
const controllers = require('./controllers');
const { userController, authController } = controllers;
```

## Route Naming

### RESTful Route Naming

| Action | HTTP Method | Route | Controller Method |
|--------|-------------|-------|-------------------|
| List | GET | `/resources` | `getAll` or `list` |
| Get One | GET | `/resources/:id` | `getById` or `getOne` |
| Create | POST | `/resources` | `create` |
| Update | PUT | `/resources/:id` | `update` |
| Partial Update | PATCH | `/resources/:id` | `patch` |
| Delete | DELETE | `/resources/:id` | `delete` or `remove` |

### Route Naming Examples

```javascript
// ✅ Good: Clear and consistent
router.get('/users', userController.getAll);
router.get('/users/:id', userController.getById);
router.post('/users', userController.create);
router.put('/users/:id', userController.update);
router.delete('/users/:id', userController.delete);

// ✅ Good: Nested resources
router.get('/users/:userId/orders', orderController.getUserOrders);
router.post('/users/:userId/orders', orderController.createUserOrder);

// ✅ Good: Actions
router.post('/users/:id/activate', userController.activate);
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);
```

## Middleware Ordering

### Correct Middleware Order

```javascript
// 1. Security middleware (first)
app.use(helmet());
app.use(cors(corsOptions));

// 2. Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 3. Request logging
app.use(morgan('combined', { stream: logger.stream }));

// 4. Request ID (for tracing)
app.use((req, res, next) => {
  req.id = uuidv4();
  next();
});

// 5. Rate limiting
app.use(rateLimiter);

// 6. Static files (if needed)
app.use('/uploads', express.static('uploads'));

// 7. API routes
app.use('/api/v1', routes);

// 8. 404 handler
app.use(notFoundHandler);

// 9. Error handler (last)
app.use(errorHandler);
```

## Git Conventions

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
{{#each commit_types}}
- `{{type}}`: {{description}}
{{/each}}

### Express-Specific Commit Types

- `feat`: New feature or endpoint
- `fix`: Bug fix
- `refactor`: Code refactoring
- `perf`: Performance improvement
- `security`: Security-related changes
- `api`: API changes
- `db`: Database-related changes
- `middleware`: Middleware changes
- `route`: Route changes
- `test`: Adding or updating tests
- `docs`: Documentation updates

### Commit Message Examples

```
feat(auth): add JWT authentication middleware

Implement JWT-based authentication with refresh token support.
Includes:
- Login/logout endpoints
- Token refresh mechanism
- Auth middleware for protected routes

fix(users): correct pagination in getAll endpoint

Fix offset calculation error that caused duplicate results.
Closes #123
```

### Branch Naming

{{branch_naming}}

### Express Branch Naming Convention

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/<description>` | `feature/user-authentication` |
| Bugfix | `fix/<description>` | `fix/login-validation` |
| Hotfix | `hotfix/<description>` | `hotfix/security-patch` |
| Release | `release/<version>` | `release/v1.2.0` |
| API | `api/<description>` | `api/user-endpoints` |

## Code Review Checklist

- [ ] Code follows naming conventions
- [ ] Code follows style guidelines
- [ ] No console.log or debug code left
- [ ] Error handling is comprehensive
- [ ] Input validation is implemented
- [ ] Tests are included
- [ ] Documentation is updated
- [ ] No sensitive data in code
- [ ] Proper HTTP status codes used
- [ ] Async/await used correctly
- [ ] No memory leaks in closures
- [ ] Rate limiting considered
- [ ] Security headers configured

## Common Patterns

{{#each common_patterns}}
### {{name}}

{{description}}

```{{language}}
{{code_example}}
```

{{/each}}

### Express Common Patterns

#### Async Route Handler

```javascript
// utils/asyncHandler.js
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Usage
router.get('/users', asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json({ success: true, data: users });
}));
```

#### Standardized Response Helper

```javascript
// utils/apiResponse.js
class ApiResponse {
  static success(res, data, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      data
    });
  }

  static error(res, message, statusCode = 500, details = null) {
    return res.status(statusCode).json({
      success: false,
      error: {
        message,
        ...(details && { details })
      }
    });
  }

  static paginated(res, data, pagination) {
    return res.json({
      success: true,
      data,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: Math.ceil(pagination.total / pagination.limit)
      }
    });
  }
}

module.exports = ApiResponse;
```

#### Environment Configuration

```javascript
// config/env.js
require('dotenv').config();

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT) || 3000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
  
  isDevelopment() {
    return this.NODE_ENV === 'development';
  },
  
  isProduction() {
    return this.NODE_ENV === 'production';
  }
};

module.exports = env;
```

#### Logger Configuration

```javascript
// config/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

module.exports = logger;
```
