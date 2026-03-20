# {{platform_name}} 开发规范

> 平台: `{{platform_id}}` | 生成时间: `{{generated_at}}`

## 概述

本文档定义 {{platform_name}} 的开发规范，包括服务命名约定、配置管理、版本策略、导入组织和 Git 规范。

## 服务命名规范

### 服务名称

```yaml
# ✅ 服务命名规范
# 格式: {业务域}-{功能}-{类型}
# 类型: service (业务服务), server (基础服务), gateway (网关)

spring:
  application:
    name: user-service        # 用户服务
    # name: order-service     # 订单服务
    # name: product-service   # 商品服务
    # name: payment-service   # 支付服务
    # name: api-gateway       # API 网关
    # name: config-server     # 配置中心
    # name: eureka-server     # 注册中心
```

### 包结构命名

```
com.{company}.{service}.{layer}

# ✅ 推荐结构
com.example.userservice                    # 根包
├── UserserviceApplication.java            # 启动类
├── config                                 # 配置类
│   ├── DatabaseConfig.java
│   ├── RedisConfig.java
│   └── SecurityConfig.java
├── controller                             # 控制器层
│   ├── UserController.java
│   └── dto
│       ├── UserDTO.java
│       ├── CreateUserRequest.java
│       └── UserResponse.java
├── service                                # 服务层
│   ├── UserService.java
│   ├── impl
│   │   └── UserServiceImpl.java
│   └── client                             # Feign 客户端
│       ├── OrderServiceClient.java
│       └── fallback
│           └── OrderServiceFallback.java
├── repository                             # 数据访问层
│   ├── UserRepository.java
│   └── entity
│       └── UserEntity.java
├── domain                                 # 领域层 (DDD)
│   ├── model
│   ├── service
│   └── event
├── infrastructure                         # 基础设施层
│   ├── messaging
│   ├── cache
│   └── external
├── common                                 # 公共组件
│   ├── exception
│   ├── util
│   ├── constant
│   └── annotation
└── aspect                                 # AOP 切面
    ├── LoggingAspect.java
    └── MetricsAspect.java
```

### 类命名规范

| 类型 | 命名格式 | 示例 |
|------|----------|------|
| 启动类 | `{ServiceName}Application` | `UserServiceApplication` |
| 配置类 | `{Name}Config` / `{Name}Configuration` | `DatabaseConfig`, `WebClientConfiguration` |
| 控制器 | `{Name}Controller` | `UserController`, `OrderController` |
| 服务接口 | `{Name}Service` | `UserService`, `PaymentService` |
| 服务实现 | `{Name}ServiceImpl` | `UserServiceImpl` |
| Repository | `{Name}Repository` | `UserRepository` |
| 实体类 | `{Name}` / `{Name}Entity` | `User`, `UserEntity` |
| DTO | `{Name}DTO` / `{Name}Request` / `{Name}Response` | `UserDTO`, `CreateUserRequest` |
| Feign 客户端 | `{Name}Client` / `{Name}ServiceClient` | `OrderServiceClient` |
| Fallback | `{Name}Fallback` / `{Name}FallbackFactory` | `OrderServiceFallback` |
| 异常类 | `{Name}Exception` | `UserNotFoundException` |
| 工具类 | `{Name}Util` / `{Name}Utils` | `DateUtil`, `JsonUtils` |
| 常量类 | `{Name}Constant` / `{Name}Constants` | `ErrorCodeConstant` |
| 枚举类 | `{Name}` / `{Name}Enum` | `OrderStatus`, `UserTypeEnum` |
| 切面类 | `{Name}Aspect` | `LoggingAspect` |
| 过滤器 | `{Name}Filter` | `AuthFilter` |
| 拦截器 | `{Name}Interceptor` | `RequestInterceptor` |
| 监听器 | `{Name}Listener` | `OrderEventListener` |
| 任务类 | `{Name}Task` / `{Name}Job` | `DataSyncTask` |

