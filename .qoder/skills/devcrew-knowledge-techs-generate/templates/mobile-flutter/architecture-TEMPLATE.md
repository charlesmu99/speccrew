# {{platform_name}} 架构规范

> **平台**: {{platform_name}}  
> **框架**: Flutter  
> **生成时间**: {{generated_at}}  
> **版本**: 1.0

---

## 1. Widget 架构

### 1.1 StatelessWidget vs StatefulWidget

#### StatelessWidget
用于静态、不依赖状态变化的UI组件。

```dart
// ✅ 正确使用 StatelessWidget
class UserAvatar extends StatelessWidget {
  final String imageUrl;
  final double size;

  const UserAvatar({
    super.key,
    required this.imageUrl,
    this.size = 48.0,
  });

  @override
  Widget build(BuildContext context) {
    return CircleAvatar(
      radius: size / 2,
      backgroundImage: NetworkImage(imageUrl),
    );
  }
}
```

#### StatefulWidget
用于需要管理内部状态或响应用户交互的组件。

```dart
// ✅ 正确使用 StatefulWidget
class CounterButton extends StatefulWidget {
  final int initialValue;

  const CounterButton({
    super.key,
    this.initialValue = 0,
  });

  @override
  State<CounterButton> createState() => _CounterButtonState();
}

class _CounterButtonState extends State<CounterButton> {
  late int _count;

  @override
  void initState() {
    super.initState();
    _count = widget.initialValue;
  }

  void _increment() {
    setState(() {
      _count++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: _increment,
      child: Text('Count: $_count'),
    );
  }
}
```

### 1.2 Widget 生命周期

```dart
class ExampleWidget extends StatefulWidget {
  @override
  State<ExampleWidget> createState() => _ExampleWidgetState();
}

class _ExampleWidgetState extends State<ExampleWidget> {
  @override
  void initState() {
    super.initState();
    // 初始化状态、订阅流、启动动画
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // 依赖的 InheritedWidget 发生变化时调用
  }

  @override
  void didUpdateWidget(covariant ExampleWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Widget 配置发生变化时调用
  }

  @override
  void dispose() {
    // 清理资源、取消订阅、释放控制器
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container();
  }
}
```

---

## 2. 项目结构

### 2.1 推荐目录结构

```
lib/
├── main.dart                 # 应用入口
├── app.dart                  # 应用配置（主题、路由）
├── core/                     # 核心层
│   ├── constants/            # 常量定义
│   ├── theme/                # 主题配置
│   ├── utils/                # 工具类
│   └── extensions/           # Dart 扩展
├── data/                     # 数据层
│   ├── models/               # 数据模型
│   ├── repositories/         # 数据仓库
│   └── datasources/          # 数据源（本地/远程）
├── domain/                   # 领域层
│   ├── entities/             # 领域实体
│   ├── usecases/             # 用例/业务逻辑
│   └── repositories/         # 仓库接口
├── presentation/             # 表现层
│   ├── pages/                # 页面
│   ├── widgets/              # 可复用组件
│   ├── blocs/                # 状态管理（Bloc）
│   └── providers/            # 状态管理（Provider）
└── services/                 # 服务层
    ├── navigation/           # 导航服务
    ├── storage/              # 存储服务
    └── api/                  # API 服务
```

### 2.2 文件命名规范

| 类型 | 命名规范 | 示例 |
|------|----------|------|
| 页面 | `snake_case_page.dart` | `user_profile_page.dart` |
| Widget | `snake_case_widget.dart` | `custom_button_widget.dart` |
| 模型 | `snake_case_model.dart` | `user_model.dart` |
| Repository | `snake_case_repository.dart` | `user_repository.dart` |
| Bloc | `snake_case_bloc.dart` | `auth_bloc.dart` |

---

## 3. 状态管理

### 3.1 Provider 模式

适用于中小型应用，简单直观。

