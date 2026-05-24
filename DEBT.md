# Deudas Técnicas — @dvge/core

## [DT-001] Proyecto con directorio corrupto en DVG_Projects
**Detectado**: 2026-05-23 durante dev run de Ember Motion Studio.
**Síntoma**: `DV Engine: Error parseando proyecto en C:\Users\Josue B\Desktop\Josue B\Documents\DVG_Projects\video_publicitario___ember_motion_studio___clip_1___ingles___portroit_1778473767947`
**Causa probable**: Nombre de directorio generado con timestamp y typo (`portroit` en vez de `portrait`). El parser del motor falla al leer el manifiesto de ese proyecto.
**Impacto**: Bajo — solo afecta ese proyecto, el resto carga correctamente.
**Acción recomendada**: Revisar y eliminar o renombrar ese directorio en `DVG_Projects`.

---

## [DT-002] Warning de orden de keys en exports de package.json
**Detectado**: 2026-05-23 durante `pnpm build`.
**Síntoma**: `The condition "types" here will never be used as it comes after "import" and "require"`.
**Estado**: ✅ Corregido — `"types"` movido al primer lugar en el bloque `exports`.

---

## [DT-003] Extensiones de build no coincidían con exports
**Detectado**: 2026-05-23 durante integración con Ember.
**Síntoma**: `Failed to resolve entry for package "@dvge/core"` — `package.json` apuntaba a `.cjs` pero tsup generó `.js` para CJS y `.mjs` para ESM.
**Estado**: ✅ Corregido — `exports` ahora apunta a `index.mjs` (ESM) e `index.js` (CJS).

---

## [DT-004] visualSkills.ts aún duplicado en Ember Motion Studio
**Detectado**: 2026-05-23 durante limpieza de archivos migrados.
**Síntoma**: `electron/resources/visualSkills.ts` existe tanto en DVGE (como fuente de verdad) como en Ember (copia heredada).
**Causa**: Los Visual Skills tienen un repositorio dedicado pendiente de creación.
**Impacto**: Medio — cambios en los skills deben sincronizarse manualmente en ambos repos.
**Acción recomendada**: Crear el repositorio `DVGE-Visual-Skills` y migrar `visualSkills.ts` allí, luego importarlo como paquete en ambos repos.
