# {{platform_name}} 架构规范

> 平台: `{{platform_id}}` | 生成时间: `{{generated_at}}`

## 概述

本文档定义 {{platform_name}} 的微服务架构模式和设计原则，基于 Spring Cloud 框架的最佳实践。

## 微服务架构

### 架构组件概览

```
┌─────────────────────────────────────────────────────────────────┐
│                        客户端层 (Client Layer)                   │
│         (Web App / Mobile App / Third-party Systems)            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API 网关层 (Gateway Layer)                  │
│              (Spring Cloud Gateway / Zuul)                      │
│     职责: 路由转发、负载均衡、鉴权、限流、日志                   │
└─────────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   用户服务       │ │   订单服务       │ │   商品服务       │
│  user-service   │ │  order-service  │ │ product-service │
└─────────────────┘ └─────────────────┘ └─────────────────┘
          │                   │                   │
          └───────────────────┼───────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    服务治理层 (Service Governance)               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  服务注册    │  │  配置中心    │  │       监控告警           │  │
│  │ (Eureka/    │  │ (Config/    │  │ (Micrometer +           │  │
│  │  Nacos)     │  │  Nacos)     │  │  Prometheus + Grafana)  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      基础设施层 (Infrastructure)                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   数据库     │  │    缓存      │  │       消息队列           │  │
│  │ (MySQL/     │  │  (Redis)    │  │   (RabbitMQ/RocketMQ    │  │
│  │  PostgreSQL)│  │             │  │    /Kafka)              │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 服务拆分原则

```java
// ✅ 按业务领域拆分
// 用户服务 - 处理用户相关所有功能
@Service
public class UserService {
    // 用户注册、登录、个人信息管理
}

// 订单服务 - 处理订单相关所有功能
@Service
public class OrderService {
    // 订单创建、支付、状态管理
}

// 商品服务 - 处理商品相关所有功能
@Service
public class ProductService {
    // 商品信息、库存、分类管理
}
```

**拆分原则:**
- **单一职责**: 每个服务只负责一个业务领域
- **高内聚低耦合**: 服务内部功能紧密相关，服务间依赖最小化
- **独立部署**: 每个服务可独立构建、部署、扩展
- **数据隔离**: 每个服务拥有独立的数据存储

## 服务发现 (Service Discovery)

### Eureka 服务注册与发现

```java
// ✅ Eureka Server 配置
@SpringBootApplication
@EnableEurekaServer
public class EurekaServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(EurekaServerApplication.class, args);
    }
}

// application.yml
/*
server:
  port: 8761
eureka:
  instance:
    hostname: localhost
  client:
    register-with-eureka: false
    fetch-registry: false
    service-url:
      defaultZone: http://${eureka.instance.hostname}:${server.port}/eureka/
*/
```

```java
// ✅ Eureka Client 配置
@SpringBootApplication
@EnableDiscoveryClient
public class UserServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}

// application.yml
/*
spring:
  application:
    name: user-service
server:
  port: 8081
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
  instance:
    prefer-ip-address: true
    instance-id: ${spring.application.name}:${server.port}
*/
```

### Nacos 服务注册与发现

```java
// ✅ Nacos 服务注册
@SpringBootApplication
@EnableDiscoveryClient
public class OrderServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(OrderServiceApplication.class, args);
    }
}

// bootstrap.yml
/*
spring:
  application:
    name: order-service
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
        namespace: dev
        group: DEFAULT_GROUP
*/
```

### 服务发现最佳实践

```java
// ✅ 使用服务名进行调用
@FeignClient(name = "user-service", fallback = UserServiceFallback.class)
public interface UserServiceClient {
    @GetMapping("/api/users/{id}")
    User getUserById(@PathVariable("id") Long id);
}

// ✅ 服务实例健康检查
@Component
public class HealthIndicator implements org.springframework.boot.actuate.health.HealthIndicator {
    @Override
    public Health health() {
        // 自定义健康检查逻辑
        if (isDatabaseConnected()) {
            return Health.up().build();
        }
        return Health.down().withDetail("database", "Disconnected").build();
    }
}
```

## API Gateway 模式

### Spring Cloud Gateway 配置

```java
// ✅ Gateway 主应用
@SpringBootApplication
@EnableDiscoveryClient
public class GatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }
}

