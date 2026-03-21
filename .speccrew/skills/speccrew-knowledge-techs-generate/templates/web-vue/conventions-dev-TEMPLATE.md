# 开发规范 - {{platform_name}}

> 平台: {{platform_id}}  
> 生成时间: {{generated_at}}  
> 框架: Vue.js

---

## 1. 文件命名规范

### 1.1 组件文件命名

**使用 PascalCase**

```
✅ 推荐：
components/
├── UserProfile.vue
├── OrderList.vue
├── BaseButton.vue
└── TheHeader.vue          # 单例组件前缀 The-

❌ 避免：
components/
├── user-profile.vue       # kebab-case
├── userProfile.vue        # camelCase
├── order_list.vue         # snake_case
└── header.vue             // 太通用
```

**基础组件命名**

```
components/base/
├── BaseButton.vue         # 基础按钮
├── BaseInput.vue          # 基础输入框
├── BaseModal.vue          # 基础弹窗
├── BaseTable.vue          # 基础表格
└── BaseIcon.vue           # 基础图标
```

**单例组件命名**

```
components/layout/
├── TheHeader.vue          # 顶部导航（整个应用只有一个）
├── TheSidebar.vue         # 侧边栏（整个应用只有一个）
├── TheFooter.vue          # 页脚（整个应用只有一个）
└── TheNavbar.vue          # 导航栏（整个应用只有一个）
```

### 1.2 其他文件命名

```
composables/
├── useAuth.ts             # camelCase
├── useUser.ts
├── useForm.ts
└── useLocalStorage.ts

stores/
├── user.ts                # camelCase
├── app.ts
└── settings.ts

utils/
├── format.ts              # camelCase
├── validator.ts
├── cache.ts
└── index.ts               # 导出文件

api/
├── request.ts             # 请求配置
├── modules/
│   ├── user.ts            # 用户相关 API
│   ├── order.ts           # 订单相关 API
│   └── auth.ts            # 认证相关 API
└── types.ts               # API 类型定义

types/
├── api.ts                 # API 类型
├── components.ts          # 组件类型
├── global.d.ts            # 全局类型声明
└── env.d.ts               # 环境变量类型
```

### 1.3 目录命名

```
src/
├── components/            # 复数形式
├── composables/           # 复数形式
├── stores/                # 复数形式
├── utils/                 # 复数形式
├── types/                 # 复数形式
├── api/                   # 复数形式
├── assets/                # 复数形式
├── views/                 # 复数形式
├── router/                # 单数形式（特定）
└── store/                 # ❌ 避免，使用 stores/
```

---

## 2. 组件选项顺序

### 2.1 `<script setup>` 顺序

```vue
<script setup lang="ts">
/**
 * 1. 导入语句（按类型分组）
 */
// Vue 内置
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// 第三方库
import { useDebounceFn } from '@vueuse/core'
import { ElMessage } from 'element-plus'

// 项目内部
import { useUserStore } from '@/stores/modules/user'
import { fetchUserApi } from '@/api/modules/user'
import BaseButton from '@/components/base/BaseButton.vue'
import type { User, UserFormData } from '@/types'

/**
 * 2. 类型定义（如果需要）
 */
interface Props {
  userId: string
  editable?: boolean
}

interface Emits {
  (e: 'update', user: User): void
  (e: 'delete', id: string): void
}

/**
 * 3. Props 定义
 */
const props = withDefaults(defineProps<Props>(), {
  editable: false
})

/**
 * 4. Emits 定义
 */
const emit = defineEmits<Emits>()

/**
 * 5. 注入（inject）
 */
const theme = inject('theme', 'light')

/**
 * 6. 状态定义（按类型分组）
 */
// Refs
const user = ref<User | null>(null)
const loading = ref(false)
const error = ref<Error | null>(null)
const formData = ref<UserFormData>({
  name: '',
  email: ''
})

// Reactive（复杂对象）
const state = reactive({
  isEditing: false,
  hasChanges: false
})

/**
 * 7. Store 和 Router
 */
const userStore = useUserStore()
const route = useRoute()
const router = useRouter()

/**
 * 8. Computed
 */
const userName = computed(() => user.value?.name || 'Unknown')
const isValid = computed(() => formData.value.name.length > 0)

/**
 * 9. Watch
 */
watch(
  () => props.userId,
  (newId) => {
    if (newId) {
      fetchUser(newId)
    }
  },
  { immediate: true }
)

/**
 * 10. 方法定义
 */
async function fetchUser(id: string) {
  loading.value = true
  try {
    user.value = await fetchUserApi(id)
  } catch (e) {
    error.value = e as Error
    ElMessage.error('获取用户失败')
  } finally {
    loading.value = false
  }
}

function handleSave() {
  if (!isValid.value) return
  emit('update', { ...user.value, ...formData.value })
}

const debouncedSearch = useDebounceFn((query: string) => {
  // 搜索逻辑
}, 300)

/**
 * 11. 生命周期钩子
 */
onMounted(() => {
  console.log('Component mounted')
})

onUnmounted(() => {
  // 清理工作
})

/**
 * 12. 暴露给父组件（如果需要）
 */
defineExpose({
  refresh: fetchUser,
  reset: () => { formData.value = { name: '', email: '' } }
})
</script>
```

