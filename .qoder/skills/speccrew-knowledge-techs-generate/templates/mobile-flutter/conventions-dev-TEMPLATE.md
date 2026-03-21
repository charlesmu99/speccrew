# {{platform_name}} 开发规范

> **平台**: {{platform_name}}  
> **框架**: Flutter  
> **生成时间**: {{generated_at}}  
> **版本**: 1.0

---

## 1. Dart 命名规范

### 1.1 文件命名

| 类型 | 规范 | 示例 |
|------|------|------|
| 库文件 | `snake_case.dart` | `user_repository.dart` |
| 页面文件 | `snake_case_page.dart` | `profile_page.dart` |
| Widget 文件 | `snake_case_widget.dart` | `custom_button_widget.dart` |
| 模型文件 | `snake_case_model.dart` | `user_model.dart` |
| 测试文件 | `snake_case_test.dart` | `user_repository_test.dart` |

```dart
// ✅ 正确
// lib/
//   ├── models/
//   │   ├── user_model.dart
//   │   └── order_model.dart
//   ├── pages/
//   │   ├── home_page.dart
//   │   └── profile_page.dart
//   └── widgets/
//       ├── custom_button_widget.dart
//       └── loading_indicator_widget.dart
```

### 1.2 类命名

| 类型 | 规范 | 示例 |
|------|------|------|
| 类名 | `PascalCase` | `UserRepository`, `HomePage` |
| 枚举 | `PascalCase` | `UserStatus`, `OrderState` |
| 扩展 | `PascalCase` | `StringExtensions`, `DateTimeUtils` |
| Mixin | `PascalCase` | `Loggable`, `Disposable` |
| Typedef | `PascalCase` | `UserCallback`, `Validator` |

```dart
// ✅ 正确
class UserRepository { }
class HomePage extends StatelessWidget { }
enum UserStatus { active, inactive, suspended }
extension StringExtensions on String { }
mixin Loggable { }
typedef UserCallback = void Function(User user);
```

### 1.3 变量和函数命名

| 类型 | 规范 | 示例 |
|------|------|------|
| 变量 | `lowerCamelCase` | `userName`, `orderList` |
| 常量 | `lowerCamelCase` | `defaultTimeout`, `maxRetries` |
| 顶级常量 | `lowerCamelCase` | `apiBaseUrl` |
| 函数 | `lowerCamelCase` | `getUserById()`, `fetchOrders()` |
| 私有成员 | `_lowerCamelCase` | `_internalState`, `_fetchData()` |
| 枚举值 | `lowerCamelCase` | `userStatusActive`, `orderStatePending` |

```dart
// ✅ 正确
const defaultPageSize = 20;
final apiBaseUrl = 'https://api.example.com';

class UserService {
  final String _apiKey;
  List<User> _cachedUsers = [];

  UserService(this._apiKey);

  Future<User> getUserById(String id) async { }
  
  void _clearCache() { }
}

enum LoadingState {
  initial,
  loading,
  success,
  error,
}
```

### 1.4 构造函数参数

```dart
// ✅ 使用 this.field 简写
class User {
  final String id;
  final String name;
  final String email;

  const User({
    required this.id,
    required this.name,
    required this.email,
  });

  // ✅ 命名构造函数
  User.guest()
      : id = 'guest',
        name = 'Guest User',
        email = '';

  // ✅ 从 JSON 构造
  User.fromJson(Map<String, dynamic> json)
      : id = json['id'] as String,
        name = json['name'] as String,
        email = json['email'] as String;
}
```

---

## 2. 文件组织

### 2.1 目录结构

