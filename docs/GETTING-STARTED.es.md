# Guía de Inicio Rápido de SpecCrew

<p align="center">
  <a href="./GETTING-STARTED.md">简体中文</a> |
  <a href="./GETTING-STARTED.zh-TW.md">繁體中文</a> |
  <a href="./GETTING-STARTED.en.md">English</a> |
  <a href="./GETTING-STARTED.ko.md">한국어</a> |
  <a href="./GETTING-STARTED.de.md">Deutsch</a> |
  <a href="./GETTING-STARTED.es.md">Español</a> |
  <a href="./GETTING-STARTED.fr.md">Français</a> |
  <a href="./GETTING-STARTED.it.md">Italiano</a> |
  <a href="./GETTING-STARTED.da.md">Dansk</a> |
  <a href="./GETTING-STARTED.ja.md">日本語</a> |
  <a href="./GETTING-STARTED.ar.md">العربية</a>
</p>

Este documento le ayuda a comprender rápidamente cómo usar el equipo de Agentes de SpecCrew para completar el desarrollo completo desde los requisitos hasta la entrega siguiendo procesos de ingeniería estándar.

---

## 1. Requisitos Previos

### Instalar SpecCrew

```bash
npm install -g speccrew
```

### Inicializar Proyecto

```bash
speccrew init --ide qoder
```

IDEs soportados: `qoder`, `cursor`, `claude`, `codex`

### Estructura de Directorios Después de la Inicialización

```
.
├── .qoder/
│   ├── agents/          # Archivos de definición de Agentes
│   └── skills/          # Archivos de definición de Skills
├── speccrew-workspace/  # Espacio de trabajo
│   ├── docs/            # Configuraciones, reglas, plantillas, soluciones
│   ├── iterations/      # Iteraciones en curso
│   ├── iteration-archives/  # Iteraciones archivadas
│   └── knowledges/      # Base de conocimientos
│       ├── base/        # Información básica (informes de diagnóstico, deudas técnicas)
│       ├── bizs/        # Base de conocimientos de negocio
│       └── techs/       # Base de conocimientos técnica
```

### Referencia Rápida de Comandos CLI

| Comando | Descripción |
|------|------|
| `speccrew list` | Listar todos los Agentes y Skills disponibles |
| `speccrew doctor` | Verificar integridad de la instalación |
| `speccrew update` | Actualizar configuración del proyecto a la última versión |
| `speccrew uninstall` | Desinstalar SpecCrew |

---

## 2. Inicio Rápido en 5 Minutos Después de la Instalación

Después de ejecutar `speccrew init`, siga estos pasos para entrar rápidamente en estado de trabajo:

### Paso 1: Elija Su IDE

| IDE | Comando de Inicialización | Escenario de Aplicación |
|-----|-----------|----------|
| **Qoder** (Recomendado) | `speccrew init --ide qoder` | Orquestación completa de agentes, workers paralelos |
| **Cursor** | `speccrew init --ide cursor` | Workflows basados en Composer |
| **Claude Code** | `speccrew init --ide claude` | Desarrollo CLI-first |
| **Codex** | `speccrew init --ide codex` | Integración ecosistema OpenAI |

### Paso 2: Inicializar Base de Conocimientos (Recomendado)

Para proyectos con código fuente existente, se recomienda inicializar primero la base de conocimientos para que los agentes comprendan su base de código:

```
@speccrew-team-leader inicializar base de conocimientos técnica
```

Luego:

```
@speccrew-team-leader inicializar base de conocimientos de negocio
```

### Paso 3: Comience Su Primera Tarea

```
@speccrew-product-manager Tengo un nuevo requisito: [describa su requisito funcional]
```

> **Consejo**: Si no está seguro de qué hacer, simplemente diga `@speccrew-team-leader ayúdame a comenzar` — el Team Leader detectará automáticamente el estado de su proyecto y lo guiará.

---

## 3. Árbol de Decisión Rápido

¿No está seguro de qué hacer? Encuentre su escenario a continuación:

- **Tengo un nuevo requisito funcional**
  → `@speccrew-product-manager Tengo un nuevo requisito: [describa su requisito funcional]`