### 2.2 Options API 顺序（遗留代码）

```vue
<script lang="ts">
export default {
  name: 'UserProfile',
  
  // 1. 元数据
  components: {
    BaseButton,
    UserAvatar
  },
  
  // 2. 注入
  inject: ['theme'],
  
  // 3. Props
  props: {
    userId: {
      type: String,
      required: true
    }
  },
  
  // 4. Emits
  emits: ['update', 'delete'],
  
  // 5. 组合式（Composition）
  setup() {
    // setup 逻辑
  },
  
  // 6. 数据
  data() {
    return {
      user: null,
      loading: false
    }
  },
  
  // 7. Computed
  computed: {
    userName() {
      return this.user?.name || 'Unknown'
    }
  },
  
  // 8. Watch
  watch: {
    userId(newId) {
      this.fetchUser(newId)
    }
  },
  
  // 9. 生命周期（按顺序）
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  beforeUnmount() {},
  unmounted() {},
  
  // 10. 方法
  methods: {
    async fetchUser(id: string) {
      // ...
    },
    handleSave() {
      // ...
    }
  }
}
</script>
```

---

## 3. Script Setup vs Options API

### 3.1 使用指南

**优先使用 `<script setup>`：**

```vue
<!-- ✅ 新项目/新组件使用 script setup -->
<script setup lang="ts">
import { ref, computed } from 'vue'

const count = ref(0)
const double = computed(() => count.value * 2)

function increment() {
  count.value++
}
</script>
```

**Options API 使用场景：**

```vue
<!-- ⚠️ 以下情况可考虑 Options API -->
<script lang="ts">
export default {
  name: 'LegacyComponent',
  
  // 1. 需要自定义选项（如 inheritAttrs）
  inheritAttrs: false,
  
  // 2. 需要复杂的选项合并策略
  mixins: [someMixin],
  
  // 3. 遗留项目维护（保持一致性）
  // 4. 团队熟悉度考虑
}
</script>
```

### 3.2 对比示例

**Composition API (`<script setup>`):**

```vue
<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useUserStore } from '@/stores/modules/user'

// Props
interface Props {
  userId: string
}
const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  update: [user: User]
}>()

// State
const user = ref<User | null>(null)
const loading = ref(false)

// Store
const userStore = useUserStore()

// Computed
const fullName = computed(() => 
  `${user.value?.firstName} ${user.value?.lastName}`
)

// Watch
watch(() => props.userId, fetchUser, { immediate: true })

// Methods
async function fetchUser(id: string) {
  loading.value = true
  user.value = await userStore.fetchUser(id)
  loading.value = false
}

function handleUpdate() {
  emit('update', user.value!)
}

// Lifecycle
onMounted(() => {
  console.log('Mounted')
})
</script>
```

**Options API:**

```vue
<script lang="ts">
export default {
  name: 'UserCard',
  
  props: {
    userId: {
      type: String,
      required: true
    }
  },
  
  emits: ['update'],
  
  data() {
    return {
      user: null as User | null,
      loading: false
    }
  },
  
  computed: {
    fullName() {
      return `${this.user?.firstName} ${this.user?.lastName}`
    }
  },
  
  watch: {
    userId: {
      immediate: true,
      handler: 'fetchUser'
    }
  },
  
  mounted() {
    console.log('Mounted')
  },
  
  methods: {
    async fetchUser(id: string) {
      this.loading = true
      this.user = await useUserStore().fetchUser(id)
      this.loading = false
    },
    
    handleUpdate() {
      this.$emit('update', this.user)
    }
  }
}
</script>
```

---

## 4. ESLint Vue 规则

### 4.1 推荐配置

