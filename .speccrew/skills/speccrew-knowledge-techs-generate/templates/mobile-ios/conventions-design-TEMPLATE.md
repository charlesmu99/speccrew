# {{platform_name}} 设计规范

> **平台**: {{platform_name}}  
> **框架**: iOS (SwiftUI/UIKit)  
> **生成时间**: {{generated_at}}  
> **版本**: 1.0

---

## 1. 设计原则

### 1.1 SOLID 原则

#### 单一职责原则 (SRP)

每个类/结构体只负责一个功能。

```swift
// ❌ 错误：一个 View 处理太多逻辑
struct UserDashboardView: View {
    @State private var user: User?
    @State private var orders: [Order] = []
    @State private var notifications: [Notification] = []
    @State private var settings: UserSettings?
    
    var body: some View {
        VStack {
            // 用户信息
            // 订单列表
            // 通知列表
            // 设置选项
            // 全部混在一起
        }
    }
}

// ✅ 正确：职责分离
struct UserDashboardView: View {
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                UserProfileSection()
                OrdersSection()
                NotificationsSection()
                SettingsSection()
            }
        }
    }
}

struct UserProfileSection: View {
    @StateObject private var viewModel = UserProfileViewModel()
    
    var body: some View {
        // 只处理用户资料
    }
}

struct OrdersSection: View {
    @StateObject private var viewModel = OrdersViewModel()
    
    var body: some View {
        // 只处理订单
    }
}
```

#### 开闭原则 (OCP)

对扩展开放，对修改关闭。

```swift
// ✅ 使用协议和组合
protocol ButtonStyle {
    var backgroundColor: Color { get }
    var textColor: Color { get }
    var cornerRadius: CGFloat { get }
}

struct PrimaryButtonStyle: ButtonStyle {
    let backgroundColor = Color.blue
    let textColor = Color.white
    let cornerRadius: CGFloat = 8
}

struct SecondaryButtonStyle: ButtonStyle {
    let backgroundColor = Color.gray
    let textColor = Color.black
    let cornerRadius: CGFloat = 8
}

struct StyledButton: View {
    let title: String
    let style: ButtonStyle
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .foregroundColor(style.textColor)
                .padding()
                .background(style.backgroundColor)
                .cornerRadius(style.cornerRadius)
        }
    }
}
```

#### 依赖倒置原则 (DIP)

依赖抽象而非具体实现。

```swift
// ✅ 依赖协议
protocol NetworkServiceProtocol {
    func fetch<T: Decodable>(_ endpoint: Endpoint) async throws -> T
}

class UserRepository {
    private let networkService: NetworkServiceProtocol
    
    init(networkService: NetworkServiceProtocol) {
        self.networkService = networkService
    }
    
    func fetchUser(id: UUID) async throws -> User {
        return try await networkService.fetch(.user(id: id))
    }
}

// 测试时可以注入 Mock
class MockNetworkService: NetworkServiceProtocol {
    func fetch<T: Decodable>(_ endpoint: Endpoint) async throws -> T {
        // 返回测试数据
    }
}
```

### 1.2 DRY 原则

避免重复代码，提取公共组件。

```swift
// ❌ 错误：重复的样式代码
struct PageOne: View {
    var body: some View {
        VStack(spacing: 16) {
            Text("Title")
                .font(.system(size: 24, weight: .bold))
            Text("Subtitle")
                .font(.system(size: 16))
                .foregroundColor(.gray)
        }
        .padding(20)
    }
}

// ✅ 正确：提取公共组件
struct PageHeader: View {
    let title: String
    let subtitle: String?
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.title)
                .fontWeight(.bold)
            
            if let subtitle = subtitle {
                Text(subtitle)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
            }
        }
    }
}

// 使用
struct PageOne: View {
    var body: some View {
        PageHeader(
            title: "Welcome",
            subtitle: "Get started with our app"
        )
    }
}
```

---

## 2. View 设计模式

### 2.1 组合优于继承

