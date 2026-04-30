# Protocolo de Posicionamiento Responsivo DVGE (DV-RPP)

## Versión: 6.7.0 (Estabilización & Calidad)

Este documento define el estándar técnico para garantizar que los plugins mantengan su integridad visual, fidelidad de píxeles y coherencia de layout independientemente de la relación de aspecto (Landscape, Portrait, Square).

---

### 1. El Core del Problema: Disonancia de Renderizado

El motor debe mediar entre la fluidez del DOM y la rigidez del Canvas de Video. El escalado visual (`transform: scale`) está prohibido como solución definitiva debido a que emborrona los assets y fuentes.

### 2. Especificación del Protocolo (Arquitectura)

#### A. Sistema de Unidades Virtuales (Virtual Viewport)

En lugar de depender de las unidades del navegador (`vw`, `vh`), el motor inyecta variables CSS y de JS que referencian el tamaño real de la composición.

#### B. Mantenimiento de Calidad de Píxeles

El motor renderiza el Shadow DOM a la resolución nativa de salida, pero escala las **coordenadas de entrada** para preservar el diseño original.

---

### 3. Archivos y Líneas Afectados (Auditoría Técnica)

| Archivo | Responsabilidad | Líneas (Aprox) |
| :--- | :--- | :--- |
| [Bridge.ts](app/src/engine/core/Bridge.ts) | Definición de `DVContext` y utilidades de remapeo de coordenadas (`dvUtils.remap`). | 17-31, 40-78 |
| [PluginWrapper.tsx](app/src/remotion/PluginWrapper.tsx) | Inyección de variables CSS `--dv-vw`, `--dv-vh` y configuración del `viewport` del Shadow Root. | 94-108, 162-180 |
| [GlobalStyles.ts](app/src/remotion/GlobalStyles.ts) | Establecimiento del CSS Baseline para que el `:host` se comporte como un contenedor estricto. | 5-16 |
| [useStore.ts](app/src/store/useStore.ts) | Persistencia de la `aspectRatioMode` y metadatos de resolución de diseño. | 46-50, 174-184 |

---

### 4. Directrices de Implementación (v6.7)

1. **No usar `px` fijos**: Los plugins deben usar `var(--dv-w)` y `var(--dv-h)` para cálculos de tamaño que deban ser proporcionales.

2. **Anclaje Estratégico**: Los elementos de UI (Lower Thirds, Logos, Footers) deben usar `top`/`bottom` basados en unidades `%` o `calc(n * var(--dv-vh))` para asegurar que el cambio a Portrait no los oculte.

3. **Fidelidad Nativa**: El motor nunca aplicará un `scale` que emborrone el contenido. Si se necesita ajustar un diseño landscape a portrait, se usará un **Virtual Resolution Remapping** inyectado por el Bridge.

---
**Aprobado por**: Antigravity (Senior AI Architect)
**Estado**: En Proceso de Estabilización