// ✅ 路由配置 - Java DSL
@Configuration
public class GatewayConfig {
    
    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
            // 用户服务路由
            .route("user-service", r -> r
                .path("/api/users/**", "/api/auth/**")
                .filters(f -> f
                    .stripPrefix(0)
                    .circuitBreaker(config -> config
                        .setName("userServiceCircuitBreaker")
                        .setFallbackUri("forward:/fallback/user"))
                    .requestRateLimiter(config -> config
                        .setRateLimiter(redisRateLimiter())
                        .setKeyResolver(userKeyResolver())))
                .uri("lb://user-service"))
            
            // 订单服务路由
            .route("order-service", r -> r
                .path("/api/orders/**")
                .filters(f -> f
                    .stripPrefix(0)
                    .circuitBreaker(config -> config
                        .setName("orderServiceCircuitBreaker")
                        .setFallbackUri("forward:/fallback/order")))
                .uri("lb://order-service"))
            
            .build();
    }
}
```

```yaml
# ✅ 路由配置 - YAML
spring:
  cloud:
    gateway:
      routes:
        # 用户服务
        - id: user-service
          uri: lb://user-service
          predicates:
            - Path=/api/users/**,/api/auth/**
          filters:
            - StripPrefix=0
            - name: CircuitBreaker
              args:
                name: userServiceCircuitBreaker
                fallbackUri: forward:/fallback/user
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 10
                redis-rate-limiter.burstCapacity: 20
                key-resolver: "#{@userKeyResolver}"
        
        # 订单服务
        - id: order-service
          uri: lb://order-service
          predicates:
            - Path=/api/orders/**
          filters:
            - StripPrefix=0
            - CircuitBreaker=userServiceCircuitBreaker,forward:/fallback/order
```

### Gateway 过滤器

```java
// ✅ 全局过滤器 - 认证
@Component
public class AuthGlobalFilter implements GlobalFilter, Ordered {
    
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();
        
        // 白名单路径跳过认证
        if (isWhiteList(path)) {
            return chain.filter(exchange);
        }
        
        // 验证 Token
        String token = request.getHeaders().getFirst("Authorization");
        if (!validateToken(token)) {
            ServerHttpResponse response = exchange.getResponse();
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return response.setComplete();
        }
        
        // 传递用户信息到下游服务
        ServerHttpRequest mutatedRequest = request.mutate()
            .header("X-User-Id", extractUserId(token))
            .header("X-User-Role", extractUserRole(token))
            .build();
        
        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }
    
    @Override
    public int getOrder() {
        return -100; // 最高优先级
    }
}

// ✅ 自定义 GatewayFilter
@Component
public class LoggingGatewayFilterFactory extends AbstractGatewayFilterFactory<Config> {
    
    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            log.info("Request: {} {}", exchange.getRequest().getMethod(), 
                     exchange.getRequest().getURI());
            
            return chain.filter(exchange).then(Mono.fromRunnable(() -> {
                log.info("Response: {}", exchange.getResponse().getStatusCode());
            }));
        };
    }
}
```

## 配置中心 (Configuration Center)

### Spring Cloud Config

```java
// ✅ Config Server
@SpringBootApplication
@EnableConfigServer
public class ConfigServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(ConfigServerApplication.class, args);
    }
}

// application.yml
/*
server:
  port: 8888
spring:
  application:
    name: config-server
  cloud:
    config:
      server:
        git:
          uri: https://github.com/your-org/config-repo
          username: ${GIT_USERNAME}
          password: ${GIT_PASSWORD}
          default-label: main
          search-paths: '{application}'
*/
```

```java
// ✅ Config Client
@SpringBootApplication
public class UserServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}

