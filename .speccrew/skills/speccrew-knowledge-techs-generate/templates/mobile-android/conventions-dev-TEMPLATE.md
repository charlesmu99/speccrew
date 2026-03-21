# {{platform_name}} 开发规范

> **平台**: {{platform_name}}  
> **框架**: Android (Kotlin)  
> **生成时间**: {{generated_at}}  
> **版本**: 1.0

---

## 1. Kotlin 命名规范

### 1.1 文件命名

| 类型 | 规范 | 示例 |
|------|------|------|
| Kotlin 文件 | `PascalCase.kt` | `UserRepository.kt` |
| Activity | `PascalCaseActivity.kt` | `MainActivity.kt` |
| Fragment | `PascalCaseFragment.kt` | `HomeFragment.kt` |
| ViewModel | `PascalCaseViewModel.kt` | `UserViewModel.kt` |
| Composable Screen | `PascalCaseScreen.kt` | `HomeScreen.kt` |
| Repository | `PascalCaseRepository.kt` | `UserRepository.kt` |
| UseCase | `PascalCaseUseCase.kt` | `GetUserUseCase.kt` |
| 测试文件 | `PascalCaseTest.kt` | `UserRepositoryTest.kt` |

```kotlin
// ✅ 正确
// src/main/java/com/example/app/
//   ├── data/
//   │   ├── repository/
//   │   │   ├── UserRepositoryImpl.kt
//   │   │   └── ProductRepositoryImpl.kt
//   │   └── model/
//   │       ├── UserDto.kt
//   │       └── ProductDto.kt
//   ├── ui/
//   │   ├── screens/
//   │   │   ├── HomeScreen.kt
//   │   │   └── ProfileScreen.kt
//   │   └── components/
//   │       ├── UserCard.kt
//   │       └── LoadingIndicator.kt
//   └── domain/
//       ├── model/
//       │   ├── User.kt
//       │   └── Product.kt
//       └── repository/
//           ├── UserRepository.kt
//           └── ProductRepository.kt
```

### 1.2 类命名

| 类型 | 规范 | 示例 |
|------|------|------|
| 类名 | `PascalCase` | `UserRepository`, `HomeViewModel` |
| 接口名 | `PascalCase` | `UserRepository`, `ApiService` |
| 数据类 | `PascalCase` | `User`, `ProductDetail` |
| 密封类 | `PascalCase` | `UiState`, `ScreenEvent` |
| 枚举类 | `PascalCase` | `UserStatus`, `LoadingState` |
| 类型别名 | `PascalCase` | `UserCallback`, `Validator` |
| 注解 | `PascalCase` | `@Inject`, `@Composable` |

```kotlin
// ✅ 正确
class UserRepository { }

interface ApiService { }

data class User(
    val id: String,
    val name: String
)

sealed class UiState {
    data object Loading : UiState()
    data class Success(val data: User) : UiState()
    data class Error(val message: String) : UiState()
}

enum class UserStatus {
    ACTIVE,
    INACTIVE,
    SUSPENDED
}

typealias UserCallback = (User) -> Unit
```

### 1.3 变量和函数命名

| 类型 | 规范 | 示例 |
|------|------|------|
| 变量 | `lowerCamelCase` | `userName`, `orderList` |
| 常量 | `UPPER_SNAKE_CASE` | `MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT` |
| 函数 | `lowerCamelCase` | `getUserById()`, `fetchOrders()` |
| 私有成员 | `lowerCamelCase` | `_internalState`, `_fetchData()` |
| Composable 函数 | `PascalCase` | `UserCard()`, `LoadingIndicator()` |
| 测试函数 | `反引号 + 描述` | `` `should return user when id exists` `` |

```kotlin
// ✅ 正确
class UserService {
    companion object {
        const val DEFAULT_PAGE_SIZE = 20
        const val MAX_RETRY_COUNT = 3
    }
    
    private val apiKey: String
    private var cachedUsers: List<User> = emptyList()

    fun getUserById(id: String): User { }
    
    private fun fetchDataFromNetwork() { }
}

// ✅ Composable 使用 PascalCase
@Composable
fun UserCard(user: User) { }

@Composable
fun LoadingIndicator() { }

// ✅ 测试函数使用反引号
@Test
fun `should return user when id exists`() { }
```

### 1.4 包命名

