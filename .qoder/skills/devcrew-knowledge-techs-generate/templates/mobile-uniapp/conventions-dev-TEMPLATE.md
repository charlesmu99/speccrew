# {{platform_name}} 开发规范

> 平台: {{platform_id}}  
> 生成时间: {{generated_at}}  
> 框架: UniApp (Vue 2/3)

---

## 1. 文件命名规范

### 1.1 页面文件命名

```
pages/
├── index/                    # 目录使用小写
│   └── index.vue            # 页面文件使用小写
├── user/
│   ├── index.vue            # 列表页
│   ├── profile.vue          # 详情页
│   └── settings.vue         # 设置页
└── order/
    ├── list.vue             # 订单列表
    ├── detail.vue           # 订单详情
    └── confirm.vue          # 订单确认
```

**规范:**
- 目录名：小写，多个单词用连字符 `-` 连接
- 页面文件：小写，与目录名对应
- 子页面：使用语义化名称，如 `list`, `detail`, `edit`

### 1.2 组件文件命名

```
components/
├── common/                   # 通用组件
│   ├── uni-button.vue       # 基础组件：uni-前缀
│   ├── uni-card.vue
│   ├── uni-list.vue
│   └── uni-empty.vue
├── business/                 # 业务组件
│   ├── product-card.vue     # 商品卡片
│   ├── order-item.vue       # 订单项
│   └── user-avatar.vue      # 用户头像
└── layout/                   # 布局组件
    ├── page-layout.vue
    └── tab-layout.vue
```

**规范:**
- 组件名：小写，多个单词用连字符 `-` 连接
- 基础组件：使用 `uni-` 前缀
- 业务组件：使用业务领域前缀，如 `product-`, `order-`, `user-`

### 1.3 其他文件命名

```
src/
├── api/                      # API 接口
│   ├── modules/
│   │   ├── user.js          # 用户相关 API
│   │   ├── order.js         # 订单相关 API
│   │   └── product.js       # 商品相关 API
│   └── index.js             # 统一导出
├── utils/                    # 工具函数
│   ├── request.js           # 请求封装
│   ├── storage.js           # 存储封装
│   ├── validator.js         # 验证工具
│   └── format.js            # 格式化工具
├── mixins/                   # 全局混入
│   ├── global.js            # 全局混入
│   └── share.js             # 分享混入
├── hooks/                    # 组合式函数 (Vue 3)
│   ├── useUser.js           # 用户相关
│   ├── useOrder.js          # 订单相关
│   └── useLoading.js        # 加载状态
└── config/                   # 配置文件
    ├── index.js             # 环境配置
    └── constants.js         # 常量定义
```

**规范:**
- JS 文件：小写，多个单词用连字符 `-` 连接
- Hooks 文件：使用 `use` 前缀，驼峰命名
- 常量文件：使用大写下划线命名

---

## 2. pages.json 配置规范

### 2.1 基础配置

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "首页",
        "navigationBarBackgroundColor": "#ffffff",
        "navigationBarTextStyle": "black",
        "enablePullDownRefresh": true,
        "backgroundColor": "#f5f5f5"
      }
    }
  ],
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarBackgroundColor": "#F8F8F8",
    "backgroundColor": "#F8F8F8"
  }
}
```

### 2.2 分包配置

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "首页"
      }
    },
    {
      "path": "pages/user/index",
      "style": {
        "navigationBarTitleText": "我的"
      }
    }
  ],
  "subPackages": [
    {
      "root": "pages/order",
      "pages": [
        {
          "path": "list",
          "style": {
            "navigationBarTitleText": "订单列表",
            "enablePullDownRefresh": true
          }
        },
        {
          "path": "detail",
          "style": {
            "navigationBarTitleText": "订单详情"
          }
        },
        {
          "path": "confirm",
          "style": {
            "navigationBarTitleText": "确认订单"
          }
        }
      ]
    },
    {
      "root": "pages/product",
      "pages": [
        {
          "path": "list",
          "style": {
            "navigationBarTitleText": "商品列表"
          }
        },
        {
          "path": "detail",
          "style": {
            "navigationBarTitleText": "商品详情"
          }
        }
      ]
    }
  ],
  "preloadRule": {
    "pages/index/index": {
      "network": "all",
      "packages": ["pages/order"]
    }
  }
}
```

### 2.3 TabBar 配置

