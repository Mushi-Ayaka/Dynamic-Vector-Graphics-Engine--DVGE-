# Contexto Persistente — DVGE v5.0.0
Este documento contiene la base arquitectónica y los principios fundamentales del Dynamic Vector Graphics Engine (DVGE) que deben permanecer intactos para garantizar la estabilidad del software.

## 1. Arquitectura de Despliegue (v5.0.0)
Para resolver los errores críticos de `EPIPE` y `ENOENT` en producción sin sacrificar el rendimiento, se estableció la siguiente arquitectura:

### Pre-Bundling Estático de Remotion
- **Qué**: Remotion no se compila en tiempo de ejecución (`bundle()`). Se pre-construye durante el paso de empaquetado mediante `node scripts/bundle-remotion.js`.
- **Por qué**: Evita la sobrecarga de `esbuild` en el cliente y elimina la dependencia de compilación en el `renderer process`.
- **Ubicación**: El bundle resultante vive en `app/remotion-bundle`.

### Estrategia ASAR Híbrida ("Selective Unpack")
- **Configuración**: `asar: true` en `package.json`.
- **Compresión**: `compression: 'store'` (sin compresión adicional para evitar tiempos de build infinitos).
- **Desempaquetado**: Las dependencias que requieren ejecución binaria externa (`@remotion/compositor`, `ffmpeg`, `esbuild`) se extraen mediante `asarUnpack`.
- **Rutas de Producción**: La aplicación debe buscar los binarios en `process.resourcesPath/app.asar.unpacked`.

---

## 2. Principios Fundamentales (SDD)

### Determinismo Total
- Cada fotograma se calcula exclusivamente mediante `ctx.frame` y utilidades matemáticas deterministas (`lerp`, `clamp`, `spring`).
- Está prohibido el uso de `Date.now()`, `requestAnimationFrame` o `setTimeout` dentro de los plugins para lógica de animación.

### Sandbox de Seguridad
- Los plugins se ejecutan en un entorno aislado.
- **JS Isolation**: Uso de `new Function()` con un `fakeWindow` proxy para bloquear el acceso a Node.js y APIs globales peligrosas.
- **CSS Isolation**: Uso de **Shadow DOM** en el `PluginWrapper` (Preview) para evitar colisiones de estilos entre el motor y el plugin.

### I/O Atómico
- El guardado de proyectos es asíncrono y atómico. Se escribe un archivo `.tmp` y luego se renombra, garantizando que un fallo de energía no corrompa el archivo `.dvge` original.

---

## 3. Tech Stack
- **Core**: Electron + React + TypeScript.
- **Render Engine**: Remotion (v4.x).
- **Styling**: CSS Vanilla / CSS Variables (`--accent`).
- **Build System**: Vite (App) + esbuild (Remotion Bundle).
