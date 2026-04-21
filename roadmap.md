# Roadmap: Dynamic Vector Graphics Engine (DVGE) v4.0.0

El proyecto adopta una arquitectura desacoplada Standalone Client-Host para asegurar compatibilidad universal con DaVinci Resolve 18+, esquivando limitaciones de versiones no oficiales (cracks) y sistemas sin Python en el PATH.

## Fase 1: Arquitectura Base y App Shell (v2.0.0-alpha)

- [x] **T-1:** Configuración inicial del monorepo app/
- [x] **T-2:** Implementación de Remotion Renderer (Core).
- [x] **T-3:** Comunicación IPC (Main <-> Renderer).
- [x] **T-4:** UI Dashboard (Resolve Style).

## Fase 2: Estabilidad y UX (Completado ✅)

- [x] Implementación del servidor WebSocket local en el Main Process de Electron (Puerto `47821`).
- [x] Diseño UX/UI del shell en modo "Kiosk/Toolbox" (compacto, always-on-top mode).

## Fase 3: Motor de Renderizado (Completado ✅)

- [x] Integración de `@remotion/bundler` y `@remotion/renderer` en el Main Process.
- [x] Definición del Composition principal (`LowerThirdBasic`).
- [x] Transpilación dinámica: De formulario React -> props JSON-> H.265/ProRes4444.
- [x] Implementación de Property-Based Testing (PBT) sobre el inyector de propiedades para evitar fallos de renderizado en inputs extremos.

## Fase 4: Producción y Generación Dinámica (v2.2.0 a v3.4.1) (Completado ✅)

- [x] **v2.2.0:** Implementación del bridge de registro `dvEngine.register`.
- [x] **v2.3.0:** Arquitectura Hot-Swap (Sincronización Dual).
- [x] **v3.0.0:** Sistema Persistente de Workspace y autoguardado.
- [x] **v3.1.0:** Utilidades Nativas (`dvEngine.utils`) y autoguardado silencioso de estado.
- [x] **v3.2.1:** Formularios Generativos (UI dinámica basada en `manifest.json`), Hard-Reset del Shadow DOM por proyecto.
- [x] **v3.3.0:** Soporte para edición de código (`code` input) y Master Renderer para HTML puro.
- [x] **v3.4.0:** Presets modulares (`branding`, `motion`, `layout`), inyección automática de logo y CDNs en el manifiesto.

## Fase 5: QA Remediation y Next-Gen Architecture (v4.0.0 GA) (Completado ✅)

- [x] **Security Isolation:** Bloqueo del objeto `window` (fakeWindow) para impedir acceso a IPC desde los plugins.
- [x] **Atomic Async I/O:** Guardado de propiedades mediante archivos `.tmp` y renombrado atómico asíncrono para prevenir la corrupción por apagones.
- [x] **Graceful Degradation:** Manejo exhaustivo de fallos con `try/catch` en la función `update` del plugin, con deshabilitación de seguridad en caso de crash (Evitando pantallas blancas).
- [x] **API Determinística (`ctx.timeline`):** Transición a matemática de cuadros (frame-math) prohibiendo librerías asíncronas como GSAP para asegurar renders *frame-perfect* en ProRes.
- [x] **Estado Persistente Oficial:** Inclusión de `ctx.state` y `ctx.refs` en la API del motor.
- [x] **Ecosistema Refactorizado:** Adaptación del `cinematic-opener` y `scoreboard-pro` a Vanilla JS 100%.
