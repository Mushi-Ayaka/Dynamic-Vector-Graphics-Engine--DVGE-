# DVGE Visual Skills — Audit & Analysis Log
>
> **Propósito**: Registro crítico y progresivo de los resultados generados por la IA usando cada Visual Skill. Sirve como fuente de verdad para refinar los contratos estéticos en `visualSkills.ts`.
> **Metodología**: Cada entrada documenta: el skill invocado, el código resultante, el veredicto de calidad y las acciones de mejora derivadas.
---

## PROTOCOLO DE CALIFICACIÓN

| Puntuación | Criterio |
| --- | --- |
| 🔴 REJECT | Diseño genérico, no apto para producción. Requiere reescritura del skill. |
| 🟡 ELEVATE | Base técnicamente válida, pero visualmente insuficiente. Refinar el contrato. |
| 🟢 SHIP | Listo para producción. Puede servir como referencia o ejemplo. |
| ⚡ PROMOTE | Resultado excepcional. Se promueve como nuevo Visual Skill independiente. |

---

## [AUDIT #001] — Skill: `glassmorphism`

**Fecha**: 2026-05-03
**Invocación**: Prompt implícito de prueba del motor.

### Código Resultante (Evaluado)

```html
<!-- HTML: Lower third con línea de acento + título + subtítulo -->
<!-- Props: mainTitle, subTitle, layoutAlign -->
```

### Veredicto: 🔴 REJECT para `glassmorphism` / ⚡ PROMOTE para patrón de presentación

### Análisis Detallado

#### ❌ FALLO CRÍTICO — El skill `glassmorphism` NO fue aplicado

El código generado produce un **Lower Third tipográfico puro** (línea de acento + título + subtítulo). No existe **ningún** elemento de glassmorphism en el output:

- Cero `backdrop-filter`
- Cero paneles semitransparentes
- Cero efecto de profundidad por cristal
- Cero bordes difusos
**Causa Raíz**: El skill actual de `glassmorphism` en `visualSkills.ts` es demasiado genérico. Describe *propiedades* del cristal pero no fuerza a la IA a construir una **arquitectura de componentes** específica (¿qué forma tiene el panel? ¿qué envuelve qué?). La IA interpretó el brief libremente y eligió el camino de menor resistencia: un lower third simple.

#### ✅ ELEMENTO RESCATABLE — Patrón de Presentación de Títulos

La estructura HTML/CSS/JS del título sí es sólida y ejecuta correctamente:

- **`overflow: hidden` en `#sub-wrapper`**: Correcto. Crea la máscara invisible para el word reveal del subtítulo.
- **Stagger entre título y subtítulo**: `mapRange(ease, 0.4, 1, 0, 1)` es un patrón elegante para delay entre capas.
- **Línea de acento con `scaleY` + `scaleX`**: Entrada en dos ejes simultáneos. Es profesional.
- **Tipografía**: `font-weight: 800`, `letter-spacing: -2px`, `text-transform: uppercase` en 80px. Es la dirección correcta.
**Acción**: Este patrón debe ser capturado como un nuevo Visual Skill dedicado (ver propuesta abajo).

#### ⚠️ PROBLEMAS TÉCNICOS MENORES

1. **`font-family: sans-serif`**: Inaceptable. Es el fallback de browser. El skill debe forzar una Google Font específica declarada inline o con `@import`.
2. **`letter-spacing: -2px`**: Valor en `px` es frágil. Debe ser `-0.04em` para que escale con el `font-size`.
3. **El `slideAmount` de outro**: `outro * props.slideAmount` mueve el título en la **misma dirección** que el intro (hacia la derecha), pero sin inversión de signo, lo que da una salida idéntica a la entrada. Debería ser `-outro * props.slideAmount` para salida hacia la izquierda (o usar un prop separado para la dirección del outro).
4. **Sin grid técnico de fondo**: El MASTER_PROMPT exige "overlays técnicos (líneas, grids)" por defecto. Este resultado no los tiene.

---

### Acciones Derivadas

- [ ] **Reescribir** skill `glassmorphism` en `visualSkills.ts` con arquitectura de panel explícita.
- [ ] **Crear** nuevo skill `title-reveal` en `visualSkills.ts` (ver especificación abajo).
- [ ] **Documentar** el bug del outro-direction como advertencia en el skill de animación.

---