- **Quiero escanear el conocimiento del proyecto existente**
  → `@speccrew-team-leader inicializar base de conocimientos técnica`
  → Luego: `@speccrew-team-leader inicializar base de conocimientos de negocio`

- **Quiero continuar el trabajo anterior**
  → `@speccrew-team-leader ¿cuál es el progreso actual?`

- **Quiero verificar el estado de salud del sistema**
  → Ejecutar en terminal: `speccrew doctor`

- **No estoy seguro de qué hacer**
  → `@speccrew-team-leader ayúdame a comenzar`
  → El Team Leader detectará automáticamente el estado de su proyecto y lo guiará

---

## 4. Referencia Rápida de Agentes

| Rol | Agente | Responsabilidades | Ejemplo de Comando |
|------|-------|-----------------|-----------------|
| Líder de Equipo | `@speccrew-team-leader` | Navegación del proyecto, inicialización de base de conocimientos, verificación de estado | "Ayúdame a comenzar" |
| Gerente de Producto | `@speccrew-product-manager` | Análisis de requisitos, generación de PRD | "Tengo un nuevo requisito: ..." |
| Diseñador de Funcionalidades | `@speccrew-feature-designer` | Análisis funcional, diseño de especificaciones, contratos API | "Iniciar diseño de funcionalidades para iteración X" |
| Diseñador de Sistema | `@speccrew-system-designer` | Diseño de arquitectura, diseño detallado por plataforma | "Iniciar diseño de sistema para iteración X" |
| Desarrollador de Sistema | `@speccrew-system-developer` | Coordinación de desarrollo, generación de código | "Iniciar desarrollo para iteración X" |
| Gerente de Pruebas | `@speccrew-test-manager` | Planificación de pruebas, diseño de casos, ejecución | "Iniciar pruebas para iteración X" |

> **Nota**: No necesita recordar todos los agentes. Simplemente hable con `@speccrew-team-leader` y él enrutará su solicitud al agente correcto.

---

## 5. Visión General del Flujo de Trabajo

### Diagrama de Flujo Completo

```mermaid
flowchart LR
    PRD[Fase 1<br/>Análisis de Requisitos<br/>Product Manager] --> FD[Fase 2<br/>Diseño de Funcionalidades<br/>Feature Designer]
    FD --> SD[Fase 3<br/>Diseño del Sistema<br/>System Designer]
    SD --> DEV[Fase 4<br/>Desarrollo<br/>System Developer]
    DEV --> TEST[Fase 5<br/>Pruebas del Sistema<br/>Test Manager]
    TEST --> ARCHIVE[Fase 6<br/>Archivo]
    
    KB[(Base de Conocimientos<br/>Durante Todo el Proceso)] -.-> PRD
    KB -.-> FD
    KB -.-> SD
    KB -.-> DEV
    KB -.-> TEST
```

### Principios Fundamentales

1. **Dependencias de Fases**: El entregable de cada fase es la entrada para la siguiente fase
2. **Confirmación de Checkpoint**: Cada fase tiene un punto de confirmación que requiere aprobación del usuario antes de proceder a la siguiente fase
3. **Impulsado por Base de Conocimientos**: La base de conocimientos se ejecuta durante todo el proceso, proporcionando contexto para todas las fases

---

## 6. Paso Cero: Inicialización de la Base de Conocimientos

Antes de comenzar el proceso formal de ingeniería, necesita inicializar la base de conocimientos del proyecto.

### 6.1 Inicialización de la Base de Conocimientos Técnica

**Ejemplo de Conversación**:
```
@speccrew-team-leader inicializar base de conocimientos técnica
```

**Proceso de Tres Fases**:
1. Detección de Plataforma — Identificar plataformas técnicas en el proyecto
2. Generación de Documentación Técnica — Generar documentos de especificación técnica para cada plataforma
3. Generación de Índice — Establecer índice de la base de conocimientos

**Entregable**:
```
speccrew-workspace/knowledges/techs/{platform-id}/
├── tech-stack.md          # Definición del stack tecnológico
├── architecture.md        # Convenciones de arquitectura
├── dev-spec.md            # Especificaciones de desarrollo
├── test-spec.md           # Especificaciones de pruebas
└── INDEX.md               # Archivo de índice
```

