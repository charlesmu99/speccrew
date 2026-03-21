# {{platform_name}} 开发规范

> 平台: `{{platform_id}}` | 生成时间: `{{generated_at}}`

## 概述

本文档定义 {{platform_name}} 的开发规范，包括 Rust 命名约定、前端框架集成、Command 命名、导入组织等。

## Rust 命名规范

### 文件命名

| 类型 | 命名格式 | 示例 |
|------|----------|------|
| 模块文件 | `snake_case.rs` | `file_service.rs` |
| 模块目录 | `snake_case/` | `commands/` |
| 模块入口 | `mod.rs` | `mod.rs` |
| 库入口 | `lib.rs` | `lib.rs` |
| 应用入口 | `main.rs` | `main.rs` |
| 测试文件 | `snake_case_test.rs` | `file_service_test.rs` |

```
src-tauri/src/
├── main.rs                 # 应用入口
├── lib.rs                  # 库入口
├── commands/               # 命令模块
│   ├── mod.rs
│   ├── file.rs
│   └── system.rs
├── services/               # 服务模块
│   ├── mod.rs
│   ├── file_service.rs
│   └── user_service.rs
├── models/                 # 数据模型
│   ├── mod.rs
│   ├── user.rs
│   └── document.rs
└── utils/                  # 工具模块
    ├── mod.rs
    └── helpers.rs
```

### 命名规范

```rust
// ✅ 类型命名 (PascalCase)
pub struct UserData { }
pub enum FileStatus { }
pub trait Repository { }
pub type Result<T> = std::result::Result<T, Error>;

// ✅ 函数命名 (snake_case)
pub async fn get_user_data() {}
pub fn validate_input() {}
pub fn calculate_checksum() {}

// ✅ 变量命名 (snake_case)
let user_name = "John";
let file_count = 42;
let is_valid = true;

// ✅ 常量命名 (SCREAMING_SNAKE_CASE)
const MAX_FILE_SIZE: usize = 10 * 1024 * 1024;
const DEFAULT_TIMEOUT: Duration = Duration::from_secs(30);
static APP_VERSION: &str = "1.0.0";

// ✅ 结构体字段 (snake_case)
pub struct Document {
    pub id: String,
    pub file_name: String,
    pub created_at: u64,
    pub is_deleted: bool,
}

// ✅ 枚举变体 (PascalCase)
pub enum TaskStatus {
    Pending,
    InProgress,
    Completed,
    Failed(String),
}

// ✅ 生命周期参数 ('snake_case 或 'a, 'b)
fn process_data<'a>(input: &'a str) -> &'a str {}
```

### Command 命名

```rust
// ✅ 动词 + 名词格式
#[tauri::command]
pub async fn get_user_data(user_id: String) -> Result<UserData, String> {}

#[tauri::command]
pub async fn create_document(request: CreateDocRequest) -> Result<Document, String> {}

#[tauri::command]
pub async fn update_settings(settings: AppSettings) -> Result<(), String> {}

#[tauri::command]
pub async fn delete_file(path: String) -> Result<(), String> {}

#[tauri::command]
pub async fn list_recent_files() -> Result<Vec<FileInfo>, String> {}

#[tauri::command]
pub async fn validate_path(path: String) -> Result<bool, String> {}

// ✅ 布尔查询使用 is_/has_ 前缀
#[tauri::command]
pub async fn is_file_exists(path: String) -> Result<bool, String> {}

#[tauri::command]
pub async fn has_permission(action: String) -> Result<bool, String> {}
```

## 前端框架集成

### React 集成

```typescript
// ✅ TauriProvider.tsx - 提供 Tauri API 上下文
import React, { createContext, useContext, ReactNode } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface TauriContextType {
  invoke: typeof invoke;
  isTauri: boolean;
}

const TauriContext = createContext<TauriContextType | null>(null);

export const TauriProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const isTauri = typeof window !== 'undefined' && '__TAURI__' in window;
  
  return (
    <TauriContext.Provider value={{ invoke, isTauri }}>
      {children}
    </TauriContext.Provider>
  );
};

export const useTauri = () => {
  const context = useContext(TauriContext);
  if (!context) {
    throw new Error('useTauri must be used within TauriProvider');
  }
  return context;
};

// ✅ useCommand hook
import { useState, useCallback } from 'react';

export function useCommand<T, P = Record<string, unknown>>(
  command: string
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { invoke } = useTauri();
  
  const execute = useCallback(async (params?: P) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await invoke<T>(command, params);
      setData(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [command, invoke]);
  
  return { data, loading, error, execute };
}

// ✅ 使用示例
function UserProfile({ userId }: { userId: string }) {
  const { data: user, loading, error, execute: fetchUser } = useCommand<UserData>('get_user_data');
  
  useEffect(() => {
    fetchUser({ userId });
  }, [userId, fetchUser]);
  
  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;
  if (!user) return null;
  
  return <div>{user.name}</div>;
}
```

### Vue 集成

