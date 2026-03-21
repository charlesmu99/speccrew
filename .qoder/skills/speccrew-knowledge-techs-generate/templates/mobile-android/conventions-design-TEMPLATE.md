# {{platform_name}} 设计规范

> **平台**: {{platform_name}}  
> **框架**: Android (Jetpack Compose)  
> **生成时间**: {{generated_at}}  
> **版本**: 1.0

---

## 1. 设计原则

### 1.1 SOLID 原则

#### 单一职责原则 (SRP)
每个 Composable/类只负责一个功能。

```kotlin
// ❌ 错误：一个 Composable 处理太多逻辑
@Composable
fun BadUserScreen(viewModel: UserViewModel) {
    val uiState by viewModel.uiState.collectAsState()
    
    Column {
        // 用户信息
        Row { /* ... */ }
        // 订单列表
        LazyColumn { /* ... */ }
        // 设置选项
        Column { /* ... */ }
    }
}

// ✅ 正确：职责分离
@Composable
fun UserScreen(viewModel: UserViewModel) {
    val uiState by viewModel.uiState.collectAsState()
    
    UserContent(
        user = uiState.user,
        orders = uiState.orders,
        settings = uiState.settings
    )
}

@Composable
fun UserContent(
    user: User?,
    orders: List<Order>,
    settings: UserSettings
) {
    Column {
        UserProfileHeader(user = user)
        UserOrdersSection(orders = orders)
        UserSettingsSection(settings = settings)
    }
}
```

#### 开闭原则 (OCP)
对扩展开放，对修改关闭。

```kotlin
// ✅ 使用组合而非继承
interface ButtonStyle {
    @Composable
    fun style(): ButtonColors
}

class PrimaryButtonStyle : ButtonStyle {
    @Composable
    override fun style() = ButtonDefaults.buttonColors(
        containerColor = MaterialTheme.colorScheme.primary,
        contentColor = MaterialTheme.colorScheme.onPrimary
    )
}

class SecondaryButtonStyle : ButtonStyle {
    @Composable
    override fun style() = ButtonDefaults.buttonColors(
        containerColor = MaterialTheme.colorScheme.secondary,
        contentColor = MaterialTheme.colorScheme.onSecondary
    )
}

@Composable
fun StyledButton(
    text: String,
    onClick: () -> Unit,
    style: ButtonStyle = PrimaryButtonStyle()
) {
    Button(
        onClick = onClick,
        colors = style.style()
    ) {
        Text(text)
    }
}
```

### 1.2 DRY 原则

避免重复代码，提取公共组件。

```kotlin
// ❌ 错误：重复的布局代码
@Composable
fun Page1() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "Title",
            style = MaterialTheme.typography.headlineMedium
        )
        Spacer(modifier = Modifier.height(16.dp))
        // ...
    }
}

// ✅ 正确：提取公共组件
@Composable
fun PageLayout(
    title: String,
    modifier: Modifier = Modifier,
    content: @Composable ColumnScope.() -> Unit
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = title,
            style = MaterialTheme.typography.headlineMedium
        )
        Spacer(modifier = Modifier.height(16.dp))
        content()
    }
}

// 使用
@Composable
fun Page1() {
    PageLayout(title = "Page 1") {
        // 页面内容
    }
}
```

---

## 2. Composable 设计模式

### 2.1 组合优于继承

```kotlin
// ❌ 错误：过度使用继承
abstract class BaseCard : Component() {
    abstract fun content(): @Composable () -> Unit
}

class UserCard(private val user: User) : BaseCard() {
    override fun content(): @Composable () -> Unit = {
        Text(user.name)
    }
}

// ✅ 正确：使用组合
@Composable
fun UserCard(
    user: User,
    onClick: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        onClick = onClick
    ) {
        Row(
            modifier = Modifier.padding(16.dp)
        ) {
            UserAvatar(url = user.avatarUrl)
            Spacer(modifier = Modifier.width(12.dp))
            Column {
                Text(
                    text = user.name,
                    style = MaterialTheme.typography.titleMedium
                )
                Text(
                    text = user.email,
                    style = MaterialTheme.typography.bodyMedium
                )
            }
        }
    }
}
```

### 2.2 控制反转 (IoC)