### 6.2 Inicialización de la Base de Conocimientos de Negocio

**Ejemplo de Conversación**:
```
@speccrew-team-leader inicializar base de conocimientos de negocio
```

**Proceso de Cuatro Fases**:
1. Inventario de Funcionalidades — Escanear código para identificar todas las funcionalidades
2. Análisis de Funcionalidades — Analizar la lógica de negocio para cada funcionalidad
3. Resumen por Módulo — Resumir funcionalidades por módulo
4. Resumen del Sistema — Generar vista general de negocio a nivel de sistema

**Entregable**:
```
speccrew-workspace/knowledges/bizs/
├── {platform-type}/
│   └── {module-name}/
│       └── feature-spec.md
└── system-overview.md
```

---

## 7. Guía de Conversación Fase por Fase

### 7.1 Fase 1: Análisis de Requisitos (Product Manager)

**Cómo Iniciar**:
```
@speccrew-product-manager Tengo un nuevo requisito: [describa su requisito]
```

**Flujo de Trabajo del Agente**:
1. Leer la visión general del sistema para comprender los módulos existentes
2. Analizar los requisitos del usuario
3. Generar documento PRD estructurado

**Entregable**:
```
iterations/{número}-{tipo}-{nombre}/01.product-requirement/
├── [feature-name]-prd.md           # Documento de Requisitos de Producto
└── [feature-name]-bizs-modeling.md # Modelado de negocio (para requisitos complejos)
```

**Lista de Verificación de Confirmación**:
- [ ] ¿La descripción del requisito refleja con precisión la intención del usuario?
- [ ] ¿Las reglas de negocio están completas?
- [ ] ¿Los puntos de integración con sistemas existentes están claros?
- [ ] ¿Los criterios de aceptación son medibles?

---

### 7.2 Fase 2: Diseño de Funcionalidades (Feature Designer)

**Cómo Iniciar**:
```
@speccrew-feature-designer iniciar diseño de funcionalidades
```

**Flujo de Trabajo del Agente**:
1. Localizar automáticamente el documento PRD confirmado
2. Cargar base de conocimientos de negocio
3. Generar diseño de funcionalidad (incluyendo wireframes UI, flujos de interacción, definiciones de datos, contratos API)
4. Para múltiples PRD, usar Task Worker para diseño paralelo

**Entregable**:
```
iterations/{iter}/02.feature-design/
└── [feature-name]-feature-spec.md  # Documento de diseño de funcionalidad
```

**Lista de Verificación de Confirmación**:
- [ ] ¿Están cubiertos todos los escenarios de usuario?
- [ ] ¿Los flujos de interacción están claros?
- [ ] ¿Las definiciones de campos de datos están completas?
- [ ] ¿El manejo de excepciones es completo?

---

### 7.3 Fase 3: Diseño del Sistema (System Designer)

**Cómo Iniciar**:
```
@speccrew-system-designer iniciar diseño del sistema
```

**Flujo de Trabajo del Agente**:
1. Localizar Feature Spec y API Contract
2. Cargar base de conocimientos técnica (stack tecnológico, arquitectura, especificaciones para cada plataforma)
3. **Checkpoint A**: Evaluación de Framework — Analizar brechas técnicas, recomendar nuevos frameworks (si es necesario), esperar confirmación del usuario
4. Generar DESIGN-OVERVIEW.md
5. Usar Task Worker para distribuir paralelamente el diseño para cada plataforma (frontend/backend/móvil/desktop)
6. **Checkpoint B**: Confirmación Conjunta — Mostrar resumen de todos los diseños de plataforma, esperar confirmación del usuario

**Entregable**:
```
iterations/{iter}/03.system-design/
├── DESIGN-OVERVIEW.md              # Visión general del diseño
├── {platform-id}/
│   ├── INDEX.md                    # Índice de diseño por plataforma
│   └── {module}-design.md          # Diseño de módulo nivel pseudocódigo
```

**Lista de Verificación de Confirmación**:
- [ ] ¿El pseudocódigo usa la sintaxis real del framework?
- [ ] ¿Los contratos API cross-plataforma son consistentes?
- [ ] ¿La estrategia de manejo de errores es unificada?