```json
{
  "tabBar": {
    "color": "#999999",
    "selectedColor": "#007aff",
    "backgroundColor": "#ffffff",
    "borderStyle": "black",
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页",
        "iconPath": "static/tabbar/home.png",
        "selectedIconPath": "static/tabbar/home-active.png"
      },
      {
        "pagePath": "pages/category/index",
        "text": "分类",
        "iconPath": "static/tabbar/category.png",
        "selectedIconPath": "static/tabbar/category-active.png"
      },
      {
        "pagePath": "pages/cart/index",
        "text": "购物车",
        "iconPath": "static/tabbar/cart.png",
        "selectedIconPath": "static/tabbar/cart-active.png"
      },
      {
        "pagePath": "pages/user/index",
        "text": "我的",
        "iconPath": "static/tabbar/user.png",
        "selectedIconPath": "static/tabbar/user-active.png"
      }
    ]
  }
}
```

### 2.4 条件编译配置

```json
{
  "pages": [
    {
      "path": "pages/index/index",
      "style": {
        "navigationBarTitleText": "首页",
        "app-plus": {
          "bounce": "vertical",
          "titleNView": {
            "buttons": [
              {
                "text": "分享",
                "fontSize": "14px"
              }
            ]
          }
        },
        "mp-weixin": {
          "enablePullDownRefresh": true
        },
        "h5": {
          "navigationStyle": "custom"
        }
      }
    }
  ]
}
```

---

## 3. 条件编译规范

### 3.1 条件编译语法

```javascript
// #ifdef 平台标识
// 平台特定代码
// #endif

// #ifndef 平台标识
// 非平台特定代码
// #endif

// #ifdef 平台1 || 平台2
// 多平台代码
// #endif
```

### 3.2 平台标识对照表

| 标识 | 说明 |
|-----|------|
| `H5` | H5 |
| `MP-WEIXIN` | 微信小程序 |
| `MP-ALIPAY` | 支付宝小程序 |
| `MP-BAIDU` | 百度小程序 |
| `MP-TOUTIAO` | 字节跳动小程序 |
| `MP-QQ` | QQ 小程序 |
| `APP-PLUS` | App |
| `APP-PLUS-NVUE` | App nvue |
| `MP` | 所有小程序 |
| `APP` | 所有 App |

### 3.3 条件编译使用规范

#### JS 中的条件编译

```javascript
export default {
  methods: {
    // ✅ 好的实践：将平台特定逻辑封装在方法中
    handleShare() {
      // #ifdef MP-WEIXIN
      this.wxShare()
      // #endif
      
      // #ifdef H5
      this.h5Share()
      // #endif
      
      // #ifdef APP-PLUS
      this.appShare()
      // #endif
    },
    
    // #ifdef MP-WEIXIN
    wxShare() {
      uni.showShareMenu({ withShareTicket: true })
    },
    // #endif
    
    // #ifdef H5
    h5Share() {
      this.showShareModal = true
    },
    // #endif
    
    // #ifdef APP-PLUS
    appShare() {
      uni.share({
        provider: 'weixin',
        type: 0,
        title: '分享标题',
        href: 'https://example.com'
      })
    }
    // #endif
  }
}
```

#### 模板中的条件编译

```vue
<template>
  <view>
    <!-- ✅ 好的实践：平台特定功能使用条件编译 -->
    <!-- #ifdef MP-WEIXIN -->
    <button open-type="contact">联系客服</button>
    <!-- #endif -->
    
    <!-- #ifdef MP-ALIPAY -->
    <contact-button />
    <!-- #endif -->
    
    <!-- #ifdef H5 || APP-PLUS -->
    <button @click="openChat">在线客服</button>
    <!-- #endif -->
  </view>
</template>
```

#### 样式中的条件编译

```scss
/* ✅ 好的实践：平台特定样式使用条件编译 */
.container {
  padding: 20rpx;
  
  /* #ifdef H5 */
  // H5 需要额外处理底部安全区域
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
  /* #endif */
  
  /* #ifdef MP-WEIXIN */
  // 小程序不需要额外处理
  padding-bottom: 0;
  /* #endif */
}

/* #ifdef APP-PLUS */
// App 专用样式
.status-bar {
  height: var(--status-bar-height);
}
/* #endif */
```

---

## 4. Import 组织规范

### 4.1 Import 顺序