```dart
// 定义 Provider
class UserProvider extends ChangeNotifier {
  User? _user;
  
  User? get user => _user;
  bool get isLoggedIn => _user != null;

  void setUser(User user) {
    _user = user;
    notifyListeners();
  }

  void logout() {
    _user = null;
    notifyListeners();
  }
}

// 在 main.dart 中注册
void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => UserProvider()),
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
      ],
      child: const MyApp(),
    ),
  );
}

// 在 Widget 中使用
class ProfilePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final userProvider = context.watch<UserProvider>();
    
    return Scaffold(
      body: userProvider.isLoggedIn
          ? UserProfile(user: userProvider.user!)
          : LoginPrompt(),
    );
  }
}
```

### 3.2 Riverpod 模式

Provider 的进化版，更安全、更灵活。

```dart
// 定义 Provider
final userRepositoryProvider = Provider<UserRepository>((ref) {
  return UserRepository(ref.watch(apiClientProvider));
});

final userProvider = StateNotifierProvider<UserNotifier, AsyncValue<User>>((ref) {
  return UserNotifier(ref.watch(userRepositoryProvider));
});

// StateNotifier
class UserNotifier extends StateNotifier<AsyncValue<User>> {
  final UserRepository _repository;

  UserNotifier(this._repository) : super(const AsyncValue.loading());

  Future<void> loadUser(String id) async {
    state = const AsyncValue.loading();
    try {
      final user = await _repository.getUser(id);
      state = AsyncValue.data(user);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

// 在 Widget 中使用
class ProfilePage extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userAsync = ref.watch(userProvider);

    return userAsync.when(
      data: (user) => UserProfile(user: user),
      loading: () => const CircularProgressIndicator(),
      error: (error, _) => ErrorWidget(error),
    );
  }
}
```

### 3.3 Bloc 模式

适用于大型应用，严格分离业务逻辑。

```dart
// Events
abstract class AuthEvent {}
class LoginRequested extends AuthEvent {
  final String email;
  final String password;
  LoginRequested(this.email, this.password);
}
class LogoutRequested extends AuthEvent {}

// States
abstract class AuthState {}
class AuthInitial extends AuthState {}
class AuthLoading extends AuthState {}
class AuthAuthenticated extends AuthState {
  final User user;
  AuthAuthenticated(this.user);
}
class AuthError extends AuthState {
  final String message;
  AuthError(this.message);
}

// Bloc
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository _repository;

  AuthBloc(this._repository) : super(AuthInitial()) {
    on<LoginRequested>(_onLoginRequested);
    on<LogoutRequested>(_onLogoutRequested);
  }

  Future<void> _onLoginRequested(
    LoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      final user = await _repository.login(event.email, event.password);
      emit(AuthAuthenticated(user));
    } catch (e) {
      emit(AuthError(e.toString()));
    }
  }

  void _onLogoutRequested(LogoutRequested event, Emitter<AuthState> emit) {
    _repository.logout();
    emit(AuthInitial());
  }
}

// 在 Widget 中使用
class LoginPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BlocConsumer<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is AuthError) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(state.message)),
          );
        }
      },
      builder: (context, state) {
        if (state is AuthLoading) {
          return const LoadingIndicator();
        }
        return LoginForm();
      },
    );
  }
}
```

### 3.4 状态管理选择指南

| 场景 | 推荐方案 | 理由 |
|------|----------|------|
| 小型应用 | Provider | 简单，学习成本低 |
| 中型应用 | Riverpod | 类型安全，依赖注入 |
| 大型应用 | Bloc | 严格的架构分离，可测试性强 |
| 表单处理 | Riverpod + StateNotifier | 细粒度状态控制 |
| 全局状态 | Riverpod/Provider | 跨页面共享 |

---

## 4. 导航模式

### 4.1 Navigator 2.0 (声明式导航)

