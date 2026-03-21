# {{platform_name}} 设计规范

> **平台**: {{platform_name}}  
> **框架**: Flutter  
> **生成时间**: {{generated_at}}  
> **版本**: 1.0

---

## 1. 设计原则

### 1.1 SOLID 原则

#### 单一职责原则 (SRP)
每个 Widget/类只负责一个功能。

```dart
// ❌ 错误：一个 Widget 处理太多逻辑
class UserPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return FutureBuilder(
      future: fetchUser(),
      builder: (context, snapshot) {
        if (snapshot.hasData) {
          return Column(
            children: [
              // 用户信息
              // 订单列表
              // 设置选项
              // 全部混在一起
            ],
          );
        }
        return CircularProgressIndicator();
      },
    );
  }
}

// ✅ 正确：职责分离
class UserPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          UserProfileHeader(),
          UserOrdersSection(),
          UserSettingsSection(),
        ],
      ),
    );
  }
}
```

#### 开闭原则 (OCP)
对扩展开放，对修改关闭。

```dart
// ✅ 使用组合而非继承
abstract class ButtonStyle {
  ButtonStyleData get style;
}

class PrimaryButtonStyle implements ButtonStyle {
  @override
  ButtonStyleData get style => ButtonStyleData(
    backgroundColor: Colors.blue,
    textColor: Colors.white,
  );
}

class CustomButton extends StatelessWidget {
  final String text;
  final ButtonStyle style;
  final VoidCallback? onPressed;

  const CustomButton({
    required this.text,
    required this.style,
    this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      style: ElevatedButton.styleFrom(
        backgroundColor: style.style.backgroundColor,
        foregroundColor: style.style.textColor,
      ),
      onPressed: onPressed,
      child: Text(text),
    );
  }
}
```

### 1.2 DRY 原则

避免重复代码，提取公共组件。

```dart
// ❌ 错误：重复的布局代码
class Page1 extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.all(16),
      child: Column(
        children: [
          Text('Title', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          SizedBox(height: 16),
          // ...
        ],
      ),
    );
  }
}

// ✅ 正确：提取公共组件
class PageLayout extends StatelessWidget {
  final String title;
  final List<Widget> children;

  const PageLayout({required this.title, required this.children});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: Theme.of(context).textTheme.headlineSmall,
          ),
          SizedBox(height: 16),
          ...children,
        ],
      ),
    );
  }
}
```

---

## 2. Widget 设计模式

### 2.1 组合优于继承

```dart
// ❌ 错误：过度使用继承
class BaseCard extends StatelessWidget {
  final Widget child;
  BaseCard({required this.child});

  @override
  Widget build(BuildContext context) {
    return Card(child: child);
  }
}

class UserCard extends BaseCard {
  UserCard({required User user}) : super(child: Text(user.name));
}

// ✅ 正确：使用组合
class UserCard extends StatelessWidget {
  final User user;
  final VoidCallback? onTap;
  final EdgeInsets? padding;

  const UserCard({
    required this.user,
    this.onTap,
    this.padding,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: padding ?? EdgeInsets.all(16),
          child: Row(
            children: [
              UserAvatar(url: user.avatarUrl),
              SizedBox(width: 12),
              Expanded(child: UserInfo(user: user)),
            ],
          ),
        ),
      ),
    );
  }
}
```

### 2.2 控制反转 (IoC)

```dart
// ✅ 通过构造函数注入依赖
class ProductList extends StatelessWidget {
  final ProductRepository repository;
  final ErrorHandler errorHandler;

  const ProductList({
    required this.repository,
    required this.errorHandler,
  });

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<Product>>(
      future: repository.getProducts(),
      builder: (context, snapshot) {
        if (snapshot.hasError) {
          return errorHandler.handle(context, snapshot.error!);
        }
        // ...
      },
    );
  }
}

// 使用
ProductList(
  repository: ApiProductRepository(),
  errorHandler: SnackBarErrorHandler(),
)
```

### 2.3 Builder 模式

