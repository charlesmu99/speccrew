# 架构规范 - {{platform_name}}

> 平台: {{platform_id}}  
> 生成时间: {{generated_at}}  
> 框架: Vue.js

---

## 1. 组件架构

### 1.1 组件类型

#### Options API vs Composition API

**推荐优先使用 Composition API + `<script setup>`**

```vue
<!-- ✅ 推荐：Composition API with script setup -->
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = defineProps<{
  title: string
}>()

const count = ref(0)
const doubled = computed(() => count.value * 2)

function increment() {
  count.value++
}

onMounted(() => {
  console.log('Component mounted')
})
</script>
```

```vue
<!-- ⚠️ 可选：Options API（遗留代码或简单组件） -->
<script lang="ts">
export default {
  name: 'LegacyComponent',
  props: {
    title: String
  },
  data() {
    return {
      count: 0
    }
  },
  computed: {
    doubled() {
      return this.count * 2
    }
  },
  methods: {
    increment() {
      this.count++
    }
  }
}
</script>
```

**选择指南：**
| 场景 | 推荐 API |
|------|----------|
| 新项目/新组件 | Composition API + `<script setup>` |
| 复杂逻辑/可复用逻辑 | Composition API (Composables) |
| 简单展示组件 | Composition API |
| 遗留项目维护 | Options API (保持一致性) |
| 需要完整类型推断 | Composition API + TypeScript |

### 1.2 组件分类

```
src/
├── components/           # 通用组件
│   ├── base/            # 基础组件 (Button, Input, Modal)
│   ├── common/          # 业务通用组件 (UserCard, OrderItem)
│   └── layout/          # 布局组件 (Header, Sidebar, Footer)
├── views/               # 页面级组件
│   ├── home/
│   ├── user/
│   └── settings/
└── features/            # 功能模块组件 (可选)
    ├── auth/
    └── dashboard/
```

**组件层级：**
- **基础组件 (Base)**：原子级组件，无业务逻辑
- **业务组件 (Common)**：可复用的业务组件
- **页面组件 (Views)**：路由级页面组件
- **布局组件 (Layout)**：页面布局框架

---

## 2. 目录结构

### 2.1 标准目录结构

```
src/
├── api/                 # API 接口定义
│   ├── modules/         # 按模块组织的 API
│   └── request.ts       # 请求拦截器配置
├── assets/              # 静态资源
│   ├── images/
│   ├── icons/
│   └── styles/          # 全局样式
├── components/          # 组件
│   ├── base/            # 基础组件
│   ├── common/          # 业务通用组件
│   └── layout/          # 布局组件
├── composables/         # 组合式函数
│   ├── useAuth.ts
│   ├── useForm.ts
│   └── usePagination.ts
├── directives/          # 自定义指令
├── layouts/             # 页面布局
├── middleware/          # 路由中间件
├── router/              # 路由配置
│   ├── index.ts
│   └── routes.ts        # 路由定义
├── stores/              # Pinia 状态管理
│   ├── modules/
│   └── index.ts
├── styles/              # 样式文件
│   ├── variables.scss   # SCSS 变量
│   ├── mixins.scss      # SCSS 混入
│   └── global.scss      # 全局样式
├── types/               # TypeScript 类型
│   ├── api/             # API 相关类型
│   ├── components/      # 组件 Props 类型
│   └── global.d.ts      # 全局类型声明
├── utils/               # 工具函数
│   ├── cache.ts         # 缓存工具
│   ├── format.ts        # 格式化工具
│   └── validator.ts     # 验证工具
└── views/               # 页面视图
    ├── home/
    ├── user/
    └── ...
```

### 2.2 组件目录组织

```
components/
├── base/
│   ├── BaseButton/
│   │   ├── BaseButton.vue      # 组件文件
│   │   ├── BaseButton.spec.ts  # 测试文件
│   │   └── index.ts            # 导出文件
│   └── BaseInput/
│       ├── BaseInput.vue
│       └── index.ts
└── common/
    └── UserCard/
        ├── UserCard.vue
        ├── UserCard.types.ts   # 类型定义
        └── index.ts
```

---

## 3. Vue Router 模式

### 3.1 路由配置结构