```javascript
// 1. 第三方库
import Vue from 'vue'
import { mapState, mapActions } from 'vuex'

// 2. 组件
import CustomNavbar from '@/components/common/uni-navbar.vue'
import ProductCard from '@/components/business/product-card.vue'

// 3. 工具函数
import { request } from '@/utils/request'
import { formatDate } from '@/utils/format'
import { validatePhone } from '@/utils/validator'

// 4. 常量/配置
import { API_BASE_URL } from '@/config'
import { ORDER_STATUS } from '@/config/constants'

// 5. Mixins/Hooks
import shareMixin from '@/mixins/share'
import { useUser } from '@/hooks/useUser'
```

### 4.2 路径别名

```javascript
// jsconfig.json 或 tsconfig.json 配置
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@utils/*": ["src/utils/*"],
      "@api/*": ["src/api/*"],
      "@store/*": ["src/store/*"],
      "@config/*": ["src/config/*"]
    }
  }
}
```

### 4.3 Import 方式

```javascript
// ✅ 好的实践：按需导入
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/user'

// ❌ 避免：全量导入
import Vue from 'vue'
import * as utils from '@/utils'

// ✅ 好的实践：组件异步导入（分包优化）
const HeavyComponent = () => import('@/components/heavy-component.vue')

// ✅ 好的实践：API 统一导出
import { userApi, orderApi, productApi } from '@/api'
```

---

## 5. 代码风格规范

### 5.1 Vue 组件规范

```vue
<template>
  <!-- 模板缩进 2 空格 -->
  <view class="page-container">
    <custom-navbar :title="pageTitle" />
    <view class="content">
      <text class="title">{{ title }}</text>
    </view>
  </view>
</template>

<script>
// 组件名使用大驼峰
export default {
  name: 'UserProfile',
  
  // 组件引用
  components: {
    CustomNavbar
  },
  
  // 混入
  mixins: [shareMixin],
  
  // Props 定义
  props: {
    userId: {
      type: [String, Number],
      required: true
    },
    showAvatar: {
      type: Boolean,
      default: true
    }
  },
  
  // 数据
  data() {
    return {
      userInfo: null,
      loading: false
    }
  },
  
  // 计算属性
  computed: {
    displayName() {
      return this.userInfo?.nickname || this.userInfo?.phone || '未设置'
    }
  },
  
  // 监听器
  watch: {
    userId: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.fetchUserInfo(newVal)
        }
      }
    }
  },
  
  // 生命周期
  onLoad(options) {
    console.log('Page loaded:', options)
  },
  
  onShow() {
    this.refreshData()
  },
  
  // 方法
  methods: {
    async fetchUserInfo(id) {
      this.loading = true
      try {
        const res = await userApi.getUserInfo(id)
        this.userInfo = res.data
      } catch (error) {
        uni.showToast({ title: '获取失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    
    refreshData() {
      // 刷新逻辑
    }
  }
}
</script>

<style lang="scss" scoped>
// 样式使用 SCSS
.page-container {
  min-height: 100vh;
  background-color: $uni-bg-color-grey;
  
  .content {
    padding: 20rpx;
    
    .title {
      font-size: 32rpx;
      color: $uni-text-color;
    }
  }
}
</style>
```

### 5.2 Script Setup 规范 (Vue 3)

```vue
<script setup>
// 1. 导入
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/store/user'
import CustomNavbar from '@/components/common/uni-navbar.vue'

// 2. Props 定义
const props = defineProps({
  userId: {
    type: [String, Number],
    required: true
  },
  showAvatar: {
    type: Boolean,
    default: true
  }
})

// 3. Emits 定义
const emit = defineEmits(['update', 'delete'])

// 4. 响应式数据
const userInfo = ref(null)
const loading = ref(false)

// 5. Store
const userStore = useUserStore()

// 6. 计算属性
const displayName = computed(() => {
  return userInfo.value?.nickname || userInfo.value?.phone || '未设置'
})

// 7. 方法
async function fetchUserInfo(id) {
  loading.value = true
  try {
    const res = await userApi.getUserInfo(id)
    userInfo.value = res.data
  } catch (error) {
    uni.showToast({ title: '获取失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function handleUpdate() {
  emit('update', userInfo.value)
}

// 8. 生命周期
onMounted(() => {
  fetchUserInfo(props.userId)
})
</script>
```

### 5.3 命名规范

