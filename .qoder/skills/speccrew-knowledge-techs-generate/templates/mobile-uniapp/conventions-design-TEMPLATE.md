# {{platform_name}} 设计规范

> 平台: {{platform_id}}  
> 生成时间: {{generated_at}}  
> 框架: UniApp (Vue 2/3)

---

## 1. 设计原则

### 1.1 跨平台一致性原则

- **核心逻辑统一**: 业务逻辑代码保持跨平台一致
- **UI 适配分离**: 平台特定的 UI 通过条件编译分离
- **渐进增强**: 基础功能全平台支持，高级功能渐进增强

```javascript
// ✅ 好的实践：核心逻辑统一
methods: {
  async submitOrder() {
    // 统一的订单提交逻辑
    const orderData = this.buildOrderData()
    
    // #ifdef MP-WEIXIN
    // 微信小程序支付
    await this.wxPay(orderData)
    // #endif
    
    // #ifdef H5
    // H5 支付
    await this.h5Pay(orderData)
    // #endif
    
    // 统一的后续处理
    this.handleOrderSuccess()
  }
}
```

### 1.2 组件化设计原则

- **单一职责**: 每个组件只负责一个功能
- **可复用性**: 设计通用组件，避免重复代码
- **可配置性**: 通过 Props 控制组件行为
- **可扩展性**: 预留插槽和事件接口

```vue
<!-- ✅ 好的实践：可配置的列表组件 -->
<template>
  <view class="list-container">
    <view 
      v-for="(item, index) in data" 
      :key="item[idKey]"
      class="list-item"
      :class="{ 'item-active': activeIndex === index }"
      @click="handleClick(item, index)"
    >
      <!-- 内容插槽 -->
      <slot :item="item" :index="index">
        <text>{{ item[labelKey] }}</text>
      </slot>
    </view>
    
    <!-- 空状态插槽 -->
    <slot v-if="!data.length" name="empty">
      <view class="empty-state">暂无数据</view>
    </slot>
  </view>
</template>

<script>
export default {
  props: {
    data: { type: Array, required: true },
    idKey: { type: String, default: 'id' },
    labelKey: { type: String, default: 'name' },
    activeIndex: { type: Number, default: -1 }
  },
  
  methods: {
    handleClick(item, index) {
      this.$emit('select', item, index)
    }
  }
}
</script>
```

### 1.3 数据驱动原则

- **状态集中管理**: 使用 Vuex/Pinia 管理全局状态
- **单向数据流**: 数据自上而下传递，事件自下而上触发
- **响应式更新**: 利用 Vue 的响应式系统更新视图

---

## 2. 页面设计模式

### 2.1 页面布局模式

#### 2.1.1 标准页面布局

```vue
<template>
  <view class="page-standard">
    <!-- 导航栏 -->
    <custom-navbar :title="title" />
    
    <!-- 内容区 -->
    <scroll-view 
      class="page-content"
      scroll-y
      @scrolltolower="loadMore"
      :refresher-enabled="true"
      :refresher-triggered="refreshing"
      @refresherrefresh="onRefresh"
    >
      <!-- 列表内容 -->
      <view class="content-list">
        <slot />
      </view>
      
      <!-- 加载状态 -->
      <load-more :status="loadStatus" />
    </scroll-view>
    
    <!-- 底部操作区 -->
    <view class="page-footer" v-if="$slots.footer">
      <slot name="footer" />
    </view>
  </view>
</template>
```

#### 2.1.2 Tab 页面布局

```vue
<template>
  <view class="page-tab">
    <!-- Tab 切换 -->
    <view class="tab-header">
      <view 
        v-for="(tab, index) in tabs" 
        :key="index"
        class="tab-item"
        :class="{ active: currentTab === index }"
        @click="switchTab(index)"
      >
        {{ tab.name }}
        <text v-if="tab.badge" class="tab-badge">{{ tab.badge }}</text>
      </view>
    </view>
    
    <!-- Tab 内容 -->
    <swiper 
      class="tab-content"
      :current="currentTab"
      @change="onSwiperChange"
    >
      <swiper-item v-for="(tab, index) in tabs" :key="index">
        <scroll-view scroll-y class="tab-pane">
          <component :is="tab.component" />
        </scroll-view>
      </swiper-item>
    </swiper>
  </view>
</template>
```