```java
// ✅ 类命名示例

// 启动类
@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class UserServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}

// 控制器
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
}

// 服务接口
public interface UserService {
    UserDTO getUserById(Long id);
    UserDTO createUser(CreateUserRequest request);
}

// 服务实现
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
}

// Feign 客户端
@FeignClient(name = "order-service", fallback = OrderServiceFallback.class)
public interface OrderServiceClient {
    @GetMapping("/api/orders/user/{userId}")
    List<OrderDTO> getOrdersByUserId(@PathVariable("userId") Long userId);
}

// Fallback 实现
@Component
@Slf4j
public class OrderServiceFallback implements OrderServiceClient {
    @Override
    public List<OrderDTO> getOrdersByUserId(Long userId) {
        log.warn("Order service fallback triggered for user: {}", userId);
        return Collections.emptyList();
    }
}

// 自定义异常
public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException(Long userId) {
        super("User not found with id: " + userId);
    }
}
```

### 方法命名规范

```java
// ✅ Controller 方法命名
@RestController
public class UserController {
    
    // 查询类 - get / find / search / list
    @GetMapping("/{id}")
    public UserDTO getUserById(@PathVariable Long id) { }
    
    @GetMapping
    public List<UserDTO> listUsers(@RequestParam(required = false) String status) { }
    
    @GetMapping("/search")
    public Page<UserDTO> searchUsers(@RequestParam String keyword, Pageable pageable) { }
    
    // 创建类 - create / save / add
    @PostMapping
    public UserDTO createUser(@RequestBody @Valid CreateUserRequest request) { }
    
    // 更新类 - update / modify / edit
    @PutMapping("/{id}")
    public UserDTO updateUser(@PathVariable Long id, @RequestBody UpdateUserRequest request) { }
    
    @PatchMapping("/{id}/status")
    public void modifyUserStatus(@PathVariable Long id, @RequestParam UserStatus status) { }
    
    // 删除类 - delete / remove
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) { }
    
    // 业务操作 - {action}{Resource}
    @PostMapping("/{id}/activate")
    public void activateUser(@PathVariable Long id) { }
    
    @PostMapping("/{id}/disable")
    public void disableUser(@PathVariable Long id) { }
}

// ✅ Service 方法命名
@Service
public class UserServiceImpl implements UserService {
    
    // 查询单个 - findBy{Field} / getBy{Field}
    public UserDTO findById(Long id) { }
    public UserDTO findByEmail(String email) { }
    public UserDTO getByPhoneNumber(String phoneNumber) { }
    
    // 查询多个 - findAll / list / search
    public List<UserDTO> findAll() { }
    public List<UserDTO> findByStatus(UserStatus status) { }
    public Page<UserDTO> search(UserSearchCriteria criteria, Pageable pageable) { }
    
    // 判断类 - exists / is / has / can
    public boolean existsByEmail(String email) { }
    public boolean isActive(Long userId) { }
    public boolean hasPermission(Long userId, String permission) { }
    
    // 创建 - create / save / register
    public UserDTO create(CreateUserRequest request) { }
    public UserDTO register(RegisterRequest request) { }
    
    // 更新 - update / modify / change
    public UserDTO update(Long id, UpdateUserRequest request) { }
    public void modifyStatus(Long id, UserStatus status) { }
    
    // 删除 - delete / remove
    public void delete(Long id) { }
    public void removeByIds(List<Long> ids) { }
    
    // 业务操作 - {动词}{业务}
    public void activate(Long id) { }
    public void deactivate(Long id) { }
    public void lockAccount(Long id, String reason) { }
    public void unlockAccount(Long id) { }
}
```

### 变量命名规范

```java
// ✅ 变量命名
@Service
public class OrderService {
    
    // 常量 - UPPER_SNAKE_CASE
    private static final int MAX_RETRY_COUNT = 3;
    private static final String DEFAULT_CURRENCY = "CNY";
    private static final Duration TIMEOUT = Duration.ofSeconds(30);
    
    // 依赖注入
    private final OrderRepository orderRepository;
    private final UserServiceClient userServiceClient;
    private final RedisTemplate<String, Object> redisTemplate;
    
    // 方法内变量 - camelCase
    public OrderDTO processOrder(Long orderId) {
        // 名词形式
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new OrderNotFoundException(orderId));
        
        // 布尔变量 - is / has / can / should 开头
        boolean isValid = validateOrder(order);
        boolean hasStock = checkInventory(order);
        boolean canProcess = isValid && hasStock;
        
        // 集合变量 - 复数形式或 list / map 后缀
        List<OrderItem> items = order.getItems();
        Map<Long, Product> productMap = fetchProducts(items);
        Set<String> categories = new HashSet<>();
        
        // 计数/索引 - i / j / k 或 count / index
        int itemCount = items.size();
        for (int i = 0; i < itemCount; i++) {
            OrderItem item = items.get(i);
        }
        
        // 临时变量 - temp / tmp 前缀或具体含义
        BigDecimal tempTotal = BigDecimal.ZERO;
        String normalizedPhone = normalizePhoneNumber(order.getPhone());
        
        return convertToDTO(order);
    }
}
```

