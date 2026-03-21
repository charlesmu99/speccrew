# {{platform_name}} 设计规范

> 平台: `{{platform_id}}` | 生成时间: `{{generated_at}}`

## 概述

本文档定义 {{platform_name}} 的设计规范和最佳实践，包括服务分解模式、服务间通信、分布式追踪、事件驱动架构等。

## 服务分解模式

### 领域驱动设计 (DDD)

```java
// ✅ 领域实体
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Embedded
    private OrderNumber orderNumber;
    
    @Enumerated(EnumType.STRING)
    private OrderStatus status;
    
    @Embedded
    private Money totalAmount;
    
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "order_id")
    private List<OrderItem> items = new ArrayList<>();
    
    @Embedded
    private ShippingAddress shippingAddress;
    
    // 领域行为
    public void pay(Payment payment) {
        if (this.status != OrderStatus.PENDING) {
            throw new IllegalStateException("Order is not pending");
        }
        this.status = OrderStatus.PAID;
        // 记录领域事件
        registerEvent(new OrderPaidEvent(this.id, payment.getAmount()));
    }
    
    public void ship(TrackingNumber trackingNumber) {
        if (this.status != OrderStatus.PAID) {
            throw new IllegalStateException("Order is not paid");
        }
        this.status = OrderStatus.SHIPPED;
        registerEvent(new OrderShippedEvent(this.id, trackingNumber));
    }
}

// ✅ 值对象
@Embeddable
public class Money {
    private BigDecimal amount;
    private String currency;
    
    public Money add(Money other) {
        if (!this.currency.equals(other.currency)) {
            throw new IllegalArgumentException("Currency mismatch");
        }
        return new Money(this.amount.add(other.amount), this.currency);
    }
}
```

### 分层架构

```
┌─────────────────────────────────────────────────────────────┐
│                      接口层 (Interfaces)                     │
│  Controller │  DTO │  Mapper │  Validator                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     应用层 (Application)                     │
│  Service │  UseCase │  EventHandler │  DTO Assembler         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      领域层 (Domain)                         │
│  Entity │  ValueObject │  DomainService │  DomainEvent       │
│  Repository Interface │  Specification                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    基础设施层 (Infrastructure)               │
│  RepositoryImpl │  ExternalService │  MessageQueue           │
│  Cache │  Database │  Config                                      │
└─────────────────────────────────────────────────────────────┘
```

```java
// ✅ 分层架构实现

// 接口层 - Controller
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderApplicationService orderService;
    
    @PostMapping
    public ResponseEntity<OrderDTO> createOrder(@RequestBody @Valid CreateOrderRequest request) {
        OrderDTO order = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }
}

// 应用层 - Application Service
@Service
@RequiredArgsConstructor
@Transactional
public class OrderApplicationService {
    private final OrderRepository orderRepository;
    private final OrderFactory orderFactory;
    private final DomainEventPublisher eventPublisher;
    
    public OrderDTO createOrder(CreateOrderRequest request) {
        // 1. 创建领域对象
        Order order = orderFactory.create(request);
        
        // 2. 持久化
        Order savedOrder = orderRepository.save(order);
        
        // 3. 发布领域事件
        eventPublisher.publishAll(order.getDomainEvents());
        
        // 4. 返回 DTO
        return OrderMapper.toDTO(savedOrder);
    }
}

// 领域层 - Domain Service
@Service
@RequiredArgsConstructor
public class PricingService {
    private final DiscountPolicy discountPolicy;
    
    public Money calculateTotalPrice(List<OrderItem> items, Coupon coupon) {
        Money subtotal = items.stream()
            .map(OrderItem::getSubtotal)
            .reduce(Money.ZERO, Money::add);
        
        Money discount = discountPolicy.calculateDiscount(subtotal, coupon);
        
        return subtotal.subtract(discount);
    }
}

// 基础设施层 - Repository Implementation
@Repository
@RequiredArgsConstructor
public class OrderRepositoryImpl implements OrderRepository {
    private final JpaOrderRepository jpaRepository;
    
    @Override
    public Optional<Order> findById(OrderId id) {
        return jpaRepository.findById(id.getValue())
            .map(this::toDomain);
    }
    
    @Override
    public Order save(Order order) {
        OrderPO po = toPO(order);
        OrderPO saved = jpaRepository.save(po);
        return toDomain(saved);
    }
}
```

## 服务间通信

### Feign 客户端

