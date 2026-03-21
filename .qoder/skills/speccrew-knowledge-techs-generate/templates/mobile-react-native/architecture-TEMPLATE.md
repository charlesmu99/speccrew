# React Native 架构指南

> 平台: {{platform_name}} ({{platform_id}})  
> 生成时间: {{generated_at}}

---

## 1. 组件架构

### 1.1 组件分类

React Native 应用采用分层组件架构：

```
src/
├── components/          # 可复用UI组件
│   ├── atoms/          # 原子组件（Button, Text, Input）
│   ├── molecules/      # 分子组件（SearchBar, ListItem）
│   ├── organisms/      # 有机体组件（Header, ProductCard）
│   └── templates/      # 模板组件（PageLayout, ListLayout）
├── screens/            # 页面级组件
│   ├── HomeScreen/
│   ├── ProfileScreen/
│   └── SettingsScreen/
└── navigation/         # 导航配置
```

### 1.2 组件设计原则

**原子设计模式**
- **Atoms**: 最小的UI单元，无业务逻辑
  - ✅ `Button`, `Text`, `Icon`, `Input`
  - ❌ 避免包含状态管理

- **Molecules**: 组合原子组件，简单交互
  - ✅ `SearchBar` (Input + Button)
  - ✅ `AvatarWithName` (Image + Text)

- **Organisms**: 复杂UI组件，可包含业务逻辑
  - ✅ `ProductCard`, `CommentList`, `UserProfileHeader`

- **Templates**: 页面布局模板
  - ✅ `ScreenTemplate`, `ListTemplate`, `FormTemplate`

### 1.3 组件实现模式

**函数组件 + Hooks**
```typescript
// ✅ 推荐：函数组件
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface UserCardProps {
  name: string;
  email: string;
  onPress?: () => void;
}

export const UserCard: React.FC<UserCardProps> = ({ 
  name, 
  email, 
  onPress 
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handlePress = useCallback(() => {
    setIsPressed(true);
    onPress?.();
  }, [onPress]);

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.email}>{email}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
});
```

**类组件（仅必要时使用）**
- 需要 Error Boundaries 时
- 需要复杂生命周期管理时

---

## 2. 导航模式

### 2.1 React Navigation 架构

```typescript
// navigation/AppNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// 主导航器
export const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="Detail" component={DetailScreen} />
      <Stack.Screen name="Modal" component={ModalScreen} 
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);

// Tab 导航器
const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        // 图标配置
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);
```

### 2.2 导航类型定义

```typescript
// navigation/types.ts
export type RootStackParamList = {
  MainTabs: undefined;
  Detail: { id: string; title?: string };
  Modal: { data?: unknown };
};

export type TabParamList = {
  Home: undefined;
  Profile: { userId?: string };
  Settings: undefined;
};

// 导航 Props 类型辅助
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
```

### 2.3 导航最佳实践

**屏幕参数传递**
```typescript
// ✅ 类型安全的导航
const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

navigation.navigate('Detail', { id: '123', title: '详情' });

// 接收参数
const route = useRoute<RouteProp<RootStackParamList, 'Detail'>>();
const { id, title } = route.params;
```

**深层链接配置**
```typescript
// navigation/linking.ts
export const linking = {
  prefixes: ['myapp://', 'https://myapp.com'],
  config: {
    screens: {
      MainTabs: {
        screens: {
          Home: 'home',
          Profile: 'profile/:userId',
        },
      },
      Detail: 'detail/:id',
    },
  },
};
```

---

## 3. 项目结构

### 3.1 标准目录结构

