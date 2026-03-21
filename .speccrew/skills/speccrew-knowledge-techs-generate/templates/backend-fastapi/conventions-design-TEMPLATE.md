# {{platform_name}} Design Conventions

> Platform: {{platform_id}}  
> Framework: FastAPI {{fastapi_version}}  
> Generated: {{generated_at}}

## Overview

This document provides FastAPI-specific design principles and patterns for building robust, maintainable, and scalable Python APIs.

## Pydantic Model Design

### Model Types

| Type | Purpose | Location | Example |
|------|---------|----------|---------|
| **Request Models** | Validate incoming data | `schemas/request/` | `UserCreate`, `ItemUpdate` |
| **Response Models** | Structure API responses | `schemas/response/` | `UserResponse`, `ItemDetail` |
| **Database Models** | ORM entity definitions | `models/` | `UserModel`, `ItemModel` |
| **Shared Models** | Common reusable structures | `schemas/base.py` | `Pagination`, `ErrorResponse` |

### Request Model Design

```python
# schemas/request/user.py
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional

class UserCreate(BaseModel):
    """Schema for creating a new user."""
    username: str = Field(..., min_length=3, max_length=50, description="Unique username")
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=8, description="User password")
    full_name: Optional[str] = Field(None, max_length=100)
    
    @validator('username')
    def validate_username(cls, v):
        if not v.isalnum():
            raise ValueError('Username must be alphanumeric')
        return v.lower()
    
    class Config:
        json_schema_extra = {
            "example": {
                "username": "johndoe",
                "email": "john@example.com",
                "password": "securepassword123",
                "full_name": "John Doe"
            }
        }
```

### Response Model Design

```python
# schemas/response/user.py
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class UserResponse(BaseModel):
    """Schema for user response data."""
    id: int
    username: str
    email: str
    full_name: Optional[str]
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True  # Enable ORM mode for SQLAlchemy
```

### Model Inheritance Pattern

```python
# schemas/base.py
from pydantic import BaseModel, Field
from typing import Optional, List, Generic, TypeVar

T = TypeVar('T')

class Pagination(BaseModel, Generic[T]):
    """Generic pagination response."""
    items: List[T]
    total: int
    page: int
    page_size: int
    total_pages: int

class ErrorResponse(BaseModel):
    """Standard error response format."""
    detail: str
    code: Optional[str] = None
    field_errors: Optional[List[dict]] = None

# schemas/user.py
from schemas.base import Pagination

class UserListResponse(Pagination[UserResponse]):
    """Paginated list of users."""
    pass
```

## API Endpoint Design

### RESTful URL Patterns

| Operation | URL Pattern | Method | Description |
|-----------|-------------|--------|-------------|
| List | `/resources` | GET | Get list of resources |
| Create | `/resources` | POST | Create new resource |
| Get | `/resources/{id}` | GET | Get single resource |
| Update | `/resources/{id}` | PUT/PATCH | Update resource |
| Delete | `/resources/{id}` | DELETE | Delete resource |
| Action | `/resources/{id}/action` | POST | Custom action on resource |

### Endpoint Design Pattern

```python
from fastapi import APIRouter, Depends, Query, status
from typing import List, Optional

router = APIRouter(prefix="/users", tags=["users"])

@router.get(
    "/",
    response_model=UserListResponse,
    summary="List users",
    description="Get a paginated list of all users",
    response_description="List of users with pagination info"
)
async def list_users(
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Max items to return"),
    search: Optional[str] = Query(None, description="Search query"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    List all users with optional filtering and pagination.
    
    - **skip**: Number of records to skip (offset)
    - **limit**: Maximum number of records to return
    - **search**: Optional search term for username/email
    """
    users, total = await user_service.get_users(db, skip, limit, search)
    return UserListResponse(
        items=users,
        total=total,
        page=skip // limit + 1,
        page_size=limit,
        total_pages=(total + limit - 1) // limit
    )

@router.post(
    "/",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create user",
    description="Create a new user account"
)
async def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """Create a new user with the provided data."""
    return await user_service.create_user(db, user_data)
```

### Query Parameter Design

