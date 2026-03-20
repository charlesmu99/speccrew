# 设计规范 - {{platform_name}}

> 平台: {{platform_id}}  
> 生成时间: {{generated_at}}  
> 框架: Vue.js

---

## 1. 组件设计模式

### 1.1 组件设计原则

#### 单一职责原则 (SRP)

每个组件应该只负责一个功能或一个职责。

```vue
<!-- ✅ 好的设计：UserAvatar 只负责显示头像 -->
<template>
  <img 
    :src="avatarUrl" 
    :alt="userName"
    class="rounded-full object-cover"
    @error="handleError"
  />
</template>

<!-- ❌ 坏的设计：组件职责过多 -->
<template>
  <div>
    <img :src="avatarUrl" />
    <h3>{{ userName }}</h3>
    <p>{{ userBio }}</p>
    <button @click="followUser">关注</button>
    <!-- 太多不相关的功能 -->
  </div>
</template>
```

#### 容器组件与展示组件

**容器组件 (Container)**：负责数据获取和状态管理
```vue
<!-- UserProfileContainer.vue -->
<script setup lang="ts">
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/modules/user'
import UserProfileCard from './UserProfileCard.vue'

const props = defineProps<{ userId: string }>()
const userStore = useUserStore()

onMounted(async () => {
  await userStore.fetchUser(props.userId)
})
</script>

<template>
  <UserProfileCard 
    :user="userStore.currentUser"
    :loading="userStore.loading"
  />
</template>
```

**展示组件 (Presentational)**：负责 UI 展示，无业务逻辑
```vue
<!-- UserProfileCard.vue -->
<script setup lang="ts">
import type { User } from '@/types'

interface Props {
  user: User | null
  loading: boolean
}

defineProps<Props>()
</script>

<template>
  <div v-if="loading" class="skeleton">加载中...</div>
  <div v-else-if="user" class="profile-card">
    <img :src="user.avatar" />
    <h3>{{ user.name }}</h3>
  </div>
</template>
```

### 1.2 组件通信模式

#### Props 向下传递

```vue
<!-- 父组件 -->
<template>
  <UserList 
    :users="users"
    :sort-by="sortField"
    :loading="isLoading"
  />
</template>
```

```vue
<!-- 子组件 UserList.vue -->
<script setup lang="ts">
interface Props {
  users: User[]
  sortBy: 'name' | 'date' | 'role'
  loading: boolean
}

// ✅ 使用 withDefaults 设置默认值
const props = withDefaults(defineProps<Props>(), {
  sortBy: 'date',
  loading: false
})
</script>
```

#### Events 向上传递

```vue
<!-- 子组件 -->
<script setup lang="ts">
// ✅ 定义事件类型
const emit = defineEmits<{
  select: [user: User]           // 单个参数
  update: [id: string, data: Partial<User>]  // 多个参数
  delete: [id: string]
}>()

function handleClick(user: User) {
  emit('select', user)
}
</script>
```

```vue
<!-- 父组件 -->
<template>
  <UserList 
    :users="users"
    @select="handleUserSelect"
    @update="handleUserUpdate"
  />
</template>
```

#### 依赖注入 (Provide/Inject)

适用于深层嵌套组件通信：

```vue
<!-- 祖先组件 -->
<script setup lang="ts">
import { provide, readonly } from 'vue'
import { useUserStore } from '@/stores/modules/user'

const userStore = useUserStore()

// ✅ 提供只读状态，防止子组件直接修改
provide('user', readonly(userStore.userInfo))
provide('updateUser', userStore.updateUserInfo)
</script>
```

```vue
<!-- 深层后代组件 -->
<script setup lang="ts">
import { inject } from 'vue'
import type { UserInfo } from '@/types'

// ✅ 使用类型安全的注入
const user = inject<UserInfo>('user')
const updateUser = inject<(data: Partial<UserInfo>) => void>('updateUser')

// 提供默认值
const theme = inject('theme', 'light')
</script>
```

---

## 2. Props/Events 设计

### 2.1 Props 设计规范

