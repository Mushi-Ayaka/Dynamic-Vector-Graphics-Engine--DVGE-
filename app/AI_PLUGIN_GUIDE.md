# Guía de Creación de Plugins con Inteligencia Artificial

## ¿Qué es un Plugin?

Un **plugin** en el Dynamic Vector Graphics Engine (DVGE) es un gráfico de video personalizado: puede ser una banda de texto, un título animado, un marcador de tiempo, un callout, o cualquier elemento visual que necesites superponer sobre tu video.

Cada plugin vive en su propia carpeta dentro del directorio de plugins de tu sistema, y está compuesto por exactamente **cuatro archivos** que definen su apariencia, comportamiento y controles editables.

El motor fue diseñado para que cualquier persona, con o sin experiencia en programación, pueda crear sus propios plugins valiéndose de un asistente de inteligencia artificial. A partir de la **versión 3.2.0**, el motor genera automáticamente los controles en la aplicación basándose en el `manifest.json` que la IA escriba.


---

## Los Cuatro Archivos de un Plugin

Antes de hablar con el asistente de IA, es importante que entiendas qué hace cada archivo. Esto te permitirá describir mejor lo que necesitas y evaluar si el resultado es correcto.

### 1. `manifest.json` — El descriptor del plugin

Define el nombre del plugin, su descripción y los **campos editables** que aparecerán en el panel de propiedades de la aplicación.

```json
{
  "id": "mi-plugin-id",
  "name": "Nombre Visible en la App",
  "description": "Una línea describiendo este gráfico.",
  "version": "1.0.0",
  "schema": [
    { "type": "string", "id": "nombre", "label": "Nombre", "defaultValue": "Ana López" },
    { "type": "string", "id": "cargo", "label": "Cargo", "defaultValue": "Directora" },
    { "type": "color", "id": "colorPrincipal", "label": "Color", "defaultValue": "#E44C30" }
  ]
}
```

Los tipos de campo disponibles son: `"string"` (texto), `"color"` (selector de color), `"number"` (numérico) e `"image"` (ruta de imagen).

> [!TIP]
> **Novedad v3.1:** El motor ahora incluye `dvEngine.utils` con funciones de easing (`easeOutCubic`, `easeOutBounce`, etc.) y math (`lerp`, `clamp`) integradas. ¡No necesitas redefinirlas en cada script!

### 2. `index.html` — La estructura del gráfico

Define los elementos visuales del gráfico usando HTML estándar. **No debe contener etiquetas `<html>`, `<head>` ni `<body>`**, solo el contenido visual directo.

```html
<div id="contenedor-principal">
  <div id="nombre-texto">Ana López</div>
  <div id="cargo-texto">Directora</div>
</div>
```

### 3. `style.css` — Los estilos visuales

Contiene las reglas CSS que definen la estética del gráfico. El lienzo de trabajo es siempre **1920×1080 píxeles** con posicionamiento absoluto.

```css
#contenedor-principal {
  position: absolute;
  bottom: 120px;
  left: 100px;
  /* ... */
}
```

### 4. `script.js` — La lógica de animación

Contiene la lógica de la animación. **Debe usar obligatoriamente la API del motor** mediante `dvEngine.register({})`. Este archivo es el más crítico y tiene reglas estrictas que se explican a continuación.

---

## Reglas Críticas del Script de Animación

El motor ejecuta el script fotograma a fotograma dentro de un entorno aislado. Para funcionar correctamente, el script debe respetar las siguientes reglas:

1. **Usar `dvEngine.register({})`** con los tres hooks: `awake`, `start`, y `update`.
2. **Usar `ctx.root.getElementById()`** en lugar de `document.getElementById()`, ya que el plugin vive dentro de un Shadow DOM.
3. **Enlazar los datos de los formularios dentro del hook `update`**, no en `awake` ni en `start`, para que la previsualización sea reactiva en tiempo real.
4. **No usar `window.requestAnimationFrame()`**; el motor maneja su propio ciclo de fotogramas mediante `ctx.frame`.

