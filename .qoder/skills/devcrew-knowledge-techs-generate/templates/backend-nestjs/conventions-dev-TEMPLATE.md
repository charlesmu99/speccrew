# {{platform_name}} 开发规范

> 平台: `{{platform_id}}` | 生成时间: `{{generated_at}}`

## 概述

本文档定义 {{platform_name}} 的开发规范，包括文件命名、类命名、代码风格等。

## 文件命名规范

### 基本规则

| 类型 | 命名格式 | 示例 |
|------|----------|------|
| Controller | `[name].controller.ts` | `users.controller.ts` |
| Service | `[name].service.ts` | `users.service.ts` |
| Module | `[name].module.ts` | `users.module.ts` |
| Repository | `[name].repository.ts` | `users.repository.ts` |
| Entity | `[name].entity.ts` | `user.entity.ts` |
| DTO | `[name].dto.ts` | `create-user.dto.ts` |
| Guard | `[name].guard.ts` | `jwt-auth.guard.ts` |
| Interceptor | `[name].interceptor.ts` | `transform.interceptor.ts` |
| Filter | `[name].filter.ts` | `http-exception.filter.ts` |
| Pipe | `[name].pipe.ts` | `validation.pipe.ts` |
| Decorator | `[name].decorator.ts` | `current-user.decorator.ts` |
| Middleware | `[name].middleware.ts` | `logger.middleware.ts` |
| Strategy | `[name].strategy.ts` | `jwt.strategy.ts` |
| Config | `[name].config.ts` | `database.config.ts` |
| Util | `[name].util.ts` | `date.util.ts` |
| Enum | `[name].enum.ts` | `user-role.enum.ts` |
| Interface | `[name].interface.ts` | `user.interface.ts` |
| Test | `[name].spec.ts` | `users.service.spec.ts` |
| E2E Test | `[name].e2e-spec.ts` | `users.e2e-spec.ts` |

### 目录命名

```
✅ 推荐
src/
├── modules/
│   ├── users/              # 复数形式
│   ├── orders/
│   └── products/
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── pipes/
│   └── utils/
└── config/

❌ 避免
src/
├── Modules/                # 大写
├── user/                   # 单数
├── order-management/       # 连字符
└── common/decorator/       # 单数
```

## 类命名规范

### 命名格式

使用 **PascalCase** 并添加适当的后缀：

| 类型 | 命名格式 | 示例 |
|------|----------|------|
| Controller | `NameController` | `UsersController` |
| Service | `NameService` | `UsersService` |
| Module | `NameModule` | `UsersModule` |
| Repository | `NameRepository` | `UsersRepository` |
| Entity | `NameEntity` | `UserEntity` |
| DTO | `NameDto` | `CreateUserDto` |
| Guard | `NameGuard` | `JwtAuthGuard` |
| Interceptor | `NameInterceptor` | `TransformInterceptor` |
| Filter | `NameFilter` | `HttpExceptionFilter` |
| Pipe | `NamePipe` | `ValidationPipe` |
| Middleware | `NameMiddleware` | `LoggerMiddleware` |
| Strategy | `NameStrategy` | `JwtStrategy` |
| Exception | `NameException` | `BusinessException` |
| Enum | `Name` 或 `NameEnum` | `UserRole` |
| Interface | `Name` 或 `IName` | `IUserRepository` |

### 示例

```typescript
// ✅ Controller
@Controller('users')
export class UsersController {}

// ✅ Service
@Injectable()
export class UsersService {}

// ✅ Module
@Module({})
export class UsersModule {}

// ✅ Repository
@Injectable()
export class UsersRepository {}

// ✅ Entity
@Entity('users')
export class UserEntity {}

// ✅ DTO
export class CreateUserDto {}
export class UpdateUserDto {}
export class UserResponseDto {}

// ✅ Guard
@Injectable()
export class JwtAuthGuard implements CanActivate {}

// ✅ Interceptor
@Injectable()
export class TransformInterceptor implements NestInterceptor {}

// ✅ Filter
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {}
```

## 变量与函数命名

### 变量命名

