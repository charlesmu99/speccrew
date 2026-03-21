# {{platform_name}} 设计规范

> 平台: `{{platform_id}}` | 生成时间: `{{generated_at}}`

## 概述

本文档定义 {{platform_name}} 的设计规范和最佳实践，包括 Command 设计模式、状态管理、事件系统设计等 Tauri 特定的设计原则。

## Command 设计模式

### Command 命名规范

```rust
// ✅ 使用动词 + 名词的命名方式
#[tauri::command]
pub async fn get_user_data(user_id: String) -> Result<UserData, String> {}

#[tauri::command]
pub async fn create_project(name: String) -> Result<Project, String> {}

#[tauri::command]
pub async fn update_settings(settings: AppSettings) -> Result<(), String> {}

#[tauri::command]
pub async fn delete_file(path: String) -> Result<(), String> {}

#[tauri::command]
pub async fn list_recent_files() -> Result<Vec<FileInfo>, String> {}

// ❌ 避免模糊的命名
#[tauri::command]
pub async fn handle(data: String) -> Result<(), String> {}  // 太模糊

#[tauri::command]
pub async fn do_something() -> Result<(), String> {}  // 不明确
```

### Command 参数设计

```rust
// ✅ 使用结构体组织复杂参数
#[derive(Debug, Deserialize)]
pub struct CreateDocumentRequest {
    pub title: String,
    pub content: String,
    pub format: DocumentFormat,
    pub metadata: Option<DocumentMetadata>,
}

#[tauri::command]
pub async fn create_document(
    request: CreateDocumentRequest,
) -> Result<Document, AppError> {
    // 实现
}

// ✅ 前端调用
const doc = await invoke('create_document', {
  request: {
    title: 'My Document',
    content: 'Hello World',
    format: 'markdown',
    metadata: { author: 'user' }
  }
});
```

### Command 返回类型

```rust
// ✅ 定义统一的响应结构
#[derive(Debug, Serialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
    pub timestamp: u64,
}

impl<T> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        Self {
            success: true,
            data: Some(data),
            error: None,
            timestamp: current_timestamp(),
        }
    }
    
    pub fn error(message: String) -> Self {
        Self {
            success: false,
            data: None,
            error: Some(message),
            timestamp: current_timestamp(),
        }
    }
}

// ✅ 使用 Result 类型
#[tauri::command]
pub async fn fetch_data() -> Result<Data, AppError> {
    // 成功返回 Ok(data)，失败返回 Err(error)
}
```

### Command 分层设计

```
src-tauri/src/
├── commands/
│   ├── mod.rs           # 模块导出
│   ├── file.rs          # 文件相关命令
│   ├── system.rs        # 系统相关命令
│   ├── app.rs           # 应用相关命令
│   └── user.rs          # 用户相关命令
├── services/            # 业务逻辑层
│   ├── mod.rs
│   ├── file_service.rs
│   └── user_service.rs
└── repositories/        # 数据访问层（可选）
    └── mod.rs
```

```rust
// ✅ commands/file.rs - 只负责参数处理和调用服务
#[tauri::command]
pub async fn read_file(
    path: String,
    state: State<'_, AppState>,
) -> Result<String, AppError> {
    // 参数验证
    if path.is_empty() {
        return Err(AppError::InvalidInput("Path cannot be empty".to_string()));
    }
    
    // 调用服务层
    let service = FileService::new(state.inner());
    service.read_file(&path).await
}

// ✅ services/file_service.rs - 业务逻辑
pub struct FileService {
    state: Arc<AppState>,
}

impl FileService {
    pub fn new(state: Arc<AppState>) -> Self {
        Self { state }
    }
    
    pub async fn read_file(&self, path: &str) -> Result<String, AppError> {
        // 权限检查
        self.validate_permission(path)?;
        
        // 业务逻辑
        let content = tokio::fs::read_to_string(path)
            .await
            .map_err(AppError::from)?;
        
        // 记录日志
        self.state.log_access(path).await?;
        
        Ok(content)
    }
    
    fn validate_permission(&self, path: &str) -> Result<(), AppError> {
        // 权限验证逻辑
        Ok(())
    }
}
```

