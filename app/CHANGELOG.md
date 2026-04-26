## [5.6.0] - 2026-04-26
### Project Lifecycle & Render Stability
- **Gestión Completa de Proyectos**: Implementación de un nuevo sistema de administración en la Galería (Home Menu) que permite **Renombrar** y **Eliminar** proyectos de forma segura a través de una ventana de ajustes (`ProjectSettingsModal`).
- **Control de Integridad (Integrity Check)**: El motor ahora valida la existencia de los plugins asociados a cada proyecto antes de abrir el editor. Se ha añadido un distintivo visual (`MISSING PLUGIN`) y un bloqueo preventivo para evitar fallos por dependencias faltantes.
- **Render Stability Fix (Frame 0 Protection)**: Corrección crítica en el ciclo de vida del `RenderWrapper` mediante el uso optimizado de `delayRender`. Se ha resuelto el bug que causaba que el motor de Remotion capturara el primer fotograma (Frame 0) antes de completar la hidratación de datos, eliminando videos transparentes o congelados al inicio.
- **IPC Expansion**: Nuevos canales de comunicación inter-proceso para el borrado recursivo y actualización atómica de metadatos de proyectos.
- **UI Refinement**: Integración de botones de acción rápida en la lista de proyectos, mejorando la ergonomía de navegación entre carpetas de exportación y ajustes de proyecto.

## [5.5.0] - 2026-04-23
### GA Artifact Edition (Knowledge Bridge)
- **Knowledge Bridge Nativo**: Inyección de reglas de motor (DVGE Master Rules) directamente desde el inspector mediante Arrastrar y Soltar (Drag & Drop) de un archivo `.pdf` físico auto-generado, garantizando que inteligencias artificiales (Gemini, Claude, ChatGPT) obtengan el contexto de desarrollo exacto y sin errores de parseo.
- **Auto-Generador PDF Interno**: Integración de una ventana silenciosa de Electron que compila `Rules.ts` a un archivo PDF temporal en caché, evadiendo las restricciones de "texto plano" de las IAs.
- **Studio Master Refactor**: El plugin "DVGE Studio Master" ha sido optimizado con soporte `promptHelper` estandarizado, manteniendo la fidelidad de UI.

## [5.4.0] - 2026-04-23
### Estabilización de Producción y Canal Alfa (The Alpha Fix)
- **Transparency Transformer**: Implementación de flags críticos de Chromium (`--transparent-background-color=0`) y `evaluatePage` para garantizar transparencia real en ProRes 4444.
- **Data Probe System**: Nuevo sistema de inyección de datos vía endpoint interno (`/props.json`) para evitar pérdida de efectos complejos por límites de CLI en Windows.
- **Engine Compatibility**: Polyfill de `getElementById` en el contenedor root de plugins para soportar lógica heredada y compleja.
- **Chrome System Bypass**: Forzado de uso del ejecutable de Chrome del sistema para mayor fiabilidad en entornos Windows.
- **Optimización DaVinci**: Ajuste de pixel format a `yuva444p10le` con metadatos de transparencia verificados.

## [5.3.0] - 2026-04-23
### Auditoría de Infraestructura y Estabilización (Kernel Hardening)
- **Resolución definitiva de "Black Background"**:
    - **Diagnóstico de Transparencia**: Se descubrió que el renderizado en ProRes 4444 (vía Remotion) generaba videos correctos pero 100% transparentes, que los reproductores de Windows interpretan como negro sólido. Se ha restaurado la transparencia profesional para broadcast.
    - **Bypass de Chrome de Sistema**: Implementación de un bypass que utiliza el binario oficial de Google Chrome instalado en el sistema (`C:\Program Files...`) en lugar del `chrome-headless-shell` de Remotion, resolviendo fallos de captura silenciosos.
- **Kernel Logging (Caja Negra)**:
    - Inyección de un sistema de registro físico (`render_debug.log`) que captura peticiones del servidor interno, errores 404 y logs de la consola del navegador en tiempo real durante el renderizado.
- **Hardening de Rasterización**:
    - Forzado de flags de rasterización por CPU (`--force-cpu-rasterization`) para garantizar la captura de frames incluso ante fallos de drivers de GPU en Windows.