## [SKILL PROPUESTO] — `title-reveal`

**Categoría**: Presentación tipográfica / Lower Third profesional
**Inspiración**: BBC Sport, Apple Keynote, Linear.app, Stripe

```text
[VISUAL SKILL: TITLE REVEAL / PRESENTACIÓN TIPOGRÁFICA PROFESIONAL]
Concepto: Lower third o presentación tipográfica de alto impacto. La tipografía
opera como arquitectura: ocupa el espacio con autoridad, no como decoración.
Inspirado en broadcast deportivo (BBC Sport, ESPN FC) y keynotes tecnológicos (Apple, Linear).
Elementos Clave:
  1. ARQUITECTURA DE MÁSCARA OBLIGATORIA: Cada línea de texto (H1, H2, label) DEBE
     vivir dentro de un div contenedor con `overflow: hidden`. La animación de entrada
     es translateY(110%) → translateY(0). Este es el principio de "word reveal" de la
     tipografía cinética suiza. SIN este contenedor, el efecto no existe.
  2. JERARQUÍA EN 3 NIVELES OBLIGATORIOS:
     - EYEBROW: `font-size: 11px-13px`, `font-weight: 600`, `letter-spacing: 0.2em`,
       `text-transform: uppercase`, `opacity: 0.6`. Aparece PRIMERO.
     - TITLE: `font-size: 72px-120px`, `font-weight: 800-900`, `letter-spacing: -0.04em`,
       `line-height: 0.9-1.0`. Aparece SEGUNDO con impacto.
     - SUPPORT/DATA: `font-size: 13px-18px`, `font-weight: 300-400`,
       `letter-spacing: 0.08em`. Aparece TERCERO con stagger de 80ms-120ms.
  3. LÍNEA DE ACENTO ESTRUCTURAL: NO es decorativa. Es un separador de proporción.
     Ancho: `3px-5px`, altura: `60%-80%` del bloque de texto. Anima con `scaleY(0) → scaleY(1)`
     en la misma curva del título, pero con 30ms de adelanto. El color es el único
     punto de calor visual en todo el sistema.
  4. FUENTES OBLIGATORIAS (en orden de preferencia):
     - Bebas Neue (free, Google Fonts) — para títulos deportivos/impacto
     - Plus Jakarta Sans / Outfit (free) — para keynote tecnológico
     - Barlow Condensed (free) — para broadcast institucional
     Declarar via: `@import url('https://fonts.googleapis.com/css2?family=...')` en el bloque CSS.
  5. PALETA DE PARTIDA: `#FFFFFF` texto sobre `transparent` (el fondo es del canvas).
     Único acento: 1 color HSL definido por el usuario vía `@dv-prop type: color`.
  6. STAGGER DE CAPAS: eyebrow @ delay 0, title @ delay 80ms-100ms (ease=0.3),
     subtítulo @ delay 160ms-200ms (mapRange(ease, 0.4, 1, 0, 1) es el patrón correcto).
  7. OUTRO SIMÉTRICO: La salida debe ser la entrada invertida. Si el intro fue
     `translateY(110%)`, el outro es `translateY(-110%)`. Si fue `translateX(slide)`,
     el outro debe ser `translateX(-slide)`. NUNCA la misma dirección.
Lógica de Animación:
  - Curva de entrada: `cubic-bezier(0.16, 1, 0.3, 1)` (Expo Out / impacto percusivo).
    En `@dv-prop easing` con defaultValue: "[0.16, 1, 0.3, 1]".
  - Duración perceptual por elemento: 400ms-550ms (en unidades de frame a 30fps: 12-17 frames).
  - Stagger entre capas: 4-6 frames (a 30fps).
  - Outro: siempre `ctx.utils.lerp(1, 0, outro)` LINEAL. Duración: 50%-60% del intro.
  - El `ease` del bezier NO se aplica al outro — regla innegociable del motor DVGE.