## 状态管理设计

### 后端状态模式

```rust
// ✅ 使用 Arc<Mutex<T>> 实现线程安全状态
use std::sync::{Arc, Mutex};
use std::collections::HashMap;

pub struct AppState {
    // 配置状态
    config: Arc<Mutex<AppConfig>>,
    // 用户会话
    sessions: Arc<Mutex<HashMap<String, UserSession>>>,
    // 缓存
    cache: Arc<Mutex<Cache>>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            config: Arc::new(Mutex::new(AppConfig::default())),
            sessions: Arc::new(Mutex::new(HashMap::new())),
            cache: Arc::new(Mutex::new(Cache::new())),
        }
    }
    
    // 配置操作
    pub fn get_config(&self) -> Result<AppConfig, AppError> {
        self.config.lock()
            .map(|guard| guard.clone())
            .map_err(|_| AppError::LockError)
    }
    
    pub fn update_config(&self, config: AppConfig) -> Result<(), AppError> {
        let mut guard = self.config.lock()
            .map_err(|_| AppError::LockError)?;
        *guard = config;
        Ok(())
    }
    
    // 会话管理
    pub fn create_session(&self, user: User) -> Result<String, AppError> {
        let session_id = generate_session_id();
        let mut sessions = self.sessions.lock()
            .map_err(|_| AppError::LockError)?;
        sessions.insert(session_id.clone(), UserSession::new(user));
        Ok(session_id)
    }
}
```

### 前端状态设计

```typescript
// ✅ 使用 Pinia 进行状态管理
import { defineStore } from 'pinia';
import { invoke } from '@tauri-apps/api/core';

// 类型定义
interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  preferences: UserPreferences;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    currentUser: null,
    isAuthenticated: false,
    preferences: defaultPreferences(),
  }),
  
  getters: {
    isAdmin: (state) => state.currentUser?.role === 'admin',
    displayName: (state) => state.currentUser?.name || 'Guest',
  },
  
  actions: {
    async login(credentials: LoginCredentials) {
      try {
        const user = await invoke<User>('login', { credentials });
        this.currentUser = user;
        this.isAuthenticated = true;
        
        // 加载用户偏好
        await this.loadPreferences();
      } catch (error) {
        this.handleError(error);
        throw error;
      }
    },
    
    async loadPreferences() {
      if (!this.currentUser) return;
      
      const prefs = await invoke<UserPreferences>('get_user_preferences', {
        userId: this.currentUser.id,
      });
      this.preferences = prefs;
    },
    
    async savePreferences() {
      if (!this.currentUser) return;
      
      await invoke('save_user_preferences', {
        userId: this.currentUser.id,
        preferences: this.preferences,
      });
    },
    
    logout() {
      this.currentUser = null;
      this.isAuthenticated = false;
      this.preferences = defaultPreferences();
    },
    
    handleError(error: unknown) {
      // 统一错误处理
      console.error('User store error:', error);
    },
  },
});
```

### 前后端状态同步

```typescript
// ✅ 状态同步服务
class StateSyncService {
  private listeners: Map<string, Function[]> = new Map();
  
  async init() {
    // 监听后端状态变更事件
    await listen('state-changed', (event) => {
      const { key, value } = event.payload;
      this.notifyListeners(key, value);
    });
  }
  
  async getState<T>(key: string): Promise<T> {
    return await invoke<T>('get_state', { key });
  }
  
  async setState<T>(key: string, value: T): Promise<void> {
    await invoke('set_state', { key, value });
  }
  
  subscribe(key: string, callback: Function) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key)!.push(callback);
    
    // 返回取消订阅函数
    return () => {
      const callbacks = this.listeners.get(key);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) callbacks.splice(index, 1);
      }
    };
  }
  
  private notifyListeners(key: string, value: unknown) {
    const callbacks = this.listeners.get(key);
    if (callbacks) {
      callbacks.forEach(cb => cb(value));
    }
  }
}
```

