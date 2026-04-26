# Contexto Variable — Problemas y Tareas Pendientes
Este documento rastrea los errores actuales, las investigaciones en curso y las deudas técnicas inmediatas.

## 1. El "Bug de la Pantalla Negra" en Exportación
A pesar de que el proceso de renderizado en `v5.0.0` completa la duración correcta (ej. 4 segundos, 240 frames), el video resultante es negro/transparente.

### Estado del Diagnóstico
- **Veredicto Parcial**: El `PluginWrapper` (diseñado para interactividad y preview) fallaba en el contexto `headless` de Remotion porque los `useEffect` y el `Shadow DOM` no se comportan de forma determinista durante la captura de snapshots.
- **Solución Implementada [v5.1.0]**: Arquitectura de **Render Síncrono Puro** mediante `RenderWrapper.tsx`.
- **Diferencia Clave**: `RenderWrapper` ahora es 100% síncrono. No usa hooks asíncronos (`useEffect`). La inyección y el frame se ejecutan en el mismo ciclo de render/layout, garantizando que el DOM esté listo antes del snapshot.
- **Abstracción**: Se extrajo la lógica central a `src/engine/core/Bridge.ts` para asegurar que el determinismo sea idéntico entre Preview y Export.

### Bloqueos Actuales
1. **Timeout de Inyección**: Mitigado al eliminar hooks asíncronos y `delayRender`.
2. **Persistencia de Variables**: Resuelto al mover el estado de inyección a `useRef` locales dentro de cada instancia de `RenderWrapper`.
3. **Paso de Props**: Validar que `activePluginFiles` llegue correctamente en el entorno de producción.

---

## 2. Diferenciación de Motores (Preview vs Export)
Se ha decidido separar las responsabilidades para no comprometer el potencial interactivo del motor:

| Característica | PluginWrapper (Preview) | RenderWrapper (Export) |
| :--- | :--- | :--- |
| **Aislamiento** | Shadow DOM (Total) | DOM Normal (JS Sandbox únicamente) |
| **Ciclo de Vida** | Async / useEffect | Síncrono / useLayoutEffect |
| **Interactividad** | Sí (Mouse/Keyboard) | No (Solo frames) |
| **Propósito** | Edición en vivo | Fidelidad Broadcast |

---

## 3. Tareas Próximas (Sprint a Medias)
- [x] Extraer lógica de bridge a `src/engine/core/Bridge.ts`.
- [x] Refactorizar `RenderWrapper.tsx` para ser 100% síncrono y libre de estados globales.
- [x] Sincronizar `PluginWrapper.tsx` con el nuevo `Bridge.ts`.
- [ ] Regenerar el bundle de Remotion y probar el render.
- [ ] Implementar logs exhaustivos en el `chrome-headless-shell` si la pantalla negra persiste.