```

---

## [AUDIT #002] — Skill: `glassmorphism` (Post-Reescritura)

**Fecha**: 2026-05-03
**Invocación**: Prompt explícito solicitando panel de cristal con objetos de fondo visibles para demonstrar el efecto.
**Veredicto**: 🟡 ELEVATE — Arquitectura correcta, ejecución de detalles premium incompleta.

### ✅ LO QUE FUNCIONÓ — Avances Reales

Este resultado confirma que la nueva especificación del skill **sí fuerza la arquitectura correcta**. La IA ahora construye el sistema en capas como se exige:

- **Capa de fondo (`#background-layer` + `.bg-circle`)**: Correcta. Objetos detrás del cristal que demuestran el efecto de blur real.
- **`backdrop-filter: blur(calc(var(--blurAmount) * 1px))`**: Implementado correctamente con prop paramétrico. El `calc()` con `* 1px` sigue las reglas del motor. ✅
- **Colores de esferas como `@dv-prop`**: Correcta flexibilidad. El usuario puede cambiar los 3 colores desde el Inspector. ✅
- **Movimiento orbital de círculos con `Math.sin/cos(frame * speed)`**: **Este es el punto más sofisticado del resultado.** Es animación determinista, frame-accurate, y produce el efecto de luz ambiental en movimiento que el skill exige para el `light leak dinámico`. La IA lo resolvió sin pseudo-elementos. ✅
- **Floating animation del panel** (`Math.sin(frame * floatSpeed) * 15`): Determinista y elegante. Comunica que el panel está "suspendido". ✅
- **Outro con `scale(1.1)`**: `exitScale = lerp(1, 1.1, outro)` — el panel se "evapora" expandiéndose. Coincide exactamente con el comportamiento descrito en el skill refinado ("efecto de presión invertida"). ✅
- **`opacityMult` en todos los elementos**: Correcto. Global opacity aplicado consistentemente. ✅

### ❌ FALLOS — Detalles Premium No Cumplidos

1. **`font-family: sans-serif`**: Tercer resultado con este fallo. Es un patrón de la IA. **Acción**: El skill DEBE incluir el `@import` de Google Fonts completo y literal, no solo la instrucción de usarlas. La IA no lo hará por iniciativa propia.
2. **`border-radius: 24px`**: Este radio es "app móvil de 2022", no "cristal técnico de instrumentación". El skill dice máximo 8px para el perfil anguloso premium. El valor 24px redondea tanto el panel que pierde autoridad visual. La IA eligió el default "web amigable".
3. **`letter-spacing: 2px` en título**: El audit anterior ya lo detectó. Debe ser `-0.04em` (tracking negativo) para impacto tipográfico, no `2px` positivo que lo abre y lo hace parecer lettering de póster genérico.
4. **Sin micro-grid overlay**: El `::before` con rejilla técnica no aparece. Esto era un elemento diferenciador clave del skill. La IA lo omitió porque pseudo-elementos CSS son más difíciles de "recordar" que propiedades directas. **Acción**: Incluir el snippet CSS del grid literalmente en el skill, no solo describirlo.
5. **Sin metadata corners**: Los textos de 8px en esquinas (`opacity: 0.3`) no aparecen. Mismo problema: la IA no incorpora detalles que no ve como "necesarios funcionales".
6. **Sin `clip-path` angular**: El panel sigue siendo rectangulares estándar. El corte diagonal que define el "cristal cortado" fue ignorado.
7. **Texto dentro del panel es estático** (`innerText` sin animación): El título y subtítulo dentro del glass panel aparecen sin transición propia. No hay mask reveal para el contenido interno. Para el caso glassmorphism esto es aceptable (no es el focus principal), pero si el panel tiene texto hero, debería animarse.
8. **`width: 1920px; height: 1080px` hardcodeado** en CSS: Violación de portabilidad. El wrapper siempre debe usar `100%` para adaptarse al canvas del motor.

### 🔍 INSIGHT CLAVE — Patrón de Comportamiento de la IA
>
> **La IA resuelve el "qué" si el skill lo describe, pero omite sistemáticamente el "cómo" si no incluye código literal de ejemplo.**
>
> Cuando el skill dice *"Pseudo-elemento `::before` con micro-grid"*, la IA entiende el concepto pero no lo implementa. Cuando el skill **incluye el snippet CSS exacto**, la IA lo copia y adapta.
**Conclusión**: Los Visual Skills de DVGE deben incluir **snippets de código de referencia** en los puntos más críticos (fuentes, pseudo-elementos, clip-path). No solo descripciones textuales. Esto es especialmente relevante para IAs gratuitas (Gemini Flash, GPT-4o) que tienen menor capacidad de inferencia compleja desde descripciones abstractas.

### Acciones Derivadas de Audit #002

