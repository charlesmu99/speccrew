# {{platform_name}} 架构规范

> 平台: {{platform_id}}  
> 生成时间: {{generated_at}}  
> 框架: Go (Golang)

---

## 1. 项目结构

### 1.1 标准 Go 项目布局

```
{{source_path}}/
├── cmd/                    # 应用程序入口
│   └── server/             # 主服务入口
│       └── main.go         # 程序入口点
├── internal/               # 私有应用代码
│   ├── config/             # 配置管理
│   ├── handler/            # HTTP 处理器 (Controller)
│   ├── service/            # 业务逻辑层
│   ├── repository/         # 数据访问层
│   ├── middleware/         # HTTP 中间件
│   ├── model/              # 数据模型
│   └── pkg/                # 内部共享包
├── pkg/                    # 公共库代码（可被外部导入）
│   ├── utils/              # 工具函数
│   ├── errors/             # 错误处理
│   └── logger/             # 日志工具
├── api/                    # API 定义
│   └── v1/                 # API 版本
├── web/                    # 静态资源（如需要）
├── configs/                # 配置文件
├── scripts/                # 构建脚本
├── deployments/            # 部署配置
├── docs/                   # 文档
├── go.mod                  # Go 模块定义
├── go.sum                  # 依赖校验
└── Makefile                # 构建任务
```

### 1.2 目录职责说明

| 目录 | 用途 | 访问权限 |
|------|------|----------|
| `cmd/` | 应用程序入口，每个子目录对应一个可执行文件 | 项目内部 |
| `internal/` | 私有应用代码，不允许被外部项目导入 | 项目内部 |
| `pkg/` | 公共库代码，可被外部项目导入 | 公开 |
| `api/` | API 协议定义、Swagger 文档 | 项目内部 |
| `configs/` | 配置文件模板 | 项目内部 |

---

## 2. 分层架构

### 2.1 Handler 层 (控制器层)

**职责：**
- 处理 HTTP 请求和响应
- 参数校验和绑定
- 调用 Service 层处理业务
- 返回统一的响应格式

**规范：**
```go
// handler/user_handler.go
package handler

type UserHandler struct {
    userService service.UserService
}

func NewUserHandler(us service.UserService) *UserHandler {
    return &UserHandler{userService: us}
}

// GetUser 获取用户信息
func (h *UserHandler) GetUser(c *gin.Context) {
    // 1. 参数绑定和校验
    var req dto.GetUserRequest
    if err := c.ShouldBindUri(&req); err != nil {
        c.JSON(http.StatusBadRequest, response.Error(err))
        return
    }
    
    // 2. 调用 Service 层
    user, err := h.userService.GetUser(c.Request.Context(), req.ID)
    if err != nil {
        c.JSON(http.StatusInternalServerError, response.Error(err))
        return
    }
    
    // 3. 返回响应
    c.JSON(http.StatusOK, response.Success(user))
}
```

### 2.2 Service 层 (业务逻辑层)

**职责：**
- 实现核心业务逻辑
- 协调多个 Repository 操作
- 事务管理
- 业务规则验证

**规范：**
```go
// service/user_service.go
package service

type UserService interface {
    GetUser(ctx context.Context, id string) (*model.User, error)
    CreateUser(ctx context.Context, req dto.CreateUserRequest) (*model.User, error)
}

type userService struct {
    userRepo repository.UserRepository
    cache    cache.Cache
}

func NewUserService(ur repository.UserRepository, c cache.Cache) UserService {
    return &userService{
        userRepo: ur,
        cache:    c,
    }
}

func (s *userService) GetUser(ctx context.Context, id string) (*model.User, error) {
    // 1. 尝试从缓存获取
    if user, err := s.cache.Get(ctx, id); err == nil {
        return user, nil
    }
    
    // 2. 从数据库获取
    user, err := s.userRepo.FindByID(ctx, id)
    if err != nil {
        return nil, errors.Wrap(err, "failed to get user")
    }
    
    // 3. 写入缓存
    s.cache.Set(ctx, id, user)
    
    return user, nil
}
```