```python
from fastapi import Query
from enum import Enum
from typing import Optional, List

class SortOrder(str, Enum):
    ASC = "asc"
    DESC = "desc"

class UserSortField(str, Enum):
    CREATED_AT = "created_at"
    USERNAME = "username"
    EMAIL = "email"

@router.get("/")
async def list_users(
    # Pagination
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    
    # Filtering
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    role: Optional[List[str]] = Query(None, description="Filter by roles"),
    
    # Sorting
    sort_by: UserSortField = Query(UserSortField.CREATED_AT, description="Sort field"),
    sort_order: SortOrder = Query(SortOrder.DESC, description="Sort order"),
    
    # Search
    q: Optional[str] = Query(None, min_length=1, description="Search query")
):
    pass
```

## Dependency Design Patterns

### Service Layer Pattern

```python
# services/user_service.py
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate

class UserService:
    """Business logic for user operations."""
    
    async def get_user(self, db: Session, user_id: int) -> Optional[User]:
        """Get user by ID."""
        return db.query(User).filter(User.id == user_id).first()
    
    async def get_users(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None
    ) -> Tuple[List[User], int]:
        """Get paginated users with optional search."""
        query = db.query(User)
        
        if search:
            query = query.filter(
                (User.username.ilike(f"%{search}%")) |
                (User.email.ilike(f"%{search}%"))
            )
        
        total = query.count()
        users = query.offset(skip).limit(limit).all()
        return users, total
    
    async def create_user(self, db: Session, user_data: UserCreate) -> User:
        """Create a new user."""
        # Business logic: hash password, check duplicates
        db_user = User(**user_data.dict(exclude={'password'}))
        db_user.hashed_password = hash_password(user_data.password)
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

# Dependency provider
async def get_user_service() -> UserService:
    return UserService()
```

### Repository Pattern (Optional)

```python
# repositories/user_repository.py
from typing import List, Optional, Generic, TypeVar, Type
from sqlalchemy.orm import Session

ModelType = TypeVar("ModelType")

class BaseRepository(Generic[ModelType]):
    """Generic repository for CRUD operations."""
    
    def __init__(self, model: Type[ModelType]):
        self.model = model
    
    def get(self, db: Session, id: int) -> Optional[ModelType]:
        return db.query(self.model).filter(self.model.id == id).first()
    
    def get_multi(
        self,
        db: Session,
        skip: int = 0,
        limit: int = 100
    ) -> List[ModelType]:
        return db.query(self.model).offset(skip).limit(limit).all()
    
    def create(self, db: Session, obj_in: dict) -> ModelType:
        db_obj = self.model(**obj_in)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

class UserRepository(BaseRepository[User]):
    def __init__(self):
        super().__init__(User)
    
    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()
```

## Background Tasks

### Task Design Patterns

```python
from fastapi import BackgroundTasks, APIRouter
from typing import Callable
import asyncio

router = APIRouter()

# Simple background task
@router.post("/send-email")
async def send_email_endpoint(
    email: str,
    background_tasks: BackgroundTasks
):
    """Queue email to be sent in background."""
    background_tasks.add_task(send_email_task, email)
    return {"message": "Email queued for sending"}

def send_email_task(email: str):
    """Background task to send email."""
    # Email sending logic here
    pass

# Task with error handling
@router.post("/process-data")
async def process_data(
    data_id: int,
    background_tasks: BackgroundTasks
):
    """Queue data processing task."""
    background_tasks.add_task(
        process_data_with_logging,
        data_id,
        on_error=handle_processing_error
    )
    return {"message": "Processing started"}

def process_data_with_logging(data_id: int, on_error: Callable = None):
    """Process data with error handling."""
    try:
        logger.info(f"Starting processing for data_id: {data_id}")
        result = process_data(data_id)
        logger.info(f"Processing completed for data_id: {data_id}")
        return result
    except Exception as e:
        logger.error(f"Processing failed for data_id: {data_id}, error: {e}")
        if on_error:
            on_error(data_id, e)
        raise
```

### Celery Integration (for heavy tasks)