- [x] Skill `glassmorphism` reescrito con arquitectura de capas explícita.
- [x] Snippets literales de CSS añadidos (micro-grid, clip-path, @import, metadata corners).
- [x] Restricción `border-radius` máx 8px documentada explícitamente.
- [x] Patrón `Math.sin/cos(frame)` documentado como canónico en el skill.

---

## [AUDIT #003] — Skill: `kinetic-text`

**Fecha**: 2026-05-03
**Invocación**: El usuario proporcionó contexto explícito adicional sobre la estética brutalista.
**Veredicto**: ⚡ PROMOTE — Resultado de referencia. Requiere mínimos ajustes para ser canónico.

### ✅ LO QUE FUNCIONÓ — Técnicas de Alto Impacto

Este es el resultado más sofisticado registrado hasta ahora. Confirma que con el brief correcto, la IA produce broadcast-grade de primera intención:

- **`font-size: 240px` + `letter-spacing: -0.07em`**: El tracking negativo agresivo es la firma del brutalismo tipográfico suizo. Exactamente lo que el skill exige. ✅
- **`scaleY(1.5) → scaleY(1)` en entrada del título**: Efecto de compresión vertical percusivo. El texto "se aplasta" al caer en su posición. Altamente cinematográfico y no documentado previamente en el skill. **Nuevo patrón a canonizar.** ✅
- **Background drift determinista**: `translateX(-(frame * driftSpeed) % 1000)` crea texto fantasma desplazándose en loop. Capa de profundidad de bajo coste visual. Determinista via frame. ✅
- **Stagger sin prop adicional**: `mapRange(intro, 0.2, 0.8, 0, 1)` para el tag y `mapRange(intro, 0.3, 0.9, 0, 1)` para el subtítulo — delay escalonado elegante sin parámetro extra. El patrón canónico del motor. ✅
- **`tag-box` con `scaleX(0) → scaleX(1)`**: El badge de color entra como un wipe horizontal. Percusivo y preciso. ✅
- **`#frame-border` con `scale(1.1) → scale(1)`**: El marco externo se contrae al aterrizar. Comunica tensión y precisión técnica. Detalle de nivel agencia premium. ✅
- **Paleta**: `#050505` + `#FF3E00` — el rojo sobre negro casi-puro es máximo contraste, mínima distracción. ✅
- **`opacity: 0.05` en el bg-text**: La capa fantasma es casi imperceptible pero añade dimensión. ✅

### ❌ FALLOS — Bugs y Omisiones

1. **`@import` de fuente ausente**: `font-family: 'Anton'` declarado pero sin `@import url('https://fonts.googleapis.com/css2?family=Anton')`. La fuente **no cargará**. Mismo patrón sistémico que Audit #001 y #002. La IA declara la fuente pero no la importa.
2. **`width: 1920px; height: 1080px` hardcodeado**: Tercer resultado con este bug. Patrón estructural de la IA que hay que interceptar en el skill.
3. **`(frame * driftSpeed) % 1000` — Jump artifact**: El módulo 1000 crea un salto brusco cuando el valor se resetea. En un render continuo (ej. duración > 33s a 30fps) esto es un glitch visible. El patrón correcto para looping suave es usar `Math.sin` o no hacer módulo — simplemente dejar que el número crezca (no hay overflow en JS para duraciones de video normales).
4. **`#corner-mark` declarado pero sin CSS ni JS**: Elemento huérfano. El HTML lo define, el CSS no lo estiliza, el JS no lo anima. Dead code.
5. **`ctx.root.querySelector('.tag-box')`**: Uso de `querySelector` con clase. El MASTER_PROMPT recomienda `getElementById` para máxima seguridad en el shadow DOM. No es un crash ahora, pero es frágil.
6. **`outro` del título**: El `scaleY` no se resuelve en el outro — solo la posición Y y la opacidad. En el outro, `ease` está en 1, entonces `scaleY(lerp(1.5, 1, 1)) = scaleY(1)`. Es correcto funcionalmente, pero no es explícito.

### 🔍 INSIGHT CLAVE — Patrón de Éxito Identificado
>
> **El brief explícito fue la diferencia entre un resultado mediocre y uno de exhibición.**
> El skill `kinetic-text` describe la *estética* (brutalismo suizo) pero la IA necesita ver los *componentes concretos* para ensamblarlos.
**Conclusión**: El resultado de este audit es la **referencia de implementación** para refinar el skill. Los snippets de código nuevos a canonizar son:

- `scaleY(1.5) → scaleY(1)` en entrada (compresión percusiva)
- Background drift con texto fantasma `opacity: 0.03-0.06`
- Frame border `scale(1.1) → scale(1)` (tensión técnica)
- Tag box con `scaleX` wipe

### Acciones Derivadas de Audit #003

- [ ] **Reescribir** skill `kinetic-text` con snippets literales de los 4 patrones identificados.
- [ ] Añadir `@import Anton` literal en el skill.
- [ ] Documentar el bug de `% 1000` y el patrón correcto para drift sin jump.
- [x] Skill `kinetic-text` reescrito con snippets canónicos de Audit #003 (scaleY percusivo, drift, frame border, tag wipe).

---

## [AUDIT #004] — Skill: sin identificar (posible `kinetic-text` o `broadcast`)

**Fecha**: 2026-05-03
**Invocación**: El usuario proporcionó contexto explícito adicional. Skill invocado no confirmado.
**Veredicto**: 🟡 ELEVATE — Técnica nueva de alto valor (`block-wipe reveal`). Bugs sistémicos persisten.

### ✅ LO QUE FUNCIONÓ — Nueva Técnica Canónica

**1. BLOCK-WIPE REVEAL — Nueva técnica a canonizar (ALTA PRIORIDAD):**
Esta es la técnica de reveal más sofisticada registrada hasta ahora. Funciona en 2 fases:

- **Fase 1** (`intro 0 → 0.5`): El bloque de color entra de izquierda a derecha (`scaleX(0 → 1)`, `transform-origin: left`). El texto está oculto detrás del bloque.
- **Fase 2** (`intro 0.5 → 1`): El `transform-origin` cambia a `right`. El bloque sale de derecha a izquierda (`scaleX(1 → 0)`). El texto queda revelado.
Esta es la **wipe reveal de agencia de diseño** usada en Pentagram, 2x4, Sagmeister & Walsh. El snippet es canónico:

```javascript
const blockIn = ctx.utils.clamp(intro * 2, 0, 1);
const blockOut = ctx.utils.clamp((intro - 0.5) * 2, 0, 1);
if (blockOut > 0) {
  overlay.style.transformOrigin = 'right';
  overlay.style.transform = `scaleX(${ctx.utils.lerp(1, 0, blockOut)})`;
} else {
  overlay.style.transformOrigin = 'left';
  overlay.style.transform = `scaleX(${ctx.utils.lerp(0, 1, blockIn)})`;
}
```

**2. Canvas grid determinista con parallax:**

```css
#canvas-grid {
  background-image:
    linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 80px 80px;
}
```

```javascript
bg.style.backgroundPosition = `${frame * 0.5}px ${frame * 0.2}px`;
```

Parallax determinista via frame. No usa CSS animation, no rompe el motor. ✅
**3. Frame counter en vivo:** `FRM: ${Math.floor(frame).toString().padStart(3, '0')}` — Metadato técnico que muestra el frame real. Detalle de producción que comunica que el gráfico es parte de un sistema vivo. ✅
**4. Coord label (`LAT: 40.7128° N`):** Texto de flavor que contextualiza sin informar. Es un detalle visual que los metadata corners de glassmorphism tenían como objetivo. ✅
**5. Tech-line auto-expansible:** La línea divisoria usa `flex-grow: 1` para llenarse entre la etiqueta y el contador. Elegante y estructural. ✅

### ❌ FALLOS — Bugs Sistémicos (Cuarto Registro)

1. **`@import` ausente**: Cuarto resultado consecutivo. `font-family: 'Inter'` sin `@import`. La IA **nunca** importará la fuente a menos que el skill incluya la línea de `@import` literal. 🚨 **PATRÓN CONFIRMADO SISTÉMICO**.
2. **`1920px / 1080px` hardcodeado**: Cuarto resultado. 🚨 **PATRÓN CONFIRMADO SISTÉMICO**.
3. **`props.stagger` declarado pero NUNCA usado**: Viola la regla del MASTER_PROMPT (prop declarada = prop consumida). Es una prop fantasma. La IA declaró el prop para parecer flexible pero no lo implementó.
4. **`lineEase` usa offset incorrecto**: `bezier(curve, clamp(intro - 0.4, 0, 1))` — cuando `intro` va de 0.4 a 1, el input al bezier va de 0 a 0.6, no de 0 a 1. La línea **nunca llega al 100%** de extensión. El patrón correcto es `mapRange(intro, 0.4, 1, 0, 1)` que sí normaliza correctamente al rango [0,1].
5. **Block overlay sin outro**: El bloque revelador entra correctamente, pero en el outro simplemente desaparece con la opacidad general. No hay un outro del bloque (que debería re-ejecutar el wipe en sentido inverso o salir con `scaleX(0)` desde la derecha).