```kotlin
// ✅ 通过参数注入依赖
@Composable
fun ProductList(
    products: List<Product>,
    onProductClick: (Product) -> Unit,
    errorHandler: @Composable (Throwable) -> Unit = { DefaultErrorMessage(it) },
    modifier: Modifier = Modifier
) {
    LazyColumn(modifier = modifier) {
        items(
            items = products,
            key = { it.id }
        ) { product ->
            ProductItem(
                product = product,
                onClick = { onProductClick(product) }
            )
        }
    }
}

// 使用
ProductList(
    products = products,
    onProductClick = { product ->
        navController.navigate("product/${product.id}")
    },
    errorHandler = { error ->
        CustomErrorDialog(error)
    }
)
```

### 2.3 Slot 模式

```kotlin
// ✅ 使用 Slot 实现灵活的布局
@Composable
fun CardLayout(
    title: @Composable () -> Unit,
    modifier: Modifier = Modifier,
    leading: @Composable (() -> Unit)? = null,
    subtitle: @Composable (() -> Unit)? = null,
    actions: @Composable RowScope.() -> Unit = {},
    content: @Composable () -> Unit,
    footer: @Composable (() -> Unit)? = null
) {
    Card(modifier = modifier) {
        Column {
            // Header
            Row(
                modifier = Modifier.padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                leading?.invoke()
                if (leading != null) {
                    Spacer(modifier = Modifier.width(12.dp))
                }
                Column(modifier = Modifier.weight(1f)) {
                    title()
                    subtitle?.invoke()
                }
                Row {
                    actions()
                }
            }
            // Content
            content()
            // Footer
            footer?.invoke()
        }
    }
}

// 使用
CardLayout(
    title = { Text("John Doe") },
    subtitle = { Text("Software Engineer") },
    leading = { 
        Icon(
            imageVector = Icons.Default.Person,
            contentDescription = null
        )
    },
    actions = {
        IconButton(onClick = { }) {
            Icon(Icons.Default.MoreVert, contentDescription = null)
        }
    },
    content = {
        Text(
            text = "User bio goes here...",
            modifier = Modifier.padding(horizontal = 16.dp)
        )
    },
    footer = {
        Row(
            modifier = Modifier.padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            TextButton(onClick = { }) {
                Text("FOLLOW")
            }
            Button(onClick = { }) {
                Text("MESSAGE")
            }
        }
    }
)
```

---

## 3. 状态提升 (State Hoisting)

### 3.1 状态提升原则

```kotlin
// ✅ 将共享状态提升到共同祖先
@Composable
fun ParentComponent() {
    var selectedTab by remember { mutableIntStateOf(0) }

    Column {
        TabBar(
            selectedIndex = selectedTab,
            onTabSelected = { selectedTab = it }
        )
        TabContent(
            selectedIndex = selectedTab
        )
    }
}

@Composable
fun TabBar(
    selectedIndex: Int,
    onTabSelected: (Int) -> Unit,
    modifier: Modifier = Modifier
) {
    TabRow(
        selectedTabIndex = selectedIndex,
        modifier = modifier
    ) {
        Tab(
            selected = selectedIndex == 0,
            onClick = { onTabSelected(0) },
            text = { Text("Home") }
        )
        Tab(
            selected = selectedIndex == 1,
            onClick = { onTabSelected(1) },
            text = { Text("Profile") }
        )
    }
}
```

### 3.2 状态持有者模式

```kotlin
// ✅ 使用状态持有者类管理复杂状态
@Stable
class SearchState {
    var query by mutableStateOf("")
        private set
    var isSearching by mutableStateOf(false)
        private set
    var results by mutableStateOf<List<String>>(emptyList())
        private set

    fun onQueryChange(newQuery: String) {
        query = newQuery
    }

    suspend fun search(repository: SearchRepository) {
        isSearching = true
        results = repository.search(query)
        isSearching = false
    }

    fun clear() {
        query = ""
        results = emptyList()
    }
}

@Composable
fun rememberSearchState(): SearchState {
    return remember { SearchState() }
}

@Composable
fun SearchScreen(
    viewModel: SearchViewModel = hiltViewModel()
) {
    val searchState = rememberSearchState()
    
    SearchContent(
        state = searchState,
        onSearch = { viewModel.search(it) }
    )
}
```

