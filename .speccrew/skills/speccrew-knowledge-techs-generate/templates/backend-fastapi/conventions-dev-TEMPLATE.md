# {{platform_name}} Development Conventions

> Platform: {{platform_id}}  
> Framework: FastAPI {{fastapi_version}}  
> Generated: {{generated_at}}

## Overview

This document defines coding standards and conventions for FastAPI/Python development on the {{platform_name}} platform.

## Python Naming Conventions (PEP 8)

### Files and Modules

| Type | Pattern | Example |
|------|---------|---------|
| **Modules** | snake_case | `user_service.py`, `auth_middleware.py` |
| **Packages** | lowercase, short | `routers`, `services`, `utils` |
| **Test Files** | test_*.py or *_test.py | `test_users.py`, `auth_test.py` |
| **Config Files** | lowercase | `config.py`, `settings.py` |

### Variables and Functions

| Type | Pattern | Example |
|------|---------|---------|
| **Variables** | snake_case | `user_count`, `is_active` |
| **Constants** | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT` |
| **Functions** | snake_case | `get_user()`, `validate_email()` |
| **Private Functions** | _leading_underscore | `_internal_helper()` |
| **Async Functions** | snake_case with async | `async def fetch_data()` |

### Classes and Types

| Type | Pattern | Example |
|------|---------|---------|
| **Classes** | PascalCase | `UserService`, `DatabaseConfig` |
| **Exceptions** | PascalCase + Error suffix | `ValidationError`, `NotFoundError` |
| **Type Variables** | PascalCase, short | `T`, `ModelType`, `ResponseT` |
| **Pydantic Models** | PascalCase | `UserCreate`, `ItemResponse` |

### FastAPI-Specific Naming

| Type | Pattern | Example |
|------|---------|---------|
| **Router Variables** | lowercase + _router | `users_router`, `auth_router` |
| **Dependency Functions** | get_ prefix | `get_db()`, `get_current_user()` |
| **Settings Classes** | Config/Settings suffix | `AppSettings`, `DatabaseConfig` |
| **Enum Classes** | PascalCase | `UserRole`, `OrderStatus` |

## File Organization

### Directory Structure

```
app/
├── __init__.py
├── main.py                    # Application entry point
├── config.py                  # Configuration settings
├── dependencies.py            # Shared FastAPI dependencies
├── database.py                # Database connection setup
├── exceptions.py              # Custom exception classes
├── middleware/                # Custom middleware
│   ├── __init__.py
│   ├── auth.py
│   └── logging.py
├── models/                    # SQLAlchemy ORM models
│   ├── __init__.py
│   ├── base.py               # Base model class
│   ├── user.py
│   └── item.py
├── schemas/                   # Pydantic models
│   ├── __init__.py
│   ├── base.py               # Shared schema base classes
│   ├── request/              # Request schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   └── item.py
│   └── response/             # Response schemas
│       ├── __init__.py
│       ├── user.py
│       └── item.py
├── routers/                   # API route handlers
│   ├── __init__.py
│   ├── users.py
│   ├── items.py
│   └── auth.py
├── services/                  # Business logic layer
│   ├── __init__.py
│   ├── user_service.py
│   └── item_service.py
└── utils/                     # Utility functions
    ├── __init__.py
    ├── validators.py
    ├── security.py
    └── helpers.py
```

### Import Organization

Imports should be organized in the following order with blank lines between groups:

```python
# 1. Standard library imports
import os
import sys
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any

# 2. Third-party imports
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, Field, validator
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import Session

# 3. Local application imports
from app.config import settings
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.services.user_service import UserService
from app.utils.security import hash_password
```

### Import Style Guidelines

```python
# ✅ Preferred: Explicit imports
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse

# ❌ Avoid: Wildcard imports
from app.models.user import *

# ✅ Preferred: Import modules for heavy usage
from app import services
user = services.user_service.get_user()

# ✅ Preferred: Type imports with TYPE_CHECKING
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from sqlalchemy.orm import Session
```

## Type Hints Usage

### Function Type Hints

```python
from typing import Optional, List, Dict, Any, Tuple
from sqlalchemy.orm import Session