---

### 7.4 Fase 4: Desarrollo (System Developer)

**Cómo Iniciar**:
```
@speccrew-system-developer iniciar desarrollo
```

**Flujo de Trabajo del Agente**:
1. Leer documentos de diseño del sistema
2. Cargar conocimientos técnicos para cada plataforma
3. **Checkpoint A**: Pre-verificación de Entorno — Verificar versiones runtime, dependencias, disponibilidad de servicios; esperar resolución del usuario si falla
4. Usar Task Worker para distribuir paralelamente el desarrollo para cada plataforma
5. Verificación de integración: alineación de contratos API, consistencia de datos
6. Producir informe de entrega

**Entregable**:
```
# El código fuente se escribe en el directorio fuente real del proyecto
iterations/{iter}/04.development/
├── {platform-id}/
│   └── tasks/                      # Registros de tareas de desarrollo
└── delivery-report.md
```

**Lista de Verificación de Confirmación**:
- [ ] ¿El entorno está listo?
- [ ] ¿Los problemas de integración están en un rango aceptable?
- [ ] ¿El código cumple con las especificaciones de desarrollo?

---

### 7.5 Fase 5: Pruebas del Sistema (Test Manager)

**Cómo Iniciar**:
```
@speccrew-test-manager iniciar pruebas
```

**Proceso de Pruebas en Tres Fases**:

| Fase | Descripción | Checkpoint |
|-------|-------------|------------|
| Diseño de Casos de Prueba | Generar casos de prueba basados en PRD y Feature Spec | A: Mostrar estadísticas de cobertura de casos y matriz de trazabilidad, esperar confirmación del usuario de cobertura suficiente |
| Generación de Código de Prueba | Generar código de prueba ejecutable | B: Mostrar archivos de prueba generados y mapeo de casos, esperar confirmación del usuario |
| Ejecución de Pruebas e Informe de Bugs | Ejecutar automáticamente pruebas y generar informes | Ninguno (ejecución automática) |

**Entregable**:
```
iterations/{iter}/05.system-test/
├── cases/
│   └── {platform-id}/              # Documentos de casos de prueba
├── code/
│   └── {platform-id}/              # Plan de código de prueba
├── reports/
│   └── test-report-{date}.md       # Informe de prueba
└── bugs/
    └── BUG-{id}-{title}.md         # Informes de bug (un archivo por bug)
```

**Lista de Verificación de Confirmación**:
- [ ] ¿La cobertura de casos está completa?
- [ ] ¿El código de prueba es ejecutable?
- [ ] ¿La evaluación de severidad de bugs es precisa?

---

### 7.6 Fase 6: Archivado

Las iteraciones se archivan automáticamente después de completarse:

```
speccrew-workspace/iteration-archives/
└── {número}-{tipo}-{nombre}-{fecha}/
    ├── 01.product-requirement/
    ├── 02.feature-design/
    ├── 03.system-design/
    ├── 04.development/
    └── 05.system-test/
```

---

## 8. Visión General de la Base de Conocimientos

### 8.1 Base de Conocimientos de Negocio (bizs)

**Propósito**: Almacenar descripciones de funcionalidades de negocio del proyecto, divisiones de módulos, características API

**Estructura de Directorios**:
```
knowledges/bizs/
├── {platform-type}/
│   └── {module-name}/
│       └── feature-spec.md
└── system-overview.md
```

**Escenarios de Uso**: Product Manager, Feature Designer

### 8.2 Base de Conocimientos Técnica (techs)

**Propósito**: Almacenar stack tecnológico del proyecto, convenciones de arquitectura, especificaciones de desarrollo, especificaciones de prueba

**Estructura de Directorios**:
```
knowledges/techs/{platform-id}/
├── tech-stack.md
├── architecture.md
├── dev-spec.md
├── test-spec.md
└── INDEX.md
```

**Escenarios de Uso**: System Designer, System Developer, Test Manager

---

## 9. Gestión de Progreso del Flujo de Trabajo

