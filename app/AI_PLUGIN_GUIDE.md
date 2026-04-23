# Crear Plugins con IA

Los asistentes de programación con IA pueden generar plugins completos y listos para producción para DVGE. Esta guía muestra la estrategia exacta de prompting para lograrlo al primer intento.

## Por qué los Plugins Necesitan un Prompt Específico
DVGE tiene reglas estrictas y poco convencionales:

- No se permiten librerías de animación en tiempo real (GSAP, Anime.js, etc.)
- Aislamiento Shadow DOM — `document` está prohibido, usa `ctx.root`
- Determinismo basado en fotogramas — toda la matemática de animación se deriva de `ctx.frame` o `ctx.timeline`

Sin instrucciones explícitas, la IA generará código con prácticas web estándar que no funcionarán en el motor.

## Prompt de Generación (v5.0.0 GA)
A partir de v5.0.0, el motor incluye una Capa de Inteligencia que permite generar plugins con código más simple. La IA no necesita gestionar el registro del plugin; solo define la apariencia y el comportamiento.

Copia este bloque en cualquier asistente de IA:

```text
Act as a senior Motion Graphics developer. Generate a plugin for the
DVGE engine v5.0.0 GA following these simplified rules:

SMART ENGINE COMPATIBILITY:
- Do NOT use dvEngine.register(). The engine will wrap your code.
- OBLIGATORY: Define the global function:
  window.renderDVGE = (frame, props, ctx) => { ... }

TECHNOLOGY:
- Use ONLY HTML/CSS and Vanilla JavaScript.
- No time-based animation (requestAnimationFrame, Date.now() or GSAP).

API UTILITIES:
- Use ctx.utils.loop(frame, 180) for 3-second loops.
- Use ctx.utils.spring(t) for professional bouncing effects.
- Access the DOM via ctx.root.getElementById().

STYLE:
- Canvas is 1920x1080.
- Use .dv-glass class for premium glassmorphism.

Generate 4 files: manifest.json, index.html, style.css, script.js.

PLUGIN DESCRIPTION:
[Describe your graphic here]
```

## Cómo Funciona el Auto-Rescate
Si la IA comete errores estructurales comunes, el motor los corrige en tiempo de ejecución:

- **Silenciador**: Si la IA usa `requestAnimationFrame`, el motor lo anula para proteger el determinismo.
- **Auto-Bridge**: Si la IA omite el registro oficial, el motor busca `window.renderDVGE` y lo conecta al ciclo de vida.
- **Contexto**: Recibes `frame`, `props` y `ctx` directamente en cada fotograma.

## Consejos para Mejores Resultados

### Sé Específico sobre la Animación
- **Evitar:** "Haz que se anime suavemente"
- **Ideal:** "Desliza desde la izquierda durante la intro usando `ctx.timeline.introProgress` y `utils.lerp`"

### Especifica el Layout
- **Evitar:** "Pon el texto en la parte inferior"
- **Ideal:** "Posiciona la tarjeta en `bottom: 120px; left: 80px` con posicionamiento absoluto"

### Define los Campos del Schema
- **Evitar:** "Añade campos de texto"
- **Ideal:** "Incluye estos campos: `name` (string), `role` (string), `accentColor` (color, default: #E44C30)"

## Validar Código Generado por IA

| Problema | Código Incorrecto | Solución |
|---|---|---|
| Acceso al DOM | `document.getElementById('x')` | `ctx.root.getElementById('x')` |
| Animación en tiempo real | `gsap.to(el, {...})` | `utils.lerp(0, 1, ctx.timeline.introProgress)` |
| Temporizadores | `setTimeout(fn, 500)` | Lógica basada en `ctx.frame` |
| Importaciones CSS | `@import url(...)` | Estilos directamente en `style.css` |
| Scripts externos | `<script src="...">` | Toda la lógica en `script.js` |

> **Flujo Pro**: Pega la salida de la IA directamente en DVGE y revisa la consola de DevTools (Ctrl+Shift+I). El motor registrará cualquier violación del sandbox.
