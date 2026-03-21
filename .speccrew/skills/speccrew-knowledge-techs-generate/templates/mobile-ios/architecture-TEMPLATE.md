# {{platform_name}} 架构规范

> **平台**: {{platform_name}}  
> **框架**: iOS (SwiftUI/UIKit)  
> **生成时间**: {{generated_at}}  
> **版本**: 1.0

---

## 1. SwiftUI vs UIKit 架构

### 1.1 SwiftUI 架构特点

SwiftUI 采用声明式编程模型，适合新项目和对现代化开发有要求的场景。

```swift
// ✅ SwiftUI 声明式视图
struct ContentView: View {
    @State private var count = 0
    
    var body: some View {
        VStack(spacing: 20) {
            Text("Count: \(count)")
                .font(.largeTitle)
            
            Button("Increment") {
                count += 1
            }
            .buttonStyle(.borderedProminent)
        }
    }
}
```

#### SwiftUI 适用场景
- 新项目开发
- 需要跨 Apple 平台（iOS/macOS/watchOS/tvOS）
- 快速原型开发
- 实时预览需求

### 1.2 UIKit 架构特点

UIKit 采用命令式编程模型，适合复杂业务逻辑和需要精细控制的场景。

```swift
// ✅ UIKit 命令式视图
class ViewController: UIViewController {
    private let countLabel = UILabel()
    private var count = 0
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
    }
    
    private func setupUI() {
        countLabel.font = .systemFont(ofSize: 34, weight: .bold)
        countLabel.text = "Count: 0"
        
        let button = UIButton(type: .system)
        button.setTitle("Increment", for: .normal)
        button.addTarget(self, action: #selector(increment), for: .touchUpInside)
        
        // Auto Layout 设置...
    }
    
    @objc private func increment() {
        count += 1
        countLabel.text = "Count: \(count)"
    }
}
```

#### UIKit 适用场景
- 遗留项目维护
- 需要复杂自定义动画
- 深度系统集成需求
- 性能关键场景

### 1.3 混合架构

在实际项目中，SwiftUI 和 UIKit 可以共存。

```swift
// ✅ 在 UIKit 中使用 SwiftUI
import SwiftUI

class HybridViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        
        let swiftUIView = SwiftUIView()
        let hostingController = UIHostingController(rootView: swiftUIView)
        
        addChild(hostingController)
        view.addSubview(hostingController.view)
        hostingController.didMove(toParent: self)
    }
}

// ✅ 在 SwiftUI 中使用 UIKit
struct UIKitWrapper: UIViewRepresentable {
    func makeUIView(context: Context) -> CustomUIKitView {
        return CustomUIKitView()
    }
    
    func updateUIView(_ uiView: CustomUIKitView, context: Context) {
        // 更新视图
    }
}
```

---

## 2. MVVM 和 MVC 模式

### 2.1 MVVM 模式（推荐）

MVVM 是 iOS 开发中最常用的架构模式，特别是在 SwiftUI 中。

```swift
// ✅ MVVM 架构示例

// Model
struct User: Identifiable, Codable {
    let id: UUID
    var name: String
    var email: String
}

// ViewModel
@MainActor
class UserProfileViewModel: ObservableObject {
    @Published var user: User?
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let userService: UserServiceProtocol
    
    init(userService: UserServiceProtocol = UserService()) {
        self.userService = userService
    }
    
    func loadUser(id: UUID) async {
        isLoading = true
        errorMessage = nil
        
        do {
            user = try await userService.fetchUser(id: id)
        } catch {
            errorMessage = error.localizedDescription
        }
        
        isLoading = false
    }
    
    func updateUser(name: String, email: String) async {
        guard var currentUser = user else { return }
        currentUser.name = name
        currentUser.email = email
        
        do {
            try await userService.updateUser(currentUser)
            user = currentUser
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

// View (SwiftUI)
struct UserProfileView: View {
    @StateObject private var viewModel = UserProfileViewModel()
    let userId: UUID
    
    var body: some View {
        Group {
            if viewModel.isLoading {
                ProgressView()
            } else if let error = viewModel.errorMessage {
                ErrorView(message: error)
            } else if let user = viewModel.user {
                UserDetailView(user: user, viewModel: viewModel)
            }
        }
        .task {
            await viewModel.loadUser(id: userId)
        }
    }
}

// View (UIKit)
class UserProfileViewController: UIViewController {
    private let viewModel: UserProfileViewModel
    private var cancellables = Set<AnyCancellable>()
    
    init(viewModel: UserProfileViewModel) {
        self.viewModel = viewModel
        super.init(nibName: nil, bundle: nil)
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        bindViewModel()
    }
    
    private func bindViewModel() {
        viewModel.$user
            .receive(on: DispatchQueue.main)
            .sink { [weak self] user in
                self?.updateUI(with: user)
            }
            .store(in: &cancellables)
        
        viewModel.$isLoading
            .receive(on: DispatchQueue.main)
            .sink { [weak self] isLoading in
                self?.updateLoadingState(isLoading)
            }
            .store(in: &cancellables)
    }
}
```