```typescript
// router/routes.ts
import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/home/HomeView.vue'),
    meta: {
      title: '首页',
      requiresAuth: false
    }
  },
  {
    path: '/user',
    name: 'User',
    component: () => import('@/layouts/UserLayout.vue'),
    redirect: '/user/profile',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'profile',
        name: 'UserProfile',
        component: () => import('@/views/user/UserProfile.vue'),
        meta: { title: '个人资料' }
      },
      {
        path: 'settings',
        name: 'UserSettings',
        component: () => import('@/views/user/UserSettings.vue'),
        meta: { title: '账号设置' }
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/NotFoundView.vue')
  }
]
```

### 3.2 路由设计原则

**命名规范：**
- 路由名称使用 PascalCase：`UserProfile`, `OrderList`
- 路径使用 kebab-case：`/user/profile`, `/order-list`

**路由懒加载：**
```typescript
// ✅ 使用动态导入实现懒加载
component: () => import('@/views/user/UserProfile.vue')

// ❌ 避免直接导入（影响首屏加载）
import UserProfile from '@/views/user/UserProfile.vue'
```

**路由守卫：**
```typescript
// router/index.ts
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title || '默认标题'
  
  // 权限验证
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next({ name: 'Login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})
```

### 3.3 路由传参

```typescript
// 编程式导航
// ✅ 使用 name + params（路径参数）
router.push({ name: 'UserDetail', params: { id: '123' } })

// ✅ 使用 path + query（查询参数）
router.push({ path: '/user', query: { tab: 'profile' } })

// 组件中获取参数
import { useRoute } from 'vue-router'

const route = useRoute()
const userId = route.params.id      // 路径参数
const tab = route.query.tab         // 查询参数
```

---

## 4. 状态管理 (Pinia)

### 4.1 Store 结构

```typescript
// stores/modules/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo } from '@/types/api'

export const useUserStore = defineStore('user', () => {
  // State
  const userInfo = ref<UserInfo | null>(null)
  const token = ref<string>('')
  
  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const userName = computed(() => userInfo.value?.name || '')
  
  // Actions
  async function login(credentials: LoginParams) {
    const res = await loginApi(credentials)
    token.value = res.token
    userInfo.value = res.userInfo
    return res
  }
  
  function logout() {
    token.value = ''
    userInfo.value = null
  }
  
  function updateUserInfo(info: Partial<UserInfo>) {
    if (userInfo.value) {
      Object.assign(userInfo.value, info)
    }
  }
  
  return {
    userInfo,
    token,
    isLoggedIn,
    userName,
    login,
    logout,
    updateUserInfo
  }
})
```

### 4.2 Store 组织原则

**按功能模块划分 Store：**
```
stores/
├── index.ts           # Store 入口，导出所有 store
├── modules/
│   ├── user.ts        # 用户相关状态
│   ├── app.ts         # 应用级状态（主题、语言等）
│   ├── permission.ts  # 权限相关状态
│   └── settings.ts    # 设置相关状态
└── plugins/
    └── persist.ts     # 持久化插件
```

**Store 使用规范：**
```vue
<script setup lang="ts">
import { useUserStore } from '@/stores/modules/user'
import { useAppStore } from '@/stores/modules/app'
import { storeToRefs } from 'pinia'

// ✅ 使用 storeToRefs 解构响应式数据
const userStore = useUserStore()
const appStore = useAppStore()
const { userInfo, isLoggedIn } = storeToRefs(userStore)

// ✅ 直接调用 action（非响应式）
function handleLogin() {
  userStore.login({ username, password })
}
</script>
```

### 4.3 状态持久化

```typescript
// stores/plugins/persist.ts
import type { PiniaPluginContext } from 'pinia'

export function persistPlugin({ store }: PiniaPluginContext) {
  // 从 localStorage 恢复状态
  const stored = localStorage.getItem(store.$id)
  if (stored) {
    store.$patch(JSON.parse(stored))
  }
  
  // 监听状态变化并保存
  store.$subscribe((mutation, state) => {
    localStorage.setItem(store.$id, JSON.stringify(state))
  })
}
```

---

## 5. 组件生命周期

### 5.1 Composition API 生命周期

```vue
<script setup lang="ts">
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onBeforeUnmount,
  onUnmounted,
  onActivated,      // KeepAlive 激活
  onDeactivated     // KeepAlive 停用
} from 'vue'

// 挂载阶段
onBeforeMount(() => {
  // 组件挂载前：准备数据、初始化
})

onMounted(() => {
  // 组件挂载后：DOM 操作、发起请求
})

// 更新阶段
onBeforeUpdate(() => {
  // 更新前：获取更新前的 DOM 状态
})

onUpdated(() => {
  // 更新后：DOM 已更新
})

// 卸载阶段
onBeforeUnmount(() => {
  // 卸载前：清理定时器、取消订阅
})

onUnmounted(() => {
  // 卸载后：最终清理
})
</script>
```