#### 命名规范

```typescript
// ✅ 使用 camelCase 定义
interface Props {
  userName: string      // 不是 user-name
  isActive: boolean     // 不是 is-active
  itemList: Item[]      // 不是 item-list
}

// 模板中使用 kebab-case
<user-card 
  :user-name="name"
  :is-active="active"
  :item-list="items"
/>
```

#### Props 类型设计

```typescript
// ✅ 使用 TypeScript 接口定义 Props
interface UserCardProps {
  // 必填属性
  id: string
  name: string
  
  // 可选属性
  avatar?: string
  role?: 'admin' | 'user' | 'guest'
  
  // 带默认值的属性
  size?: 'small' | 'medium' | 'large'
  disabled?: boolean
}

// ✅ 使用 withDefaults 提供默认值
const props = withDefaults(defineProps<UserCardProps>(), {
  avatar: '/default-avatar.png',
  role: 'user',
  size: 'medium',
  disabled: false
})
```

#### Props 验证

```typescript
// ✅ 运行时验证（Options API 风格）
const props = defineProps({
  id: {
    type: String,
    required: true,
    validator: (value: string) => value.length > 0
  },
  count: {
    type: Number,
    default: 0,
    validator: (value: number) => value >= 0
  },
  status: {
    type: String as PropType<'pending' | 'success' | 'error'>,
    default: 'pending'
  }
})
```

### 2.2 Events 设计规范

#### 事件命名

```typescript
// ✅ 使用动词描述发生了什么
const emit = defineEmits<{
  submit: [data: FormData]      // 表单提交
  cancel: []                     // 取消操作
  select: [item: Item]          // 选择项目
  update: [value: string]       // 更新值
  delete: [id: string]          // 删除项目
  loadMore: []                   // 加载更多
}>()

// ❌ 避免使用模糊的名称
const emit = defineEmits<{
  change: [any]        // 太模糊
  click: []            // 与原生事件冲突
  doSomething: []      // 不具体
}>()
```

#### v-model 设计

```vue
<!-- ✅ 自定义 v-model -->
<script setup lang="ts">
interface Props {
  modelValue: string
  modelModifiers?: { capitalize: boolean }
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function handleInput(e: Event) {
  let value = (e.target as HTMLInputElement).value
  
  if (props.modelModifiers?.capitalize) {
    value = value.charAt(0).toUpperCase() + value.slice(1)
  }
  
  emit('update:modelValue', value)
}
</script>
```

```vue
<!-- 使用自定义 v-model -->
<template>
  <BaseInput 
    v-model.capitalize="userName"
    placeholder="输入用户名"
  />
</template>
```

#### 多个 v-model

```vue
<script setup lang="ts">
interface Props {
  firstName: string
  lastName: string
}

defineProps<Props>()
const emit = defineEmits<{
  'update:firstName': [value: string]
  'update:lastName': [value: string]
}>()
</script>

<template>
  <input 
    :value="firstName" 
    @input="$emit('update:firstName', $event.target.value)"
  />
  <input 
    :value="lastName"
    @input="$emit('update:lastName', $event.target.value)"
  />
</template>
```

```vue
<!-- 使用多个 v-model -->
<UserForm 
  v-model:first-name="user.firstName"
  v-model:last-name="user.lastName"
/>
```

---

## 3. Slots 和 Scoped Slots

### 3.1 Slots 使用规范

#### 默认插槽

```vue
<!-- Card.vue -->
<template>
  <div class="card">
    <div class="card-header">
      <slot name="header">
        <!-- 默认内容 -->
        <h3>默认标题</h3>
      </slot>
    </div>
    <div class="card-body">
      <slot>
        <!-- 默认内容 -->
        <p>暂无内容</p>
      </slot>
    </div>
    <div class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>
```

```vue
<!-- 使用 Card -->
<template>
  <Card>
    <template #header>
      <h2>自定义标题</h2>
    </template>
    
    <p>这是卡片的主要内容</p>
    
    <template #footer>
      <button>确认</button>
    </template>
  </Card>
</template>
```