```
{{platform_id}}/
├── src/
│   ├── api/                    # API 接口层
│   │   ├── client.ts          # axios/fetch 配置
│   │   ├── interceptors.ts    # 请求/响应拦截器
│   │   └── services/          # 业务 API 服务
│   │       ├── auth.ts
│   │       └── user.ts
│   ├── assets/                # 静态资源
│   │   ├── images/
│   │   ├── fonts/
│   │   └── icons/
│   ├── components/            # 组件库
│   │   ├── atoms/
│   │   ├── molecules/
│   │   ├── organisms/
│   │   └── templates/
│   ├── constants/             # 常量定义
│   │   ├── colors.ts
│   │   ├── fonts.ts
│   │   └── config.ts
│   ├── hooks/                 # 自定义 Hooks
│   │   ├── useAuth.ts
│   │   ├── useApi.ts
│   │   └── useDebounce.ts
│   ├── i18n/                  # 国际化
│   │   ├── en.json
│   │   └── zh.json
│   ├── navigation/            # 导航配置
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── types.ts
│   ├── screens/               # 页面组件
│   │   ├── HomeScreen/
│   │   │   ├── index.tsx
│   │   │   ├── styles.ts
│   │   │   └── components/
│   │   └── ProfileScreen/
│   ├── services/              # 业务服务
│   │   ├── storage.ts         # 本地存储
│   │   └── notification.ts    # 推送通知
│   ├── store/                 # 状态管理
│   │   ├── slices/
│   │   └── index.ts
│   ├── theme/                 # 主题配置
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   └── typography.ts
│   ├── types/                 # 全局类型
│   │   ├── api.ts
│   │   └── models.ts
│   └── utils/                 # 工具函数
│       ├── date.ts
│       ├── validation.ts
│       └── helpers.ts
├── android/                   # Android 原生代码
├── ios/                       # iOS 原生代码
├── __tests__/                 # 测试文件
├── index.js                   # 应用入口
├── App.tsx                    # 根组件
├── metro.config.js            # Metro 配置
├── babel.config.js            # Babel 配置
├── tsconfig.json              # TypeScript 配置
└── package.json
```

### 3.2 模块组织原则

**按功能组织（推荐）**
```
src/
├── features/
│   ├── auth/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── screens/
│   │   └── store/
│   └── products/
│       ├── api/
│       ├── components/
│       ├── screens/
│       └── store/
```

---

## 4. 原生模块集成

### 4.1 原生模块架构

```
android/
├── app/src/main/java/com/{{app_name}}/
│   ├── MainActivity.kt
│   ├── MainApplication.kt
│   └── modules/
│       ├── CalendarModule.kt
│       └── BluetoothModule.kt
└── settings.gradle

ios/
├── {{app_name}}/
│   ├── AppDelegate.mm
│   ├── Info.plist
│   └── Modules/
│       ├── CalendarModule.m
│       ├── CalendarModule.swift
│       └── BluetoothModule.swift
```

### 4.2 TurboModules（新架构）

**原生模块定义**
```typescript
// specs/NativeCalendar.ts
import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface Spec extends TurboModule {
  addEvent(title: string, date: number): Promise<string>;
  getEvents(): Promise<Array<{ title: string; date: number }>>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeCalendar');
```

**Android 实现**
```kotlin
// android/app/src/main/java/com/{{app_name}}/modules/CalendarModule.kt
package com.{{app_name}}.modules

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = NativeCalendar.NAME)
class CalendarModule(reactContext: ReactApplicationContext) : 
  NativeCalendarSpec(reactContext) {
  
  override fun getName() = NAME
  
  override fun addEvent(title: String, date: Double): Promise<String> {
    // 实现代码
  }
  
  companion object {
    const val NAME = "NativeCalendar"
  }
}
```

**iOS 实现**
```objc
// ios/Modules/CalendarModule.mm
#import "NativeCalendar.h"

@interface CalendarModule : NSObject <NativeCalendarSpec>
@end

@implementation CalendarModule

RCT_EXPORT_MODULE(NativeCalendar)

- (void)addEvent:(NSString *)title date:(double)date resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
  // 实现代码
}

@end
```

### 4.3 原生 UI 组件

