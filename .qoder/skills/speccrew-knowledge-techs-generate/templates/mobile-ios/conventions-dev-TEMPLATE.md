# {{platform_name}} 开发规范

> **平台**: {{platform_name}}  
> **框架**: iOS (SwiftUI/UIKit)  
> **生成时间**: {{generated_at}}  
> **版本**: 1.0

---

## 1. Swift 命名规范

### 1.1 文件命名

| 类型 | 命名规范 | 示例 |
|------|----------|------|
| Swift 文件 | `PascalCase.swift` | `UserProfileView.swift` |
| ViewModel | `PascalCase+ViewModel.swift` | `UserProfileViewModel.swift` |
| ViewController | `PascalCase+ViewController.swift` | `HomeViewController.swift` |
| Extension | `Type+Extension.swift` | `String+Validation.swift` |
| Protocol | `PascalCase+Protocol.swift` | `UserServiceProtocol.swift` |
| Test | `PascalCase+Tests.swift` | `UserServiceTests.swift` |

```swift
// ✅ 正确
// Sources/
//   ├── Views/
//   │   ├── UserProfileView.swift
//   │   └── HomeView.swift
//   ├── ViewModels/
//   │   ├── UserProfileViewModel.swift
//   │   └── HomeViewModel.swift
//   ├── Services/
//   │   ├── UserService.swift
//   │   └── UserServiceProtocol.swift
//   └── Extensions/
//       ├── String+Validation.swift
//       └── Date+Formatting.swift
```

### 1.2 类型命名

| 类型 | 规范 | 示例 |
|------|------|------|
| 结构体 | `PascalCase` | `User`, `OrderDetails` |
| 类 | `PascalCase` | `UserService`, `NetworkManager` |
| 枚举 | `PascalCase` | `UserStatus`, `NetworkError` |
| 协议 | `PascalCase` | `UserServiceProtocol`, `Codable` |
| 关联类型 | `PascalCase` | `Element`, `Key`, `Value` |
| 泛型参数 | `T`, `U`, `Element` | `Array<Element>` |

```swift
// ✅ 正确
struct UserProfile { }
class NetworkManager { }
enum PaymentStatus { case pending, completed, failed }
protocol DataRepositoryProtocol { }
```

### 1.3 变量和函数命名

| 类型 | 规范 | 示例 |
|------|------|------|
| 变量 | `lowerCamelCase` | `userName`, `orderList` |
| 常量 | `lowerCamelCase` | `defaultTimeout`, `maxRetries` |
| 函数 | `lowerCamelCase` | `fetchUser()`, `validateEmail()` |
| 布尔变量 | `is`/`has`/`should` 前缀 | `isLoading`, `hasError` |
| 私有成员 | `private` 修饰符 | `private var count` |
| 枚举值 | `lowerCamelCase` | `case active`, `case inactive` |

```swift
// ✅ 正确
let defaultPageSize = 20
let apiBaseURL = "https://api.example.com"

class UserService {
    private let networkManager: NetworkManager
    private var cachedUsers: [User] = []
    
    var isAuthenticated: Bool { /* ... */ }
    
    func fetchUser(byId id: UUID) async throws -> User { }
    func validateEmail(_ email: String) -> Bool { }
}

enum LoadingState {
    case idle
    case loading
    case success
    case failure
}
```

### 1.4 参数标签

```swift
// ✅ 使用描述性参数标签
func sendMessage(_ message: String, to recipient: User) { }
// 调用: sendMessage("Hello", to: user)

func move(from start: Point, to end: Point) { }
// 调用: move(from: pointA, to: pointB)

func remove(at index: Int) { }
func remove(_ member: Element) { }
// 区分: remove(at: 5) vs remove(user)
```

---

## 2. 文件组织

### 2.1 目录结构

```
{{platform_name}}/
├── App/
│   ├── {{platform_name}}App.swift
│   ├── AppDelegate.swift
│   └── Info.plist
├── Sources/
│   ├── Core/
│   │   ├── Extensions/           # Swift 扩展
│   │   ├── Utilities/            # 工具类
│   │   ├── Constants/            # 常量定义
│   │   └── Networking/           # 网络层
│   ├── Models/                   # 数据模型
│   │   ├── User.swift
│   │   └── Order.swift
│   ├── Services/                 # 服务层
│   │   ├── API/
│   │   ├── Storage/
│   │   └── Analytics/
│   ├── ViewModels/               # 视图模型 (MVVM)
│   │   ├── UserProfileViewModel.swift
│   │   └── HomeViewModel.swift
│   ├── Views/                    # SwiftUI 视图
│   │   ├── Components/           # 可复用组件
│   │   │   ├── Buttons/
│   │   │   ├── Cards/
│   │   │   └── Inputs/
│   │   ├── Screens/              # 页面视图
│   │   │   ├── Home/
│   │   │   ├── Profile/
│   │   │   └── Settings/
│   │   └── Modifiers/            # 视图修饰器
│   ├── ViewControllers/          # UIKit 视图控制器
│   └── Resources/
│       ├── Localization/
│       ├── Fonts/
│       └── JSON/
└── Tests/
    ├── UnitTests/
    └── UITests/
```