### 2.3 Repository 层 (数据访问层)

**职责：**
- 数据库 CRUD 操作
- 数据模型转换
- 查询构建

**规范：**
```go
// repository/user_repository.go
package repository

type UserRepository interface {
    FindByID(ctx context.Context, id string) (*model.User, error)
    Create(ctx context.Context, user *model.User) error
    Update(ctx context.Context, user *model.User) error
    Delete(ctx context.Context, id string) error
}

type userRepository struct {
    db *gorm.DB
}

func NewUserRepository(db *gorm.DB) UserRepository {
    return &userRepository{db: db}
}

func (r *userRepository) FindByID(ctx context.Context, id string) (*model.User, error) {
    var user model.User
    if err := r.db.WithContext(ctx).First(&user, "id = ?", id).Error; err != nil {
        if errors.Is(err, gorm.ErrRecordNotFound) {
            return nil, errors.NewNotFound("user", id)
        }
        return nil, err
    }
    return &user, nil
}
```

---

## 3. 中间件模式

### 3.1 常用中间件

```go
// middleware/logger.go
func Logger() gin.HandlerFunc {
    return func(c *gin.Context) {
        start := time.Now()
        path := c.Request.URL.Path
        
        c.Next()
        
        latency := time.Since(start)
        logger.Info("request",
            zap.String("path", path),
            zap.Int("status", c.Writer.Status()),
            zap.Duration("latency", latency),
        )
    }
}

// middleware/recovery.go
func Recovery() gin.HandlerFunc {
    return func(c *gin.Context) {
        defer func() {
            if err := recover(); err != nil {
                logger.Error("panic recovered", zap.Any("error", err))
                c.JSON(http.StatusInternalServerError, response.Error(errors.NewInternal("internal server error")))
            }
        }()
        c.Next()
    }
}

// middleware/auth.go
func Auth(jwtSecret string) gin.HandlerFunc {
    return func(c *gin.Context) {
        token := c.GetHeader("Authorization")
        if token == "" {
            c.AbortWithStatusJSON(http.StatusUnauthorized, response.Error(errors.NewUnauthorized("missing token")))
            return
        }
        
        claims, err := jwt.Parse(token, jwtSecret)
        if err != nil {
            c.AbortWithStatusJSON(http.StatusUnauthorized, response.Error(errors.NewUnauthorized("invalid token")))
            return
        }
        
        c.Set("userID", claims.UserID)
        c.Next()
    }
}
```

### 3.2 中间件注册顺序

```go
// 正确的中间件顺序
r.Use(
    middleware.Recovery(),    // 1. 恢复 panic
    middleware.Logger(),      // 2. 请求日志
    middleware.CORS(),        // 3. 跨域处理
    middleware.RateLimit(),   // 4. 限流
    middleware.Auth(),        // 5. 认证（可选路由）
)
```

---

## 4. 错误处理

### 4.1 错误类型定义

```go
// pkg/errors/errors.go
package errors

type ErrorCode int

const (
    ErrCodeUnknown     ErrorCode = 1000
    ErrCodeValidation  ErrorCode = 1001
    ErrCodeNotFound    ErrorCode = 1002
    ErrCodeUnauthorized ErrorCode = 1003
    ErrCodeForbidden   ErrorCode = 1004
    ErrCodeInternal    ErrorCode = 1005
)

type AppError struct {
    Code    ErrorCode `json:"code"`
    Message string    `json:"message"`
    Err     error     `json:"-"`
}

func (e *AppError) Error() string {
    return e.Message
}

func NewNotFound(resource, id string) *AppError {
    return &AppError{
        Code:    ErrCodeNotFound,
        Message: fmt.Sprintf("%s with id %s not found", resource, id),
    }
}

func Wrap(err error, message string) error {
    return fmt.Errorf("%s: %w", message, err)
}
```