---

---

## Librerías de Animación Nativas (v3.1)

A partir de la versión 3.1.0, el motor inyecta automáticamente una librería de utilidades (`dvEngine.utils`) para que no tengas que escribir lógica matemática compleja. Puedes pedirle a la IA que use cualquiera de estas opciones para tus animaciones:

| Función | Tipo | Uso Recomendado |
| :--- | :--- | :--- |
| `utils.lerp(a, b, t)` | Math | Transiciones suaves entre dos valores. |
| `utils.clamp(v, min, max)`| Math | Limitar valores a un rango (ej: opacidad 0-1). |
| `utils.easeOutCubic(t)` | Easing | Empieza rápido, termina lento (muy elegante). |
| `utils.easeInOutCubic(t)` | Easing | Suavizado natural de entrada y de salida. |
| `utils.easeOutBounce(t)` | Easing | Efecto de rebote elástico (notificaciones). |
| `utils.easeOutElastic(t)` | Easing | Efecto de "muelle" dinámico. |
| `utils.hexToRgb(hex)` | Parser | Útil para inyectar colores manifest en variables CSS. |
| `settings` | Metadata | Acceso a `fps`, `duration` (segundos) y `resolution`. |

---

## 🤖 Auditoría: Reglas de Oro para la IA (v3.2.1)

Para lograr una generación "One-Shot" (que funcione a la primera), es vital incluir estas reglas en tu prompt. Hemos detectado que los errores más comunes de la IA son **sintácticos**:

1. **Backticks Obligatorios**: La IA suele olvidar usar backticks (`` ` ``) al inyectar valores en strings de CSS (ej: `` `translateY(${val}px)` ``). Sin ellos, el plugin crashea.
2. **Contexto Persistente**: A partir de la v3.2.1, el objeto `ctx` es persistente. La IA puede guardar estado en `ctx._state = {}` dentro de `awake` y recuperarlo en `update` sin perder datos.
3. **Uso de `ctx.settings`**: Pedir a la IA que use `ctx.settings.fps` y `ctx.settings.duration` en lugar de valores hardcoded para que el gráfico se adapte automáticamente al proyecto.
4. **Validación de Operadores**: Asegurar que la IA no olvide operadores lógicos (como `||`) en bloques condicionales complejos.

---

## El Nuevo Prompt Maestro (Optimizado para One-Shot)

> **Copia el siguiente bloque y pégalo en tu asistente. Está diseñado para prevenir los errores detectados en la auditoría v3.2.1.**

```text
Actúa como un desarrollador senior de Motion Graphics y JavaScript. Genera un plugin para DVGE v3.2.1 siguiendo estas reglas técnicas IRROMPIBLES:

1. ARCHIVOS: Genera manifest.json, index.html, style.css y script.js.
2. API: Usa estrictamente dvEngine.register({ awake, start, update }).
3. CONTEXTO: Usa ctx.root.getElementById, ctx.frame, ctx.props, ctx.utils y ctx.settings.
4. PERSISTENCIA: El objeto ctx es persistente. Guarda referencias DOM en ctx._el y estado en ctx._state.
5. SINTAXIS CRÍTICA: 
   - Usa SIEMPRE backticks (``) para CUALQUIER string de CSS dinámico en JS.
   - Verifica que todos los operadores lógicos (&&, ||) estén presentes.
6. DISEÑO: Calidad broadcast, 1920x1080, animaciones fluidas con easing.

[DESCRIPCIÓN DEL PLUGIN: Define aquí lo que quieres. Ej: Un Lower Third con estilo Cyberpunk.]

ANTES DE ENTREGAR, VERIFICA: ¿Usaste backticks en todos los .transform y .style? ¿Pasaste ctx a todos los hooks?
```

El objetivo del plugin es generar un gráfico visual dinámico para producción audiovisual profesional. El plugin debe verse elegante, moderno y de calidad broadcast.

---

## ESTRUCTURA REQUERIDA

Debes generar EXACTAMENTE 4 archivos. Si tu plataforma permite crear un archivo .zip, hazlo. Si no, devuelve cada archivo en un bloque de código markdown bien etiquetado con el nombre del archivo en la primera línea.

---

## ARCHIVO 1: manifest.json

Schema de propiedades editables. Usa los tipos: "string", "number", "color", "image".

Estructura exacta:
{
  "id": "nombre-carpeta-unico",
  "name": "Nombre Visible en la App",
  "description": "Una descripción clara.",
  "version": "1.0.0",
  "schema": [
    { "type": "string", "id": "propiedadClave", "label": "Etiqueta UI", "defaultValue": "Valor por Defecto" }
  ]
}

---

## ARCHIVO 2: index.html

Marcado HTML del gráfico. REGLAS OBLIGATORIAS:
- Sin etiquetas <html>, <head> ni <body>.
- Usa siempre un div raíz con id="contenedor-principal" o similar.
- Todos los elementos que se animen o muestren datos deben tener IDs únicos.

---

## ARCHIVO 3: style.css

CSS estándar. REGLAS OBLIGATORIAS:
- El lienzo es de 1920x1080 píxeles con posicionamiento absoluto.
- Diseño de calidad broadcast: usa tipografías modernas, gradientes, sombras.
- Usa variables CSS (var(--color-principal)) para los valores dinámicos del manifest.

---

## ARCHIVO 4: script.js

La lógica de animación. REGLAS CRÍTICAS E IRROMPIBLES:
- SIEMPRE usar dvEngine.register({ awake, start, update }).
- NUNCA usar document.getElementById(); usar SIEMPRE ctx.root.getElementById().
- NUNCA usar window.requestAnimationFrame(); el motor usa ctx.frame.
- Enlazar todos los datos del manifest (ctx.props) dentro del hook UPDATE para reactividad en tiempo real.
- Las animaciones deben basarse matemáticamente en ctx.frame con funciones de easing.
- **OPTIMIZACIÓN:** Usa las utilidades nativas en `dvEngine.utils` para animaciones suaves (lerp, clamp, easeOutCubic, easeOutBounce, easeOutElastic, hexToRgb).

Plantilla estricta:
dvEngine.register({
  awake: (ctx) => {
    // Capturar referencias DOM e inicializar estilos estáticos.
  },
  start: (ctx) => {
    // Lógica que se ejecuta al inicio de la reproducción (frame 0).
  },
  update: (ctx) => {
    const { frame, root, props, utils } = ctx;

    // 1. Enlace reactivo de datos (hacer esto siempre primero)
    const miElemento = root.getElementById('mi-elemento');
    if (!miElemento) return;
    miElemento.innerText = props.propiedadClave || 'Valor';

    // 2. Animaciones matemáticas basadas en frame usando utilidades nativas
    const progreso = Math.min(1, frame / 30);
    miElemento.style.opacity = utils.easeOutCubic(progreso).toString();
  }
});

---

## MI DESCRIPCIÓN DEL PLUGIN

[ESCRIBE AQUÍ TU DESCRIPCIÓN. Ejemplo: "Quiero una banda de texto inferior para entrevistas. Debe mostrar el nombre del entrevistado y su cargo. El estilo debe ser minimalista y oscuro con una línea de acento en color naranja. La animación de entrada debe ser un deslizamiento desde abajo."]
```

---

## Instalación del Plugin Generado

Una vez tengas los cuatro archivos del plugin (ya sea vía .zip descomprimido o copiando cada bloque de código en su archivo correspondiente):

1. Abre la carpeta de plugins desde la aplicación: **Menú Ayuda → Abrir Carpeta de Plugins**.
2. Dentro de esa carpeta, crea una nueva carpeta con el mismo nombre que el `id` del plugin.
3. Coloca los cuatro archivos dentro de esa carpeta.
4. Vuelve a la pantalla de inicio de la aplicación.
5. El nuevo plugin aparecerá automáticamente en la lista de plantillas disponibles al crear un proyecto.
