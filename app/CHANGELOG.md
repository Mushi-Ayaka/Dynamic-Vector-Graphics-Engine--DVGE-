## [4.1.0] - 2026-04-21 (GA)
### 🛍️ Catálogo de Plugins & Ecosystem
- **Catálogo Integrado**: Nuevo panel para descubrir y descargar plugins directamente desde el repositorio oficial de GitHub (`Mushi-Ayaka/Dynamic-Vector-Engine-Plugins`).
- **Gestión Dinámica**: Soporte para instalación, actualización y borrado de plugins desde la UI.
- **Identidad Profesional**: Inclusión de redes sociales (GitHub, Portafolio) y contacto directo vía Gmail en el modal "Acerca de".

## [4.0.0] - 2026-04-21 (GA)

### 🛡️ QA Remediation & GA Architecture
- **Sandbox Aislado**: Se selló la fuga del objeto global. Los plugins se ejecutan con `fakeWindow` y sin acceso a APIs de Electron.
- **I/O Seguro**: Autoguardado asíncrono y atómico (`.tmp`), impidiendo corrupción de proyectos si el motor se cierra abruptamente.
- **Graceful Degradation**: Captura y aislamiento de crashes en el código del plugin sin congelar la app.
- **Error Boundary Reactivo**: Interfaz protegida contra `manifest.json` malformados.
- **La API Determinística**:
  - Deprecado el soporte a librerías de tiempo real (como GSAP) en favor del nuevo objeto `ctx.timeline` (Frame math 100% precisa para renders).
  - Nueva memoria oficial de persistencia: `ctx.state` y `ctx.refs`.
  - Expansión de utilidades nativas: `utils.spring`, `utils.typewriter`, y `utils.tickerOffset`.

---

## [3.3.0] - 2026-04-21
### ✨ Editor Edition (HTML-a-Video Profesional)
- **Campos de Código (Textarea)**: Soporte para edición multilínea de HTML y CSS directamente en el sidebar. El motor ahora renderiza una caja de edición profesional para campos de tipo `code`.
- **Plugin Oficial: HTML Master Renderer**: Introducción de una plantilla de alto rendimiento diseñada específicamente para renderizar código puro sin capas de UI adicionales.
- **Botón de Guardado Manual**: Nueva opción en el sidebar para forzar la escritura en disco del proyecto, complementando el sistema de autoguardado.
- **Branding v3.3.0**: Actualización de la identidad visual en la barra de navegación y metadatos.

## [3.2.1] - 2026-04-21

### 🛠️ Auditoría y Robustez (AI-Ready)
### 🐛 Corrección Crítica — Motor de Plugins Universal
- **Bug Resuelto: Plugin Visual Estático.** El motor previamente mostraba siempre la forma del primer plugin cargado al cambiar de proyecto. Los campos del formulario tampoco se actualizaban al abrir un proyecto con un plugin diferente.

### ✨ Motor de Plugins Dinámico
- **Formulario Generativo**: El panel lateral ya no tiene campos fijos. Lee el `manifest.json` del plugin activo y genera dinámicamente los inputs correctos (`string`, `color`, `number`, `image`) para cada plugin instalado.
- **Plugin Badge**: El sidebar muestra el nombre y versión del plugin activo para contexto rápido.
- **Hard Reset en Cambio de Proyecto**: El reproductor de previsualización se destruye y recrea completamente al cambiar de proyecto (`key={activeProject.id}`), eliminando cualquier residuo visual o de estado del plugin anterior.

### 🏗️ Arquitectura
- **`useStore.ts`**: Añadidos `activePlugin`, `plugins[]`, y `initialize()`. La lista de plugins se carga una sola vez al arrancar la app y es compartida por todo el store.
- **`main.tsx`**: Llamada a `useStore.getState().initialize()` antes del primer render para pre-cargar el catálogo de plugins.
- **`App.tsx`**: Refactorizado a arquitectura data-driven. Nuevo componente `DynamicField` que renderiza cada campo del schema de forma polimórfica.

---

## [3.1.0] - 2026-04-21