```javascript
// .eslintrc.cjs
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    '@vue/eslint-config-typescript/recommended',
    '@vue/eslint-config-prettier'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser',
    sourceType: 'module'
  },
  plugins: ['vue', '@typescript-eslint'],
  rules: {
    // Vue 特定规则
    'vue/multi-word-component-names': 'off',           // 允许单名单词组件
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    'vue/component-definition-name-casing': ['error', 'PascalCase'],
    'vue/custom-event-name-casing': ['error', 'camelCase'],
    'vue/prop-name-casing': ['error', 'camelCase'],
    'vue/attribute-hyphenation': ['error', 'always'],
    'vue/v-on-event-hyphenation': ['error', 'always', { autofix: true }],
    
    // 组件顺序
    'vue/order-in-components': ['error', {
      order: [
        'name',
        'components',
        'props',
        'emits',
        'setup',
        'data',
        'computed',
        'watch',
        'methods',
        'lifecycle_hooks'
      ]
    }],
    
    // 属性顺序
    'vue/attributes-order': ['error', {
      order: [
        'DEFINITION',
        'LIST_RENDERING',
        'CONDITIONALS',
        'RENDER_MODIFIERS',
        'GLOBAL',
        'UNIQUE',
        'TWO_WAY_BINDING',
        'OTHER_DIRECTIVES',
        'OTHER_ATTR',
        'EVENTS',
        'CONTENT'
      ]
    }],
    
    // 模板规则
    'vue/html-self-closing': ['error', {
      html: { void: 'always', normal: 'never', component: 'always' },
      svg: 'always',
      math: 'always'
    }],
    'vue/html-closing-bracket-newline': ['error', {
      singleline: 'never',
      multiline: 'always'
    }],
    'vue/max-attributes-per-line': ['error', {
      singleline: 3,
      multiline: 1
    }],
    'vue/singleline-html-element-content-newline': 'off',
    'vue/multiline-html-element-content-newline': 'off',
    
    // TypeScript 规则
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    
    // 通用规则
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'prefer-const': 'error',
    'no-var': 'error'
  }
}
```

### 4.2 常用规则说明

| 规则 | 说明 | 推荐值 |
|------|------|--------|
| `vue/multi-word-component-names` | 组件名必须多单词 | `off`（允许单名单词） |
| `vue/component-name-in-template-casing` | 模板中组件名大小写 | `PascalCase` |
| `vue/attributes-order` | 属性排序 | 见配置 |
| `vue/order-in-components` | 组件选项排序 | 见配置 |
| `vue/max-attributes-per-line` | 每行最大属性数 | `3` |
| `vue/html-self-closing` | 自闭合标签 | 见配置 |

### 4.3 属性顺序详解

```vue
<!-- ✅ 正确的属性顺序 -->
<template>
  <MyComponent
    v-if="visible"                    <!-- CONDITIONALS -->
    v-for="item in items"             <!-- LIST_RENDERING -->
    v-show="isActive"                 <!-- CONDITIONALS -->
    :key="item.id"                    <!-- UNIQUE -->
    v-model="value"                   <!-- TWO_WAY_BINDING -->
    v-custom-directive                 <!-- OTHER_DIRECTIVES -->
    :prop="value"                     <!-- OTHER_ATTR -->
    @click="handleClick"              <!-- EVENTS -->
  >
    {{ content }}                      <!-- CONTENT -->
  </MyComponent>
</template>
```

---

## 5. Git 提交规范

### 5.1 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

**示例：**

```
feat(user): 添加用户登录功能

- 实现登录表单验证
- 集成 JWT Token 认证
- 添加登录状态持久化

Closes #123
```

### 5.2 Type 类型

| 类型 | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(auth): 添加 OAuth 登录` |
| `fix` | 修复 Bug | `fix(user): 修复头像显示问题` |
| `docs` | 文档更新 | `docs(readme): 更新安装说明` |
| `style` | 代码格式 | `style(eslint): 修复缩进` |
| `refactor` | 重构 | `refactor(api): 优化请求拦截器` |
| `perf` | 性能优化 | `perf(list): 优化大数据列表渲染` |
| `test` | 测试相关 | `test(user): 添加用户模块测试` |
| `chore` | 构建/工具 | `chore(deps): 更新依赖` |
| `revert` | 回滚 | `revert: 回滚登录功能` |

### 5.3 Scope 范围

```
feat(components): 添加新组件
fix(stores): 修复状态管理问题
docs(api): 更新 API 文档
style(views): 调整页面样式
refactor(composables): 重构 useAuth
perf(router): 优化路由懒加载
test(utils): 添加工具函数测试
chore(build): 更新构建配置
```

### 5.4 Subject 规范

- 使用祈使句，现在时（"添加" 而非 "添加了"）
- 首字母小写
- 结尾不加句号
- 不超过 50 个字符

```
✅ feat(user): 添加用户登录功能
✅ fix(api): 修复请求超时问题

❌ feat(user): 添加了用户登录功能。
❌ feat(user): Added user login feature
```

### 5.5 Vue 项目特定提交示例

```bash
# 组件相关
feat(components): 添加 BaseTable 组件
fix(components): 修复 BaseModal 关闭动画
style(components): 调整 Button 组件间距

