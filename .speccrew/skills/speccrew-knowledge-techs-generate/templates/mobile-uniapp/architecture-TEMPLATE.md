# {{platform_name}} 架构规范

> 平台: {{platform_id}}  
> 生成时间: {{generated_at}}  
> 框架: UniApp (Vue 2/3)

---

## 1. 项目结构

### 1.1 标准目录结构

```
src/
├── components/          # 公共组件
│   ├── common/         # 通用组件
│   └── business/       # 业务组件
├── pages/              # 页面
│   ├── index/          # 首页
│   ├── user/           # 用户相关
│   └── ...
├── static/             # 静态资源
│   ├── images/         # 图片资源
│   ├── icons/          # 图标资源
│   └── fonts/          # 字体文件
├── store/              # 状态管理 (Vuex/Pinia)
│   ├── modules/
│   └── index.js
├── utils/              # 工具函数
│   ├── request.js      # 请求封装
│   ├── storage.js      # 存储封装
│   └── helpers.js      # 辅助函数
├── api/                # API 接口
│   ├── modules/        # 按模块组织
│   └── index.js        # 统一导出
├── mixins/             # 全局混入
├── directives/         # 自定义指令
├── hooks/              # 组合式函数 (Vue 3)
├── config/             # 配置文件
│   ├── index.js        # 环境配置
│   └── constants.js    # 常量定义
├── App.vue             # 应用入口
├── main.js             # 主入口文件
├── manifest.json       # 应用配置
├── pages.json          # 页面路由配置
└── uni.scss            # 全局样式变量
```

### 1.2 条件编译目录

```
src/
├── platform/
│   ├── mp-weixin/      # 微信小程序专属
│   ├── mp-alipay/      # 支付宝小程序专属
│   ├── mp-baidu/       # 百度小程序专属
│   ├── h5/             # H5 专属
│   └── app-plus/       # App 专属
```

---

## 2. 页面架构

### 2.1 页面结构规范

```vue
<template>
  <!-- 页面容器 -->
  <view class="page-{{pageName}}">
    <!-- 导航栏 (如需自定义) -->
    <custom-nav-bar v-if="showCustomNav" :title="pageTitle" />
    
    <!-- 页面内容区 -->
    <view class="page-content">
      <!-- 内容区域 -->
    </view>
    
    <!-- 底部操作区 -->
    <view class="page-footer" v-if="showFooter">
      <!-- 底部按钮等 -->
    </view>
  </view>
</template>

<script>
// 页面逻辑
export default {
  name: 'Page{{PageName}}',
  
  data() {
    return {
      pageTitle: '',
      showCustomNav: false,
      showFooter: false
    }
  },
  
  onLoad(options) {
    // 页面加载
  },
  
  onShow() {
    // 页面显示
  },
  
  onReady() {
    // 页面初次渲染完成
  },
  
  onHide() {
    // 页面隐藏
  },
  
  onUnload() {
    // 页面卸载
  },
  
  // 下拉刷新
  onPullDownRefresh() {
    // 刷新逻辑
  },
  
  // 上拉加载
  onReachBottom() {
    // 加载更多
  },
  
  // 分享
  onShareAppMessage() {
    return {
      title: '分享标题',
      path: '/pages/index/index'
    }
  },
  
  methods: {
    // 方法定义
  }
}
</script>

<style lang="scss" scoped>
.page-{{pageName}} {
  min-height: 100vh;
  background-color: $uni-bg-color-grey;
}
</style>
```

### 2.2 页面生命周期

