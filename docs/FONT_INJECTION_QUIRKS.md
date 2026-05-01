# DVGE Font Injection Quirks & Troubleshooting

## El Bug del Fallback Genérico (`sans-serif`)

**Problema:**
Al inyectar código CSS a través de las plantillas de DVGE (Studio Master) o previsualizar HTML dentro del motor, definir un `font-family` que incluye una familia genérica como fallback (por ejemplo: `font-family: Outfit, sans-serif;`) causa que el motor ignore completamente la fuente web personalizada (Outfit) y fuerce el renderizado usando la fuente por defecto del sistema (generalmente Arial).

**Causa Técnica:**
Este es un *quirk* (comportamiento anómalo) del entorno de renderizado (Chromium/Electron/Remotion). Al detectar la palabra clave reservada `sans-serif`, el analizador de CSS inyectado parece darle prioridad inmediata o falla al establecer la asincronía necesaria para descargar la fuente de Google Fonts. Como resultado, en lugar de esperar a que "Outfit" cargue, el motor aplica instantáneamente la fuente genérica que ya tiene localmente.

**Solución Descubierta:**
Eliminar por completo las palabras clave genéricas (`sans-serif`, `serif`, `monospace`) de las declaraciones de `font-family`. 

En su lugar, usa únicamente el nombre de la fuente, o proporciona un fallback específico explícito (otra fuente con nombre).

✅ **Correcto:**
```css
font-family: Outfit;
/* o usando un fallback explícito: */
font-family: Outfit, Montserrat;
```

❌ **Incorrecto (Romperá la carga en DVGE):**
```css
font-family: Outfit, sans-serif;
font-family: 'Outfit', sans-serif;
```

## Reglas de Oro para Tipografías en DVGE

1. **Nunca usar `sans-serif`**: Si la fuente web falla, es mejor que no renderice o que dependa de otro fallback explícito a que rompa la carga de la principal.
2. **Carga en JS**: Para asegurar que la fuente esté disponible a nivel global en la ventana de Electron (y no sufra bloqueos por inyección en `innerHTML`), inyectar el `<link>` directamente en el `document.head` desde la pestaña de JS.
3. **Cero Comillas**: Algunos inyectores pueden corromper el string si se usan comillas (`'Outfit'`). Mantener nombres de fuentes de una sola palabra sin comillas (`Outfit`).
