# {{platform_name}} 架构规范

> 平台: `{{platform_id}}` | 生成时间: `{{generated_at}}`

## 概述

本文档定义 {{platform_name}} 的架构模式和设计原则，基于 Tauri 框架的最佳实践。Tauri 采用 Rust 后端 + Web 前端的混合架构，提供安全、高性能的桌面应用开发体验。

## 架构模式

### Rust 后端 + Web 前端架构

```
┌─────────────────────────────────────────────────────────────┐
│                        前端 (WebView)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   UI 组件    │  │  状态管理   │  │    前端业务逻辑      │  │
│  │  (React/Vue)│  │(Redux/Pinia)│  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                           │                                  │
│                    ┌──────┴──────┐                          │
│                    │  Tauri API  │                          │
│                    │  (invoke)   │                          │
│                    └──────┬──────┘                          │
└───────────────────────────┼─────────────────────────────────┘
                            │ IPC
┌───────────────────────────┼─────────────────────────────────┐
│                      Rust 后端                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Command   │  │   State     │  │    系统 API 调用     │  │
│  │   Handlers  │  │  Management │  │  (fs, shell, etc.)  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                           │                                  │
│                    ┌──────┴──────┐                          │
│                    │  OS 原生层   │                          │
│                    │ (Windows/   │                          │
│                    │ macOS/Linux)│                          │
│                    └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
```

### 核心特性

| 特性 | 说明 | 优势 |
|------|------|------|
| 进程隔离 | 前端与后端运行在不同进程 | 安全性高，崩溃隔离 |
| IPC 通信 | 通过 Command 模式通信 | 类型安全，易于追踪 |
| 原生性能 | Rust 后端直接调用系统 API | 高性能，低资源占用 |
| 前端技术栈 | 使用现代 Web 技术 | 开发效率高，生态丰富 |

## 项目结构

### 标准目录结构

```
project-root/
├── src/                        # 前端源码
│   ├── components/             # UI 组件
│   ├── pages/                  # 页面组件
│   ├── stores/                 # 状态管理
│   ├── services/               # 服务层
│   ├── utils/                  # 工具函数
│   ├── types/                  # TypeScript 类型
│   └── assets/                 # 静态资源
│
├── src-tauri/                  # Tauri Rust 后端
│   ├── src/
│   │   ├── main.rs             # 应用入口
│   │   ├── lib.rs              # 库入口
│   │   ├── commands/           # Command 处理器
│   │   │   ├── mod.rs
│   │   │   ├── file.rs         # 文件操作命令
│   │   │   ├── system.rs       # 系统命令
│   │   │   └── app.rs          # 应用命令
│   │   ├── state/              # 状态管理
│   │   │   ├── mod.rs
│   │   │   └── app_state.rs
│   │   ├── models/             # 数据模型
│   │   │   ├── mod.rs
│   │   │   └── user.rs
│   │   ├── services/           # 后端服务
│   │   │   ├── mod.rs
│   │   │   └── file_service.rs
│   │   └── utils/              # 工具模块
│   │       └── mod.rs
│   ├── capabilities/           # 权限配置
│   │   └── default.json
│   ├── icons/                  # 应用图标
│   ├── Cargo.toml              # Rust 依赖
│   └── tauri.conf.json         # Tauri 配置
│
├── public/                     # 公共资源
├── index.html                  # HTML 入口
├── package.json                # 前端依赖
└── vite.config.ts              # 构建配置
```

### 前端框架集成

```typescript
// ✅ 前端调用 Tauri Command
import { invoke } from '@tauri-apps/api/core';

// 调用 Rust 后端命令
async function loadUserData() {
  try {
    const userData = await invoke<UserData>('get_user_data', {
      userId: '12345'
    });
    return userData;
  } catch (error) {
    console.error('Failed to load user data:', error);
    throw error;
  }
}

// 使用事件监听
import { listen } from '@tauri-apps/api/event';

listen('file-changed', (event) => {
  console.log('File changed:', event.payload);
});
```

## Command 模式

### Command 定义

```rust
// ✅ src-tauri/src/commands/file.rs
use tauri::State;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct FileInfo {
    pub path: String,
    pub size: u64,
    pub modified: u64,
}

/// 读取文件内容
#[tauri::command]
pub async fn read_file(path: String) -> Result<String, String> {
    tokio::fs::read_to_string(&path)
        .await
        .map_err(|e| format!("Failed to read file: {}", e))
}

/// 获取文件信息
#[tauri::command]
pub async fn get_file_info(path: String) -> Result<FileInfo, String> {
    let metadata = tokio::fs::metadata(&path)
        .await
        .map_err(|e| format!("Failed to get metadata: {}", e))?;
    
    Ok(FileInfo {
        path,
        size: metadata.len(),
        modified: metadata.modified()
            .unwrap_or(std::time::SystemTime::UNIX_EPOCH)
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs(),
    })
}

/// 写入文件（需要状态管理）
#[tauri::command]
pub async fn write_file(
    path: String,
    content: String,
    state: State<'_, AppState>,
) -> Result<(), String> {
    // 检查权限
    if !state.has_permission(&path) {
        return Err("Permission denied".to_string());
    }
    
    tokio::fs::write(&path, content)
        .await
        .map_err(|e| format!("Failed to write file: {}", e))
}
```