### 🔍 INSIGHT CRÍTICO — El Problema de Razón
>
> El usuario no debería tener que dar contexto adicional. Si lo da, es una falla del skill.
**Diagnóstico del fallo actual de los skills:**
Los skills actuales describen una *estética* pero no una *receta*. Una IA de nivel free (Gemini Flash, GPT-4o mini) necesita una receta, no una filosofía. La diferencia es:
| Filosofía (actual) | Receta (objetivo) |
| --- | --- |
| "La tipografía es arquitectura" | "USA este HTML, USA este CSS, USA este JS" |
| "Usar block reveals" | Snippet literal de la técnica block-wipe |
| "Fuentes condensadas bold" | `@import` URL literal incluida en el skill |
**Los dos bugs sistémicos (font import, 1920px) requieren una solución global, no por-skill.**
La solución correcta es añadir estas restricciones al MASTER_PROMPT, no a cada skill individualmente.

### Acciones Derivadas de Audit #004

- [ ] Añadir al **MASTER_PROMPT** regla explícita: `width: 100%; height: 100%` es OBLIGATORIO en el wrapper. Incluir en la "Lista de Verificación Pre-Emisión".
- [ ] Añadir al **MASTER_PROMPT** regla explícita: Todo `@import` de fuente DEBE estar al inicio del bloque CSS si se referencia una fuente personalizada.
- [ ] **Crear** nuevo skill `block-reveal` en `visualSkills.ts` con el patrón wipe canónico.
- [ ] Documentar `mapRange` como la herramienta correcta para delays implícitos (no `clamp(intro - offset, 0, 1)`).

---

## REGLAS GLOBALES A AÑADIR AL MASTER_PROMPT
>
> Estas reglas se repiten en todos los audits. Deben escalarse a nivel global.

```text
REGLA GLOBAL 13: wrapper dimensions
  CORRECTO: #wrapper { width: 100%; height: 100%; }
  INCORRECTO: #wrapper { width: 1920px; height: 1080px; } — El motor provee el canvas.
REGLA GLOBAL 14: @import de fuentes
  Si el CSS usa una fuente personalizada (Inter, Anton, Plus Jakarta Sans, Barlow, etc.),
  la primera linea del bloque CSS DEBE ser:
  @import url('https://fonts.googleapis.com/css2?family=NOMBRE:wght@PESOS&display=swap');
  Sin @import, la fuente no carga. Usar font-family: sans-serif como fallback sin @import = error.
REGLA GLOBAL 15: mapRange para delays implicitos
  CORRECTO: mapRange(intro, 0.3, 1, 0, 1) — normaliza al rango [0,1] correctamente
  INCORRECTO: clamp(intro - 0.3, 0, 1) — el valor maximo es 0.7, no 1. Animacion incompleta.
```

---

## REGISTRO DE SKILLS — Estado

| Skill Key | Estado Actual | Prioridad de Mejora |
| --- | --- | --- |
| `glassmorphism` | 🟢 SHIP — snippets canónicos, listo para re-audit | BAJA |
| `kinetic-text` | 🟢 SHIP — reescrito con Audit #003, pendiente re-audit | BAJA |
| `broadcast` | 🟡 ELEVATE — falta densidad de capas | MEDIA |
| `cyberpunk-hud` | No auditado | — |
| `studio-showcase` | No auditado | — |
| `data-viz-analytic` | No auditado | — |
| `publicidad-motion` | No auditado | — |
| `live-production` | No auditado | — |
| `minimal-elegant` | No auditado | — |
| `cinematic` | No auditado | — |
| `title-reveal` | ⚡ CREADO — derivado de Audit #001, en `visualSkills.ts` | BAJA |
| `block-reveal` | 🟡 PROPUESTO — derivado de Audit #004, pendiente creación | 🔥 ALTA |