### 2.2 页面状态设计

```javascript
export default {
  data() {
    return {
      // 页面状态枚举
      pageStatus: 'loading', // loading | empty | error | success
      
      // 数据状态
      data: null,
      
      // UI 状态
      refreshing: false,
      loadingMore: false,
      
      // 错误信息
      errorMessage: ''
    }
  },
  
  computed: {
    // 根据状态计算显示内容
    showLoading() {
      return this.pageStatus === 'loading'
    },
    showEmpty() {
      return this.pageStatus === 'empty'
    },
    showError() {
      return this.pageStatus === 'error'
    },
    showContent() {
      return this.pageStatus === 'success'
    }
  },
  
  methods: {
    async fetchData() {
      this.pageStatus = 'loading'
      
      try {
        const res = await this.apiCall()
        
        if (res.data && res.data.length > 0) {
          this.data = res.data
          this.pageStatus = 'success'
        } else {
          this.pageStatus = 'empty'
        }
      } catch (error) {
        this.errorMessage = error.message
        this.pageStatus = 'error'
      }
    }
  }
}
```

---

## 3. 组件组合设计

### 3.1 组件层级设计

```
Page (页面)
├── Layout Components (布局组件)
│   ├── Header
│   ├── Content
│   └── Footer
├── Container Components (容器组件)
│   ├── ListContainer
│   ├── FormContainer
│   └── CardContainer
└── Presentational Components (展示组件)
    ├── Button
    ├── Input
    ├── Image
    └── Text
```

### 3.2 容器组件与展示组件分离

#### 3.2.1 容器组件 (Smart Components)

```vue
<!-- UserListContainer.vue -->
<template>
  <view class="user-list-container">
    <search-bar v-model="keyword" @search="handleSearch" />
    
    <user-list 
      :users="filteredUsers"
      :loading="loading"
      @select="handleSelect"
    />
    
    <pagination 
      :current="page"
      :total="total"
      @change="handlePageChange"
    />
  </view>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  data() {
    return {
      keyword: '',
      page: 1
    }
  },
  
  computed: {
    ...mapState('user', ['users', 'loading', 'total']),
    
    filteredUsers() {
      if (!this.keyword) return this.users
      return this.users.filter(user => 
        user.name.includes(this.keyword)
      )
    }
  },
  
  methods: {
    ...mapActions('user', ['fetchUsers']),
    
    handleSearch() {
      this.page = 1
      this.fetchUsers({ keyword: this.keyword, page: 1 })
    },
    
    handlePageChange(page) {
      this.page = page
      this.fetchUsers({ keyword: this.keyword, page })
    },
    
    handleSelect(user) {
      uni.navigateTo({
        url: `/pages/user/detail?id=${user.id}`
      })
    }
  }
}
</script>
```

#### 3.2.2 展示组件 (Dumb Components)

```vue
<!-- UserList.vue -->
<template>
  <view class="user-list">
    <view 
      v-for="user in users" 
      :key="user.id"
      class="user-item"
      @click="$emit('select', user)"
    >
      <image :src="user.avatar" class="user-avatar" />
      <view class="user-info">
        <text class="user-name">{{ user.name }}</text>
        <text class="user-desc">{{ user.description }}</text>
      </view>
    </view>
    
    <view v-if="loading" class="loading-state">
      <loading-spinner />
    </view>
  </view>
</template>

<script>
export default {
  props: {
    users: { type: Array, required: true },
    loading: { type: Boolean, default: false }
  }
}
</script>
```

### 3.3 插槽设计模式

