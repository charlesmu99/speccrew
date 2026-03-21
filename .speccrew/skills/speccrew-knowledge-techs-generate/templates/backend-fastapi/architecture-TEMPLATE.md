# {{platform_name}} Architecture Conventions

> Platform: {{platform_id}}  
> Framework: FastAPI {{fastapi_version}}  
> Generated: {{generated_at}}

## Overview

This document defines FastAPI-specific architecture patterns and conventions for building high-performance, type-safe Python APIs.

## Router Organization

### Router Structure

```
app/
├── routers/              # API route modules
│   ├── __init__.py
│   ├── users.py          # User-related endpoints
│   ├── items.py          # Item-related endpoints
│   └── auth.py           # Authentication endpoints
├── main.py               # Application entry point
└── dependencies.py       # Shared dependencies
```

### Router Registration Pattern

```python
# main.py
from fastapi import FastAPI
from app.routers import users, items, auth

app = FastAPI()

app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(items.router, prefix="/items", tags=["items"])
app.include_router(auth.router, prefix="/auth", tags=["authentication"])
```

### Router Module Template

```python
# routers/users.py
from fastapi import APIRouter, Depends, HTTPException
from typing import List

router = APIRouter()

@router.get("/", response_model=List[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List all users with pagination."""
    return await user_service.get_users(db, skip=skip, limit=limit)

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get a specific user by ID."""
    user = await user_service.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
```

## Dependency Injection System

### Dependency Types

| Type | Purpose | Example |
|------|---------|---------|
| **Database** | DB session management | `get_db()` |
| **Authentication** | Current user extraction | `get_current_user()` |
| **Services** | Business logic services | `get_user_service()` |
| **Config** | Application settings | `get_settings()` |

### Database Dependency Pattern

```python
# dependencies.py
from sqlalchemy.orm import Session
from app.database import SessionLocal

async def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### Authentication Dependency Pattern

```python
# dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    # Token validation logic
    return user
```

### Dependency Composition

```python
# Combining multiple dependencies
from fastapi import Depends

async def get_current_active_user(
    current_user: User = Depends(get_current_user)
):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user
```

## Async Route Handlers

### Async Pattern Guidelines

| Scenario | Pattern | Example |
|----------|---------|---------|
| **Database queries** | Use async ORM | `await db.execute(...)` |
| **External APIs** | Use `httpx.AsyncClient` | `await client.get(...)` |
| **File I/O** | Use `aiofiles` | `await aiofiles.open(...)` |
| **Background tasks** | Use `BackgroundTasks` | `background_tasks.add_task(...)` |

### Async Route Example

```python
from fastapi import APIRouter
import httpx

router = APIRouter()

@router.get("/external-data")
async def fetch_external_data():
    """Fetch data from external API asynchronously."""
    async with httpx.AsyncClient() as client:
        response = await client.get("https://api.example.com/data")
        return response.json()
```

### Background Tasks Pattern

```python
from fastapi import BackgroundTasks, APIRouter

router = APIRouter()

def send_email(email: str, message: str):
    # Email sending logic
    pass

@router.post("/send-notification")
async def send_notification(
    email: str,
    background_tasks: BackgroundTasks
):
    """Send notification asynchronously in background."""
    background_tasks.add_task(send_email, email, "Hello!")
    return {"message": "Notification queued"}
```

## Project Structure

### Recommended Directory Layout

```
project_root/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application instance
│   ├── config.py            # Configuration settings
│   ├── dependencies.py      # Shared dependencies
│   ├── database.py          # Database connection setup
│   ├── models/              # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── item.py
│   ├── schemas/             # Pydantic models (request/response)
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── item.py
│   ├── routers/             # API route handlers
│   │   ├── __init__.py
│   │   ├── users.py
│   │   └── items.py
│   ├── services/            # Business logic layer
│   │   ├── __init__.py
│   │   ├── user_service.py
│   │   └── item_service.py
│   ├── utils/               # Utility functions
│   │   ├── __init__.py
│   │   └── validators.py
│   └── exceptions.py        # Custom exceptions
├── tests/
│   ├── __init__.py
│   ├── conftest.py          # Pytest fixtures
│   ├── test_users.py
│   └── test_items.py
├── alembic/                 # Database migrations
├── requirements.txt         # Dependencies
└── Dockerfile
```

## Middleware Patterns

### Custom Middleware

```python
# middleware/logging.py
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
import time
import logging

logger = logging.getLogger(__name__)

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        response = await call_next(request)
        
        process_time = time.time() - start_time
        logger.info(
            f"{request.method} {request.url.path} - "
            f"{response.status_code} - {process_time:.3f}s"
        )
        
        return response
```

### CORS Middleware

```python
# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://example.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)
```

### Authentication Middleware

```python
# middleware/auth.py
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Skip auth for public paths
        if request.url.path in ["/docs", "/openapi.json", "/auth/login"]:
            return await call_next(request)
        
        # Verify authentication
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            raise HTTPException(status_code=401, detail="Missing auth token")
        
        return await call_next(request)
```

## Error Handling

### Global Exception Handlers

```python
# main.py
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

app = FastAPI()

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "detail": "Validation error",
            "errors": exc.errors()
        }
    )

@app.exception_handler(CustomBusinessException)
async def business_exception_handler(request: Request, exc: CustomBusinessException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.message}
    )
```

### HTTP Exception Patterns

```python
from fastapi import HTTPException, status

# Standard error responses
raise HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="Resource not found"
)

raise HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail="Insufficient permissions"
)

raise HTTPException(
    status_code=status.HTTP_409_CONFLICT,
    detail="Resource already exists"
)
```

## Performance Guidelines

### Response Caching

```python
from fastapi import APIRouter
from fastapi_cache.decorator import cache

router = APIRouter()

@router.get("/items")
@cache(expire=60)  # Cache for 60 seconds
async def get_items():
    return await expensive_query()
```

### Database Connection Pooling

```python
# database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = create_engine(
    DATABASE_URL,
    pool_size=20,
    max_overflow=0,
    pool_pre_ping=True
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

## Best Practices

- ✅ Use async/await for all I/O operations
- ✅ Leverage Pydantic for request/response validation
- ✅ Implement proper dependency injection
- ✅ Use type hints throughout the codebase
- ✅ Structure routes by resource/domain
- ✅ Keep business logic in services, not routers
- ✅ Use background tasks for non-critical operations
- ✅ Implement proper error handling with custom exceptions
- ✅ Use middleware for cross-cutting concerns
- ✅ Document all endpoints with docstrings

## Anti-Patterns

- ❌ Blocking I/O operations in async routes
- ❌ Business logic in route handlers
- ❌ Direct database access without dependency injection
- ❌ Synchronous database drivers (use asyncpg, aiomysql)
- ❌ Large try-except blocks without specific exceptions
- ❌ Returning raw ORM models (always use Pydantic schemas)
- ❌ Hardcoded configuration values
