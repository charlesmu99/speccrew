# {{platform_name}} 架构规范

> **平台**: {{platform_name}}  
> **框架**: Android (Jetpack Compose)  
> **生成时间**: {{generated_at}}  
> **版本**: 1.0

---

## 1. UI 架构

### 1.1 Jetpack Compose vs XML 布局

#### Jetpack Compose (推荐)
使用声明式 UI 构建现代 Android 应用界面。

```kotlin
// ✅ 使用 Compose 构建 UI
@Composable
fun UserProfileScreen(
    viewModel: UserViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    
    Scaffold(
        topBar = { UserProfileTopBar() },
        content = { padding ->
            UserProfileContent(
                user = uiState.user,
                isLoading = uiState.isLoading,
                modifier = Modifier.padding(padding)
            )
        }
    )
}

@Composable
fun UserProfileContent(
    user: User?,
    isLoading: Boolean,
    modifier: Modifier = Modifier
) {
    Box(modifier = modifier.fillMaxSize()) {
        if (isLoading) {
            CircularProgressIndicator(
                modifier = Modifier.align(Alignment.Center)
            )
        } else {
            user?.let {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(16.dp)
                ) {
                    UserAvatar(imageUrl = it.avatarUrl)
                    Spacer(modifier = Modifier.height(16.dp))
                    UserInfo(user = it)
                }
            }
        }
    }
}
```

#### XML 布局 (传统)
仅在维护旧代码或特定场景下使用。

```kotlin
// ✅ XML 布局示例
class UserProfileFragment : Fragment() {
    
    private var _binding: FragmentUserProfileBinding? = null
    private val binding get() = _binding!!
    
    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentUserProfileBinding.inflate(inflater, container, false)
        return binding.root
    }
    
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        binding.userName.text = "John Doe"
        binding.userEmail.text = "john@example.com"
    }
    
    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
```

### 1.2 Composable 生命周期

```kotlin
@Composable
fun LifecycleAwareComponent(userId: String) {
    // 在 Composition 进入时执行
    DisposableEffect(userId) {
        // 初始化操作（如启动协程、注册监听器）
        val listener = UserDataListener()
        listener.startListening(userId)
        
        // 在 Composition 离开时清理
        onDispose {
            listener.stopListening()
        }
    }
    
    // 在 key 变化时重新执行
    LaunchedEffect(userId) {
        // 在协程中执行异步操作
        viewModel.loadUser(userId)
    }
    
    // 跳过重组的副作用
    SideEffect {
        // 每次重组成功提交后执行
        analytics.logScreenView("user_profile")
    }
    
    //  remember 缓存计算结果
    val processedData = remember(userId) {
        processUserData(userId)
    }
}
```

---

## 2. 项目结构 (Gradle)

### 2.1 推荐目录结构