```vue
<!-- Card.vue -->
<template>
  <view class="card">
    <!-- 头部插槽 -->
    <view class="card-header" v-if="$slots.header || title">
      <slot name="header">
        <text class="card-title">{{ title }}</text>
      </slot>
    </view>
    
    <!-- 默认内容插槽 -->
    <view class="card-body">
      <slot />
    </view>
    
    <!-- 底部插槽 -->
    <view class="card-footer" v-if="$slots.footer">
      <slot name="footer" />
    </view>
  </view>
</template>

<script>
export default {
  props: {
    title: String
  }
}
</script>
```

使用示例：

```vue
<template>
  <card title="用户信息">
    <template #header>
      <custom-header title="用户信息" :extra="userCount" />
    </template>
    
    <user-profile :user="currentUser" />
    
    <template #footer>
      <button-group>
        <button @click="edit">编辑</button>
        <button @click="delete">删除</button>
      </button-group>
    </template>
  </card>
</template>
```

---

## 4. 状态管理设计

### 4.1 Vuex 设计模式

```javascript
// store/modules/user.js
const state = {
  userInfo: null,
  token: uni.getStorageSync('token'),
  permissions: []
}

const getters = {
  isLogin: state => !!state.token,
  userId: state => state.userInfo?.id,
  hasPermission: state => permission => {
    return state.permissions.includes(permission)
  }
}

const mutations = {
  SET_USER_INFO(state, userInfo) {
    state.userInfo = userInfo
  },
  SET_TOKEN(state, token) {
    state.token = token
    uni.setStorageSync('token', token)
  },
  CLEAR_USER(state) {
    state.userInfo = null
    state.token = null
    state.permissions = []
    uni.removeStorageSync('token')
  }
}

const actions = {
  // 登录
  async login({ commit }, credentials) {
    const res = await uni.request({
      url: '/api/auth/login',
      method: 'POST',
      data: credentials
    })
    
    commit('SET_TOKEN', res.data.token)
    commit('SET_USER_INFO', res.data.userInfo)
    
    return res.data
  },
  
  // 获取用户信息
  async fetchUserInfo({ commit, state }) {
    if (!state.token) return
    
    const res = await uni.request({
      url: '/api/user/info',
      header: { Authorization: `Bearer ${state.token}` }
    })
    
    commit('SET_USER_INFO', res.data)
  },
  
  // 登出
  logout({ commit }) {
    commit('CLEAR_USER')
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}
```

### 4.2 Pinia 设计模式 (Vue 3)

```javascript
// store/user.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // State
  const userInfo = ref(null)
  const token = ref(uni.getStorageSync('token'))
  const permissions = ref([])
  
  // Getters
  const isLogin = computed(() => !!token.value)
  const userId = computed(() => userInfo.value?.id)
  const hasPermission = (permission) => {
    return permissions.value.includes(permission)
  }
  
  // Actions
  async function login(credentials) {
    const res = await uni.request({
      url: '/api/auth/login',
      method: 'POST',
      data: credentials
    })
    
    token.value = res.data.token
    userInfo.value = res.data.userInfo
    uni.setStorageSync('token', res.data.token)
    
    return res.data
  }
  
  async function fetchUserInfo() {
    if (!token.value) return
    
    const res = await uni.request({
      url: '/api/user/info',
      header: { Authorization: `Bearer ${token.value}` }
    })
    
    userInfo.value = res.data
  }
  
  function logout() {
    userInfo.value = null
    token.value = null
    permissions.value = []
    uni.removeStorageSync('token')
  }
  
  return {
    userInfo,
    token,
    permissions,
    isLogin,
    userId,
    hasPermission,
    login,
    fetchUserInfo,
    logout
  }
})
```

### 4.3 状态管理最佳实践