```dart
// 路由配置
class AppRouter {
  static final _rootNavigatorKey = GlobalKey<NavigatorState>();

  static final GoRouter router = GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/',
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const HomePage(),
      ),
      GoRoute(
        path: '/profile/:userId',
        builder: (context, state) {
          final userId = state.pathParameters['userId']!;
          return ProfilePage(userId: userId);
        },
      ),
      GoRoute(
        path: '/settings',
        builder: (context, state) => const SettingsPage(),
        routes: [
          GoRoute(
            path: 'notifications',
            builder: (context, state) => const NotificationsSettingsPage(),
          ),
        ],
      ),
    ],
    redirect: (context, state) {
      // 认证检查
      final isAuthenticated = context.read<AuthProvider>().isAuthenticated;
      final isLoginRoute = state.matchedLocation == '/login';
      
      if (!isAuthenticated && !isLoginRoute) {
        return '/login';
      }
      return null;
    },
  );
}

// 使用 GoRouter
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      routerConfig: AppRouter.router,
      title: '{{platform_name}}',
    );
  }
}

// 导航操作
context.go('/profile/123');
context.push('/settings');
context.pop();
```

### 4.2 深度链接处理

```dart
// Android: AndroidManifest.xml
// <intent-filter>
//   <action android:name="android.intent.action.VIEW" />
//   <category android:name="android.intent.category.DEFAULT" />
//   <category android:name="android.intent.category.BROWSABLE" />
//   <data android:scheme="myapp" android:host="profile" />
// </intent-filter>

// iOS: Info.plist
// <key>CFBundleURLTypes</key>
// <array>
//   <dict>
//     <key>CFBundleURLSchemes</key>
//     <array>
//       <string>myapp</string>
//     </array>
//   </dict>
// </array>

// 处理深度链接
goRouter.routerDelegate.addListener(() {
  final location = goRouter.routerDelegate.currentConfiguration.uri;
  // 处理特定路由逻辑
});
```

---

## 5. 平台通道

### 5.1 MethodChannel (基本通信)

```dart
// Dart 端
class BatteryService {
  static const platform = MethodChannel('com.example.battery');

  static Future<int> getBatteryLevel() async {
    try {
      final int batteryLevel = await platform.invokeMethod('getBatteryLevel');
      return batteryLevel;
    } on PlatformException catch (e) {
      throw 'Failed to get battery level: ${e.message}';
    }
  }
}

// Android (Kotlin)
// class MainActivity : FlutterActivity() {
//     private val CHANNEL = "com.example.battery"
//     
//     override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
//         super.configureFlutterEngine(flutterEngine)
//         MethodChannel(flutterEngine.dartExecutor.binaryMessenger, CHANNEL)
//             .setMethodCallHandler { call, result ->
//                 if (call.method == "getBatteryLevel") {
//                     val batteryLevel = getBatteryLevel()
//                     result.success(batteryLevel)
//                 } else {
//                     result.notImplemented()
//                 }
//             }
//     }
// }

// iOS (Swift)
// @UIApplicationMain
// @objc class AppDelegate: FlutterAppDelegate {
//   override func application(
//     _ application: UIApplication,
//     didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
//   ) -> Bool {
//     let controller = window?.rootViewController as! FlutterViewController
//     let batteryChannel = FlutterMethodChannel(
//       name: "com.example.battery",
//       binaryMessenger: controller.binaryMessenger)
//     
//     batteryChannel.setMethodCallHandler { (call, result) in
//       if call.method == "getBatteryLevel" {
//         result(UIDevice.current.batteryLevel)
//       } else {
//         result(FlutterMethodNotImplemented)
//       }
//     }
//     return super.application(application, didFinishLaunchingWithOptions: launchOptions)
//   }
// }
```

### 5.2 EventChannel (事件流)

```dart
// Dart 端
class SensorService {
  static const EventChannel _eventChannel = 
      EventChannel('com.example.sensors/accelerometer');

  static Stream<AccelerometerEvent> get accelerometerEvents {
    return _eventChannel.receiveBroadcastStream().map((event) {
      return AccelerometerEvent(event[0], event[1], event[2]);
    });
  }
}

// 使用
StreamBuilder<AccelerometerEvent>(
  stream: SensorService.accelerometerEvents,
  builder: (context, snapshot) {
    if (snapshot.hasData) {
      return Text('X: ${snapshot.data!.x}');
    }
    return const CircularProgressIndicator();
  },
)
```

### 5.3 Pigeon (类型安全)

