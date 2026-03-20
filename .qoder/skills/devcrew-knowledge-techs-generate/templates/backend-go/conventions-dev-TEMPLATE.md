# {{platform_name}} 开发规范

> 平台: {{platform_id}}  
> 生成时间: {{generated_at}}  
> 框架: Go (Golang)

---

## 1. 命名规范

### 1.1 包命名

```go
// ✅ 使用小写、简短的包名
package user          // 正确
package userService   // 错误：不使用驼峰
package user_service  // 错误：不使用下划线

// ✅ 包名应该与目录名一致
// 目录: internal/user/service.go
package user          // 正确

// ✅ 避免使用通用名称
package utils         // 不推荐，过于笼统
package helpers       // 不推荐

// ✅ 使用有意义的缩写
package strconv       // string conversion
package fmt           // format
```

### 1.2 文件命名

```go
// ✅ 使用小写和下划线
user_service.go       // 正确
userRepository.go     // 错误：不使用驼峰
UserService.go        // 错误：不使用大写

// ✅ 测试文件使用 _test.go 后缀
user_service_test.go  // 单元测试
user_service_e2e_test.go  // 端到端测试

// ✅ 平台特定文件使用后缀
user_windows.go       // Windows 特定实现
user_linux.go         // Linux 特定实现
```

### 1.3 变量命名

```go
// ✅ 使用驼峰命名法
customerName          // 正确
CustomerName          // 导出变量
customer_name         // 错误：不使用蛇形

// ✅ 简短但有意义的名称
// 在短作用域中使用简短名称
for i := 0; i < n; i++ { }  // i, n 在循环中可接受

// 在较长作用域中使用描述性名称
var userRepository UserRepository  // 长作用域需要描述性

// ✅ 避免单字母名称（循环和惯用表达式除外）
// 惯用用法
for k, v := range m { }     // k = key, v = value, m = map
if w, ok := m[k]; ok { }    // w = value, ok = boolean

// ❌ 避免使用单字母
var u User                  // 不推荐，不够清晰
var usr User                // 推荐
```

### 1.4 常量命名

```go
// ✅ 使用驼峰命名法
const maxConnections = 100           // 包内私有
const MaxConnections = 100           // 导出

// ✅ 枚举类型使用类型名作为前缀
type UserStatus int

const (
    UserStatusActive   UserStatus = iota  // UserStatusActive
    UserStatusInactive                      // UserStatusInactive
    UserStatusBanned                        // UserStatusBanned
)

// ✅ 使用 iota 创建枚举
const (
    Sunday = iota     // 0
    Monday            // 1
    Tuesday           // 2
    // ...
)
```

### 1.5 函数和方法命名

```go
// ✅ 函数名使用驼峰命名法
func GetUserByID(id string) (*User, error)     // 正确
func getUserByID(id string) (*User, error)     // 包内私有
func get_user_by_id(id string) (*User, error)  // 错误

// ✅ 获取器不添加 Get 前缀
type User struct {
    name string
}

func (u *User) Name() string {  // 正确，不使用 GetName
    return u.name
}

// ✅ 转换函数使用 To 或 As 前缀
func ToString(v interface{}) string
func AsJSON(v interface{}) ([]byte, error)

// ✅ 布尔返回值使用 Is/Has/Can 前缀
func IsValid(email string) bool
func HasPermission(user *User, perm string) bool
func CanRead(user *User, resource string) bool
```

### 1.6 接口命名

```go
// ✅ 单方法接口使用方法名 + er
type Reader interface {
    Read(p []byte) (n int, err error)
}

type Writer interface {
    Write(p []byte) (n int, err error)
}

type Stringer interface {
    String() string
}

// ✅ 多方法接口使用描述性名称
type UserRepository interface {
    FindByID(id string) (*User, error)
    Create(user *User) error
    Update(user *User) error
    Delete(id string) error
}
```

### 1.7 结构体命名

```go
// ✅ 使用驼峰命名法
type User struct { }           // 正确
type user struct { }           // 包内私有
type user_model struct { }     // 错误

// ✅ 避免使用 Manager、Handler、Helper 等后缀
type UserManager { }           // 不推荐
type UserService { }           // 推荐

// ✅ 接口和实现的命名
// 接口
type UserService interface { }

// 实现使用小写私有结构体
type userService struct { }
```

---

## 2. 包组织

### 2.1 包结构原则