## 事件系统设计

### 事件命名规范

```rust
// ✅ 使用领域:动作 的命名格式
pub const EVENTS: Events = Events {
    // 文件事件
    FILE_CREATED: "file:created",
    FILE_UPDATED: "file:updated",
    FILE_DELETED: "file:deleted",
    FILE_SAVED: "file:saved",
    
    // 应用事件
    APP_READY: "app:ready",
    APP_SHUTDOWN: "app:shutdown",
    APP_FOCUS: "app:focus",
    APP_BLUR: "app:blur",
    
    // 用户事件
    USER_LOGIN: "user:login",
    USER_LOGOUT: "user:logout",
    USER_PREFERENCES_CHANGED: "user:preferences-changed",
    
    // 同步事件
    SYNC_STARTED: "sync:started",
    SYNC_COMPLETED: "sync:completed",
    SYNC_FAILED: "sync:failed",
    SYNC_PROGRESS: "sync:progress",
};
```

### 事件数据结构

```rust
// ✅ 定义类型化的事件数据
#[derive(Debug, Clone, Serialize)]
pub struct FileEvent {
    pub event_type: FileEventType,
    pub path: String,
    pub timestamp: u64,
    pub metadata: Option<FileMetadata>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum FileEventType {
    Created,
    Modified,
    Deleted,
    Renamed { old_path: String },
}

#[derive(Debug, Clone, Serialize)]
pub struct ProgressEvent {
    pub operation: String,
    pub current: u64,
    pub total: u64,
    pub percentage: f32,
    pub message: Option<String>,
}
```

### 事件发布/订阅

```rust
// ✅ 后端事件管理器
pub struct EventManager {
    app_handle: AppHandle,
}

impl EventManager {
    pub fn new(app_handle: AppHandle) -> Self {
        Self { app_handle }
    }
    
    // 发布到特定窗口
    pub fn emit_to_window<T: Serialize>(
        &self,
        window_label: &str,
        event: &str,
        payload: T,
    ) -> Result<()> {
        if let Some(window) = self.app_handle.get_window(window_label) {
            window.emit(event, payload)?;
        }
        Ok(())
    }
    
    // 全局广播
    pub fn broadcast<T: Serialize>(&self, event: &str, payload: T) -> Result<()> {
        self.app_handle.emit_all(event, payload)?;
        Ok(())
    }
    
    // 发布文件事件
    pub fn emit_file_event(&self, event: FileEvent) -> Result<()> {
        let event_name = match event.event_type {
            FileEventType::Created => EVENTS.FILE_CREATED,
            FileEventType::Modified => EVENTS.FILE_UPDATED,
            FileEventType::Deleted => EVENTS.FILE_DELETED,
            FileEventType::Renamed { .. } => "file:renamed",
        };
        self.broadcast(event_name, event)
    }
}
```

```typescript
// ✅ 前端事件订阅管理
import { listen, Event } from '@tauri-apps/api/event';

class EventSubscriber {
  private unlisteners: Map<string, () => void> = new Map();
  
  async subscribe<T>(
    event: string,
    handler: (payload: T) => void
  ): Promise<void> {
    // 取消之前的订阅
    this.unsubscribe(event);
    
    const unlisten = await listen<T>(event, (event: Event<T>) => {
      handler(event.payload);
    });
    
    this.unlisteners.set(event, unlisten);
  }
  
  unsubscribe(event: string) {
    const unlisten = this.unlisteners.get(event);
    if (unlisten) {
      unlisten();
      this.unlisteners.delete(event);
    }
  }
  
  unsubscribeAll() {
    this.unlisteners.forEach(unlisten => unlisten());
    this.unlisteners.clear();
  }
}

// 使用示例
const subscriber = new EventSubscriber();

// 在组件中
onMounted(async () => {
  await subscriber.subscribe<FileEvent>('file:created', (event) => {
    notificationStore.show({
      type: 'success',
      message: `File created: ${event.path}`,
    });
  });
});

onUnmounted(() => {
  subscriber.unsubscribeAll();
});
```