```
lib/
├── main.dart                    # 应用入口
├── app.dart                     # 应用配置
├── core/                        # 核心层
│   ├── constants/               # 常量
│   │   ├── api_constants.dart
│   │   ├── app_constants.dart
│   │   └── storage_keys.dart
│   ├── theme/                   # 主题
│   │   ├── app_theme.dart
│   │   ├── app_colors.dart
│   │   └── app_typography.dart
│   ├── utils/                   # 工具类
│   │   ├── date_utils.dart
│   │   ├── string_utils.dart
│   │   └── validators.dart
│   └── extensions/              # 扩展
│       ├── string_extensions.dart
│       └── context_extensions.dart
├── data/                        # 数据层
│   ├── models/                  # 数据模型
│   │   ├── user_model.dart
│   │   └── order_model.dart
│   ├── repositories/            # 数据仓库实现
│   │   ├── user_repository_impl.dart
│   │   └── order_repository_impl.dart
│   └── datasources/             # 数据源
│       ├── local/
│       │   ├── local_storage.dart
│       │   └── database_helper.dart
│       └── remote/
│           ├── api_client.dart
│           └── api_interceptors.dart
├── domain/                      # 领域层
│   ├── entities/                # 领域实体
│   │   ├── user_entity.dart
│   │   └── order_entity.dart
│   ├── repositories/            # 仓库接口
│   │   ├── user_repository.dart
│   │   └── order_repository.dart
│   └── usecases/                # 用例
│       ├── get_user_usecase.dart
│       └── get_orders_usecase.dart
├── presentation/                # 表现层
│   ├── pages/                   # 页面
│   │   ├── home/
│   │   │   ├── home_page.dart
│   │   │   └── widgets/
│   │   │       ├── home_header.dart
│   │   │       └── home_content.dart
│   │   └── profile/
│   │       ├── profile_page.dart
│   │       └── widgets/
│   ├── widgets/                 # 公共组件
│   │   ├── common/
│   │   │   ├── app_button.dart
│   │   │   ├── app_text_field.dart
│   │   │   └── loading_widget.dart
│   │   └── layout/
│   │       ├── responsive_layout.dart
│   │       └── app_scaffold.dart
│   ├── blocs/                   # BLoC 状态管理
│   │   ├── auth/
│   │   │   ├── auth_bloc.dart
│   │   │   ├── auth_event.dart
│   │   │   └── auth_state.dart
│   │   └── user/
│   │       ├── user_bloc.dart
│   │       ├── user_event.dart
│   │       └── user_state.dart
│   └── providers/               # Provider 状态管理
│       ├── auth_provider.dart
│       └── theme_provider.dart
└── services/                    # 服务层
    ├── navigation/
    │   ├── app_router.dart
    │   └── route_names.dart
    ├── storage/
    │   ├── secure_storage.dart
    │   └── shared_prefs.dart
    └── analytics/
        └── analytics_service.dart
```

### 2.2 文件内容组织

```dart
// ✅ 文件内容顺序
// 1. Dart SDK 导入
import 'dart:async';
import 'dart:convert';

// 2. Flutter 包导入
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

// 3. 第三方包导入
import 'package:dio/dio.dart';
import 'package:freezed_annotation/freezed_annotation.dart';

// 4. 项目内导入 (按路径字母顺序)
import '../constants/api_constants.dart';
import '../models/user_model.dart';
import '../utils/string_utils.dart';

// 5. 相对导入当前目录
import 'auth_service.dart';

// 6. part 文件
part 'user_repository.g.dart';

// 7. 导出
export 'user_repository_interface.dart';

// 8. 代码
class UserRepository { }
```

---

## 3. Widget 组合规范

### 3.1 Widget 拆分原则

```dart
// ❌ 错误：过于庞大的 build 方法
class BadExample extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          // 50+ 行代码...
        ],
      ),
    );
  }
}

// ✅ 正确：拆分为小 Widget
class GoodExample extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          HeaderSection(),
          ContentSection(),
          FooterSection(),
        ],
      ),
    );
  }
}

class HeaderSection extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(/* ... */);
  }
}

class ContentSection extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(/* ... */);
  }
}

class FooterSection extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(/* ... */);
  }
}
```

### 3.2 const 构造函数