## [5.2.0] - 2026-04-23
### Aislamiento "Muro de Hierro" (Bug Purge)
- **Servidor de Aislamiento Manual**: Implementación de un servidor HTTP independiente (`serve()`) para el renderizado headless. Esto elimina el conflicto donde Remotion intentaba cargar código desde el puerto 3000 de Vite, resolviendo el error de "Fondo Negro".
- **Naming Convention Strict**: Migración de IDs de composición a `kebab-case` (`lower-third-basic`) para cumplir con las validaciones de Remotion 4.x.
- **Motor Síncrono Determinista**: Refactorización de `RenderWrapper` para garantizar que la inyección del DOM ocurra de forma atómica antes de la captura del frame.
- **Transparencia Nativa**: Restauración del canal alfa real para exportaciones ProRes 4444.

## [5.1.0] - 2026-04-23 (GA)
### Motor de Renderizado de Nueva Generación (Zero-Bundle Runtime)
- **Arquitectura Zero-Bundle**: Eliminación de `@remotion/bundler` del runtime. El entry point de Remotion se pre-compila en tiempo de build, eliminando webpack/rspack/esbuild del instalador.
- **Instalación Rápida**: El instalador pasa de copiar 12,466 archivos a un único `app.asar`, reduciendo el tiempo de instalación de minutos a segundos.
- **`binariesDirectory` Explícito**: Los binarios nativos (`remotion.exe`, `ffmpeg.exe`) se resuelven directamente desde `app.asar.unpacked`, eliminando errores `ENOENT` en producción.
- **CWD Seguro**: El proceso de renderizado redirige el directorio de trabajo a `%TEMP%` antes de ejecutar, evitando errores `EPERM` al intentar escribir en `C:\Program Files`.
- **Compatibilidad Total**: El render en `npm run dev` y en producción es idéntico. Sin cambios en la API de plugins.

## [5.0.0] - 2026-04-22 (GA)
### Smart Engine & Auto-Rescue
- **Capa de Inteligencia (Auto-Rescate)**: El motor ahora detecta y envuelve automáticamente scripts que no sigan el estándar de registro oficial (p. ej., detectando funciones globales como `update` o `renderDVGE`).
- **Sandbox Resiliente**: Inyección de un `fakeWindow` inteligente que silencia llamadas no determinísticas como `requestAnimationFrame`, protegiendo la integridad del renderizado ProRes 4444.
- **Simplificación de API**: Introducción de `ctx.utils.loop(frame, duration)` para facilitar la creación de animaciones cíclicas perfectas.
- **AI-Native Workflow**: El motor ahora es capaz de ejecutar código generado por IA con una tasa de éxito 'One-Shot' significativamente mayor gracias a su capacidad de perdón estructural.

## [4.1.0] - 2026-04-21 (GA)
### Catálogo de Plugins & Ecosystem
- **Catálogo Integrado**: Nuevo panel para descubrir y descargar plugins directamente desde el repositorio oficial de GitHub (`Mushi-Ayaka/Dynamic-Vector-Engine-Plugins`).
- **Gestión Dinámica**: Soporte para instalación, actualización y borrado de plugins desde la UI.
- **Identidad Profesional**: Inclusión de redes sociales (GitHub, Portafolio) y contacto directo vía Gmail en el modal "Acerca de".

## [4.0.0] - 2026-04-21 (GA)

### QA Remediation & GA Architecture
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

### Auditoría y Robustez (AI-Ready)
### Corrección Crítica — Motor de Plugins Universal
- **Bug Resuelto: Plugin Visual Estático.** El motor previamente mostraba siempre la forma del primer plugin cargado al cambiar de proyecto. Los campos del formulario tampoco se actualizaban al abrir un proyecto con un plugin diferente.

### ✨ Motor de Plugins Dinámico
- **Formulario Generativo**: El panel lateral ya no tiene campos fijos. Lee el `manifest.json` del plugin activo y genera dinámicamente los inputs correctos (`string`, `color`, `number`, `image`) para cada plugin instalado.
- **Plugin Badge**: El sidebar muestra el nombre y versión del plugin activo para contexto rápido.
- **Hard Reset en Cambio de Proyecto**: El reproductor de previsualización se destruye y recrea completamente al cambiar de proyecto (`key={activeProject.id}`), eliminando cualquier residuo visual o de estado del plugin anterior.

### Arquitectura
- **`useStore.ts`**: Añadidos `activePlugin`, `plugins[]`, y `initialize()`. La lista de plugins se carga una sola vez al arrancar la app y es compartida por todo el store.
- **`main.tsx`**: Llamada a `useStore.getState().initialize()` antes del primer render para pre-cargar el catálogo de plugins.
- **`App.tsx`**: Refactorizado a arquitectura data-driven. Nuevo componente `DynamicField` que renderiza cada campo del schema de forma polimórfica.

---