```javascript
// 组件名：大驼峰
UserProfile.vue
ProductCard.vue
OrderListItem.vue

// Props：驼峰命名
props: {
  userInfo: Object,
  isLoading: Boolean,
  itemList: Array
}

// 事件名：kebab-case
this.$emit('item-click', item)
this.$emit('update:modelValue', value)

// 方法名：驼峰命名
fetchUserInfo()
handleSubmit()
onRefresh()

// 变量名：驼峰命名
const userList = []
let currentIndex = 0
const isVisible = true

// 常量：大写下划线
const MAX_COUNT = 100
const API_BASE_URL = 'https://api.example.com'
const ORDER_STATUS = {
  PENDING: 0,
  PAID: 1,
  SHIPPED: 2
}
```

---

## 6. Git 提交规范

### 6.1 提交信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 6.2 Type 类型

| 类型 | 说明 |
|-----|------|
| `feat` | 新功能 |
| `fix` | 修复 Bug |
| `docs` | 文档更新 |
| `style` | 代码格式（不影响功能） |
| `refactor` | 代码重构 |
| `perf` | 性能优化 |
| `test` | 测试相关 |
| `chore` | 构建过程或辅助工具的变动 |
| `revert` | 回滚 |

### 6.3 提交示例

```bash
# 功能提交
feat(user): 添加用户登录功能

# Bug 修复
fix(order): 修复订单列表加载失败问题

# 样式调整
style(components): 统一按钮组件样式

# 代码重构
refactor(api): 重构请求封装逻辑

# 性能优化
perf(list): 优化长列表渲染性能

# 文档更新
docs(readme): 更新项目说明文档
```

### 6.4 分支管理

```bash
# 分支命名规范
main              # 主分支
 develop          # 开发分支
 feature/user-login    # 功能分支
 bugfix/order-list     # Bug 修复分支
 hotfix/payment        # 紧急修复分支
 release/v1.0.0        # 发布分支
```

---

## 7. API 请求规范

### 7.1 请求封装

```javascript
// utils/request.js
const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'https://dev-api.example.com' 
  : 'https://api.example.com'

const request = (options) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${uni.getStorageSync('token')}`,
        ...options.header
      },
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data)
        } else if (res.statusCode === 401) {
          // 未授权，跳转登录
          uni.navigateTo({ url: '/pages/login/index' })
          reject(res)
        } else {
          uni.showToast({
            title: res.data.message || '请求失败',
            icon: 'none'
          })
          reject(res)
        }
      },
      fail: (err) => {
        uni.showToast({
          title: '网络错误',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

export default {
  get(url, params = {}) {
    return request({ url, method: 'GET', data: params })
  },
  
  post(url, data = {}) {
    return request({ url, method: 'POST', data })
  },
  
  put(url, data = {}) {
    return request({ url, method: 'PUT', data })
  },
  
  delete(url, params = {}) {
    return request({ url, method: 'DELETE', data: params })
  }
}
```

### 7.2 API 模块组织

```javascript
// api/modules/user.js
import request from '@/utils/request'

export default {
  // 登录
  login(data) {
    return request.post('/api/user/login', data)
  },
  
  // 获取用户信息
  getUserInfo(id) {
    return request.get(`/api/user/${id}`)
  },
  
  // 更新用户信息
  updateUserInfo(id, data) {
    return request.put(`/api/user/${id}`, data)
  },
  
  // 上传头像
  uploadAvatar(filePath) {
    return uni.uploadFile({
      url: `${BASE_URL}/api/user/avatar`,
      filePath,
      name: 'file',
      header: {
        'Authorization': `Bearer ${uni.getStorageSync('token')}`
      }
    })
  }
}

// api/index.js
import user from './modules/user'
import order from './modules/order'
import product from './modules/product'

export const userApi = user
export const orderApi = order
export const productApi = product

export default {
  user,
  order,
  product
}
```

---

## 8. 开发检查清单

### 8.1 代码提交前检查

- [ ] 代码通过 ESLint 检查
- [ ] 代码通过 Prettier 格式化
- [ ] 无 console.log 调试代码（或已注释）
- [ ] 无未使用的变量和导入
- [ ] 组件 Props 有完整定义
- [ ] 条件编译使用正确

### 8.2 功能开发检查

- [ ] 页面路由已在 pages.json 注册
- [ ] 组件文件命名符合规范
- [ ] API 请求已封装
- [ ] 错误处理完善
- [ ] 加载状态处理
- [ ] 空状态处理
- [ ] 跨平台兼容性检查

### 8.3 性能优化检查

- [ ] 图片使用懒加载
- [ ] 长列表使用虚拟列表或分页
- [ ] 大数据使用分包加载
- [ ] 静态资源已压缩
- [ ] 不必要的请求已缓存