```dart
// ✅ 尽可能使用 const
class OptimizedWidget extends StatelessWidget {
  const OptimizedWidget({super.key});  // const 构造函数

  @override
  Widget build(BuildContext context) {
    return Column(
      children: const [
        Text('Title'),           // const
        SizedBox(height: 16),    // const
        Text('Subtitle'),        // const
      ],
    );
  }
}

// ✅ 列表使用 const
const items = [
  'Item 1',
  'Item 2',
  'Item 3',
];
```

### 3.3 Key 的使用

```dart
// ✅ 在列表中使用 Key
ListView.builder(
  itemCount: users.length,
  itemBuilder: (context, index) {
    final user = users[index];
    return UserListItem(
      key: ValueKey(user.id),  // 唯一标识
      user: user,
    );
  },
)

// ✅ 在动画中使用 Key
AnimatedSwitcher(
  duration: Duration(milliseconds: 300),
  child: condition
      ? WidgetA(key: ValueKey('a'))
      : WidgetB(key: ValueKey('b')),
)
```

---

## 4. 导入组织

### 4.1 导入分组

```dart
// ✅ 按分组组织导入，每组之间空一行
// Dart SDK
import 'dart:async';
import 'dart:convert';
import 'dart:io';

// Flutter
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

// 第三方包 (按字母顺序)
import 'package:dio/dio.dart';
import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:go_router/go_router.dart';
import 'package:json_annotation/json_annotation.dart';

// 项目内导入 (按路径字母顺序)
import '../../constants/app_constants.dart';
import '../../core/utils/validators.dart';
import '../../data/models/user_model.dart';
import '../../domain/entities/user_entity.dart';
import '../widgets/custom_button.dart';
```

### 4.2 导入路径规范

```dart
// ✅ 使用 package 导入（推荐）
import 'package:my_app/core/utils/logger.dart';
import 'package:my_app/data/models/user_model.dart';

// ✅ 相对导入（同一目录或子目录）
import 'user_repository.dart';
import '../models/user_model.dart';

// ❌ 避免混用
// 不要在一个文件中同时使用 package 导入和相对导入指向同一文件
```

### 4.3 导出文件

```dart
// ✅ 创建 barrel 文件 (index.dart)
// widgets/index.dart
export 'app_button.dart';
export 'app_text_field.dart';
export 'loading_indicator.dart';
export 'error_widget.dart';

// 使用
import 'package:my_app/presentation/widgets/index.dart';
```

---

## 5. 代码风格

### 5.1 格式化

```yaml
# analysis_options.yaml
include: package:flutter_lints/flutter.yaml

linter:
  rules:
    # 启用规则
    prefer_single_quotes: true
    prefer_const_constructors: true
    prefer_const_literals_to_create_immutables: true
    avoid_print: true
    prefer_final_locals: true
    prefer_final_in_for_each: true
    
formatter:
  line_length: 100
```

### 5.2 代码示例

```dart
// ✅ 使用尾随逗号（便于 diff 和格式化）
final user = User(
  id: '123',
  name: 'John',
  email: 'john@example.com',
  age: 30,  // 尾随逗号
);

// ✅ 函数参数格式化
void createUser({
  required String name,
  required String email,
  int? age,
  String? phone,
}) {
  // ...
}

// ✅ 集合尾随逗号
final colors = [
  Colors.red,
  Colors.green,
  Colors.blue,
];

// ✅ 构建器模式格式化
Widget build(BuildContext context) {
  return Scaffold(
    appBar: AppBar(
      title: const Text('Title'),
      actions: [
        IconButton(
          icon: const Icon(Icons.search),
          onPressed: _handleSearch,
        ),
      ],
    ),
    body: const BodyContent(),
  );
}
```

### 5.3 文档注释

```dart
/// 用户仓库类，负责用户数据的获取和存储
/// 
/// 使用示例:
/// ```dart
/// final repository = UserRepository(apiClient);
/// final user = await repository.getUser('123');
/// ```
class UserRepository {
  final ApiClient _client;

  /// 创建用户仓库实例
  /// 
  /// [client] API 客户端实例
  const UserRepository(this._client);