```java
// ✅ Feign 客户端定义
@FeignClient(
    name = "user-service",
    fallbackFactory = UserServiceClientFallbackFactory.class,
    configuration = UserServiceFeignConfig.class
)
public interface UserServiceClient {
    
    @GetMapping("/api/users/{id}")
    UserDTO getUserById(@PathVariable("id") Long id);
    
    @GetMapping("/api/users/batch")
    List<UserDTO> getUsersByIds(@RequestParam("ids") List<Long> ids);
    
    @PostMapping("/api/users/validate")
    ValidationResult validateUser(@RequestBody UserValidationRequest request);
}

// ✅ Fallback 实现
@Component
@Slf4j
public class UserServiceClientFallbackFactory implements FallbackFactory<UserServiceClient> {
    @Override
    public UserServiceClient create(Throwable cause) {
        log.error("User service call failed", cause);
        return new UserServiceClient() {
            @Override
            public UserDTO getUserById(Long id) {
                return UserDTO.builder()
                    .id(id)
                    .name("Unknown")
                    .status(UserStatus.UNKNOWN)
                    .build();
            }
            
            @Override
            public List<UserDTO> getUsersByIds(List<Long> ids) {
                return Collections.emptyList();
            }
            
            @Override
            public ValidationResult validateUser(UserValidationRequest request) {
                return ValidationResult.fail("Service unavailable");
            }
        };
    }
}

// ✅ Feign 配置
@Configuration
public class UserServiceFeignConfig {
    
    @Bean
    public RequestInterceptor requestInterceptor() {
        return requestTemplate -> {
            // 传递上下文信息
            requestTemplate.header("X-Request-Id", MDC.get("requestId"));
            requestTemplate.header("X-User-Id", SecurityContextHolder.getUserId());
        };
    }
    
    @Bean
    public ErrorDecoder errorDecoder() {
        return (methodKey, response) -> {
            if (response.status() == 404) {
                return new UserNotFoundException("User not found");
            }
            return new ServiceException("User service error");
        };
    }
}
```

### RestTemplate 使用

```java
// ✅ RestTemplate 配置
@Configuration
public class RestTemplateConfig {
    
    @Bean
    @LoadBalanced
    public RestTemplate restTemplate() {
        RestTemplate restTemplate = new RestTemplate();
        
        // 添加拦截器
        restTemplate.setInterceptors(List.of(
            new ContextPropagationInterceptor(),
            new LoggingInterceptor()
        ));
        
        // 配置错误处理
        restTemplate.setErrorHandler(new CustomResponseErrorHandler());
        
        return restTemplate;
    }
}

// ✅ 使用 RestTemplate
@Service
@RequiredArgsConstructor
public class InventoryService {
    private final RestTemplate restTemplate;
    
    public InventoryStatus checkInventory(Long productId, Integer quantity) {
        ResponseEntity<InventoryResponse> response = restTemplate.exchange(
            "http://inventory-service/api/inventory/{productId}/check?quantity={quantity}",
            HttpMethod.GET,
            new HttpEntity<>(createHeaders()),
            InventoryResponse.class,
            productId,
            quantity
        );
        
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            return response.getBody().getStatus();
        }
        throw new ServiceException("Failed to check inventory");
    }
}
```

### WebClient (响应式)

```java
// ✅ WebClient 配置
@Configuration
public class WebClientConfig {
    
    @Bean
    @LoadBalanced
    public WebClient.Builder webClientBuilder() {
        return WebClient.builder()
            .filter(ExchangeFilterFunction.ofRequestProcessor(request -> {
                // 添加请求头
                ClientRequest modified = ClientRequest.from(request)
                    .header("X-Request-Id", MDC.get("requestId"))
                    .build();
                return Mono.just(modified);
            }))
            .filter(ExchangeFilterFunction.ofResponseProcessor(response -> {
                // 响应处理
                return Mono.just(response);
            }));
    }
}

// ✅ 使用 WebClient
@Service
@RequiredArgsConstructor
public class AsyncPaymentService {
    private final WebClient.Builder webClientBuilder;
    
    public Mono<PaymentResult> processPaymentAsync(PaymentRequest request) {
        return webClientBuilder.build()
            .post()
            .uri("http://payment-service/api/payments")
            .bodyValue(request)
            .retrieve()
            .onStatus(HttpStatusCode::is4xxClientError, response -> 
                Mono.error(new PaymentValidationException("Invalid payment request")))
            .onStatus(HttpStatusCode::is5xxServerError, response -> 
                Mono.error(new PaymentServiceException("Payment service error")))
            .bodyToMono(PaymentResult.class)
            .timeout(Duration.ofSeconds(10))
            .retryWhen(Retry.backoff(3, Duration.ofSeconds(1)))
            .doOnError(error -> log.error("Payment failed", error));
    }
    
    public Flux<Transaction> getTransactions(Long userId) {
        return webClientBuilder.build()
            .get()
            .uri("http://payment-service/api/users/{userId}/transactions", userId)
            .retrieve()
            .bodyToFlux(Transaction.class);
    }
}
```