// bootstrap.yml
/*
spring:
  application:
    name: user-service
  profiles:
    active: dev
  cloud:
    config:
      uri: http://localhost:8888
      fail-fast: true
      retry:
        initial-interval: 1000
        max-attempts: 6
        max-interval: 2000
        multiplier: 1.1
*/
```

### Nacos 配置中心

```yaml
# ✅ Nacos 配置
spring:
  application:
    name: user-service
  cloud:
    nacos:
      config:
        server-addr: localhost:8848
        namespace: dev
        group: DEFAULT_GROUP
        file-extension: yaml
        refresh-enabled: true
        # 共享配置
        shared-configs:
          - data-id: common.yaml
            group: DEFAULT_GROUP
            refresh: true
        # 扩展配置
        extension-configs:
          - data-id: redis.yaml
            group: DEFAULT_GROUP
            refresh: true
```

```java
// ✅ 动态配置刷新
@RestController
@RefreshScope  // 配置变更时自动刷新
public class ConfigController {
    
    @Value("${app.name:default}")
    private String appName;
    
    @Value("${app.version:1.0}")
    private String appVersion;
    
    @GetMapping("/config")
    public Map<String, String> getConfig() {
        return Map.of(
            "appName", appName,
            "appVersion", appVersion
        );
    }
}

// ✅ 配置属性类
@ConfigurationProperties(prefix = "app")
@Data
@Component
@RefreshScope
public class AppProperties {
    private String name;
    private String version;
    private Map<String, String> features;
}
```

## 熔断器 (Circuit Breaker)

### Resilience4j 配置

```java
// ✅ Resilience4j 配置
@Configuration
public class Resilience4jConfig {
    
    @Bean
    public Customizer<Resilience4JCircuitBreakerFactory> defaultCustomizer() {
        return factory -> factory.configureDefault(id -> new Resilience4JConfigBuilder(id)
            .circuitBreakerConfig(CircuitBreakerConfig.custom()
                .failureRateThreshold(50)           // 失败率阈值
                .slowCallRateThreshold(80)          // 慢调用阈值
                .slowCallDurationThreshold(Duration.ofSeconds(2))
                .permittedNumberOfCallsInHalfOpenState(10)
                .slidingWindowSize(100)
                .minimumNumberOfCalls(10)
                .waitDurationInOpenState(Duration.ofSeconds(10))
                .build())
            .timeLimiterConfig(TimeLimiterConfig.custom()
                .timeoutDuration(Duration.ofSeconds(4))
                .build())
            .build());
    }
}
```

```java
// ✅ 熔断器使用
@Service
public class OrderService {
    
    @Autowired
    private UserServiceClient userServiceClient;
    
    @Autowired
    private CircuitBreakerFactory circuitBreakerFactory;
    
    public Order createOrder(CreateOrderRequest request) {
        CircuitBreaker circuitBreaker = circuitBreakerFactory.create("userService");
        
        // 使用熔断器包装远程调用
        User user = circuitBreaker.run(
            () -> userServiceClient.getUserById(request.getUserId()),
            throwable -> getDefaultUser(request.getUserId())  // 降级逻辑
        );
        
        // 创建订单...
        return orderRepository.save(order);
    }
    
    private User getDefaultUser(Long userId) {
        // 返回默认用户或缓存数据
        return User.builder()
            .id(userId)
            .name("Unknown User")
            .build();
    }
}
```

```java
// ✅ 注解方式使用熔断器
@Service
public class PaymentService {
    
    @CircuitBreaker(name = "paymentService", fallbackMethod = "paymentFallback")
    public PaymentResult processPayment(PaymentRequest request) {
        // 调用第三方支付接口
        return thirdPartyPaymentApi.charge(request);
    }
    
    @TimeLimiter(name = "paymentService")
    @Bulkhead(name = "paymentService")
    public CompletableFuture<PaymentResult> processPaymentAsync(PaymentRequest request) {
        return CompletableFuture.supplyAsync(() -> processPayment(request));
    }
    
    // 降级方法
    private PaymentResult paymentFallback(PaymentRequest request, Exception ex) {
        log.error("Payment failed, using fallback", ex);
        return PaymentResult.builder()
            .success(false)
            .message("Payment service temporarily unavailable")
            .build();
    }
}
```

### Sentinel 配置

```java
// ✅ Sentinel 配置
@Configuration
public class SentinelConfig {
    