```typescript
// ✅ 使用 camelCase
const userName: string;
const isActive: boolean;
const userList: User[];
const userMap: Map<string, User>;

// ✅ 常量使用 UPPER_SNAKE_CASE
const MAX_RETRY_COUNT = 3;
const DEFAULT_TIMEOUT = 5000;
const API_BASE_URL = 'https://api.example.com';
```

### 函数/方法命名

```typescript
// ✅ 使用 camelCase，动词开头
async function getUserById(id: string): Promise<User> {}
async function createUser(dto: CreateUserDto): Promise<User> {}
async function updateUser(id: string, dto: UpdateUserDto): Promise<User> {}
async function deleteUser(id: string): Promise<void> {}
async function validatePassword(password: string): Promise<boolean> {}

// ✅ Service 方法命名
@Injectable()
export class UsersService {
  async findAll(): Promise<User[]> {}
  async findOne(id: string): Promise<User> {}
  async findByEmail(email: string): Promise<User> {}
  async create(dto: CreateUserDto): Promise<User> {}
  async update(id: string, dto: UpdateUserDto): Promise<User> {}
  async remove(id: string): Promise<void> {}
  async exists(id: string): Promise<boolean> {}
}
```

## 装饰器排序

### 类装饰器顺序

```typescript
// ✅ 推荐顺序
@ApiTags('users')           // Swagger 文档
@Controller('users')        // 路由定义
@UseGuards(JwtAuthGuard)    // 守卫
@UseInterceptors(TransformInterceptor)  // 拦截器
export class UsersController {}
```

### 方法装饰器顺序

```typescript
// ✅ 推荐顺序
@ApiOperation({ summary: 'Get user' })   // API 文档
@ApiResponse({ status: 200, type: UserResponseDto })
@Get(':id')                              // HTTP 方法 + 路由
@HttpCode(HttpStatus.OK)                 // 状态码
@UseGuards(JwtAuthGuard)                 // 守卫
@UseInterceptors(LoggingInterceptor)     // 拦截器
async findOne(@Param('id') id: string) {} // 方法实现
```

### 参数装饰器

```typescript
// ✅ 参数装饰器使用
async method(
  @Param('id') id: string,           // 路由参数
  @Query('page') page: number,       // 查询参数
  @Body() dto: CreateUserDto,        // 请求体
  @Headers('authorization') auth: string,  // 请求头
  @Req() request: Request,           // 请求对象
  @Res() response: Response,         // 响应对象
  @CurrentUser() user: User,         // 自定义装饰器
) {}
```

## 导入组织

### 导入分组顺序

```typescript
// ✅ 导入分组（按顺序）
// 1. NestJS 核心
import { Controller, Get, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

// 2. 第三方库
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

// 3. 内部模块（按路径深度排序）
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserEntity } from './entities/user.entity';

// 4. 共享模块
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

// 5. 配置和常量
import { JWT_SECRET } from '../../config/jwt.config';
```

### 导入方式

```typescript
// ✅ 命名空间导入（类型较多时）
import * as bcrypt from 'bcrypt';

// ✅ 默认导入
import dayjs from 'dayjs';

// ✅ 命名导入
import { Repository, FindOptions } from 'typeorm';

// ✅ 类型导入
import type { Request, Response } from 'express';

// ❌ 避免混合导入
import React, { useState } from 'react';  // 不推荐
```

## 代码风格

### TypeScript 规范

```typescript
// ✅ 显式类型声明
async function findById(id: string): Promise<UserEntity> {}

// ✅ 接口定义
interface UserRepository {
  findById(id: string): Promise<UserEntity>;
  save(user: UserEntity): Promise<UserEntity>;
}

// ✅ 类型别名
type UserRole = 'admin' | 'user' | 'guest';
type Nullable<T> = T | null;

// ✅ 枚举定义
enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
}
```

### 异步代码规范

```typescript
// ✅ 使用 async/await
async function processOrder(orderId: string): Promise<void> {
  try {
    const order = await orderRepository.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    await paymentService.process(order);
    await notificationService.send(order);
  } catch (error) {
    logger.error('Failed to process order', error);
    throw error;
  }
}

// ✅ Promise 链式调用（简单场景）
function getUserOrders(userId: string): Promise<Order[]> {
  return orderRepository
    .findByUserId(userId)
    .then(orders => orders.filter(order => order.isActive))
    .catch(error => {
      logger.error('Failed to get orders', error);
      return [];
    });
}

// ❌ 避免回调地狱
// ❌ 避免混合使用 async/await 和 then/catch
```