## 分布式追踪

### Sleuth + Zipkin 集成

```java
// ✅ 自定义 Trace 信息
@Service
@RequiredArgsConstructor
public class OrderService {
    private final Tracer tracer;
    
    public Order createOrder(CreateOrderRequest request) {
        Span span = tracer.nextSpan().name("create-order").start();
        
        try (Tracer.SpanInScope ws = tracer.withSpanInScope(span)) {
            // 添加自定义标签
            span.tag("order.userId", request.getUserId().toString());
            span.tag("order.itemCount", String.valueOf(request.getItems().size()));
            
            // 记录事件
            span.event("Order validation started");
            validateOrder(request);
            
            span.event("Order persistence started");
            Order order = orderRepository.save(order);
            
            span.tag("order.id", order.getId().toString());
            
            return order;
        } catch (Exception e) {
            span.error(e);
            throw e;
        } finally {
            span.end();
        }
    }
}

// ✅ MDC 上下文传递
@Component
public class MDCFilter implements Filter {
    
    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String requestId = httpRequest.getHeader("X-Request-Id");
        
        if (StringUtils.isEmpty(requestId)) {
            requestId = UUID.randomUUID().toString();
        }
        
        MDC.put("requestId", requestId);
        MDC.put("userId", SecurityContextHolder.getContext().getAuthentication().getName());
        
        try {
            chain.doFilter(request, response);
        } finally {
            MDC.clear();
        }
    }
}
```

### Micrometer Observation

```java
// ✅ Observation API 使用
@Service
@RequiredArgsConstructor
public class ProductService {
    private final ObservationRegistry observationRegistry;
    
    public Product getProduct(Long productId) {
        return Observation.createNotStarted("product.get", observationRegistry)
            .contextualName("get-product-by-id")
            .lowCardinalityKeyValue("product.id", productId.toString())
            .highCardinalityKeyValue("product.category", getCategory(productId))
            .observe(() -> {
                // 业务逻辑
                return productRepository.findById(productId)
                    .orElseThrow(() -> new ProductNotFoundException(productId));
            });
    }
}

// ✅ 自定义 Observation Handler
@Component
public class CustomObservationHandler implements ObservationHandler<Observation.Context> {
    
    @Override
    public void onStart(Observation.Context context) {
        log.info("Observation started: {}", context.getName());
    }
    
    @Override
    public void onStop(Observation.Context context) {
        log.info("Observation stopped: {}", context.getName());
    }
    
    @Override
    public boolean supportsContext(Observation.Context context) {
        return true;
    }
}
```

## 事件驱动架构

### Spring Cloud Stream

```java
// ✅ 事件定义
public interface DomainEvent {
    String getEventId();
    String getEventType();
    Long getTimestamp();
}

@Data
@Builder
public class OrderCreatedEvent implements DomainEvent {
    private String eventId;
    private String eventType = "OrderCreated";
    private Long timestamp;
    private Long orderId;
    private Long userId;
    private BigDecimal amount;
    private List<OrderItemEvent> items;
}

// ✅ 事件发布
@Service
@RequiredArgsConstructor
public class OrderEventPublisher {
    private final StreamBridge streamBridge;
    
    public void publishOrderCreated(Order order) {
        OrderCreatedEvent event = OrderCreatedEvent.builder()
            .eventId(UUID.randomUUID().toString())
            .timestamp(System.currentTimeMillis())
            .orderId(order.getId())
            .userId(order.getUserId())
            .amount(order.getTotalAmount().getAmount())
            .items(mapItems(order.getItems()))
            .build();
        
        streamBridge.send("order-created-out-0", event);
    }
}

// ✅ 事件消费
@Component
@RequiredArgsConstructor
@Slf4j
public class OrderEventConsumer {
    private final InventoryService inventoryService;
    private final NotificationService notificationService;
    
    @Bean
    public Consumer<OrderCreatedEvent> handleOrderCreated() {
        return event -> {
            log.info("Received order created event: {}", event.getEventId());
            
            // 扣减库存
            inventoryService.reserveStock(event.getOrderId(), event.getItems());
            
            // 发送通知
            notificationService.sendOrderConfirmation(event.getUserId(), event.getOrderId());
        };
    }
    
    @Bean
    public Consumer<PaymentCompletedEvent> handlePaymentCompleted() {
        return event -> {
            log.info("Payment completed for order: {}", event.getOrderId());
            // 处理支付完成逻辑
        };
    }
}
```

