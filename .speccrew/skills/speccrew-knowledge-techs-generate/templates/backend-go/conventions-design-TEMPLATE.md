# {{platform_name}} 设计规范

> 平台: {{platform_id}}  
> 生成时间: {{generated_at}}  
> 框架: Go (Golang)

---

## 1. 接口设计 (Go Interfaces)

### 1.1 接口定义原则

Go 的接口是隐式实现的，遵循"小接口原则"：

```go
// ✅ 定义小接口，职责单一
type Reader interface {
    Read(p []byte) (n int, err error)
}

type Writer interface {
    Write(p []byte) (n int, err error)
}

// 组合接口
type ReadWriter interface {
    Reader
    Writer
}

// ❌ 避免大而全的接口
type BigInterface interface {  // 不推荐
    Read(p []byte) (n int, err error)
    Write(p []byte) (n int, err error)
    Close() error
    Seek(offset int64, whence int) (int64, error)
    // ... 更多方法
}
```

### 1.2 服务层接口设计

```go
// service/user_service.go
package service

// UserService 定义用户服务接口
type UserService interface {
    // GetUser 根据 ID 获取用户
    GetUser(ctx context.Context, id string) (*model.User, error)
    
    // ListUsers 获取用户列表（支持分页）
    ListUsers(ctx context.Context, req ListUsersRequest) (*ListUsersResponse, error)
    
    // CreateUser 创建用户
    CreateUser(ctx context.Context, req CreateUserRequest) (*model.User, error)
    
    // UpdateUser 更新用户信息
    UpdateUser(ctx context.Context, id string, req UpdateUserRequest) (*model.User, error)
    
    // DeleteUser 删除用户
    DeleteUser(ctx context.Context, id string) error
}

// 接口实现放在内部
type userService struct {
    repo   repository.UserRepository
    cache  cache.Cache
    logger *zap.Logger
}

// 确保实现接口
var _ UserService = (*userService)(nil)

func NewUserService(repo repository.UserRepository, cache cache.Cache, logger *zap.Logger) UserService {
    return &userService{
        repo:   repo,
        cache:  cache,
        logger: logger,
    }
}
```

### 1.3 仓库层接口设计

```go
// repository/user_repository.go
package repository

// UserRepository 定义用户数据访问接口
type UserRepository interface {
    FindByID(ctx context.Context, id string) (*model.User, error)
    FindByEmail(ctx context.Context, email string) (*model.User, error)
    List(ctx context.Context, offset, limit int) ([]*model.User, error)
    Count(ctx context.Context) (int64, error)
    Create(ctx context.Context, user *model.User) error
    Update(ctx context.Context, user *model.User) error
    Delete(ctx context.Context, id string) error
    Exists(ctx context.Context, id string) (bool, error)
}
```

---

## 2. 结构体设计

### 2.1 模型结构体

```go
// model/user.go
package model

import (
    "time"
    "gorm.io/gorm"
)

// User 用户模型
type User struct {
    ID        string         `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
    Email     string         `gorm:"uniqueIndex;size:255;not null" json:"email"`
    Username  string         `gorm:"size:50;not null" json:"username"`
    Password  string         `gorm:"size:255;not null" json:"-"` // 不序列化到 JSON
    Status    UserStatus     `gorm:"default:active" json:"status"`
    CreatedAt time.Time      `json:"created_at"`
    UpdatedAt time.Time      `json:"updated_at"`
    DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName 指定表名
func (User) TableName() string {
    return "users"
}

// UserStatus 用户状态类型
type UserStatus string

const (
    UserStatusActive   UserStatus = "active"
    UserStatusInactive UserStatus = "inactive"
    UserStatusBanned   UserStatus = "banned"
)
```

### 2.2 DTO (数据传输对象)

```go
// dto/user_dto.go
package dto

// CreateUserRequest 创建用户请求
type CreateUserRequest struct {
    Email    string `json:"email" binding:"required,email"`
    Username string `json:"username" binding:"required,min=3,max=50"`
    Password string `json:"password" binding:"required,min=8"`
}

// UpdateUserRequest 更新用户请求
type UpdateUserRequest struct {
    Username string     `json:"username" binding:"omitempty,min=3,max=50"`
    Status   UserStatus `json:"status" binding:"omitempty,oneof=active inactive banned"`
}

// UserResponse 用户响应
type UserResponse struct {
    ID        string    `json:"id"`
    Email     string    `json:"email"`
    Username  string    `json:"username"`
    Status    string    `json:"status"`
    CreatedAt time.Time `json:"created_at"`
}

