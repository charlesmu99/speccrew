# Mobile System Design - {ModuleName}

> Feature Spec Reference: {FeatureSpecPath}
> API Contract Reference: {ApiContractPath}
> Platform: {PlatformId} | Framework: {Framework} | Language: {Language}

## 1. Design Goal

{Brief description of what this module implements, referencing Feature Spec function}

## 2. Screen Architecture

### 2.1 Screen/Widget Tree

<!-- AI-NOTE: ASCII tree showing screen/widget hierarchy. Adjust depth based on complexity. -->

```
MainScreen
├── AppBar
│   ├── Title
│   └── ActionButtons
├── Body
│   ├── ListView
│   │   └── ListItem (repeated)
│   └── FloatingActionButton
└── BottomNavigationBar
    ├── Tab1
    ├── Tab2
    └── Tab3
```

### 2.2 Screen Summary Table

| Screen | Path | Type | Status | Description |
|--------|------|------|--------|-------------|
| {Name} | `{directory}/{file_name}` | Screen | [NEW]/[MODIFIED]/[EXISTING] | {Purpose} |
| {Name} | `{directory}/{file_name}` | Widget | [NEW]/[MODIFIED]/[EXISTING] | {Purpose} |

## 3. Screen Detail Design

<!-- AI-NOTE: Repeat Section 3.N for each screen. Focus on screens with [NEW] or [MODIFIED] status. -->

### 3.1 {ScreenName}

**Purpose**: {What this screen does}

**Props/Parameters**:

<!-- AI-NOTE: For Flutter: constructor params; for React Native: navigation params + props -->

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| {param} | {type} | Yes/No | {value} | {description} |

**Internal State**:

<!-- AI-NOTE: Include actual state management syntax from techs knowledge -->

| State | Type | Initial Value | Description |
|-------|------|--------------|-------------|
| {state} | {type} | {value} | {description} |

**Lifecycle**:

<!-- AI-NOTE: For Flutter: initState/dispose; for React Native: useEffect -->

- `initState` / `useEffect`: {description of initialization logic}
- `dispose` / `useEffect cleanup`: {description of cleanup logic}

**Pseudo-code**:

<!-- AI-NOTE: Use actual framework API syntax from techs knowledge. NOT generic code. -->

```dart
// AI-NOTE: Example for Flutter with Provider
// Adjust imports and syntax based on actual framework from techs knowledge
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class {ScreenName} extends StatefulWidget {
  final {ParamType} {paramName};
  
  const {ScreenName}({Key? key, required this.{paramName}}) : super(key: key);
  
  @override
  State<{ScreenName}> createState() => _{ScreenName}State();
}

class _{ScreenName}State extends State<{ScreenName}> {
  // State variables
  late {Type} {stateName};
  
  @override
  void initState() {
    super.initState();
    // Initialization logic
    {stateName} = {initialValue};
  }
  
  @override
  void dispose() {
    // Cleanup logic
    super.dispose();
  }
  
  void handle{Action}() {
    // Implementation logic
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('{title}')),
      body: {bodyWidget},
    );
  }
}
```

**Referenced APIs**:

| API Name | Method | Path | Usage Context |
|----------|--------|------|--------------|
| {api} | GET/POST/PUT/DELETE | {path} | {when and why called} |

---

### 3.2 {ScreenName}

<!-- AI-NOTE: Repeat the same structure as 3.1 for each additional screen -->

**Purpose**: {What this screen does}

**Props/Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| {param} | {type} | Yes/No | {value} | {description} |

**Pseudo-code**:

```dart
// AI-NOTE: Use actual framework API syntax from techs knowledge
{implementation pseudo-code}
```

---

## 4. Navigation Design

### 4.1 Navigation Stack

**Route Definitions**:

<!-- AI-NOTE: Use actual router syntax from techs knowledge (GoRouter for Flutter, React Navigation for React Native) -->

```dart
// AI-NOTE: Example for Flutter GoRouter
// File: lib/router/app_router.dart
final GoRouter appRouter = GoRouter(
  routes: [
    GoRoute(
      path: '/{route-path}',
      name: '{routeName}',
      builder: (context, state) => {ScreenName}(
        {paramName}: state.params['{param}'],
      ),
    ),
  ],
);
```

**Deep Linking Configuration**:

<!-- AI-NOTE: Document deep link URL patterns and handling -->

| Deep Link | Target Screen | Parameters |
|-----------|--------------|------------|
| `app://{path}` | {ScreenName} | {param list} |

**Navigation Guards/Middleware**:

<!-- AI-NOTE: Document any auth guards or route guards -->

