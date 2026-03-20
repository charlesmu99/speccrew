# {{platform_name}} 设计规范

> 平台: {{platform_id}}  
> 生成时间: {{generated_at}}

## 目录

- [REST API 设计规范](#rest-api-设计规范)
- [实体设计规范](#实体设计规范)
- [DTO 与 Mapper 模式](#dto-与-mapper-模式)
- [异常处理](#异常处理)
- [Spring Boot 设计原则](#spring-boot-设计原则)

---

## REST API 设计规范

### URL 设计

```
# ✅ 资源命名使用名词复数
GET    /api/users              # 获取用户列表
GET    /api/users/{id}         # 获取单个用户
POST   /api/users              # 创建用户
PUT    /api/users/{id}         # 全量更新用户
PATCH  /api/users/{id}         # 部分更新用户
DELETE /api/users/{id}         # 删除用户

# ✅ 嵌套资源
GET    /api/users/{id}/orders          # 获取用户的订单
GET    /api/users/{id}/orders/{oid}    # 获取用户的特定订单
POST   /api/users/{id}/orders          # 为用户创建订单

# ✅ 动作使用动词（非标准资源操作）
POST   /api/users/{id}/activate        # 激活用户
POST   /api/users/{id}/deactivate      # 禁用用户
POST   /api/auth/login                 # 登录
POST   /api/auth/logout                # 登出

# ❌ 避免在 URL 中使用动词
GET    /api/getUsers           # 错误
POST   /api/createUser         # 错误
GET    /api/deleteUser/{id}    # 错误
```

### HTTP 方法使用

| 方法 | 用途 | 幂等性 | 响应状态码 |
|------|------|--------|-----------|
| GET | 获取资源 | 是 | 200 OK, 404 Not Found |
| POST | 创建资源 | 否 | 201 Created, 400 Bad Request |
| PUT | 全量更新 | 是 | 200 OK, 204 No Content |
| PATCH | 部分更新 | 否 | 200 OK, 204 No Content |
| DELETE | 删除资源 | 是 | 204 No Content, 404 Not Found |

### 响应格式规范

```java
// ✅ 统一响应包装
@Data
public class ApiResponse<T> {
    private int code;           // 业务状态码
    private String message;     // 提示信息
    private T data;             // 数据
    private long timestamp;     // 时间戳
    
    public static <T> ApiResponse<T> success(T data) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setCode(200);
        response.setMessage("success");
        response.setData(data);
        response.setTimestamp(System.currentTimeMillis());
        return response;
    }
    
    public static <T> ApiResponse<T> error(int code, String message) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setCode(code);
        response.setMessage(message);
        response.setTimestamp(System.currentTimeMillis());
        return response;
    }
}

// ✅ 分页响应
@Data
public class PageResponse<T> {
    private List<T> content;        // 数据列表
    private int page;               // 当前页
    private int size;               // 每页大小
    private long totalElements;     // 总元素数
    private int totalPages;         // 总页数
    private boolean first;          // 是否第一页
    private boolean last;           // 是否最后一页
}
```

### 控制器实现示例

```java
@RestController
@RequestMapping("/api/users")
@Validated
public class UserController {
    
    private final UserService userService;
    
    public UserController(UserService userService) {
        this.userService = userService;
    }
    
    // 获取列表（支持分页）
    @GetMapping
    public ApiResponse<PageResponse<UserDTO>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String keyword) {
        Page<UserDTO> result = userService.findAll(page, size, keyword);
        return ApiResponse.success(PageResponse.of(result));
    }
    
    // 获取单个
    @GetMapping("/{id}")
    public ApiResponse<UserDTO> getUser(@PathVariable @Positive Long id) {
        UserDTO user = userService.findById(id);
        return ApiResponse.success(user);
    }
    
    // 创建
    @PostMapping
    public ResponseEntity<ApiResponse<UserDTO>> createUser(
            @RequestBody @Valid UserCreateRequest request) {
        UserDTO created = userService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created));
    }
    
    // 全量更新
    @PutMapping("/{id}")
    public ApiResponse<UserDTO> updateUser(
            @PathVariable @Positive Long id,
            @RequestBody @Valid UserUpdateRequest request) {
        UserDTO updated = userService.update(id, request);
        return ApiResponse.success(updated);
    }
    
    // 部分更新
    @PatchMapping("/{id}")
    public ApiResponse<UserDTO> patchUser(
            @PathVariable @Positive Long id,
            @RequestBody Map<String, Object> updates) {
        UserDTO updated = userService.patch(id, updates);
        return ApiResponse.success(updated);
    }
    
    // 删除
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable @Positive Long id) {
        userService.delete(id);
    }
}
```

### API 版本控制

```java
// ✅ URL 路径版本控制
@RestController
@RequestMapping("/api/v1/users")
public class UserControllerV1 { }

@RestController
@RequestMapping("/api/v2/users")
public class UserControllerV2 { }

// ✅ Header 版本控制
@RestController
@RequestMapping(value = "/api/users", headers = "X-API-Version=1")
public class UserControllerV1 { }
```

---

## 实体设计规范

### JPA 实体基础

```java
@Entity
@Table(name = "users")
@EntityListeners(AuditingEntityListener.class)
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "username", nullable = false, length = 50, unique = true)
    private String username;
    
    @Column(name = "email", length = 100)
    private String email;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private UserStatus status;
    
    // 审计字段
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @CreatedBy
    @Column(name = "created_by", updatable = false)
    private String createdBy;
    
    @LastModifiedBy
    @Column(name = "updated_by")
    private String updatedBy;
    
    // 软删除
    @Column(name = "deleted")
    private Boolean deleted = false;
}
```

### 关联关系设计

```java
@Entity
public class Order {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // ✅ 多对一：使用懒加载
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    // ✅ 一对多：使用 Set 避免重复
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<OrderItem> items = new HashSet<>();
    
    // ✅ 辅助方法维护双向关系
    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }
    
    public void removeItem(OrderItem item) {
        items.remove(item);
        item.setOrder(null);
    }
}

@Entity
public class OrderItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;
    
    // 其他字段...
}
```

### 枚举类型映射

```java
// ✅ 使用 STRING 存储枚举
public enum UserStatus {
    ACTIVE,     // 激活
    INACTIVE,   // 未激活
    SUSPENDED,  // 暂停
    DELETED     // 已删除
}

@Entity
public class User {
    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private UserStatus status = UserStatus.INACTIVE;
}

// ✅ 使用 AttributeConverter 自定义映射
@Converter(autoApply = true)
public class UserStatusConverter implements AttributeConverter<UserStatus, Integer> {
    
    @Override
    public Integer convertToDatabaseColumn(UserStatus status) {
        return status != null ? status.getCode() : null;
    }
    
    @Override
    public UserStatus convertToEntityAttribute(Integer code) {
        return code != null ? UserStatus.fromCode(code) : null;
    }
}
```

### 复合主键

```java
// ✅ 使用 @Embeddable 和 @EmbeddedId
@Embeddable
public class OrderItemId implements Serializable {
    @Column(name = "order_id")
    private Long orderId;
    
    @Column(name = "item_seq")
    private Integer itemSeq;
    
    // equals 和 hashCode 必须实现
}

@Entity
@Table(name = "order_items")
public class OrderItem {
    @EmbeddedId
    private OrderItemId id;
    
    // 其他字段...
}
```

---

## DTO 与 Mapper 模式

### DTO 分层设计

```java
// Request DTO - 接收客户端请求
public class UserCreateRequest {
    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 50, message = "用户名长度3-50")
    private String username;
    
    @Email(message = "邮箱格式不正确")
    private String email;
    
    @Pattern(regexp = "^1[3-9]\\d{9}$", message = "手机号格式不正确")
    private String phone;
}

public class UserUpdateRequest {
    @Size(max = 50)
    private String nickname;
    
    private String avatar;
}

// Response DTO - 返回给客户端
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String nickname;
    private LocalDateTime createdAt;
}

// 列表专用 DTO（字段精简）
public class UserListDTO {
    private Long id;
    private String username;
    private String nickname;
}

// 详情专用 DTO（字段完整）
public class UserDetailDTO {
    private Long id;
    private String username;
    private String email;
    private String phone;
    private String nickname;
    private String avatar;
    private UserStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrderDTO> recentOrders;
}
```

### MapStruct 映射器

```java
@Mapper(
    componentModel = "spring",
    unmappedTargetPolicy = ReportingPolicy.IGNORE,
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface UserMapper {
    
    // 实体 → DTO
    UserDTO toDTO(User user);
    
    // 列表转换
    List<UserDTO> toDTOList(List<User> users);
    
    // Request → 实体
    User toEntity(UserCreateRequest request);
    
    // 更新（非空字段覆盖）
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(@MappingTarget User user, UserUpdateRequest request);
    
    // 自定义映射
    @Mapping(target = "fullName", expression = "java(user.getFirstName() + \" \" + user.getLastName())")
    @Mapping(source = "createdAt", target = "registerDate", dateFormat = "yyyy-MM-dd")
    UserDetailDTO toDetailDTO(User user);
}
```

### 手动映射（简单场景）

```java
@Service
public class UserService {
    
    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
    
    private User convertToEntity(UserCreateRequest request) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setStatus(UserStatus.INACTIVE);
        return user;
    }
}
```

---

## 异常处理

### 自定义异常体系

```java
// 基础业务异常
public class BusinessException extends RuntimeException {
    private final int code;
    
    public BusinessException(String message) {
        super(message);
        this.code = 500;
    }
    
    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }
    
    public int getCode() {
        return code;
    }
}

// 具体异常类型
public class ResourceNotFoundException extends BusinessException {
    public ResourceNotFoundException(String resource, Long id) {
        super(404, String.format("%s not found with id: %d", resource, id));
    }
}

public class ValidationException extends BusinessException {
    public ValidationException(String message) {
        super(400, message);
    }
}

public class UnauthorizedException extends BusinessException {
    public UnauthorizedException(String message) {
        super(401, message);
    }
}

public class ForbiddenException extends BusinessException {
    public ForbiddenException(String message) {
        super(403, message);
    }
}
```

### 全局异常处理器

```java
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    // 业务异常
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Void>> handleBusinessException(BusinessException e) {
        log.warn("Business exception: {}", e.getMessage());
        return ResponseEntity.status(e.getCode())
                .body(ApiResponse.error(e.getCode(), e.getMessage()));
    }
    
    // 参数校验异常
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(
            MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));
        log.warn("Validation failed: {}", message);
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(400, message));
    }
    
    // 约束违反异常
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleConstraintViolation(
            ConstraintViolationException e) {
        String message = e.getConstraintViolations().stream()
                .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                .collect(Collectors.joining(", "));
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(400, message));
    }
    
    // 资源不存在
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleNotFound(NoHandlerFoundException e) {
        return ResponseEntity.status(404)
                .body(ApiResponse.error(404, "Resource not found"));
    }
    
    // 其他异常
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception e) {
        log.error("Unexpected error", e);
        return ResponseEntity.status(500)
                .body(ApiResponse.error(500, "Internal server error"));
    }
}
```

### 服务层异常使用

```java
@Service
public class UserService {
    
    public UserDTO findById(Long id) {
        return userRepository.findById(id)
                .map(userMapper::toDTO)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }
    
    public UserDTO create(UserCreateRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ValidationException("Username already exists");
        }
        // 创建逻辑...
    }
    
    public void delete(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        if (user.getStatus() == UserStatus.ADMIN) {
            throw new ForbiddenException("Cannot delete admin user");
        }
        userRepository.delete(user);
    }
}
```

---

## Spring Boot 设计原则

### SOLID 原则应用

```java
// ✅ S - 单一职责原则
// UserService 只处理用户相关逻辑
@Service
public class UserService {
    // 用户 CRUD、认证等
}

// OrderService 只处理订单相关逻辑
@Service
public class OrderService {
    // 订单处理逻辑
}

// ✅ O - 开闭原则
// 通过接口扩展，而非修改现有代码
public interface NotificationService {
    void sendNotification(String to, String message);
}

@Service
public class EmailNotificationService implements NotificationService { }

@Service
public class SmsNotificationService implements NotificationService { }

// ✅ L - 里氏替换原则
// 子类可以替换父类
public interface UserRepository extends JpaRepository<User, Long> {
    // 标准 CRUD 方法
}

// ✅ I - 接口隔离原则
// 细粒度接口
public interface UserQueryService {
    UserDTO findById(Long id);
    List<UserDTO> findAll();
}

public interface UserCommandService {
    UserDTO create(UserCreateRequest request);
    void update(Long id, UserUpdateRequest request);
    void delete(Long id);
}

// ✅ D - 依赖倒置原则
// 依赖抽象而非具体实现
@Service
public class UserService {
    private final UserRepository userRepository;  // 依赖接口
    private final NotificationService notificationService;  // 依赖接口
    
    public UserService(UserRepository userRepository, 
                       NotificationService notificationService) {
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }
}
```

### Spring Boot 最佳实践

```java
// ✅ 使用构造器注入
@Service
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    
    public UserService(UserRepository userRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }
}

// ✅ 使用 @Transactional 管理事务
@Service
@Transactional(readOnly = true)
public class OrderService {
    
    @Transactional  // 写操作覆盖只读
    public OrderDTO createOrder(OrderCreateRequest request) {
        // 创建订单
        // 扣减库存
        // 记录日志
        // 所有操作在一个事务中
    }
}

// ✅ 使用 @Async 异步处理
@Service
public class EmailService {
    @Async("taskExecutor")
    public CompletableFuture<Void> sendEmailAsync(String to, String subject, String content) {
        // 异步发送邮件
        return CompletableFuture.completedFuture(null);
    }
}

// ✅ 使用 @Cacheable 缓存
@Service
public class UserService {
    @Cacheable(value = "users", key = "#id")
    public UserDTO findById(Long id) {
        // 从数据库查询
    }
    
    @CacheEvict(value = "users", key = "#id")
    public void update(Long id, UserUpdateRequest request) {
        // 更新后清除缓存
    }
}

// ✅ 使用 @Scheduled 定时任务
@Component
public class ScheduledTasks {
    @Scheduled(cron = "0 0 2 * * ?")  // 每天凌晨2点
    public void cleanupExpiredData() {
        // 清理过期数据
    }
    
    @Scheduled(fixedRate = 60000)  // 每分钟
    public void syncData() {
        // 同步数据
    }
}
```

### 安全配置原则

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/public/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtTokenFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```
