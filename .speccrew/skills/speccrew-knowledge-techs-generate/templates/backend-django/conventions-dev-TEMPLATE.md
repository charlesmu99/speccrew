# Django 开发规范

> **平台**: {{platform_name}}  
> **框架**: Django  
> **生成时间**: {{generated_at}}  

## 概述

本文档定义了 {{platform_name}} Django 项目的开发规范和代码风格。

## Python 命名规范 (PEP 8)

### 文件命名

```
# ✅ 正确的文件命名
models.py           # 模块文件 - 小写
user_service.py     # 多单词 - 下划线分隔
__init__.py         # 特殊文件 - 双下划线

# ❌ 错误的文件命名
UserService.py      # 不要使用驼峰
user-service.py     # 不要使用连字符
```

### 类命名

```python
# ✅ 类名使用 PascalCase
class UserProfile(models.Model):
    pass

class OrderSerializer(serializers.ModelSerializer):
    pass

class IsAuthenticated(permissions.BasePermission):
    pass

# Mixin 类
class TimestampMixin(models.Model):
    pass
```

### 函数和方法命名

```python
# ✅ 函数使用小写下划线

def calculate_total_price(items):
    """计算总价"""
    pass

def get_user_by_email(email):
    """通过邮箱获取用户"""
    pass

class UserService:
    # ✅ 方法使用小写下划线
    def validate_password(self, password):
        """验证密码"""
        pass
    
    # ✅ 私有方法使用单下划线前缀
    def _hash_password(self, password):
        """内部方法"""
        pass
```

### 变量命名

```python
# ✅ 变量使用小写下划线
user_name = 'john_doe'
order_count = 10
is_active = True

# ✅ 常量使用全大写
MAX_RETRY_COUNT = 3
DEFAULT_PAGE_SIZE = 20
CACHE_TTL = 3600

# ✅ 类属性
class User(models.Model):
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
```

### 模型命名

```python
# ✅ 模型类使用单数形式
class User(models.Model):           # ✅
    pass

class OrderItem(models.Model):      # ✅
    pass

# ✅ 字段命名使用小写下划线
class Order(models.Model):
    order_number = models.CharField(max_length=32)  # ✅
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)  # ✅
    created_at = models.DateTimeField(auto_now_add=True)  # ✅
```

## App 命名

### App 命名规范

```
# ✅ App 命名规范
apps/
├── core/                 # 核心功能
├── users/                # 用户管理
├── orders/               # 订单管理
├── payments/             # 支付模块
├── notifications/        # 通知模块
└── integrations/         # 第三方集成

# ❌ 避免使用
├── user/                 # 使用复数形式
├── order_app/            # 不要加 _app 后缀
├── UserManagement/       # 不要大写
```

### App 配置

```python
# apps/users/apps.py
from django.apps import AppConfig

class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.users'           # 完整路径
    verbose_name = '用户管理'      # 中文名称
    
    def ready(self):
        # 导入信号处理器
        import apps.users.signals
```

## 文件组织

### 项目结构

```
{{project_name}}/
├── apps/                         # 所有 Django Apps
│   ├── __init__.py
│   ├── core/                     # 核心功能 App
│   │   ├── __init__.py
│   │   ├── models.py             # 基础模型
│   │   ├── views.py              # 基础视图
│   │   ├── utils.py              # 通用工具
│   │   └── exceptions.py         # 自定义异常
│   └── users/                    # 用户 App
│       ├── __init__.py
│       ├── models/
│       │   ├── __init__.py
│       │   └── user.py
│       ├── views/
│       │   ├── __init__.py
│       │   └── user.py
│       ├── serializers/
│       │   ├── __init__.py
│       │   └── user.py
│       ├── urls.py
│       └── admin.py
├── config/                       # 配置目录
│   ├── settings/                 # 环境配置
│   ├── urls.py                   # 根路由
│   ├── wsgi.py
│   └── asgi.py
├── utils/                        # 全局工具
│   ├── __init__.py
│   ├── decorators.py
│   ├── validators.py
│   └── helpers.py
├── tests/                        # 测试目录
│   ├── __init__.py
│   ├── conftest.py              # pytest 配置
│   └── factories.py             # 模型工厂
├── requirements/                 # 依赖文件
│   ├── base.txt
│   ├── local.txt
│   └── production.txt
└── manage.py
```