# 视图相关
feat(views): 添加用户详情页面
fix(views): 修复首页加载缓慢问题
refactor(views): 重构登录页面逻辑

# Store 相关
feat(stores): 添加购物车状态管理
fix(stores): 修复 Pinia 持久化问题

# Composables 相关
feat(composables): 添加 usePagination
refactor(composables): 优化 useAuth 逻辑

# API 相关
feat(api): 添加用户相关接口
fix(api): 修复请求拦截器错误处理

# 路由相关
feat(router): 添加路由守卫
fix(router): 修复动态路由加载问题

# 样式相关
feat(styles): 添加主题变量
style(styles): 统一按钮样式

# 配置相关
chore(config): 更新 Vite 配置
chore(deps): 升级 Vue 到 3.4
```

---

## 6. 代码风格规范

### 6.1 模板格式

```vue
<!-- ✅ 推荐格式 -->
<template>
  <div class="user-card">
    <img 
      :src="user.avatar" 
      :alt="user.name"
      class="avatar"
    />
    <div class="info">
      <h3 class="name">{{ user.name }}</h3>
      <p class="email">{{ user.email }}</p>
    </div>
    <BaseButton @click="handleEdit">
      编辑
    </BaseButton>
  </div>
</template>

<!-- ❌ 避免 -->
<template><div class="user-card"><img :src="user.avatar" :alt="user.name" class="avatar" /><div class="info"><h3 class="name">{{ user.name }}</h3><p class="email">{{ user.email }}</p></div><BaseButton @click="handleEdit">编辑</BaseButton></div></template>
```

### 6.2 样式规范

```vue
<style scoped lang="scss">
// ✅ 使用 scoped 样式
.user-card {
  display: flex;
  align-items: center;
  padding: 16px;
  
  // 嵌套选择器
  .avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
  }
  
  .info {
    flex: 1;
    margin-left: 12px;
    
    .name {
      font-size: 16px;
      font-weight: 500;
    }
    
    .email {
      font-size: 14px;
      color: var(--text-secondary);
    }
  }
}

// ✅ 深度选择器（修改子组件样式）
:deep(.el-input__inner) {
  border-radius: 8px;
}

// ✅ 全局样式（谨慎使用）
:global(.custom-class) {
  color: red;
}
</style>
```

### 6.3 TypeScript 规范

```typescript
// ✅ 使用类型别名定义 Props
interface UserCardProps {
  user: User
  editable?: boolean
  size?: 'small' | 'medium' | 'large'
}

// ✅ 使用泛型
function useList<T>(items: Ref<T[]>) {
  return {
    first: computed(() => items.value[0]),
    last: computed(() => items.value[items.value.length - 1])
  }
}

// ✅ 明确的返回类型
async function fetchUser(id: string): Promise<User> {
  const res = await api.get<User>(`/users/${id}`)
  return res.data
}

// ✅ 使用 satisfies 操作符
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000
} satisfies AppConfig

// ✅ 使用类型守卫
function isUser(obj: unknown): obj is User {
  return obj && typeof (obj as User).id === 'string'
}
```

---

## 7. 代码审查清单

### 7.1 提交前自检

- [ ] 代码通过 ESLint 检查（无错误，警告已处理）
- [ ] TypeScript 类型检查通过
- [ ] 组件命名符合 PascalCase 规范
- [ ] Props 类型定义完整
- [ ] 事件命名符合规范
- [ ] 无 console.log 调试代码（生产环境）
- [ ] 无未使用的导入和变量
- [ ] 代码格式化符合 Prettier 配置

### 7.2 代码审查要点

**Vue 特定：**
- [ ] 使用 `<script setup>` 而非 Options API（新项目）
- [ ] Props 使用 TypeScript 接口定义
- [ ] 事件使用类型安全的 defineEmits
- [ ] 复杂逻辑提取到 Composables
- [ ] 避免在模板中写复杂表达式
- [ ] 正确使用 v-for 的 key

**性能：**
- [ ] 大型列表使用虚拟滚动
- [ ] 路由组件使用懒加载
- [ ] 适当使用 computed 缓存计算
- [ ] 避免不必要的响应式转换

**可维护性：**
- [ ] 组件职责单一
- [ ] 代码注释清晰
- [ ] 命名具有描述性
- [ ] 避免魔法数字和字符串

---

## 8. 相关文档

- [Vue 3 风格指南](https://cn.vuejs.org/style-guide/)
- [Vue ESLint Plugin](https://eslint.vuejs.org/)
- [Conventional Commits](https://www.conventionalcommits.org/zh-hans/v1.0.0/)