    @PostConstruct
    public void init() {
        // 配置限流规则
        List<FlowRule> flowRules = new ArrayList<>();
        FlowRule flowRule = new FlowRule();
        flowRule.setResource("createOrder");
        flowRule.setGrade(RuleConstant.FLOW_GRADE_QPS);
        flowRule.setCount(100);  // QPS 限制
        flowRules.add(flowRule);
        FlowRuleManager.loadRules(flowRules);
        
        // 配置熔断规则
        List<DegradeRule> degradeRules = new ArrayList<>();
        DegradeRule degradeRule = new DegradeRule();
        degradeRule.setResource("processPayment");
        degradeRule.setGrade(RuleConstant.DEGRADE_GRADE_EXCEPTION_RATIO);
        degradeRule.setCount(0.5);  // 异常比例阈值
        degradeRule.setTimeWindow(10);  // 熔断时长
        degradeRules.add(degradeRule);
        DegradeRuleManager.loadRules(degradeRules);
    }
}

// ✅ Sentinel 注解使用
@Service
public class OrderService {
    
    @SentinelResource(
        value = "createOrder",
        blockHandler = "createOrderBlockHandler",
        fallback = "createOrderFallback"
    )
    public Order createOrder(CreateOrderRequest request) {
        // 业务逻辑
        return orderRepository.save(order);
    }
    
    // 限流处理
    public Order createOrderBlockHandler(CreateOrderRequest request, BlockException ex) {
        throw new ServiceBusyException("System is busy, please try again later");
    }
    
    // 异常降级
    public Order createOrderFallback(CreateOrderRequest request, Throwable ex) {
        log.error("Create order failed", ex);
        throw new BusinessException("Failed to create order");
    }
}
```

## 负载均衡

### Spring Cloud LoadBalancer

```java
// ✅ 负载均衡配置
@Configuration
@LoadBalancerClient(name = "user-service", configuration = UserServiceLoadBalancerConfig.class)
public class LoadBalancerConfig {
}

public class UserServiceLoadBalancerConfig {
    
    @Bean
    public ReactorLoadBalancer<ServiceInstance> randomLoadBalancer(
            Environment environment,
            LoadBalancerClientFactory loadBalancerClientFactory) {
        String name = environment.getProperty(LoadBalancerClientFactory.PROPERTY_NAME);
        return new RandomLoadBalancer(
            loadBalancerClientFactory.getLazyProvider(name, ServiceInstanceListSupplier.class),
            name);
    }
}
```

```java
// ✅ 使用负载均衡的 RestTemplate
@Configuration
public class RestTemplateConfig {
    
    @Bean
    @LoadBalanced
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}

@Service
public class UserService {
    
    @Autowired
    private RestTemplate restTemplate;
    
    public User getUser(Long userId) {
        // 使用服务名调用，自动负载均衡
        return restTemplate.getForObject(
            "http://user-service/api/users/{id}", 
            User.class, 
            userId);
    }
}
```

## 链路追踪

### Micrometer + Zipkin

```yaml
# ✅ 链路追踪配置
management:
  tracing:
    sampling:
      probability: 1.0  # 采样率
  zipkin:
    tracing:
      endpoint: http://localhost:9411/api/v2/spans

spring:
  application:
    name: user-service
```

```java
// ✅ 自定义 Span
@Service
public class OrderService {
    
    @Autowired
    private Tracer tracer;
    
    @Autowired
    private ObservationRegistry observationRegistry;
    
    public Order createOrder(CreateOrderRequest request) {
        return Observation.createNotStarted("order.create", observationRegistry)
            .observe(() -> {
                // 创建子 Span
                Span childSpan = tracer.nextSpan().name("validateInventory").start();
                try (Tracer.SpanInScope ws = tracer.withSpanInScope(childSpan)) {
                    validateInventory(request);
                } finally {
                    childSpan.end();
                }
                
                // 业务逻辑
                return orderRepository.save(order);
            });
    }
}
```

## 最佳实践

1. **服务粒度**: 保持服务适中，避免过细或过粗
2. **接口契约**: 使用 OpenAPI 规范定义服务接口
3. **版本管理**: API 版本化，支持向后兼容
4. **容错设计**: 每个服务调用都应有降级策略
5. **监控告警**: 全面的 metrics 收集和告警机制
6. **日志聚合**: 统一的日志收集和分析平台
7. **安全设计**: 服务间通信加密，API 网关统一鉴权