```
app/
├── build.gradle.kts              # 模块级构建配置
├── src/
│   ├── main/
│   │   ├── java/com/example/app/
│   │   │   ├── {{platform_id}}/                  # 应用主包
│   │   │   │   ├── MainActivity.kt
│   │   │   │   ├── {{platform_id}}Application.kt
│   │   │   │   ├── di/                         # 依赖注入模块
│   │   │   │   │   ├── AppModule.kt
│   │   │   │   │   ├── NetworkModule.kt
│   │   │   │   │   └── DatabaseModule.kt
│   │   │   │   ├── ui/                         # UI 层
│   │   │   │   │   ├── theme/                  # 主题配置
│   │   │   │   │   │   ├── Color.kt
│   │   │   │   │   │   ├── Theme.kt
│   │   │   │   │   │   └── Type.kt
│   │   │   │   │   ├── components/             # 可复用组件
│   │   │   │   │   │   ├── CommonButton.kt
│   │   │   │   │   │   ├── LoadingIndicator.kt
│   │   │   │   │   │   └── ErrorMessage.kt
│   │   │   │   │   ├── screens/                # 页面/屏幕
│   │   │   │   │   │   ├── home/
│   │   │   │   │   │   │   ├── HomeScreen.kt
│   │   │   │   │   │   │   ├── HomeViewModel.kt
│   │   │   │   │   │   │   └── HomeUiState.kt
│   │   │   │   │   │   └── profile/
│   │   │   │   │   │       ├── ProfileScreen.kt
│   │   │   │   │   │       ├── ProfileViewModel.kt
│   │   │   │   │   │       └── ProfileUiState.kt
│   │   │   │   │   └── navigation/             # 导航配置
│   │   │   │   │       ├── AppNavigation.kt
│   │   │   │   │       └── Screen.kt
│   │   │   │   ├── data/                       # 数据层
│   │   │   │   │   ├── local/                  # 本地数据源
│   │   │   │   │   │   ├── database/
│   │   │   │   │   │   │   ├── AppDatabase.kt
│   │   │   │   │   │   │   ├── UserDao.kt
│   │   │   │   │   │   │   └── UserEntity.kt
│   │   │   │   │   │   └── datastore/
│   │   │   │   │   │       └── PreferencesDataStore.kt
│   │   │   │   │   ├── remote/                 # 远程数据源
│   │   │   │   │   │   ├── api/
│   │   │   │   │   │   │   ├── ApiService.kt
│   │   │   │   │   │   │   └── ApiResponse.kt
│   │   │   │   │   │   └── model/
│   │   │   │   │   │       ├── UserDto.kt
│   │   │   │   │   │       └── NetworkResult.kt
│   │   │   │   │   └── repository/             # 仓库实现
│   │   │   │   │       ├── UserRepositoryImpl.kt
│   │   │   │   │       └── ProductRepositoryImpl.kt
│   │   │   │   ├── domain/                     # 领域层
│   │   │   │   │   ├── model/                  # 领域模型
│   │   │   │   │   │   ├── User.kt
│   │   │   │   │   │   └── Product.kt
│   │   │   │   │   ├── repository/             # 仓库接口
│   │   │   │   │   │   ├── UserRepository.kt
│   │   │   │   │   │   └── ProductRepository.kt
│   │   │   │   │   └── usecase/                # 用例
│   │   │   │   │       ├── GetUserUseCase.kt
│   │   │   │   │       └── GetProductsUseCase.kt
│   │   │   │   └── utils/                      # 工具类
│   │   │   │       ├── Constants.kt
│   │   │   │       └── Extensions.kt
│   │   ├── res/                                # 资源文件
│   │   └── AndroidManifest.xml
│   ├── test/                                   # 单元测试
│   └── androidTest/                            # 仪器测试
├── build.gradle.kts
└── proguard-rules.pro
```

### 2.2 文件命名规范

| 类型 | 命名规范 | 示例 |
|------|----------|------|
| Activity | `PascalCaseActivity.kt` | `MainActivity.kt` |
| Screen (Compose) | `PascalCaseScreen.kt` | `HomeScreen.kt` |
| ViewModel | `PascalCaseViewModel.kt` | `HomeViewModel.kt` |
| Composable | `PascalCase.kt` | `UserProfile.kt` |
| Repository | `PascalCaseRepository.kt` | `UserRepository.kt` |
| UseCase | `PascalCaseUseCase.kt` | `GetUserUseCase.kt` |
| Model | `PascalCase.kt` | `User.kt` |
| Interface | `PascalCase.kt` | `UserRepository.kt` |
| Utils | `PascalCaseUtils.kt` | `DateUtils.kt` |

---

## 3. 架构模式

### 3.1 MVVM 模式

```kotlin
// Model - 数据模型
data class User(
    val id: String,
    val name: String,
    val email: String,
    val avatarUrl: String?
)

// UiState - UI 状态
data class ProfileUiState(
    val user: User? = null,
    val isLoading: Boolean = false,
    val errorMessage: String? = null
)

// ViewModel - 业务逻辑
@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val getUserUseCase: GetUserUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow(ProfileUiState())
    val uiState: StateFlow<ProfileUiState> = _uiState.asStateFlow()

    fun loadUser(userId: String) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            
            getUserUseCase(userId)
                .onSuccess { user ->
                    _uiState.update { 
                        it.copy(user = user, isLoading = false) 
                    }
                }
                .onFailure { error ->
                    _uiState.update { 
                        it.copy(errorMessage = error.message, isLoading = false) 
                    }
                }
        }
    }
}

// View - Composable UI
@Composable
fun ProfileScreen(
    viewModel: ProfileViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    
    ProfileContent(
        user = uiState.user,
        isLoading = uiState.isLoading,
        errorMessage = uiState.errorMessage,
        onRetry = { viewModel.loadUser() }
    )
}

@Composable
fun ProfileContent(
    user: User?,
    isLoading: Boolean,
    errorMessage: String?,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(modifier = modifier.fillMaxSize()) {
        when {
            isLoading -> LoadingIndicator()
            errorMessage != null -> ErrorMessage(
                message = errorMessage,
                onRetry = onRetry
            )
            user != null -> UserProfile(user = user)
        }
    }
}
```

