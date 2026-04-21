# Documentación Técnica: Dynamic Vector Graphics Engine (DVGE) v3.2.0

## Introducción

El **Dynamic Vector Graphics Engine (DVGE)** es una aplicación de escritorio diseñada para la creación, previsualización y exportación de gráficos dinámicos de tipo broadcast (como bandas de texto, títulos y callouts). Su objetivo es integrarse sin fricciones al flujo de trabajo de cualquier productor o editor audiovisual, generando archivos de video con canal Alfa (transparencia) listos para ser usados sobre cualquier material de video.

---

## 1. Arquitectura General del Sistema

La aplicación se basa en una arquitectura híbrida de doble proceso separados por un puente de comunicación interno (IPC).

```
┌──────────────────────────────────────────────────┐
│   PROCESO DEL RENDERIZADOR (Interfaz de Usuario)  │
│   React + Zustand + Motor de Previsualización     │
└──────────────────┬───────────────────────────────┘
                   │  IPC (inter-process communication)
┌──────────────────▼───────────────────────────────┐
│   PROCESO PRINCIPAL (Backend)                     │
│   Node.js → PluginManager + ProjectManager        │
│           → Renderizador de Video (sin ventana)   │
└──────────────────────────────────────────────────┘
```

### 1.1 Proceso del Renderizador (Frontend)

Gestiona toda la interfaz de usuario: formularios de propiedades, el reproductor de previsualización en tiempo real a 60fps, y el estado global de la sesión a través de un store reactivo. El sistema de previsualización convierte directamente la animación del plugin activo en un flujo de imágenes renderizadas cuadro por cuadro.

### 1.2 Proceso Principal (Backend)

Corre en el entorno de Node.js y se responsabiliza de:
- Leer y escribir archivos en el sistema de archivos del usuario.
- Gestionar los proyectos y su persistencia local.
- Ejecutar el proceso de renderizado a video en segundo plano.
- Escanear la carpeta de plugins del sistema.

### 1.3 Política de Seguridad de Contenido (CSP)

El motor evalúa el código JavaScript de los plugins en tiempo de ejecución mediante un mecanismo de evaluación dinámica dentro de un Shadow DOM aislado. Esta arquitectura exige permisos de ejecución de código dinámico que el entorno de ventanas de escritorio reportaría como advertencia. Para suprimir estas advertencias (que son falsas alarmas en el contexto de una aplicación de escritorio controlada), se establece la bandera `ELECTRON_DISABLE_SECURITY_WARNINGS` en tiempo de inicio.

> **Nota de seguridad:** Los plugins son archivos JavaScript locales instalados manualmente por el usuario. El motor nunca descarga ni ejecuta código de fuentes externas o de red.

---

## 2. Gestión de Proyectos

Cada gráfico en producción se guarda como un **Proyecto** independiente. Esta separación garantiza que múltiples producciones convivan sin interferir entre sí.

### 2.1 Estructura de Directorios

```
Documentos/
└── DVG_Projects/
    └── [nombre-proyecto-id]/
        ├── project.json        ← Metadatos y propiedades persistidas
        └── Exports/
            └── graphic.mov     ← Video exportado (ProRes 4444 con Alfa)
```

### 2.2 El Archivo `project.json`

Este archivo actúa como la memoria permanente del proyecto. Contiene:
- El identificador del plugin utilizado para renderizar el gráfico.
- El nombre del proyecto.
- Las propiedades editables actuales (texto, colores, etc.).
- La fecha de última modificación.

### 2.3 Sistema de Autoguardado

El motor implementa un autoguardado por debouncing de **500ms**. Cada vez que el usuario modifica una propiedad en el panel de formulario, se activa un temporizador. Si no se realiza ningún cambio adicional en ese intervalo, el sistema escribe silenciosamente el estado actual al `project.json`. Esto evita escrituras excesivas al disco durante la edición fluida y no interrumpe el ciclo de renderizado a 60fps.

---

## 3. Motor de Plugins v3

### 3.1 Estructura de Archivos

Cada plugin es una carpeta independiente que contiene exactamente cuatro archivos:

| Archivo | Propósito |
|---|---|
| `manifest.json` | Declara el id, nombre, descripción y el esquema de propiedades editables. |
| `index.html` | El marcado HTML del gráfico (sin etiquetas `<html>`, `<head>`, ni `<body>`). |
| `style.css` | Los estilos visuales del gráfico (posicionamiento absoluto en 1920×1080). |
| `script.js` | La lógica de animación y enlace de datos, usando la API del motor. |

### 3.2 Aislamiento por Shadow DOM

Cuando el motor carga un plugin para su previsualización, inyecta el HTML y el CSS del plugin dentro de un Shadow Root adjunto a un contenedor interno. Esta tecnología nativa del navegador garantiza el **aislamiento total de estilos**: ninguna regla CSS de la interfaz del motor afecta al gráfico del plugin, y viceversa.

### 3.3 El Ciclo de Vida v3 (Lifecycle)

El corazón de la API del motor es el objeto de registro que el plugin debe entregar mediante `dvEngine.register()`. Este objeto define tres ganchos (hooks) de ciclo de vida correspondientes a distintas etapas de la animación:

```javascript
dvEngine.register({
  awake: (ctx) => {
    // Se ejecuta UNA SOLA VEZ al montar el plugin.
    // Uso ideal: capturar referencias al DOM, aplicar estilos base estáticos.
  },

  start: (ctx) => {
    // Se ejecuta cada vez que la cabeza de reproducción vuelve al fotograma 0.
    // Uso ideal: resets de estado, disparadores de sonido o efectos de inicio.
  },

  update: (ctx) => {
    // Se ejecuta en CADA FOTOGRAMA de la animación (60fps).
    // Uso ideal: enlazar propiedades reactivas y aplicar transformaciones de animación.
    const { frame, root, props } = ctx;
  }
});
```

### 3.4 El Objeto de Contexto (`ctx`)

Cada hook recibe el mismo objeto de contexto con las siguientes propiedades:

| Propiedad | Tipo | Descripción |
|---|---|---|
| `ctx.frame` | `number` | Fotograma actual de la animación (empieza en 0). |
| `ctx.root` | `ShadowRoot` | Referencia al Shadow Root que contiene el HTML del plugin. |
| `ctx.props` | `object` | Las propiedades actuales definidas en el `manifest.json` y editadas por el usuario en tiempo real. |

### 3.5 Enlace Reactivo de Datos

La propiedad `ctx.props` se actualiza en cada fotograma con los valores más recientes del formulario. Para lograr reactividad visual inmediata (ej: que el texto del gráfico cambie mientras el usuario escribe), las asignaciones de datos al DOM **deben realizarse dentro del hook `update`**, no en `start` ni en `awake`.

```javascript
// ✅ CORRECTO: Reactivo en tiempo real
update: (ctx) => {
  const titulo = ctx.root.getElementById('titulo');
  if (titulo) titulo.innerText = ctx.props.nombrePersona;
}
```

### 3.6 Librería de Utilidades (`dvEngine.utils`)

El motor inyecta automáticamente un conjunto de funciones matemáticas y de formato para simplificar el desarrollo de los plugins:

| Función | Descripción |
|---|---|
| `utils.lerp(a, b, t)` | Interpolación lineal simple. |
| `utils.clamp(val, min, max)` | Restringe un valor a un rango. |
| `utils.easeOutCubic(t)` | Función de suavizado de entrada/salida. |
| `utils.easeInOutCubic(t)` | Suavizado más pronunciado. |
| `utils.easeOutBounce(t)` | Efecto de rebote elástico. |
| `utils.easeOutElastic(t)` | Efecto de muelle/elástico. |
| `utils.hexToRgb(hex)` | Convierte un color Hex a "r, g, b" (útil para variables CSS con opacidad). |

Ejemplo de uso:
```javascript
update: (ctx) => {
  const { utils, frame } = ctx;
  const opacity = utils.easeOutCubic(Math.min(1, frame / 30));
  // ...
}
```

### 3.7 Motor de Plugins Universal (v3.2)

A partir de la versión 3.2, el motor es **completamente data-driven**: ningún campo de la interfaz está codificado de forma fija. El formulario del panel lateral se genera dinámicamente leyendo el `schema` del `manifest.json` del plugin activo.

#### Flujo de Datos del Panel de Control

```
manifest.json
  └─► schema: [{ type, id, label, defaultValue }]
        │
        ▼
  useStore.activePlugin  (cargado en loadProject)
        │
        ▼
  App.tsx → <DynamicField> por cada campo del schema
        │
        ▼
  setProperties({ [field.id]: value })  →  ctx.props en update()
```

#### Tipos de Campos Soportados

| Tipo en `manifest.json` | Componente generado |
|---|---|
| `string` | `<input type="text">` |
| `color` | `<input type="color">` |
| `number` | `<input type="number">` |
| `image` | `<input type="text">` (ruta o URL) |

#### Hard Reset al Cambiar de Proyecto

El reproductor usa `key={activeProject.id}`, que obliga a React a destruir y recrear el componente al cambiar de proyecto. Esto garantiza que el Shadow DOM previo se destruya completamente, el `__DV_BRIDGE__` se reinicialice, y los hooks de ciclo de vida comiencen desde cero.

---

## 4. Flujo de Exportación y Autoguardado

### 4.1 Autoguardado Inteligente
La aplicación implementa un sistema de persistencia automática con feedback visual en el panel lateral. Cada modificación en los campos de texto o color activa un **debounce de 500ms**, tras lo cual los datos se sincronizan con el archivo `project.json` de forma segura.

### 4.2 Proceso de Renderizado (Headless)
El proceso de renderizado se ejecuta de forma **headless**...

1. El usuario inicia la exportación desde la interfaz.
2. El proceso principal recibe la solicitud junto con las propiedades del proyecto.
3. Se genera un paquete (bundle) temporal de la composición.
4. El renderizador procesa los 120 fotograma de la animación y los codifica en formato **ProRes 4444** con canal Alfa a resolución **1920×1080**.
5. El archivo `.mov` resultante se guarda en `DVG_Projects/[id]/Exports/`.
6. El usuario puede arrastrarlo directamente a su editor de video preferido.
