# React Native 开发规范

> 平台: {{platform_name}} ({{platform_id}})  
> 生成时间: {{generated_at}}

---

## 1. 文件命名规范

### 1.1 组件文件命名

```
# ✅ PascalCase - 组件文件
src/components/
├── UserProfile.tsx           # 组件文件
├── UserProfile.test.tsx      # 测试文件
├── UserProfile.styles.ts     # 样式文件
└── UserProfile.types.ts      # 类型定义

src/screens/
├── HomeScreen.tsx            # 页面组件
├── ProfileScreen/
│   ├── index.tsx            # 页面入口
│   ├── ProfileScreen.tsx    # 页面组件
│   ├── styles.ts            # 样式
│   └── components/          # 页面私有组件
│       ├── Header.tsx
│       └── Footer.tsx
```

### 1.2 工具文件命名

```
# ✅ camelCase - 工具/配置文件
src/utils/
├── dateUtils.ts             # 日期工具
├── validationUtils.ts       # 验证工具
├── formatters.ts            # 格式化工具
└── constants.ts             # 常量

src/hooks/
├── useAuth.ts               # 认证 Hook
├── useDebounce.ts           # 防抖 Hook
└── useLocalStorage.ts       # 存储 Hook
```

### 1.3 平台特定文件命名

```
# ✅ 使用平台扩展名
src/components/Button/
├── index.ts                 # 通用入口
├── Button.tsx               # 默认实现
├── Button.ios.tsx           # iOS 特定实现
├── Button.android.tsx       # Android 特定实现
├── Button.native.tsx        # 原生平台通用
└── Button.web.tsx           # Web 实现（RN Web）

src/utils/
├── platform.ts              # 通用平台工具
├── platform.ios.ts          # iOS 特定
└── platform.android.ts      # Android 特定
```

### 1.4 测试文件命名

```
# ✅ 测试文件命名规范
__tests__/
├── UserProfile.test.tsx              # 组件测试
├── useAuth.test.ts                   # Hook 测试
├── utils.test.ts                     # 工具函数测试
└── integration/
    └── LoginFlow.test.tsx            # 集成测试

# 或并置模式
src/components/UserProfile/
├── UserProfile.tsx
├── UserProfile.test.tsx              # 同目录测试
└── UserProfile.stories.tsx           # Storybook
```

---

## 2. 平台特定文件扩展名

### 2.1 扩展名优先级

React Native Metro bundler 按以下优先级解析：

```
1. .ios.tsx          # iOS 特定
2. .android.tsx      # Android 特定
3. .native.tsx       # 原生平台（iOS + Android）
4. .tsx              # 通用
```

### 2.2 使用示例

```typescript
// components/DatePicker/index.ts
export { DatePicker } from './DatePicker';

// components/DatePicker/DatePicker.ios.tsx
import DateTimePicker from '@react-native-community/datetimepicker';

export const DatePicker: React.FC<DatePickerProps> = (props) => (
  <DateTimePicker {...props} />
);

// components/DatePicker/DatePicker.android.tsx
import DateTimePicker from '@react-native-community/datetimepicker';

export const DatePicker: React.FC<DatePickerProps> = (props) => (
  <DateTimePicker {...props} display="spinner" />
);

// 使用
import { DatePicker } from './components/DatePicker';
// 自动根据平台加载对应实现
```

### 2.3 平台检测工具

```typescript
// utils/platform.ts
import { Platform } from 'react-native';

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

// 平台特定值
export const platformValue = <T>(values: { ios: T; android: T; default?: T }): T => {
  if (isIOS) return values.ios;
  if (isAndroid) return values.android;
  return values.default ?? values.android;
};

// 使用
const statusBarHeight = platformValue({
  ios: 44,
  android: StatusBar.currentHeight ?? 24,
});
```

---

## 3. 样式组织

### 3.1 StyleSheet 使用规范

```typescript
// ✅ 使用 StyleSheet.create
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});

// ❌ 避免内联样式
<View style={{ flex: 1, padding: 16 }} />

// ✅ 使用 StyleSheet
<View style={styles.container} />
```

### 3.2 样式文件组织

```typescript
// ✅ 分离样式文件（大型组件）
// screens/ProfileScreen/styles.ts
import { StyleSheet } from 'react-native';
import { theme } from '../../theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#fff',
  },
  // ...
});

// screens/ProfileScreen/index.tsx
import { styles } from './styles';

export const ProfileScreen = () => (
  <View style={styles.container}>
    {/* ... */}
  </View>
);
```

### 3.3 主题化样式

```typescript
// ✅ 使用主题变量
// theme/colors.ts
export const colors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  background: '#F2F2F7',
  surface: '#FFFFFF',
  text: '#000000',
  textSecondary: '#8E8E93',
  border: '#C7C7CC',
  error: '#FF3B30',
  success: '#34C759',
};

// theme/spacing.ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// components/Button/styles.ts
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: colors.border,
  },
  text: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### 3.4 响应式样式

```typescript
// utils/responsive.ts
import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375; // 基于 iPhone 8 宽度