| 生命周期 | 说明 | 使用场景 |
|---------|------|---------|
| `onLoad` | 页面加载 | 获取页面参数，初始化数据 |
| `onShow` | 页面显示 | 刷新页面数据 |
| `onReady` | 页面初次渲染完成 | DOM 操作 |
| `onHide` | 页面隐藏 | 暂停定时器、视频等 |
| `onUnload` | 页面卸载 | 清理资源 |
| `onPullDownRefresh` | 下拉刷新 | 刷新数据 |
| `onReachBottom` | 上拉加载 | 加载更多数据 |
| `onShareAppMessage` | 分享 | 自定义分享内容 |
| `onPageScroll` | 页面滚动 | 监听滚动位置 |
| `onTabItemTap` | Tab 点击 | Tab 页面切换 |

---

## 3. 组件架构

### 3.1 组件分类

```
components/
├── common/                    # 通用组件
│   ├── uni-list/             # 列表组件
│   ├── uni-card/             # 卡片组件
│   ├── uni-load-more/        # 加载更多
│   └── uni-empty/            # 空状态
├── business/                  # 业务组件
│   ├── product-card/         # 商品卡片
│   ├── order-item/           # 订单项
│   └── user-avatar/          # 用户头像
└── layout/                    # 布局组件
    ├── page-layout/          # 页面布局
    └── grid-layout/          # 网格布局
```

### 3.2 组件设计原则

#### 3.2.1 组件封装规范

```vue
<template>
  <view class="comp-{{componentName}}">
    <!-- 组件内容 -->
  </view>
</template>

<script>
/**
 * {{ComponentName}} 组件
 * @description 组件描述
 * @property {String} title 标题
 * @property {Array} list 列表数据
 * @property {Boolean} loading 加载状态
 * @event {Function} click 点击事件
 * @event {Function} loadMore 加载更多
 * @example <comp-name title="标题" :list="list" @click="handleClick" />
 */
export default {
  name: '{{ComponentName}}',
  
  props: {
    // 标题
    title: {
      type: String,
      default: ''
    },
    // 列表数据
    list: {
      type: Array,
      default: () => []
    },
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    }
  },
  
  data() {
    return {
      // 内部状态
    }
  },
  
  computed: {
    // 计算属性
  },
  
  watch: {
    // 监听器
  },
  
  methods: {
    // 方法
    handleClick(item) {
      this.$emit('click', item)
    }
  }
}
</script>

<style lang="scss" scoped>
.comp-{{componentName}} {
  // 组件样式
}
</style>
```

#### 3.2.2 Props 设计规范

```javascript
props: {
  // 基础类型
  title: String,
  count: Number,
  visible: Boolean,
  
  // 带默认值
  type: {
    type: String,
    default: 'default'
  },
  
  // 对象/数组默认值使用工厂函数
  config: {
    type: Object,
    default: () => ({})
  },
  list: {
    type: Array,
    default: () => []
  },
  
  // 自定义验证
  status: {
    type: String,
    validator(value) {
      return ['pending', 'success', 'error'].includes(value)
    }
  },
  
  // 必填项
  id: {
    type: [String, Number],
    required: true
  }
}
```

---

## 4. 跨平台架构

### 4.1 条件编译

#### 4.1.1 语法格式

```javascript
// #ifdef 平台标识
// 平台特定代码
// #endif

// #ifndef 平台标识
// 非平台特定代码
// #endif
```

#### 4.1.2 平台标识

| 标识 | 平台 |
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

### 4.2 条件编译使用场景

#### 4.2.1 样式条件编译

```scss
/* #ifdef H5 */
.page-container {
  padding-bottom: constant(safe-area-inset-bottom);
  padding-bottom: env(safe-area-inset-bottom);
}
/* #endif */

/* #ifdef MP-WEIXIN */
.page-container {
  padding-bottom: 0;
}
/* #endif */
```

#### 4.2.2 JS 条件编译