### 3.2 MVI 模式

```kotlin
// State
@Immutable
data class HomeState(
    val products: List<Product> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null
)

// Event - 用户意图
sealed class HomeEvent {
    data object LoadProducts : HomeEvent()
    data class ProductClicked(val productId: String) : HomeEvent()
    data class SearchQueryChanged(val query: String) : HomeEvent()
    data object Refresh : HomeEvent()
}

// Effect - 一次性事件
sealed class HomeEffect {
    data class NavigateToProductDetail(val productId: String) : HomeEffect()
    data class ShowToast(val message: String) : HomeEffect()
}

// ViewModel
@HiltViewModel
class HomeViewModel @Inject constructor(
    private val getProductsUseCase: GetProductsUseCase
) : ViewModel() {

    private val _state = MutableStateFlow(HomeState())
    val state: StateFlow<HomeState> = _state.asStateFlow()

    private val _effect = Channel<HomeEffect>(Channel.BUFFERED)
    val effect = _effect.receiveAsFlow()

    fun onEvent(event: HomeEvent) {
        when (event) {
            is HomeEvent.LoadProducts -> loadProducts()
            is HomeEvent.ProductClicked -> {
                sendEffect(HomeEffect.NavigateToProductDetail(event.productId))
            }
            is HomeEvent.SearchQueryChanged -> searchProducts(event.query)
            is HomeEvent.Refresh -> refreshProducts()
        }
    }

    private fun loadProducts() {
        viewModelScope.launch {
            _state.update { it.copy(isLoading = true) }
            getProductsUseCase()
                .onSuccess { products ->
                    _state.update { it.copy(products = products, isLoading = false) }
                }
                .onFailure { error ->
                    _state.update { it.copy(error = error.message, isLoading = false) }
                }
        }
    }

    private fun sendEffect(effect: HomeEffect) {
        viewModelScope.launch {
            _effect.send(effect)
        }
    }
}

// View
@Composable
fun HomeScreen(
    viewModel: HomeViewModel = hiltViewModel(),
    onNavigateToProduct: (String) -> Unit
) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val context = LocalContext.current
    
    // 收集 Effect
    LaunchedEffect(Unit) {
        viewModel.effect.collect { effect ->
            when (effect) {
                is HomeEffect.NavigateToProductDetail -> {
                    onNavigateToProduct(effect.productId)
                }
                is HomeEffect.ShowToast -> {
                    Toast.makeText(context, effect.message, Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    HomeContent(
        state = state,
        onEvent = viewModel::onEvent
    )
}
```

### 3.3 模式选择指南

| 场景 | 推荐方案 | 理由 |
|------|----------|------|
| 简单页面 | MVVM | 简单直观，学习成本低 |
| 复杂交互 | MVI | 状态管理清晰，可预测 |
| 表单处理 | MVVM + StateFlow | 双向绑定方便 |
| 多页面共享状态 | MVVM + Repository | 数据层共享 |

---

## 4. ViewModel 和状态管理

### 4.1 ViewModel 使用规范

```kotlin
@HiltViewModel
class UserViewModel @Inject constructor(
    private val userRepository: UserRepository,
    savedStateHandle: SavedStateHandle
) : ViewModel() {

    // 从导航参数获取
    private val userId: String = checkNotNull(savedStateHandle["userId"])

    // 私有可变状态
    private val _uiState = MutableStateFlow(UserUiState())
    
    // 公开不可变状态
    val uiState: StateFlow<UserUiState> = _uiState
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = UserUiState()
        )

    // 一次性事件
    private val _events = Channel<UserEvent>(Channel.BUFFERED)
    val events = _events.receiveAsFlow()

    init {
        loadUser()
    }

    private fun loadUser() {
        viewModelScope.launch {
            userRepository.getUser(userId)
                .collect { result ->
                    _uiState.update { state ->
                        state.copy(
                            user = result.getOrNull(),
                            isLoading = false,
                            error = result.exceptionOrNull()?.message
                        )
                    }
                }
        }
    }

    fun refresh() {
        _uiState.update { it.copy(isLoading = true) }
        loadUser()
    }

    override fun onCleared() {
        super.onCleared()
        // 清理资源
    }
}
```