export const normalize = (size: number) => {
  const newSize = size * scale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// 使用
const styles = StyleSheet.create({
  title: {
    fontSize: normalize(24),
    marginBottom: normalize(16),
  },
});
```

---

## 4. Import 组织

### 4.1 Import 分组顺序

```typescript
// ✅ Import 分组顺序
// 1. React / React Native 内置
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// 2. 第三方库
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import Animated from 'react-native-reanimated';

// 3. 绝对路径导入（项目内）
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/api/client';
import { theme } from '@/theme';

// 4. 相对路径导入
import { UserAvatar } from './UserAvatar';
import { styles } from './styles';
import type { UserCardProps } from './types';
```

### 4.2 Path Alias 配置

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@screens/*": ["src/screens/*"],
      "@hooks/*": ["src/hooks/*"],
      "@utils/*": ["src/utils/*"],
      "@theme/*": ["src/theme/*"],
      "@api/*": ["src/api/*"],
      "@store/*": ["src/store/*"],
      "@types/*": ["src/types/*"],
      "@assets/*": ["src/assets/*"]
    }
  }
}
```

```javascript
// babel.config.js
module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@hooks': './src/hooks',
          '@utils': './src/utils',
          '@theme': './src/theme',
          '@api': './src/api',
          '@store': './src/store',
          '@types': './src/types',
          '@assets': './src/assets',
        },
      },
    ],
  ],
};
```

### 4.3 Import 类型规范

```typescript
// ✅ 类型导入使用 `type` 关键字
import type { NavigationProp } from '@react-navigation/native';
import type { User, UserRole } from '@types/user';

// ✅ 合并导入
import React, { type FC, type ReactNode, useState } from 'react';

// ✅ 命名空间导入（大量类型时）
import * as UserTypes from '@types/user';
// 使用: UserTypes.User, UserTypes.UserRole
```

---

## 5. 代码风格规范

### 5.1 TypeScript 规范

```typescript
// ✅ 显式定义返回类型（公共 API）
export const formatDate = (date: Date, format?: string): string => {
  // 实现
};

// ✅ 使用 interface 定义对象类型
interface UserProps {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// ✅ 使用 type 定义联合类型
type Status = 'idle' | 'loading' | 'success' | 'error';
type Theme = 'light' | 'dark' | 'system';

// ✅ 使用 enum（需要运行时值时）
enum UserRole {
  Admin = 'admin',
  User = 'user',
  Guest = 'guest',
}

// ✅ 使用 const assertion（不需要运行时对象时）
const USER_ROLES = ['admin', 'user', 'guest'] as const;
type UserRole = typeof USER_ROLES[number];
```

### 5.2 组件定义规范

```typescript
// ✅ FC 类型使用
import type { FC } from 'react';

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export const Button: FC<ButtonProps> = ({ 
  title, 
  onPress, 
  disabled = false,
  variant = 'primary',
}) => {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={disabled}
      style={[styles.button, styles[variant]]}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

// ✅ PropsWithChildren 使用
import type { FC, PropsWithChildren } from 'react';

interface CardProps {
  title?: string;
}

export const Card: FC<PropsWithChildren<CardProps>> = ({ 
  title, 
  children 
}) => {
  return (
    <View style={styles.card}>
      {title && <Text style={styles.title}>{title}</Text>}
      {children}
    </View>
  );
};
```

### 5.3 Hooks 规范

```typescript
// ✅ 自定义 Hook 命名以 use 开头
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
};

// ✅ Hook 参数和返回值类型定义
interface UsePaginationOptions {
  pageSize?: number;
  initialPage?: number;
}

interface UsePaginationResult<T> {
  data: T[];
  page: number;
  totalPages: number;
  nextPage: () => void;
  prevPage: () => void;
}

export const usePagination = <T>(
  items: T[],
  options: UsePaginationOptions = {}
): UsePaginationResult<T> => {
  // 实现
};
```

### 5.4 注释规范

```typescript
/**
 * 用户卡片组件
 * 
 * @example
 * ```tsx
 * <UserCard 
 *   user={{ id: '1', name: '张三', email: 'zhangsan@example.com' }}
 *   onPress={() => navigation.navigate('Profile')}
 * />
 * ```
 */
export const UserCard: FC<UserCardProps> = ({ user, onPress }) => {
  // TODO: 添加头像加载失败处理
  // FIXME: 修复长文本截断问题
  
  return (
    <TouchableOpacity onPress={onPress}>
      {/* 头像区域 */}
      <Avatar uri={user.avatar} />
      
      {/* 用户信息 */}
      <View>
        <Text>{user.name}</Text>
        <Text>{user.email}</Text>
      </View>
    </TouchableOpacity>
  );
};
```

---

## 6. Git 规范

### 6.1 分支命名

```
# ✅ 分支命名规范
feature/RN-123-add-user-profile      # 新功能
bugfix/RN-456-fix-login-crash        # Bug 修复
hotfix/RN-789-critical-payment-fix   # 紧急修复
refactor/RN-321-optimize-navigation  # 重构
docs/RN-654-update-readme            # 文档更新
test/RN-987-add-unit-tests           # 测试
```

### 6.2 Commit Message 规范

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 类型：**
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具链

**示例：**
```
feat(auth): 添加微信登录功能

- 集成微信 SDK
- 添加登录状态管理
- 实现登录页面 UI

Closes #123
```

```
fix(api): 修复请求超时问题

将默认超时时间从 5s 调整为 30s，
解决弱网环境下请求失败的问题。

Fixes #456
```

### 6.3 Commit 最佳实践

```bash
# ✅ 相关改动放同一 commit
# ❌ 避免一个 commit 包含不相关的改动
git add src/features/auth/
git commit -m "feat(auth): 实现用户认证功能"

# ✅ 小步提交
git add src/components/Button.tsx
git commit -m "feat(button): 添加 loading 状态支持"

git add src/components/Button.test.tsx
git commit -m "test(button): 添加 loading 状态测试"
```

### 6.4 PR 规范

```markdown
## 描述
简要描述本次改动的目的和内容

## 改动类型
- [ ] Bug 修复
- [ ] 新功能
- [ ] 破坏性变更
- [ ] 文档更新
- [ ] 性能优化

## 测试
- [ ] 单元测试已添加/更新
- [ ] 手动测试通过
- [ ] E2E 测试通过

## 截图（如适用）
<!-- 添加 UI 改动截图 -->

## 检查清单
- [ ] 代码遵循项目规范
- [ ] 所有测试通过
- [ ] 在 iOS 和 Android 上测试
- [ ] 无控制台警告
```

---

## 7. 项目配置规范

### 7.1 ESLint 配置

```javascript
// .eslintrc.js
module.exports = {
  root: true,
  extends: [
    '@react-native',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'import'],
  rules: {
    // React Native 特定
    'react-native/no-unused-styles': 'error',
    'react-native/split-platform-components': 'warn',
    'react-native/no-inline-styles': 'warn',
    'react-native/no-color-literals': 'off',
    
    // TypeScript
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    
    // React
    'react/prop-types': 'off',
    'react/react-in-jsx-scope': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // Import
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        'newlines-between': 'always',
      },
    ],
  },
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
};
```

### 7.2 Prettier 配置

```javascript
// .prettierrc.js
module.exports = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
  endOfLine: 'lf',
};
```

### 7.3 TypeScript 配置

```json
// tsconfig.json
{
  "extends": "@react-native/typescript-config/tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    },
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*", "index.js", "App.tsx"],
  "exclude": ["node_modules", "android", "ios", "build"]
}
```

### 7.4 Metro 配置

```javascript
// metro.config.js
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

const config = {
  resolver: {
    alias: {
      '@': './src',
    },
    sourceExts: ['js', 'jsx', 'json', 'ts', 'tsx', 'cjs', 'mjs'],
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
```

---

## 8. 目录结构规范

### 8.1 推荐目录结构

```
{{platform_id}}/
├── src/
│   ├── api/                    # API 层
│   │   ├── client.ts          # HTTP 客户端配置
│   │   ├── interceptors.ts    # 请求/响应拦截器
│   │   └── services/          # 业务 API
│   │       ├── auth.ts
│   │       └── user.ts
│   ├── assets/                # 静态资源
│   │   ├── images/
│   │   ├── fonts/
│   │   └── animations/
│   ├── components/            # 公共组件
│   │   ├── atoms/            # 原子组件
│   │   ├── molecules/        # 分子组件
│   │   ├── organisms/        # 有机体组件
│   │   └── templates/        # 模板组件
│   ├── constants/             # 常量
│   │   ├── colors.ts
│   │   ├── config.ts
│   │   └── enums.ts
│   ├── hooks/                 # 自定义 Hooks
│   │   ├── useAuth.ts
│   │   └── useDebounce.ts
│   ├── i18n/                  # 国际化
│   │   ├── index.ts
│   │   ├── en.json
│   │   └── zh.json
│   ├── navigation/            # 导航
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── types.ts
│   ├── screens/               # 页面
│   │   ├── HomeScreen/
│   │   └── ProfileScreen/
│   ├── services/              # 服务层
│   │   ├── storage.ts
│   │   └── notification.ts
│   ├── store/                 # 状态管理
│   │   ├── slices/
│   │   └── index.ts
│   ├── theme/                 # 主题
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   └── typography.ts
│   ├── types/                 # 全局类型
│   │   ├── api.ts
│   │   ├── models.ts
│   │   └── navigation.ts
│   └── utils/                 # 工具函数
│       ├── date.ts
│       ├── formatters.ts
│       └── validators.ts
├── __tests__/                 # 测试
├── android/                   # Android 原生
├── ios/                       # iOS 原生
├── patches/                   # 补丁文件
├── scripts/                   # 脚本
├── .eslintrc.js
├── .prettierrc.js
├── babel.config.js
├── metro.config.js
├── tsconfig.json
├── jest.config.js
├── index.js
└── App.tsx
```

---

*本文档由 DevCrew 自动生成，基于 React Native 开发最佳实践*