```kotlin
// ✅ 包命名规范
// com.{company}.{appname}.{layer}.{feature}

// 示例
package com.example.{{platform_id}}.data.repository
package com.example.{{platform_id}}.domain.model
package com.example.{{platform_id}}.ui.screens.home
package com.example.{{platform_id}}.di
```

---

## 2. 包组织

### 2.1 推荐目录结构

```
src/main/java/com/example/{{platform_id}}/
├── {{platform_id}}Application.kt          # Application 类
├── di/                                    # 依赖注入
│   ├── AppModule.kt
│   ├── NetworkModule.kt
│   └── RepositoryModule.kt
├── domain/                                # 领域层
│   ├── model/                             # 领域模型
│   │   ├── User.kt
│   │   └── Product.kt
│   ├── repository/                        # 仓库接口
│   │   ├── UserRepository.kt
│   │   └── ProductRepository.kt
│   └── usecase/                           # 用例
│       ├── GetUserUseCase.kt
│       └── GetProductsUseCase.kt
├── data/                                  # 数据层
│   ├── local/                             # 本地数据源
│   │   ├── database/
│   │   │   ├── AppDatabase.kt
│   │   │   ├── UserDao.kt
│   │   │   └── UserEntity.kt
│   │   └── datastore/
│   │       └── PreferencesDataStore.kt
│   ├── remote/                            # 远程数据源
│   │   ├── api/
│   │   │   ├── ApiService.kt
│   │   │   └── ApiResponse.kt
│   │   └── model/
│   │       ├── UserDto.kt
│   │       └── ProductDto.kt
│   └── repository/                        # 仓库实现
│       ├── UserRepositoryImpl.kt
│       └── ProductRepositoryImpl.kt
├── ui/                                    # UI 层
│   ├── theme/                             # 主题
│   │   ├── Color.kt
│   │   ├── Theme.kt
│   │   └── Type.kt
│   ├── components/                        # 可复用组件
│   │   ├── CommonButton.kt
│   │   ├── LoadingIndicator.kt
│   │   └── ErrorMessage.kt
│   ├── screens/                           # 页面
│   │   ├── home/
│   │   │   ├── HomeScreen.kt
│   │   │   ├── HomeViewModel.kt
│   │   │   └── HomeUiState.kt
│   │   └── profile/
│   │       ├── ProfileScreen.kt
│   │       ├── ProfileViewModel.kt
│   │       └── ProfileUiState.kt
│   └── navigation/                        # 导航
│       ├── AppNavigation.kt
│       └── Screen.kt
└── utils/                                 # 工具类
    ├── Constants.kt
    ├── Extensions.kt
    └── Result.kt
```

### 2.2 模块组织

```kotlin
// ✅ 按功能模块组织 (推荐)
// feature/user/
//   ├── data/
//   │   ├── UserRepositoryImpl.kt
//   │   ├── local/
//   │   └── remote/
//   ├── domain/
//   │   ├── model/
//   │   ├── repository/
//   │   └── usecase/
//   └── presentation/
//       ├── UserScreen.kt
//       ├── UserViewModel.kt
//       └── components/

// ✅ 按层级组织
// data/
//   ├── repository/
//   ├── local/
//   └── remote/
// domain/
//   ├── model/
//   ├── repository/
//   └── usecase/
// presentation/
//   ├── screens/
//   └── components/
```

---

## 3. Coroutines 使用规范

### 3.1 协程作用域

```kotlin
// ✅ ViewModel 中使用 viewModelScope
@HiltViewModel
class UserViewModel @Inject constructor(
    private val userRepository: UserRepository
) : ViewModel() {

    fun loadUser(userId: String) {
        viewModelScope.launch {
            // 在 ViewModel 作用域中执行
            userRepository.getUser(userId)
                .collect { user ->
                    _uiState.update { it.copy(user = user) }
                }
        }
    }
}

// ✅ Composable 中使用 rememberCoroutineScope
@Composable
fun UserScreen() {
    val scope = rememberCoroutineScope()
    
    Button(onClick = {
        scope.launch {
            // 执行异步操作
        }
    }) {
        Text("Load")
    }
}

// ✅ 使用 LaunchedEffect 处理副作用
@Composable
fun UserDetail(userId: String) {
    LaunchedEffect(userId) {
        // 在 key 变化时重新执行
        viewModel.loadUser(userId)
    }
}
```

### 3.2 Flow 使用规范

