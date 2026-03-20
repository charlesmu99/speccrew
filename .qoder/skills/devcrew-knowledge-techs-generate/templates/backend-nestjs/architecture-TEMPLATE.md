# {{platform_name}} 架构规范

> 平台: `{{platform_id}}` | 生成时间: `{{generated_at}}`

## 概述

本文档定义 {{platform_name}} 的架构模式和设计原则，基于 NestJS 框架的最佳实践。

## 分层架构

### 1. 控制器层 (Controller)

负责处理 HTTP 请求和响应，是 API 的入口点。

```typescript
// ✅ 正确的 Controller 示例
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    return this.userService.findOne(id);
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }
}
```

**Controller 职责:**
- 处理 HTTP 请求路由
- 参数验证和转换
- 调用 Service 层业务逻辑
- 返回 HTTP 响应

**Controller 禁止:**
- ❌ 直接访问数据库
- ❌ 包含业务逻辑
- ❌ 处理事务管理

### 2. 服务层 (Service)

包含核心业务逻辑，是应用程序的核心。

```typescript
// ✅ 正确的 Service 示例
@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailService: EmailService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // 业务逻辑验证
    const existingUser = await this.userRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // 执行业务操作
    const user = await this.userRepository.create(createUserDto);
    
    // 触发相关操作
    await this.emailService.sendWelcomeEmail(user.email);
    
    return user;
  }
}
```

**Service 职责:**
- 实现业务逻辑
- 协调多个 Repository 操作
- 事务管理
- 业务规则验证

### 3. 数据访问层 (Repository)

负责与数据库交互，封装数据访问逻辑。

```typescript
// ✅ 使用 TypeORM 的 Repository 示例
@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.repository.findOne({ where: { email } });
  }

  async create(data: CreateUserDto): Promise<UserEntity> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }
}
```

**Repository 职责:**
- 数据库查询和操作
- 实体映射
- 查询优化

## 模块组织

### 模块结构

```
src/
├── modules/                 # 功能模块
│   ├── users/              # 用户模块
│   │   ├── dto/            # 数据传输对象
│   │   ├── entities/       # 数据库实体
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   └── users.repository.ts
│   └── orders/             # 订单模块
│       └── ...
├── common/                 # 共享模块
│   ├── decorators/         # 自定义装饰器
│   ├── filters/            # 异常过滤器
│   ├── guards/             # 守卫
│   ├── interceptors/       # 拦截器
│   ├── pipes/              # 管道
│   └── utils/              # 工具函数
├── config/                 # 配置模块
├── database/               # 数据库配置
└── main.ts                 # 应用入口
```

### 模块定义

```typescript
// ✅ 正确的 Module 示例
@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    forwardRef(() => AuthModule),  // 解决循环依赖
  ],
  controllers: [UserController],
  providers: [UserService, UserRepository],
  exports: [UserService],  // 导出供其他模块使用
})
export class UserModule {}
```

### 模块依赖原则

1. **单向依赖**: 避免循环依赖，使用 `forwardRef` 仅在必要时
2. **显式导出**: 只导出其他模块需要的服务
3. **功能内聚**: 每个模块应包含完整的功能领域

## 依赖注入

### 构造函数注入

NestJS 推荐使用构造函数注入：

```typescript
// ✅ 构造函数注入
@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly userService: UserService,
    private readonly paymentService: PaymentService,
  ) {}
}
```

### 注入令牌

使用自定义提供者时，使用注入令牌：

```typescript
// ✅ 使用 InjectionToken
export const DATABASE_CONNECTION = Symbol('DATABASE_CONNECTION');

@Module({
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: async (configService: ConfigService) => {
        // 创建连接
      },
      inject: [ConfigService],
    },
  ],
})
export class DatabaseModule {}

// 使用
@Injectable()
export class UserRepository {
  constructor(
    @Inject(DATABASE_CONNECTION)
    private readonly connection: Connection,
  ) {}
}
```

## 中间件 (Middleware)

中间件在路由处理之前执行，用于处理请求预处理。

```typescript
// ✅ Logger 中间件示例
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  }
}

// 在模块中配置
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
```

**使用场景:**
- 请求日志记录
- CORS 处理
- 请求头处理
- 身份验证预处理

## 守卫 (Guards)

守卫决定请求是否会被路由处理程序处理。

```typescript
// ✅ JWT 认证守卫示例
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException();
    }
    
    try {
      const payload = await this.jwtService.verifyAsync(token);
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

// 使用守卫
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {}
```

**使用场景:**
- 身份验证
- 权限授权
- 角色检查
- IP 限制

## 拦截器 (Interceptors)

拦截器在请求处理之前和之后执行，用于转换响应或添加副作用。

```typescript
// ✅ 响应转换拦截器
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((data) => ({
        code: 200,
        message: 'success',
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}

// ✅ 缓存拦截器
@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(private readonly cacheManager: Cache) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const cacheKey = `${request.url}`;
    
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return of(cached);
    }
    
    return next.handle().pipe(
      tap(async (data) => {
        await this.cacheManager.set(cacheKey, data, 60000);
      }),
    );
  }
}
```

**使用场景:**
- 响应格式统一
- 缓存处理
- 日志记录
- 超时处理
- 异常转换

## 管道 (Pipes)

管道用于转换输入数据或验证数据。

```typescript
// ✅ 验证管道配置
@Module({
  providers: [
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,        // 去除未定义的属性
        forbidNonWhitelisted: true,  // 拒绝未定义的属性
        transform: true,        // 自动转换类型
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    },
  ],
})
export class AppModule {}
```

**内置管道:**
- `ValidationPipe` - 验证 DTO
- `ParseIntPipe` - 转换为整数
- `ParseBoolPipe` - 转换为布尔值
- `ParseArrayPipe` - 转换为数组
- `ParseUUIDPipe` - 验证 UUID

## 异常过滤器 (Exception Filters)

统一处理应用程序中的异常。

```typescript
// ✅ 全局异常过滤器
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message: exception instanceof Error ? exception.message : 'Internal server error',
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}

// 在 main.ts 中全局注册
app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
```

## 目录结构规范

```
src/
├── main.ts                    # 应用入口
├── app.module.ts              # 根模块
├── app.controller.ts          # 根控制器
├── app.service.ts             # 根服务
│
├── modules/                   # 业务模块
│   ├── users/
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   ├── update-user.dto.ts
│   │   │   └── user-response.dto.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.module.ts
│   │   └── users.repository.ts
│   └── ...
│
├── common/                    # 共享资源
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   └── public.decorator.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── interceptors/
│   │   ├── transform.interceptor.ts
│   │   └── logging.interceptor.ts
│   ├── pipes/
│   │   └── parse-int.pipe.ts
│   └── utils/
│       └── date.util.ts
│
├── config/                    # 配置
│   ├── database.config.ts
│   ├── jwt.config.ts
│   └── app.config.ts
│
└── database/                  # 数据库
    ├── migrations/
    └── seeds/
```

## 最佳实践

1. **单一职责**: 每个类只负责一个功能
2. **依赖注入**: 使用构造函数注入依赖
3. **接口隔离**: 使用接口定义契约
4. **错误处理**: 使用异常过滤器统一处理
5. **日志记录**: 使用拦截器或中间件记录日志
6. **输入验证**: 使用 ValidationPipe 验证所有输入
7. **响应格式**: 使用拦截器统一响应格式