```dart
// 定义接口 (pigeon/message.dart)
import 'package:pigeon/pigeon.dart';

@HostApi()
abstract class BatteryApi {
  int getBatteryLevel();
}

@FlutterApi()
abstract class FlutterBatteryApi {
  void onBatteryLevelChanged(int level);
}

// 生成代码
// flutter pub run pigeon \
//   --input pigeon/message.dart \
//   --dart_out lib/pigeon.dart \
//   --kotlin_out android/app/src/main/kotlin/com/example/BatteryApi.kt \
//   --swift_out ios/Runner/BatteryApi.swift
```

---

## 6. 性能优化

### 6.1 Widget 优化

```dart
// ✅ 使用 const 构造函数
const Text('Hello');
const SizedBox(height: 16);

// ✅ 使用 const 集合
const items = ['Item 1', 'Item 2', 'Item 3'];

// ✅ 使用 RepaintBoundary 隔离重绘
RepaintBoundary(
  child: ComplexAnimationWidget(),
)

// ✅ 使用 Builder 减少 rebuild 范围
Builder(
  builder: (context) {
    final value = context.watch<ValueProvider>().value;
    return Text('$value');
  },
)
```

### 6.2 列表优化

```dart
// ✅ 使用 ListView.builder 实现懒加载
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) {
    return ListTile(
      title: Text(items[index].title),
    );
  },
)

// ✅ 为列表项添加 key
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) {
    final item = items[index];
    return ListTile(
      key: ValueKey(item.id),  // 帮助 Flutter 识别列表项
      title: Text(item.title),
    );
  },
)

// ✅ 使用 AutomaticKeepAliveClientMixin 保持状态
class KeepAliveItem extends StatefulWidget {
  @override
  _KeepAliveItemState createState() => _KeepAliveItemState();
}

class _KeepAliveItemState extends State<KeepAliveItem>
    with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true;

  @override
  Widget build(BuildContext context) {
    super.build(context); // 必须调用
    return ExpensiveWidget();
  }
}
```

### 6.3 图片优化

```dart
// ✅ 使用缓存图片
CachedNetworkImage(
  imageUrl: imageUrl,
  placeholder: (context, url) => CircularProgressIndicator(),
  errorWidget: (context, url, error) => Icon(Icons.error),
)

// ✅ 指定图片尺寸
Image.network(
  imageUrl,
  width: 200,
  height: 200,
  fit: BoxFit.cover,
  cacheWidth: 400,  // 限制缓存大小
)
```

---

## 7. 平台适配

### 7.1 平台判断

```dart
import 'dart:io' show Platform;

if (Platform.isIOS) {
  // iOS 特定代码
} else if (Platform.isAndroid) {
  // Android 特定代码
}

// 使用 Theme 获取平台信息
final isIOS = Theme.of(context).platform == TargetPlatform.iOS;
```

### 7.2 平台特定 UI

```dart
// ✅ 使用 PlatformWidget 抽象平台差异
abstract class PlatformWidget extends StatelessWidget {
  Widget buildCupertinoWidget(BuildContext context);
  Widget buildMaterialWidget(BuildContext context);

  @override
  Widget build(BuildContext context) {
    if (Platform.isIOS) {
      return buildCupertinoWidget(context);
    }
    return buildMaterialWidget(context);
  }
}

class PlatformButton extends PlatformWidget {
  final String text;
  final VoidCallback onPressed;

  PlatformButton({required this.text, required this.onPressed});

  @override
  Widget buildCupertinoWidget(BuildContext context) {
    return CupertinoButton(
      child: Text(text),
      onPressed: onPressed,
    );
  }

  @override
  Widget buildMaterialWidget(BuildContext context) {
    return ElevatedButton(
      child: Text(text),
      onPressed: onPressed,
    );
  }
}
```

---

## 8. 架构检查清单

- [ ] Widget 职责单一，避免 God Widget
- [ ] 状态管理方案适合项目规模
- [ ] 业务逻辑与 UI 分离
- [ ] 使用依赖注入管理依赖
- [ ] 导航逻辑集中管理
- [ ] 平台通道代码封装良好
- [ ] 性能关键路径已优化
- [ ] 平台特定代码已隔离