```dart
// ✅ 复杂对象的构建
class FormFieldConfig {
  final String label;
  final String? hint;
  final TextInputType keyboardType;
  final List<TextInputFormatter>? formatters;
  final String? Function(String?)? validator;
  final int? maxLength;
  final bool obscureText;

  FormFieldConfig({
    required this.label,
    this.hint,
    this.keyboardType = TextInputType.text,
    this.formatters,
    this.validator,
    this.maxLength,
    this.obscureText = false,
  });

  // 便捷工厂方法
  factory FormFieldConfig.email() {
    return FormFieldConfig(
      label: 'Email',
      hint: 'Enter your email',
      keyboardType: TextInputType.emailAddress,
      validator: (value) {
        if (value?.contains('@') != true) {
          return 'Invalid email';
        }
        return null;
      },
    );
  }

  factory FormFieldConfig.password() {
    return FormFieldConfig(
      label: 'Password',
      hint: 'Enter your password',
      obscureText: true,
      maxLength: 32,
    );
  }
}
```

---

## 3. 状态管理设计模式

### 3.1 状态提升 (Lifting State Up)

```dart
// ✅ 将共享状态提升到共同祖先
class ParentWidget extends StatefulWidget {
  @override
  _ParentWidgetState createState() => _ParentWidgetState();
}

class _ParentWidgetState extends State<ParentWidget> {
  int _selectedIndex = 0;

  void _handleIndexChanged(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        TabBar(
          selectedIndex: _selectedIndex,
          onIndexChanged: _handleIndexChanged,
        ),
        TabContent(
          selectedIndex: _selectedIndex,
        ),
      ],
    );
  }
}
```

### 3.2 依赖注入模式

```dart
// ✅ 使用 Provider 进行依赖注入
class ServiceLocator extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        Provider<ApiClient>(create: (_) => ApiClient()),
        ProxyProvider<ApiClient, UserRepository>(
          update: (_, apiClient, __) => UserRepository(apiClient),
        ),
        ChangeNotifierProvider(
          create: (context) => AuthProvider(context.read<UserRepository>()),
        ),
      ],
      child: MyApp(),
    );
  }
}
```

### 3.3 Repository 模式

```dart
// ✅ 抽象数据访问
abstract class UserRepository {
  Future<User> getUser(String id);
  Future<void> updateUser(User user);
  Future<List<User>> searchUsers(String query);
}

class ApiUserRepository implements UserRepository {
  final ApiClient _client;

  ApiUserRepository(this._client);

  @override
  Future<User> getUser(String id) async {
    final response = await _client.get('/users/$id');
    return User.fromJson(response.data);
  }

  @override
  Future<void> updateUser(User user) async {
    await _client.put('/users/${user.id}', data: user.toJson());
  }

  @override
  Future<List<User>> searchUsers(String query) async {
    final response = await _client.get('/users', queryParameters: {'q': query});
    return (response.data as List).map((e) => User.fromJson(e)).toList();
  }
}

class CachedUserRepository implements UserRepository {
  final UserRepository _source;
  final Cache _cache;

  CachedUserRepository(this._source, this._cache);

  @override
  Future<User> getUser(String id) async {
    final cached = await _cache.get('user_$id');
    if (cached != null) return User.fromJson(cached);
    
    final user = await _source.getUser(id);
    await _cache.set('user_$id', user.toJson());
    return user;
  }
  // ...
}
```

---

## 4. UI 组合模式

### 4.1 原子设计 (Atomic Design)

```dart
// Atoms - 最小单元
class AppText extends StatelessWidget {
  final String text;
  final TextStyle? style;
  
  const AppText.body(this.text, {this.style});
  const AppText.heading(this.text, {this.style});
  const AppText.caption(this.text, {this.style});

  @override
  Widget build(BuildContext context) {
    return Text(text, style: _getStyle(context));
  }

  TextStyle? _getStyle(BuildContext context) {
    // 根据类型返回对应主题样式
  }
}

// Molecules - 简单组合
class SearchBar extends StatelessWidget {
  final ValueChanged<String> onChanged;
  
  const SearchBar({required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return TextField(
      decoration: InputDecoration(
        prefixIcon: Icon(Icons.search),
        hintText: 'Search...',
        border: OutlineInputBorder(),
      ),
      onChanged: onChanged,
    );
  }
}

// Organisms - 复杂组合
class ProductCard extends StatelessWidget {
  final Product product;
  final VoidCallback? onTap;

  const ProductCard({required this.product, this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        child: Column(
          children: [
            ProductImage(url: product.imageUrl),
            Padding(
              padding: EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  AppText.heading(product.name),
                  SizedBox(height: 8),
                  AppText.body(product.description),
                  SizedBox(height: 8),
                  PriceTag(price: product.price),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// Templates - 页面模板
class ProductListTemplate extends StatelessWidget {
  final List<Product> products;
  final Widget header;
  final Widget? footer;

  const ProductListTemplate({
    required this.products,
    required this.header,
    this.footer,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        header,
        Expanded(
          child: GridView.builder(
            gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
            ),
            itemCount: products.length,
            itemBuilder: (context, index) => ProductCard(
              product: products[index],
            ),
          ),
        ),
        if (footer != null) footer!,
      ],
    );
  }
}
```