### Command 注册

```rust
// ✅ src-tauri/src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod state;
mod models;
mod services;

use commands::{file, system, app};
use state::AppState;

fn main() {
    tauri::Builder::default()
        .manage(AppState::new())
        .invoke_handler(tauri::generate_handler![
            // 文件命令
            file::read_file,
            file::get_file_info,
            file::write_file,
            // 系统命令
            system::get_system_info,
            system::open_external,
            // 应用命令
            app::get_app_version,
            app::show_main_window,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

## 安全模型

### Capabilities 配置

```json
// ✅ src-tauri/capabilities/default.json
{
  "$schema": "../gen/schemas/desktop-schema.json",
  "identifier": "default",
  "description": "Default capabilities",
  "windows": ["main"],
  "permissions": [
    // 核心权限
    "core:default",
    "core:window:default",
    "core:window:allow-close",
    "core:window:allow-minimize",
    "core:window:allow-maximize",
    
    // 文件系统权限
    "fs:default",
    {
      "identifier": "fs:allow-read",
      "allow": [{ "path": "$APPDATA/**" }]
    },
    {
      "identifier": "fs:allow-write",
      "allow": [{ "path": "$APPDATA/**" }]
    },
    
    // 对话框权限
    "dialog:default",
    "dialog:allow-open",
    "dialog:allow-save",
    
    // Shell 权限（谨慎使用）
    {
      "identifier": "shell:allow-execute",
      "allow": [
        { "name": "git", "cmd": "git", "args": true },
        { "name": "node", "cmd": "node", "args": true }
      ]
    },
    
    // HTTP 权限
    "http:default",
    {
      "identifier": "http:allow-fetch",
      "allow": [{ "url": "https://api.example.com" }]
    },
    
    // 自定义命令权限
    "allow-read-file",
    "allow-write-file",
    "allow-get-system-info"
  ]
}
```

### 权限最佳实践

1. **最小权限原则**: 只授予应用必需的最小权限
2. **路径限制**: 文件系统权限应限制在特定目录
3. **命令白名单**: Shell 执行使用白名单模式
4. **URL 限制**: HTTP 请求限制在特定域名

## 状态管理

### 后端状态 (Rust)

```rust
// ✅ src-tauri/src/state/app_state.rs
use std::sync::{Arc, Mutex};
use std::collections::HashSet;

pub struct AppState {
    // 应用配置
    config: Mutex<AppConfig>,
    // 已授权路径
    allowed_paths: Mutex<HashSet<String>>,
    // 缓存
    cache: Mutex<Cache>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            config: Mutex::new(AppConfig::default()),
            allowed_paths: Mutex::new(HashSet::new()),
            cache: Mutex::new(Cache::new()),
        }
    }
    
    pub fn has_permission(&self, path: &str) -> bool {
        let allowed = self.allowed_paths.lock().unwrap();
        allowed.iter().any(|p| path.starts_with(p))
    }
    
    pub fn add_allowed_path(&self, path: String) {
        let mut allowed = self.allowed_paths.lock().unwrap();
        allowed.insert(path);
    }
}

// 线程安全的状态
pub struct ThreadSafeState {
    inner: Arc<AppState>,
}

impl ThreadSafeState {
    pub fn new() -> Self {
        Self {
            inner: Arc::new(AppState::new()),
        }
    }
}

impl Clone for ThreadSafeState {
    fn clone(&self) -> Self {
        Self {
            inner: Arc::clone(&self.inner),
        }
    }
}
```

### 前端状态集成

```typescript
// ✅ 前端使用 Pinia + Tauri
import { defineStore } from 'pinia';
import { invoke } from '@tauri-apps/api/core';