#### 作用域插槽 (Scoped Slots)

```vue
<!-- List.vue -->
<script setup lang="ts" generic="T">
interface Props {
  items: T[]
  loading?: boolean
}

defineProps<Props>()
</script>

<template>
  <div class="list">
    <div v-if="loading" class="loading">加载中...</div>
    <template v-else>
      <div 
        v-for="(item, index) in items" 
        :key="index"
        class="list-item"
      >
        <!-- ✅ 向父组件暴露数据和状态 -->
        <slot 
          :item="item" 
          :index="index"
          :is-first="index === 0"
          :is-last="index === items.length - 1"
        />
      </div>
    </template>
  </div>
</template>
```

```vue
<!-- 使用 List -->
<template>
  <List :items="users" v-slot="{ item, index, isFirst, isLast }">
    <div :class="{ 'first-item': isFirst, 'last-item': isLast }">
      <span class="index">{{ index + 1 }}.</span>
      <span class="name">{{ item.name }}</span>
    </div>
  </List>
</template>
```

### 3.2 插槽设计模式

#### 渲染无关组件 (Renderless Component)

```vue
<!-- MouseTracker.vue -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const x = ref(0)
const y = ref(0)

function update(e: MouseEvent) {
  x.value = e.pageX
  y.value = e.pageY
}

onMounted(() => window.addEventListener('mousemove', update))
onUnmounted(() => window.removeEventListener('mousemove', update))
</script>

<template>
  <slot :x="x" :y="y" />
</template>
```

```vue
<!-- 使用 MouseTracker -->
<template>
  <MouseTracker v-slot="{ x, y }">
    <p>鼠标位置: ({{ x }}, {{ y }})</p>
  </MouseTracker>
</template>
```

#### 复合组件模式 (Compound Component)

```vue
<!-- Tabs 组件系列 -->
<!-- Tabs.vue -->
<script setup lang="ts">
import { provide, ref } from 'vue'

const activeTab = ref('')
const tabs = ref<string[]>([])

function registerTab(id: string) {
  if (!tabs.value.includes(id)) {
    tabs.value.push(id)
    if (tabs.value.length === 1) {
      activeTab.value = id
    }
  }
}

function setActiveTab(id: string) {
  activeTab.value = id
}

provide('tabs', {
  activeTab,
  registerTab,
  setActiveTab
})
</script>

<template>
  <div class="tabs">
    <slot />
  </div>
</template>
```

```vue
<!-- TabList.vue -->
<script setup lang="ts">
import { inject } from 'vue'

const { activeTab, setActiveTab } = inject('tabs')!
</script>

<template>
  <div class="tab-list" role="tablist">
    <slot :active-tab="activeTab" :set-active-tab="setActiveTab" />
  </div>
</template>
```

```vue
<!-- 使用 Tabs -->
<template>
  <Tabs>
    <TabList v-slot="{ activeTab, setActiveTab }">
      <button 
        :class="{ active: activeTab === 'tab1' }"
        @click="setActiveTab('tab1')"
      >
        Tab 1
      </button>
      <button 
        :class="{ active: activeTab === 'tab2' }"
        @click="setActiveTab('tab2')"
      >
        Tab 2
      </button>
    </TabList>
    <TabPanel id="tab1">内容 1</TabPanel>
    <TabPanel id="tab2">内容 2</TabPanel>
  </Tabs>
</template>
```

---

## 4. Composable 设计模式

### 4.1 Composable 设计原则

#### 命名规范

```typescript
// ✅ 使用 use 前缀
useAuth.ts
useForm.ts
usePagination.ts
useLocalStorage.ts

// ✅ 函数名清晰表达功能
useMousePosition()      // 获取鼠标位置
useFetch(url)           // 数据获取
useDebounce(fn, delay)  // 防抖
```

#### 文件组织