// ListUsersRequest 用户列表请求
type ListUsersRequest struct {
    Page     int    `form:"page" binding:"min=1"`
    PageSize int    `form:"page_size" binding:"min=1,max=100"`
    Status   string `form:"status" binding:"omitempty,oneof=active inactive banned"`
    Search   string `form:"search"`
}

// ListUsersResponse 用户列表响应
type ListUsersResponse struct {
    Total int64           `json:"total"`
    Items []*UserResponse `json:"items"`
}
```

### 2.3 结构体标签规范

```go
type Example struct {
    // GORM 标签
    ID        string `gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
    Email     string `gorm:"uniqueIndex:idx_email;size:255;not null"`
    
    // JSON 标签
    Username  string `json:"username"`
    Password  string `json:"-"`              // 忽略字段
    
    // 验证标签 (validator)
    Age       int    `json:"age" binding:"gte=0,lte=150"`
    Email     string `json:"email" binding:"required,email"`
    
    // 组合标签
    CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
}
```

---

## 3. API 端点设计

### 3.1 RESTful API 规范

```go
// router.go
func SetupRoutes(r *gin.Engine, handlers *Handlers) {
    api := r.Group("/api/v1")
    
    // 用户资源
    users := api.Group("/users")
    {
        users.GET("", handlers.User.List)          // GET /api/v1/users
        users.POST("", handlers.User.Create)       // POST /api/v1/users
        users.GET("/:id", handlers.User.Get)       // GET /api/v1/users/:id
        users.PUT("/:id", handlers.User.Update)    // PUT /api/v1/users/:id
        users.DELETE("/:id", handlers.User.Delete) // DELETE /api/v1/users/:id
    }
    
    // 嵌套资源
    orders := api.Group("/users/:userId/orders")
    {
        orders.GET("", handlers.Order.ListByUser)
        orders.POST("", handlers.Order.Create)
    }
}
```

### 3.2 统一响应格式

```go
// pkg/response/response.go
package response

// Response 统一响应结构
type Response struct {
    Code    int         `json:"code"`
    Message string      `json:"message"`
    Data    interface{} `json:"data,omitempty"`
}

// Success 成功响应
func Success(data interface{}) Response {
    return Response{
        Code:    0,
        Message: "success",
        Data:    data,
    }
}

// Error 错误响应
func Error(err error) Response {
    if appErr, ok := err.(*errors.AppError); ok {
        return Response{
            Code:    int(appErr.Code),
            Message: appErr.Message,
        }
    }
    return Response{
        Code:    5000,
        Message: err.Error(),
    }
}

// PageData 分页数据
type PageData struct {
    Total int64       `json:"total"`
    List  interface{} `json:"list"`
}

// SuccessPage 分页成功响应
func SuccessPage(total int64, list interface{}) Response {
    return Success(PageData{
        Total: total,
        List:  list,
    })
}
```

### 3.3 HTTP 状态码使用

| 状态码 | 使用场景 |
|--------|----------|
| 200 OK | 请求成功 |
| 201 Created | 资源创建成功 |
| 204 No Content | 删除成功，无返回内容 |
| 400 Bad Request | 请求参数错误 |
| 401 Unauthorized | 未认证 |
| 403 Forbidden | 无权限访问 |
| 404 Not Found | 资源不存在 |
| 422 Unprocessable Entity | 业务逻辑验证失败 |
| 500 Internal Server Error | 服务器内部错误 |

---

## 4. 错误处理模式

### 4.1 错误定义

```go
// pkg/errors/errors.go
package errors

import "fmt"

// 错误码定义
const (
    CodeUnknown     = 1000
    CodeValidation  = 1001
    CodeNotFound    = 1002
    CodeUnauthorized = 1003
    CodeForbidden   = 1004
    CodeConflict    = 1005
    CodeInternal    = 5000
)

// AppError 应用错误
type AppError struct {
    Code    int    `json:"code"`
    Message string `json:"message"`
    Err     error  `json:"-"`
}

func (e *AppError) Error() string {
    if e.Err != nil {
        return fmt.Sprintf("%s: %v", e.Message, e.Err)
    }
    return e.Message
}

func (e *AppError) Unwrap() error {
    return e.Err
}

// 构造函数
func NewValidation(message string) error {
    return &AppError{Code: CodeValidation, Message: message}
}

func NewNotFound(resource string, id interface{}) error {
    return &AppError{
        Code:    CodeNotFound,
        Message: fmt.Sprintf("%s with id %v not found", resource, id),
    }
}

func NewUnauthorized(message string) error {
    return &AppError{Code: CodeUnauthorized, Message: message}
}

func NewForbidden(message string) error {
    return &AppError{Code: CodeForbidden, Message: message}
}

func NewInternal(message string) error {
    return &AppError{Code: CodeInternal, Message: message}
}

func Wrap(err error, message string) error {
    if err == nil {
        return nil
    }
    return &AppError{
        Code:    CodeUnknown,
        Message: message,
        Err:     err,
    }
}
```

### 4.2 错误处理最佳实践

```go
// ✅ 使用 errors.Is 进行错误判断
if err != nil {
    if errors.Is(err, gorm.ErrRecordNotFound) {
        return nil, errors.NewNotFound("user", id)
    }
    return nil, errors.Wrap(err, "failed to find user")
}

// ✅ 使用 errors.As 获取具体错误类型
var appErr *errors.AppError
if errors.As(err, &appErr) {
    // 处理 AppError
}

// ✅ 在 Handler 中统一处理错误
func (h *Handler) GetUser(c *gin.Context) {
    user, err := h.service.GetUser(c.Request.Context(), id)
    if err != nil {
        status := http.StatusInternalServerError
        if errors.Is(err, errors.ErrNotFound) {
            status = http.StatusNotFound
        }
        c.JSON(status, response.Error(err))
        return
    }
    c.JSON(http.StatusOK, response.Success(user))
}
```

---

## 5. Go 特有设计原则

### 5.1 接受接口，返回结构体

```go
// ✅ 接受接口作为参数
func ProcessData(reader io.Reader) error {
    data, err := io.ReadAll(reader)
    if err != nil {
        return err
    }
    // 处理数据
    return nil
}

// ✅ 返回具体结构体
func NewUserService(repo UserRepository) *userService {
    return &userService{repo: repo}
}
```

### 5.2 使用函数选项模式

```go
// client.go
type Client struct {
    timeout time.Duration
    retries int
    logger  *zap.Logger
}

type Option func(*Client)

func WithTimeout(timeout time.Duration) Option {
    return func(c *Client) {
        c.timeout = timeout
    }
}

func WithRetries(retries int) Option {
    return func(c *Client) {
        c.retries = retries
    }
}

func WithLogger(logger *zap.Logger) Option {
    return func(c *Client) {
        c.logger = logger
    }
}

func NewClient(opts ...Option) *Client {
    c := &Client{
        timeout: 30 * time.Second,
        retries: 3,
    }
    for _, opt := range opts {
        opt(c)
    }
    return c
}

// 使用
client := NewClient(
    WithTimeout(60 * time.Second),
    WithRetries(5),
    WithLogger(logger),
)
```

### 5.3 使用 context 传递请求上下文

```go
// ✅ 始终将 context 作为第一个参数
func (s *service) Process(ctx context.Context, req Request) (*Response, error) {
    // 检查 context 是否已取消
    select {
    case <-ctx.Done():
        return nil, ctx.Err()
    default:
    }
    
    // 传递 context 到下游调用
    result, err := s.repo.Find(ctx, req.ID)
    if err != nil {
        return nil, err
    }
    
    return result, nil
}

// ✅ 在 HTTP Handler 中创建 context
func (h *Handler) GetUser(c *gin.Context) {
    ctx := c.Request.Context()
    user, err := h.service.GetUser(ctx, id)
    // ...
}
```

### 5.4 并发安全设计

```go
// ✅ 使用 sync.RWMutex 保护共享状态
type Cache struct {
    mu    sync.RWMutex
    items map[string]interface{}
}

func (c *Cache) Get(key string) (interface{}, bool) {
    c.mu.RLock()
    defer c.mu.RUnlock()
    item, ok := c.items[key]
    return item, ok
}

func (c *Cache) Set(key string, value interface{}) {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.items[key] = value
}

// ✅ 使用 channel 进行协程间通信
type Worker struct {
    jobs    chan Job
    results chan Result
    done    chan struct{}
}

func (w *Worker) Start() {
    go func() {
        for {
            select {
            case job := <-w.jobs:
                w.process(job)
            case <-w.done:
                return
            }
        }
    }()
}
```

---

## 6. 相关文档

- [技术栈](./tech-stack.md)
- [架构规范](./architecture.md)
- [开发规范](./conventions-dev.md)
- [测试规范](./conventions-test.md)