### 4.2 Slot 模式

```dart
// ✅ 使用 Slot 实现灵活的布局
class CardLayout extends StatelessWidget {
  final Widget? leading;
  final Widget title;
  final Widget? subtitle;
  final List<Widget> actions;
  final Widget content;
  final Widget? footer;

  const CardLayout({
    this.leading,
    required this.title,
    this.subtitle,
    this.actions = const [],
    required this.content,
    this.footer,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Padding(
            padding: EdgeInsets.all(16),
            child: Row(
              children: [
                if (leading != null) ...[
                  leading!,
                  SizedBox(width: 12),
                ],
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      title,
                      if (subtitle != null) subtitle!,
                    ],
                  ),
                ),
                ...actions,
              ],
            ),
          ),
          // Content
          content,
          // Footer
          if (footer != null) footer!,
        ],
      ),
    );
  }
}

// 使用
CardLayout(
  leading: CircleAvatar(child: Icon(Icons.person)),
  title: Text('John Doe'),
  subtitle: Text('Software Engineer'),
  actions: [
    IconButton(icon: Icon(Icons.more_vert), onPressed: () {}),
  ],
  content: Padding(
    padding: EdgeInsets.all(16),
    child: Text('User bio goes here...'),
  ),
  footer: ButtonBar(
    children: [
      TextButton(onPressed: () {}, child: Text('FOLLOW')),
      ElevatedButton(onPressed: () {}, child: Text('MESSAGE')),
    ],
  ),
)
```

---

## 5. 主题和样式

### 5.1 主题配置

```dart
// ✅ 集中管理主题
class AppTheme {
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: Colors.blue,
        brightness: Brightness.light,
      ),
      textTheme: _textTheme,
      cardTheme: _cardTheme,
      inputDecorationTheme: _inputDecorationTheme,
      elevatedButtonTheme: _elevatedButtonTheme,
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: Colors.blue,
        brightness: Brightness.dark,
      ),
      textTheme: _textTheme,
      cardTheme: _cardTheme,
    );
  }

  static TextTheme get _textTheme {
    return TextTheme(
      displayLarge: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
      headlineMedium: TextStyle(fontSize: 24, fontWeight: FontWeight.w600),
      bodyLarge: TextStyle(fontSize: 16, height: 1.5),
      bodyMedium: TextStyle(fontSize: 14, height: 1.5),
    );
  }

  static CardTheme get _cardTheme {
    return CardTheme(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
    );
  }

  static InputDecorationTheme get _inputDecorationTheme {
    return InputDecorationTheme(
      filled: true,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
      ),
    );
  }

  static ElevatedButtonThemeData get _elevatedButtonTheme {
    return ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    );
  }
}

// 应用主题
MaterialApp(
  theme: AppTheme.lightTheme,
  darkTheme: AppTheme.darkTheme,
  themeMode: ThemeMode.system,
)
```

### 5.2 响应式设计

```dart
// ✅ 响应式布局
class ResponsiveLayout extends StatelessWidget {
  final Widget mobile;
  final Widget? tablet;
  final Widget? desktop;

  const ResponsiveLayout({
    required this.mobile,
    this.tablet,
    this.desktop,
  });

  static bool isMobile(BuildContext context) =>
      MediaQuery.of(context).size.width < 600;

  static bool isTablet(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    return width >= 600 && width < 1200;
  }

  static bool isDesktop(BuildContext context) =>
      MediaQuery.of(context).size.width >= 1200;

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;

    if (width >= 1200 && desktop != null) {
      return desktop!;
    }
    if (width >= 600 && tablet != null) {
      return tablet!;
    }
    return mobile;
  }
}

// 使用
ResponsiveLayout(
  mobile: MobileView(),
  tablet: TabletView(),
  desktop: DesktopView(),
)
```