### ✨ Core & Developer Experience (DX)
- **Librería de Utilidades Nativa (`dvEngine.utils`)**: Inyección automática de funciones matemáticas (`lerp`, `clamp`) y de suavizado (`easeOutCubic`, `easeOutBounce`, etc.) directamente en el objeto `dvEngine`.
- **Autoguardado Silencioso**: Implementación de persistencia automática basada en debouncing de 500ms. Los datos se guardan sin interacción del usuario.
- **Indicador de Persistencia**: Nueva UI en el panel lateral que muestra el estado del guardado en tiempo real ("Guardando..." / "Guardado a las HH:MM").

### 📖 Documentación
- **Manual Técnico V3.1**: Documentada la nueva API de utilidades y el flujo de autosave.
- **AI Guide V3.1**: Actualizado el "Prompt Maestro" para que cualquier IA aproveche las utilidades nativas, reduciendo la complejidad del código generado.

---

## [3.0.0] - 2026-04-21

### 🏗️ Arquitectura de Espacios de Trabajo (Workspace Architecture)
- **Project Manager Backend**: Rediseño del core para soportar proyectos persistentes en `Documents/DVG_Projects/<id>`.
- **Inyección V3 Lifecycle**: Migración obligatoria al objeto `{ awake, start, update }` para rendimiento máximo a 60fps sin saturación en el ShadowDOM.
- **Enlace Reactivo Nativo**: Las variables de la UI ahora impactan directamente al interior del ciclo `update()` permitiendo reactividad inmediata.

### ✨ Nuevas Características
- **Autoguardado**: Almacenamiento seguro por debouncing (500ms) de los parámetros sin botón de guardar obligatorio.
- **Generación Silenciosa**: Al seleccionar un nuevo plugin, el sistema extrae automáticamente la información predeterminada del `schema` del `manifest.json`.
- **Nuevos Manuales**: Refactorización absoluta del Manual de Uso y Creación de Documentación Técnica y Guía para LLMs.

## [2.3.0] - 2026-04-21

### 🏗️ Arquitectura (Hot-Swap)

- **Stable Bridge Pattern**: Gestión de eventos centralizada fuera del script del plugin para evitar fugas de memoria.
- **Detección de Fugas**: Limpieza automática del Shadow DOM y callbacks antes de cada recarga de código.
- **Sync Dual**: Diferenciación entre actualización de datos (Soft-Sync) y recarga de lógica (Hard-Sync).

### 🚀 Plugin Development (v2.3.0)

El nuevo motor usa arquitectura **Hot-Swap**. Los plugins deben registrar un callback a través del bridge persistente para recibir actualizaciones de frames y propiedades sin recargar el script.

1. `style.css`: Estética premium.
2. `script.js`: DEBE usar `window.dvEngine.register(({ props, frame, root }) => { ... })`. 

**REGLA ORO**: Usa `root.getElementById` en lugar de `document.getElementById` (Shadow DOM).

### ✅ Tareas Completadas

- [x] Implementación de `window.__DV_BRIDGE__` persistente.
- [x] Separación de efectos de Inyección y Sincronización.
- [x] Restauración de Soft-Sync ultra-fluido en la UI.
- [x] Actualización de Estándares en Manual de Usuario.

## [2.2.0] - 2026-04-21
### 🚀 Añadido
- **API `dvEngine.register`**: Nuevo método oficial para sincronizar frames y recibir el Shadow Root de forma segura.
- **Retrocompatibilidad**: Soporte para scripts heredados que usan `window.dvContext` y `renderFrame()`.

### 🔧 Corregido
- **Black Screen Fix**: Se consolidó el ciclo de vida del `PluginWrapper` para evitar colapsos en la inicialización del Shadow DOM.
- **Reactividad Total**: Los cambios en el panel lateral (título, color, etc.) ahora se reflejan instantáneamente en tiempo real.
- **Transparencia**: El contenedor ahora respeta el canal Alfa para exportaciones profesionales.

### 🏗️ Arquitectura
- El motor ahora es **Inmutable** y **Genético**, permitiendo inyección de código abierto sin riesgo para el core.

## [2.0.0] - "The Genetic Revolution"
- Migración de plantillas estáticas (React) a un motor de inyección dinámica mediante Shadow DOM.
- Sistema de comunicación IPC para carga de plugins externos desde `Documentos/DV_Engine_Plugins`.
- Sincronización determinista a 60fps basada en eventos `dv-update`.

## [1.0.0] - "The Native Era"
- Versión inicial con componentes `LowerThirdBasic` cableados en React.
- Renderizado ProRes 4444 básico.