```swift
// ❌ 错误：过度使用继承
class BaseViewController: UIViewController {
    func setupNavigationBar() { }
    func setupTableView() { }
    func setupCollectionView() { }
}

// ✅ 正确：使用组合和协议
protocol NavigationBarConfigurable {
    func configureNavigationBar()
}

protocol TableViewConfigurable {
    func configureTableView()
}

class HomeViewController: UIViewController,
    NavigationBarConfigurable,
    TableViewConfigurable {
    
    override func viewDidLoad() {
        super.viewDidLoad()
        configureNavigationBar()
        configureTableView()
    }
    
    func configureNavigationBar() {
        // 配置导航栏
    }
    
    func configureTableView() {
        // 配置表格
    }
}
```

### 2.2 ViewBuilder 模式

```swift
// ✅ 使用 ViewBuilder 创建灵活的容器
struct Card<Content: View>: View {
    let title: String
    @ViewBuilder let content: () -> Content
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.headline)
            
            content()
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 2)
    }
}

// 使用
Card(title: "User Info") {
    HStack {
        Image(systemName: "person.circle")
        Text("John Doe")
    }
    
    Divider()
    
    Text("Software Engineer")
        .font(.subheadline)
        .foregroundColor(.secondary)
}
```

### 2.3 PreferenceKey 模式

```swift
// ✅ 使用 PreferenceKey 实现子视图向父视图传递数据
struct HeaderHeightKey: PreferenceKey {
    static var defaultValue: CGFloat = 0
    
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        value = nextValue()
    }
}

struct AdaptiveHeader: View {
    @State private var headerHeight: CGFloat = 0
    
    var body: some View {
        ScrollView {
            VStack {
                ChildView()
                    .background(
                        GeometryReader { geometry in
                            Color.clear.preference(
                                key: HeaderHeightKey.self,
                                value: geometry.size.height
                            )
                        }
                    )
                
                ContentView()
                    .padding(.top, headerHeight)
            }
        }
        .onPreferenceChange(HeaderHeightKey.self) { height in
            headerHeight = height
        }
    }
}
```

---

## 3. 数据流设计

### 3.1 单向数据流

```swift
// ✅ 单向数据流
struct TaskListView: View {
    @StateObject private var viewModel = TaskListViewModel()
    
    var body: some View {
        List(viewModel.tasks) { task in
            TaskRow(
                task: task,
                onToggle: { viewModel.toggleTask(task) },
                onDelete: { viewModel.deleteTask(task) }
            )
        }
    }
}

@MainActor
class TaskListViewModel: ObservableObject {
    @Published private(set) var tasks: [Task] = []
    
    func toggleTask(_ task: Task) {
        if let index = tasks.firstIndex(where: { $0.id == task.id }) {
            tasks[index].isCompleted.toggle()
        }
    }
    
    func deleteTask(_ task: Task) {
        tasks.removeAll { $0.id == task.id }
    }
}
```

### 3.2 仓库模式 (Repository Pattern)

```swift
// ✅ 仓库模式
protocol TaskRepositoryProtocol {
    func fetchTasks() async throws -> [Task]
    func saveTask(_ task: Task) async throws
    func deleteTask(_ task: Task) async throws
}

class TaskRepository: TaskRepositoryProtocol {
    private let localDataSource: LocalDataSource
    private let remoteDataSource: RemoteDataSource
    
    init(
        localDataSource: LocalDataSource,
        remoteDataSource: RemoteDataSource
    ) {
        self.localDataSource = localDataSource
        self.remoteDataSource = remoteDataSource
    }
    
    func fetchTasks() async throws -> [Task] {
        do {
            let tasks = try await remoteDataSource.fetchTasks()
            try await localDataSource.saveTasks(tasks)
            return tasks
        } catch {
            return try await localDataSource.fetchTasks()
        }
    }
    
    func saveTask(_ task: Task) async throws {
        try await remoteDataSource.saveTask(task)
        try await localDataSource.saveTask(task)
    }
    
    func deleteTask(_ task: Task) async throws {
        try await remoteDataSource.deleteTask(task)
        try await localDataSource.deleteTask(task)
    }
}
```

### 3.3 使用 Async/Await