```
{{source_path}}/
├── cmd/                    # 应用程序入口
│   └── server/
│       └── main.go         # 必须包含 main 函数
├── internal/               # 私有代码
│   ├── config/             # 配置管理
│   ├── handler/            # HTTP 处理器
│   ├── service/            # 业务逻辑
│   ├── repository/         # 数据访问
│   ├── model/              # 数据模型
│   └── middleware/         # 中间件
├── pkg/                    # 公共库
│   ├── errors/             # 错误处理
│   ├── logger/             # 日志
│   └── utils/              # 工具函数
└── api/                    # API 定义
    └── v1/
```

### 2.2 包组织最佳实践

```go
// ✅ 按功能组织包，而非按层次
// 推荐：internal/user/ 包含 user 相关的所有代码
internal/
├── user/
│   ├── handler.go
│   ├── service.go
│   ├── repository.go
│   ├── model.go
│   └── dto.go

// 不推荐：按层次组织
internal/
├── handlers/
│   └── user_handler.go
├── services/
│   └── user_service.go
```

### 2.3 导入组织

```go
// ✅ 按组导入，组之间空一行
import (
    // 标准库
    "context"
    "fmt"
    "time"
    
    // 第三方库
    "github.com/gin-gonic/gin"
    "go.uber.org/zap"
    "gorm.io/gorm"
    
    // 项目内部包
    "github.com/{{organization}}/{{project_name}}/internal/config"
    "github.com/{{organization}}/{{project_name}}/pkg/errors"
)

// ✅ 使用 goimports 工具自动格式化导入
goimports -w .

// ✅ 使用空白导入时添加注释
import (
    _ "github.com/lib/pq"  // 注册 PostgreSQL 驱动
    _ "embed"              // 嵌入文件支持
)
```

### 2.4 循环依赖处理

```go
// ✅ 使用接口打破循环依赖
// package a
package a

type Service interface {
    Process() error
}

type A struct {
    svc Service  // 依赖接口而非具体实现
}

// package b
package b

import "a"

type B struct { }

func (b *B) Process() error { 
    return nil 
}

// B 实现了 a.Service 接口，但不依赖 a 包的具体实现
```

---

## 3. 错误处理

### 3.1 错误包装

```go
// ✅ 使用 fmt.Errorf 包装错误
import "fmt"

func (r *repository) Find(ctx context.Context, id string) (*User, error) {
    user, err := r.db.Find(id)
    if err != nil {
        return nil, fmt.Errorf("failed to find user %s: %w", id, err)
    }
    return user, nil
}

// ✅ 使用自定义错误类型
if err != nil {
    return nil, errors.NewNotFound("user", id)
}

// ✅ 在顶层处理错误
func handler(c *gin.Context) {
    result, err := service.Process(ctx, req)
    if err != nil {
        // 记录完整错误
        logger.Error("process failed", zap.Error(err))
        
        // 返回客户端友好的错误
        c.JSON(500, response.Error("处理失败，请稍后重试"))
        return
    }
}
```

### 3.2 错误检查

```go
// ✅ 使用 errors.Is 检查特定错误
import "errors"

if err != nil {
    if errors.Is(err, sql.ErrNoRows) {
        return nil, errors.NewNotFound("user", id)
    }
    return nil, err
}

// ✅ 使用 errors.As 获取具体错误类型
var appErr *errors.AppError
if errors.As(err, &appErr) {
    // 处理 AppError
    log.Printf("Error code: %d", appErr.Code)
}
```

### 3.3 错误处理原则

```go
// ✅ 错误只处理一次
// 不推荐：多处记录同一错误
func service() error {
    err := repo.Find()
    if err != nil {
        log.Printf("error: %v", err)  // 这里记录
        return err
    }
}

func handler() {
    err := service()
    if err != nil {
        log.Printf("error: %v", err)  // 又记录一次
    }
}

// 推荐：只在顶层记录
func service() error {
    err := repo.Find()
    if err != nil {
        return fmt.Errorf("find failed: %w", err)  // 包装但不记录
    }
}

func handler() {
    err := service()
    if err != nil {
        log.Printf("error: %v", err)  // 只在这里记录
    }
}
```

---

## 4. 代码风格

### 4.1 代码格式化

```bash
# ✅ 使用 gofmt 格式化代码
gofmt -w .

# ✅ 使用 goimports 整理导入
goimports -w .

# ✅ 使用 golint 检查代码风格
golint ./...

# ✅ 使用 go vet 静态检查
go vet ./...
```

### 4.2 代码布局