export const useFileStore = defineStore('file', {
  state: () => ({
    currentFile: null as FileInfo | null,
    recentFiles: [] as string[],
    isLoading: false,
  }),
  
  actions: {
    async openFile(path: string) {
      this.isLoading = true;
      try {
        const content = await invoke<string>('read_file', { path });
        const info = await invoke<FileInfo>('get_file_info', { path });
        
        this.currentFile = { ...info, content };
        this.addToRecent(path);
      } finally {
        this.isLoading = false;
      }
    },
    
    async saveFile(content: string) {
      if (!this.currentFile) return;
      
      await invoke('write_file', {
        path: this.currentFile.path,
        content,
      });
    },
    
    addToRecent(path: string) {
      this.recentFiles = [path, ...this.recentFiles.filter(p => p !== path)].slice(0, 10);
    },
  },
});
```

## 窗口管理

### 多窗口配置

```rust
// ✅ src-tauri/src/main.rs
fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![...])
        .setup(|app| {
            // 创建主窗口
            let main_window = tauri::WindowBuilder::new(
                app,
                "main",
                tauri::WindowUrl::App("index.html".into())
            )
            .title("My Tauri App")
            .inner_size(1200.0, 800.0)
            .min_inner_size(800.0, 600.0)
            .center()
            .build()?;
            
            // 创建设置窗口
            let settings_window = tauri::WindowBuilder::new(
                app,
                "settings",
                tauri::WindowUrl::App("/settings".into())
            )
            .title("Settings")
            .inner_size(600.0, 400.0)
            .resizable(false)
            .center()
            .visible(false)
            .build()?;
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### 窗口通信

```rust
// ✅ 后端发送事件到特定窗口
#[tauri::command]
pub fn notify_progress(window: tauri::Window, progress: u32) {
    window.emit("progress", ProgressEvent { value: progress })
        .expect("failed to emit event");
}

// ✅ 前端监听窗口事件
import { getCurrentWindow } from '@tauri-apps/api/window';

const appWindow = getCurrentWindow();

appWindow.listen('progress', (event) => {
  updateProgressBar(event.payload.value);
});
```

## 事件系统

### 全局事件

```rust
// ✅ 后端广播事件
#[tauri::command]
pub fn broadcast_update(app_handle: tauri::AppHandle) {
    app_handle.emit_all("data-updated", UpdateEvent {
        timestamp: chrono::Utc::now().timestamp(),
    }).expect("failed to emit event");
}
```

```typescript
// ✅ 前端监听全局事件
import { listen } from '@tauri-apps/api/event';

const unlisten = await listen<UpdateEvent>('data-updated', (event) => {
  console.log('Data updated at:', event.payload.timestamp);
  refreshData();
});

// 组件卸载时取消监听
onUnmounted(() => {
  unlisten();
});
```

## 错误处理

### Rust 后端错误

```rust
// ✅ 定义错误类型
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    
    #[error("Permission denied: {0}")]
    PermissionDenied(String),
    
    #[error("Invalid input: {0}")]
    InvalidInput(String),
    
    #[error("Not found: {0}")]
    NotFound(String),
}

// 转换为前端友好的错误
impl serde::Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

// 在 Command 中使用
#[tauri::command]
pub async fn read_file(path: String) -> Result<String, AppError> {
    // 验证路径
    if !is_valid_path(&path) {
        return Err(AppError::InvalidInput("Invalid path".to_string()));
    }
    
    tokio::fs::read_to_string(&path)
        .await
        .map_err(|e| match e.kind() {
            std::io::ErrorKind::NotFound => {
                AppError::NotFound(format!("File not found: {}", path))
            }
            std::io::ErrorKind::PermissionDenied => {
                AppError::PermissionDenied(path)
            }
            _ => AppError::Io(e),
        })
}
```

### 前端错误处理

```typescript
// ✅ 统一的错误处理
class TauriError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'TauriError';
  }
}

async function invokeWithError<T>(
  cmd: string,
  args?: Record<string, unknown>
): Promise<T> {
  try {
    return await invoke<T>(cmd, args);
  } catch (error) {
    if (typeof error === 'string') {
      // 解析 Rust 错误
      if (error.includes('Permission denied')) {
        throw new TauriError(error, 'PERMISSION_DENIED');
      }
      if (error.includes('Not found')) {
        throw new TauriError(error, 'NOT_FOUND');
      }
      throw new TauriError(error, 'UNKNOWN_ERROR');
    }
    throw error;
  }
}
```

## 最佳实践

1. **Command 设计**: 保持 Command 简洁，业务逻辑放在 Service 层
2. **状态分离**: 前端状态管理 UI，后端状态管理业务数据
3. **类型安全**: 前后端共享类型定义，使用 serde 进行序列化
4. **错误处理**: 统一的错误类型，友好的错误信息
5. **性能优化**: 大数据传输使用流式处理，避免阻塞 UI
6. **安全优先**: 严格配置 Capabilities，验证所有输入

## 反模式

- ❌ 在 Command 中直接处理复杂业务逻辑
- ❌ 使用全局可变状态而不加锁
- ❌ 忽略错误处理，使用 unwrap()
- ❌ 授予过多的文件系统权限
- ❌ 在 UI 线程执行耗时操作
- ❌ 频繁的小数据量 IPC 调用