```python
# tasks/celery_tasks.py
from celery import Celery

celery_app = Celery("tasks", broker="redis://localhost:6379/0")

@celery_app.task(bind=True, max_retries=3)
def process_large_dataset(self, dataset_id: int):
    """Process large dataset asynchronously."""
    try:
        # Heavy processing logic
        result = heavy_computation(dataset_id)
        return result
    except Exception as exc:
        # Retry with exponential backoff
        raise self.retry(exc=exc, countdown=2 ** self.request.retries)

# Router usage
@router.post("/process-large-dataset")
async def queue_large_processing(dataset_id: int):
    """Queue large dataset processing via Celery."""
    task = process_large_dataset.delay(dataset_id)
    return {"task_id": task.id, "status": "queued"}
```

## FastAPI-Specific Design Principles

### Type Safety First

```python
from typing import Optional, List, Annotated
from fastapi import Query, Path
from pydantic import BaseModel, Field

# Use Annotated for cleaner parameter definitions
async def get_items(
    search: Annotated[Optional[str], Query(max_length=50)] = None,
    item_id: Annotated[int, Path(ge=1)] = None
):
    pass

# Strict typing for all models
class ItemCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    price: float = Field(..., gt=0)
    tags: List[str] = Field(default_factory=list)
```

### Automatic Documentation

```python
from fastapi import APIRouter

router = APIRouter(
    prefix="/items",
    tags=["items"],
    responses={
        404: {"description": "Item not found"},
        403: {"description": "Not enough permissions"}
    }
)

@router.get(
    "/{item_id}",
    response_model=ItemResponse,
    summary="Get an item",
    description="Retrieve a specific item by its ID. "
                "Returns 404 if the item doesn't exist.",
    response_description="The requested item",
    deprecated=False
)
async def get_item(item_id: int):
    """
    Get a single item.
    
    This endpoint retrieves detailed information about a specific item.
    
    - **item_id**: The unique identifier of the item
    """
    return await item_service.get_item(item_id)
```

### Response Consistency

```python
# schemas/response.py
from pydantic import BaseModel, Generic, TypeVar
from typing import Generic, TypeVar, Optional, List

T = TypeVar("T")

class APIResponse(BaseModel, Generic[T]):
    """Standard API response wrapper."""
    success: bool
    data: Optional[T] = None
    message: Optional[str] = None
    errors: Optional[List[dict]] = None

class PaginatedResponse(BaseModel, Generic[T]):
    """Standard paginated response."""
    items: List[T]
    total: int
    page: int
    page_size: int
    has_next: bool
    has_prev: bool

# Usage in routes
@router.get("/", response_model=APIResponse[PaginatedResponse[ItemResponse]])
async def list_items():
    items = await get_items()
    return APIResponse(
        success=True,
        data=PaginatedResponse(
            items=items,
            total=len(items),
            page=1,
            page_size=20,
            has_next=False,
            has_prev=False
        )
    )
```

## Design Checklist

Before finalizing API design, verify:

- [ ] All request/response models use Pydantic with proper validation
- [ ] Endpoints follow RESTful conventions
- [ ] Proper HTTP status codes are used
- [ ] Query parameters have appropriate validation constraints
- [ ] Dependencies are properly injected
- [ ] Business logic is separated into services
- [ ] Background tasks are used for non-critical operations
- [ ] Error responses follow consistent format
- [ ] All endpoints have proper documentation
- [ ] Type hints are used throughout
- [ ] Security dependencies are applied where needed

## Common Design Scenarios

### File Upload

```python
from fastapi import UploadFile, File, Form
from typing import Optional

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(..., description="File to upload"),
    description: Optional[str] = Form(None)
):
    """Upload a file with optional description."""
    contents = await file.read()
    # Process file
    return {"filename": file.filename, "size": len(contents)}
```

### WebSocket Endpoint

```python
from fastapi import WebSocket, WebSocketDisconnect

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Message received: {data}")
    except WebSocketDisconnect:
        # Handle disconnect
        pass
```

### Streaming Response

```python
from fastapi.responses import StreamingResponse
import asyncio

async def event_generator():
    """Generate SSE events."""
    for i in range(10):
        yield f"data: Event {i}\n\n"
        await asyncio.sleep(1)

@router.get("/stream")
async def stream_events():
    """Stream server-sent events."""
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )
```