```javascript
// ✅ 好的实践：模块划分
store/
├── index.js           # Store 入口
├── modules/
│   ├── user.js        # 用户模块
│   ├── order.js       # 订单模块
│   ├── cart.js        # 购物车模块
│   └── product.js     # 商品模块
├── getters.js         # 全局 getters
└── actions.js         # 全局 actions

// ✅ 好的实践：命名规范
// mutations: 大写下划线命名
SET_USER_INFO
ADD_CART_ITEM
REMOVE_CART_ITEM

// actions: 驼峰命名
fetchUserInfo
addCartItem
submitOrder

// getters: 驼峰命名
isLogin
cartTotalPrice
orderList
```

---

## 5. 平台适配设计

### 5.1 响应式布局设计

```scss
// uni.scss 全局变量
$screen-sm: 375px;
$screen-md: 414px;
$screen-lg: 768px;

// rpx 响应式单位
.container {
  padding: 20rpx;
  
  // 大屏适配
  /* #ifdef H5 */
  @media (min-width: 768px) {
    max-width: 750px;
    margin: 0 auto;
  }
  /* #endif */
}

// 安全区域适配
.safe-area-bottom {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
```

### 5.2 平台特定组件设计

```vue
<template>
  <view class="login-button">
    <!-- 微信小程序 -->
    <!-- #ifdef MP-WEIXIN -->
    <button 
      open-type="getPhoneNumber" 
      @getphonenumber="onGetPhoneNumber"
      class="btn-weixin"
    >
      微信一键登录
    </button>
    <!-- #endif -->
    
    <!-- 支付宝小程序 -->
    <!-- #ifdef MP-ALIPAY -->
    <button 
      open-type="getAuthorize" 
      scope="phoneNumber"
      @getAuthorize="onGetPhoneNumber"
      class="btn-alipay"
    >
      支付宝一键登录
    </button>
    <!-- #endif -->
    
    <!-- H5/App -->
    <!-- #ifdef H5 || APP-PLUS -->
    <button @click="phoneLogin" class="btn-phone">
      手机号登录
    </button>
    <!-- #endif -->
  </view>
</template>

<script>
export default {
  methods: {
    // #ifdef MP-WEIXIN
    onGetPhoneNumber(e) {
      if (e.detail.errMsg === 'getPhoneNumber:ok') {
        this.loginWithPhoneCode(e.detail.code)
      }
    },
    // #endif
    
    // #ifdef MP-ALIPAY
    onGetPhoneNumber() {
      my.getPhoneNumber({
        success: (res) => {
          this.loginWithPhoneCode(res.response)
        }
      })
    },
    // #endif
    
    // #ifdef H5 || APP-PLUS
    phoneLogin() {
      uni.navigateTo({ url: '/pages/login/phone' })
    },
    // #endif
    
    async loginWithPhoneCode(code) {
      // 统一的登录处理
    }
  }
}
</script>
```

### 5.3 主题与样式设计

```scss
// uni.scss 主题变量
// 主色调
$uni-primary: #007aff;
$uni-success: #4cd964;
$uni-warning: #f0ad4e;
$uni-error: #dd524d;

// 文字颜色
$uni-text-color: #333;
$uni-text-color-grey: #999;
$uni-text-color-placeholder: #808080;

// 背景颜色
$uni-bg-color: #fff;
$uni-bg-color-grey: #f8f8f8;

// 边框颜色
$uni-border-color: #c8c7cc;

// 使用 CSS 变量支持动态主题
:root {
  --primary-color: #{$uni-primary};
  --text-color: #{$uni-text-color};
}

.page-container {
  color: var(--text-color);
}
```

---

## 6. 错误处理设计

### 6.1 全局错误处理

