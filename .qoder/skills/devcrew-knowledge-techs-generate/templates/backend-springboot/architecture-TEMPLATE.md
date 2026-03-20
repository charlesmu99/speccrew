# {{platform_name}} 架构规范

> 平台: {{platform_id}}  
> 生成时间: {{generated_at}}

## 目录

- [分层架构](#分层架构)
- [实体与DTO设计](#实体与dto设计)
- [依赖注入与Bean管理](#依赖注入与bean管理)
- [配置管理](#配置管理)
- [目录结构](#目录结构)

---

## 分层架构

### 标准分层

```
┌─────────────────────────────────────┐
│           Controller 层              │  ← REST API 接口
├─────────────────────────────────────┤
│            Service 层                │  ← 业务逻辑
├─────────────────────────────────────┤
│           Repository 层              │  ← 数据访问
├─────────────────────────────────────┤
│           Entity/Domain 层           │  ← 领域模型
└─────────────────────────────────────┘
```

### 各层职责

| 层级 | 职责 | 禁止事项 |
|------|------|----------|
| Controller | 接收请求、参数校验、调用Service、返回响应 | 禁止编写业务逻辑 |
| Service | 业务逻辑编排、事务管理、调用Repository | 禁止直接操作数据库 |
| Repository | 数据访问、CRUD操作 | 禁止包含业务逻辑 |
| Entity | 定义数据模型、JPA映射 | 禁止包含业务方法 |

### 分层调用规则

```java
// ✅ 正确：Controller → Service → Repository
@RestController
public class UserController {
    @Autowired
    private UserService userService;
    
    @GetMapping("/users/{id}")
    public UserDTO getUser(@PathVariable Long id) {
        return userService.findById(id);
    }
}

// ❌ 错误：Controller 直接调用 Repository
@RestController
public class UserController {
    @Autowired
    private UserRepository userRepository;  // 不应该！
}
```

---

## 实体与DTO设计

### Entity 设计规范

```java
@Entity
@Table(name = "users")
public class User {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "username", nullable = false, length = 50)
    private String username;
    
    @Column(name = "email", unique = true)
    private String email;
    
    @CreatedDate
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // 关联关系
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Order> orders;
    
    // Getter/Setter
}
```

### DTO 设计规范

```java
// 请求 DTO
public class UserCreateRequest {
    @NotBlank(message = "用户名不能为空")
    @Size(max = 50, message = "用户名长度不能超过50")
    private String username;
    
    @Email(message = "邮箱格式不正确")
    private String email;
}

// 响应 DTO
public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private LocalDateTime createdAt;
}

// 列表查询 DTO
public class UserListDTO {
    private Long id;
    private String username;
}
```

### DTO 转换模式

```java
// ✅ 使用 MapStruct 进行转换
@Mapper(componentModel = "spring")
public interface UserMapper {
    UserMapper INSTANCE = Mappers.getMapper(UserMapper.class);
    
    UserDTO toDTO(User user);
    
    User toEntity(UserCreateRequest request);
    
    List<UserDTO> toDTOList(List<User> users);
}

// 使用
@Service
public class UserService {
    @Autowired
    private UserMapper userMapper;
    
    public UserDTO findById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException(id));
        return userMapper.toDTO(user);
    }
}
```

---

## 依赖注入与Bean管理

### 注入方式

```java
// ✅ 推荐：构造器注入
@Service
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    
    public UserService(UserRepository userRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }
}

// ✅ 可选：字段注入（简单场景）
@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
}

// ✅ 可选：Setter注入（可选依赖）
@Service
public class UserService {
    private EmailService emailService;
    
    @Autowired(required = false)
    public void setEmailService(EmailService emailService) {
        this.emailService = emailService;
    }
}
```

### Bean 定义规范

```java
// ✅ 使用 @Component 及其派生注解
@Service        // 业务逻辑层
@Repository     // 数据访问层
@Component      // 通用组件
@Configuration  // 配置类

// ✅ 自定义 Bean
@Configuration
public class AppConfig {
    
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplateBuilder()
            .setConnectTimeout(Duration.ofSeconds(5))
            .setReadTimeout(Duration.ofSeconds(10))
            .build();
    }
    
    @Bean
    @ConditionalOnProperty(name = "app.cache.enabled", havingValue = "true")
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager();
    }
}
```

### 作用域管理

```java
// 默认单例（推荐）
@Service
public class UserService { }

// 请求作用域
@Service
@Scope(value = WebApplicationContext.SCOPE_REQUEST, proxyMode = ScopedProxyMode.TARGET_CLASS)
public class RequestContext { }

// 原型作用域
@Component
@Scope(ConfigurableBeanFactory.SCOPE_PROTOTYPE)
public class PrototypeBean { }
```

---

## 配置管理

### application.yml 结构

```yaml
# 应用基本信息
spring:
  application:
    name: {{platform_id}}
  
  # 数据源配置
  datasource:
    url: jdbc:mysql://localhost:3306/mydb?useSSL=false&serverTimezone=UTC
    username: ${DB_USERNAME:root}
    password: ${DB_PASSWORD:password}
    driver-class-name: com.mysql.cj.jdbc.Driver
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
  
  # JPA 配置
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
    properties:
      hibernate:
        dialect: org.hibernate.dialect.MySQL8Dialect
        format_sql: true
  
  # Jackson 配置
  jackson:
    date-format: yyyy-MM-dd HH:mm:ss
    time-zone: GMT+8
    default-property-inclusion: non_null

# 服务器配置
server:
  port: 8080
  servlet:
    context-path: /api

# 自定义配置
app:
  security:
    jwt:
      secret: ${JWT_SECRET:default-secret}
      expiration: 86400000  # 24小时
  
  upload:
    max-file-size: 10MB
    allowed-types: jpg,jpeg,png,pdf

# 日志配置
logging:
  level:
    root: INFO
    com.example: DEBUG
    org.hibernate.SQL: DEBUG
```

### 配置类读取

```java
// ✅ 使用 @ConfigurationProperties
@Data
@Component
@ConfigurationProperties(prefix = "app.security.jwt")
public class JwtProperties {
    private String secret;
    private Long expiration;
}

// ✅ 使用 @Value
@Service
public class JwtService {
    @Value("${app.security.jwt.secret}")
    private String secret;
    
    @Value("${app.security.jwt.expiration:86400000}")
    private Long expiration;
}

// ✅ 多环境配置
// application-dev.yml - 开发环境
// application-test.yml - 测试环境
// application-prod.yml - 生产环境
```

### Profile 配置

```java
// 环境特定 Bean
@Configuration
@Profile("dev")
public class DevConfig {
    @Bean
    public DataSource devDataSource() {
        // 开发环境数据源
    }
}

@Configuration
@Profile("prod")
public class ProdConfig {
    @Bean
    public DataSource prodDataSource() {
        // 生产环境数据源
    }
}

// 激活 Profile
// java -jar app.jar --spring.profiles.active=prod
```

---

## 目录结构

### Maven 标准结构

```
{{platform_id}}/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── example/
│   │   │           └── {{platform_id}}/
│   │   │               ├── Application.java          # 启动类
│   │   │               ├── config/                   # 配置类
│   │   │               │   ├── SecurityConfig.java
│   │   │               │   ├── WebConfig.java
│   │   │               │   └── SwaggerConfig.java
│   │   │               ├── controller/               # 控制器层
│   │   │               │   ├── UserController.java
│   │   │               │   └── dto/                  # 请求/响应 DTO
│   │   │               │       ├── request/
│   │   │               │       └── response/
│   │   │               ├── service/                  # 业务逻辑层
│   │   │               │   ├── UserService.java
│   │   │               │   └── impl/
│   │   │               │       └── UserServiceImpl.java
│   │   │               ├── repository/               # 数据访问层
│   │   │               │   └── UserRepository.java
│   │   │               ├── entity/                   # 实体类
│   │   │               │   └── User.java
│   │   │               ├── mapper/                   # MapStruct 映射器
│   │   │               │   └── UserMapper.java
│   │   │               ├── exception/                # 异常处理
│   │   │               │   ├── GlobalExceptionHandler.java
│   │   │               │   └── BusinessException.java
│   │   │               ├── security/                 # 安全相关
│   │   │               │   └── JwtTokenProvider.java
│   │   │               └── util/                     # 工具类
│   │   │                   └── DateUtils.java
│   │   └── resources/
│   │       ├── application.yml                       # 主配置
│   │       ├── application-dev.yml                   # 开发配置
│   │       ├── application-prod.yml                  # 生产配置
│   │       ├── db/
│   │       │   └── migration/                        # Flyway 迁移脚本
│   │       │       ├── V1__init.sql
│   │       │       └── V2__add_user_table.sql
│   │       ├── static/                               # 静态资源
│   │       └── templates/                            # 模板文件
│   └── test/
│       └── java/
│           └── com/
│               └── example/
│                   └── {{platform_id}}/
│                       ├── controller/
│                       ├── service/
│                       └── repository/
├── pom.xml                                           # Maven 配置
├── mvnw / mvnw.cmd                                   # Maven Wrapper
└── Dockerfile                                        # Docker 构建文件
```

### Gradle 结构

```
{{platform_id}}/
├── src/
│   ├── main/
│   │   ├── java/
│   │   └── resources/
│   └── test/
├── build.gradle                                      # Gradle 构建配置
├── settings.gradle                                   # Gradle 项目设置
├── gradlew / gradlew.bat                             # Gradle Wrapper
└── gradle/
    └── wrapper/
```

### 包命名规范

```
com.example.{{platform_id}}           # 根包
├── .config                           # 配置类
├── .controller                       # 控制器
│   └── .dto
│       ├── .request                  # 请求 DTO
│       └── .response                 # 响应 DTO
├── .service                          # 业务逻辑
│   └── .impl                         # 实现类
├── .repository                       # 数据访问
├── .entity                           # 实体类
├── .mapper                           # 对象映射
├── .exception                        # 异常处理
├── .security                         # 安全配置
├── .util                             # 工具类
└── .enums                            # 枚举类
```

---

## 启动类规范

```java
@SpringBootApplication
@EnableJpaAuditing                    # 启用 JPA 审计
@EnableCaching                        # 启用缓存
@EnableAsync                          # 启用异步
@ComponentScan("com.example.{{platform_id}}")
public class Application {
    
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```