```swift
// ✅ 现代并发处理
class UserService {
    func fetchUser(id: UUID) async throws -> User {
        let url = URL(string: "https://api.example.com/users/\(id)")!
        let (data, response) = try await URLSession.shared.data(from: url)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw NetworkError.invalidResponse
        }
        
        return try JSONDecoder().decode(User.self, from: data)
    }
    
    func fetchUsers(ids: [UUID]) async throws -> [User] {
        try await withThrowingTaskGroup(of: User.self) { group in
            for id in ids {
                group.addTask {
                    try await self.fetchUser(id: id)
                }
            }
            
            var users: [User] = []
            for try await user in group {
                users.append(user)
            }
            return users
        }
    }
}
```

---

## 4. 协议导向设计

### 4.1 协议组合

```swift
// ✅ 协议组合
protocol Identifiable {
    var id: UUID { get }
}

protocol Timestampable {
    var createdAt: Date { get }
    var updatedAt: Date { get }
}

protocol Archivable {
    var isArchived: Bool { get set }
    func archive()
}

typealias Document = Identifiable & Timestampable & Archivable

struct Note: Document {
    let id: UUID
    let createdAt: Date
    var updatedAt: Date
    var isArchived: Bool
    var content: String
    
    func archive() {
        isArchived = true
    }
}
```

### 4.2 协议扩展

```swift
// ✅ 协议扩展提供默认实现
protocol LoadingPresentable {
    func showLoading()
    func hideLoading()
}

extension LoadingPresentable where Self: UIViewController {
    func showLoading() {
        let indicator = UIActivityIndicatorView(style: .large)
        indicator.tag = 999
        indicator.center = view.center
        view.addSubview(indicator)
        indicator.startAnimating()
    }
    
    func hideLoading() {
        view.subviews.first { $0.tag == 999 }?.removeFromSuperview()
    }
}

class ProfileViewController: UIViewController, LoadingPresentable {
    func loadData() {
        showLoading()
        // 加载数据
        hideLoading()
    }
}
```

### 4.3 关联类型

```swift
// ✅ 使用关联类型
protocol Cache {
    associatedtype Key
    associatedtype Value
    
    func get(_ key: Key) -> Value?
    func set(_ value: Value, forKey key: Key)
    func remove(_ key: Key)
}

class MemoryCache<Key: Hashable, Value>: Cache {
    private var storage: [Key: Value] = [:]
    
    func get(_ key: Key) -> Value? {
        return storage[key]
    }
    
    func set(_ value: Value, forKey key: Key) {
        storage[key] = value
    }
    
    func remove(_ key: Key) {
        storage.removeValue(forKey: key)
    }
}
```

---

## 5. SwiftUI 特定模式

### 5.1 视图修饰器 (ViewModifier)

```swift
// ✅ 自定义视图修饰器
struct PrimaryButtonStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .font(.headline)
            .foregroundColor(.white)
            .padding()
            .frame(maxWidth: .infinity)
            .background(Color.blue)
            .cornerRadius(10)
    }
}

extension View {
    func primaryButton() -> some View {
        modifier(PrimaryButtonStyle())
    }
}

// 使用
Button("Submit") { }
    .primaryButton()
```

### 5.2 环境值注入

```swift
// ✅ 自定义环境值
struct Theme {
    var primaryColor: Color
    var secondaryColor: Color
    var font: Font
    
    static let `default` = Theme(
        primaryColor: .blue,
        secondaryColor: .gray,
        font: .body
    )
}

private struct ThemeKey: EnvironmentKey {
    static let defaultValue = Theme.default
}

extension EnvironmentValues {
    var theme: Theme {
        get { self[ThemeKey.self] }
        set { self[ThemeKey.self] = newValue }
    }
}

// 使用
struct ThemedView: View {
    @Environment(\.theme) private var theme
    
    var body: some View {
        Text("Hello")
            .foregroundColor(theme.primaryColor)
            .font(theme.font)
    }
}
```

### 5.3 视图状态管理

```swift
// ✅ 使用枚举管理视图状态
enum LoadingState<Content> {
    case idle
    case loading
    case loaded(Content)
    case error(Error)
}

struct AsyncContentView<Content: View, T>: View {
    @State private var state: LoadingState<T> = .idle
    let load: () async throws -> T
    @ViewBuilder let content: (T) -> Content
    
    var body: some View {
        Group {
            switch state {
            case .idle, .loading:
                ProgressView()
            case .loaded(let value):
                content(value)
            case .error(let error):
                ErrorView(error: error) {
                    Task { await loadData() }
                }
            }
        }
        .task {
            await loadData()
        }
    }
    
    private func loadData() async {
        state = .loading
        do {
            let value = try await load()
            state = .loaded(value)
        } catch {
            state = .error(error)
        }
    }
}
```

