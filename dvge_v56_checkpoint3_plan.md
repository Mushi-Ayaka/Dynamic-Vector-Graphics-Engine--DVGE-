# DVGE v5.6 — Checkpoint 3: Post-Implementation Fixes
> **SDD · Spec-Driven Development**  
> Auditoría realizada sobre el código actual. Cada problema tiene su archivo, línea y fix exacto.

---

## Diagnóstico Rápido

| # | Problema | Severidad | Archivos afectados |
|---|---|---|---|
| P1 | Paleta de colores rota (azul + naranja + negro) | Alta | `resolve-theme.css` |
| P2 | Versión hardcodeada ("v5.5.0 GA") en múltiples lugares | Media | `HomeMenu.tsx`, `App.tsx` |
| P3 | Indicador "Conectado" confuso y mal posicionado | Baja | `App.tsx` L.179-184 |
| P4 | `VideoInfoPanel` no se puede ocultar | Media | `App.tsx`, `VideoInfoPanel.tsx` |
| P5 | Campos `code`/`html`/`css`/`js` son una sola línea | Alta | `InspectorTabs.tsx` |
| P6 | Badge "PRO" en `Queue` prematuro | Baja | `InspectorTabs.tsx` L.207 |

---

## P1 — Design System: Paleta Unificada

### Raíz del Problema

El CSS actual en `resolve-theme.css` tiene **3 colores de acento en conflicto**:

- `--accent: #3B82F6` (azul) → usado en tabs activos, iconos, borders de focus
- `--cta: #F97316` (naranja) → usado en el botón RENDERIZAR
- `--success: #22C55E` (verde) → punto verde de "Conectado"

Resultado visual: azul + naranja + negro. Es una mezcla de dos sistemas distintos. El naranja viene del skill `ui-ux-pro-max` que propuso `#F97316` como CTA. El azul fue adoptado como accent. Nunca se resolvió el conflicto.

### Decisión Arquitectónica

**DVGE tiene identidad visual propia**: herramienta broadcast profesional, dark, técnica. La referencia es DaVinci Resolve (gris + color único de acento).

**Paleta propuesta — monocromática con un solo acento:**

```css
:root {
  /* Backgrounds — escala de oscuro a claro */
  --bg-primary:    #0D0D0D;  /* base OLED (casi negro) */
  --bg-secondary:  #141414;  /* paneles laterales */
  --bg-surface:    #1C1C1C;  /* superficies elevadas (panel headers) */
  --bg-elevated:   #252525;  /* inputs, elementos flotantes */
  --bg-input:      #111111;  /* fondo de inputs */

  /* Texto */
  --text-primary:  #DEDEDE;  /* texto principal */
  --text-secondary:#8C8C8C;  /* texto secundario */
  --text-disabled: #444444;  /* texto deshabilitado */
  --text-label:    #5C5C5C;  /* labels de campos */

  /* UN SOLO ACENTO — rojo-coral DVGE */
  --accent:        #E8503A;  /* único color de marca */
  --accent-hover:  #FF6347;  /* hover del acento */
  --accent-dim:    rgba(232, 80, 58, 0.12); /* fondo sutil de acento */

  /* Borders */
  --border:        #282828;  /* borde sutil */
  --border-focus:  #3C3C3C;  /* borde activo/focus */

  /* Estados */
  --success:       #3D9970;  /* verde sobrio (no neón) */
  --warning:       #C8963A;  /* naranja sobrio */
  --error:         #C0392B;  /* rojo error */
}
```

**Lo que se elimina:** `--cta` y `--cta-hover` (naranja). El botón Render pasa a usar `--accent` como todo lo demás.

**Lo que cambia en componentes:**

- `App.tsx` L.169: badge `v5.6` → usar `--accent` (ya lo hace)
- `App.tsx` L.174-176: tabs activos → `--accent` (ya lo hace vía `.tab-btn.active`)  
- `InspectorTabs.tsx` L.88: fondo del prompt → `var(--accent-dim)`
- `InspectorTabs.tsx` L.207: badge PRO → eliminado (P6)
- `.dv-btn.cta` en CSS → reemplazar por `--accent`

**Archivos a modificar:**

- `app/src/styles/resolve-theme.css` → reescribir `:root` completo + eliminar `.dv-btn.cta`

---

## P2 — Versión Automática desde `package.json`

### Raíz del Problema

La versión está hardcodeada en 3 lugares:

- `HomeMenu.tsx` L.134: `v5.5.0 GA` (literal string)
- `HomeMenu.tsx` L.178: `[DVGE]-[v5.5.0]-[GA]-[B230426]` (literal string)
- `App.tsx` L.169: badge `v5.6` (literal string, diferente versión que el footer)

`package.json` tiene `"version": "5.5.0"` como fuente de verdad. Nunca se lee.