El equipo virtual SpecCrew sigue un mecanismo estricto de paso de fases donde cada fase debe ser confirmada por el usuario antes de pasar a la siguiente. También soporta ejecución reanudable — cuando se reinicia después de una interrupción, continúa automáticamente desde donde se detuvo.

### 9.1 Tres Capas de Archivos de Progreso

El flujo de trabajo mantiene automáticamente tres tipos de archivos JSON de progreso, ubicados en el directorio de iteración:

| Archivo | Ubicación | Propósito |
|------|----------|---------|
| `WORKFLOW-PROGRESS.json` | `iterations/{iter}/` | Registra el estado de cada etapa del pipeline |
| `.checkpoints.json` | Bajo cada directorio de fase | Registra el estado de confirmación de checkpoints del usuario |
| `DISPATCH-PROGRESS.json` | Bajo cada directorio de fase | Registra el progreso item por item para tareas paralelas (multi-plataforma/multi-módulo) |

### 9.2 Flujo de Estado de Fase

Cada fase sigue este flujo de estado:

```
pending → in_progress → completed → confirmed
```

- **pending**: Aún no iniciado
- **in_progress**: En ejecución
- **completed**: Ejecución del agente completada, esperando confirmación del usuario
- **confirmed**: Usuario confirmado a través del checkpoint final, la siguiente fase puede comenzar

### 9.3 Ejecución Reanudable

Al reiniciar un Agente para una fase:

1. **Verificación automática upstream**: Verifica si la fase anterior está confirmada, bloquea y notifica si no
2. **Recuperación de Checkpoint**: Lee `.checkpoints.json`, salta checkpoints pasados, continúa desde el último punto de interrupción
3. **Recuperación de Tareas Paralelas**: Lee `DISPATCH-PROGRESS.json`, solo re-ejecuta tareas con estado `pending` o `failed`, salta tareas `completed`

### 9.4 Ver Progreso Actual

Ver el estado panorámico del pipeline a través del Agente Team Leader:

```
@speccrew-team-leader ver progreso actual de la iteración
```

El Team Leader leerá los archivos de progreso y mostrará una visión general del estado similar a:

```
Pipeline Status: i001-user-management
  01 PRD:            ✅ Confirmed
  02 Feature Design: 🔄 In Progress (Checkpoint A passed)
  03 System Design:  ⏳ Pending
  04 Development:    ⏳ Pending
  05 System Test:    ⏳ Pending
```

### 9.5 Compatibilidad Hacia Atrás

El mecanismo de archivos de progreso es completamente compatible hacia atrás — si los archivos de progreso no existen (por ej. en proyectos legacy o nuevas iteraciones), todos los Agentes se ejecutarán normalmente según la lógica original.

---

## 10. Preguntas Frecuentes (FAQ)

### P1: ¿Qué hacer si el Agente no funciona como se espera?

1. Ejecutar `speccrew doctor` para verificar integridad de la instalación
2. Confirmar que la base de conocimientos ha sido inicializada
3. Confirmar que el entregable de la fase anterior existe en el directorio de iteración actual

### P2: ¿Cómo saltar una fase?

**No recomendado** — La salida de cada fase es la entrada de la siguiente fase.

Si debe saltar, prepare manualmente el documento de entrada de la fase correspondiente y asegúrese de que cumpla con las especificaciones de formato.

### P3: ¿Cómo manejar múltiples requisitos paralelos?

Cree directorios de iteración independientes para cada requisito:
```
iterations/
├── 001-feature-xxx/
├── 002-feature-yyy/
└── 003-feature-zzz/
```

Cada iteración está completamente aislada y no afecta a las demás.

### P4: ¿Cómo actualizar la versión de SpecCrew?

La actualización requiere dos pasos:

```bash
# Paso 1: Actualizar la herramienta CLI global
npm install -g speccrew@latest

# Paso 2: Sincronizar Agents y Skills en su directorio de proyecto
cd /path/to/your-project
speccrew update
```

- `npm install -g speccrew@latest`: Actualiza la herramienta CLI en sí (las nuevas versiones pueden incluir nuevas definiciones de Agent/Skill, correcciones de bugs, etc.)
- `speccrew update`: Sincroniza los archivos de definición de Agent y Skill de su proyecto a la última versión
- `speccrew update --ide cursor`: Actualiza la configuración para un IDE específico únicamente