## 配置管理

### 配置文件命名

```yaml
# ✅ 配置文件结构
src/main/resources/
├── application.yml              # 公共配置
├── application-dev.yml          # 开发环境
├── application-test.yml         # 测试环境
├── application-prod.yml         # 生产环境
├── application-local.yml        # 本地开发
├── bootstrap.yml                # 引导配置 (Config Client)
├── logback-spring.xml           # 日志配置
└── META-INF/
    └── spring.factories         # 自动配置
```

### 配置分层

```yaml
# ✅ application.yml - 公共配置
spring:
  application:
    name: user-service
  profiles:
    active: ${SPRING_PROFILES_ACTIVE:dev}
  
  jackson:
    date-format: yyyy-MM-dd HH:mm:ss
    time-zone: GMT+8
    default-property-inclusion: non_null
  
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 100MB

# 服务端口
server:
  port: ${SERVER_PORT:8080}
  servlet:
    context-path: /

# 日志
logging:
  level:
    root: INFO
    com.example.userservice: DEBUG
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] [%X{traceId}] %-5level %logger{36} - %msg%n"

---
# ✅ application-dev.yml - 开发环境
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/user_db?useUnicode=true&characterEncoding=utf8
    username: ${DB_USERNAME:root}
    password: ${DB_PASSWORD:password}
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 10
      minimum-idle: 5
  
  redis:
    host: localhost
    port: 6379
    database: 0
    timeout: 5000ms
    lettuce:
      pool:
        max-active: 8
        max-idle: 8
        min-idle: 0
  
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
        namespace: dev
      config:
        server-addr: localhost:8848
        namespace: dev
        file-extension: yaml

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
  instance:
    prefer-ip-address: true

---
# ✅ application-prod.yml - 生产环境
spring:
  datasource:
    url: jdbc:mysql://${DB_HOST}:${DB_PORT:3306}/${DB_NAME}?useUnicode=true&characterEncoding=utf8&useSSL=true
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    hikari:
      maximum-pool-size: 50
      minimum-idle: 20
  
  redis:
    sentinel:
      master: mymaster
      nodes: ${REDIS_SENTINEL_NODES}
    password: ${REDIS_PASSWORD}

# 生产环境特定配置
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  metrics:
    export:
      prometheus:
        enabled: true
```

### 配置属性类

```java
// ✅ 配置属性类
@Data
@ConfigurationProperties(prefix = "app.service")
@Validated
@Component
public class ServiceProperties {
    
    @NotNull
    private Retry retry = new Retry();
    
    @NotNull
    private Timeout timeout = new Timeout();
    
    private Map<String, Endpoint> endpoints = new HashMap<>();
    
    @Data
    public static class Retry {
        @Min(0)
        @Max(10)
        private int maxAttempts = 3;
        
        @NotNull
        private Duration initialInterval = Duration.ofMillis(100);
        
        @NotNull
        private Duration maxInterval = Duration.ofSeconds(1);
        
        private double multiplier = 2.0;
    }
    
    @Data
    public static class Timeout {
        @NotNull
        private Duration connect = Duration.ofSeconds(5);
        
        @NotNull
        private Duration read = Duration.ofSeconds(30);
    }
    
    @Data
    public static class Endpoint {
        @NotBlank
        private String url;
        
        private String apiKey;
        
        @NotNull
        private Duration timeout = Duration.ofSeconds(10);
    }
}

// ✅ 使用配置
@Service
@RequiredArgsConstructor
public class ExternalServiceClient {
    private final ServiceProperties serviceProperties;
    
    public void callExternalService() {
        ServiceProperties.Retry retry = serviceProperties.getRetry();
        int maxAttempts = retry.getMaxAttempts();
        Duration timeout = serviceProperties.getTimeout().getRead();
        
        // 使用配置进行调用
    }
}
```

## 版本策略

### API 版本控制