```kotlin
// ✅ StateFlow 用于状态管理
class UserViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(UserUiState())
    val uiState: StateFlow<UserUiState> = _uiState.asStateFlow()

    private val _events = Channel<UserEvent>(Channel.BUFFERED)
    val events = _events.receiveAsFlow()
}

// ✅ 在 Compose 中收集 Flow
@Composable
fun UserScreen(viewModel: UserViewModel = hiltViewModel()) {
    // 使用生命周期感知的收集
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    
    // 收集一次性事件
    LaunchedEffect(Unit) {
        viewModel.events.collect { event ->
            when (event) {
                is UserEvent.ShowMessage -> {
                    // 处理事件
                }
            }
        }
    }
}

// ✅ Flow 操作符使用
class UserRepository {
    fun getUsers(): Flow<List<User>> {
        return flow {
            emit(apiService.getUsers())
        }
        .flowOn(Dispatchers.IO)  // 在 IO 线程执行
        .catch { e ->
            // 错误处理
            emit(emptyList())
        }
        .onStart {
            // 开始时的操作
        }
        .onCompletion {
            // 完成时的操作
        }
    }
}
```

### 3.3 调度器使用

```kotlin
// ✅ 正确选择调度器
class UserRepository @Inject constructor(
    private val apiService: ApiService,
    private val userDao: UserDao
) {
    suspend fun fetchUsers(): List<User> = withContext(Dispatchers.IO) {
        // 网络请求和数据库操作在 IO 线程
        apiService.getUsers()
    }
    
    suspend fun saveUsers(users: List<User>) = withContext(Dispatchers.IO) {
        userDao.insertAll(users)
    }
}

// ✅ 主线程操作
@Composable
fun UserList(users: List<User>) {
    val context = LocalContext.current
    
    LaunchedEffect(users) {
        withContext(Dispatchers.Main) {
            // UI 更新在主线程
            Toast.makeText(context, "Loaded ${users.size} users", Toast.LENGTH_SHORT).show()
        }
    }
}
```

---

## 4. 导入组织

### 4.1 导入分组

```kotlin
// ✅ 按分组组织导入，每组之间空一行
// 1. Kotlin 标准库
import kotlin.coroutines.CoroutineContext
import kotlin.math.max

// 2. Android SDK
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent

// 3. Jetpack Compose
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Modifier

// 4. 第三方库 (按字母顺序)
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.StateFlow
import retrofit2.Retrofit

// 5. 项目内导入 (按包路径字母顺序)
import com.example.{{platform_id}}.data.repository.UserRepository
import com.example.{{platform_id}}.domain.model.User
import com.example.{{platform_id}}.ui.theme.AppTheme
```

### 4.2 导入规范

```kotlin
// ✅ 使用通配符导入 (当使用超过 3 个类时)
import androidx.compose.material3.*
import androidx.compose.foundation.layout.*

// ✅ 明确导入
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.material3.Card

// ❌ 避免未使用的导入
import android.widget.TextView  // 未使用

// ✅ 静态导入
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.layout.padding
```

---

## 5. 代码风格

### 5.1 格式化配置

```kotlin
// ✅ 使用 ktlint 或 detekt 进行代码检查
// .editorconfig
root = true

[*.{kt,kts}]
indent_size = 4
indent_style = space
max_line_length = 120
insert_final_newline = true

[*.{kt,kts}]
# 禁用通配符导入规则禁用
ij_kotlin_packages_to_use_import_on_demand = unset
ij_kotlin_name_count_to_use_star_import = 99
ij_kotlin_name_count_to_use_star_import_for_members = 99
```

### 5.2 代码示例

```kotlin
// ✅ 尾随逗号
val user = User(
    id = "123",
    name = "John",
    email = "john@example.com",
    age = 30,  // 尾随逗号
)

// ✅ 函数参数格式化
fun createUser(
    name: String,
    email: String,
    age: Int? = null,
    phone: String? = null,
) {
    // ...
}

// ✅ Lambda 格式化
val filteredUsers = users
    .filter { it.isActive }
    .map { it.toUiModel() }
    .sortedBy { it.name }

// ✅ 链式调用
val result = repository
    .getUsers()
    .map { it.filter { user -> user.isActive } }
    .catch { emit(emptyList()) }
    .flowOn(Dispatchers.IO)
```

### 5.3 文档注释