```typescript
// components/NativeMapView/index.tsx
import { requireNativeComponent, ViewStyle } from 'react-native';

interface NativeMapViewProps {
  style?: ViewStyle;
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  onRegionChange?: (event: { nativeEvent: { region: unknown } }) => void;
}

export const NativeMapView = requireNativeComponent<NativeMapViewProps>('MapView');
```

---

## 5. 平台特定代码

### 5.1 平台文件扩展名

```
src/components/Button/
├── index.ts              # 通用入口
├── Button.tsx            # 默认实现
├── Button.ios.tsx        # iOS 特定实现
├── Button.android.tsx    # Android 特定实现
└── styles.ts             # 通用样式
```

### 5.2 Platform API

```typescript
import { Platform, StyleSheet } from 'react-native';

// 条件渲染
const Component = Platform.OS === 'ios' ? IOSComponent : AndroidComponent;

// 平台特定样式
const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...Platform.select({
      ios: {
        paddingTop: 50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
      },
      android: {
        paddingTop: 30,
        elevation: 4,
      },
    }),
  },
});

// 平台特定值
const STATUSBAR_HEIGHT = Platform.select({
  ios: 44,
  android: StatusBar.currentHeight,
  default: 0,
});
```

### 5.3 Platform 模块

```typescript
// utils/platform.ts
import { Platform, Dimensions, PixelRatio } from 'react-native';

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

export const isTablet = () => {
  const { width, height } = Dimensions.get('window');
  const aspectRatio = height / width;
  return aspectRatio < 1.6;
};

export const getPixelSize = (size: number) => {
  return PixelRatio.getPixelSizeForLayoutSize(size);
};
```

### 5.4 新架构（Fabric + TurboModules）

**启用新架构**
```bash
# Android
./gradlew -PnewArchEnabled=true

# iOS
RCT_NEW_ARCH_ENABLED=1 pod install
```

**Fabric 组件**
```typescript
// 使用 Fabric 渲染的组件
import { View } from 'react-native';

// 自动使用新架构（如果启用）
const FabricComponent = () => (
  <View style={{ flex: 1 }}>
    {/* 组件内容 */}
  </View>
);
```

---

## 6. 性能架构

### 6.1 渲染优化

```typescript
// ✅ 使用 React.memo 避免不必要渲染
export const ListItem = React.memo<ListItemProps>(({ item, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{item.title}</Text>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  return prevProps.item.id === nextProps.item.id;
});

// ✅ 使用 useMemo 缓存计算
const sortedData = useMemo(() => {
  return data.sort((a, b) => b.date - a.date);
}, [data]);

// ✅ 使用 useCallback 缓存回调
const handlePress = useCallback((id: string) => {
  navigation.navigate('Detail', { id });
}, [navigation]);
```

### 6.2 列表优化

```typescript
// ✅ FlatList 优化
<FlatList
  data={items}
  keyExtractor={(item) => item.id}
  renderItem={renderItem}
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={5}
  removeClippedSubviews={true}
  updateCellsBatchingPeriod={50}
/>
```

---

## 7. 应用生命周期

### 7.1 AppState 管理

```typescript
import { AppState, AppStateStatus } from 'react-native';

export const useAppState = () => {
  const [appState, setAppState] = useState<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      setAppState(nextAppState);
      
      if (nextAppState === 'background') {
        // 应用进入后台
      } else if (nextAppState === 'active') {
        // 应用进入前台
      }
    });

    return () => subscription.remove();
  }, []);

  return appState;
};
```

### 7.2 内存警告处理

```typescript
import { NativeEventEmitter, NativeModules } from 'react-native';

export const useMemoryWarning = (callback: () => void) => {
  useEffect(() => {
    const { AppState } = NativeModules;
    const eventEmitter = new NativeEventEmitter(AppState);
    
    const subscription = eventEmitter.addListener(
      'memoryWarning',
      callback
    );

    return () => subscription.remove();
  }, [callback]);
};
```

---

*本文档由 DevCrew 自动生成，基于 React Native 最佳实践*