### 2.2 MVC 模式

MVC 是传统的 iOS 架构模式，适合简单应用。

```swift
// ✅ MVC 架构示例

// Model
struct Task: Identifiable {
    let id = UUID()
    var title: String
    var isCompleted = false
}

// Controller
class TaskListViewController: UIViewController {
    private var tasks: [Task] = []
    private let tableView = UITableView()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        setupTableView()
        loadTasks()
    }
    
    private func loadTasks() {
        // 直接处理数据加载逻辑
        tasks = [
            Task(title: "Buy groceries"),
            Task(title: "Walk the dog")
        ]
        tableView.reloadData()
    }
    
    private func addTask(title: String) {
        let task = Task(title: title)
        tasks.append(task)
        tableView.reloadData()
    }
}

extension TaskListViewController: UITableViewDataSource {
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return tasks.count
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "TaskCell", for: indexPath)
        let task = tasks[indexPath.row]
        cell.textLabel?.text = task.title
        cell.accessoryType = task.isCompleted ? .checkmark : .none
        return cell
    }
}
```

### 2.3 架构模式对比

| 特性 | MVC | MVVM | VIPER |
|------|-----|------|-------|
| 复杂度 | 低 | 中 | 高 |
| 可测试性 | 一般 | 好 | 优秀 |
| 适用规模 | 小型项目 | 中大型项目 | 大型项目 |
| SwiftUI 支持 | 一般 | 优秀 | 一般 |
| 学习曲线 | 平缓 | 中等 | 陡峭 |

---

## 3. 项目结构（Xcode）

### 3.1 推荐目录结构

```
{{platform_name}}/
├── {{platform_name}}.xcodeproj
├── {{platform_name}}.xcworkspace
├── App/                          # 应用入口
│   ├── {{platform_name}}App.swift
│   ├── Info.plist
│   └── Assets.xcassets
├── Sources/                      # 源代码
│   ├── App/                      # 应用层
│   │   ├── AppDelegate.swift
│   │   ├── SceneDelegate.swift
│   │   └── AppCoordinator.swift
│   ├── Core/                     # 核心层
│   │   ├── Extensions/           # 扩展
│   │   ├── Utilities/            # 工具类
│   │   ├── Constants/            # 常量
│   │   └── Networking/           # 网络层
│   ├── Models/                   # 数据模型
│   ├── Services/                 # 服务层
│   │   ├── API/
│   │   ├── Storage/
│   │   └── Analytics/
│   ├── ViewModels/               # 视图模型 (MVVM)
│   ├── Views/                    # 视图 (SwiftUI)
│   │   ├── Components/           # 可复用组件
│   │   ├── Screens/              # 页面视图
│   │   └── Modifiers/            # 视图修饰器
│   ├── ViewControllers/          # 视图控制器 (UIKit)
│   └── Resources/                # 资源文件
│       ├── Localization/
│       ├── Fonts/
│       └── JSON/
├── Tests/                        # 测试
│   ├── UnitTests/
│   └── UITests/
└── Packages/                     # 本地包
```

### 3.2 文件命名规范

| 类型 | 命名规范 | 示例 |
|------|----------|------|
| Swift 文件 | `PascalCase.swift` | `UserProfileView.swift` |
| ViewModel | `PascalCase+ViewModel.swift` | `UserProfileViewModel.swift` |
| ViewController | `PascalCase+ViewController.swift` | `HomeViewController.swift` |
| Extension | `Type+Extension.swift` | `String+Validation.swift` |
| Protocol | `PascalCase+Protocol.swift` | `UserServiceProtocol.swift` |

---

## 4. 状态管理

### 4.1 @State

用于视图内部的可变状态。

```swift
// ✅ @State 使用
struct CounterView: View {
    @State private var count = 0
    @State private var username = ""
    
    var body: some View {
        VStack {
            TextField("Username", text: $username)
            Text("Count: \(count)")
            Button("Increment") {
                count += 1
            }
        }
    }
}
```

### 4.2 @ObservedObject