```kotlin
/**
 * 用户仓库类，负责用户数据的获取和存储
 * 
 * 使用示例:
 * ```
 * val repository = UserRepository(apiService, userDao)
 * val user = repository.getUser("123")
 * ```
 *
 * @property apiService 网络服务接口
 * @property userDao 用户数据访问对象
 */
class UserRepository(
    private val apiService: ApiService,
    private val userDao: UserDao
) {
    /**
     * 根据 ID 获取用户
     * 
     * @param id 用户唯一标识
     * @return 包含用户数据的 [Result]
     * @throws UserNotFoundException 当用户不存在时抛出
     */
    suspend fun getUser(id: String): Result<User> {
        // ...
    }
}

// ✅ Composable 文档
/**
 * 用户卡片组件
 * 
 * @param user 用户数据
 * @param onClick 点击回调
 * @param modifier 修饰符
 */
@Composable
fun UserCard(
    user: User,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    // ...
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

**范围 (scope):**
- `data`: 数据层
- `domain`: 领域层
- `ui`: UI 层
- `di`: 依赖注入
- `test`: 测试

**示例:**
```
feat(ui): 添加用户登录界面

- 实现登录表单 UI
- 添加输入验证
- 集成 ViewModel

Closes #123
```

```
fix(data): 修复用户列表加载失败问题

当网络超时时不应该显示空状态，
应该显示重试按钮。

Fixes #456
```

```
refactor(domain): 重构用户仓库

将 UserRepository 拆分为接口和实现类，
便于测试和替换实现。
```

### 6.3 代码审查清单

- [ ] 代码符合 Kotlin 风格指南
- [ ] 所有变量和函数都有适当的命名
- [ ] 使用了 const 构造函数（如适用）
- [ ] Composable 被合理拆分
- [ ] 没有未使用的导入
- [ ] 没有硬编码的日志语句
- [ ] 错误处理完善
- [ ] 文档注释完整
- [ ] 测试覆盖新功能
- [ ] 没有明显的性能问题
- [ ] 协程使用正确的调度器
- [ ] Flow 正确收集和取消

---

## 7. 开发工具配置

### 7.1 Android Studio 设置

```xml
<!-- .idea/codeStyles/Project.xml -->
<component name="ProjectCodeStyleConfiguration">
  <code_scheme name="Project" version="173">
    <JetCodeStyleSettings>
      <option name="NAME_COUNT_TO_USE_STAR_IMPORT" value="99" />
      <option name="NAME_COUNT_TO_USE_STAR_IMPORT_FOR_MEMBERS" value="99" />
      <option name="CODE_STYLE_DEFAULTS" value="KOTLIN_OFFICIAL" />
    </JetCodeStyleSettings>
    <codeStyleSettings language="kotlin">
      <option name="CODE_STYLE_DEFAULTS" value="KOTLIN_OFFICIAL" />
      <option name="LINE_COMMENT_AT_FIRST_COLUMN" value="false" />
      <option name="BLOCK_COMMENT_AT_FIRST_COLUMN" value="false" />
      <option name="KEEP_BLANK_LINES_IN_DECLARATIONS" value="1" />
      <option name="KEEP_BLANK_LINES_IN_CODE" value="1" />
    </codeStyleSettings>
  </code_scheme>
</component>
```

### 7.2 Gradle 配置

```kotlin
// ✅ 使用 Kotlin DSL
// build.gradle.kts (Module: app)
plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.hilt.android)
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.example.{{platform_id}}"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.example.{{platform_id}}"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        compose = true
    }

    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.10"
    }
}

dependencies {
    // Compose BOM
    val composeBom = platform("androidx.compose:compose-bom:2024.02.00")
    implementation(composeBom)
    androidTestImplementation(composeBom)

    // Core
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation("androidx.activity:activity-compose:1.8.2")

    // Compose
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")

    // Navigation
    implementation("androidx.navigation:navigation-compose:2.7.7")

    // ViewModel
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.7.0")

    // Hilt
    implementation("com.google.dagger:hilt-android:2.50")
    ksp("com.google.dagger:hilt-compiler:2.50")
    implementation("androidx.hilt:hilt-navigation-compose:1.1.0")

    // Testing
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}
```

---

## 8. 开发检查清单

- [ ] 文件命名符合规范
- [ ] 类/函数/变量命名清晰
- [ ] 导入语句组织有序
- [ ] 包结构合理
- [ ] 使用了 const 构造函数
- [ ] Composable 职责单一
- [ ] 协程使用正确的调度器
- [ ] Flow 正确收集和取消
- [ ] 代码格式化正确
- [ ] 文档注释完整
- [ ] 提交信息规范
- [ ] 代码审查通过
- [ ] 测试通过
