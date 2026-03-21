# {{platform_name}} Design Conventions

> Platform: {{platform_id}}  
> Generated: {{generated_at}}

## Overview

This document provides design principles and patterns for detailed design work on the {{platform_name}} Express.js backend platform.

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

### Express-Specific Design Principles

#### 1. Single Responsibility
Each middleware, controller, and service should have one clear responsibility.

```javascript
// ✅ Good: Single responsibility
const validateUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details });
  next();
};

// ❌ Bad: Multiple responsibilities
const handleUserRequest = (req, res) => {
  // Validation + Business logic + Database + Response
};
```

#### 2. Separation of Concerns
Keep routing, business logic, and data access in separate layers.

#### 3. Fail Fast
Validate inputs early and return errors immediately.

```javascript
// ✅ Good: Fail fast
if (!req.body.email) {
  return res.status(400).json({ error: 'Email is required' });
}

// ❌ Bad: Deep nesting
if (req.body) {
  if (req.body.email) {
    // ... more logic
  }
}
```

## Route Design Patterns

### RESTful API Design

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/resources` | List all resources |
| GET | `/resources/:id` | Get single resource |
| POST | `/resources` | Create new resource |
| PUT | `/resources/:id` | Full update |
| PATCH | `/resources/:id` | Partial update |
| DELETE | `/resources/:id` | Delete resource |

### Route Versioning

```javascript
// URL versioning
app.use('/api/v1/users', userRoutesV1);
app.use('/api/v2/users', userRoutesV2);

// Header versioning
app.use('/api/users', (req, res, next) => {
  const version = req.headers['api-version'];
  if (version === '2') return userRoutesV2(req, res, next);
  return userRoutesV1(req, res, next);
});
```

### Route Composition

```javascript
// routes/user.routes.js
const router = require('express').Router();
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { validateUser } = require('../validations/user.validation');
const userController = require('../controllers/user.controller');

router.get('/', authenticate, userController.getAll);
router.get('/:id', authenticate, userController.getById);
router.post('/', authenticate, authorize(['admin']), validateUser, userController.create);
router.put('/:id', authenticate, validateUser, userController.update);
router.delete('/:id', authenticate, authorize(['admin']), userController.delete);

module.exports = router;
```

## Middleware Design

### Middleware Composition Pattern

```javascript
// Chain multiple middlewares
const pipeline = [
  authenticate,
  authorize(['admin']),
  validateRequest,
  rateLimiter
];

router.post('/users', ...pipeline, userController.create);
```

### Reusable Middleware Factory

```javascript
// middlewares/authorize.js
const authorize = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

// Usage
router.post('/admin', authenticate, authorize(['admin']), handler);
```

## Request/Response Handling

### Standard Response Format

```javascript
// Success response
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}

// Error response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [ ... ]
  }
}
```

### Request Validation Pattern

```javascript
// validations/user.validation.js
const Joi = require('joi');

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  name: Joi.string().min(2).max(50)
});

const validateUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message,
        details: error.details
      }
    });
  }
  next();
};
```

## Error Handling Patterns

### Custom Error Classes

```javascript
// errors/AppError.js
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

module.exports = { AppError, ValidationError, NotFoundError };
```

### Async Error Handler

```javascript
// utils/asyncHandler.js
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Usage
router.get('/users', asyncHandler(async (req, res) => {
  const users = await User.find();
  res.json({ success: true, data: users });
}));
```

## Data Flow Design

{{data_flow_design}}

### Request Lifecycle

```
Request → Middleware → Route Handler → Controller → Service → Repository → Database
                                            ↓
Response ← Middleware ← Controller ← Service ← Repository ← Database
```

## Interface Design

{{interface_design}}

### API Contract Design

```javascript
/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Private
 * @query   {number} page - Page number
 * @query   {number} limit - Items per page
 * @query   {string} sort - Sort field
 * @returns {Object} Users list with pagination
 */
router.get('/users', authenticate, userController.getAll);
```

## Security Design

{{security_design}}

### Authentication Patterns

```javascript
// JWT Authentication
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) throw new UnauthorizedError('Token required');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    next(error);
  }
};
```

### Authorization Patterns

```javascript
// Role-based access control
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Permission-based access control
const checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user.permissions.includes(permission)) {
      return res.status(403).json({ error: 'Permission denied' });
    }
    next();
  };
};
```

## Performance Design

{{performance_design}}

### Caching Strategies

```javascript
// Route-level caching
const cache = require('../utils/cache');

router.get('/users', cache('5 minutes'), userController.getAll);

// Service-level caching
class UserService {
  async findById(id) {
    const cacheKey = `user:${id}`;
    let user = await cache.get(cacheKey);
    
    if (!user) {
      user = await User.findById(id);
      await cache.set(cacheKey, user, 300); // 5 minutes
    }
    
    return user;
  }
}
```

## Design Checklist

Before finalizing design, verify:

{{#each design_checklist}}
- [ ] {{item}}
{{/each}}

### Express-Specific Checklist

- [ ] Routes follow RESTful conventions
- [ ] Middleware order is correct
- [ ] Error handling covers all scenarios
- [ ] Input validation is implemented
- [ ] Authentication/Authorization is in place
- [ ] Response format is consistent
- [ ] Rate limiting is considered
- [ ] Logging is implemented
- [ ] Security headers are configured

## Common Design Scenarios

{{#each common_scenarios}}
### {{name}}

{{description}}

**Recommended Approach:**
{{approach}}

{{/each}}

### File Upload Handling

```javascript
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), (req, res) => {
  res.json({ success: true, file: req.file });
});
```

### WebSocket Integration

```javascript
const io = require('socket.io')(server);

io.use((socket, next) => {
  // Authentication middleware
  const token = socket.handshake.auth.token;
  // ... verify token
  next();
});

io.on('connection', (socket) => {
  socket.on('message', (data) => {
    // Handle message
  });
});
```