### 模型文件组织

```python
# ✅ 小型 App - 单文件
# apps/core/models.py
from django.db import models

class TimestampMixin(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True
```

```python
# ✅ 大型 App - 多文件
# apps/users/models/__init__.py
from .user import User
from .profile import Profile
from .address import Address

# apps/users/models/user.py
from django.db import models
from apps.core.models import TimestampMixin

class User(TimestampMixin, models.Model):
    # ...
    pass
```

### 视图文件组织

```python
# ✅ 按功能组织
# apps/users/views/__init__.py
from .auth import LoginView, LogoutView
from .user import UserViewSet, UserProfileView
from .password import PasswordChangeView, PasswordResetView

# apps/users/views/auth.py
from rest_framework import views

class LoginView(views.APIView):
    pass

class LogoutView(views.APIView):
    pass
```

## Import 排序 (isort)

### Import 分组规则

```python
# ✅ 标准库
import os
import sys
from datetime import datetime
from typing import List, Optional

# ✅ 第三方库
django
from django.db import models
from django.http import JsonResponse
from django.contrib.auth import get_user_model

# DRF
from rest_framework import serializers, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated

# 其他第三方
import requests
from celery import shared_task

# ✅ 本地应用
# 绝对导入
from apps.core.models import TimestampMixin
from apps.core.permissions import IsOwner
from apps.core.utils import generate_uuid

# 相对导入
from .models import User, Profile
from .serializers import UserSerializer
```

### isort 配置

```toml
# pyproject.toml
[tool.isort]
profile = "django"
line_length = 88
multi_line_output = 3
include_trailing_comma = true
force_grid_wrap = 0
use_parentheses = true
ensure_newline_before_comments = true
sections = [
    "FUTURE",
    "STDLIB",
    "THIRDPARTY",
    "DJANGO",
    "FIRSTPARTY",
    "LOCALFOLDER"
]
known_django = ["django", "rest_framework", "drf_yasg"]
```

## 代码风格

### 行长度和格式

```python
# ✅ 行长度限制 88 字符 (Black 默认)
# 使用括号换行
def long_function_name(
    var_one, var_two, var_three,
    var_four, var_five
):
    pass

# ✅ 链式调用换行
queryset = (
    User.objects
    .filter(is_active=True)
    .select_related('profile')
    .prefetch_related('orders')
    .order_by('-created_at')
)
```

### 文档字符串

```python
# ✅ Google 风格文档字符串
def create_user(username: str, email: str, password: str) -> User:
    """创建新用户。
    
    Args:
        username: 用户名，3-20 个字符。
        email: 邮箱地址，必须唯一。
        password: 密码，至少 8 个字符。
    
    Returns:
        新创建的用户实例。
    
    Raises:
        ValueError: 用户名或邮箱格式无效。
        IntegrityError: 用户名或邮箱已存在。
    
    Example:
        >>> user = create_user('john', 'john@example.com', 'secure123')
        >>> user.username
        'john'
    """
    pass

# ✅ 类文档字符串
class UserManager(BaseUserManager):
    """自定义用户管理器。
    
    提供用户创建和查询的辅助方法。
    
    Attributes:
        model: User 模型类。
    """
    pass
```

### 类型注解

```python
from typing import List, Optional, Dict, Any
from django.db.models import QuerySet

# ✅ 函数参数和返回值类型注解
def get_active_users(
    limit: Optional[int] = None,
    ordering: str = '-created_at'
) -> QuerySet[User]:
    """获取活跃用户列表。"""
    queryset = User.objects.filter(is_active=True)
    if ordering:
        queryset = queryset.order_by(ordering)
    if limit:
        queryset = queryset[:limit]
    return queryset

# ✅ 类方法类型注解
class UserService:
    def __init__(self, user: User) -> None:
        self.user = user
    
    def has_permission(self, codename: str) -> bool:
        return self.user.permissions.filter(codename=codename).exists()
```