```javascript
methods: {
  // 分享功能
  handleShare() {
    // #ifdef MP-WEIXIN
    // 微信小程序分享
    uni.showShareMenu({
      withShareTicket: true
    })
    // #endif
    
    // #ifdef H5
    // H5 分享
    this.showShareModal = true
    // #endif
    
    // #ifdef APP-PLUS
    // App 分享
    uni.share({
      provider: 'weixin',
      type: 0,
      title: '分享标题',
      href: 'https://example.com'
    })
    // #endif
  },
  
  // 获取系统信息
  getSystemInfo() {
    // #ifdef APP-PLUS
    // App 获取设备信息
    const deviceInfo = uni.getDeviceInfo()
    // #endif
    
    // #ifdef MP-WEIXIN
    // 小程序获取系统信息
    const systemInfo = uni.getSystemInfoSync()
    // #endif
  }
}
```

#### 4.2.3 模板条件编译

```vue
<template>
  <view>
    <!-- #ifdef MP-WEIXIN -->
    <button open-type="getPhoneNumber" @getphonenumber="getPhoneNumber">
      微信一键登录
    </button>
    <!-- #endif -->
    
    <!-- #ifdef H5 -->
    <button @click="phoneLogin">
      手机号登录
    </button>
    <!-- #endif -->
    
    <!-- #ifdef APP-PLUS -->
    <button @click="appLogin">
      App 登录
    </button>
    <!-- #endif -->
  </view>
</template>
```

### 4.3 平台适配策略

#### 4.3.1 统一封装适配层

```javascript
// utils/platform.js
export const platform = {
  // 当前平台
  name: uni.getSystemInfoSync().uniPlatform,
  
  // 是否小程序
  isMp: () => {
    // #ifdef MP
    return true
    // #endif
    return false
  },
  
  // 是否 H5
  isH5: () => {
    // #ifdef H5
    return true
    // #endif
    return false
  },
  
  // 是否 App
  isApp: () => {
    // #ifdef APP-PLUS
    return true
    // #endif
    return false
  },
  
  // 导航栏高度
  getNavBarHeight() {
    // #ifdef MP-WEIXIN
    const menuButtonInfo = uni.getMenuButtonBoundingClientRect()
    const systemInfo = uni.getSystemInfoSync()
    return menuButtonInfo.top + menuButtonInfo.height + (menuButtonInfo.top - systemInfo.statusBarHeight)
    // #endif
    
    // #ifdef H5
    return 44
    // #endif
    
    // #ifdef APP-PLUS
    return 44 + uni.getSystemInfoSync().statusBarHeight
    // #endif
  }
}
```

---

## 5. Vue 2/3 选项

### 5.1 Vue 2 选项式 API

```javascript
export default {
  data() {
    return {
      message: 'Hello'
    }
  },
  
  computed: {
    reversedMessage() {
      return this.message.split('').reverse().join('')
    }
  },
  
  watch: {
    message(newVal, oldVal) {
      console.log('Message changed:', oldVal, '->', newVal)
    }
  },
  
  methods: {
    updateMessage() {
      this.message = 'World'
    }
  },
  
  // 生命周期
  created() {},
  mounted() {},
  beforeDestroy() {}
}
```

### 5.2 Vue 3 组合式 API

```vue
<script setup>
import { ref, computed, watch, onMounted } from 'vue'

// 响应式数据
const message = ref('Hello')
const count = ref(0)

// 计算属性
const reversedMessage = computed(() => {
  return message.value.split('').reverse().join('')
})

// 监听器
watch(message, (newVal, oldVal) => {
  console.log('Message changed:', oldVal, '->', newVal)
})

// 方法
const updateMessage = () => {
  message.value = 'World'
}

const increment = () => {
  count.value++
}

// 生命周期
onMounted(() => {
  console.log('Component mounted')
})
</script>
```

### 5.3 Vue 3 组合式函数 (Composables)