> **Nota**: Ambos pasos son necesarios. Ejecutar solo `speccrew update` no actualizará la herramienta CLI en sí; ejecutar solo `npm install` no actualizará los archivos del proyecto.

### P5: `speccrew update` indica que hay una nueva versión disponible pero `npm install -g speccrew@latest` sigue instalando la versión antigua?

Esto generalmente es causado por el caché de npm. Solución:

```bash
# Limpiar caché de npm y reinstalar
npm cache clean --force
npm install -g speccrew@latest

# Verificar versión
npm list -g speccrew
```

Si aún no funciona, intente instalar con un número de versión específico:
```bash
npm install -g speccrew@0.5.6
```

### P6: ¿Cómo ver iteraciones históricas?

Después del archivado, ver en `speccrew-workspace/iteration-archives/`, organizado por formato `{número}-{tipo}-{nombre}-{fecha}/`.

### P7: ¿La base de conocimientos necesita actualizaciones regulares?

Se requiere re-inicialización en las siguientes situaciones:
- Cambios mayores en la estructura del proyecto
- Actualización o reemplazo del stack tecnológico
- Adición/eliminación de módulos de negocio

---

## 11. Referencia Rápida

### Referencia Rápida de Inicio de Agentes

| Fase | Agente | Conversación de Inicio |
|-------|-------|-------------------|
| Inicialización | Team Leader | `@speccrew-team-leader inicializar base de conocimientos técnica` |
| Análisis de Requisitos | Product Manager | `@speccrew-product-manager Tengo un nuevo requisito: [descripción]` |
| Diseño de Funcionalidades | Feature Designer | `@speccrew-feature-designer iniciar diseño de funcionalidades` |
| Diseño del Sistema | System Designer | `@speccrew-system-designer iniciar diseño del sistema` |
| Desarrollo | System Developer | `@speccrew-system-developer iniciar desarrollo` |
| Pruebas del Sistema | Test Manager | `@speccrew-test-manager iniciar pruebas` |

### Lista de Verificación de Checkpoints

| Fase | Número de Checkpoints | Elementos de Verificación Clave |
|-------|----------------------|-----------------|
| Análisis de Requisitos | 1 | Precisión de requisitos, completitud de reglas de negocio, medibilidad de criterios de aceptación |
| Diseño de Funcionalidades | 1 | Cobertura de escenarios, claridad de interacción, completitud de datos, manejo de excepciones |
| Diseño del Sistema | 2 | A: Evaluación de framework; B: Sintaxis de pseudocódigo, consistencia cross-plataforma, manejo de errores |
| Desarrollo | 1 | A: Preparación del entorno, problemas de integración, especificaciones de código |
| Pruebas del Sistema | 2 | A: Cobertura de casos; B: Ejecutabilidad del código de prueba |

### Referencia Rápida de Rutas de Entregables

| Fase | Directorio de Salida | Formato de Archivo |
|-------|-----------------|-------------|
| Análisis de Requisitos | `iterations/{iter}/01.product-requirement/` | `[name]-prd.md`, `[name]-bizs-modeling.md` |
| Diseño de Funcionalidades | `iterations/{iter}/02.feature-design/` | `[name]-feature-spec.md` |
| Diseño del Sistema | `iterations/{iter}/03.system-design/` | `DESIGN-OVERVIEW.md`, `{platform}/INDEX.md`, `{platform}/{module}-design.md` |
| Desarrollo | `iterations/{iter}/04.development/` | Código fuente + `delivery-report.md` |
| Pruebas del Sistema | `iterations/{iter}/05.system-test/` | `cases/`, `code/`, `reports/`, `bugs/` |
| Archivado | `iteration-archives/{iter}-{date}/` | Copia completa de la iteración |

---

## Próximos Pasos

1. Ejecute `speccrew init --ide qoder` para inicializar su proyecto
2. Ejecute Paso Cero: Inicialización de la Base de Conocimientos
3. ¡Progrese fase por fase según el flujo de trabajo, disfrute la experiencia de desarrollo impulsado por especificaciones!
