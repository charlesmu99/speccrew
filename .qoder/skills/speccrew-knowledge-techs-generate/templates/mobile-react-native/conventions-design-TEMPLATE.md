# React Native 设计规范

> 平台: {{platform_name}} ({{platform_id}})  
> 生成时间: {{generated_at}}

---

## 1. 组件设计模式

### 1.1 组件设计原则

**单一职责原则 (SRP)**
```typescript
// ✅ 好的设计：每个组件只做一件事
// components/UserAvatar.tsx
export const UserAvatar: React.FC<{ userId: string; size?: number }> = ({ 
  userId, 
  size = 40 
}) => {
  const { data: user } = useUser(userId);
  return (
    <Image 
      source={{ uri: user?.avatar }} 
      style={{ width: size, height: size, borderRadius: size / 2 }}
    />
  );
};

// ✅ 组合使用
// components/UserCard.tsx
export const UserCard: React.FC<{ userId: string }> = ({ userId }) => {
  const { data: user } = useUser(userId);
  return (
    <View style={styles.card}>
      <UserAvatar userId={userId} size={60} />
      <Text style={styles.name}>{user?.name}</Text>
      <UserStats userId={userId} />
    </View>
  );
};
```

**开闭原则 (OCP)**
```typescript
// ✅ 通过 props 扩展，而非修改
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  // ... 其他通用 props
}

// 新增变体时无需修改组件内部
<Button variant="primary" size="lg" leftIcon={<Icon name="add" />} />
```

### 1.2 容器/展示组件模式

```typescript
// ✅ 容器组件：处理数据和业务逻辑
// screens/UserProfileScreen.tsx
export const UserProfileScreen: React.FC = () => {
  const { userId } = useRoute<RouteProp<ParamList, 'Profile'>>().params;
  const { data: user, isLoading } = useUser(userId);
  const updateMutation = useUpdateUser();

  const handleUpdate = async (values: UserFormValues) => {
    await updateMutation.mutateAsync({ id: userId, ...values });
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <UserProfileView 
      user={user} 
      onUpdate={handleUpdate}
      isUpdating={updateMutation.isPending}
    />
  );
};

// ✅ 展示组件：纯UI渲染
// components/UserProfileView.tsx
interface UserProfileViewProps {
  user: User;
  onUpdate: (values: UserFormValues) => Promise<void>;
  isUpdating: boolean;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  user,
  onUpdate,
  isUpdating,
}) => {
  return (
    <ScrollView style={styles.container}>
      <UserAvatar uri={user.avatar} size={120} />
      <UserForm 
        initialValues={user} 
        onSubmit={onUpdate}
        isSubmitting={isUpdating}
      />
    </ScrollView>
  );
};
```

### 1.3 复合组件模式

```typescript
// ✅ 使用 Context 实现复合组件
// components/Form/Form.tsx
const FormContext = React.createContext<FormContextValue | null>(null);

export const Form: React.FC<FormProps> & {
  Field: typeof FormField;
  Submit: typeof FormSubmit;
} = ({ children, onSubmit, validationSchema }) => {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});

  return (
    <FormContext.Provider value={{ values, setValues, errors, setErrors }}>
      {children}
    </FormContext.Provider>
  );
};

const FormField: React.FC<FieldProps> = ({ name, label, ...props }) => {
  const context = useContext(FormContext);
  // 实现...
  return (
    <View>
      <Text>{label}</Text>
      <TextInput {...props} />
      {context?.errors[name] && <ErrorText>{context.errors[name]}</ErrorText>}
    </View>
  );
};

const FormSubmit: React.FC<SubmitProps> = ({ children }) => {
  const context = useContext(FormContext);
  return (
    <Button onPress={context?.handleSubmit}>
      {children}
    </Button>
  );
};

Form.Field = FormField;
Form.Submit = FormSubmit;

// 使用
<Form onSubmit={handleSubmit} validationSchema={schema}>
  <Form.Field name="email" label="邮箱" keyboardType="email-address" />
  <Form.Field name="password" label="密码" secureTextEntry />
  <Form.Submit>提交</Form.Submit>
</Form>
```