## 文件系统访问模式

### 安全文件访问

```rust
// ✅ 文件访问服务
pub struct SecureFileService {
    allowed_paths: Vec<PathBuf>,
}

impl SecureFileService {
    pub fn new(allowed_paths: Vec<PathBuf>) -> Self {
        Self { allowed_paths }
    }
    
    // 验证路径是否在允许范围内
    fn validate_path(&self, path: &Path) -> Result<(), AppError> {
        let canonical = path.canonicalize()
            .map_err(|_| AppError::InvalidPath)?;
        
        let allowed = self.allowed_paths.iter().any(|allowed| {
            canonical.starts_with(allowed)
        });
        
        if !allowed {
            return Err(AppError::PermissionDenied);
        }
        
        Ok(())
    }
    
    pub async fn read_file(&self, path: &str) -> Result<String, AppError> {
        let path = Path::new(path);
        self.validate_path(path)?;
        
        tokio::fs::read_to_string(path)
            .await
            .map_err(AppError::from)
    }
    
    pub async fn write_file(&self, path: &str, content: &str) -> Result<(), AppError> {
        let path = Path::new(path);
        self.validate_path(path)?;
        
        // 创建父目录
        if let Some(parent) = path.parent() {
            tokio::fs::create_dir_all(parent).await?;
        }
        
        tokio::fs::write(path, content)
            .await
            .map_err(AppError::from)
    }
}
```

### 文件选择对话框集成

```typescript
// ✅ 文件选择服务
import { open, save } from '@tauri-apps/plugin-dialog';

class FileDialogService {
  async openFile(options?: OpenDialogOptions): Promise<string | null> {
    const selected = await open({
      multiple: false,
      directory: false,
      ...options,
    });
    
    return selected as string | null;
  }
  
  async openFiles(options?: OpenDialogOptions): Promise<string[]> {
    const selected = await open({
      multiple: true,
      directory: false,
      ...options,
    });
    
    return Array.isArray(selected) ? selected : [];
  }
  
  async selectDirectory(options?: OpenDialogOptions): Promise<string | null> {
    return await open({
      directory: true,
      multiple: false,
      ...options,
    }) as string | null;
  }
  
  async saveFile(options?: SaveDialogOptions): Promise<string | null> {
    return await save(options);
  }
}

// 使用示例
async function handleOpenFile() {
  const filePath = await fileDialogService.openFile({
    filters: [
      { name: 'Markdown', extensions: ['md', 'markdown'] },
      { name: 'Text', extensions: ['txt'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });
  
  if (filePath) {
    const content = await invoke<string>('read_file', { path: filePath });
    editorStore.setContent(content);
  }
}
```

## Tauri 特定设计原则

### 1. 最小权限原则

```json
// ✅ 精确配置所需权限
{
  "permissions": [
    // 只授予必要的文件系统权限
    {
      "identifier": "fs:allow-read",
      "allow": [
        { "path": "$APPDATA/**" },
        { "path": "$DOCUMENT/**" }
      ]
    },
    // 限制网络请求
    {
      "identifier": "http:allow-fetch",
      "allow": [{ "url": "https://api.example.com" }]
    }
  ]
}
```

### 2. 异步设计

```rust
// ✅ 使用异步处理 I/O 操作
#[tauri::command]
pub async fn process_large_file(path: String) -> Result<ProcessResult, AppError> {
    // 异步读取文件
    let content = tokio::fs::read(&path).await?;
    
    // 异步处理
    let result = tokio::task::spawn_blocking(move || {
        heavy_processing(content)
    }).await?;
    
    Ok(result)
}
```