### 2.2 文件内容组织

```swift
// ✅ 文件内容顺序
import Foundation          // 1. 系统框架
import SwiftUI             // 2. UI 框架
import Combine             // 3. 其他 Apple 框架

// 4. 第三方框架
import Alamofire
import Kingfisher

// 5. 项目内导入
import Core
import Models

// MARK: - Protocols           // 6. 协议定义
protocol UserServiceProtocol { }

// MARK: - Types               // 7. 类型定义
struct User { }

// MARK: - Enums               // 8. 枚举定义
enum UserError: Error { }

// MARK: - Class/Struct        // 9. 主类/结构体
class UserService: UserServiceProtocol {
    // MARK: - Properties
    private let networkManager: NetworkManager
    
    // MARK: - Initialization
    init(networkManager: NetworkManager) {
        self.networkManager = networkManager
    }
    
    // MARK: - Public Methods
    func fetchUser() async throws -> User { }
    
    // MARK: - Private Methods
    private func cacheUser(_ user: User) { }
}

// MARK: - Extensions          // 10. 扩展
extension UserService { }

// MARK: - Private Extensions  // 11. 私有扩展
private extension UserService { }
```

---

## 3. 访问控制

### 3.1 访问级别

```swift
// ✅ 合理使用访问控制
public class PublicService {       // 公开访问
    public func publicMethod() { }
    internal func internalMethod() { }  // 默认，模块内访问
    fileprivate func fileMethod() { }  // 文件内访问
    private func privateMethod() { }   // 私有访问
}

open class OpenClass {             // 可继承的公开类
    open func openMethod() { }     // 可重写
    public final func finalMethod() { }  // 不可重写
}

// ✅ 默认使用最严格的访问级别
class UserRepository {
    private let apiClient: APIClient
    private var cache: [UUID: User] = [:]
    
    internal init(apiClient: APIClient) {
        self.apiClient = apiClient
    }
    
    func fetchUser(id: UUID) async throws -> User {  // internal
        // ...
    }
}
```

### 3.2 属性访问控制

```swift
// ✅ 属性访问控制
class UserProfileViewModel: ObservableObject {
    // 公开读取，私有写入
    @Published private(set) var user: User?
    @Published private(set) var isLoading = false
    
    // 完全私有
    private var cancellables = Set<AnyCancellable>()
    private let userService: UserServiceProtocol
    
    // 计算属性
    var isAuthenticated: Bool {
        return user != nil
    }
}
```

---

## 4. 导入组织

### 4.1 导入分组

```swift
// ✅ 按分组组织导入，每组之间空一行
// MARK: - Imports

import Foundation
import Combine
import SwiftUI

import Alamofire
import Kingfisher

import Core
import Models
import Services
```

### 4.2 导入规范

```swift
// ✅ 使用 @testable 导入测试
@testable import {{platform_name}}

// ✅ 条件导入
#if canImport(UIKit)
import UIKit
#elseif canImport(AppKit)
import AppKit
#endif

// ✅ 使用 typealias 简化复杂类型
import struct Foundation.URLRequest
typealias Request = URLRequest
```

---

## 5. 代码风格

### 5.1 缩进和格式

```swift
// ✅ 使用 4 空格缩进
class Example {
    func method() {
        if condition {
            doSomething()
        }
    }
}

// ✅ 尾随闭包
items.map { $0.name }
    .filter { !$0.isEmpty }
    .sorted()

// ✅ 多行参数
func longFunction(
    parameterOne: String,
    parameterTwo: Int,
    parameterThree: Bool
) -> ReturnType {
    // ...
}

// ✅ 集合尾随逗号
let array = [
    "one",
    "two",
    "three",
]
```

### 5.2 类型推断

```swift
// ✅ 适当使用类型推断
let name = "John"                    // 推断为 String
let count = 42                       // 推断为 Int
let isActive = true                  // 推断为 Bool

// ✅ 复杂类型显式声明
let userDictionary: [String: User] = [:]
let completionHandler: (Result<User, Error>) -> Void = { result in }

// ✅ 空数组/字典显式类型
var items: [String] = []
var lookup: [UUID: User] = [:]
```