### 错误处理

```typescript
// ✅ 使用 NestJS 内置异常
throw new BadRequestException('Invalid input');
throw new UnauthorizedException('Please login');
throw new ForbiddenException('Access denied');
throw new NotFoundException('User not found');
throw new ConflictException('User already exists');
throw new InternalServerErrorException('Server error');

// ✅ 自定义异常
export class BusinessException extends HttpException {
  constructor(message: string, code: number) {
    super({ message, code }, HttpStatus.BAD_REQUEST);
  }
}

// ✅ 异常过滤器处理
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // 统一处理异常
  }
}
```

## Git 规范

### 分支命名

```
✅ 推荐格式
feature/user-authentication
feature/JIRA-123-add-login
bugfix/fix-memory-leak
hotfix/critical-security-patch
refactor/optimize-query-performance
docs/update-api-documentation
chore/update-dependencies

❌ 避免
feature_new_login
bugfix-memory-leak-fix
UserAuthentication
```

### 提交信息规范

```
✅ 格式: <type>(<scope>): <subject>

类型 (type):
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式调整（不影响功能）
- refactor: 重构代码
- perf: 性能优化
- test: 测试相关
- chore: 构建/工具/依赖更新
- ci: CI/CD 配置
- revert: 回滚提交

范围 (scope): 可选，表示影响的模块
- users
- auth
- orders
- common
- config

示例:
feat(auth): add JWT authentication
fix(users): resolve email validation issue
docs(api): update swagger documentation
refactor(orders): optimize query performance
test(users): add unit tests for UserService
chore(deps): update nestjs to v10
```

### 提交示例

```bash
# ✅ 好的提交信息
git commit -m "feat(auth): implement JWT token refresh"
git commit -m "fix(users): correct pagination offset calculation"
git commit -m "refactor(orders): extract payment logic to service"
git commit -m "test(auth): add e2e tests for login flow"

# ❌ 避免的提交信息
git commit -m "update"
git commit -m "fix bug"
git commit -m "WIP"
git commit -m "2024-01-15 changes"
```

## 注释规范

### 文件头注释

```typescript
/**
 * @file users.service.ts
 * @description 用户服务，处理用户相关的业务逻辑
 * @module UsersModule
 */
```

### 类/接口注释

```typescript
/**
 * 用户服务类
 * 提供用户 CRUD 操作和业务逻辑处理
 */
@Injectable()
export class UsersService {
  /**
   * 根据 ID 查找用户
   * @param id - 用户唯一标识
   * @returns 用户实体
   * @throws NotFoundException 用户不存在时抛出
   */
  async findById(id: string): Promise<UserEntity> {
    // 实现代码
  }
}
```

### 内联注释

```typescript
// ✅ 解释"为什么"而非"是什么"
// 使用悲观锁防止并发更新冲突
await this.repository.update(id, data, { lock: { mode: 'pessimistic_write' } });

// ✅ 标记 TODO
// TODO: 添加缓存支持，优化查询性能

// ✅ 复杂逻辑说明
// 由于 TypeORM 的 bug，需要手动处理关联数据
// 参考: https://github.com/typeorm/typeorm/issues/XXXX
```

## 代码审查清单

### 功能检查

- [ ] 功能实现符合需求
- [ ] 边界条件处理正确
- [ ] 错误处理完善
- [ ] 日志记录适当

### 代码质量

- [ ] 遵循命名规范
- [ ] 代码结构清晰
- [ ] 无重复代码
- [ ] 适当的注释

### 安全

- [ ] 输入验证完整
- [ ] 敏感数据保护
- [ ] 权限检查正确
- [ ] 无 SQL 注入风险

### 性能

- [ ] 数据库查询优化
- [ ] 避免 N+1 查询
- [ ] 适当的缓存使用
- [ ] 内存泄漏检查

### 测试

- [ ] 单元测试覆盖
- [ ] 边界条件测试
- [ ] 错误场景测试
- [ ] 测试可维护性
