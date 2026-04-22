# Guía de Creación de Plugins con Inteligencia Artificial (v4.1.0 GA)

## ¿Qué es un Plugin?

Un **plugin** en el Dynamic Vector Graphics Engine (DVGE) es un gráfico de video personalizado: puede ser una banda de texto, un título animado, un marcador de tiempo, o un callout.

Cada plugin vive en su propia carpeta y está compuesto por **cuatro archivos** (`manifest.json`, `index.html`, `style.css`, `script.js`). El motor está diseñado para que puedas generarlos usando asistentes de IA como Claude, GPT-4 o Gemini.

---

## 🛍️ Novedad v4.1: Catálogo de Plugins
A partir de esta versión, puedes compartir tus creaciones subiéndolas a GitHub. Cualquier usuario podrá instalarlas directamente desde el **Catálogo** integrado en la app.

---

## Los Cuatro Archivos de un Plugin

### 1. `manifest.json` — El descriptor
Define el nombre, versión y los campos editables de la UI.
**💡 Novedad v4.1**: Usa `presets: ["branding", "motion", "layout"]` para que el motor genere automáticamente los controles de logo, duración y posición.

### 2. `index.html` — La estructura
Contenido visual puro. **⚠️ REGLA: No usar etiquetas `<html>`, `<head>` ni `<body>`.**

### 3. `style.css` — La estética
Estilos CSS estándar. El lienzo de trabajo es siempre **1920×1080 píxeles**.

### 4. `script.js` — La lógica (API v4.1 GA)
El archivo más importante. Debe usar `dvEngine.register()`.

---

## ⛔ Reglas Críticas de Animación (Determinismo)

1. **PROHIBIDO TIEMPO REAL**: No uses GSAP, Anime.js o `requestAnimationFrame`. El motor es **Frame-Based**.
2. **DETERMINISMO**: Toda animación debe basarse en `ctx.frame` o `ctx.timeline` para asegurar un renderizado perfecto en ProRes 4444.
3. **AISLAMIENTO**: Usa `ctx.root.getElementById()` en lugar de `document`. El plugin corre en un Shadow DOM.
4. **SANDBOX**: El objeto `window` está bloqueado por seguridad. Usa la API de `ctx`.

---

## 🚀 El Prompt Maestro (Optimizado para v4.1.0 GA)

Copia y pega este bloque en tu IA favorita para generar plugins que funcionen a la primera:

```text
Actúa como un desarrollador senior de Motion Graphics. Genera un plugin para el motor DVGE v4.1.0 GA siguiendo estas reglas estrictas:

1. TECNOLOGÍA: Usa SOLO HTML/CSS y Vanilla Javascript. Sin librerías externas.
2. MODULARIDAD: Usa presets ["branding", "motion", "layout"] en el manifest.json.
3. API: Usa dvEngine.register({ awake, start, update }).
4. DOM: Usa ctx.root.getElementById() (Shadow DOM). NUNCA uses 'document'.
5. ANIMACIÓN: Usa ctx.frame y ctx.timeline. Las animaciones deben ser matemáticas y determinísticas (Frame-Based). Prohibido usar GSAP o requestAnimationFrame.
6. UTILIDADES: Usa dvEngine.utils para easing (lerp, spring, easeOutCubic).
7. ESTILOS: El lienzo es 1920x1080. Usa la clase .dv-glass para efectos modernos.

Genera los 4 archivos (manifest.json, index.html, style.css, script.js) en bloques de código separados.

[DESCRIPCIÓN DEL PLUGIN: Escribe aquí qué quieres crear]
```

---

## 🛠️ Paso a Paso: Crear y Probar tu Plugin

1. **Obtén el Código**: Copia el **Prompt Maestro** de arriba, añade la descripción de tu gráfico y pásalo a la IA.
2. **Crea la Carpeta**: En la app DVGE, ve a **Ayuda → Abrir Carpeta de Plugins**. Crea una carpeta nueva (ej: `mi-grafico-pro`).
3. **Guarda los Archivos**: Pega el código de la IA en cada uno de los 4 archivos correspondientes.
4. **Carga en DVGE**: Abre la app, crea un nuevo proyecto y selecciona tu nuevo plugin de la lista.
5. **Ajusta y Renderiza**: Usa el panel de Branding para subir tu logo y haz clic en **Renderizar**.

---

## 💡 Consejos para el Éxito
- **Refs**: Cachea tus elementos del DOM en el hook `awake` usando `ctx.refs`. No busques elementos en `update` (se ejecuta 60 veces por segundo).
- **Timeline**: Usa `ctx.timeline.introProgress` para animar la entrada. Así el gráfico se adaptará a cualquier duración.
- **Utils**: No programes funciones de animación desde cero, usa `ctx.utils.spring` para efectos de rebote profesionales.
