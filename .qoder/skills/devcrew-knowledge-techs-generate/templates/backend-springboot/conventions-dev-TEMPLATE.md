# {{platform_name}} 开发规范

> 平台: {{platform_id}}  
> 生成时间: {{generated_at}}

## 目录

- [Java 命名规范](#java-命名规范)
- [包组织规范](#包组织规范)
- [注解使用规范](#注解使用规范)
- [导入组织规范](#导入组织规范)
- [Git 提交规范](#git-提交规范)

---

## Java 命名规范

### 类命名

```java
// ✅ 类名使用 PascalCase（大驼峰）
public class UserService { }
public class OrderRepository { }
public class GlobalExceptionHandler { }

// ✅ 接口名使用 PascalCase，通常以 -able/-ible 结尾或名词
public interface UserRepository { }
public interface Cacheable { }
public interface Validator { }

// ✅ 枚举名使用 PascalCase，常量使用大写 SNAKE_CASE
public enum UserStatus {
    ACTIVE,
    INACTIVE,
    SUSPENDED,
    DELETED
}

// ✅ 抽象类使用 PascalCase，可以 Abstract 开头
public abstract class AbstractService { }
public abstract class BaseEntity { }

// ❌ 避免
public class userService { }        // 小写开头
public class order_repository { }   // 蛇形命名
public class TUser { }              // 无意义前缀
```

### 方法命名

```java
// ✅ 方法名使用 camelCase（小驼峰）
public UserDTO findById(Long id) { }
public List<UserDTO> findAll() { }
public UserDTO createUser(UserCreateRequest request) { }
public void updateUser(Long id, UserUpdateRequest request) { }
public void deleteUser(Long id) { }

// ✅ 布尔方法使用 is/has/can/should 前缀
public boolean isActive() { }
public boolean hasPermission(String permission) { }
public boolean canDelete(User user) { }
public boolean shouldRetry(Exception e) { }

// ✅ Getter/Setter 遵循 JavaBean 规范
public String getUsername() { }
public void setUsername(String username) { }
public boolean isEnabled() { }  // boolean 类型用 is 前缀

// ❌ 避免
public UserDTO FindById(Long id) { }     // 大写开头
public UserDTO get_by_id(Long id) { }    // 蛇形命名
public UserDTO fetchUser(Long id) { }    // 混用动词
```

### 变量命名

```java
// ✅ 变量名使用 camelCase
String userName;
Long orderId;
List<UserDTO> userList;
Map<String, Object> configMap;

// ✅ 常量使用大写 SNAKE_CASE
public static final int MAX_RETRY_COUNT = 3;
public static final String DEFAULT_ENCODING = "UTF-8";
public static final BigDecimal TAX_RATE = new BigDecimal("0.13");

// ✅ 集合变量使用复数或明确类型后缀
List<User> users;
Set<String> uniqueNames;
Map<Long, User> userMap;
List<UserDTO> userDTOList;

// ✅ 布尔变量使用肯定语气
boolean isValid;
boolean hasError;
boolean canProcess;

// ❌ 避免
String UserName;            // 大写开头
String user_name;           // 蛇形命名
String str;                 // 无意义命名
String temp;                // 临时变量
Object obj;                 // 无意义命名
```

### 参数命名

```java
// ✅ 参数名清晰明确
public UserDTO findById(Long userId) { }
public void updateStatus(Long userId, UserStatus newStatus) { }
public List<OrderDTO> findByUserIdAndStatus(Long userId, OrderStatus status) { }

// ✅ 避免单字母参数（循环除外）
public void process(User user) { }      // ✅ 好
public void process(User u) { }         // ❌ 避免

// ✅ 循环变量可以使用简短命名
for (int i = 0; i < count; i++) { }     // ✅ 可以
for (User u : users) { }                // ✅ 简单循环可以
for (User user : users) { }             // ✅ 更好
```

---

## 包组织规范

### 标准包结构

```
com.example.{{platform_id}}
├── config              # 配置类
├── controller          # 控制器层
│   └── dto
│       ├── request     # 请求 DTO
│       └── response    # 响应 DTO
├── service             # 业务逻辑层
│   └── impl            # 实现类
├── repository          # 数据访问层
├── entity              # 实体类
├── mapper              # 对象映射器
├── exception           # 异常类
├── security            # 安全相关
├── util                # 工具类
├── enums               # 枚举类
├── constants           # 常量类
├── aspect              # AOP 切面
├── listener            # 事件监听器
├── task                # 定时任务
└── client              # 外部服务客户端
```

### 包命名规则

```java
// ✅ 包名全小写，使用域名倒序
package com.example.{{platform_id}}.service;
package com.example.{{platform_id}}.repository;

// ✅ 子包按功能划分
package com.example.{{platform_id}}.user.service;
package com.example.{{platform_id}}.order.repository;

// ❌ 避免
package com.example.{{platform_id}}.Service;     // 大写
package com.example.{{platform_id}}.user_service; // 下划线
```

### 类文件组织

```java
/*
 * 版权信息（可选）
 */
package com.example.{{platform_id}}.service;

// 1. 静态导入
import static java.util.stream.Collectors.toList;

// 2. java.* 包
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

// 3. javax.* 包
import javax.validation.Valid;
import javax.persistence.Entity;

// 4. 第三方包（按字母顺序）
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

// 5. 本项目包
import com.example.{{platform_id}}.entity.User;
import com.example.{{platform_id}}.repository.UserRepository;
import com.example.{{platform_id}}.dto.UserDTO;

/**
 * 用户服务类
 * 
 * 提供用户相关的业务逻辑处理，包括用户查询、创建、更新和删除等操作。
 * 
 * @author author
 * @since 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {
    
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    
    /**
     * 根据ID查询用户
     * 
     * @param id 用户ID
     * @return 用户信息
     * @throws ResourceNotFoundException 用户不存在时抛出
     */
    public UserDTO findById(Long id) {
        return userRepository.findById(id)
                .map(userMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }
}
```

---

## 注解使用规范

### 类级别注解顺序

```java
// 1. 日志注解
@Slf4j

// 2. Spring 组件注解（按功能）
@Configuration
@Component
@Service
@Repository
@RestController
@Controller

// 3. 作用域和代理
@Scope("prototype")
@Transactional
@CacheConfig(cacheNames = "users")

// 4. 安全配置
@PreAuthorize("hasRole('ADMIN')")
@Secured("ROLE_ADMIN")

// 5. 其他功能注解
@Entity
@Table(name = "users")
@EntityListeners(AuditingEntityListener.class)

// 示例
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@CacheConfig(cacheNames = "users")
public class UserService { }
```

### 方法级别注解顺序

```java
// 1. HTTP 方法映射（Controller）
@GetMapping
@PostMapping
@PutMapping
@DeleteMapping
@PatchMapping
@RequestMapping

// 2. 安全注解
@PreAuthorize
@Secured
@RolesAllowed

// 3. 事务和缓存
@Transactional
@Cacheable
@CacheEvict
@CachePut
@Async
@Scheduled

// 4. 验证和绑定
@Valid
@Validated
@RequestBody
@ResponseBody

// 5. 异常处理
@ExceptionHandler
@ResponseStatus

// 示例
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @Cacheable(value = "users", key = "#id")
    public ApiResponse<UserDTO> getUser(@PathVariable @Positive Long id) {
        // ...
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    public ResponseEntity<ApiResponse<UserDTO>> createUser(
            @RequestBody @Valid UserCreateRequest request) {
        // ...
    }
}
```

### 字段级别注解

```java
@Entity
public class User {
    
    // 1. JPA 注解
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // 2. 列映射
    @Column(name = "username", nullable = false, length = 50)
    private String username;
    
    // 3. 关联关系
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;
    
    // 4. 审计注解
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    // 5. 验证注解（DTO 中）
    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 50, message = "用户名长度3-50")
    private String username;
    
    @Email(message = "邮箱格式不正确")
    private String email;
    
    // 6. 注入注解
    @Autowired
    private UserRepository userRepository;
    
    @Value("${app.default.page-size:20}")
    private int defaultPageSize;
}
```

### 常用注解速查

| 场景 | 注解 | 说明 |
|------|------|------|
| 组件声明 | `@Service` | 业务逻辑层 |
| | `@Repository` | 数据访问层 |
| | `@Controller` / `@RestController` | 控制器层 |
| | `@Component` | 通用组件 |
| | `@Configuration` | 配置类 |
| 依赖注入 | `@Autowired` | 自动注入 |
| | `@Qualifier` | 指定 Bean 名称 |
| | `@Value` | 注入配置值 |
| | `@RequiredArgsConstructor` | Lombok 构造器注入 |
| Web | `@RequestMapping` | 通用映射 |
| | `@GetMapping` / `@PostMapping` 等 | HTTP 方法映射 |
| | `@RequestParam` | 查询参数 |
| | `@PathVariable` | 路径变量 |
| | `@RequestBody` | 请求体 |
| | `@ResponseBody` | 响应体 |
| 数据 | `@Entity` | JPA 实体 |
| | `@Table` | 表映射 |
| | `@Id` / `@GeneratedValue` | 主键 |
| | `@Column` | 列映射 |
| | `@CreatedDate` / `@LastModifiedDate` | 审计字段 |
| 事务 | `@Transactional` | 事务管理 |
| 缓存 | `@Cacheable` | 缓存读取 |
| | `@CacheEvict` | 缓存清除 |
| | `@CachePut` | 缓存更新 |
| 安全 | `@PreAuthorize` | 方法级权限 |
| | `@Secured` | 角色控制 |
| 异步 | `@Async` | 异步执行 |
| 定时 | `@Scheduled` | 定时任务 |
| 验证 | `@Valid` / `@Validated` | 启用验证 |
| | `@NotNull` / `@NotBlank` / `@NotEmpty` | 非空验证 |
| | `@Size` / `@Min` / `@Max` | 大小验证 |
| | `@Email` / `@Pattern` | 格式验证 |

---

## 导入组织规范

### 导入分组顺序

```java
// 第1组：静态导入
import static java.util.Collections.emptyList;
import static java.util.stream.Collectors.toList;
import static org.springframework.http.HttpStatus.OK;

// 第2组：java.* 包
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

// 第3组：javax.* 包
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.validation.Valid;
import javax.validation.constraints.NotBlank;

// 第4组：第三方包（按字母顺序）
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// 第5组：本项目包
import com.example.{{platform_id}}.config.AppConfig;
import com.example.{{platform_id}}.dto.UserDTO;
import com.example.{{platform_id}}.entity.User;
import com.example.{{platform_id}}.repository.UserRepository;
import com.example.{{platform_id}}.service.UserService;
```

### 导入优化规则

```java
// ✅ 使用具体导入（避免通配符）
import java.util.List;
import java.util.ArrayList;
import java.util.Map;

// ❌ 避免通配符导入
import java.util.*;

// ✅ 删除未使用的导入
// IDE 自动优化：Ctrl+Alt+O (IntelliJ)

// ✅ 静态导入常量和方法
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static java.util.Collections.emptyList;

// ✅ 同一包下的类不需要导入
```

### IDE 配置（IntelliJ IDEA）

```
Settings → Editor → Code Style → Java → Imports

Class count to use import with '*': 99
Names count to use static import with '*': 99

Import Layout:
  import static all other imports
  <blank line>
  import java.*
  <blank line>
  import javax.*
  <blank line>
  import all other imports
  <blank line>
  import com.example.{{platform_id}}.*
```

---

## Git 提交规范

### 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

| 类型 | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(user): 添加用户注册功能` |
| `fix` | 修复 Bug | `fix(order): 修复订单金额计算错误` |
| `docs` | 文档更新 | `docs(api): 更新接口文档` |
| `style` | 代码格式 | `style: 统一代码缩进` |
| `refactor` | 重构 | `refactor(service): 重构用户服务层` |
| `perf` | 性能优化 | `perf(query): 优化用户查询性能` |
| `test` | 测试相关 | `test(user): 添加用户服务单元测试` |
| `chore` | 构建/工具 | `chore(deps): 升级 Spring Boot 版本` |
| `ci` | CI/CD | `ci: 添加 GitHub Actions 配置` |

### Scope 范围

```
user        # 用户模块
order       # 订单模块
product     # 产品模块
auth        # 认证模块
config      # 配置
deps        # 依赖
api         # 接口
service     # 服务层
repository  # 数据层
docs        # 文档
```

### 提交示例

```bash
# 新功能
feat(user): 添加用户密码重置功能

- 实现发送重置邮件接口
- 添加令牌验证逻辑
- 集成邮件服务

Closes #123

# Bug 修复
fix(order): 修复订单取消时库存未回滚问题

在 OrderService.cancelOrder 方法中添加库存回滚逻辑，
确保订单取消后商品库存正确恢复。

Fixes #456

# 重构
refactor(service): 重构用户服务层，提取公共逻辑

将重复的用户验证逻辑提取到 UserValidator 类中，
提高代码复用性和可维护性。

# 文档
docs(api): 更新用户接口文档

- 添加新的错误码说明
- 更新请求参数约束
```

### 分支命名规范

```
# 功能分支
feature/user-registration
feature/order-payment-integration

# 修复分支
fix/user-login-exception
fix/order-amount-calculation

# 发布分支
release/v1.2.0
release/v2.0.0-beta

# 热修复分支
hotfix/security-vulnerability
hotfix/critical-bug-fix
```

### 代码审查清单

```markdown
## 自审查清单

### 代码质量
- [ ] 代码符合 Java 编码规范
- [ ] 命名清晰、有意义
- [ ] 方法长度不超过 50 行
- [ ] 类长度不超过 500 行
- [ ] 参数数量不超过 5 个

### 功能正确性
- [ ] 功能实现符合需求
- [ ] 边界条件已处理
- [ ] 异常场景已考虑
- [ ] 空指针风险已处理

### 测试
- [ ] 单元测试已编写
- [ ] 测试覆盖率达标（>80%）
- [ ] 集成测试已验证

### 性能与安全
- [ ] SQL 查询已优化（N+1 问题）
- [ ] 敏感数据已脱敏
- [ ] 输入已验证
- [ ] 权限控制已添加

### 文档
- [ ] 公共方法已添加 JavaDoc
- [ ] 复杂逻辑已添加注释
- [ ] API 文档已更新
```

---

## 代码风格配置

### EditorConfig

```ini
# .editorconfig
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.java]
indent_style = space
indent_size = 4
continuation_indent_size = 8
max_line_length = 120

[*.xml]
indent_style = space
indent_size = 2

[*.yml,*.yaml]
indent_style = space
indent_size = 2

[*.properties]
indent_style = space
indent_size = 2
```

### Checkstyle 配置要点

```xml
<!-- 关键检查规则 -->
<module name="Checker">
    <!-- 文件编码 -->
    <module name="LineLength">
        <property name="max" value="120"/>
    </module>
    
    <!-- 命名规范 -->
    <module name="TypeName"/>
    <module name="MethodName"/>
    <module name="LocalVariableName"/>
    <module name="MemberName"/>
    <module name="ParameterName"/>
    <module name="ConstantName"/>
    
    <!-- 导入规范 -->
    <module name="AvoidStarImport"/>
    <module name="UnusedImports"/>
    <module name="ImportOrder"/>
    
    <!-- 空白和格式 -->
    <module name="Indentation"/>
    <module name="WhitespaceAround"/>
    <module name="NeedBraces"/>
</module>
```