```javascript
// hooks/useUser.js
import { ref, computed } from 'vue'

export function useUser() {
  const userInfo = ref(null)
  const loading = ref(false)
  
  const isLogin = computed(() => !!userInfo.value)
  
  const fetchUserInfo = async () => {
    loading.value = true
    try {
      const res = await uni.request({
        url: '/api/user/info'
      })
      userInfo.value = res.data
    } finally {
      loading.value = false
    }
  }
  
  const logout = () => {
    userInfo.value = null
    uni.removeStorageSync('token')
  }
  
  return {
    userInfo,
    loading,
    isLogin,
    fetchUserInfo,
    logout
  }
}

// 页面中使用
<script setup>
import { useUser } from '@/hooks/useUser'

const { userInfo, isLogin, fetchUserInfo, logout } = useUser()
</script>
```

---

## 6. 路由与导航

### 6.1 页面路由配置 (pages.json)

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
        "navigationBarTitleText": "我的",
        "navigationStyle": "custom"
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
            "navigationBarTitleText": "订单列表"
          }
        },
        {
          "path": "detail",
          "style": {
            "navigationBarTitleText": "订单详情"
          }
        }
      ]
    }
  ],
  "tabBar": {
    "list": [
      {
        "pagePath": "pages/index/index",
        "text": "首页",
        "iconPath": "static/tabbar/home.png",
        "selectedIconPath": "static/tabbar/home-active.png"
      },
      {
        "pagePath": "pages/user/index",
        "text": "我的",
        "iconPath": "static/tabbar/user.png",
        "selectedIconPath": "static/tabbar/user-active.png"
      }
    ]
  },
  "globalStyle": {
    "navigationBarTextStyle": "black",
    "navigationBarBackgroundColor": "#F8F8F8"
  }
}
```

### 6.2 导航封装

```javascript
// utils/navigator.js
export const navigator = {
  // 跳转页面
  push(url, params = {}) {
    const queryString = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&')
    const fullUrl = queryString ? `${url}?${queryString}` : url
    
    uni.navigateTo({ url: fullUrl })
  },
  
  // 替换页面
  replace(url) {
    uni.redirectTo({ url })
  },
  
  // 返回
  back(delta = 1) {
    uni.navigateBack({ delta })
  },
  
  // 跳转到 Tab
  switchTab(url) {
    uni.switchTab({ url })
  },
  
  // 重启到某页
  reLaunch(url) {
    uni.reLaunch({ url })
  }
}
```

---

## 7. 性能优化

### 7.1 渲染优化

```javascript
export default {
  data() {
    return {
      list: [],
      page: 1,
      pageSize: 20
    }
  },
  
  methods: {
    // 分页加载
    async loadMore() {
      if (this.loading) return
      
      this.loading = true
      const res = await this.fetchList({
        page: this.page,
        pageSize: this.pageSize
      })
      
      // 使用 concat 而非 push 避免大数组操作
      this.list = this.list.concat(res.data)
      this.page++
      this.loading = false
    },
    
    // 使用虚拟列表 (长列表)
    renderVirtualList(list) {
      // 只渲染可视区域数据
      const visibleCount = 10
      const start = this.scrollTop / this.itemHeight
      const end = start + visibleCount
      
      return list.slice(start, end)
    }
  }
}
```

### 7.2 图片优化

```vue
<template>
  <view>
    <!-- 使用懒加载 -->
    <image 
      v-for="(item, index) in list" 
      :key="index"
      :src="item.image"
      lazy-load
      mode="aspectFill"
      :style="{ width: '200rpx', height: '200rpx' }"
    />
    
    <!-- 使用占位图 -->
    <image 
      :src="imageUrl"
      mode="aspectFit"
      @error="handleImageError"
    />
  </view>
</template>

<script>
export default {
  methods: {
    handleImageError() {
      this.imageUrl = '/static/images/default.png'
    }
  }
}
</script>
```

---

## 8. 架构检查清单

- [ ] 项目结构符合标准目录规范
- [ ] 页面生命周期正确使用
- [ ] 组件 Props 定义完整
- [ ] 条件编译使用恰当
- [ ] 平台适配层封装完善
- [ ] 路由配置合理
- [ ] 分包加载配置正确
- [ ] 性能优化措施到位
