# Manual Operativo: Mantenimiento y Desarrollo de Plugins

Este motor está diseñado bajo el principio de **Extensibilidad Segura**. Los plugins son el alma del sistema y este manual explica cómo mantener el ecosistema y el core del motor.

## 1. Estructura de un Proyecto (Workspace)
Los proyectos se guardan en `Documentos/DVG_Projects/`. Cada carpeta contiene:
- `project.json`: El estado actual de los parámetros y el plugin seleccionado.
- `.tmp`: Archivos temporales de escritura atómica (se borran automáticamente).

## 2. Desarrollo de Plugins (v4.0 API)
Para añadir un nuevo plugin al motor:
1. Crea una carpeta en `Documentos/DV_Engine_Plugins/`.
2. Incluye los 4 archivos base: `manifest.json`, `index.html`, `style.css`, `script.js`.
3. **Regla de Oro:** En el `script.js`, usa siempre `ctx.refs` para el DOM y `ctx.timeline` para animar. NUNCA uses GSAP.

### Ejemplo de Script v4.0:
```javascript
dvEngine.register({
  awake: (ctx) => {
    ctx.refs.title = ctx.root.getElementById('main-title');
  },
  update: (ctx) => {
    const { timeline, utils, refs } = ctx;
    refs.title.style.opacity = timeline.introProgress.toString();
    refs.title.style.transform = `scale(${utils.lerp(0.8, 1, utils.spring(timeline.introProgress))})`;
  }
});
```

## 3. Mantenimiento del Core (App)
El motor se divide en dos procesos:
- **Electron (Main):** Gestiona el sistema de archivos (`project-manager.ts`) y la carga de plugins (`plugin-manager.ts`).
- **React (Renderer):** Gestiona la interfaz de usuario y el bridge de Remotion (`PluginWrapper.tsx`).

### Flujo de Compilación:
```bash
cd app
npm install       # Instalar dependencias
npm run dev       # Modo desarrollo (Hot Reload)
npm run build     # Generar instalador .exe en /release/4.0.0
```

## 4. Resolución de Problemas (Troubleshooting)
- **Pantalla Blanca en el Plugin:** Revisa el log de la consola (DevTools con Ctrl+Shift+I). Si el plugin crashea, el motor lo deshabilitará automáticamente.
- **Error de I/O:** Asegúrate de que el motor tenga permisos de escritura en la carpeta de Documentos.
- **Desincronización en Render:** Verifica que no se estén usando librerías de tiempo real externas en el manifiesto.