### 4.2 错误处理最佳实践

```go
// ✅ 正确的错误处理
func (s *service) Process(ctx context.Context, id string) error {
    result, err := s.repo.Find(ctx, id)
    if err != nil {
        return errors.Wrap(err, "failed to find result")
    }
    
    if err := s.processResult(result); err != nil {
        return errors.Wrap(err, "failed to process result")
    }
    
    return nil
}

// ❌ 避免吞掉原始错误
func (s *service) ProcessBad(ctx context.Context, id string) error {
    result, err := s.repo.Find(ctx, id)
    if err != nil {
        return errors.New("something went wrong")  // 丢失了原始错误信息
    }
    // ...
}
```

---

## 5. Go 模块组织

### 5.1 模块定义

```go
// go.mod
module github.com/{{organization}}/{{project_name}}

go 1.21

require (
    github.com/gin-gonic/gin v1.9.1
    gorm.io/gorm v1.25.5
    gorm.io/driver/postgres v1.5.4
    github.com/golang-jwt/jwt/v5 v5.2.0
    go.uber.org/zap v1.26.0
    github.com/spf13/viper v1.18.2
)
```

### 5.2 包组织原则

1. **单一职责**：每个包只负责一个明确的功能
2. **最小暴露**：只导出必要的类型和函数
3. **避免循环依赖**：合理划分包边界

```go
// ✅ 良好的包组织
internal/
├── user/                   # 用户模块
│   ├── handler.go          # HTTP 处理器
│   ├── service.go          # 业务逻辑
│   ├── repository.go       # 数据访问
│   └── dto.go              # 数据传输对象
├── order/                  # 订单模块
│   ├── handler.go
│   ├── service.go
│   └── repository.go
└── common/                 # 共享组件
    ├── response/           # 响应封装
    └── middleware/         # 通用中间件
```

---

## 6. 配置管理

### 6.1 配置结构

```go
// internal/config/config.go
package config

type Config struct {
    Server   ServerConfig   `mapstructure:"server"`
    Database DatabaseConfig `mapstructure:"database"`
    Redis    RedisConfig    `mapstructure:"redis"`
    JWT      JWTConfig      `mapstructure:"jwt"`
    Log      LogConfig      `mapstructure:"log"`
}

type ServerConfig struct {
    Port         int           `mapstructure:"port"`
    ReadTimeout  time.Duration `mapstructure:"read_timeout"`
    WriteTimeout time.Duration `mapstructure:"write_timeout"`
}

func Load(path string) (*Config, error) {
    viper.SetConfigFile(path)
    if err := viper.ReadInConfig(); err != nil {
        return nil, err
    }
    
    var cfg Config
    if err := viper.Unmarshal(&cfg); err != nil {
        return nil, err
    }
    
    return &cfg, nil
}
```

### 6.2 依赖注入

```go
// cmd/server/main.go
func main() {
    // 加载配置
    cfg, err := config.Load("configs/app.yaml")
    if err != nil {
        log.Fatal(err)
    }
    
    // 初始化依赖
    db := initDatabase(cfg.Database)
    redis := initRedis(cfg.Redis)
    
    // 初始化仓库层
    userRepo := repository.NewUserRepository(db)
    
    // 初始化服务层
    userService := service.NewUserService(userRepo, redis)
    
    // 初始化处理器层
    userHandler := handler.NewUserHandler(userService)
    
    // 设置路由
    r := gin.New()
    r.Use(middleware.Recovery(), middleware.Logger())
    
    api := r.Group("/api/v1")
    {
        api.GET("/users/:id", userHandler.GetUser)
        api.POST("/users", userHandler.CreateUser)
    }
    
    // 启动服务
    r.Run(fmt.Sprintf(":%d", cfg.Server.Port))
}
```

---

## 7. 相关文档

- [技术栈](./tech-stack.md)
- [设计规范](./conventions-design.md)
- [开发规范](./conventions-dev.md)
- [测试规范](./conventions-test.md)