---

## 4. Repository 模式

### 4.1 仓库接口与实现

```kotlin
// 领域层 - 接口
interface UserRepository {
    fun getUser(id: String): Flow<Result<User>>
    suspend fun updateUser(user: User): Result<Unit>
    fun searchUsers(query: String): Flow<Result<List<User>>>
}

// 数据层 - 实现
class UserRepositoryImpl @Inject constructor(
    private val apiService: ApiService,
    private val userDao: UserDao,
    private val dataStore: PreferencesDataStore
) : UserRepository {

    override fun getUser(id: String): Flow<Result<User>> = flow {
        emit(Result.Loading)
        
        // 先尝试从本地获取
        val localUser = userDao.getUser(id)?.toDomain()
        localUser?.let { emit(Result.Success(it)) }
        
        // 从网络获取最新数据
        try {
            val remoteUser = apiService.getUser(id).toDomain()
            userDao.insertUser(remoteUser.toEntity())
            emit(Result.Success(remoteUser))
        } catch (e: Exception) {
            if (localUser == null) {
                emit(Result.Error(e))
            }
        }
    }.catch { e ->
        emit(Result.Error(e))
    }.flowOn(Dispatchers.IO)

    override suspend fun updateUser(user: User): Result<Unit> {
        return try {
            apiService.updateUser(user.toDto())
            userDao.updateUser(user.toEntity())
            Result.Success(Unit)
        } catch (e: Exception) {
            Result.Error(e)
        }
    }

    override fun searchUsers(query: String): Flow<Result<List<User>>> = flow {
        emit(Result.Loading)
        val users = apiService.searchUsers(query).map { it.toDomain() }
        emit(Result.Success(users))
    }.flowOn(Dispatchers.IO)
}
```

### 4.2 缓存策略

```kotlin
class CachedUserRepository @Inject constructor(
    private val source: UserRepository,
    private val cache: UserCache
) : UserRepository {

    override fun getUser(id: String): Flow<Result<User>> = flow {
        // 检查缓存
        val cached = cache.get(id)
        if (cached != null && !cache.isExpired(id)) {
            emit(Result.Success(cached))
            return@flow
        }
        
        // 从源获取
        source.getUser(id).collect { result ->
            if (result is Result.Success) {
                cache.put(id, result.data)
            }
            emit(result)
        }
    }
}
```

---

## 5. 依赖注入 (Hilt/Koin)

### 5.1 Hilt 使用规范

```kotlin
// Application 类
@HiltAndroidApp
class {{platform_id}}Application : Application()

// 模块定义
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    
    @Provides
    @Singleton
    fun provideOkHttpClient(): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor(HttpLoggingInterceptor())
            .build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit {
        return Retrofit.Builder()
            .baseUrl(BuildConfig.BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }

    @Provides
    @Singleton
    fun provideApiService(retrofit: Retrofit): ApiService {
        return retrofit.create(ApiService::class.java)
    }
}

@Module
@InstallIn(ViewModelComponent::class)
abstract class RepositoryModule {
    
    @Binds
    abstract fun bindUserRepository(
        impl: UserRepositoryImpl
    ): UserRepository
}

// ViewModel 注入
@HiltViewModel
class UserViewModel @Inject constructor(
    private val userRepository: UserRepository,
    private val savedStateHandle: SavedStateHandle
) : ViewModel() {
    // ...
}

// Composable 中使用
@Composable
fun UserScreen(
    viewModel: UserViewModel = hiltViewModel()
) {
    // ...
}
```

### 5.2 Koin 使用规范

```kotlin
// Application 中初始化
class {{platform_id}}Application : Application() {
    override fun onCreate() {
        super.onCreate()
        startKoin {
            androidContext(this@{{platform_id}}Application)
            modules(appModule, networkModule, repositoryModule)
        }
    }
}

// 模块定义
val networkModule = module {
    single { 
        OkHttpClient.Builder()
            .addInterceptor(HttpLoggingInterceptor())
            .build() 
    }
    
    single {
        Retrofit.Builder()
            .baseUrl(BuildConfig.BASE_URL)
            .client(get())
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
    
    single { get<Retrofit>().create(ApiService::class.java) }
}

val repositoryModule = module {
    single<UserRepository> { UserRepositoryImpl(get(), get()) }
}

val viewModelModule = module {
    viewModel { UserViewModel(get()) }
}

// Composable 中使用
@Composable
fun UserScreen(
    viewModel: UserViewModel = koinViewModel()
) {
    // ...
}
```