### 1.4 Render Props 模式

```typescript
// ✅ 使用 render props 实现灵活布局
// components/DataList.tsx
interface DataListProps<T> {
  data: T[];
  keyExtractor: (item: T) => string;
  renderItem: (item: T, index: number) => React.ReactNode;
  renderEmpty?: () => React.ReactNode;
  renderHeader?: () => React.ReactNode;
  renderFooter?: () => React.ReactNode;
}

export function DataList<T>({
  data,
  keyExtractor,
  renderItem,
  renderEmpty,
  renderHeader,
  renderFooter,
}: DataListProps<T>) {
  if (data.length === 0 && renderEmpty) {
    return <>{renderEmpty()}</>;
  }

  return (
    <FlatList
      data={data}
      keyExtractor={keyExtractor}
      renderItem={({ item, index }) => renderItem(item, index)}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
    />
  );
}

// 使用
<DataList
  data={users}
  keyExtractor={(user) => user.id}
  renderItem={(user) => <UserCard user={user} />}
  renderEmpty={() => <EmptyState message="暂无用户" />}
/>
```

---

## 2. 平台特定 UI 处理

### 2.1 平台适配策略

```typescript
// ✅ 平台特定样式
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  button: {
    paddingVertical: Platform.select({ ios: 12, android: 8 }),
    paddingHorizontal: 16,
  },
});
```

### 2.2 Safe Area 处理

```typescript
// ✅ 使用 SafeAreaView
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// 方式1：包裹整个应用
export const App = () => (
  <SafeAreaProvider>
    <SafeAreaView style={{ flex: 1 }}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaView>
  </SafeAreaProvider>
);

// 方式2：使用 hooks 获取 insets
export const Screen = () => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={{ 
      flex: 1, 
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
    }}>
      {/* 内容 */}
    </View>
  );
};
```

### 2.3 状态栏处理

```typescript
import { StatusBar, StatusBarStyle } from 'react-native';

interface StatusBarConfigProps {
  barStyle?: StatusBarStyle;
  backgroundColor?: string;
  translucent?: boolean;
}

export const StatusBarConfig: React.FC<StatusBarConfigProps> = ({
  barStyle = 'dark-content',
  backgroundColor = '#fff',
  translucent = false,
}) => {
  return (
    <StatusBar
      barStyle={barStyle}
      backgroundColor={backgroundColor}
      translucent={translucent}
    />
  );
};

// 每个屏幕独立控制
export const HomeScreen = () => (
  <>
    <StatusBarConfig barStyle="light-content" backgroundColor="#007AFF" />
    {/* 屏幕内容 */}
  </>
);
```

### 2.4 键盘处理

```typescript
import { KeyboardAvoidingView, Platform } from 'react-native';

export const FormScreen = () => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView keyboardShouldPersistTaps="handled">
        {/* 表单内容 */}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
```

### 2.5 触摸反馈

```typescript
import { 
  TouchableOpacity, 
  TouchableNativeFeedback, 
  Platform,
  View 
} from 'react-native';

// ✅ 平台特定的触摸反馈
export const Touchable: React.FC<TouchableProps> = ({ 
  children, 
  onPress,
  style,
  ...props 
}) => {
  if (Platform.OS === 'android') {
    return (
      <TouchableNativeFeedback
        onPress={onPress}
        background={TouchableNativeFeedback.Ripple('#rgba(0,0,0,0.1)', false)}
        {...props}
      >
        <View style={style}>{children}</View>
      </TouchableNativeFeedback>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} style={style} {...props}>
      {children}
    </TouchableOpacity>
  );
};
```

---

## 3. 状态管理设计

### 3.1 状态分类