```yaml
# ✅ Spring Cloud Stream 配置
spring:
  cloud:
    stream:
      bindings:
        # 输出通道
        order-created-out-0:
          destination: order-events
          content-type: application/json
        
        # 输入通道
        order-created-in-0:
          destination: order-events
          group: inventory-service
          consumer:
            max-attempts: 3
            back-off-initial-interval: 1000
            back-off-max-interval: 10000
        
        payment-completed-in-0:
          destination: payment-events
          group: order-service
      
      kafka:
        binder:
          brokers: localhost:9092
          auto-create-topics: true
        bindings:
          order-created-in-0:
            consumer:
              enable-dlq: true
              dlq-name: order-events-dlq
```

### 事务消息

```java
// ✅ 事务消息发送
@Service
@RequiredArgsConstructor
public class TransactionalEventService {
    private final StreamBridge streamBridge;
    private final TransactionTemplate transactionTemplate;
    
    public void createOrderWithEvent(CreateOrderRequest request) {
        transactionTemplate.execute(status -> {
            // 1. 保存订单
            Order order = orderRepository.save(createOrder(request));
            
            // 2. 记录待发送事件
            OutboxEvent outboxEvent = OutboxEvent.builder()
                .id(UUID.randomUUID().toString())
                .aggregateType("Order")
                .aggregateId(order.getId().toString())
                .eventType("OrderCreated")
                .payload(toJson(new OrderCreatedEvent(order)))
                .status(EventStatus.PENDING)
                .build();
            
            outboxRepository.save(outboxEvent);
            
            return order;
        });
        
        // 3. 异步发送事件（由定时任务或监听器处理）
    }
}

// ✅ Outbox 模式定时发送
@Component
@RequiredArgsConstructor
public class OutboxPoller {
    private final OutboxRepository outboxRepository;
    private final StreamBridge streamBridge;
    
    @Scheduled(fixedRate = 5000)
    public void pollAndSend() {
        List<OutboxEvent> pendingEvents = outboxRepository
            .findByStatusOrderByCreatedAt(EventStatus.PENDING, PageRequest.of(0, 100));
        
        for (OutboxEvent event : pendingEvents) {
            try {
                streamBridge.send(event.getEventType(), deserialize(event.getPayload()));
                event.setStatus(EventStatus.SENT);
                outboxRepository.save(event);
            } catch (Exception e) {
                log.error("Failed to send event: {}", event.getId(), e);
                event.setRetryCount(event.getRetryCount() + 1);
                if (event.getRetryCount() >= 3) {
                    event.setStatus(EventStatus.FAILED);
                }
                outboxRepository.save(event);
            }
        }
    }
}
```

## Spring Cloud 设计原则

### 配置外部化

```java
// ✅ 配置属性类
@ConfigurationProperties(prefix = "app.order")
@Data
@Component
@Validated
public class OrderProperties {
    
    @NotNull
    private Duration timeout = Duration.ofMinutes(30);
    
    @Min(1)
    @Max(100)
    private int maxItemsPerOrder = 50;
    
    @NotEmpty
    private List<String> supportedCurrencies = List.of("CNY", "USD");
    
    private Map<String, BigDecimal> shippingRates = new HashMap<>();
}

// ✅ 使用配置
@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderProperties orderProperties;
    
    public void validateOrder(CreateOrderRequest request) {
        if (request.getItems().size() > orderProperties.getMaxItemsPerOrder()) {
            throw new ValidationException("Order exceeds maximum items limit");
        }
        
        if (!orderProperties.getSupportedCurrencies().contains(request.getCurrency())) {
            throw new ValidationException("Unsupported currency");
        }
    }
}
```

### 熔断与降级