```
composables/
├── index.ts              # 导出所有 composables
├── useAuth.ts            # 认证相关
├── useUser.ts            # 用户相关
├── useForm.ts            # 表单处理
├── usePagination.ts      # 分页逻辑
├── useAsync.ts           # 异步状态管理
├── useLocalStorage.ts    # 本地存储
├── useEventListener.ts   # 事件监听
└── useMediaQuery.ts      # 媒体查询
```

### 4.2 Composable 示例

#### useAsync - 异步状态管理

```typescript
// composables/useAsync.ts
import { ref, computed } from 'vue'

interface UseAsyncOptions<T> {
  immediate?: boolean
  defaultValue?: T
  onError?: (error: Error) => void
  onSuccess?: (data: T) => void
}

export function useAsync<T>(
  fn: () => Promise<T>,
  options: UseAsyncOptions<T> = {}
) {
  const { immediate = false, defaultValue, onError, onSuccess } = options
  
  const data = ref<T | undefined>(defaultValue)
  const error = ref<Error | null>(null)
  const loading = ref(false)
  
  const isReady = computed(() => !loading.value && !error.value && data.value !== undefined)
  const isError = computed(() => !!error.value)
  
  async function execute() {
    loading.value = true
    error.value = null
    
    try {
      const result = await fn()
      data.value = result
      onSuccess?.(result)
      return result
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e))
      error.value = err
      onError?.(err)
      throw err
    } finally {
      loading.value = false
    }
  }
  
  if (immediate) {
    execute()
  }
  
  return {
    data,
    error,
    loading,
    isReady,
    isError,
    execute
  }
}
```

#### usePagination - 分页逻辑

```typescript
// composables/usePagination.ts
import { ref, computed, watch } from 'vue'

interface PaginationOptions {
  pageSize?: number
  total?: number
}

export function usePagination(options: PaginationOptions = {}) {
  const { pageSize = 10, total = 0 } = options
  
  const currentPage = ref(1)
  const pageSizeRef = ref(pageSize)
  const totalRef = ref(total)
  
  const totalPages = computed(() => 
    Math.ceil(totalRef.value / pageSizeRef.value)
  )
  
  const startIndex = computed(() => 
    (currentPage.value - 1) * pageSizeRef.value
  )
  
  const endIndex = computed(() => 
    Math.min(startIndex.value + pageSizeRef.value, totalRef.value)
  )
  
  const hasNextPage = computed(() => currentPage.value < totalPages.value)
  const hasPrevPage = computed(() => currentPage.value > 1)
  
  function goToPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }
  
  function nextPage() {
    if (hasNextPage.value) {
      currentPage.value++
    }
  }
  
  function prevPage() {
    if (hasPrevPage.value) {
      currentPage.value--
    }
  }
  
  function reset() {
    currentPage.value = 1
  }
  
  return {
    currentPage,
    pageSize: pageSizeRef,
    total: totalRef,
    totalPages,
    startIndex,
    endIndex,
    hasNextPage,
    hasPrevPage,
    goToPage,
    nextPage,
    prevPage,
    reset
  }
}
```

#### useLocalStorage - 响应式本地存储

```typescript
// composables/useLocalStorage.ts
import { ref, watch, type Ref } from 'vue'

export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): Ref<T> {
  // 从 localStorage 读取初始值
  const stored = localStorage.getItem(key)
  const initialValue = stored ? JSON.parse(stored) : defaultValue
  
  const data = ref<T>(initialValue) as Ref<T>
  
  // 监听变化并保存到 localStorage
  watch(
    data,
    (newValue) => {
      localStorage.setItem(key, JSON.stringify(newValue))
    },
    { deep: true }
  )
  
  // 监听其他标签页的更改
  window.addEventListener('storage', (e) => {
    if (e.key === key && e.newValue) {
      data.value = JSON.parse(e.newValue)
    }
  })
  
  return data
}
```

### 4.3 Composable 使用规范