```typescript
// ✅ 按使用范围分类状态

// 1. 本地状态 (Local State) - useState/useReducer
const [isVisible, setIsVisible] = useState(false);
const [formData, setFormData] = useState({});

// 2. 共享状态 (Shared State) - Context
const ThemeContext = createContext<Theme>(defaultTheme);
const AuthContext = createContext<AuthState>(defaultAuth);

// 3. 服务器状态 (Server State) - React Query/SWR
const { data, isLoading } = useQuery(['user', id], fetchUser);

// 4. 全局状态 (Global State) - Redux/Zustand
const useStore = create<Store>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

### 3.2 Context 设计模式

```typescript
// ✅ 创建可复用的 Context 工厂
function createContext<T>(defaultValue: T) {
  const Context = React.createContext<T | undefined>(undefined);
  
  function useContextValue() {
    const value = React.useContext(Context);
    if (value === undefined) {
      throw new Error('useContextValue must be used within Provider');
    }
    return value;
  }
  
  return [Context.Provider, useContextValue] as const;
}

// 使用
const [ThemeProvider, useTheme] = createContext(defaultTheme);
const [AuthProvider, useAuth] = createContext(defaultAuth);

// 组合 Providers
export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </AuthProvider>
  </ThemeProvider>
);
```

### 3.3 Redux Toolkit 设计

```typescript
// store/slices/userSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async Thunk
export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.getUser(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
const userSlice = createSlice({
  name: 'user',
  initialState: {
    data: null as User | null,
    loading: false,
    error: null as string | null,
  },
  reducers: {
    clearUser: (state) => {
      state.data = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;
```

### 3.4 React Query 设计

```typescript
// hooks/useUsers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Query Keys 管理
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: FilterParams) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// Queries
export const useUsers = (filters: FilterParams) => {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => api.fetchUsers(filters),
    staleTime: 5 * 60 * 1000, // 5分钟
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => api.fetchUser(id),
    enabled: !!id,
  });
};

// Mutations
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: api.updateUser,
    onSuccess: (data, variables) => {
      // 更新缓存
      queryClient.setQueryData(userKeys.detail(variables.id), data);
      // 使列表缓存失效
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};
```

---

## 4. 导航设计

### 4.1 导航结构规划

```typescript
// 导航层级设计
/*
RootStack
├── MainTabs (Tab Navigator)
│   ├── HomeStack
│   │   ├── HomeScreen
│   │   ├── ProductListScreen
│   │   └── ProductDetailScreen
│   ├── DiscoverStack
│   │   ├── DiscoverScreen
│   │   └── CategoryScreen
│   ├── CartScreen
│   └── ProfileStack
│       ├── ProfileScreen
│       ├── SettingsScreen
│       └── EditProfileScreen
├── AuthStack (条件渲染)
│   ├── LoginScreen
│   └── RegisterScreen
└── ModalStack
    ├── FilterModal
    └── PaymentModal
*/
```

### 4.2 导航守卫

```typescript
// navigation/NavigationGuards.tsx
export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const navigation = useNavigation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.navigate('Auth', { screen: 'Login' });
    }
  }, [isAuthenticated, navigation]);

  return isAuthenticated ? <>{children}</> : null;
};

// 使用
<Stack.Screen name="Profile">
  {() => (
    <AuthGuard>
      <ProfileScreen />
    </AuthGuard>
  )}
</Stack.Screen>
```

### 4.3 导航动画设计

```typescript
// navigation/screenOptions.ts
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';

export const defaultScreenOptions: NativeStackNavigationOptions = {
  headerShown: true,
  headerBackTitleVisible: false,
  headerTintColor: '#007AFF',
  headerStyle: {
    backgroundColor: '#fff',
  },
  contentStyle: {
    backgroundColor: '#f5f5f5',
  },
};

export const modalScreenOptions: NativeStackNavigationOptions = {
  presentation: 'modal',
  animation: 'slide_from_bottom',
  headerShown: true,
  headerStyle: {
    backgroundColor: '#fff',
  },
};

export const transparentModalOptions: NativeStackNavigationOptions = {
  presentation: 'transparentModal',
  animation: 'fade',
  headerShown: false,
  contentStyle: {
    backgroundColor: 'transparent',
  },
};
```

---

## 5. React Native 设计原则

### 5.1 性能优先原则

```typescript
// ✅ 避免内联函数定义
// ❌ 避免
<FlatList
  renderItem={({ item }) => <Item data={item} />} // 每次渲染都创建新函数
/>

// ✅ 推荐
const renderItem = useCallback(({ item }: { item: ItemType }) => (
  <Item data={item} />
), []);