```go
// ✅ 函数顺序：导出的在前，私有的在后
// ✅ 按调用顺序排列

// UserService 用户服务接口
type UserService interface {
    GetUser(ctx context.Context, id string) (*User, error)
    CreateUser(ctx context.Context, req CreateUserRequest) (*User, error)
}

// 构造函数
func NewUserService(repo UserRepository) UserService {
    return &userService{repo: repo}
}

// 实现
type userService struct {
    repo UserRepository
}

func (s *userService) GetUser(ctx context.Context, id string) (*User, error) {
    return s.repo.FindByID(ctx, id)
}

func (s *userService) CreateUser(ctx context.Context, req CreateUserRequest) (*User, error) {
    user := &User{
        Email:    req.Email,
        Username: req.Username,
    }
    if err := s.repo.Create(ctx, user); err != nil {
        return nil, fmt.Errorf("create user failed: %w", err)
    }
    return user, nil
}
```

### 4.3 注释规范

```go
// ✅ 包注释放在 package 声明之前
// Package user provides user management functionality.
package user

// ✅ 导出的标识符必须有注释
// User represents a user in the system.
type User struct {
    ID       string    // ID is the unique identifier.
    Email    string    // Email is the user's email address.
    Username string    // Username is the user's display name.
}

// ✅ 函数注释以函数名开头
// GetUser retrieves a user by their ID.
// Returns ErrNotFound if the user does not exist.
func GetUser(ctx context.Context, id string) (*User, error) {
    // ...
}

// ✅ 使用完整句子，以句号结尾
// ProcessOrder processes the given order and updates the inventory.
func ProcessOrder(order *Order) error {
    // ...
}
```

### 4.4 行长度和格式化

```go
// ✅ 行长度控制在 100-120 字符以内
// ✅ 长参数列表换行
func VeryLongFunctionName(
    ctx context.Context,
    firstParameter string,
    secondParameter int,
    thirdParameter SomeComplexType,
) error {
    // ...
}

// ✅ 链式调用换行
result, err := someService.
    WithTimeout(30 * time.Second).
    WithRetry(3).
    Execute(ctx)

// ✅ 结构体初始化换行
user := &User{
    ID:        uuid.New().String(),
    Email:     "user@example.com",
    Username:  "john_doe",
    CreatedAt: time.Now(),
}
```

---

## 5. Git 规范

### 5.1 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 类型：**

| 类型 | 说明 |
|------|------|
| feat | 新功能 |
| fix | 修复 Bug |
| docs | 文档更新 |
| style | 代码格式调整（不影响功能） |
| refactor | 重构代码 |
| test | 添加或修改测试 |
| chore | 构建过程或辅助工具的变动 |
| perf | 性能优化 |

**示例：**

```
feat(user): 添加用户注册功能

- 实现用户注册接口
- 添加邮箱验证
- 发送欢迎邮件

Closes #123
```

### 5.2 分支命名

```
feature/user-registration    # 新功能
bugfix/login-error           # Bug 修复
hotfix/security-patch        # 紧急修复
refactor/user-service        # 重构
docs/api-documentation       # 文档
```

### 5.3 提交规范

```bash
# ✅ 提交前运行测试
go test ./...

# ✅ 提交前格式化代码
gofmt -w .
goimports -w .

# ✅ 提交前运行静态检查
go vet ./...

# ✅ 原子性提交，每个提交只做一件事
# 不推荐：在一个提交中混合多个功能
git commit -m "添加用户功能并修复订单 Bug 并更新文档"

# 推荐：分开提交
git commit -m "feat(user): 添加用户注册功能"
git commit -m "fix(order): 修复订单计算错误"
git commit -m "docs: 更新 API 文档"
```

---

## 6. 开发工具推荐

### 6.1 必备工具

```bash
# 代码格式化
go install golang.org/x/tools/cmd/goimports@latest

# 代码检查
go install golang.org/x/lint/golint@latest

# 静态分析
go install honnef.co/go/tools/cmd/staticcheck@latest

# 测试覆盖率
go install github.com/axw/gocov/gocov@latest

# 依赖检查
go install golang.org/x/tools/cmd/go-mod-tidy@latest
```

### 6.2 Makefile 示例

```makefile
.PHONY: build test lint fmt clean

# 构建
build:
	go build -o bin/server ./cmd/server

# 运行测试
test:
	go test -v -race ./...

# 运行测试并生成覆盖率报告
test-coverage:
	go test -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html

# 代码格式化
fmt:
	gofmt -w .
	goimports -w .

# 代码检查
lint:
	golint ./...
	go vet ./...
	staticcheck ./...

# 清理
 clean:
	rm -rf bin/
	rm -f coverage.out coverage.html

# 开发模式运行
dev:
	go run ./cmd/server

# 安装依赖
deps:
	go mod download
	go mod tidy
```

---

## 7. 相关文档

- [技术栈](./tech-stack.md)
- [架构规范](./architecture.md)
- [设计规范](./conventions-design.md)
- [测试规范](./conventions-test.md)