**En Vite**, `package.json` se puede importar directamente o exponer via `define`:

```typescript
// vite.config.ts — agregar en define:
define: {
  __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
}
```

**O más simple**, en un archivo `app/src/env.ts` (o `app/src/version.ts`):

```typescript
// Vite expone esto en build time
export const APP_VERSION = import.meta.env.VITE_APP_VERSION || '5.5.0'
```

Y en `vite.config.ts`:

```typescript
define: {
  'import.meta.env.VITE_APP_VERSION': JSON.stringify(require('./package.json').version)
}
```

**Uso en componentes:**

```typescript
import { APP_VERSION } from '../version'
// → "5.5.0" leído de package.json en build time
```

**Formato del About:**
```
DVGE · v{APP_VERSION} · Build {fecha YYYYMMDD en build time}
```

El build date también se puede inyectar en `vite.config.ts`:

```typescript
'import.meta.env.VITE_BUILD_DATE': JSON.stringify(new Date().toISOString().split('T')[0].replace(/-/g,''))
```

**Archivos a modificar:**

- `app/vite.config.ts` → agregar `define` con version y build date
- `app/src/version.ts` → nuevo archivo, exporta `APP_VERSION` y `BUILD_DATE`
- `HomeMenu.tsx` L.134, 178 → consumir `APP_VERSION`
- `App.tsx` L.169 → consumir `APP_VERSION`

---

## P3 — Indicador de Estado Superior ("punto verde / Conectado")

### Qué es realmente

`App.tsx` L.179-184: muestra "Conectado" con punto verde cuando `!isSaving`, y "Sincronizando..." cuando `isSaving`. **No indica conexión a nada** — indica el estado del autosave.

El término "Conectado" es técnicamente incorrecto y confuso. No hay conexión de red. Es el estado del guardado a disco.

### Decisión

**Cambio de semántica:** Reemplazar "Conectado/Sincronizando" por:

```
● Guardado  (verde, cuando !isSaving y lastSaved existe)
● Guardando  (gris, cuando isSaving)
● Sin cambios  (gris, cuando !lastSaved y !isSaving)
```

**Cambio visual:** El indicador pasa a ser más pequeño y discreto. No es crítico. Formato:

```tsx
// App.tsx — reemplaza L.179-184
<span style={{ fontSize: '10px', color: isSaving ? 'var(--text-disabled)' : 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
  {isSaving ? 'Guardando...' : lastSaved ? 'Guardado' : '—'}
</span>
```

**Archivos a modificar:**

- `App.tsx` L.179-184 → fix semántico (2 líneas)

---

## P4 — `VideoInfoPanel` Colapsable

### Raíz del Problema

El `VideoInfoPanel` (resolución, duración, FPS, peso) está fijo debajo del preview en `App.tsx` L.321-328. No tiene control de visibilidad.

### Solución: Toggle de visibilidad con botón en la Preview Toolbar

El `VideoInfoPanel` ya existe como componente puro. Solo falta agregar estado local `showInfo` en `App.tsx` y un botón en la **Preview Toolbar** (la barra de 40px que ya tiene el `AspectRatioSelector`).

```tsx
// App.tsx — añadir estado local
const [showVideoInfo, setShowVideoInfo] = React.useState(true);
```

**Preview Toolbar queda:**

```
[16:9] [9:16] [1:1]  ───────────  [Info ▼] 
                                   ↑ toggle
```

El botón toggle:

```tsx
<button
  className="btn-icon"
  onClick={() => setShowVideoInfo(v => !v)}
  title={showVideoInfo ? 'Ocultar información de video' : 'Mostrar información de video'}
  style={{ fontSize: '11px', gap: '4px', display: 'flex', alignItems: 'center' }}
>
  <Info size={14} />
  {showVideoInfo ? 'Ocultar info' : 'Mostrar info'}
</button>
```

El panel:

```tsx
{showVideoInfo && <VideoInfoPanel ... />}
```

**Archivos a modificar:**

- `App.tsx` L.267-278 (Preview Toolbar) → agregar botón Info toggle
- `App.tsx` L.321-327 → envolver con `{showVideoInfo && ...}`

---

## P5 — Editor de Código Expandido (Code Field Modal)

### Raíz del Problema

`InspectorTabs.tsx` no tiene case `'code'` en el switch de `DynamicField`. El default (`string`) renderiza un `<input>` de una sola línea, que es inusable para HTML/CSS/JS.

El case `'code'` existía en el `App.tsx` original (antes del refactor) con un `<textarea>` de 160px. Se perdió en la extracción a `InspectorTabs.tsx`.

### Solución en 2 partes

**Parte A — Restaurar el campo `code` como textarea básico en el Inspector:**