```java
// ✅ URL 路径版本控制
@RestController
@RequestMapping("/api/v1/users")
public class UserControllerV1 {
    // V1 实现
}

@RestController
@RequestMapping("/api/v2/users")
public class UserControllerV2 {
    // V2 实现
}

// ✅ Header 版本控制
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @GetMapping(value = "/{id}", headers = "X-API-Version=1")
    public UserV1 getUserV1(@PathVariable Long id) {
        // V1 实现
    }
    
    @GetMapping(value = "/{id}", headers = "X-API-Version=2")
    public UserV2 getUserV2(@PathVariable Long id) {
        // V2 实现
    }
}

// ✅ Content-Type 版本控制
@RestController
@RequestMapping("/api/users")
public class UserController {
    
    @GetMapping(value = "/{id}", produces = "application/vnd.api.v1+json")
    public UserV1 getUserV1(@PathVariable Long id) {
        // V1 实现
    }
    
    @GetMapping(value = "/{id}", produces = "application/vnd.api.v2+json")
    public UserV2 getUserV2(@PathVariable Long id) {
        // V2 实现
    }
}
```

### 服务版本管理

```yaml
# ✅ 服务版本配置
# pom.xml
<project>
    <groupId>com.example</groupId>
    <artifactId>user-service</artifactId>
    <version>1.2.3-SNAPSHOT</version>
    
    <properties>
        <!-- Spring Boot 版本 -->
        <spring-boot.version>3.2.0</spring-boot.version>
        <!-- Spring Cloud 版本 -->
        <spring-cloud.version>2023.0.0</spring-cloud.version>
        <!-- 其他依赖版本 -->
        <mybatis-plus.version>3.5.5</mybatis-plus.version>
    </properties>
</project>
```

### 版本号规范

```
版本格式: MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]

MAJOR: 主版本号，不兼容的 API 修改
MINOR: 次版本号，向下兼容的功能添加
PATCH: 修订号，向下兼容的问题修复
PRERELEASE: 预发布版本 (SNAPSHOT, alpha, beta, rc)
BUILD: 构建元数据

示例:
1.0.0          # 正式版本
1.0.0-SNAPSHOT # 开发快照
1.0.0-alpha.1  # Alpha 版本
1.0.0-beta.2   # Beta 版本
1.0.0-rc.1     # 候选版本
```

## 导入组织

### 导入顺序

```java
// ✅ 导入分组顺序
package com.example.userservice.service;

// 1. Java 标准库 (java.*, javax.*)
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;

// 2. Spring Framework (org.springframework.*)
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// 3. 第三方库 (按字母顺序)
import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.observation.ObservationRegistry;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

// 4. 当前项目内部 (com.example.userservice.*)
import com.example.userservice.config.ServiceProperties;
import com.example.userservice.controller.dto.CreateUserRequest;
import com.example.userservice.controller.dto.UserDTO;
import com.example.userservice.exception.UserNotFoundException;
import com.example.userservice.repository.UserRepository;
import com.example.userservice.repository.entity.UserEntity;
import com.example.userservice.service.client.OrderServiceClient;

// 5. 静态导入 (最后)
import static com.example.userservice.constant.ErrorCode.USER_NOT_FOUND;
import static org.springframework.http.HttpStatus.CREATED;
```

### 导入规范

```java
// ✅ 显式导入 (不推荐通配符)
import java.util.List;
import java.util.Map;
import java.util.Set;
// ❌ import java.util.*;

// ✅ 静态导入常量
import static com.example.userservice.constant.ErrorCode.*;

// ✅ 类型导入
import com.example.userservice.domain.model.User;

// ✅ 使用 import 而非全限定名
// ✅
import com.example.userservice.util.DateUtil;
DateUtil.format(date);

// ❌
com.example.userservice.util.DateUtil.format(date);
```

## Git 规范

### 分支命名

```bash
# ✅ 分支命名规范
# 格式: {type}/{description}

# 功能分支
feature/user-authentication
feature/order-payment-integration
feature/JIRA-123-add-inventory-check

# 修复分支
bugfix/fix-null-pointer-exception
bugfix/JIRA-456-fix-memory-leak

# 热修复分支 (生产环境紧急修复)
hotfix/critical-security-patch
hotfix/fix-payment-callback-timeout

# 重构分支
refactor/extract-order-service
refactor/optimize-database-queries

# 文档分支
docs/update-api-documentation
docs/add-deployment-guide

# 依赖更新分支
chore/update-spring-boot-3.2
chore/upgrade-dependencies

# 测试分支
test/add-integration-tests
test/improve-coverage

# 发布分支
release/v1.2.0
release/v2.0.0-rc.1
```