  /// 根据 ID 获取用户
  /// 
  /// [id] 用户唯一标识
  /// 
  /// 返回 [User] 对象，如果用户不存在则抛出 [UserNotFoundException]
  Future<User> getUser(String id) async {
    // ...
  }

  /// 更新用户信息
  /// 
  /// [user] 要更新的用户对象
  /// 
  /// 返回更新后的 [User] 对象
  Future<User> updateUser(User user) async {
    // ...
  }
}
```

---

## 6. Git 规范

### 6.1 分支命名

| 类型 | 命名规范 | 示例 |
|------|----------|------|
| 功能分支 | `feature/功能描述` | `feature/user-authentication` |
| 修复分支 | `fix/问题描述` | `fix/login-crash` |
| 热修复 | `hotfix/问题描述` | `hotfix/critical-bug` |
| 发布分支 | `release/版本号` | `release/v1.2.0` |
| 重构分支 | `refactor/描述` | `refactor/user-repository` |

### 6.2 提交信息规范

```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型 (type):**
- `feat`: 新功能
- `fix`: 修复
- `docs`: 文档
- `style`: 格式（不影响代码运行的变动）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试
- `chore`: 构建过程或辅助工具的变动

**示例:**
```
feat(auth): 添加用户登录功能

- 实现邮箱密码登录
- 添加登录状态持久化
- 集成 Firebase Auth

Closes #123
```

```
fix(api): 修复用户列表加载失败问题

当网络超时时不应该显示空状态，
应该显示重试按钮。

Fixes #456
```

### 6.3 代码审查清单

- [ ] 代码符合 Dart 风格指南
- [ ] 所有变量和函数都有适当的命名
- [ ] 使用了 const 构造函数（如适用）
- [ ] Widget 被合理拆分
- [ ] 没有未使用的导入
- [ ] 没有 print 调试语句
- [ ] 错误处理完善
- [ ] 文档注释完整
- [ ] 测试覆盖新功能
- [ ] 没有明显的性能问题

---

## 7. 开发工具配置

### 7.1 VS Code 设置

```json
// .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.rulers": [100],
  "editor.codeActionsOnSave": {
    "source.fixAll": "explicit",
    "source.organizeImports": "explicit"
  },
  "dart.lineLength": 100,
  "dart.previewFlutterUiGuides": true,
  "dart.previewFlutterUiGuidesCustomTracking": true,
  "[dart]": {
    "editor.defaultFormatter": "Dart-Code.dart-code",
    "editor.formatOnSave": true
  }
}
```

### 7.2 代码片段

```json
// .vscode/snippets/dart.json
{
  "StatelessWidget": {
    "prefix": "stless",
    "description": "Create a StatelessWidget",
    "body": [
      "class ${1:WidgetName} extends StatelessWidget {",
      "  const ${1:WidgetName}({super.key});",
      "",
      "  @override",
      "  Widget build(BuildContext context) {",
      "    return ${2:Container()};",
      "  }",
      "}"
    ]
  },
  "StatefulWidget": {
    "prefix": "stful",
    "description": "Create a StatefulWidget",
    "body": [
      "class ${1:WidgetName} extends StatefulWidget {",
      "  const ${1:WidgetName}({super.key});",
      "",
      "  @override",
      "  State<${1:WidgetName}> createState() => _${1:WidgetName}State();",
      "}",
      "",
      "class _${1:WidgetName}State extends State<${1:WidgetName}> {",
      "  @override",
      "  Widget build(BuildContext context) {",
      "    return ${2:Container()};",
      "  }",
      "}"
    ]
  }
}
```

---

## 8. 开发检查清单

- [ ] 文件命名符合规范
- [ ] 类/函数/变量命名清晰
- [ ] 导入语句组织有序
- [ ] 使用了 const 构造函数
- [ ] Widget 职责单一
- [ ] 代码格式化正确
- [ ] 文档注释完整
- [ ] 提交信息规范
- [ ] 代码审查通过
- [ ] 测试通过