用于外部可观察对象，视图不拥有该对象。

```swift
// ✅ @ObservedObject 使用
class TaskStore: ObservableObject {
    @Published var tasks: [Task] = []
    @Published var filter: TaskFilter = .all
    
    func addTask(_ task: Task) {
        tasks.append(task)
    }
}

struct TaskListView: View {
    @ObservedObject var taskStore: TaskStore
    
    var body: some View {
        List(taskStore.tasks) { task in
            TaskRow(task: task)
        }
    }
}

// 使用
TaskListView(taskStore: TaskStore())
```

### 4.3 @StateObject

用于视图拥有的可观察对象，对象生命周期与视图绑定。

```swift
// ✅ @StateObject 使用
struct ProfileView: View {
    @StateObject private var viewModel = ProfileViewModel()
    
    var body: some View {
        Group {
            if viewModel.isLoading {
                ProgressView()
            } else {
                UserInfo(user: viewModel.user)
            }
        }
        .task {
            await viewModel.loadUser()
        }
    }
}
```

### 4.4 @Environment

用于注入的环境值。

```swift
// ✅ @Environment 使用
struct SettingsView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.colorScheme) private var colorScheme
    @Environment(\.managedObjectContext) private var viewContext
    
    var body: some View {
        VStack {
            Text("Current theme: \(colorScheme == .dark ? "Dark" : "Light")")
            
            Button("Close") {
                dismiss()
            }
        }
    }
}

// 自定义环境值
private struct ThemeKey: EnvironmentKey {
    static let defaultValue = Theme.default
}

extension EnvironmentValues {
    var theme: Theme {
        get { self[ThemeKey.self] }
        set { self[ThemeKey.self] = newValue }
    }
}
```

### 4.5 @Binding

用于父子视图间的双向绑定。

```swift
// ✅ @Binding 使用
struct ToggleSetting: View {
    let title: String
    @Binding var isOn: Bool
    
    var body: some View {
        Toggle(title, isOn: $isOn)
    }
}

struct SettingsView: View {
    @State private var notificationsEnabled = true
    @State private var darkModeEnabled = false
    
    var body: some View {
        Form {
            ToggleSetting(
                title: "Notifications",
                isOn: $notificationsEnabled
            )
            ToggleSetting(
                title: "Dark Mode",
                isOn: $darkModeEnabled
            )
        }
    }
}
```

### 4.6 Combine 框架

用于响应式编程和状态管理。

```swift
// ✅ Combine 使用
import Combine

class SearchViewModel: ObservableObject {
    @Published var searchQuery = ""
    @Published var results: [SearchResult] = []
    @Published var isSearching = false
    
    private var cancellables = Set<AnyCancellable>()
    private let searchService: SearchServiceProtocol
    
    init(searchService: SearchServiceProtocol = SearchService()) {
        self.searchService = searchService
        setupSearchPipeline()
    }
    
    private func setupSearchPipeline() {
        $searchQuery
            .debounce(for: .milliseconds(300), scheduler: DispatchQueue.main)
            .removeDuplicates()
            .filter { !$0.isEmpty }
            .handleEvents(receiveOutput: { [weak self] _ in
                self?.isSearching = true
            })
            .flatMap { [weak self] query -> AnyPublisher<[SearchResult], Never> in
                guard let self = self else {
                    return Just([]).eraseToAnyPublisher()
                }
                return self.searchService.search(query: query)
                    .catch { _ in Just([]) }
                    .eraseToAnyPublisher()
            }
            .receive(on: DispatchQueue.main)
            .sink { [weak self] results in
                self?.results = results
                self?.isSearching = false
            }
            .store(in: &cancellables)
    }
}
```

---

## 5. 导航模式

### 5.1 SwiftUI NavigationStack

```swift
// ✅ NavigationStack 导航
struct ContentView: View {
    var body: some View {
        NavigationStack {
            List {
                NavigationLink("User Profile", value: Route.profile(userId: "123"))
                NavigationLink("Settings", value: Route.settings)
            }
            .navigationDestination(for: Route.self) { route in
                switch route {
                case .profile(let userId):
                    UserProfileView(userId: userId)
                case .settings:
                    SettingsView()
                }
            }
        }
    }
}

enum Route: Hashable {
    case profile(userId: String)
    case settings
}
```

### 5.2 程序化导航

