# Especificaciones y Arquitectura Base (v4.0.0 GA)

## Contexto Principal
**Proyecto:** Dynamic Vector Graphics Engine (DVGE).  
**Arquitectura:** Standalone Client-Host (Electron + React + Remotion).  
**Misión:** Motor de renderizado determinístico para gráficos broadcast profesionales, con aislamiento total de plugins y persistencia atómica.

## Pilares Arquitectónicos (v4.0.0)

### 1. [NFR-SEC-01] Sandbox de Ejecución Sellado
- **Mecanismo:** Inyección mediante `new Function` con entorno restringido.
- **Aislamiento:** Se anula el acceso a `window` real mediante un `fakeWindow` (Proxy vacío).
- **Protección:** Bloqueo explícito de variables de entorno de Node/Electron (`process`, `require`, `globalThis`) para impedir fugas hacia el IPC del host.

### 2. [NFR-PERF-01] Renderizado Determinístico (Frame-Math)
- **Motor de Tiempo:** Basado en `ctx.timeline` (progress 0-1).
- **Prohibición:** Se prohíben librerías basadas en tiempo real (`requestAnimationFrame`) como GSAP.
- **Certidumbre:** Todas las animaciones deben derivar del número de cuadro discreto proporcionado por el motor para asegurar consistencia idéntica en renders ProRes 4444.

### 3. [NFR-DATA-01] I/O Atómico y Asíncrono
- **Estrategia:** Escritura en archivos temporales `.json.tmp` seguida de un renombrado atómico (`fs.rename`).
- **Resiliencia:** Previene la corrupción del archivo de proyecto (`project.json`) en caso de fallo crítico durante el autoguardado.
- **Asincronía:** El hilo principal de Electron nunca se bloquea durante la persistencia de datos.

## Estándares de Plugin (Spec-Driven)

Todo plugin compatible con v4.0 debe implementar la interfaz `dvEngine.register`:
- `awake(ctx)`: Inicialización y cacheo de referencias DOM en `ctx.refs`.
- `update(ctx)`: Lógica de animación reactiva basada en `ctx.timeline`.

## Marco de Validación (QA Harness)
- **Graceful Degradation:** Los fallos en el hook `update` son capturados por el motor, deshabilitando el plugin fallido y logueando el error sin colapsar el bucle de renderizado global.
- **UI Error Boundary:** El inspector de propiedades está envuelto en un límite de error React para manejar `manifest.json` malformados.