| Guard | Logic | Applied Routes |
|-------|-------|---------------|
| {guardName} | {description} | {route list} |

### 4.2 Navigation Flow

<!-- AI-NOTE: Use basic Mermaid flowchart syntax. No style definitions, no HTML tags, no nested subgraph, no direction keyword. -->

```mermaid
graph TD
    A[HomeScreen] --> B[ModuleListScreen]
    B --> C[DetailScreen]
    C --> D[EditScreen]
    C --> E[DeleteConfirmation]
```

## 5. State Management

### 5.1 Store/Provider Design

**Store Module**: `{store-path}/{store-name}`
**Status**: [NEW]/[MODIFIED]/[EXISTING]

**State Definition**:

<!-- AI-NOTE: Use actual state management pattern from techs knowledge (Provider/Bloc/Riverpod for Flutter, Redux/MobX for React Native) -->

```dart
// AI-NOTE: Example for Flutter Provider
// File: lib/providers/{store-name}.dart
import 'package:flutter/foundation.dart';

class {StoreName}Provider with ChangeNotifier {
  // State
  {Type} _{stateField} = {initialValue};
  
  // Getters
  {Type} get {stateField} => _{stateField};
  
  // Actions/Methods
  Future<void> {actionName}({params}) async {
    // Implementation
    notifyListeners();
  }
}
```

**Actions/Events and Effects**:

| Action/Event | Parameters | Description | API Calls |
|-------------|-----------|-------------|-----------|
| {action} | {params} | {description} | {api references} |

## 6. API Layer

### 6.1 API Functions

<!-- AI-NOTE: Follow actual API layer patterns from conventions-dev.md. Include request/response types. -->

```dart
// AI-NOTE: Example for Flutter with Dio
// File: lib/api/{module}.dart
import 'package:dio/dio.dart';

class {Module}Api {
  final Dio _dio;
  
  {Module}Api(this._dio);
  
  Future<{ResponseType}> {functionName}({RequestType} params) async {
    final response = await _dio.{method}('{path}', data: params);
    return {ResponseType}.fromJson(response.data);
  }
}
```

### 6.2 Error Handling

| Error Code | HTTP Status | Mobile Handling | User Feedback |
|-----------|-------------|-----------------|---------------|
| {code} | {status} | {handling logic} | {message/snackbar/dialog} |

### 6.3 Caching Strategy

<!-- AI-NOTE: Document API response caching approach if applicable -->

| API | Cache Strategy | TTL | Invalidation Trigger |
|-----|---------------|-----|---------------------|
| {api} | {strategy} | {duration} | {trigger} |

## 7. Local Storage Design

### 7.1 Storage Strategy

<!-- AI-NOTE: Document storage solution: SharedPreferences, Hive, SQLite, MMKV, etc. -->

| Data Type | Storage Solution | Key/Table | Notes |
|-----------|-----------------|-----------|-------|
| {data} | {solution} | {key} | {notes} |

### 7.2 Data Schema

<!-- AI-NOTE: If using structured storage (SQLite, Hive), document schema -->

```dart
// AI-NOTE: Example Hive type adapter
@HiveType(typeId: 1)
class {ModelName} {
  @HiveField(0)
  final String id;
  
  @HiveField(1)
  final String name;
}
```

### 7.3 Sync Strategy

<!-- AI-NOTE: Document offline-first patterns if applicable -->

| Scenario | Strategy | Conflict Resolution |
|----------|----------|---------------------|
| {scenario} | {strategy} | {resolution} |

## 8. Platform-Specific Features

### 8.1 Permissions Required

| Permission | Platform | Purpose | Fallback |
|------------|----------|---------|----------|
| {permission} | iOS/Android/Both | {purpose} | {fallback behavior} |

### 8.2 Native Integration

| Feature | Implementation | Platform Channel | Notes |
|---------|---------------|------------------|-------|
| {feature} | {plugin/package} | {channel name} | {notes} |

## 9. App Lifecycle Handling

- **Background/Foreground Transitions**: {description}
- **State Persistence on App Kill**: {description}
- **Push Notification Handling**: {description for different app states}

## 10. Unit Test Points

| Test Target | Test Scenario | Expected Behavior |
|-------------|--------------|-------------------|
| {screen/widget} | {scenario description} | {expected result} |
| {provider/store} | {scenario description} | {expected result} |
| {api function} | {scenario description} | {expected result} |

---

**Document Status**: Draft / In Review / Published
**Last Updated**: {Date}
**Related Feature Spec**: [{Feature Name}]({FeatureSpecPath})