<FlatList renderItem={renderItem} />

// ✅ 避免内联样式
// ❌ 避免
<View style={{ flex: 1, padding: 16 }} />

// ✅ 推荐
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
});
<View style={styles.container} />
```

### 5.2 可访问性设计

```typescript
// ✅ 添加可访问性属性
<TouchableOpacity
  accessible={true}
  accessibilityLabel="提交按钮"
  accessibilityHint="双击提交表单"
  accessibilityRole="button"
  accessibilityState={{ disabled: isLoading }}
  onPress={handleSubmit}
>
  <Text>{isLoading ? '提交中...' : '提交'}</Text>
</TouchableOpacity>

// ✅ 表单可访问性
<TextInput
  accessibilityLabel="邮箱输入框"
  accessibilityHint="请输入您的邮箱地址"
  accessibilityErrorMessage={errors.email}
  // ...
/>
```

### 5.3 响应式设计

```typescript
import { Dimensions, useWindowDimensions } from 'react-native';

// ✅ 使用 hooks 获取屏幕尺寸
export const ResponsiveLayout = () => {
  const { width, height, scale, fontScale } = useWindowDimensions();
  
  const isPortrait = height > width;
  const isTablet = width > 768;

  return (
    <View style={[
      styles.container,
      isTablet && styles.tabletContainer,
      isPortrait ? styles.portrait : styles.landscape,
    ]}>
      {/* 内容 */}
    </View>
  );
};

// ✅ 响应式尺寸工具
const { width: SCREEN_WIDTH } = Dimensions.get('window');
const guidelineBaseWidth = 375;

export const scale = (size: number) => (SCREEN_WIDTH / guidelineBaseWidth) * size;
export const moderateScale = (size: number, factor = 0.5) => 
  size + (scale(size) - size) * factor;
```

### 5.4 错误边界设计

```typescript
// components/ErrorBoundary.tsx
interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.props.onError?.(error, errorInfo);
    // 上报错误到监控系统
    crashlytics().recordError(error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

// 使用
<ErrorBoundary fallback={<ErrorScreen />}>
  <AppNavigator />
</ErrorBoundary>
```

### 5.5 图片资源管理

```typescript
// ✅ 响应式图片
<Image
  source={{
    uri: 'https://example.com/image.jpg',
    width: 300,
    height: 200,
  }}
  resizeMode="cover"
  loadingIndicatorSource={require('./assets/placeholder.png')}
/>

// ✅ 本地图片
// 使用 @2x, @3x 后缀
// icon.png
// icon@2x.png
// icon@3x.png
<Image source={require('./assets/icon.png')} />

// ✅ 平台特定图片
// icon.ios.png
// icon.android.png
<Image source={require('./assets/icon.png')} />
```

### 5.6 动画设计

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';

// ✅ 使用 Reanimated 2 实现流畅动画
export const AnimatedCard = () => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 10 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.card, animatedStyle]}>
        {/* 内容 */}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};
```

---

## 6. 设计系统集成

### 6.1 主题配置

```typescript
// theme/index.ts
export const theme = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    background: '#F2F2F7',
    surface: '#FFFFFF',
    text: '#000000',
    textSecondary: '#8E8E93',
    border: '#C7C7CC',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    h1: { fontSize: 28, fontWeight: '700', lineHeight: 34 },
    h2: { fontSize: 22, fontWeight: '700', lineHeight: 28 },
    h3: { fontSize: 20, fontWeight: '600', lineHeight: 25 },
    body: { fontSize: 17, fontWeight: '400', lineHeight: 22 },
    caption: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
};

export type Theme = typeof theme;
```

### 6.2 样式工具函数

```typescript
// theme/styleUtils.ts
import { theme } from './index';

export const createStyles = <T extends StyleSheet.NamedStyles<T>>(
  styles: (theme: Theme) => T
) => {
  return StyleSheet.create(styles(theme));
};

// 使用
const styles = createStyles((theme) => ({
  container: {
    flex: 1,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
}));
```

---

*本文档由 DevCrew 自动生成，基于 React Native 设计最佳实践*
