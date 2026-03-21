# {{platform_name}} 设计规范

> 平台: `{{platform_id}}` | 生成时间: `{{generated_at}}`

## 概述

本文档定义 {{platform_name}} 的设计规范和最佳实践，包括 DTO 设计、实体设计、API 设计等。

## DTO 设计

### 基础规范

使用 `class-validator` 和 `class-transformer` 进行验证和转换：

```typescript
// ✅ Create DTO 示例
import { IsString, IsEmail, IsOptional, IsEnum, Length, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateUserDto {
  @IsString()
  @Length(2, 50)
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(8, 32)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase and number',
  })
  password: string;

  @IsOptional()
  @IsEnum(['admin', 'user', 'guest'])
  role?: string = 'user';
}
```

### Update DTO

使用 `PartialType` 从 Create DTO 派生：

```typescript
// ✅ Update DTO 示例
import { PartialType, OmitType } from '@nestjs/mapped-types';

// 方式1: 全部可选
export class UpdateUserDto extends PartialType(CreateUserDto) {}

// 方式2: 排除特定字段
export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['email'] as const),
) {}
```

### 响应 DTO

定义专门的响应 DTO 控制返回数据：

```typescript
// ✅ 响应 DTO 示例
import { Exclude, Expose, Transform } from 'class-transformer';

@Exclude()
export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  name: string;

  @Expose()
  email: string;

  @Expose()
  @Transform(({ value }) => value?.toISOString())
  createdAt: Date;

  @Expose()
  @Transform(({ obj }) => obj.profile?.avatar)
  avatar: string;
}

// 在 Service 中使用
return plainToInstance(UserResponseDto, user);
```

### 分页 DTO

```typescript
// ✅ 分页请求 DTO
export class PaginationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 10;
}

// ✅ 分页响应 DTO
export class PaginatedResponseDto<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

### 验证装饰器常用组合

```typescript
export class ExampleDto {
  // 字符串验证
  @IsString()
  @Length(1, 100)
  @Transform(({ value }) => value?.trim())
  title: string;

  // 数字验证
  @IsNumber()
  @Min(0)
  @Max(999999)
  @Transform(({ value }) => parseFloat(value))
  price: number;

  // 布尔值验证
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive: boolean;

  // 数组验证
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  // 嵌套对象验证
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  // 日期验证
  @IsDate()
  @Transform(({ value }) => new Date(value))
  birthDate: Date;

  // UUID 验证
  @IsUUID()
  categoryId: string;

  // 枚举验证
  @IsEnum(Status)
  status: Status;

  // 可选字段
  @IsOptional()
  @IsString()
  description?: string;
}
```

## 实体设计

### TypeORM 实体

```typescript
// ✅ TypeORM 实体示例
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';

@Entity('users')
@Index(['email'], { unique: true })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })  // 默认不查询
  password: string;

  @Column({ type: 'enum', enum: ['admin', 'user'], default: 'user' })
  role: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @ManyToOne(() => DepartmentEntity, (dept) => dept.users)
  @JoinColumn({ name: 'department_id' })
  department: DepartmentEntity;

  @OneToMany(() => OrderEntity, (order) => order.user)
  orders: OrderEntity[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
```

### Prisma 实体

```typescript
// ✅ Prisma Schema 示例
// schema.prisma

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String
  password  String
  role      Role     @default(USER)
  profile   Profile?
  posts     Post[]
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  @@map("users")
}

model Profile {
  id     String  @id @default(uuid())
  bio    String?
  avatar String?
  userId String  @unique @map("user_id")
  user   User    @relation(fields: [userId], references: [id])

  @@map("profiles")
}

model Post {
  id       String @id @default(uuid())
  title    String
  content  String
  authorId String @map("author_id")
  author   User   @relation(fields: [authorId], references: [id])

  @@map("posts")
}

enum Role {
  ADMIN
  USER
  GUEST
}
```

### 实体设计原则

1. **命名规范**: 使用 PascalCase，后缀 `Entity` 或对应模型名
2. **表名映射**: 使用蛇形命名法的复数形式
3. **软删除**: 使用 `@DeleteDateColumn` 或对应 Prisma 字段
4. **时间戳**: 必须包含 `createdAt` 和 `updatedAt`
5. **字段选择**: 敏感字段使用 `select: false`

## API 设计模式

### RESTful API 规范

```typescript
// ✅ RESTful Controller 示例
@Controller('api/v1/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 获取列表 (支持分页、过滤、排序)
  @Get()
  async findAll(
    @Query() paginationDto: PaginationDto,
    @Query() filterDto: UserFilterDto,
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    return this.userService.findAll(paginationDto, filterDto);
  }

  // 获取单个资源
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.userService.findOne(id);
  }

  // 创建资源
  @Post()
  async create(@Body() createDto: CreateUserDto): Promise<UserResponseDto> {
    return this.userService.create(createDto);
  }

  // 全量更新
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.update(id, updateDto);
  }

  // 部分更新
  @Patch(':id')
  async partialUpdate(
    @Param('id') id: string,
    @Body() updateDto: PartialUpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.userService.partialUpdate(id, updateDto);
  }

  // 删除资源
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    return this.userService.remove(id);
  }
}
```

### HTTP 状态码规范

| 状态码 | 使用场景 |
|--------|----------|
| 200 OK | GET, PUT, PATCH 成功 |
| 201 Created | POST 创建成功 |
| 204 No Content | DELETE 成功 |
| 400 Bad Request | 请求参数错误 |
| 401 Unauthorized | 未认证 |
| 403 Forbidden | 无权限 |
| 404 Not Found | 资源不存在 |
| 409 Conflict | 资源冲突 |
| 422 Unprocessable Entity | 验证失败 |
| 500 Internal Server Error | 服务器错误 |

### 路由设计规范

```typescript
// ✅ 路由设计示例
@Controller('api/v1')
export class OrderController {
  // 嵌套资源
  @Get('users/:userId/orders')
  async findUserOrders(@Param('userId') userId: string) {}