```swift
// ✅ 程序化导航
@MainActor
class NavigationRouter: ObservableObject {
    @Published var path = NavigationPath()
    
    func navigate(to route: Route) {
        path.append(route)
    }
    
    func navigateBack() {
        path.removeLast()
    }
    
    func navigateToRoot() {
        path.removeLast(path.count)
    }
}

struct RootView: View {
    @StateObject private var router = NavigationRouter()
    
    var body: some View {
        NavigationStack(path: $router.path) {
            HomeView()
                .navigationDestination(for: Route.self) { route in
                    // 处理路由
                }
        }
        .environmentObject(router)
    }
}
```

### 5.3 UIKit 导航（UINavigationController）

```swift
// ✅ UIKit 导航
class AppCoordinator: Coordinator {
    var navigationController: UINavigationController
    var childCoordinators: [Coordinator] = []
    
    init(navigationController: UINavigationController) {
        self.navigationController = navigationController
    }
    
    func start() {
        let homeViewController = HomeViewController()
        homeViewController.coordinator = self
        navigationController.pushViewController(homeViewController, animated: false)
    }
    
    func showProfile(userId: String) {
        let profileViewModel = ProfileViewModel(userId: userId)
        let profileViewController = ProfileViewController(viewModel: profileViewModel)
        profileViewController.coordinator = self
        navigationController.pushViewController(profileViewController, animated: true)
    }
    
    func showSettings() {
        let settingsViewController = SettingsViewController()
        let navController = UINavigationController(rootViewController: settingsViewController)
        navController.modalPresentationStyle = .formSheet
        navigationController.present(navController, animated: true)
    }
}
```

### 5.4 深度链接处理

```swift
// ✅ 深度链接处理
class DeepLinkHandler {
    enum DeepLink {
        case profile(userId: String)
        case product(id: String)
        case settings(section: String?)
    }
    
    func handle(url: URL) -> DeepLink? {
        guard let components = URLComponents(url: url, resolvingAgainstBaseURL: true),
              let host = components.host else {
            return nil
        }
        
        let pathComponents = components.path.split(separator: "/").map(String.init)
        
        switch host {
        case "profile":
            guard let userId = pathComponents.first else { return nil }
            return .profile(userId: userId)
        case "product":
            guard let productId = pathComponents.first else { return nil }
            return .product(id: productId)
        case "settings":
            let section = pathComponents.first
            return .settings(section: section)
        default:
            return nil
        }
    }
}

// SceneDelegate 中处理
func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    guard let url = URLContexts.first?.url else { return }
    
    if let deepLink = deepLinkHandler.handle(url: url) {
        coordinator.handle(deepLink: deepLink)
    }
}
```

---

## 6. 依赖注入

### 6.1 构造函数注入

```swift
// ✅ 构造函数注入
protocol UserServiceProtocol {
    func fetchUser(id: UUID) async throws -> User
}

class UserProfileViewModel: ObservableObject {
    private let userService: UserServiceProtocol
    private let analyticsService: AnalyticsServiceProtocol
    
    init(
        userService: UserServiceProtocol,
        analyticsService: AnalyticsServiceProtocol
    ) {
        self.userService = userService
        self.analyticsService = analyticsService
    }
}

// 使用
let viewModel = UserProfileViewModel(
    userService: UserService(),
    analyticsService: FirebaseAnalyticsService()
)
```

### 6.2 依赖容器

```swift
// ✅ 依赖容器
final class DependencyContainer {
    static let shared = DependencyContainer()
    
    private var dependencies: [String: Any] = [:]
    
    func register<T>(_ type: T.Type, factory: @escaping () -> T) {
        let key = String(describing: type)
        dependencies[key] = factory
    }
    
    func resolve<T>(_ type: T.Type) -> T {
        let key = String(describing: type)
        guard let factory = dependencies[key] as? () -> T else {
            fatalError("No dependency registered for \(type)")
        }
        return factory()
    }
}

// 注册依赖
extension DependencyContainer {
    func registerDependencies() {
        register(UserServiceProtocol.self) { UserService() }
        register(AnalyticsServiceProtocol.self) { FirebaseAnalyticsService() }
    }
}

// 使用
let userService = DependencyContainer.shared.resolve(UserServiceProtocol.self)
```

---

## 7. 架构检查清单

- [ ] 选择合适的架构模式（MVVM/MVC/VIPER）
- [ ] ViewModel/Controller 职责单一
- [ ] 使用依赖注入管理依赖
- [ ] 正确处理状态管理（@State/@ObservedObject/@StateObject）
- [ ] 导航逻辑集中管理
- [ ] 业务逻辑与 UI 分离
- [ ] 使用协议进行抽象
- [ ] 处理内存管理（weak self）
- [ ] 支持深度链接
- [ ] 单元测试覆盖 ViewModel