```java
// ✅ 熔断器设计原则
@Service
@RequiredArgsConstructor
public class ResilientPaymentService {
    
    // 1. 为每个外部服务调用配置独立的熔断器
    @CircuitBreaker(name = "paymentGateway", fallbackMethod = "processPaymentFallback")
    @Retry(name = "paymentGateway")
    @TimeLimiter(name = "paymentGateway")
    public PaymentResult processPayment(PaymentRequest request) {
        return paymentGatewayClient.charge(request);
    }
    
    // 2. 降级策略
    private PaymentResult processPaymentFallback(PaymentRequest request, Exception ex) {
        log.warn("Payment gateway unavailable, using offline processing", ex);
        
        // 记录待处理支付
        pendingPaymentRepository.save(PendingPayment.from(request));
        
        return PaymentResult.builder()
            .status(PaymentStatus.PENDING)
            .message("Payment queued for processing")
            .build();
    }
    
    // 3. 批量处理降级请求
    @Scheduled(fixedRate = 60000)
    public void processPendingPayments() {
        List<PendingPayment> pending = pendingPaymentRepository.findByStatus(PaymentStatus.PENDING);
        for (PendingPayment payment : pending) {
            try {
                PaymentResult result = paymentGatewayClient.charge(payment.toRequest());
                payment.setStatus(result.getStatus());
            } catch (Exception e) {
                log.error("Failed to process pending payment: {}", payment.getId(), e);
            }
        }
    }
}
```

### 幂等性设计

```java
// ✅ 幂等性实现
@Service
@RequiredArgsConstructor
public class IdempotentOrderService {
    private final IdempotencyKeyRepository idempotencyRepository;
    
    @Transactional
    public Order createOrder(String idempotencyKey, CreateOrderRequest request) {
        // 1. 检查幂等键
        Optional<IdempotencyRecord> existing = idempotencyRepository.findByKey(idempotencyKey);
        if (existing.isPresent()) {
            // 返回已处理的结果
            return orderRepository.findById(existing.get().getOrderId())
                .orElseThrow(() -> new OrderNotFoundException());
        }
        
        // 2. 执行业务逻辑
        Order order = doCreateOrder(request);
        
        // 3. 保存幂等记录
        idempotencyRepository.save(IdempotencyRecord.builder()
            .key(idempotencyKey)
            .orderId(order.getId())
            .createdAt(Instant.now())
            .build());
        
        return order;
    }
}

// ✅ 分布式锁实现幂等
@Service
@RequiredArgsConstructor
public class DistributedIdempotentService {
    private final StringRedisTemplate redisTemplate;
    
    public Order createOrderWithLock(String idempotencyKey, CreateOrderRequest request) {
        String lockKey = "idempotency:" + idempotencyKey;
        Boolean locked = redisTemplate.opsForValue()
            .setIfAbsent(lockKey, "1", Duration.ofMinutes(5));
        
        if (!Boolean.TRUE.equals(locked)) {
            throw new DuplicateRequestException("Request already in processing");
        }
        
        try {
            return doCreateOrder(request);
        } finally {
            redisTemplate.delete(lockKey);
        }
    }
}
```

### 安全设计

```java
// ✅ 服务间安全通信
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/actuator/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .anyRequest().authenticated())
            .oauth2ResourceServer(oauth2 -> 
                oauth2.jwt(jwt -> jwt.decoder(jwtDecoder())));
        
        return http.build();
    }
}

// ✅ 服务间调用认证
@Configuration
public class FeignSecurityConfig {
    
    @Bean
    public RequestInterceptor serviceTokenInterceptor() {
        return requestTemplate -> {
            // 添加服务间调用令牌
            String serviceToken = generateServiceToken();
            requestTemplate.header("X-Service-Token", serviceToken);
            
            // 传递用户上下文
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null) {
                requestTemplate.header("X-User-Id", auth.getName());
                requestTemplate.header("X-User-Roles", 
                    auth.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .collect(Collectors.joining(",")));
            }
        };
    }
    
    private String generateServiceToken() {
        // 使用 JWT 或其他机制生成服务令牌
        return JwtUtil.generateServiceToken();
    }
}
```

## 最佳实践

1. **API 设计**: 使用 OpenAPI 规范，保持接口一致性
2. **版本控制**: API 版本化，支持平滑升级
3. **错误处理**: 统一的错误响应格式
4. **日志规范**: 结构化日志，包含 traceId
5. **监控指标**: 关键业务指标和系统指标
6. **限流降级**: 保护系统稳定性
7. **数据一致性**: 最终一致性，使用 Saga 或 TCC 模式