```tsx
case 'code':
    return (
        <div className="dv-field" style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>{field.label}</label>
            <div style={{ position: 'relative' }}>
                <textarea
                    className="dv-input"
                    style={{
                        fontFamily: 'var(--font-mono)',
                        height: '100px',
                        resize: 'vertical',
                        fontSize: '11px',
                        lineHeight: '1.5',
                    }}
                    value={value ?? field.defaultValue}
                    onChange={(e) => onChange(field.id, e.target.value)}
                    spellCheck={false}
                />
                <button
                    onClick={() => setCodeModalOpen({ field, value })}
                    title="Abrir editor expandido"
                    style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        /* btn-icon styles */
                    }}
                >
                    <Maximize2 size={12} />
                </button>
            </div>
        </div>
    );
```

**Parte B — `CodeEditorModal`: ventana expandida sobre el Inspector**

Componente nuevo: `app/src/components/CodeEditorModal.tsx`

```
┌─────────────────────────────────────────────────────┐
│  ← HTML                              [Aplicar] [✕]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  <div class="lower-third">                          │
│    <h1>{{nombre}}</h1>                              │
│    ...                                              │
│                                                     │
│  (textarea grande, font-mono, fondo #050505)        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

Specs:

- Modal overlay sobre el inspector (no cubre el preview)
- `<textarea>` que ocupa todo el espacio del modal
- Botón "Aplicar" → `onChange(field.id, localValue)` y cierra
- Botón "✕" → cierra sin aplicar
- `spellCheck={false}`, `autocorrect="off"`, `autocapitalize="off"`
- Esc también cierra

Estado del modal: **local en `InspectorTabs`**:

```typescript
const [codeModal, setCodeModal] = useState<{ field: FormField; value: string } | null>(null);
```

**Archivos a crear/modificar:**

- `InspectorTabs.tsx` → restaurar `case 'code'` + agregar estado `codeModal` + botón expand
- `app/src/components/CodeEditorModal.tsx` → componente nuevo (modal overlay)

---

## P6 — Eliminar Badge "PRO" del Tab Queue

### Raíz del Problema

`InspectorTabs.tsx` L.207:

```tsx
<span className="dv-badge" style={{ marginLeft: '4px', color: 'var(--cta)' }}>PRO</span>
```

No hay tier PRO todavía. Mostrarlo crea expectativas incorrectas y confunde al usuario que no entiende por qué ve "PRO" en una herramienta gratuita.

### Fix

Eliminar el span. El tab `Queue` queda solo como stub disabled sin badge. El tooltip `title="Render Queue — Disponible en v6.0"` ya comunica suficiente.

```tsx
// Antes:
<ListVideo size={14} /> Queue
<span className="dv-badge" ...>PRO</span>

// Después:
<ListVideo size={14} /> Queue
```

**Archivos a modificar:**

- `InspectorTabs.tsx` L.207 → eliminar el `<span>` (1 línea)

---

## Orden de Implementación

```
1. P6  → InspectorTabs.tsx   (1 línea, 0 riesgo)       — 2 min
2. P3  → App.tsx              (2 líneas, 0 riesgo)       — 5 min
3. P4  → App.tsx              (estado + toggle)           — 10 min
4. P5a → InspectorTabs.tsx   (restaurar case 'code')     — 15 min
5. P2  → vite.config + version.ts + HomeMenu + App.tsx  — 20 min
6. P5b → CodeEditorModal.tsx  (componente nuevo)          — 30 min
7. P1  → resolve-theme.css    (Design System completo)    — 20 min
```

> **Nota sobre el orden del P1:** Se hace al final porque afecta toda la UI visualmente. Mejor validar que P2-P6 funcionen primero, luego hacer el Design System pass.

---

## Checklist de Entrega (Checkpoint 3)

### Fixes directos

- [ ] **P6** `InspectorTabs.tsx` → badge PRO eliminado del tab Queue
- [ ] **P3** `App.tsx` → indicador "Conectado" → "Guardado/Guardando/—"
- [ ] **P4** `App.tsx` → botón toggle `showVideoInfo` en Preview Toolbar
- [ ] **P5a** `InspectorTabs.tsx` → `case 'code'` restaurado con textarea
- [ ] **P2** `vite.config.ts` → define VITE_APP_VERSION + VITE_BUILD_DATE
- [ ] **P2** `app/src/version.ts` → nuevo archivo exportando constantes
- [ ] **P2** `HomeMenu.tsx` L.134, 178 → usar `APP_VERSION` + `BUILD_DATE`
- [ ] **P2** `App.tsx` L.169 → usar `APP_VERSION`

### Componentes nuevos

- [ ] **P5b** `CodeEditorModal.tsx` → modal overlay para editar código expandido
- [ ] **P1** `resolve-theme.css` → Design System refactor (paleta monocromática)