  // 资源操作
  @Post('orders/:id/cancel')
  async cancelOrder(@Param('id') id: string) {}

  @Post('orders/:id/confirm')
  async confirmOrder(@Param('id') id: string) {}

  // 批量操作
  @Post('orders/bulk-delete')
  async bulkDelete(@Body() dto: BulkDeleteDto) {}
}
```

## 装饰器使用模式

### 自定义参数装饰器

```typescript
// ✅ 当前用户装饰器
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    
    return data ? user?.[data] : user;
  },
);

// 使用
@Get('profile')
async getProfile(@CurrentUser() user: User) {}

@Get('email')
async getEmail(@CurrentUser('email') email: string) {}
```

### 自定义方法装饰器

```typescript
// ✅ Public 路由装饰器
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

// 使用
@Public()
@Post('login')
async login(@Body() dto: LoginDto) {}
```

### 装饰器组合

```typescript
// ✅ 装饰器组合
import { applyDecorators } from '@nestjs/common';

export function Auth(...roles: Role[]) {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(...roles),
  );
}

// 使用
@Auth('admin', 'manager')
@Delete(':id')
async remove(@Param('id') id: string) {}
```

## NestJS 设计原则

### SOLID 原则应用

1. **单一职责 (SRP)**: 每个类只负责一个功能
   ```typescript
   // ✅ 分离职责
   @Injectable()
   export class UserService {
     // 只处理用户业务逻辑
   }

   @Injectable()
   export class EmailService {
     // 只处理邮件发送
   }
   ```

2. **开闭原则 (OCP)**: 对扩展开放，对修改关闭
   ```typescript
   // ✅ 使用策略模式
   export interface PaymentStrategy {
     pay(amount: number): Promise<void>;
   }

   @Injectable()
   export class PaymentService {
     constructor(
       @Inject('PAYMENT_STRATEGIES')
       private strategies: PaymentStrategy[],
     ) {}
   }
   ```

3. **里氏替换 (LSP)**: 子类可替换父类
   ```typescript
   // ✅ 接口实现
   export interface Repository<T> {
     findById(id: string): Promise<T>;
     save(entity: T): Promise<T>;
   }
   ```

4. **接口隔离 (ISP)**: 客户端不依赖不需要的接口
   ```typescript
   // ✅ 细分接口
   export interface Readable {
     findById(id: string): Promise<any>;
     findAll(): Promise<any[]>;
   }

   export interface Writable {
     create(data: any): Promise<any>;
     update(id: string, data: any): Promise<any>;
     delete(id: string): Promise<void>;
   }
   ```

5. **依赖倒置 (DIP)**: 依赖抽象而非具体实现
   ```typescript
   // ✅ 依赖接口
   @Injectable()
   export class UserService {
     constructor(
       @Inject('USER_REPOSITORY')
       private readonly userRepository: IUserRepository,
     ) {}
   }
   ```

### 异步处理模式

```typescript
// ✅ 使用 Async/Await
@Injectable()
export class OrderService {
  async processOrder(orderId: string): Promise<void> {
    const order = await this.findOrder(orderId);
    await this.validateOrder(order);
    await this.paymentService.charge(order);
    await this.notificationService.sendConfirmation(order);
  }
}

// ✅ 使用事件驱动
@Injectable()
export class OrderService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const order = await this.orderRepository.create(dto);
    
    // 异步触发事件
    this.eventEmitter.emit('order.created', order);
    
    return order;
  }
}

// 事件监听
@OnEvent('order.created')
async handleOrderCreated(order: Order) {
  await this.emailService.sendOrderConfirmation(order);
}
```

### 配置管理

```typescript
// ✅ 配置模块
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      load: [databaseConfig, jwtConfig],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('dev', 'prod', 'test').default('dev'),
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().required(),
      }),
    }),
  ],
})
export class AppConfigModule {}

// 使用配置
@Injectable()
export class DatabaseService {
  constructor(private configService: ConfigService) {}

  getDatabaseUrl(): string {
    return this.configService.get<string>('DATABASE_URL');
  }
}
```

## 安全设计

### 输入验证

```typescript
// ✅ 严格验证所有输入
@Controller('users')
export class UserController {
  @Post()
  async create(
    @Body(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }))
    dto: CreateUserDto,
  ) {}
}
```

### 敏感数据处理

```typescript
// ✅ 排除敏感字段
@Entity()
export class User {
  @Column({ select: false })
  password: string;
}

// ✅ 响应 DTO 控制输出
@Exclude()
export class UserResponseDto {
  @Expose()
  id: string;
  
  // password 不被暴露
}
```

### 速率限制

```typescript
// ✅ 速率限制
@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        { ttl: 60000, limit: 10 },  // 1分钟10次
      ],
    }),
  ],
})
export class AppModule {}

@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {}
```