### 4.2 LiveData vs StateFlow

```kotlin
// ✅ StateFlow (Compose 推荐)
class ModernViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(UiState())
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    // 在 Compose 中收集
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
}

// ✅ LiveData (XML 布局或旧代码)
class LegacyViewModel : ViewModel() {
    private val _user = MutableLiveData<User>()
    val user: LiveData<User> = _user

    private val _loading = MutableLiveData<Boolean>()
    val loading: LiveData<Boolean> = _loading
    
    // 在 XML 中使用 Data Binding
    // 在 Compose 中使用: val user by viewModel.user.observeAsState()
}
```

---

## 5. Navigation Component

### 5.1 Compose Navigation

```kotlin
// 定义路由
sealed class Screen(val route: String) {
    data object Home : Screen("home")
    data object Profile : Screen("profile/{userId}") {
        fun createRoute(userId: String) = "profile/$userId"
    }
    data object Settings : Screen("settings")
    data object ProductDetail : Screen("product/{productId}") {
        fun createRoute(productId: String) = "product/$productId"
    }
}

// 导航图
@Composable
fun AppNavigation(
    navController: NavHostController = rememberNavController(),
    startDestination: String = Screen.Home.route
) {
    NavHost(
        navController = navController,
        startDestination = startDestination
    ) {
        composable(Screen.Home.route) {
            HomeScreen(
                onNavigateToProfile = { userId ->
                    navController.navigate(Screen.Profile.createRoute(userId))
                },
                onNavigateToProduct = { productId ->
                    navController.navigate(Screen.ProductDetail.createRoute(productId))
                }
            )
        }
        
        composable(
            route = Screen.Profile.route,
            arguments = listOf(
                navArgument("userId") { type = NavType.StringType }
            )
        ) { backStackEntry ->
            val userId = backStackEntry.arguments?.getString("userId")
            ProfileScreen(userId = userId)
        }
        
        composable(Screen.Settings.route) {
            SettingsScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }
    }
}

// 底部导航集成
@Composable
fun MainScreen() {
    val navController = rememberNavController()
    val items = listOf(
        BottomNavItem.Home,
        BottomNavItem.Search,
        BottomNavItem.Profile
    )
    
    Scaffold(
        bottomBar = {
            NavigationBar {
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = navBackStackEntry?.destination?.route
                
                items.forEach { item ->
                    NavigationBarItem(
                        icon = { Icon(item.icon, contentDescription = item.label) },
                        label = { Text(item.label) },
                        selected = currentRoute == item.route,
                        onClick = {
                            navController.navigate(item.route) {
                                popUpTo(navController.graph.startDestinationId) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        }
                    )
                }
            }
        }
    ) { innerPadding ->
        AppNavigation(
            navController = navController,
            modifier = Modifier.padding(innerPadding)
        )
    }
}
```

### 5.2 深层链接处理

```kotlin
// AndroidManifest.xml 中配置
/*
<activity android:name=".MainActivity">
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="https" 
              android:host="example.com" 
              android:pathPrefix="/product" />
    </intent-filter>
</activity>
*/

// 导航中处理深层链接
composable(
    route = Screen.ProductDetail.route,
    deepLinks = listOf(
        navDeepLink {
            uriPattern = "https://example.com/product/{productId}"
        }
    ),
    arguments = listOf(
        navArgument("productId") { type = NavType.StringType }
    )
) { backStackEntry ->
    val productId = backStackEntry.arguments?.getString("productId")
    ProductDetailScreen(productId = productId)
}
```

---

## 6. 架构检查清单

- [ ] 使用 Jetpack Compose 构建 UI
- [ ] 遵循 MVVM 或 MVI 架构模式
- [ ] ViewModel 不持有 View 引用
- [ ] 使用 StateFlow/LiveData 管理状态
- [ ] 导航逻辑集中管理
- [ ] 使用依赖注入 (Hilt/Koin)
- [ ] Repository 模式抽象数据源
- [ ] 正确处理生命周期
- [ ] 配置深层链接
- [ ] 适当的错误处理