### 提交信息规范

```bash
# ✅ 提交信息格式
# <type>(<scope>): <subject>
# <BLANK LINE>
# <body>
# <BLANK LINE>
# <footer>

# Type 类型:
# feat: 新功能
# fix: 修复 bug
# docs: 文档更新
# style: 代码格式调整（不影响功能）
# refactor: 重构代码
# perf: 性能优化
# test: 测试相关
# chore: 构建/工具/依赖更新
# ci: CI/CD 配置
# revert: 回滚提交

# Scope 范围 (可选):
# - user
# - order
# - payment
# - config
# - common
# - deps

# Subject 主题:
# - 不超过 50 个字符
# - 使用祈使句，现在时
# - 首字母小写
# - 不以句号结尾

# Body 正文 (可选):
# - 详细描述变更原因和方式
# - 每行不超过 72 个字符

# Footer 脚注 (可选):
# - 关联 Issue: Closes #123, Fixes #456
# - 破坏性变更: BREAKING CHANGE: 描述
```

```bash
# ✅ 提交示例

# 功能提交
git commit -m "feat(user): add user registration endpoint

- Implement user registration with email verification
- Add password encryption using BCrypt
- Send welcome email after registration

Closes #123"

# 修复提交
git commit -m "fix(order): resolve concurrent order creation issue

- Add distributed lock using Redis
- Handle race condition in inventory check
- Add retry mechanism for payment callback

Fixes #456"

# 重构提交
git commit -m "refactor(payment): extract payment gateway interface

- Create PaymentGateway interface for different providers
- Implement AlipayGateway and WechatPayGateway
- Simplify PaymentService logic

Related to #789"

# 文档提交
git commit -m "docs(api): update OpenAPI specification

- Add missing endpoints documentation
- Update request/response examples
- Fix typo in error codes"

# 依赖更新
git commit -m "chore(deps): upgrade Spring Boot to 3.2.0

- Update Spring Cloud to 2023.0.0
- Fix compatibility issues
- Update deprecated configurations"

# ❌ 不好的提交示例
git commit -m "update"                           # 过于简单
git commit -m "fix bug"                          # 不具体
git commit -m "WIP"                              # 未完成
git commit -m "2024-01-15 changes"               # 日期作为主题
git commit -m "feat: added some stuff"           # 使用过去时
git commit -m "fix: Fixed the bug."              # 首字母大写，以句号结尾
```

### 提交频率

```bash
# ✅ 提交时机
# - 完成一个独立功能点
# - 修复一个独立问题
# - 代码重构完成
# - 测试用例通过
# - 代码审查前

# ✅ 提交粒度示例
# 不要: 一次性提交所有修改
git add .
git commit -m "implement all features"

# 要: 分多次提交相关修改
git add src/main/java/com/example/userservice/controller/UserController.java
git commit -m "feat(user): add user CRUD endpoints"

git add src/main/java/com/example/userservice/service/UserService.java
git commit -m "feat(user): implement user business logic"

git add src/test/java/com/example/userservice/service/UserServiceTest.java
git commit -m "test(user): add unit tests for UserService"

git add docs/api/user-api.md
git commit -m "docs(user): add API documentation"
```

## 代码审查清单

### 功能检查

- [ ] 功能实现符合需求
- [ ] 边界条件处理正确
- [ ] 并发安全问题考虑
- [ ] 分布式事务处理正确
- [ ] 熔断降级策略配置

### 代码质量

- [ ] 遵循命名规范
- [ ] 代码结构清晰，分层正确
- [ ] 无重复代码
- [ ] 适当的异常处理
- [ ] 日志记录完整

### 微服务规范

- [ ] 服务职责单一
- [ ] 接口契约定义清晰
- [ ] 配置外部化
- [ ] 健康检查端点实现
- [ ] 服务间调用有降级策略

### 安全

- [ ] 输入验证完整
- [ ] 敏感数据加密存储
- [ ] 接口权限控制
- [ ] SQL 注入防护
- [ ] XSS 防护

### 性能

- [ ] 数据库查询优化
- [ ] 缓存使用合理
- [ ] 异步处理适当
- [ ] 资源释放正确
- [ ] 无内存泄漏

### 测试

- [ ] 单元测试覆盖核心逻辑
- [ ] 集成测试覆盖服务调用
- [ ] 契约测试验证接口
- [ ] 性能测试基线建立
