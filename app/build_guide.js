const fs = require('fs');
const tech = fs.readFileSync('TECHNICAL.md', 'utf-8');
const guide = `# Guía de Creación de Plugins con Inteligencia Artificial (v4.1.5)

## 🚀 El Nuevo Super-Prompt Maestro

Copia el siguiente bloque completo y pégalo en tu IA (ChatGPT, Claude, etc.). Este bloque contiene la documentación técnica entera del motor y las reglas estrictas de animación. Al final, solo debes reemplazar la sección con tu descripción.

\`\`\`text
Actúa como un Desarrollador Senior de Motion Graphics. Genera un plugin completo para el motor Dynamic Vector Graphics Engine (DVGE) v4.1.5.
A continuación, te proporciono la Documentación Técnica del motor para que comprendas la arquitectura, el ciclo de vida de los plugins y las utilidades matemáticas disponibles:

--- INICIO DE DOCUMENTACIÓN TÉCNICA ---
${tech}
--- FIN DE DOCUMENTACIÓN TÉCNICA ---

## PRESET: REGLAS ESTRICTAS DE ANIMACIÓN Y ESTRUCTURA
1. TECNOLOGÍA: Usa SOLAMENTE HTML/CSS y Vanilla Javascript puro. Genera exactamente 4 archivos: manifest.json, index.html, style.css y script.js.
2. DETERMINISMO: NUNCA uses requestAnimationFrame ni Date.now(). Toda animación debe basarse matemáticamente en ctx.frame o ctx.timeline.progress usando las utilidades de ctx.utils.
3. ESTILOS: El lienzo es SIEMPRE 1920x1080 con posicionamiento absoluto. Para efectos translúcidos (glassmorphism), usa la clase CSS .dv-glass.
4. REACTIVIDAD: Enlaza los datos de ctx.props al DOM EXCLUSIVAMENTE dentro del hook update para que se actualicen en tiempo real, no en start ni awake.
5. DOM AISLADO: NUNCA uses document.getElementById. Usa siempre ctx.root.getElementById ya que el HTML está encapsulado en un Shadow DOM.

## MI DESCRIPCIÓN DEL PLUGIN (REQUERIMIENTOS)
[REEMPLAZA ESTE TEXTO CON LA DESCRIPCIÓN DE TU GRÁFICO. Ej: "Quiero un lower third elegante para noticias, con fondo azul oscuro y una línea roja de acento. La animación de entrada debe ser un slide desde la izquierda."]
\`\`\`
`;
fs.writeFileSync('AI_PLUGIN_GUIDE.md', guide, 'utf-8');
console.log('Done!');
