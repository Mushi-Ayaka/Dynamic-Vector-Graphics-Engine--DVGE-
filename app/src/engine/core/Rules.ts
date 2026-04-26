/**
 * [v5.5.0] DVGE Master Rules Source of Truth
 * Este archivo centraliza todas las instrucciones que la IA necesita saber.
 */

export const DVGE_MASTER_RULES = `
# DYNAMIC VECTOR GRAPHICS ENGINE (DVGE) v5.5.0 GA
## GUÍA TÉCNICA PARA ASISTENTES DE IA

### 1. ARQUITECTURA CORE
- **Sin Librerías Externas**: No uses GSAP, Anime.js, jQuery ni librerías de terceros. Solo Vanilla JS puro.
- **Shadow DOM**: El motor inyecta el código en un Shadow Root. Debes usar \`ctx.root.getElementById('id')\` en lugar de \`document.getElementById\`.

### 2. PROTOCOLO DE RENDERIZADO (Smart Engine)
- **Entry Point**: El código debe definir la función \`window.renderDVGE = (frame, props, ctx) => { ... }\`.
- **Determinismo**: Toda la lógica de movimiento DEBE basarse en el argumento \`frame\`. No uses \`setTimeout\`, \`setInterval\` ni \`Date.now()\`.

### 3. UTILIDADES DISPONIBLES (ctx.utils)
Usa siempre estas funciones para animaciones fluidas:
- \`ctx.utils.lerp(start, end, progress)\`: Interpolación lineal.
- \`ctx.utils.spring(progress, stiffness, damping)\`: Movimiento elástico.
- \`ctx.utils.clamp(val, min, max)\`: Restringe valores.
- \`ctx.utils.easeOutCubic(t)\`: Suavizado de salida.

### 4. FORMATO DE RESPUESTA
Entrega el código siempre con estas etiquetas para facilitar el copiado:
- [[[HTML]]]
- [[[CSS]]]
- [[[JS]]]
`;

/**
 * Función para generar un archivo descargable (Blob)
 * Nota: Como Gemini acepta imágenes y PDFs, aquí preparamos el contenido.
 */
export const downloadRulesAsFile = () => {
    const blob = new Blob([DVGE_MASTER_RULES], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'DVGE-Master-Rules-v5.5.0.md';
    link.click();
    URL.revokeObjectURL(url);
};