---

## 6. 错误处理设计

### 6.1 错误边界

```dart
// ✅ 使用 ErrorWidget 自定义错误显示
class CustomErrorWidget extends StatelessWidget {
  final FlutterErrorDetails errorDetails;

  const CustomErrorWidget({required this.errorDetails});

  @override
  Widget build(BuildContext context) {
    return Material(
      child: Container(
        padding: EdgeInsets.all(16),
        color: Colors.red.shade100,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.error_outline, color: Colors.red, size: 48),
            SizedBox(height: 16),
            Text(
              'Something went wrong',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 8),
            Text(
              errorDetails.exception.toString(),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

// 设置全局错误处理
void main() {
  ErrorWidget.builder = (errorDetails) {
    return CustomErrorWidget(errorDetails: errorDetails);
  };
  runApp(MyApp());
}
```

### 6.2 异步错误处理

```dart
// ✅ 统一的错误处理
class AsyncValueWidget<T> extends StatelessWidget {
  final AsyncValue<T> value;
  final Widget Function(T data) data;
  final Widget Function(Object error, StackTrace? stackTrace)? errorBuilder;
  final Widget Function()? loadingBuilder;

  const AsyncValueWidget({
    required this.value,
    required this.data,
    this.errorBuilder,
    this.loadingBuilder,
  });

  @override
  Widget build(BuildContext context) {
    return value.when(
      data: data,
      loading: () => loadingBuilder?.call() ?? CircularProgressIndicator(),
      error: (error, stackTrace) {
        return errorBuilder?.call(error, stackTrace) ??
            ErrorDisplay(message: error.toString());
      },
    );
  }
}

// 使用
AsyncValueWidget<User>(
  value: ref.watch(userProvider),
  data: (user) => UserProfile(user: user),
  errorBuilder: (error, _) => RetryWidget(
    message: 'Failed to load user',
    onRetry: () => ref.refresh(userProvider),
  ),
)
```

---

## 7. 动画设计

### 7.1 隐式动画

```dart
// ✅ 使用 AnimatedContainer 等隐式动画
class AnimatedCard extends StatefulWidget {
  @override
  _AnimatedCardState createState() => _AnimatedCardState();
}

class _AnimatedCardState extends State<AnimatedCard> {
  bool _isExpanded = false;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => setState(() => _isExpanded = !_isExpanded),
      child: AnimatedContainer(
        duration: Duration(milliseconds: 300),
        curve: Curves.easeInOut,
        width: _isExpanded ? 300 : 150,
        height: _isExpanded ? 400 : 200,
        decoration: BoxDecoration(
          color: _isExpanded ? Colors.blue : Colors.grey,
          borderRadius: BorderRadius.circular(_isExpanded ? 20 : 10),
        ),
        child: Center(child: Text('Tap me')),
      ),
    );
  }
}
```

### 7.2 显式动画

```dart
// ✅ 使用 AnimationController 实现复杂动画
class FadeSlideTransition extends StatefulWidget {
  final Widget child;
  final Duration delay;

  const FadeSlideTransition({
    required this.child,
    this.delay = Duration.zero,
  });

  @override
  _FadeSlideTransitionState createState() => _FadeSlideTransitionState();
}

class _FadeSlideTransitionState extends State<FadeSlideTransition>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: Duration(milliseconds: 500),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOut),
    );

    _slideAnimation = Tween<Offset>(
      begin: Offset(0, 0.5),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOut),
    );

    Future.delayed(widget.delay, () {
      if (mounted) _controller.forward();
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _fadeAnimation,
      child: SlideTransition(
        position: _slideAnimation,
        child: widget.child,
      ),
    );
  }
}
```

---

## 8. 设计检查清单

- [ ] 遵循 SOLID 原则
- [ ] Widget 职责单一
- [ ] 使用组合而非继承
- [ ] 状态管理方案一致
- [ ] UI 组件可复用
- [ ] 主题配置集中管理
- [ ] 错误处理完善
- [ ] 动画流畅自然
- [ ] 响应式布局适配
- [ ] 代码符合 Dart 风格指南
