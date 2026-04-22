# Guía de Creación de Plugins con Inteligencia Artificial (v4.1.5 GA)

## ¿Qué es un Plugin?

Un **plugin** en el Dynamic Vector Graphics Engine (DVGE) es un gráfico de video personalizado. A partir de la v4.1.5, el motor es "Inteligente": no necesitas saber programar estructuras complejas, solo definir cómo se ve tu gráfico cuadro a cuadro.

---

## 🚀 El Nuevo Prompt Maestro (Ultra-Simplificado)

Copia este bloque en tu IA. Gracias a la **Capa de Inteligencia** del motor, la IA ya no puede fallar con el registro.

```text
Actúa como un Desarrollador Senior de Motion Graphics. Genera un plugin para el motor DVGE v4.1.5 siguiendo estas reglas:

1. TECNOLOGÍA: Usa SOLO HTML/CSS y Vanilla Javascript puro.
2. ESTRUCTURA: Define siempre la función global: 
   window.renderDVGE = (frame, props, ctx) => { ... }
3. DETERMINISMO: Usa 'frame' para animar. No uses requestAnimationFrame ni Date.now().
4. UTILIDADES: Usa ctx.utils.loop(frame, 180) para ciclos de 3 segundos.
5. ESTILOS: El lienzo es 1920x1080. Usa la clase .dv-glass para efectos premium.

Genera 4 archivos (manifest.json, index.html, style.css, script.js).

[DESCRIPCIÓN DEL PLUGIN: ...]
```

---

## 🛠️ ¿Cómo funciona el "Auto-Rescate"?

Si la IA genera un código simple, el motor lo envuelve automáticamente:
- **Silenciador:** Si la IA usa `requestAnimationFrame`, el motor lo anula para que no rompa el video.
- **Auto-Bridge:** Si la IA olvida `dvEngine.register`, el motor busca `window.renderDVGE` y lo conecta por ti.
- **Contexto:** Tienes acceso total a `ctx.utils` (spring, lerp, loop) dentro de la función.

---

## 💡 Consejos de Diseño
- **Loops:** Usa siempre `const progress = ctx.utils.loop(frame, 180)` para que tu animación nunca se detenga.
- **Glassmorphism:** Aplica la clase `.dv-glass` a tus contenedores para que el gráfico se vea profesional sobre cualquier fondo.
- **Branding:** Recuerda que el motor inyecta el logo automáticamente si usas el preset `branding`.