### 3. 类型安全

```rust
// ✅ 前后端共享类型定义
// src-tauri/src/models/document.rs
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Document {
    pub id: String,
    pub title: String,
    pub content: String,
    pub created_at: u64,
    pub updated_at: u64,
    pub metadata: DocumentMetadata,
}

// 前端 TypeScript 类型（通过生成工具或手动同步）
interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  metadata: DocumentMetadata;
}
```

### 4. 资源管理

```rust
// ✅ 正确管理资源生命周期
pub struct ResourceManager {
    temp_files: Mutex<Vec<PathBuf>>,
}

impl ResourceManager {
    pub fn cleanup(&self) -> Result<(), AppError> {
        let files = self.temp_files.lock()?;
        for path in files.iter() {
            let _ = std::fs::remove_file(path);
        }
        Ok(())
    }
}

impl Drop for ResourceManager {
    fn drop(&mut self) {
        let _ = self.cleanup();
    }
}
```

### 5. 错误传播

```rust
// ✅ 使用 thiserror 定义错误类型
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    
    #[error("Serialization error: {0}")]
    Serialization(#[from] serde_json::Error),
    
    #[error("Permission denied")]
    PermissionDenied,
    
    #[error("Invalid input: {0}")]
    InvalidInput(String),
    
    #[error("Not found: {0}")]
    NotFound(String),
    
    #[error("Lock error")]
    LockError,
}

// 自动转换为前端可序列化的错误
impl Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}
```

## 性能优化模式

### 批量操作

```rust
// ✅ 批量处理减少 IPC 调用
#[tauri::command]
pub async fn batch_process_files(
    operations: Vec<FileOperation>,
) -> Result<Vec<OperationResult>, AppError> {
    let mut results = Vec::with_capacity(operations.len());
    
    for op in operations {
        let result = process_single_operation(op).await;
        results.push(result);
    }
    
    Ok(results)
}
```

### 流式处理

```rust
// ✅ 大文件流式处理
use tokio::io::AsyncBufReadExt;

#[tauri::command]
pub async fn process_large_file_streaming(
    path: String,
    window: Window,
) -> Result<(), AppError> {
    let file = tokio::fs::File::open(&path).await?;
    let reader = tokio::io::BufReader::new(file);
    let mut lines = reader.lines();
    let mut line_number = 0;
    
    while let Some(line) = lines.next_line().await? {
        line_number += 1;
        
        // 处理每一行
        let processed = process_line(line);
        
        // 每 100 行报告一次进度
        if line_number % 100 == 0 {
            window.emit("progress", ProgressEvent {
                current: line_number,
                total: 0, // 未知总数
                percentage: 0.0,
                message: Some(format!("Processed {} lines", line_number)),
            })?;
        }
    }
    
    Ok(())
}
```

### 缓存策略

```rust
// ✅ 智能缓存
use std::time::{Duration, Instant};

pub struct Cache<T> {
    data: Mutex<Option<(T, Instant)>>,
    ttl: Duration,
}

impl<T: Clone> Cache<T> {
    pub fn new(ttl_seconds: u64) -> Self {
        Self {
            data: Mutex::new(None),
            ttl: Duration::from_secs(ttl_seconds),
        }
    }
    
    pub fn get(&self) -> Option<T> {
        let guard = self.data.lock().ok()?;
        guard.as_ref().and_then(|(data, timestamp)| {
            if timestamp.elapsed() < self.ttl {
                Some(data.clone())
            } else {
                None
            }
        })
    }
    
    pub fn set(&self, value: T) -> Result<(), AppError> {
        let mut guard = self.data.lock()?;
        *guard = Some((value, Instant::now()));
        Ok(())
    }
    
    pub fn invalidate(&self) -> Result<(), AppError> {
        let mut guard = self.data.lock()?;
        *guard = None;
        Ok(())
    }
}
```