### 5.3 可选类型

```swift
// ✅ 使用可选绑定
if let user = fetchUser() {
    print(user.name)
}

// ✅ 使用 guard 提前返回
guard let data = response.data else {
    return
}

// ✅ 使用 nil 合并运算符
let name = user.name ?? "Anonymous"

// ✅ 使用可选链
let street = user.address?.street

// ✅ 强制解包（仅在确定非 nil 时）
let cell = tableView.dequeueReusableCell(withIdentifier: "Cell", for: indexPath) as! CustomCell

// ✅ 隐式解包可选（仅 IBOutlet）
@IBOutlet weak var titleLabel: UILabel!
```

### 5.4 文档注释

```swift
/// 用户服务类，负责用户数据的获取和更新
///
/// 使用示例:
/// ```swift
/// let service = UserService(apiClient: client)
/// let user = try await service.fetchUser(id: userId)
/// ```
class UserService {
    
    /// 根据 ID 获取用户
    ///
    /// - Parameter id: 用户唯一标识
    /// - Returns: 用户对象
    /// - Throws: NetworkError 如果网络请求失败
    func fetchUser(id: UUID) async throws -> User {
        // ...
    }
    
    /// 更新用户信息
    ///
    /// - Parameters:
    ///   - user: 要更新的用户对象
    ///   - completion: 完成回调，返回更新结果
    func updateUser(
        _ user: User,
        completion: @escaping (Result<User, Error>) -> Void
    ) {
        // ...
    }
}

// MARK: - 分组标记
// TODO: - 待办事项
// FIXME: - 需要修复
// NOTE: - 重要说明
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
- 集成 Keychain 存储

Closes #123
```

```
fix(api): 修复用户列表加载失败问题

当网络超时时不应该显示空状态，
应该显示重试按钮。

Fixes #456
```

### 6.3 .gitignore 配置

```gitignore
# Xcode
.DS_Store
*/build/*
*.pbxuser
!default.pbxuser
*.mode1v3
!default.mode1v3
*.mode2v3
!default.mode2v3
*.perspectivev3
!default.perspectivev3
xcuserdata
profile
*.moved-aside
DerivedData
.idea/
*.hmap
*.xccheckout
*.xcscmblueprint

# Swift Package Manager
.build/
Packages/
Package.resolved
*.xcodeproj
.swiftpm/

# CocoaPods
Pods/
*.xcworkspace

# Carthage
Carthage/Build/
Carthage/Checkouts/

# fastlane
fastlane/report.xml
fastlane/Preview.html
fastlane/screenshots/**/*.png
fastlane/test_output

# Code Injection
injected_container.swift
```

---

## 7. 代码审查清单

- [ ] 代码符合 Swift API 设计指南
- [ ] 命名清晰、描述性强
- [ ] 访问控制合理
- [ ] 导入语句组织有序
- [ ] 错误处理完善
- [ ] 无强制解包（除 IBOutlet）
- [ ] 内存管理正确（无循环引用）
- [ ] 文档注释完整
- [ ] 单元测试覆盖
- [ ] 无编译警告

---

## 8. SwiftLint 配置

```yaml
# .swiftlint.yml
excluded:
  - Pods
  - Carthage
  - DerivedData
  - .build

opt_in_rules:
  - empty_count
  - empty_string
  - force_unwrapping
  - implicitly_unwrapped_optional
  - unused_import
  - vertical_whitespace_closing_braces

disabled_rules:
  - trailing_whitespace

line_length:
  warning: 120
  error: 150

function_body_length:
  warning: 60
  error: 100

type_body_length:
  warning: 300
  error: 500

file_length:
  warning: 500
  error: 1000

cyclomatic_complexity:
  warning: 10
  error: 20

nesting:
  type_level:
    warning: 2
  statement_level:
    warning: 5

custom_rules:
  no_print:
    name: "No print"
    regex: "print\\("
    message: "Use logger instead of print"
    severity: warning
```

---

## 9. 开发检查清单

- [ ] 文件命名符合规范
- [ ] 类型/函数/变量命名清晰
- [ ] 导入语句组织有序
- [ ] 访问控制合理
- [ ] 代码格式化正确
- [ ] 文档注释完整
- [ ] 提交信息规范
- [ ] 代码审查通过
- [ ] 单元测试通过
- [ ] 无 SwiftLint 警告