```typescript
// ✅ useTauri composable
import { ref, computed } from 'vue';
import { invoke } from '@tauri-apps/api/core';

export function useTauriCommand<T, P = Record<string, unknown>>(command: string) {
  const data = ref<T | null>(null);
  const loading = ref(false);
  const error = ref<Error | null>(null);
  
  const execute = async (params?: P) => {
    loading.value = true;
    error.value = null;
    
    try {
      const result = await invoke<T>(command, params);
      data.value = result;
      return result;
    } catch (err) {
      error.value = err instanceof Error ? err : new Error(String(err));
      throw error.value;
    } finally {
      loading.value = false;
    }
  };
  
  return {
    data: computed(() => data.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    execute,
  };
}

// ✅ 使用示例
<script setup lang="ts">
const props = defineProps<{ userId: string }>();

const { data: user, loading, error, execute: fetchUser } = useTauriCommand<UserData>('get_user_data');

onMounted(() => {
  fetchUser({ userId: props.userId });
});
</script>
```

## 导入组织

### Rust 导入顺序

```rust
// ✅ 导入分组（按顺序）
// 1. 标准库
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::path::PathBuf;

// 2. 第三方库（字母顺序）
use serde::{Deserialize, Serialize};
use tauri::{State, Window, AppHandle};
use tokio::fs;
use thiserror::Error;

// 3. 内部模块（按路径深度）
use crate::models::{User, Document};
use crate::services::FileService;
use crate::state::AppState;
use crate::utils::helpers;
```

### TypeScript 导入顺序

```typescript
// ✅ 导入分组（按顺序）
// 1. 框架/库导入
import React, { useState, useEffect } from 'react';
import { defineStore } from 'pinia';

// 2. Tauri API
import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { open } from '@tauri-apps/plugin-dialog';

// 3. 第三方库
import axios from 'axios';
import { format } from 'date-fns';

// 4. 内部模块（按路径深度排序）
import { useUserStore } from './stores/user';
import { apiClient } from './services/api';
import type { UserData } from './types/user';

// 5. 样式
import './styles/component.css';
```

## 代码风格

### Rust 代码风格

```rust
// ✅ 使用 rustfmt 配置
// rustfmt.toml
max_width = 100
tab_spaces = 4
edition = "2021"

// ✅ 函数组织
impl UserService {
    // 公共 API 在前
    pub async fn create_user(&self, data: CreateUserRequest) -> Result<User, AppError> {
        self.validate_request(&data)?;
        let user = self.repository.create(data).await?;
        self.send_welcome_email(&user).await?;
        Ok(user)
    }
    
    pub async fn get_user(&self, id: &str) -> Result<User, AppError> {
        self.repository.find_by_id(id).await
            .ok_or_else(|| AppError::NotFound(format!("User {}", id)))
    }
    
    // 私有辅助方法在后
    fn validate_request(&self, data: &CreateUserRequest) -> Result<(), AppError> {
        if data.email.is_empty() {
            return Err(AppError::InvalidInput("Email required".to_string()));
        }
        Ok(())
    }
    
    async fn send_welcome_email(&self, user: &User) -> Result<(), AppError> {
        // 实现
        Ok(())
    }
}

// ✅ 错误处理
pub async fn process_data(input: String) -> Result<ProcessedData, AppError> {
    // 使用 ? 传播错误
    let validated = validate_input(&input)?;
    
    // 使用 match 处理特定错误
    let result = match process_validated(validated).await {
        Ok(data) => data,
        Err(e) if e.is_retryable() => {
            // 重试逻辑
            retry_process(validated).await?
        }
        Err(e) => return Err(e.into()),
    };
    
    Ok(result)
}

// ✅ 文档注释
/// 创建新用户
///
/// # Arguments
///
/// * `request` - 包含用户信息的请求对象
///
/// # Returns
///
/// 成功返回创建的用户，失败返回错误
///
/// # Examples
///
/// ```
/// let user = service.create_user(CreateUserRequest {
///     name: "John".to_string(),
///     email: "john@example.com".to_string(),
/// }).await?;
/// ```
pub async fn create_user(&self, request: CreateUserRequest) -> Result<User, AppError> {
    // 实现
}
```

### TypeScript 代码风格

```typescript
// ✅ 类型定义
interface UserData {
  id: string;
  name: string;
  email: string;
  createdAt: number;
}

type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: string };

// ✅ 函数定义
async function fetchUserData(userId: string): Promise<UserData> {
  const response = await invoke<UserData>('get_user_data', { userId });
  return response;
}

// ✅ 使用类型推断
const user = await fetchUserData('123'); // 类型自动推断为 UserData

// ✅ 错误处理
try {
  const data = await fetchUserData('123');
  return data;
} catch (error) {
  if (error instanceof TauriError) {
    handleTauriError(error);
  } else {
    console.error('Unexpected error:', error);
  }
  throw error;
}
```

## Git 规范

### 分支命名

```
✅ 推荐格式
feature/tauri-file-commands
feature/tauri-add-user-auth
bugfix/tauri-fix-memory-leak
hotfix/tauri-critical-security-patch
refactor/tauri-optimize-ipc
docs/tauri-update-readme
chore/tauri-update-dependencies

