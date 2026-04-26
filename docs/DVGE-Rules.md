
# DYNAMIC VECTOR GRAPHICS ENGINE (DVGE) v5.5.0 GA
## MASTER RULES FOR AI ASSISTANTS

1. ARCHITECTURE:
   - Use Vanilla JS only. No external libraries (GSAP, etc.).
   - Access DOM via ctx.root.getElementById (Shadow DOM).

2. PROTOCOLO:
   - Use window.renderDVGE = (frame, props, ctx) => { ... }.
   - Everything must be deterministic (frame-based).

3. UTILS:
   - Use ctx.utils.lerp, ctx.utils.spring, ctx.utils.clamp.

(File generated automatically on 23/4/2026, 3:24:23 p. m.)
