# Documentación Técnica: Dynamic Vector Graphics Engine (DVGE) v4.1.0 GA

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

Gestiona toda la interfaz de usuario: genera formularios dinámicos a partir del `manifest.json` del plugin activo, controla el reproductor de previsualización en tiempo real a 60fps con reinicio de estado por Hard Reset al cambiar de proyecto, y maneja el estado global de la sesión a través de un store reactivo. El sistema de previsualización convierte directamente la animación del plugin en un flujo de imágenes renderizadas cuadro por cuadro.


### 1.2 Proceso Principal (Backend)

Corre en el entorno de Node.js y se responsabiliza de:
- Leer y escribir archivos en el sistema de archivos del usuario.
- Gestionar los proyectos y su persistencia local.
- Ejecutar el proceso de renderizado a video en segundo plano.
- Escanear la carpeta de plugins del sistema.

### 1.3 Sandbox de Seguridad y Aislamiento (v4.0+)

A diferencia de versiones anteriores, el motor v4.0 implementa un **Sandbox Sellado**:
- **fakeWindow**: Los plugins no tienen acceso al objeto `window` real ni a las APIs de Electron. Se inyecta un objeto simulado que sólo permite interactuar con el Shadow DOM.
- **Shadow DOM**: El HTML/CSS del plugin está encapsulado, impidiendo colisiones de estilos con el shell de la aplicación.
- **Evaluación Aislada**: El código JS se ejecuta en un contexto restringido, eliminando riesgos de inyección o acceso no autorizado al sistema de archivos del host.

> **Seguridad Industrial:** Esta arquitectura garantiza que un plugin malicioso no pueda comprometer la estabilidad del sistema ni la privacidad del usuario.

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

### 2.3 Persistencia Atómica Asíncrona (Resiliencia)

Para garantizar la integridad de los datos, el motor utiliza un subsistema de **I/O Atómico**:
1. **Debouncing:** Los cambios se acumulan durante 500ms.
2. **Escritura Temporal:** El estado se escribe primero en un archivo `.tmp`.
3. **Renombrado Seguro:** Solo si la escritura tiene éxito, el archivo temporal reemplaza al original `project.json`.

Este flujo impide la corrupción de proyectos en caso de cierres inesperados, fallos de energía o bloqueos del sistema durante el guardado.

---

## 3. Motor de Plugins v4 (Arquitectura GA)

### 3.0 Catálogo de Plugins (Marketplace)

A partir de la versión v4.1.0, el motor incluye un sistema de distribución dinámico:
- **Registry JSON:** La app consulta un índice centralizado en GitHub.
- **Instalación One-Click:** Descarga e instalación automatizada de gráficos profesionales.
- **Versionado Semántico:** El motor detecta actualizaciones disponibles y permite la actualización con un solo clic.

Cada plugin es una carpeta independiente que contiene exactamente cuatro archivos:

| Archivo | Propósito |
|---|---|
| `manifest.json` | Declara el id, nombre, descripción y el esquema de propiedades editables. |
| `index.html` | El marcado HTML del gráfico (sin etiquetas `<html>`, `<head>`, ni `<body>`). |
| `style.css` | Los estilos visuales del gráfico (posicionamiento absoluto en 1920×1080). |
| `script.js` | La lógica de animación y enlace de datos, usando la API del motor. |

### 3.2 Interfaz Dinámica (UI Generativa)

El panel lateral de la aplicación **no tiene campos fijos**. El motor lee la propiedad `schema` del `manifest.json` y construye los controles visuales (*inputs, selectores de color, etc.*) dinámicamente. 

Ejemplo de `manifest.json`:
```json
{
  "id": "my-plugin",
  "name": "My Plugin",
  "schema": [
    { "type": "string", "id": "title", "label": "Título Principal", "defaultValue": "Texto" },
    { "type": "color", "id": "bgColor", "label": "Color de Fondo", "defaultValue": "#FF0000" }
  ]
}
```
*Tipos soportados:* `string`, `color`, `number`, `image`.

### 3.3 Aislamiento por Shadow DOM

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
| `ctx.timeline`| `object` | **[v4.0]** Tiempos normalizados (`progress`, `introProgress`, `outroProgress`). |
| `ctx.root` | `ShadowRoot` | Referencia al Shadow Root que contiene el HTML del plugin. |
| `ctx.props` | `object` | Las propiedades actuales definidas en el `manifest.json`. |
| `ctx.refs` | `object` | **[v4.0]** Caché oficial para referencias del DOM (persistente). |
| `ctx.state` | `object` | **[v4.0]** Almacén de estado interno persistente para el plugin. |
| `ctx.utils` | `object` | Librería nativa de easing y matemáticas (`lerp`, `clamp`, etc.). |
| `ctx.settings`| `object` | Metadatos globales: `fps`, `duration`, `resolution`, `width`, `height`. |

### 3.5 Determinismo vs Tiempo Real

DVGE v4.0 prohíbe el uso de librerías basadas en `requestAnimationFrame` (como GSAP) para garantizar la coherencia cuadro a cuadro durante la exportación a ProRes 4444. La animación debe ser puramente matemática basada en el `ctx.frame` o el `ctx.timeline`.

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