## Git 规范

### 分支命名

```
# ✅ 分支命名规范
main                    # 主分支
develop                 # 开发分支
feature/user-login      # 功能分支
feature/order-payment   # 功能分支
bugfix/login-error      # Bug 修复分支
hotfix/security-patch   # 热修复分支
release/v1.2.0          # 发布分支
```

### Commit 规范

```
# ✅ Commit 消息格式
<type>(<scope>): <subject>

<body>

<footer>

# 类型 (type)
feat:       新功能
fix:        Bug 修复
docs:       文档更新
style:      代码格式（不影响代码运行的变动）
refactor:   重构（既不是新增功能，也不是修改 bug）
perf:       性能优化
test:       增加测试
chore:      构建过程或辅助工具的变动

# 示例
feat(users): 添加用户登录功能

- 实现 JWT Token 认证
- 添加登录表单验证
- 集成第三方登录

Closes #123
```

### Commit 示例

```bash
# ✅ 好的 commit
git commit -m "feat(orders): 添加订单导出功能

- 支持 Excel 和 CSV 格式导出
- 添加异步导出任务
- 导出完成后发送邮件通知

Closes #456"

# ❌ 不好的 commit
git commit -m "更新代码"
git commit -m "fix bug"
```

## 代码审查清单

### 模型审查

- [ ] 是否继承自基础混入类 (TimestampMixin 等)
- [ ] 是否定义了 `__str__` 方法
- [ ] 是否设置了 `Meta` 选项 (verbose_name, ordering, indexes)
- [ ] 外键关系是否设置了 `related_name`
- [ ] 是否添加了适当的字段验证

### 视图审查

- [ ] 是否正确设置了权限类
- [ ] 是否使用了适当的查询优化 (select_related, prefetch_related)
- [ ] 序列化器是否验证输入数据
- [ ] 错误处理是否完善

### 序列化器审查

- [ ] 是否使用了适当的字段类型
- [ ] 是否设置了 `read_only_fields`
- [ ] 自定义验证方法是否以 `validate_` 开头
- [ ] 嵌套序列化器是否设置了 `read_only=True` (如需要)

### 通用审查

- [ ] 代码是否符合 PEP 8 规范
- [ ] 是否添加了适当的文档字符串
- [ ] 是否添加了类型注解
- [ ] 是否有重复代码可以提取
- [ ] 是否有适当的单元测试

## 工具配置

### Black 配置

```toml
# pyproject.toml
[tool.black]
line-length = 88
target-version = ['py311']
include = '\.pyi?$'
extend-exclude = '''
/(
  migrations
  | __pycache__
  | \.git
  | \.venv
)/
'''
```

### Flake8 配置

```ini
# setup.cfg
[flake8]
max-line-length = 88
extend-ignore = E203, W503
exclude = 
    .git,
    __pycache__,
    migrations,
    .venv,
    venv
per-file-ignores =
    __init__.py:F401
```

### Pre-commit 配置

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v4.5.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-added-large-files

  - repo: https://github.com/psf/black
    rev: 23.12.1
    hooks:
      - id: black
        language_version: python3.11

  - repo: https://github.com/pycqa/isort
    rev: 5.13.2
    hooks:
      - id: isort

  - repo: https://github.com/pycqa/flake8
    rev: 6.1.0
    hooks:
      - id: flake8
```

## 环境配置

### 环境变量

```python
# config/settings/base.py
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# ✅ 使用环境变量
SECRET_KEY = os.getenv('SECRET_KEY')
DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '').split(',')

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}

# Redis
REDIS_URL = os.getenv('REDIS_URL', 'redis://localhost:6379/0')

# Celery
CELERY_BROKER_URL = os.getenv('CELERY_BROKER_URL', REDIS_URL)
CELERY_RESULT_BACKEND = os.getenv('CELERY_RESULT_BACKEND', REDIS_URL)
```

### .env.example

```bash
# .env.example
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_NAME={{project_name}}
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432

# Redis
REDIS_URL=redis://localhost:6379/0

# Email
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
DEFAULT_FROM_EMAIL=noreply@example.com
```