## [3.1.0] - 2026-04-21

### ✨ Core & Developer Experience (DX)
- **Librería de Utilidades Nativa (`dvEngine.utils`)**: Inyección automática de funciones matemáticas (`lerp`, `clamp`) y de suavizado (`easeOutCubic`, `easeOutBounce`, etc.) directamente en el objeto `dvEngine`.
- **Autoguardado Silencioso**: Implementación de persistencia automática basada en debouncing de 500ms. Los datos se guardan sin interacción del usuario.
- **Indicador de Persistencia**: Nueva UI en el panel lateral que muestra el estado del guardado en tiempo real ("Guardando..." / "Guardado a las HH:MM").

### Documentación
- **Manual Técnico V3.1**: Documentada la nueva API de utilidades y el flujo de autosave.
- **AI Guide V3.1**: Actualizado el "Prompt Maestro" para que cualquier IA aproveche las utilidades nativas, reduciendo la complejidad del código generado.

---

## [3.0.0] - 2026-04-21

### Arquitectura de Espacios de Trabajo (Workspace Architecture)
- **Project Manager Backend**: Rediseño del core para soportar proyectos persistentes en `Documents/DVG_Projects/<id>`.
- **Inyección V3 Lifecycle**: Migración obligatoria al objeto `{ awake, start, update }` para rendimiento máximo a 60fps sin saturación en el ShadowDOM.
- **Enlace Reactivo Nativo**: Las variables de la UI ahora impactan directamente al interior del ciclo `update()` permitiendo reactividad inmediata.

### ✨ Nuevas Características
- **Autoguardado**: Almacenamiento seguro por debouncing (500ms) de los parámetros sin botón de guardar obligatorio.
- **Generación Silenciosa**: Al seleccionar un nuevo plugin, el sistema extrae automáticamente la información predeterminada del `schema` del `manifest.json`.
- **Nuevos Manuales**: Refactorización absoluta del Manual de Uso y Creación de Documentación Técnica y Guía para LLMs.

## [2.3.0] - 2026-04-21

### Arquitectura (Hot-Swap)

- **Stable Bridge Pattern**: Gestión de eventos centralizada fuera del script del plugin para evitar fugas de memoria.
- **Detección de Fugas**: Limpieza automática del Shadow DOM y callbacks antes de cada recarga de código.
- **Sync Dual**: Diferenciación entre actualización de datos (Soft-Sync) y recarga de lógica (Hard-Sync).

### Plugin Development (v2.3.0)

El nuevo motor usa arquitectura **Hot-Swap**. Los plugins deben registrar un callback a través del bridge persistente para recibir actualizaciones de frames y propiedades sin recargar el script.

1. `style.css`: Estética premium.
2. `script.js`: DEBE usar `window.dvEngine.register(({ props, frame, root }) => { ... })`.

**REGLA ORO**: Usa `root.getElementById` en lugar de `document.getElementById` (Shadow DOM).

### Tareas Completadas

- [x] Implementación de `window.__DV_BRIDGE__` persistente.
- [x] Separación de efectos de Inyección y Sincronización.
- [x] Restauración de Soft-Sync ultra-fluido en la UI.
- [x] Actualización de Estándares en Manual de Usuario.

## [2.2.0] - 2026-04-21
### Añadido
- **API `dvEngine.register`**: Nuevo método oficial para sincronizar frames y recibir el Shadow Root de forma segura.
- **Retrocompatibilidad**: Soporte para scripts heredados que usan `window.dvContext` y `renderFrame()`.

### Corregido
- **Black Screen Fix**: Se consolidó el ciclo de vida del `PluginWrapper` para evitar colapsos en la inicialización del Shadow DOM.
- **Reactividad Total**: Los cambios en el panel lateral (título, color, etc.) ahora se reflejan instantáneamente en tiempo real.
- **Transparencia**: El contenedor ahora respeta el canal Alfa para exportaciones profesionales.

### Arquitectura
- El motor ahora es **Inmutable** y **Genético**, permitiendo inyección de código abierto sin riesgo para el core.

## [2.0.0] - "The Genetic Revolution"
- Migración de plantillas estáticas (React) a un motor de inyección dinámica mediante Shadow DOM.
- Sistema de comunicación IPC para carga de plugins externos desde `Documentos/DV_Engine_Plugins`.
- Sincronización determinista a 60fps basada en eventos `dv-update`.

## [1.0.0] - "The Native Era"
- Versión inicial con componentes `LowerThirdBasic` cableados en React.
- Renderizado ProRes 4444 básico.