```javascript
// utils/error-handler.js
export const errorHandler = {
  // 请求错误处理
  handleRequestError(error) {
    const { statusCode, data } = error
    
    switch (statusCode) {
      case 401:
        this.handleAuthError()
        break
      case 403:
        uni.showToast({ title: '没有权限', icon: 'none' })
        break
      case 404:
        uni.showToast({ title: '资源不存在', icon: 'none' })
        break
      case 500:
        uni.showToast({ title: '服务器错误', icon: 'none' })
        break
      default:
        uni.showToast({ title: data?.message || '请求失败', icon: 'none' })
    }
  },
  
  // 认证错误处理
  handleAuthError() {
    uni.showModal({
      title: '提示',
      content: '登录已过期，请重新登录',
      showCancel: false,
      success: () => {
        uni.navigateTo({ url: '/pages/login/index' })
      }
    })
  },
  
  // 业务错误处理
  handleBusinessError(code, message) {
    const errorMap = {
      'ORDER_NOT_FOUND': '订单不存在',
      'INSUFFICIENT_BALANCE': '余额不足',
      'PRODUCT_SOLD_OUT': '商品已售罄'
    }
    
    uni.showToast({
      title: errorMap[code] || message || '操作失败',
      icon: 'none'
    })
  }
}
```

### 6.2 页面级错误边界

```vue
<template>
  <view class="error-boundary">
    <slot v-if="!hasError" />
    
    <view v-else class="error-fallback">
      <image src="/static/images/error.png" class="error-image" />
      <text class="error-title">出错了</text>
      <text class="error-message">{{ errorMessage }}</text>
      <button @click="retry">重试</button>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ErrorBoundary',
  
  data() {
    return {
      hasError: false,
      errorMessage: ''
    }
  },
  
  errorCaptured(err, vm, info) {
    this.hasError = true
    this.errorMessage = err.message || '未知错误'
    
    // 上报错误
    console.error('Error captured:', err, vm, info)
    
    return false // 阻止错误继续传播
  },
  
  methods: {
    retry() {
      this.hasError = false
      this.errorMessage = ''
      this.$emit('retry')
    }
  }
}
</script>
```

---

## 7. 性能设计

### 7.1 懒加载设计

```vue
<template>
  <view class="lazy-list">
    <view 
      v-for="(item, index) in visibleItems" 
      :key="item.id"
      class="list-item"
    >
      <image 
        :src="item.image"
        lazy-load
        mode="aspectFill"
      />
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      items: [],
      visibleCount: 10,
      scrollTop: 0
    }
  },
  
  computed: {
    visibleItems() {
      const start = Math.floor(this.scrollTop / this.itemHeight)
      return this.items.slice(start, start + this.visibleCount)
    }
  },
  
  onPageScroll(e) {
    this.scrollTop = e.scrollTop
  }
}
</script>
```

### 7.2 缓存设计

```javascript
// utils/cache.js
const CACHE_PREFIX = 'app_cache_'
const CACHE_EXPIRE = 5 * 60 * 1000 // 5分钟

export const cache = {
  // 设置缓存
  set(key, data, expire = CACHE_EXPIRE) {
    const cacheData = {
      data,
      expire: Date.now() + expire
    }
    uni.setStorageSync(CACHE_PREFIX + key, cacheData)
  },
  
  // 获取缓存
  get(key) {
    const cacheData = uni.getStorageSync(CACHE_PREFIX + key)
    
    if (!cacheData) return null
    
    // 检查是否过期
    if (Date.now() > cacheData.expire) {
      this.remove(key)
      return null
    }
    
    return cacheData.data
  },
  
  // 移除缓存
  remove(key) {
    uni.removeStorageSync(CACHE_PREFIX + key)
  },
  
  // 清空缓存
  clear() {
    const keys = uni.getStorageInfoSync().keys
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        uni.removeStorageSync(key)
      }
    })
  }
}
```

---

## 8. 设计检查清单

- [ ] 组件职责单一，符合单一职责原则
- [ ] Props 设计合理，有默认值和类型验证
- [ ] 事件命名规范，使用 kebab-case
- [ ] 插槽设计灵活，支持自定义内容
- [ ] 状态管理模块划分清晰
- [ ] 跨平台代码使用条件编译分离
- [ ] 错误处理完善，有降级方案
- [ ] 性能优化考虑到位（懒加载、缓存等）
