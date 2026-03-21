# Django 设计规范

> **平台**: {{platform_name}}  
> **框架**: Django  
> **生成时间**: {{generated_at}}  

## 概述

本文档定义了 {{platform_name}} Django 项目的设计模式和编码约定。

## 模型设计模式

### 基础模型混入

```python
# apps/core/models.py
from django.db import models

class TimestampMixin(models.Model):
    """时间戳混入类"""
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='创建时间')
    updated_at = models.DateTimeField(auto_now=True, verbose_name='更新时间')
    
    class Meta:
        abstract = True

class SoftDeleteMixin(models.Model):
    """软删除混入类"""
    is_deleted = models.BooleanField(default=False, verbose_name='是否删除')
    deleted_at = models.DateTimeField(null=True, blank=True, verbose_name='删除时间')
    
    class Meta:
        abstract = True
    
    def delete(self, using=None, keep_parents=False):
        """软删除"""
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save(update_fields=['is_deleted', 'deleted_at'])

class UUIDMixin(models.Model):
    """UUID 主键混入类"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    class Meta:
        abstract = True
```

### 模型设计原则

```python
# ✅ 正确的模型设计
class Order(TimestampMixin, models.Model):
    """订单模型"""
    STATUS_CHOICES = [
        ('pending', '待支付'),
        ('paid', '已支付'),
        ('shipped', '已发货'),
        ('completed', '已完成'),
        ('cancelled', '已取消'),
    ]
    
    order_no = models.CharField(max_length=32, unique=True, verbose_name='订单号')
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='orders',
        verbose_name='用户'
    )
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='pending',
        verbose_name='状态'
    )
    total_amount = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        verbose_name='总金额'
    )
    
    class Meta:
        db_table = 'orders'
        verbose_name = '订单'
        verbose_name_plural = '订单'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['order_no']),
        ]
    
    def __str__(self):
        return f'Order({self.order_no})'
    
    def calculate_total(self):
        """计算订单总额"""
        return self.items.aggregate(
            total=models.Sum(models.F('price') * models.F('quantity'))
        )['total'] or 0
```

### 关系设计

```python
# 一对多关系
class Post(models.Model):
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='posts',  # 必须定义 related_name
        verbose_name='作者'
    )

# 多对多关系
class Tag(models.Model):
    posts = models.ManyToManyField(
        Post,
        related_name='tags',
        through='PostTag',  # 中间模型
        verbose_name='文章'
    )

# 一对一关系
class Profile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='profile',
        verbose_name='用户'
    )
```

## 视图设计

### FBV vs CBV 选择

**使用函数视图 (FBV) 的场景:**
- 简单的、一次性的视图
- 需要完全控制逻辑流
- API 端点逻辑简单

```python
# ✅ FBV 示例
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def quick_action(request):
    """快速操作"""
    serializer = QuickActionSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    # 简单逻辑
    return Response({'status': 'success'})
```

**使用类视图 (CBV) 的场景:**
- 需要复用代码（混入类）
- 标准的 CRUD 操作
- 需要方法分发 (get/post/put/delete)

```python
# ✅ CBV 示例
class ArticleViewSet(viewsets.ModelViewSet):
    """文章视图集"""
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filterset_class = ArticleFilter
    search_fields = ['title', 'content']
    ordering_fields = ['created_at', 'views']
    
    def get_queryset(self):
        """动态查询集"""
        queryset = super().get_queryset()
        if self.request.user.is_staff:
            return queryset
        return queryset.filter(is_published=True)
    
    def perform_create(self, serializer):
        """创建时自动设置作者"""
        serializer.save(author=self.request.user)
```

### 视图混入模式

```python
# views/mixins.py
class SerializerPerActionMixin:
    """不同动作使用不同序列化器"""
    serializer_classes = {
        'list': ListSerializer,
        'retrieve': DetailSerializer,
        'create': CreateSerializer,
        'update': UpdateSerializer,
    }
    
    def get_serializer_class(self):
        return self.serializer_classes.get(
            self.action, 
            self.serializer_class
        )

class QuerySetFilterMixin:
    """查询集过滤混入"""
    
    def get_queryset(self):
        queryset = super().get_queryset()
        # 通用过滤逻辑
        if hasattr(self.request.user, 'organization'):
            queryset = queryset.filter(
                organization=self.request.user.organization
            )
        return queryset
```

## 序列化器设计 (DRF)

### 序列化器模式

```python
# ✅ 基础序列化器
class UserListSerializer(serializers.ModelSerializer):
    """用户列表序列化器 - 精简字段"""
    class Meta:
        model = User
        fields = ['id', 'username', 'avatar']

class UserDetailSerializer(serializers.ModelSerializer):
    """用户详情序列化器 - 完整字段"""
    posts_count = serializers.IntegerField(source='posts.count', read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'bio', 'posts_count', 'created_at']

class UserCreateSerializer(serializers.ModelSerializer):
    """用户创建序列化器 - 包含验证"""
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm']
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError('密码不匹配')
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        return User.objects.create_user(**validated_data)
```

### 嵌套序列化器

```python
# ✅ 嵌套序列化
class CommentSerializer(serializers.ModelSerializer):
    author = UserListSerializer(read_only=True)
    replies_count = serializers.IntegerField(source='replies.count', read_only=True)
    
    class Meta:
        model = Comment
        fields = ['id', 'content', 'author', 'replies_count', 'created_at']

class PostDetailSerializer(serializers.ModelSerializer):
    author = UserListSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    tags = serializers.StringRelatedField(many=True)
    
    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'author', 'comments', 'tags', 'created_at']
```

### 动态字段序列化器