---

## 6. iOS 特定设计原则

### 6.1 Human Interface Guidelines

```swift
// ✅ 遵循 HIG 原则
struct AccessibleButton: View {
    let title: String
    let icon: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                Image(systemName: icon)
                Text(title)
            }
        }
        .accessibilityLabel(title)
        .accessibilityHint("Double tap to \(title.lowercased())")
    }
}

// ✅ 动态字体支持
struct ScalableText: View {
    @Environment(\.sizeCategory) private var sizeCategory
    let text: String
    
    var body: some View {
        Text(text)
            .font(.body)
            .minimumScaleFactor(0.5)
            .lineLimit(nil)
    }
}
```

### 6.2 响应式设计

```swift
// ✅ 响应式布局
struct AdaptiveStack<Content: View>: View {
    @Environment(\.horizontalSizeClass) private var horizontalSizeClass
    @ViewBuilder let content: () -> Content
    
    var body: some View {
        if horizontalSizeClass == .compact {
            VStack(content: content)
        } else {
            HStack(content: content)
        }
    }
}

// ✅ 设备适配
struct DeviceAwareView: View {
    @Environment(\.deviceType) private var deviceType
    
    var body: some View {
        Group {
            switch deviceType {
            case .phone:
                CompactLayout()
            case .pad:
                RegularLayout()
            case .mac:
                DesktopLayout()
            }
        }
    }
}
```

### 6.3 生命周期管理

```swift
// ✅ 正确处理生命周期
struct LifecycleAwareView: View {
    @Environment(\.scenePhase) private var scenePhase
    @StateObject private var viewModel = ViewModel()
    
    var body: some View {
        ContentView()
            .onAppear {
                viewModel.onAppear()
            }
            .onDisappear {
                viewModel.onDisappear()
            }
            .onChange(of: scenePhase) { newPhase in
                switch newPhase {
                case .active:
                    viewModel.becomeActive()
                case .inactive:
                    viewModel.becomeInactive()
                case .background:
                    viewModel.enterBackground()
                @unknown default:
                    break
                }
            }
    }
}
```

---

## 7. 错误处理设计

### 7.1 错误类型定义

```swift
// ✅ 定义领域错误
enum AppError: LocalizedError {
    case networkError(underlying: Error)
    case decodingError
    case validationError(field: String, message: String)
    case unauthorized
    case notFound
    
    var errorDescription: String? {
        switch self {
        case .networkError:
            return "网络连接失败"
        case .decodingError:
            return "数据解析失败"
        case .validationError(_, let message):
            return message
        case .unauthorized:
            return "请先登录"
        case .notFound:
            return "内容不存在"
        }
    }
}
```

### 7.2 错误边界

```swift
// ✅ 错误边界处理
struct ErrorBoundary<Content: View>: View {
    @State private var caughtError: Error?
    @ViewBuilder let content: () -> Content
    
    var body: some View {
        if let error = caughtError {
            ErrorView(error: error) {
                caughtError = nil
            }
        } else {
            content()
                .environment(\.errorHandler, ErrorHandler { error in
                    caughtError = error
                })
        }
    }
}

struct ErrorHandler {
    let handle: (Error) -> Void
}

private struct ErrorHandlerKey: EnvironmentKey {
    static let defaultValue = ErrorHandler { _ in }
}

extension EnvironmentValues {
    var errorHandler: ErrorHandler {
        get { self[ErrorHandlerKey.self] }
        set { self[ErrorHandlerKey.self] = newValue }
    }
}
```

---

## 8. 设计检查清单

- [ ] 遵循 SOLID 原则
- [ ] View 职责单一
- [ ] 使用组合而非继承
- [ ] 数据流清晰（单向数据流）
- [ ] 使用协议进行抽象
- [ ] 错误处理完善
- [ ] 支持无障碍访问
- [ ] 响应式布局适配
- [ ] 遵循 HIG 设计规范
- [ ] 代码符合 Swift 风格指南