❌ 避免
tauri_new_feature
bugfix-memory-leak-fix
TauriFeature
```

### 提交信息规范

```
✅ 格式: <type>(<scope>): <subject>

类型 (type):
- feat: 新功能
- fix: 修复bug
- docs: 文档更新
- style: 代码格式调整（不影响功能）
- refactor: 重构代码
- perf: 性能优化
- test: 测试相关
- chore: 构建/工具/依赖更新
- ci: CI/CD 配置
- revert: 回滚提交

范围 (scope): 可选，表示影响的模块
- tauri-rust (Rust 后端)
- tauri-frontend (前端)
- tauri-cmd (Command)
- tauri-ui (UI)
- tauri-config (配置)

示例:
feat(tauri-cmd): add file read/write commands
fix(tauri-rust): resolve memory leak in file watcher
docs(tauri): update architecture documentation
refactor(tauri-frontend): simplify state management
test(tauri-cmd): add unit tests for file commands
chore(tauri-deps): update tauri to v2.0
```

### 提交示例

```bash
# ✅ 好的提交信息
git commit -m "feat(tauri-cmd): implement file CRUD operations"
git commit -m "fix(tauri-rust): correct path validation logic"
git commit -m "refactor(tauri-frontend): extract useCommand hook"
git commit -m "test(tauri-cmd): add integration tests for system commands"
git commit -m "docs(tauri): add security best practices guide"

# ❌ 避免的提交信息
git commit -m "update"
git commit -m "fix bug"
git commit -m "WIP"
git commit -m "2024-01-15 changes"
```

## 注释规范

### Rust 注释

```rust
// ✅ 文件头注释
//! 文件系统服务模块
//! 
//! 提供文件读写、路径验证、权限检查等功能

// ✅ 模块文档
/// 用户管理服务
/// 
/// 负责用户认证、授权和账户管理
pub mod user_service;

// ✅ 结构体/枚举文档
/// 文件信息结构体
/// 
/// 包含文件元数据，用于文件列表和详情展示
#[derive(Debug, Clone)]
pub struct FileInfo {
    /// 文件完整路径
    pub path: PathBuf,
    /// 文件大小（字节）
    pub size: u64,
    /// 最后修改时间戳
    pub modified_at: u64,
}

// ✅ 函数文档
/// 读取文件内容
/// 
/// # Arguments
/// 
/// * `path` - 文件路径
/// 
/// # Returns
/// 
/// 成功返回文件内容字符串，失败返回错误
/// 
/// # Errors
/// 
/// - 文件不存在时返回 `AppError::NotFound`
/// - 权限不足时返回 `AppError::PermissionDenied`
pub async fn read_file(path: &str) -> Result<String, AppError> {
    // 实现
}

// ✅ 行内注释
// 使用缓冲读取提高大文件性能
let reader = BufReader::new(file);

// TODO: 添加缓存支持，避免重复读取
let content = reader.read_to_string().await?;
```

### TypeScript 注释

```typescript
// ✅ JSDoc 注释
/**
 * 调用 Tauri Command
 * 
 * @param command - 命令名称
 * @param params - 命令参数
 * @returns 命令返回结果
 * @throws {TauriError} 当命令执行失败时抛出
 * 
 * @example
 * ```typescript
 * const data = await invokeCommand<UserData>('get_user', { id: '123' });
 * ```
 */
async function invokeCommand<T>(
  command: string,
  params?: Record<string, unknown>
): Promise<T> {
  // 实现
}

// ✅ 接口文档
/**
 * 文件服务接口
 * 
 * 提供桌面应用的文件操作能力
 */
interface IFileService {
  /**
   * 读取文件内容
   * @param path - 文件路径
   */
  readFile(path: string): Promise<string>;
  
  /**
   * 写入文件
   * @param path - 文件路径
   * @param content - 文件内容
   */
  writeFile(path: string, content: string): Promise<void>;
}
```

## 代码审查清单

### 功能检查

- [ ] 功能实现符合需求
- [ ] 错误处理完善（使用 Result/Option）
- [ ] 输入验证完整
- [ ] 权限检查正确

### 代码质量

- [ ] 遵循命名规范
- [ ] 代码结构清晰
- [ ] 无重复代码
- [ ] 适当的文档注释

### 安全

- [ ] Capabilities 配置最小化
- [ ] 路径验证完整
- [ ] 敏感数据保护
- [ ] 无 unwrap() 滥用

### 性能

- [ ] 异步操作正确使用
- [ ] 避免阻塞主线程
- [ ] 大数据使用流式处理
- [ ] 适当的缓存使用

### Tauri 特定

- [ ] Command 参数类型安全
- [ ] 错误类型可序列化
- [ ] 状态管理线程安全
- [ ] 事件命名符合规范