```python
# ✅ 动态字段
class DynamicFieldsSerializer(serializers.ModelSerializer):
    """支持动态字段选择的序列化器"""
    
    def __init__(self, *args, **kwargs):
        fields = kwargs.pop('fields', None)
        super().__init__(*args, **kwargs)
        
        if fields is not None:
            allowed = set(fields)
            existing = set(self.fields)
            for field_name in existing - allowed:
                self.fields.pop(field_name)

class ProductSerializer(DynamicFieldsSerializer):
    class Meta:
        model = Product
        fields = ['id', 'name', 'price', 'description', 'stock']

# 使用
ProductSerializer(product, fields=['id', 'name', 'price'])
```

## URL 设计

### RESTful URL 规范

```python
# ✅ RESTful URL 设计
# 列表和创建
GET    /api/v1/users/          # 获取用户列表
POST   /api/v1/users/          # 创建用户

# 单个资源
GET    /api/v1/users/{id}/     # 获取用户详情
PUT    /api/v1/users/{id}/     # 全量更新
PATCH  /api/v1/users/{id}/     # 部分更新
DELETE /api/v1/users/{id}/     # 删除用户

# 嵌套资源
GET    /api/v1/users/{id}/posts/        # 获取用户的文章
POST   /api/v1/users/{id}/posts/        # 为用户创建文章
GET    /api/v1/users/{id}/posts/{pid}/  # 获取用户的特定文章

# 自定义动作
POST   /api/v1/users/{id}/activate/     # 激活用户
POST   /api/v1/users/{id}/deactivate/   # 停用用户
```

### URL 命名规范

```python
# ✅ URL 命名
# apps/users/urls.py
urlpatterns = [
    path('', UserListView.as_view(), name='user-list'),
    path('<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    path('<int:pk>/posts/', UserPostListView.as_view(), name='user-post-list'),
]

# 命名规则
# {app_name}-{model_name}-{action}
# user-list, user-detail, user-post-list
```

## Django 设计原则

### DRY 原则

```python
# ✅ 使用混入类避免重复
class AuditMixin(models.Model):
    """审计混入类"""
    created_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name='%(class)s_created'
    )
    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='%(class)s_updated'
    )
    
    class Meta:
        abstract = True

class Order(AuditMixin, models.Model):
    pass

class Invoice(AuditMixin, models.Model):
    pass
```

### Fat Model, Skinny View

```python
# ✅ 业务逻辑放在模型中
class ShoppingCart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    def add_item(self, product, quantity=1):
        """添加商品"""
        item, created = self.items.get_or_create(
            product=product,
            defaults={'quantity': quantity}
        )
        if not created:
            item.quantity += quantity
            item.save()
        return item
    
    def get_total(self):
        """计算总价"""
        return self.items.aggregate(
            total=Sum(F('product__price') * F('quantity'))
        )['total'] or 0

# 视图中保持简洁
def add_to_cart(request, product_id):
    cart, _ = ShoppingCart.objects.get_or_create(user=request.user)
    product = get_object_or_404(Product, id=product_id)
    cart.add_item(product)
    return Response({'status': 'added'})
```

### 自定义管理器

```python
# ✅ 自定义管理器
class PublishedManager(models.Manager):
    """已发布文章管理器"""
    def get_queryset(self):
        return super().get_queryset().filter(is_published=True)

class Post(models.Model):
    # ... 字段定义
    
    objects = models.Manager()  # 默认管理器
    published = PublishedManager()  # 自定义管理器

# 使用
Post.published.all()  # 只获取已发布文章
```

### 信号使用规范

```python
# ✅ 信号处理
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """创建用户时自动创建用户资料"""
    if created:
        Profile.objects.create(user=instance)

# signals.py 需要在 apps.py 中注册
class UsersConfig(AppConfig):
    name = 'apps.users'
    
    def ready(self):
        import apps.users.signals
```

### 查询优化

```python
# ✅ 使用 select_related 和 prefetch_related
# 一对一、外键关系 - select_related
users = User.objects.select_related('profile').all()

# 多对多、反向关系 - prefetch_related
posts = Post.objects.prefetch_related('tags', 'comments').all()

# 只获取需要的字段
users = User.objects.only('id', 'username', 'email')

# 延迟加载大字段
posts = Post.objects.defer('content')  # content 字段延迟加载

# 使用 values/values_list 获取字典或元组
usernames = User.objects.values_list('username', flat=True)
```

### 事务管理

```python
from django.db import transaction

# ✅ 使用装饰器
@transaction.atomic
def transfer_funds(from_account, to_account, amount):
    from_account.balance -= amount
    from_account.save()
    to_account.balance += amount
    to_account.save()

# ✅ 使用上下文管理器
def create_order_with_items(user, items_data):
    with transaction.atomic():
        order = Order.objects.create(user=user, status='pending')
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
        order.calculate_total()
        return order
```

## 错误处理

### 自定义异常

```python
# utils/exceptions.py
from rest_framework.exceptions import APIException

class BusinessError(APIException):
    """业务错误"""
    status_code = 400
    default_code = 'business_error'

class InsufficientBalance(BusinessError):
    """余额不足"""
    default_detail = '账户余额不足'
    default_code = 'insufficient_balance'

# 使用
if user.balance < amount:
    raise InsufficientBalance()
```

### 全局异常处理

```python
# utils/exception_handler.py
from rest_framework.views import exception_handler

def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)
    
    if response is not None:
        response.data['status_code'] = response.status_code
        response.data['timestamp'] = timezone.now().isoformat()
    
    return response

# settings.py
REST_FRAMEWORK = {
    'EXCEPTION_HANDLER': 'utils.exception_handler.custom_exception_handler',
}
```