# ✅ Always type hint function parameters and return types
async def get_user_by_id(
    db: Session,
    user_id: int,
    include_inactive: bool = False
) -> Optional[User]:
    """Get user by ID."""
    pass

# ✅ Use Optional for nullable returns
async def find_user_by_email(
    db: Session,
    email: str
) -> Optional[User]:
    pass

# ✅ Type hint lists and dicts with generics
async def get_users(
    db: Session,
    skip: int = 0,
    limit: int = 100
) -> List[User]:
    pass

# ✅ Use Tuple for multiple return values
async def get_users_with_count(
    db: Session,
    skip: int = 0,
    limit: int = 100
) -> Tuple[List[User], int]:
    pass
```

### Pydantic Model Type Hints

```python
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class UserResponse(BaseModel):
    """User response model with proper type hints."""
    id: int
    username: str
    email: str
    full_name: Optional[str] = None
    is_active: bool = True
    tags: List[str] = Field(default_factory=list)
    created_at: datetime
    metadata: Dict[str, Any] = Field(default_factory=dict)
```

### FastAPI Dependency Type Hints

```python
from fastapi import Depends
from typing import Annotated

# ✅ Use Annotated for cleaner dependency injection
async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)]
) -> User:
    pass

# ✅ Type hint dependency functions
async def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

## Code Style

### Formatting Rules

| Rule | Value | Tool |
|------|-------|------|
| **Line Length** | 88 characters | Black |
| **Quote Style** | Double quotes | Black |
| **Import Sorting** | isort style | isort/ruff |
| **Trailing Commas** | Required | Black |

### Black Configuration

```toml
# pyproject.toml
[tool.black]
line-length = 88
target-version = ['py311']
include = '\.pyi?$'
extend-exclude = '''
/(
  # directories
  \.eggs
  | \.git
  | \.hg
  | \.mypy_cache
  | \.tox
  | \.venv
  | build
  | dist
)/
'''
```

### Ruff Configuration

```toml
# pyproject.toml
[tool.ruff]
target-version = "py311"
line-length = 88
select = [
    "E",   # pycodestyle errors
    "F",   # Pyflakes
    "I",   # isort
    "N",   # pep8-naming
    "W",   # pycodestyle warnings
    "UP",  # pyupgrade
    "B",   # flake8-bugbear
    "C4",  # flake8-comprehensions
    "SIM", # flake8-simplify
]
ignore = ["E501"]  # Line too long (handled by Black)

[tool.ruff.pydocstyle]
convention = "google"
```

### Docstring Conventions (Google Style)

```python
def create_user(
    db: Session,
    user_data: UserCreate
) -> User:
    """Create a new user in the database.
    
    Args:
        db: Database session for executing queries.
        user_data: Validated user creation data.
    
    Returns:
        The newly created User object.
    
    Raises:
        ValueError: If email is already registered.
        HTTPException: If database operation fails.
    
    Example:
        >>> user_data = UserCreate(email="test@example.com", password="secret")
        >>> new_user = create_user(db, user_data)
        >>> print(new_user.id)
        1
    """
    pass

class UserService:
    """Service class for user-related business logic.
    
    This class encapsulates all operations related to user management
    including creation, retrieval, update, and deletion.
    
    Attributes:
        db: Database session for executing queries.
        cache: Optional cache client for performance optimization.
    """
    pass
```

## Git Conventions

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(users): add user registration endpoint` |
| `fix` | Bug fix | `fix(auth): resolve token expiration issue` |
| `docs` | Documentation | `docs(api): update endpoint descriptions` |
| `style` | Code style changes | `style: format with black` |
| `refactor` | Code refactoring | `refactor(services): extract common logic` |
| `test` | Tests | `test(users): add unit tests for user service` |
| `chore` | Maintenance | `chore(deps): update fastapi to 0.104` |
| `perf` | Performance | `perf(db): add connection pooling` |

**Scopes:**

- `api` - API endpoints
- `auth` - Authentication/authorization
- `db` - Database related
- `models` - Data models
- `services` - Business logic
- `deps` - Dependencies
- `config` - Configuration

**Examples:**

```
feat(auth): implement JWT token refresh

Add endpoint for refreshing expired JWT tokens.
Tokens now include refresh token with 7-day expiry.