---

## 6. Android 特定设计原则

### 6.1 Material Design 3

```kotlin
// ✅ 使用 Material 3 主题
@Composable
fun {{platform_id}}Theme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) 
            else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}

// 自定义颜色方案
private val LightColorScheme = lightColorScheme(
    primary = md_theme_light_primary,
    onPrimary = md_theme_light_onPrimary,
    primaryContainer = md_theme_light_primaryContainer,
    secondary = md_theme_light_secondary,
    // ...
)
```

### 6.2 响应式设计

```kotlin
// ✅ 响应式布局
@Composable
fun ResponsiveLayout(
    modifier: Modifier = Modifier,
    compact: @Composable () -> Unit,
    medium: @Composable (() -> Unit)? = null,
    expanded: @Composable (() -> Unit)? = null
) {
    val windowSizeClass = calculateWindowSizeClass()
    
    Box(modifier = modifier) {
        when (windowSizeClass.widthSizeClass) {
            WindowWidthSizeClass.Compact -> compact()
            WindowWidthSizeClass.Medium -> medium?.invoke() ?: compact()
            WindowWidthSizeClass.Expanded -> expanded?.invoke() 
                ?: medium?.invoke() 
                ?: compact()
        }
    }
}

// 使用
ResponsiveLayout(
    compact = { MobileLayout() },
    medium = { TabletLayout() },
    expanded = { DesktopLayout() }
)
```

### 6.3 无障碍设计

```kotlin
// ✅ 无障碍支持
@Composable
fun AccessibleButton(
    onClick: () -> Unit,
    text: String,
    modifier: Modifier = Modifier
) {
    Button(
        onClick = onClick,
        modifier = modifier.semantics {
            // 自定义无障碍描述
            contentDescription = "点击$text"
            role = Role.Button
        }
    ) {
        Text(text)
    }
}

// ✅ 触摸目标大小
@Composable
fun AccessibleIconButton(
    onClick: () -> Unit,
    icon: ImageVector,
    contentDescription: String
) {
    IconButton(
        onClick = onClick,
        modifier = Modifier.minimumInteractiveComponentSize()
    ) {
        Icon(
            imageVector = icon,
            contentDescription = contentDescription
        )
    }
}
```

---

## 7. 错误处理设计

### 7.1 统一错误处理

```kotlin
// ✅ 密封类表示结果
sealed class Result<out T> {
    data object Loading : Result<Nothing>()
    data class Success<T>(val data: T) : Result<T>()
    data class Error(val exception: Throwable) : Result<Nothing>()
}

// ✅ 错误 UI 组件
@Composable
fun ErrorMessage(
    message: String,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            imageVector = Icons.Default.Error,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.error,
            modifier = Modifier.size(48.dp)
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = message,
            color = MaterialTheme.colorScheme.error,
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(16.dp))
        Button(onClick = onRetry) {
            Text("重试")
        }
    }
}

// ✅ 异步内容包装器
@Composable
fun <T> AsyncContent(
    result: Result<T>,
    onRetry: () -> Unit,
    content: @Composable (T) -> Unit
) {
    when (result) {
        is Result.Loading -> {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator()
            }
        }
        is Result.Success -> content(result.data)
        is Result.Error -> ErrorMessage(
            message = result.exception.message ?: "发生错误",
            onRetry = onRetry
        )
    }
}
```

---

## 8. 设计检查清单

- [ ] 遵循 SOLID 原则
- [ ] Composable 职责单一
- [ ] 使用组合而非继承
- [ ] 状态适当提升
- [ ] UI 组件可复用
- [ ] 主题配置集中管理
- [ ] 使用依赖注入
- [ ] Repository 模式正确实现
- [ ] 错误处理完善
- [ ] 响应式布局适配
- [ ] 支持无障碍访问
- [ ] 代码符合 Kotlin 风格指南
