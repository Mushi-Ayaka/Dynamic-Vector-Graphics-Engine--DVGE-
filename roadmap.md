# Roadmap: Dynamic Vector Graphics Engine (DVGE) v3.1.0

El proyecto adopta una arquitectura desacoplada Standalone Client-Host para asegurar compatibilidad universal con DaVinci Resolve 18+, esquivando limitaciones de versiones no oficiales (cracks) y sistemas sin Python en el PATH.

## Fase 1: Arquitectura Base y App Shell (v2.0.0-alpha)

- [x] **T-1:** Configuración inicial del monorepo app/
- [x] **T-2:** Implementación de Remotion Renderer (Core).
- [x] **T-3:** Comunicación IPC (Main <-> Renderer).
- [x] **T-4:** UI Dashboard (Resolve Style).

## Fase 2: Estabilidad y UX (Completado ✅)

- [ ] Implementación del servidor WebSocket local en el Main Process de Electron (Puerto `47821`).
- [ ] Diseño UX/UI del shell en modo "Kiosk/Toolbox" (compacto, always-on-top mode).

## Objetivo del MVP

- Gráficos de alta calidad (ProRes 4444 + Alfa).
- Aplicación Electron independiente (Standalone).
- Drag & Drop nativo a DaVinci Resolve.

## Fase 3: Motor de Renderizado (Completado ✅)

- [ ] Integración de `@remotion/bundler` y `@remotion/renderer` en el Main Process.
- [ ] Definición del Composition principal (`LowerThirdBasic`).
- [ ] Transpilación dinámica: De formulario React -> props JSON-> H.265/ProRes4444.
- [ ] Implementación de Property-Based Testing (PBT) sobre el inyector de propiedades para evitar fallos de renderizado en inputs extremos.

## Fase 4: DaVinci Resolve JS Bridge (v2.0.0-beta)

- [ ] Creación del plugin minimalista nativo (HTML/JS) para el folder `Workflow Integration`.
- [ ] Lógica del cliente WebSocket (Reconexión automática, Heartbeat).
- [ ] Invocación segura de la API JavaScript de DaVinci (`ImportMedia`).
- [ ] Script de automatización: Copiado silencioso del plugin desde la App Electron al OS `%APPDATA%` en el primer boot.

## Fase 4: UX Avanzada y Fallback (v2.0.0-rc)

- [ ] Implementación del Native OS Drag & Drop (Arrastrar el video renderizado directamente de la App al timeline).
- [ ] Cola de tareas (Task Queue) para evitar la saturación si el usuario presiona "Render" masivamente.
- [ ] Gestión robusta de caché temporal (Auto-limpiar el directorio `/temp_renders` al cerrar la App).
- [ ] Pruebas E2E sobre el flujo completo de vida del video generado.

## Fase 5: Producción (v2.0.0)

- [ ] Notarización y firma (Opcional, enfocado a perfiles de distribución).
- [ ] Instalador único `.exe` para usuario final.
- [ ] Documentación / Manual interactivo de usuario en la UI.