Closes #123
```

```
fix(users): handle duplicate email registration

Return 409 Conflict instead of 500 when email exists.
Add proper error message for client display.
```

### Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/<description>` | `feature/user-authentication` |
| Bug Fix | `fix/<description>` | `fix/login-validation` |
| Hotfix | `hotfix/<description>` | `hotfix/security-patch` |
| Release | `release/<version>` | `release/v1.2.0` |
| Refactor | `refactor/<description>` | `refactor/user-service` |

## Code Review Checklist

- [ ] Code follows PEP 8 naming conventions
- [ ] All functions have type hints
- [ ] Docstrings follow Google style
- [ ] Imports are properly organized
- [ ] No unused imports or variables
- [ ] Error handling is comprehensive
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] Code is formatted with Black
- [ ] Ruff/linter checks pass
- [ ] No hardcoded secrets or credentials
- [ ] SQL queries are parameterized

## Common Patterns

### Settings Management

```python
# config.py
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    """Application settings loaded from environment."""
    app_name: str = "FastAPI App"
    debug: bool = False
    database_url: str
    secret_key: str
    access_token_expire_minutes: int = 30
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
```

### Custom Exceptions

```python
# exceptions.py
from fastapi import HTTPException, status

class BaseAppException(Exception):
    """Base exception for application errors."""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

class NotFoundError(BaseAppException):
    """Resource not found exception."""
    def __init__(self, resource: str, identifier: str):
        super().__init__(
            message=f"{resource} with id '{identifier}' not found",
            status_code=status.HTTP_404_NOT_FOUND
        )

class ValidationError(BaseAppException):
    """Validation error exception."""
    def __init__(self, message: str):
        super().__init__(
            message=message,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY
        )
```

### Async Context Manager

```python
from contextlib import asynccontextmanager
from typing import AsyncGenerator

@asynccontextmanager
async def get_db_session() -> AsyncGenerator[Session, None]:
    """Async context manager for database sessions."""
    session = SessionLocal()
    try:
        yield session
        await session.commit()
    except Exception:
        await session.rollback()
        raise
    finally:
        await session.close()

# Usage
async with get_db_session() as db:
    user = await get_user(db, user_id)
```

### Logging Configuration

```python
# logging_config.py
import logging
import sys
from logging.handlers import RotatingFileHandler

def setup_logging():
    """Configure application logging."""
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    console_handler.setLevel(logging.INFO)
    
    # File handler
    file_handler = RotatingFileHandler(
        "app.log",
        maxBytes=10485760,  # 10MB
        backupCount=5
    )
    file_handler.setFormatter(formatter)
    file_handler.setLevel(logging.DEBUG)
    
    # Root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG)
    root_logger.addHandler(console_handler)
    root_logger.addHandler(file_handler)
```

## Environment Configuration

### .env File Template

```env
# Application
APP_NAME=FastAPI App
DEBUG=false
ENVIRONMENT=development

# Database
DATABASE_URL=postgresql+asyncpg://user:password@localhost/dbname

# Security
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8080

# Logging
LOG_LEVEL=INFO
```

## Testing Conventions

### Test File Organization

```
tests/
├── __init__.py
├── conftest.py              # Shared fixtures
├── unit/                    # Unit tests
│   ├── __init__.py
│   ├── test_services.py
│   └── test_utils.py
├── integration/             # Integration tests
│   ├── __init__.py
│   ├── test_users_api.py
│   └── test_auth_api.py
└── fixtures/                # Test data
    ├── __init__.py
    └── users.py
```

### Test Naming

| Type | Pattern | Example |
|------|---------|---------|
| **Test Functions** | test_<function_name>_<scenario> | `test_create_user_success` |
| **Test Classes** | Test<ClassName> | `TestUserService` |
| **Fixture Functions** | _<resource> | `_db`, `_client` |

### Pytest Configuration

```toml
# pyproject.toml
[tool.pytest.ini_options]
testpaths = ["tests"]
python_files = ["test_*.py", "*_test.py"]
python_classes = ["Test*"]
python_functions = ["test_*"]
addopts = "-v --tb=short --strict-markers"
markers = [
    "unit: Unit tests",
    "integration: Integration tests",
    "slow: Slow running tests",
]
```