```vue
<script setup lang="ts">
// ✅ 在 script setup 顶部引入 composables
import { useAuth } from '@/composables/useAuth'
import { usePagination } from '@/composables/usePagination'
import { useAsync } from '@/composables/useAsync'

// ✅ 组合多个 composables
const { user, isLoggedIn, login, logout } = useAuth()
const { currentPage, pageSize, totalPages, nextPage, prevPage } = usePagination({
  pageSize: 20
})

const { data: users, loading, error, execute: fetchUsers } = useAsync(
  () => fetchUsersApi({ page: currentPage.value, pageSize: pageSize.value }),
  { immediate: true }
)

// ✅ 监听分页变化自动刷新数据
watch([currentPage, pageSize], fetchUsers)
</script>
```

---

## 5. Vue 设计原则

### 5.1 渐进式框架原则

1. **按需引入**：只使用需要的功能
2. **渐进增强**：从简单到复杂逐步构建
3. **灵活性**：支持不同规模和复杂度的项目

### 5.2 响应式系统原则

```typescript
// ✅ 使用 ref 处理基本类型
const count = ref(0)
const name = ref('Vue')

// ✅ 使用 reactive 处理对象（注意解构问题）
const state = reactive({
  user: { name: 'John', age: 30 },
  settings: { theme: 'dark' }
})

// ✅ 使用 toRefs 解构 reactive 对象
const { user, settings } = toRefs(state)

// ✅ 使用 computed 创建派生状态
const fullName = computed(() => `${firstName.value} ${lastName.value}`)

// ✅ 使用 watch 监听副作用
watch(
  () => state.user.age,
  (newAge, oldAge) => {
    console.log(`年龄变化: ${oldAge} -> ${newAge}`)
  }
)
```

### 5.3 可维护性原则

#### 组件文件组织

```vue
<script setup lang="ts">
// 1. 导入（按类型分组）
// Vue 内置
import { ref, computed, onMounted } from 'vue'
// 第三方库
import { useRoute } from 'vue-router'
import { useDebounceFn } from '@vueuse/core'
// 项目内部
import { useUserStore } from '@/stores/modules/user'
import type { User } from '@/types'

// 2. 类型定义
interface Props {
  userId: string
}

// 3. Props 和 Emits
const props = defineProps<Props>()
const emit = defineEmits<{
  update: [user: User]
}>()

// 4. 注入（如果有）
const theme = inject('theme', 'light')

// 5. 状态定义
const user = ref<User | null>(null)
const loading = ref(false)
const error = ref<Error | null>(null)

// 6. Computed
const userName = computed(() => user.value?.name || 'Unknown')

// 7. 方法
const fetchUser = async () => {
  // ...
}

const debouncedSearch = useDebounceFn((query: string) => {
  // ...
}, 300)

// 8. 生命周期
onMounted(() => {
  fetchUser()
})

// 9. 暴露给父组件（如果有）
defineExpose({
  refresh: fetchUser
})
</script>
```

### 5.4 可测试性原则

```typescript
// ✅ 纯函数易于测试
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

// ✅ 副作用隔离在 composables 中
export function useCounter(initial = 0) {
  const count = ref(initial)
  const double = computed(() => count.value * 2)
  
  function increment() {
    count.value++
  }
  
  return { count, double, increment }
}

// ✅ 依赖注入便于 mock
export function useAuth(api = authApi) {
  // 可以传入 mock api 进行测试
}
```

---

## 6. 设计模式总结

| 模式 | 使用场景 | 示例 |
|------|----------|------|
| 容器/展示组件 | 分离数据逻辑和 UI | UserContainer / UserCard |
| 渲染无关组件 | 封装可复用逻辑 | MouseTracker |
| 复合组件 | 构建复杂交互组件 | Tabs, Accordion |
| Composables | 提取可复用逻辑 | useAuth, useForm |
| Provide/Inject | 深层组件通信 | 主题、用户上下文 |
| Slots | 灵活的内容分发 | Card, Modal |
| Scoped Slots | 父组件控制子组件渲染 | List, Table |

---

## 7. 相关文档

- [Vue 3 组合式 API](https://cn.vuejs.org/guide/extras/composition-api-faq.html)
- [Vue 样式指南](https://cn.vuejs.org/style-guide/)
- [VueUse - 常用 Composables](https://vueuse.org/)