### 5.2 生命周期使用场景

| 钩子 | 使用场景 |
|------|----------|
| `onMounted` | 发起 API 请求、DOM 操作、订阅事件 |
| `onBeforeUnmount` | 清除定时器、取消订阅、关闭连接 |
| `onActivated` | KeepAlive 缓存组件激活时刷新数据 |
| `onDeactivated` | 缓存组件停用时暂停操作 |

---

## 6. 性能优化

### 6.1 组件优化

**使用 `v-once` 渲染静态内容：**
```vue
<template>
  <!-- 纯静态内容只渲染一次 -->
  <footer v-once>
    <p>© 2024 Company Name</p>
  </footer>
</template>
```

**使用 `v-memo` 缓存列表项：**
```vue
<template>
  <div v-for="item in list" :key="item.id" v-memo="[item.selected]">
    <!-- 只有 selected 变化时才重新渲染 -->
    <p>{{ item.name }}</p>
    <p>{{ item.description }}</p>
  </div>
</template>
```

**使用 `shallowRef` 和 `shallowReactive`：**
```typescript
import { shallowRef, shallowReactive } from 'vue'

// 大型对象不需要深度响应式
const largeData = shallowRef({ /* 大量数据 */ })

// 修改时替换整个对象
largeData.value = newData
```

### 6.2 列表优化

```vue
<template>
  <!-- ✅ 始终提供 key，使用唯一标识 -->
  <UserCard 
    v-for="user in users" 
    :key="user.id" 
    :user="user" 
  />
  
  <!-- ❌ 避免使用 index 作为 key（除非列表静态） -->
  <UserCard 
    v-for="(user, index) in users" 
    :key="index" 
    :user="user" 
  />
</template>
```

### 6.3 异步组件

```typescript
import { defineAsyncComponent } from 'vue'

// 基本用法
const AsyncModal = defineAsyncComponent(() => 
  import('./components/Modal.vue')
)

// 带加载状态和错误处理
const AsyncUserList = defineAsyncComponent({
  loader: () => import('./components/UserList.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorDisplay,
  delay: 200,           // 延迟显示 loading（ms）
  timeout: 3000         // 超时时间（ms）
})
```

### 6.4 虚拟列表

```vue
<script setup lang="ts">
import { useVirtualList } from '@vueuse/core'

const { list, containerProps, wrapperProps } = useVirtualList(
  largeList,
  {
    itemHeight: 60,     // 每项高度
    overscan: 10        // 预渲染数量
  }
)
</script>

<template>
  <div v-bind="containerProps" class="h-400px overflow-auto">
    <div v-bind="wrapperProps">
      <div 
        v-for="item in list" 
        :key="item.index"
        class="h-60px"
      >
        {{ item.data }}
      </div>
    </div>
  </div>
</template>
```

### 6.5 构建优化

**Vite 配置优化：**
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'pinia'],
          'ui': ['element-plus'],
          'utils': ['lodash-es', 'dayjs']
        }
      }
    },
    // 压缩选项
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  }
})
```

---

## 7. 最佳实践总结

### 7.1 组件设计原则

1. **单一职责**：每个组件只负责一个功能
2. **Props 向下传递**：数据流单向流动
3. **Events 向上传递**：通过事件与父组件通信
4. **提取可复用逻辑**：使用 Composables
5. **保持组件纯净**：避免副作用在渲染函数中

### 7.2 状态管理原则

1. **优先使用本地状态**：组件内部状态优先
2. **共享状态提升**：需要共享时提升到 Store
3. **避免过度使用 Store**：不是所有数据都需要全局状态
4. **Action 处理异步**：异步操作放在 Store actions 中

### 7.3 性能优化原则

1. **懒加载路由**：减少首屏加载时间
2. **合理使用缓存**：`v-once`、`v-memo`、`KeepAlive`
3. **优化重渲染**：正确使用 `key`，避免不必要的响应式
4. **代码分割**：路由级别和组件级别分割

---

## 8. 相关文档

- [Vue 3 官方文档](https://cn.vuejs.org/)
- [Vue Router 文档](https://router.vuejs.org/zh/)
- [Pinia 文档](https://pinia.vuejs.org/zh/)
- [VueUse 文档](https://vueuse.org/)
