# Django 架构规范

> **平台**: {{platform_name}}  
> **框架**: Django  
> **生成时间**: {{generated_at}}  

## 概述

本文档定义了 {{platform_name}} Django 项目的架构模式和组织规范。

## App 组织

### App 划分原则

```
{{project_name}}/
├── apps/
│   ├── users/              # 用户管理 (认证、授权、用户资料)
│   ├── core/               # 核心功能 (基础模型、工具函数)
│   ├── api/                # API 网关 (路由聚合、版本控制)
│   └── {business}/         # 业务模块 (按业务领域划分)
├── config/                 # 项目配置
├── utils/                  # 通用工具
└── templates/              # 全局模板
```

### App 内部结构

```
apps/{app_name}/
├── __init__.py
├── admin.py               # 后台管理配置
├── apps.py                # App 配置
├── models/
│   ├── __init__.py
│   ├── {model}.py         # 模型定义
│   └── mixins.py          # 模型混入类
├── views/
│   ├── __init__.py
│   ├── {view}.py          # 视图 (FBV/CBV)
│   └── mixins.py          # 视图混入类
├── serializers/           # DRF 序列化器
│   ├── __init__.py
│   └── {serializer}.py
├── filters.py             # 过滤器 (django-filter)
├── permissions.py         # 自定义权限
├── urls.py                # URL 路由
├── tests/
│   ├── __init__.py
│   ├── test_models.py
│   ├── test_views.py
│   └── test_serializers.py
└── services/              # 业务逻辑层 (可选)
    ├── __init__.py
    └── {service}.py
```

## Model-View-Template 结构

### 模型层 (Models)

```python
# models/user.py
from django.db import models
from apps.core.models import TimestampMixin

class User(TimestampMixin, models.Model):
    """用户模型"""
    username = models.CharField(max_length=150, unique=True, verbose_name='用户名')
    email = models.EmailField(unique=True, verbose_name='邮箱')
    is_active = models.BooleanField(default=True, verbose_name='是否激活')
    
    class Meta:
        db_table = 'users'
        verbose_name = '用户'
        verbose_name_plural = '用户'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.username
```

### 视图层 (Views)

**函数视图 (FBV)**
```python
# views/user.py
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods

@require_http_methods(['GET'])
def user_detail(request, user_id):
    """获取用户详情"""
    user = get_object_or_404(User, pk=user_id)
    return JsonResponse({
        'id': user.id,
        'username': user.username,
        'email': user.email
    })
```

**类视图 (CBV)**
```python
# views/user.py
from django.views import View
from django.views.generic import ListView, DetailView

class UserListView(ListView):
    """用户列表视图"""
    model = User
    template_name = 'users/user_list.html'
    context_object_name = 'users'
    paginate_by = 20

class UserDetailView(DetailView):
    """用户详情视图"""
    model = User
    template_name = 'users/user_detail.html'
    pk_url_kwarg = 'user_id'
```

**DRF 视图集**
```python
# views/user.py
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

class UserViewSet(viewsets.ModelViewSet):
    """用户视图集"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    filterset_class = UserFilter
    
    @action(detail=True, methods=['post'])
    def deactivate(self, request, pk=None):
        """停用用户"""
        user = self.get_object()
        user.is_active = False
        user.save()
        return Response({'status': 'user deactivated'})
```

### 模板层 (Templates)

```
templates/
├── base.html              # 基础模板
├── components/            # 可复用组件
│   ├── navbar.html
│   ├── footer.html
│   └── pagination.html
├── users/                 # App 专属模板
│   ├── user_list.html
│   └── user_detail.html
└── emails/                # 邮件模板
    └── welcome.html
```

## URL 路由

### 项目级路由

```python
# config/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/users/', include('apps.users.urls')),
    path('api/v1/orders/', include('apps.orders.urls')),
]
```

### App 级路由

```python
# apps/users/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet

router = DefaultRouter()
router.register(r'', UserViewSet, basename='user')

urlpatterns = [
    path('', include(router.urls)),
]
```

### 路由命名规范

```python
# URL 命名
path('users/<int:pk>/', UserDetailView.as_view(), name='user-detail')

# 反向解析
from django.urls import reverse

url = reverse('user-detail', kwargs={'pk': user.id})
```

## 中间件

### 自定义中间件

```python
# middleware/request_logging.py
import logging
import time

logger = logging.getLogger('django.request')

class RequestLoggingMiddleware:
    """请求日志中间件"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        start_time = time.time()
        response = self.get_response(request)
        duration = time.time() - start_time
        
        logger.info(
            f'{request.method} {request.path} {response.status_code} {duration:.2f}s'
        )
        return response
```

### 中间件配置

```python
# config/settings/base.py
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    # 自定义中间件
    'apps.core.middleware.RequestLoggingMiddleware',
]
```

## 项目结构

### 推荐目录结构

```
{{project_name}}/
├── apps/                      # Django Apps
│   ├── __init__.py
│   ├── core/                  # 核心功能
│   ├── users/                 # 用户模块
│   └── {business}/            # 业务模块
├── config/                    # 项目配置
│   ├── __init__.py
│   ├── settings/              # 环境配置
│   │   ├── __init__.py
│   │   ├── base.py           # 基础配置
│   │   ├── local.py          # 本地开发
│   │   ├── test.py           # 测试环境
│   │   └── production.py     # 生产环境
│   ├── urls.py               # 根路由
│   ├── wsgi.py               # WSGI 配置
│   └── asgi.py               # ASGI 配置
├── utils/                     # 通用工具
│   ├── __init__.py
│   ├── decorators.py
│   ├── exceptions.py
│   └── helpers.py
├── static/                    # 静态文件
│   ├── css/
│   ├── js/
│   └── images/
├── media/                     # 用户上传文件
├── templates/                 # 模板文件
├── locale/                    # 国际化翻译
├── scripts/                   # 管理脚本
│   ├── manage.sh
│   └── setup.sh
├── requirements/              # 依赖管理
│   ├── base.txt
│   ├── local.txt
│   └── production.txt
├── tests/                     # 集成测试
├── docker/                    # Docker 配置
├── docs/                      # 文档
├── manage.py
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

## 配置管理

### 环境分离

```python
# config/settings/base.py
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # 第三方
    'rest_framework',
    'django_filters',
    'corsheaders',
    # 本地
    'apps.core',
    'apps.users',
]

# config/settings/local.py
from .base import *

DEBUG = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1']

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME', '{{project_name}}'),
        'USER': os.getenv('DB_USER', 'postgres'),
        'PASSWORD': os.getenv('DB_PASSWORD', 'password'),
        'HOST': os.getenv('DB_HOST', 'localhost'),
        'PORT': os.getenv('DB_PORT', '5432'),
    }
}
```

## DRF 架构

### 序列化器

```python
# serializers/user.py
from rest_framework import serializers
from apps.users.models import User

class UserSerializer(serializers.ModelSerializer):
    """用户序列化器"""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'is_active']
        read_only_fields = ['id']
```

### 权限控制

```python
# permissions/custom.py
from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    """仅所有者或只读"""
    
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user == request.user
```

### 分页

```python
# config/settings/base.py
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}
```

## 异步任务

### Celery 配置

```python
# config/celery.py
from celery import Celery

app = Celery('{{project_name}}')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

# tasks/email.py
from celery import shared_task
from django.core.mail import send_mail

@shared_task
def send_welcome_email(user_email):
    """发送欢迎邮件"""
    send_mail(
        subject='欢迎加入',
        message='感谢您的注册',
        from_email='noreply@example.com',
        recipient_list=[user_email],
    )
```
