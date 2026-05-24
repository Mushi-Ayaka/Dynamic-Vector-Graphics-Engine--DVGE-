export const visualSkills: Record<string, string> = {

  'block-reveal': `
[VISUAL SKILL: BLOCK REVEAL / EDITORIAL WIPE]

Concepto: El texto existe detras de una cortina de color que se abre. No es un fade —
es un acto de revelacion mecanica. Referencia: revistas de moda (Vogue, i-D), openings
editoriales de Netflix (Mindhunter, The Queen's Gambit), branding de Squarespace y Linear.

Arquitectura OBLIGATORIA de 2 Fases:
  FASE 1 — WIPE REVEAL: la mascara de color barre hacia la derecha (scaleX 0 -> 1 -> 0).
  FASE 2 — TEXTO EN CONTEXTO: mientras la mascara sale, el titulo es visible sin efectos extra.
  REGLA CRITICA: El titulo NUNCA hace fadein propio. El reveal de la mascara LO revela.

Elementos Clave:
  1. MASCARA DE REVEAL (SNIPPET LITERAL OBLIGATORIO):
     HTML: <div class="line-mask">
             <div class="mask-block" id="mask-1"></div>
             <h2 id="title-1"></h2>
           </div>
     CSS: .line-mask { position: relative; overflow: hidden; }
          .mask-block { position: absolute; inset: 0; background: var(--maskColor);
            transform-origin: left center; }
          .line-mask h2 { position: relative; z-index: 1; opacity: 1; }
     JS (las 2 fases de la mascara con intro de 0 a 1):
     /* FASE 1: mascara entra de izquierda (scaleX 0 -> 1), pico en intro=0.5 */
     /* FASE 2: mascara sale hacia derecha (transform-origin: right, scaleX 1 -> 0), intro=0.5 a 1 */
     const p = intro * 2; // 0-1 mapeado a 0-2
     if (p < 1) {
       mask.style.transformOrigin = 'left center';
       mask.style.transform = 'scaleX(' + p + ')';
     } else {
       mask.style.transformOrigin = 'right center';
       mask.style.transform = 'scaleX(' + (2 - p) + ')';
     }

  2. COLOR DE MASCARA (prop obligatoria):
     El color de la mascara es la firma visual. Puede ser el color de acento de la marca.
     CSS: --maskColor: var(--accentColor); /* prop color desde JS */
     La mascara en movimiento ES el branding. Elegir un color que represente la marca.

  3. CANVAS GRID (capa tecnica de fondo):
     CSS: #canvas-grid { position: absolute; inset: 0; pointer-events: none;
       background-image: linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
                         linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
       background-size: 80px 80px; }
     El grid de fondo da profundidad tecnica y hace que el reveal sea mas dramatico por contraste.

  4. TITULO PRINCIPAL — BRUTALISMO TIPOGRAFICO:
     CSS: h1 { font-size: 120px; font-weight: 900; letter-spacing: -0.02em; line-height: 0.9;
       text-transform: uppercase; color: white; }
     El titulo no tiene opacity 0 — siempre esta "ahi", es la mascara quien lo oculta.

  5. METADATA TECNICA (detalle de acabado):
     Incluir siempre: numero de edicion, año, coordenadas o referencia tecnica.
     CSS: .tag-box { border: 1px solid rgba(255,255,255,0.3); padding: 4px 12px; font-size: 11px; letter-spacing: 0.2em; }

  6. TIPOGRAFIA:
     @import url('https://fonts.googleapis.com/css2?family=Inter:wght@900&family=Space+Grotesk:wght@700&display=swap');
     Headline: Inter 900 o Space Grotesk 700. Sin serif — es editorial moderno, no clasico.
     Eyebrow/metadata: Inter 400-500, tracking extenso (0.2em-0.4em).

  7. STAGGER ENTRE LINEAS:
     Si hay multiples lineas reveladas, cada una tiene un delay de +0.15 en el intro.
     Linea 1: revela en intro 0.0 a 0.5. Linea 2: revela en intro 0.15 a 0.65. Etc.
     JS: const lineProgress = ctx.utils.mapRange(intro, delay, delay + 0.5, 0, 1);

  8. BACKGROUND ANIMADO (opcional pero premium):
     CSS: .bg-text { font-size: 300px; font-weight: 900; opacity: 0.04; position: absolute;
       white-space: nowrap; }
     El texto de fondo gigante NO usa modulo. Deriva lentamente:
     bgText.style.transform = 'translateX(' + ctx.utils.lerp(-100, -200, intro) + 'px)';

  9. WRAPPER:
     #wrapper { position: absolute; width: 100%; height: 100%; overflow: hidden; background: #0a0a0a; }
     El overflow: hidden en el wrapper es critico — los textos de fondo NO deben desbordarse.
`,

  'glassmorphism': `
[VISUAL SKILL: PRISMATIC TECHNICAL GLASS]

Concepto: Panel de cristal de alta densidad tecnica. NO es "blur + transparencia". Es una
interfaz de instrumentacion aeroespacial con material fisica simulada: refraccion, grosor
real del cristal, micro-textura y luz ambiental dinamica. Referencia: Apple Vision Pro UI,
Linear.app, interfaces de flight simulator de lujo.

Arquitectura de Componentes OBLIGATORIA:
  El resultado DEBE tener esta jerarquia de capas (de atras hacia adelante):
  CAPA 1 — Objetos de fondo (shapes, esferas) que demuestran el blur real al pasar detras del cristal.
  CAPA 2 — Panel de cristal principal con backdrop-filter.
  CAPA 3 — Micro-grid overlay (::before) tatuado sobre el cristal.
  CAPA 4 — Contenido interior (texto, datos, KPIs).
  CAPA 5 — Light leak dinamico (::after) que simula refraccion en movimiento via JS.

Elementos Clave:
  1. PANEL BASE — border-radius MAXIMO 8px. NUNCA 24px (eso es app movil generica, inaceptable):
     background: rgba(255,255,255,0.06);
     backdrop-filter: blur(28px) saturate(160%);
     -webkit-backdrop-filter: blur(28px) saturate(160%);
     border: 1px solid rgba(255,255,255,0.12);
     box-shadow: inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.15), 0 24px 64px rgba(0,0,0,0.4);
     border-radius: 6px;

  2. PANEL SHAPE PREMIUM — USAR clip-path angular (cristal cortado de precision, NO burbuja):
     clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px));
     Reemplaza al border-radius. NO USAR AMBOS.

  3. MICRO-GRID OVERLAY — COPIAR ESTE CSS EXACTO (la IA lo omite si no es literal):
     #glass-panel { position: relative; overflow: hidden; }
     #glass-panel::before {
       content: ''; position: absolute; inset: 0; pointer-events: none;
       background:
         repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(255,255,255,0.025) 28px, rgba(255,255,255,0.025) 29px),
         repeating-linear-gradient(90deg, transparent, transparent 28px, rgba(255,255,255,0.025) 28px, rgba(255,255,255,0.025) 29px);
       mix-blend-mode: overlay; z-index: 0;
     }

  4. LIGHT LEAK DINAMICO — COPIAR ESTE PATRON JS+CSS EXACTO:
     CSS sobre el panel:
     #glass-panel::after {
       content: ''; position: absolute; inset: 0; pointer-events: none;
       background: radial-gradient(ellipse 60% 40% at var(--lx, 30%) var(--ly, 20%), rgba(255,255,255,0.09) 0%, transparent 70%);
       z-index: 1;
     }
     JS dentro de renderDVGE — PATRON CANONICO para movimiento ambient determinista:
     const lx = 30 + Math.sin(frame * 0.008) * 20;
     const ly = 20 + Math.cos(frame * 0.005) * 15;
     if (panel) { panel.style.setProperty('--lx', lx + '%'); panel.style.setProperty('--ly', ly + '%'); }

  5. TIPOGRAFIA — @import OBLIGATORIO al inicio del bloque CSS (NUNCA font-family: sans-serif):
     @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600&display=swap');
     Aplicar: font-family: 'Plus Jakarta Sans', sans-serif; en the panel.
     Labels: font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; opacity: 0.5;
     Valores KPI: font-size: 36px; font-weight: 600; font-variant-numeric: tabular-nums;

  6. METADATA CORNERS — COPIAR EN HTML (detalle que separa amateur de profesional):
     <span class="meta-corner meta-tl">SYS:PRISMATIC</span>
     <span class="meta-corner meta-br">DVGE v1.0</span>
     CSS: .meta-corner { position: absolute; font-family: 'Courier New', monospace;
       font-size: 8px; letter-spacing: 0.08em; opacity: 0.28; color: inherit; }
     .meta-tl { top: 12px; left: 14px; } .meta-br { bottom: 12px; right: 14px; }

  7. FONDO: wrapper siempre width: 100%; height: 100%; (NUNCA 1920px/1080px hardcodeado).
     Objetos de fondo con movimiento orbital: Math.sin/cos(frame * velocidad) * amplitud. Determinista.
     Opacidad de fondo: ease * (1 - outro) * opacityMult * 0.5-0.7 (siempre menos que el panel).

Logica de Animacion:
  - Entrada panel: scale(0.96) opacity(0) => scale(1) opacity(1).
    Curva: cubic-bezier(0.15, 1, 0.3, 1). Prop easing defaultValue: "[0.15, 1, 0.3, 1]".
  - Light leak: actualizar --lx y --ly con Math.sin/cos(frame) en renderDVGE. Es 100% determinista.
  - Outro panel: scale(1.05) + opacity(0) lineal. El cristal "evapora" hacia afuera levemente.
    exitScale = ctx.utils.lerp(1, 1.05, outro). NUNCA scale(0) en el outro de glassmorphism.
`,

  'kinetic-text': `
[VISUAL SKILL: KINETIC TYPOGRAPHY / BRUTALISMO SUIZO]

Concepto: La tipografia ES el diseno. No hay "tipografia + elementos graficos" — hay SOLO tipografia
en escalas extremas que ocupa y COLONIZA el espacio. Referencia directa: Wieden+Kennedy, Druk magazine,
Apple WWDC keynotes, deportes extremos (Red Bull Media, ESPN FC, Bundesliga broadcast).

Arquitectura de 4 Capas OBLIGATORIA (todas deben estar presentes):
  CAPA 1 — Texto fantasma de fondo: titulo gigante en opacity: 0.03-0.06, desplazandose lentamente.
  CAPA 2 — Marco tecnico (frame border): borde perimetral fino que se contrae al aterrizar.
  CAPA 3 — Titulo hero: el bloque tipografico principal, extremadamente grande.
  CAPA 4 — Footer de metadata: tag-box de color + subtitulo con tracking extremo.

Elementos Clave:
  1. TITULO HERO — TAMANOS EXTREMOS (copiar literalmente):
     font-size: 200px–280px; font-weight: 900; letter-spacing: -0.07em; line-height: 0.82;
     text-transform: uppercase; overflow: hidden; (el contenedor padre, no el h1)
     @import url('https://fonts.googleapis.com/css2?family=Anton&display=swap');
     font-family: 'Anton', sans-serif;
     NUNCA: font-family: sans-serif sin @import previo. La fuente no cargara.

  2. CAPA FANTASMA DE FONDO — SNIPPET OBLIGATORIO en HTML+CSS+JS:
     HTML: <div class="kinetic-bg"><h2 id="bg-text"></h2></div>
     CSS: .kinetic-bg { position: absolute; white-space: nowrap; opacity: 0.05; overflow: hidden; }
          #bg-text { font-size: 380px; font-weight: 900; letter-spacing: -0.05em; margin: 0; }
     JS (drift determinista SIN modulo — no usar % que crea jump artifact):
     if (bgText) {
       bgText.innerText = props.mainTitle;
       const xDrift = frame * props.driftSpeed;
       bgText.style.transform = 'translateX(' + (-xDrift) + 'px)';
     }
     ADVERTENCIA: NO usar (frame * speed) % N — el modulo crea un salto visual brusco al reset.
     Para looping suave, dejar crecer sin limite (JS no hace overflow en duraciones normales de video).

  3. WORD REVEAL — PATRON OBLIGATORIO con compresion percusiva (canonico desde Audit #003):
     HTML: <div class="line-mask"><h1 id="hero-title"></h1></div>
     CSS: .line-mask { overflow: hidden; display: block; }
     JS:
     const yIntro = ctx.utils.lerp(110, 0, ease);
     const yOutro = ctx.utils.lerp(0, -110, outro);
     const scaleYIn = ctx.utils.lerp(1.5, 1, ease);
     title.style.transform = 'translateY(' + (yIntro + yOutro) + '%) scaleY(' + scaleYIn + ')';
     title.style.opacity = ctx.utils.clamp(ease * 3, 0, 1) * (1 - outro) * opacityMult;
     scaleY(1.5 -> 1) es la firma del impacto percusivo suizo. OBLIGATORIO.

  4. TAG BOX DE ACENTO — SNIPPET OBLIGATORIO:
     HTML: <div id="tag-box"><span>2026 // MOTION</span></div>
     CSS: #tag-box { background: var(--secondaryColor); color: #000; padding: 5px 15px;
       font-size: 18px; font-weight: 900; display: inline-block; transform-origin: left center; }
     JS (wipe horizontal percusivo — USAR getElementById, nunca querySelector):
     const tagEl = ctx.root.getElementById('tag-box');
     const tagEase = ctx.utils.clamp(ctx.utils.mapRange(intro, 0.2, 0.8, 0, 1), 0, 1);
     const tagBez = ctx.utils.bezier(props.kineticCurve, tagEase);
     tagEl.style.transform = 'scaleX(' + tagBez + ') translateX(' + ctx.utils.lerp(-20, 0, tagBez) + 'px)';
     tagEl.style.opacity = tagEase * (1 - outro) * opacityMult;

  5. FRAME BORDER — TENSION TECNICA (detalle de agencia premium):
     HTML: <div id="frame-border"></div>
     CSS: #frame-border { position: absolute; border: 1px solid var(--accentColor);
       opacity: 0; width: 100%; height: 100%; pointer-events: none; }
     JS:
     border.style.opacity = ease * 0.2 * (1 - outro);
     border.style.transform = 'scale(' + ctx.utils.lerp(1.1, 1, ease) + ')';
     El frame se contrae al aterrizar, como si el espacio se comprimiera con la llegada del titulo.

  6. PALETA OBLIGATORIA DEL BRUTALISMO:
     --bgColor: #050505 (negro casi-puro, no #000000)
     --accentColor: #FFFFFF (texto principal)
     --secondaryColor: Un UNICO color calorico — #FF3E00 (rojo), #FFDD00 (amarillo), #00F5D4 (cian)
     NUNCA gradientes en texto. NUNCA mas de 2 colores de acento.

  7. STAGGER CANONICO SIN PROPS EXTRA (mapRange como delay implicito):
     Titulo: delay 0 (primer elemento, maximo impacto)
     Tag box: mapRange(intro, 0.2, 0.8, 0, 1) — entra cuando el titulo ya esta al 50%
     Subtitulo: mapRange(intro, 0.3, 0.9, 0, 1) — entra el ultimo con tracking extremo
     Subtitulo CSS: letter-spacing: 0.5em; font-size: 20px; text-transform: uppercase;

  8. FONDO DEL WRAPPER — REGLA GLOBAL (aplica a todos los skills):
     CORRECTO: width: 100%; height: 100%; (el motor provee el canvas)
     INCORRECTO: width: 1920px; height: 1080px; (hardcodeado, rompe resolucion dinamica)

Logica de Animacion:
  - Curva canonica: cubic-bezier(0.16, 1, 0.3, 1) (Expo Out). Produce el "golpe" brutalista.
    Prop easing defaultValue: "[0.16, 1, 0.3, 1]".
  - Titulo: translateY(110%) + scaleY(1.5) => translateY(0) + scaleY(1). Impacto percusivo.
  - Outro titulo: translateY(0) => translateY(-110%) — SIMETRICO. NUNCA la misma direccion del intro.
  - Drift de fondo: frame * velocidad (sin modulo). Constante, suave, infinito.
  - Todos los elementos de fondo y metadata: fade-out lineal con (1 - outro) * opacityMult.
`,

  'broadcast': `
[VISUAL SKILL: BROADCAST GRAPHICS / LOWER THIRD TV]

Concepto: Graficos de television profesional — informativos, deportes, noticias en vivo.
Credibilidad, legibilidad e institucionalidad ante todo. El espectador CONFIA en lo que ve.
Referencia: BBC News, CNN, ESPN, CNN en Español, Al Jazeera. NO hay decoracion gratuita.

Arquitectura OBLIGATORIA del Lower Third:
  ELEMENTO 1 — Banda opaca principal: el contenedor del texto. Entra con wipe desde la izquierda.
  ELEMENTO 2 — Linea de acento: regla de 4px-5px de color encima de la banda. ScaleX reveal.
  ELEMENTO 3 — Nombre principal: font-weight: 700, tamaño grande, mayusculas.
  ELEMENTO 4 — Cargo/subtitulo: font-weight: 400, tamaño menor, tracking leve.
  ELEMENTO 5 — Indicador EN VIVO (opcional, prop boolean): punto pulsante + label.

Elementos Clave:
  1. BANDA PRINCIPAL — SNIPPET OBLIGATORIO:
     CSS: #band {
       position: absolute; bottom: 80px; left: 0;
       background-color: var(--primaryColor);
       height: calc(var(--bandHeight) * 1px);
       min-width: 500px; width: auto;
       display: flex; align-items: center; padding: 0 28px 0 32px;
       border-radius: calc(var(--cornerRadius) * 1px);
       border: none; box-shadow: none;
       border-left: 8px solid white;
     }
     JS: band.style.transform = 'translateX(' + ctx.utils.lerp(-100, 0, bandEase) + '%)';
     La banda entra con wipe horizontal. NUNCA fade simple — el wipe comunica autoridad.

  2. TIPOGRAFIA INSTITUCIONAL — @import OBLIGATORIO al inicio del CSS:
     @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700&display=swap');
     Nombre: font-family: 'Barlow Condensed'; font-weight: 700; font-size: 42px-52px;
       text-transform: uppercase; letter-spacing: 0.02em; color: #FFFFFF;
     Cargo: font-weight: 400; font-size: 20px-26px; letter-spacing: 0.08em; opacity: 0.88;
     NUNCA fuentes decorativas o con serif. La institucionalidad requiere geometria limpia.

  3. PALETA CORPORATIVA PURA:
     Color primario: azul institucional #002366, #003087, #1B1464 — o rojo #CC0000, #BF0A30.
     Acento: dorado #FFD700, blanco puro #FFFFFF, o rojo si el primario es azul.
     Fondo del wrapper: transparent (el canvas provee el fondo de programa).
     NUNCA gradientes en la banda. NUNCA transparencias en la banda principal. Opacidad: 1.

  4. LINEA DE ACENTO — SNIPPET OBLIGATORIO:
     CSS: #accent-line {
       position: absolute; top: -5px; left: 0;
       height: 5px; width: calc(var(--accentWidth) * 1px);
       background-color: var(--accentColor);
       transform: scaleX(0); transform-origin: left center;
     }
     JS: accentLine.style.transform = 'scaleX(' + ctx.utils.lerp(0, 1, accentEase) + ')';

  5. INDICADOR EN VIVO — SNIPPET OBLIGATORIO (prop boolean showLiveBadge):
     HTML: <div id="live-badge"><div class="live-dot"></div><span class="live-text">EN VIVO</span></div>
     CSS: .live-dot { width: 14px; height: 14px; background: #E31C23; border-radius: 50%; }
     JS (pulsacion determinista con frame — SIN setInterval):
     const liveDot = ctx.root.querySelector('.live-dot');
     if (liveDot) liveDot.style.transform = 'scale(' + (0.8 + 0.2 * Math.sin(frame * 0.22)) + ')';
     ATENCION: El skill anterior usaba animation: pulse CSS — PROHIBIDO en DVGE. Usar Math.sin(frame).

  6. STAGGER CANONICO DE 3 CAPAS (Audits #008 y #009 validados):
     La normalizacion correcta para stagger con delay es: (intro - delay) / (1 - delay)
     CORRECTO:
     const textProgress = ctx.utils.clamp((intro - 0.2) / (1 - 0.2), 0, 1);
     const textEase = ctx.utils.bezier(props.mainCurve, textProgress);
     INCORRECTO: ctx.utils.clamp(intro - 0.2, 0, 1) — el rango nunca llega a 1.
     Capa 1 (banda): delay 0
     Capa 2 (texto): delay 0.2 (cuando la banda ya esta al 50%+)
     Capa 3 (acento): delay 0.35-0.4 (ultimo elemento en llegar)

  7. WRAPPER — REGLA GLOBAL:
     CORRECTO: width: 100%; height: 100%;
     INCORRECTO: width: 1920px; height: 1080px;
     POSICIONAMIENTO: La banda usa position: absolute; bottom: 80px; left: 60px; (no grid centrado).

  8. CORNER RADIUS: border-radius MAXIMO 2px en banda. El broadcast es anguloso e institucional.
     NO usar border-radius grandes — eso es UI de app, no broadcast television.

Logica de Animacion:
  - Curva canonica: cubic-bezier(0.2, 0, 0, 1) (ease-out institucional — severo, no elastico).
    Prop easing defaultValue: "[0.2, 0, 0, 1]".
  - Banda: translateX(-100%) => translateX(0) en 300ms-400ms. Primero, sin delay.
  - Texto (nombre): slide horizontal sutil -20px => 0 + fade. Delay 0.2.
  - Acento: scaleX(0 => 1) desde la izquierda. Delay 0.35.
  - Outro: todos los elementos regresan a -100% o hacen fade con (1 - outro) lineal.
    La banda sale hacia la izquierda (misma direccion de entrada — wipe institucional).
  - Live badge: aparece con textEase. Punto pulsa con Math.sin(frame * 0.22).
`,

  'cyberpunk-hud': `
[VISUAL SKILL: CYBERPUNK HUD / SCI-FI INTERFACE]

Concepto: Interfaz holografica de un sistema de armamento, nave espacial o ciudad distopica futura.
NO es "neones sobre negro". Es un SISTEMA DE INSTRUMENTACION con datos reales, logica de estado
y efectos de degradacion del hardware. Referencia: Blade Runner 2049, Cyberpunk 2077 UI,
Call of Duty Warzone HUD, interfaces de concept films de Apple Vision Pro.

Arquitectura OBLIGATORIA (todas las capas deben existir):
  CAPA 1 — Ruido de fondo: base oscura con SVG de film grain o gradiente radial.
  CAPA 2 — Scanline global: rejilla horizontal de 2px sobre toda la pantalla.
  CAPA 3 — Panel HUD con bordes fragmentados (clip-path con cortes en esquinas).
  CAPA 4 — Contenido de datos: specs, barras, metricas, features con tipografia mono.
  CAPA 5 — Efectos activos: scanning line horizontal, anillo rotatorio, glitch de titulo.
  CAPA 6 — Corner brackets: 4 esquinas externas decorativas del HUD.

Elementos Clave:
  1. PANEL CON BORDES FRAGMENTADOS — SNIPPET OBLIGATORIO EN CSS:
     .cyber-panel {
       background: rgba(5, 5, 10, 0.75);
       border: 1px solid var(--accent);
       clip-path: polygon(12px 0%, 100% 0%, 100% calc(100% - 12px), calc(100% - 12px) 100%, 0% 100%, 0% 12px);
       box-shadow: 0 0 25px rgba(0, 245, 255, 0.2), inset 0 0 20px rgba(0, 245, 255, 0.05);
     }
     NUNCA border-radius convencional en un HUD. SIEMPRE clip-path con cortes angulares.

  2. SCANLINE GLOBAL — SNIPPET CSS (aplica al contenedor raiz, no al panel):
     .global-scanline {
       position: absolute; inset: 0; pointer-events: none; z-index: 10;
       background: repeating-linear-gradient(0deg,
         transparent, transparent 2px,
         rgba(0, 245, 255, 0.03) 2px, rgba(0, 245, 255, 0.03) 4px);
     }
     PROHIBIDO usar animation: CSS para el scanline. Es estatico — el efecto lo da el patron repetido.

  3. TIPOGRAFIA HUD — OBLIGATORIA:
     font-family: 'Share Tech Mono', 'Courier New', monospace;
     Labels: font-size: 10px-12px; letter-spacing: 0.15em; opacity: 0.6; text-transform: uppercase;
     Valores: font-size: 18px-32px; font-weight: bold; font-variant-numeric: tabular-nums;
     Titulos: text-shadow: 0 0 8px var(--accent); (glow obligatorio en el titulo principal)
     NO SE NECESITA @import para Courier New — es fuente del sistema. Si se usa Share Tech Mono:
     @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');

  4. GLITCH DETERMINISTA — PATRON CANONICO JS (NO usar Math.random()):
     /* Trigger via Math.sin — determinista y reproducible */
     const glitchTrigger = Math.sin(frame * 0.25) > 0.85 || Math.sin(frame * 0.17) < -0.8;
     if (glitchTrigger && intro > 0.2 && outro < 0.9) {
       const shiftX = (Math.sin(frame * 3.7) * props.glitchIntensity * 2).toFixed(1);
       const shiftY = (Math.cos(frame * 4.3) * props.glitchIntensity).toFixed(1);
       titleEl.style.transform = 'translate(' + shiftX + 'px, ' + shiftY + 'px)';
       titleEl.style.textShadow = '-2px 0 #ff0000, 2px 0 ' + accent; // split rojo/cian
     } else {
       titleEl.style.transform = 'translate(0px, 0px)';
       titleEl.style.textShadow = '0 0 8px ' + accent;
     }
     PROHIBIDO: Math.random() (no deterministico) and @keyframes glitchAnim (CSS animation prohibida).

  5. SCANNING LINE HORIZONTAL — PATRON CANONICO JS:
     /* El modulo SI es correcto aqui porque la linea DEBE loopear visualmente */
     const scanPos = (frame * (props.scanSpeed || 1.2)) % (containerWidth + 400);
     scanLine.style.left = (-200 + scanPos * 1.2) + 'px';
     CSS: .scanning-line {
       position: absolute; width: 50px; height: 100%;
       background: linear-gradient(90deg, transparent, rgba(0,245,255,0.3), transparent);
       filter: blur(3px); pointer-events: none;
     }
     NOTA: El modulo es aceptable en looping visual (linea de scan) pero NO en textos de fondo.

  6. ANILLO ROTATORIO DETERMINISTA:
     const ring = ctx.root.getElementById('rotating-ring');
     if (ring) ring.style.transform = 'rotate(' + (frame * 1.8) + 'deg)';
     CSS: .rotating-ring {
       border-radius: 50%; border: 1px solid var(--accent);
       border-top: 2px solid rgba(0,245,255,0.9);
       box-shadow: 0 0 12px rgba(0,245,255,0.3);
     }
     PROHIBIDO: animation: spin CSS. Usar frame * velocidad para rotacion determinista.

  7. BARRA DE PROGRESO SEGMENTADA (10 segmentos, estilo cyberpunk):
     HTML: <div id="seg-bar">
       <!-- 10 divs seg-empty -->
     </div>
     CSS: #seg-bar { display: flex; gap: 6px; height: 14px; }
          #seg-bar div { flex: 1; background: #11171f; }
          #seg-bar .seg-active { background: var(--accent); box-shadow: 0 0 6px currentColor; }
     JS:
     const segs = segContainer.children;
     const filledCount = Math.floor((easedProgress / 100) * segs.length);
     for (let i = 0; i < segs.length; i++) {
       segs[i].classList[i < filledCount ? 'add' : 'remove']('seg-active');
     }
     /* easedProgress = targetProgress * ease — el llenado animado refleja el intro */

  8. CORNER BRACKETS DEL HUD — SNIPPET HTML+CSS:
     HTML: <div class="hud-corner tl"></div><div class="hud-corner tr"></div>
           <div class="hud-corner bl"></div><div class="hud-corner br"></div>
     CSS: .hud-corner { position: absolute; width: 50px; height: 50px;
       border: 2px solid var(--accent); filter: drop-shadow(0 0 4px var(--accent)); }
     .tl { top: 20px; left: 20px; border-right: none; border-bottom: none; }
     .tr { top: 20px; right: 20px; border-left: none; border-bottom: none; }
     .bl { bottom: 20px; left: 20px; border-right: none; border-top: none; }
     .br { bottom: 20px; right: 20px; border-left: none; border-top: none; }

  9. CSS VARIABLE DE ACENTO — INYECTAR EN JS (no hardcodear en CSS):
     const rootEl = ctx.root.getElementById('cyber-root');
     if (rootEl) rootEl.style.setProperty('--accent', props.accentColor || '#00F5FF');
     Esto permite que todo el CSS con var(--accent) sea reactivo al Inspector.

  10. PALETA CANONICA (elegir UNO de los acentos):
      Fondo: radial-gradient(circle, #0a0a14, #020205) — nunca negro puro #000000.
      Acento cyan: #00F5FF (hacking/tecnologia). Acento magenta: #FF00FF (neon distopia).
      Acento verde: #39FF14 (biohacking). Nunca mas de 1 acento.
      PROHIBIDO: gradientes en texto (background-clip: text) — es inconsistente con el motor.
      PROHIBIDO: @keyframes en CSS. TODO el movimiento es frame-based en JS.

  11. STAGGER INTERNO CANONICO (mismo motor que broadcast):
      const header = ctx.root.querySelector('.product-header');
      const headerDelay = ctx.utils.clamp((ease - 0.1) / 0.9, 0, 1); // normalizado
      header.style.opacity = headerDelay * (1 - outro) * opacityMult;
      header.style.transform = 'translateY(' + ctx.utils.lerp(20, 0, headerDelay) + 'px)';
      Cada grupo (header, specs, features, progress) tiene un offset de 0.1-0.15 sobre el anterior.

  12. FONDO DEL WRAPPER — REGLA GLOBAL:
      CORRECTO: #cyber-root { position: absolute; width: 100%; height: 100%; }
      INCORRECTO: width: 1920px; height: 1080px;

Logica de Animacion:
  - Panel: scale(0.96) opacity(0) => scale(1) opacity(1). Curva: [0.25, 0.46, 0.45, 0.94].
  - Glitch en entrada (frames 1-10 aprox): frame % 2 === 0 ? opacity 0 : 1 (boot flicker).
  - Stagger de secciones internas: cada grupo tarda 0.1-0.15 extra para aparecer.
  - Scanning line: loop continuo con (frame * speed) % width. Loop visual es correcto con modulo.
  - Outro: scale(1) scale(0.96) + fade lineal. El HUD se "apaga" como un monitor.
`,

  'studio-showcase': `
[VISUAL SKILL: STUDIO SHOWCASE / PRODUCT REVEAL]

Concepto: Un solo objeto en el centro del universo. Oscuridad total alrededor.
El silencio visual es intencional. Referencia: keynotes de Apple (iPhone reveal), Dyson,
Teenage Engineering, Leica. El producto habla. La tipografia susurra.

Arquitectura OBLIGATORIA:
  ELEMENTO 1 — Objeto protagonista: cubo/esfera/rectangulo que simula el producto. Centrado.
  ELEMENTO 2 — Surface glint: gradiente diagonal que simula el material del objeto.
  ELEMENTO 3 — Sombra esculpida: box-shadow profundo que ancla el objeto en el espacio.
  ELEMENTO 4 — Texto delgado: nombre del estudio/producto en font-weight: 200, tracking extremo.
  ELEMENTO 5 — Flotacion continua: el objeto respira con Math.sin(frame * velocidad).

Elementos Clave:
  1. OBJETO PROTAGONISTA — SNIPPET OBLIGATORIO:
     CSS: #product-core {
       width: calc(var(--coreSize) * 1px); height: calc(var(--coreSize) * 1px);
       background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%);
       border: 1px solid rgba(255,255,255,0.08);
       border-radius: 16px;
       box-shadow: 0 40px 120px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04);
       position: relative; overflow: hidden;
     }
     El border-radius de 16px-24px es ACEPTABLE en studio showcase (producto organico).
     NO es aceptable en broadcast, glassmorphism tecnico o cyberpunk.

  2. SURFACE GLINT — SIMULACION DE MATERIAL (copiar literal):
     CSS: .surface-glint {
       position: absolute; inset: 0; pointer-events: none;
       background: linear-gradient(45deg,
         transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%);
     }
     Esta linea diagonal de luz simula el reflejo de una fuente de luz superior-izquierda.
     Es el detalle que distingue un producto renderizado de una caja de color.

  3. FLOTACION + ROTACION 3D — SNIPPET CANONICO JS (determinista):
     const floatY = Math.sin(frame * 0.05) * (props.floatIntensity || 15);
     const rotateY = Math.sin(frame * 0.02) * 5;
     const entryScale = ctx.utils.lerp(0.95, 1, ease);
     const exitScale = ctx.utils.lerp(1, 1.1, outro);
     core.style.transform =
       'translateY(' + ctx.utils.lerp(20, floatY, ease) + 'px) ' +
       'scale(' + entryScale * exitScale + ') ' +
       'rotateY(' + rotateY + 'deg)';
     NOTA: perspective: 1000px OBLIGATORIO en el contenedor padre para que rotateY sea visible.
     EXIT: scale(1.1) en outro — el producto "flota y desaparece". NUNCA scale(0).

  4. TIPOGRAFIA DE LUJO — REGLAS ESTRICTAS:
     @import url('https://fonts.googleapis.com/css2?family=Inter:wght@200;300;600&display=swap');
     Nombre: font-weight: 200; font-size: 40px-52px; letter-spacing: 0.15em; text-transform: uppercase;
     Badge: font-weight: 600; font-size: 11px; letter-spacing: 0.3em; color: var(--accentColor);
     Specs: font-weight: 300; font-size: 11px; letter-spacing: 0.25em; opacity: 0.5;
     NUNCA font-weight: 900 en studio-showcase. El peso maximo es 400. La delgadez ES el lujo.
     NO usar Helvetica Neue — no disponible en Windows. Usar Inter: 200 como equivalente.

  5. STAGGER DE TEXTOS CON mapRange CORRECTO:
     /* CORRECTO: mapRange toma intro (raw timeline), no ease (ya curvado) */
     title.style.opacity = ctx.utils.clamp(ctx.utils.mapRange(intro, 0.2, 1, 0, 1), 0, 1) * (1 - outro) * opacityMult;
     badge.style.opacity = ctx.utils.clamp(ctx.utils.mapRange(intro, 0.4, 1, 0, 1), 0, 1) * (1 - outro) * opacityMult;
     specs.style.opacity  = ctx.utils.clamp(ctx.utils.mapRange(intro, 0.6, 1, 0, 0.5), 0, 0.5) * (1 - outro) * opacityMult;
     /* INCORRECTO: mapRange(ease, ...) -- doble-curvado, stagger incorrecto */

  6. LETTER-SPACING ANIMADO EN SPECS (patron canonico de Audit #012):
     specs.style.letterSpacing = ctx.utils.lerp(0.5, 0.25, ease) + 'em';
     El tracking se contrae al aterrizar. Comunica que el texto "aterriza con precision".

  7. PALETA MONOCROMATICA OBLIGATORIA:
     Modo oscuro: background: #000000; color: #FFFFFF; (negro puro — el vacio es intencional)
     Modo claro: background: #F8F8F5; color: #1A1A1A;
     Acento: 1 solo color via @dv-prop. Aparece SOLO en el badge and the branding of the object.
     PROHIBIDO: mas de 1 acento. PROHIBIDO: gradientes decorativos en el fondo.

  8. TEMA DINAMICO (select prop):
     const isDark = props.theme !== 'light';
     wrapper.style.background = isDark ? '#000000' : '#F8F8F5';
     wrapper.style.color = isDark ? '#FFFFFF' : '#1A1A1A';
     PROHIBIDO: transition en CSS para el cambio de tema. Cambio debe ser instantaneo via JS.

  9. FONDO DEL WRAPPER — REGLA GLOBAL:
     CORRECTO: width: 100%; height: 100%;
     INCORRECTO: width: 1920px; height: 1080px;

Logica de Animacion:
  - Curva canonica: cubic-bezier(0.22, 1, 0.36, 1) (suave y lenta — es un revelar, no un impacto).
    Prop easing defaultValue: "[0.22, 1, 0.36, 1]".
  - Objeto: scale(0.95) opacity(0) => scale(1) opacity(1) en aprox 800ms-1200ms perceptuales.
  - Flotacion: empieza inmediatamente, Math.sin(frame * 0.05) * intensidad. Loop eterno.
  - Rotacion 3D: Math.sin(frame * 0.02) * 5 grados. Respiracion suave.
  - Textos: aparecen escalonados con mapRange(intro, 0.2/0.4/0.6, 1, 0, 1).
  - Outro: core va a scale(1.1) + opacity(0). Textos a opacity(0). El producto se eleva.
`,

  'data-viz-analytic': `
[VISUAL SKILL: DATA VIZ ANALYTIC / DASHBOARD & BAR CHART]

Concepto: Panel de datos animado de produccion. Graficos de barras, donuts y KPIs que
"se cargan" en camara. Referencia: Bloomberg Terminal, ESPN live stats, F1 telemetry,
presentaciones financieras de Apple. Los datos llegan con drama — no aparecen, se construyen.

NOTA CRITICA DE MEJORA (Audit #016 — Template del Usuario):
El usuario tiene un template de calidad muy superior al que genera la IA de base.
La IA falla en: y-axis, grid lines, idle animation, tipo de prop incorrecto para datos.
LEER ESTA SECCION COMPLETA antes de generar cualquier grafico de barras.

DIFERENCIA CLAVE — TIPO DE PROP PARA DATOS:
  CORRECTO:   @dv-prop { "id": "dataCSV", "type": "string", "label": "Valores (%)", "defaultValue": "75,90,55,85,40" }
              @dv-prop { "id": "namesCSV", "type": "string", "label": "Nombres", "defaultValue": "A,B,C,D,E" }
  INCORRECTO: @dv-prop { "id": "data", "type": "dataset", ... }  ← tipo "dataset" NO existe en DVGE
  La IA tiende a inventar tipos. El unico tipo correcto para datos es "string" (CSV).

ARQUITECTURA OBLIGATORIA DEL BAR CHART (del template canonico):
  COMPONENTE 1 — Contenedor principal con fondo oscuro, padding generoso (60px).
  COMPONENTE 2 — Y-AXIS: columna izquierda con labels 100%, 75%, 50%, 25%, 0%.
  COMPONENTE 3 — CHART GRID: area con border-left + border-bottom, grid-lines horizontales.
  COMPONENTE 4 — BARS CONTAINER: flex align-items flex-end (barras desde abajo).
  COMPONENTE 5 — X-AXIS: labels de categorias debajo del chart.
  COMPONENTE 6 — Valor numerico encima de cada barra (bar-val span).

Elementos Clave:
  1. ESTRUCTURA HTML OBLIGATORIA (copiar literal):
     <div id="chart-area">
       <h1 id="title"></h1>
       <div id="main-layout">
         <div id="y-axis">
           <span class="y-label">100%</span><span class="y-label">75%</span>
           <span class="y-label">50%</span><span class="y-label">25%</span>
           <span class="y-label">0%</span>
         </div>
         <div id="chart-grid">
           <div class="grid-line" style="top: 0%"></div>
           <div class="grid-line" style="top: 25%"></div>
           <div class="grid-line" style="top: 50%"></div>
           <div class="grid-line" style="top: 75%"></div>
           <div class="grid-line" style="top: 100%"></div>
           <div id="bars-container"></div>
         </div>
       </div>
       <div id="x-axis"></div>
     </div>
     El y-axis y las grid-lines NO son decoracion — son la referencia visual que hace
     legible el dato al espectador. Sin ellas, el grafico parece una landing page.

  2. CSS DEL CHART (base obligatoria):
     @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500&display=swap');
     #wrapper { position: absolute; width: 100%; height: 100%;
       display: grid; place-items: var(--posicion); }
     #chart-area { width: calc(var(--chartWidth) * 1px); background: rgba(10,10,10,0.95);
       padding: 60px; border-radius: 10px; font-family: 'Inter', sans-serif; color: white; }
     #main-layout { display: flex; height: calc(var(--chartHeight) * 1px); gap: 25px; }
     #y-axis { display: flex; flex-direction: column; justify-content: space-between;
       width: 45px; font-size: 12px; opacity: 0.5; text-align: right; }
     #chart-grid { flex: 1; position: relative;
       border-left: 1px solid rgba(255,255,255,0.2);
       border-bottom: 1px solid rgba(255,255,255,0.2); }
     .grid-line { position: absolute; width: 100%; height: 1px;
       background: rgba(255,255,255,0.05); }
     #bars-container { display: flex; align-items: flex-end; justify-content: space-around;
       width: 100%; height: 100%; padding: 0 20px; }
     .bar-wrapper { display: flex; flex-direction: column; align-items: center;
       flex: 1; height: 100%; justify-content: flex-end; }
     .bar-val { font-size: 14px; margin-bottom: 10px; font-weight: 500; }
     .bar-fill { width: 55%; background: var(--barColor); transform-origin: bottom; }
     #x-axis { margin-left: 70px; display: flex; justify-content: space-around;
       margin-top: 25px; }
     .x-label { font-size: 12px; opacity: 0.7; width: 0; display: flex;
       justify-content: center; white-space: nowrap; }

  3. PROPS OBLIGATORIAS (del template canonico):
     @dv-prop numBars: number, default 5 (cantidad de barras a renderizar)
     @dv-prop dataCSV: string, default "75,90,55,85,40" (valores en %, separados por coma)
     @dv-prop namesCSV: string, default "A,B,C,D,E" (nombres de categorias)
     @dv-prop enableIdle: boolean, default true (movimiento breathing cuando está estatico)
     @dv-prop barColor: color, default #E44C30
     @dv-prop chartWidth: number, default 1300
     @dv-prop chartHeight: number, default 450
     @dv-prop curva: easing, default "[0.2, 0, 0.1, 1]"
     IMPORTANTE: El CSV se parsea en JS: props.dataCSV.split(',').map(v => parseFloat(v.trim()) || 0)

  4. DOM REBUILD — PATRON CANONICO (del template, con innerHTML, NO document.createElement):
     /* La condicion de rebuild usa children.length, no un flag */
     if (bContainer && bContainer.children.length !== parseInt(props.numBars)) {
       bContainer.innerHTML = ''; xContainer.innerHTML = '';
       for (let i = 0; i < props.numBars; i++) {
         bContainer.innerHTML += '<div class="bar-wrapper"><span id="v-txt-' + i + '" class="bar-val"></span><div id="v-bar-' + i + '" class="bar-fill"></div></div>';
         xContainer.innerHTML += '<div class="x-label"><span>' + (names[i] || '') + '</span></div>';
       }
     }
     PROHIBIDO: document.createElement(). Usar innerHTML para crear elementos dinamicos.
     La condicion children.length !== numBars garantiza el rebuild SOLO cuando cambia la cantidad.

  5. ANIMACION DE BARRAS CON STAGGER (del template canonico):
     for (let i = 0; i < props.numBars; i++) {
       const delay = i * 0.05;
       /* normalizacion del stagger: la ventana de animacion es 0.7 del total */
       const bEase = ctx.utils.bezier(props.curva, ctx.utils.clamp((intro - delay) / 0.7, 0, 1));
       /* idle breathing: Math.sin por cada barra, frecuencia baja */
       const idle = props.enableIdle ? (Math.sin((frame * 0.05) + i) * 1.5) : 0;
       const currentVal = (ctx.utils.lerp(0, values[i] || 0, bEase) + (idle * bEase)) * (1 - outro);
       if (bar) bar.style.height = currentVal + '%';
       if (txt) txt.innerText = Math.round(currentVal) + '%';
     }
     DETALLE: el idle (Math.sin) se MULTIPLICA por bEase — solo respira cuando la barra
     ya entro. No respira mientras esta entrando. Ese multiplicador es crucial para calidad.

  6. IDLE ANIMATION (el detalle que eleva el nivel):
     const idle = props.enableIdle ? (Math.sin((frame * 0.05) + i) * 1.5) : 0;
     Cada barra tiene su propio offset de fase (+ i). La frecuencia 0.05 es lenta y organica.
     La amplitud 1.5 es 1.5% — apenas perceptible pero vivo. Mas es caricaturesco.
     Esto convierte el grafico estatico en algo que "respira" — fundamental para broadcast.

  7. DONUT CHART (si se incluye — SVG obligatorio):
     Circunferencia r=40: 2 * PI * 40 = 251.2
     JS: ring.style.strokeDashoffset = 251.2 - (251.2 * percent / 100);
     CSS: stroke-dasharray: 251.2; stroke-dashoffset: 251.2; stroke-linecap: round;
     SVG: transform="rotate(-90deg)" para que empiece en las 12 en punto.

  8. LIVE BADGE (obligatorio si el panel simula datos en vivo):
     CSS: .live-badge { background: var(--accentColor); color: #000; font-weight: 900;
       font-size: 10px; padding: 4px 8px; letter-spacing: 1px; }
     Puede pulsear con: badge.style.opacity = 0.6 + Math.sin(frame * 0.1) * 0.4;

  9. ANIMATED COUNTER (para KPI cards):
     const count = Math.floor(ctx.utils.lerp(0, props.targetValue, ease));
     kpiEl.innerText = count;
     CSS: font-variant-numeric: tabular-nums; (evita saltos de layout al cambiar digitos)

  10. PALETA:
      Fondo panel: rgba(10, 10, 10, 0.95). Opaco para legibilidad.
      Border: border-left + border-bottom en rgba(255,255,255,0.2).
      Grid lines: rgba(255,255,255,0.05) — casi invisibles, solo para guia.
      Acento: 1 color via prop. Default: #E44C30 o #22C55E (verde datos positivos).
`,

  'publicidad-motion': `
[VISUAL SKILL: PUBLICIDAD MOTION / BRAND ADVERTISING]

Concepto: Spot publicitario de 15-30 segundos para una marca. El producto o marca DEBE
sentirse aspiracional, premium y cinematografico. NO es una landing page — es un frame
de video con duracion acotada, entrada, sostenido y salida. Referencia: Nike x Jordan
brand spots, Apple Shot on iPhone, Porsche Design, Riot Games cinematic trailers.

DIFERENCIA CRITICA vs otros skills:
  - kinetic-text: tipografia como protagonista, fondo oscuro, brutalismo.
  - publicidad-motion: MARCA como protagonista, elementos visuales ricos, gradientes calibrados.
  - studio-showcase: producto sin contexto. publicidad-motion: producto EN contexto narrativo.

Arquitectura OBLIGATORIA (todas las capas presentes):
  CAPA 1 — Fondo de gradiente o textura de marca (no negro solido).
  CAPA 2 — Formas geometricas decorativas (blur, clip-path) como contexto de marca.
  CAPA 3 — Cinema bars (lineas horizontales superior e inferior): enmarcan el spot.
  CAPA 4 — Logo o simbolo de marca con animacion propia.
  CAPA 5 — Jerarquia tipografica completa: eyebrow + headline + tagline + CTA.
  CAPA 6 — Film grain overlay (opcional via prop boolean, mix-blend-mode: overlay).

Elementos Clave:
  1. CLIP-PATH WIPE DE ENTRADA — PATRON NUEVO CANONIZADO (Audit #publicidad):
     HTML: <div id="wipe-mask"></div>
     CSS: #wipe-mask { position: absolute; inset: 0; background: var(--primaryColor);
       z-index: 20; pointer-events: none; }
     JS:
     const wipeProgress = ctx.utils.clamp(intro * 1.8, 0, 1);
     const wipeX = ctx.utils.lerp(0, 100, wipeProgress);
     wipeEl.style.clipPath = 'inset(0 ' + (100 - wipeX) + '% 0 0)';
     if (wipeProgress >= 0.99) wipeEl.style.display = 'none';
     Efecto: el color de la marca "barre" el frame de izquierda a derecha, revelando el contenido.
     ALTERNATIVA scaleX: transformOrigin left, scaleX(0->1). clip-path es mas limpio en bordes.

  2. STAGGER HELPER CANONICO (Audit #publicidad — MEJOR PATRON REGISTRADO):
     const getStaggerProgress = (delay) => {
       if (delay >= 1) return 0;
       return ctx.utils.clamp((intro - delay) / (1 - delay), 0, 1);
     };
     Uso: const titleEase = ctx.utils.bezier(props.entranceCurve, getStaggerProgress(props.titleDelay));
     Este patron normaliza correctamente a [0,1] para cualquier delay. USAR EN TODOS LOS SKILLS.

  3. BLUR DISSOLVE EN TAGLINE (nuevo patron canonico):
     tagline.style.filter = 'blur(' + ctx.utils.lerp(6, 0, easeTag) + 'px)';
     El texto aparece desde un blur de 6px hacia 0. Communica "materialization" premium.
     Usar en taglines y CTA. NUNCA en el headline principal (debe ser siempre percusivo y neto).

  4. CINEMA BARS DE ENCUADRE (obligatorio en publicidad-motion):
     HTML: <div class="cinema-bar top-bar"></div>
           <div class="cinema-bar bottom-bar"></div>
     CSS: .cinema-bar { position: absolute; left: 0; width: 100%; height: 3px; z-index: 15;
       background: linear-gradient(90deg, var(--primaryColor), var(--accentColor), transparent); opacity: 0.6; }
     .top-bar { top: 32px; } .bottom-bar { bottom: 32px; transform: scaleX(-1); }
     JS: topBar.style.opacity = ctx.utils.lerp(0, 0.6, intro) * (1 - outro) * opacityMult;
     Las barras de cine enmarcan el spot como si fuera una pelicula. Detalle premium obligatorio.

  5. FILM GRAIN (opcional via prop boolean):
     HTML: <div id="grain-overlay" class="grain"></div>
     CSS: .grain { position: absolute; inset: 0; pointer-events: none; z-index: 10;
       mix-blend-mode: overlay; opacity: 0.35;
       background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
       background-size: 180px; }
     JS: grainEl.style.opacity = props.enableGrain ? (0.35 * opacityMult) : 0;
     El grain solo funciona con mix-blend-mode: overlay sobre un fondo no-transparente.

  6. JERARQUIA TIPOGRAFICA OBLIGATORIA (4 niveles):
     EYEBROW: font-size: 13px; letter-spacing: 0.3em; color: var(--accentColor); text-transform: uppercase; opacity: 0.8;
     HEADLINE: font-size: 72px-96px; font-weight: 800; color: white. SIN background-clip: text.
       PROHIBIDO: gradient text en headline (background-clip: text) — no es broadcast, es CSS decorativo.
     TAGLINE: font-size: 22px-28px; font-weight: 300; opacity: 0.9;
     CTA (Call to action): font-size: 14px; font-weight: 600; letter-spacing: 0.1em;
       border: 1px solid rgba(255,255,255,0.3); padding: 12px 32px; border-radius: 30px;

  7. LOGO / BRAND MARK ANIMADO:
     Si hay un logo o texto que actua como logo, entra con scale(1.2 -> 1) y un ease muy diferente
     (ej: elastic o bounce suave) para destacarse de la tipografia comercial.
`,

  'live-production': `
[VISUAL SKILL: LIVE PRODUCTION / SPORTS & ESPORTS OVERLAY]

Concepto: Panel de estadisticas o informacion en directo para transmisiones deportivas, esports
y eventos en vivo. La estetica es funcional, reactiva, y comunica URGENCIA. El espectador debe
leer los datos en menos de 2 segundos. Referencia: ESPN SportsCenter overlays, Riot Games
esports broadcast, F1 telemetry HUD, CBS Sports live stats.

DIFERENCIA CRITICA vs otros skills:
  - broadcast: institucional, lento, para personajes/noticias. Panel unico, sin datos.
  - live-production: rapido, datos en tiempo real, estadisticas, puntuaciones. Overlay de datos.
  - data-viz: dashboard fijo con graficos. live-production: panel pequeno, posicionable, dinamico.
  
ADVERTENCIA ESTRUCTURAL (Audit #015 DeepSeek): DVGE produce overlays, NO landing pages.
El panel de live-production ocupa maximo 30-40% del frame. NO es un dashboard a pantalla completa.
Un panel de 1400px sobre un canvas de 1920px = landing page, no overlay de broadcast.

Arquitectura OBLIGATORIA:
  ELEMENTO 1 — Panel principal con stripe vertical de acento (border-left: 4px solid accentColor).
  ELEMENTO 2 — HUD header: status dot pulsante + label + energy line horizontal.
  ELEMENTO 3 — Titulo principal del panel.
  ELEMENTO 4 — Stats grid: 2-4 valores con label y numero. TODOS props.
  ELEMENTO 5 — Corner accent (L-bracket esquina inferior derecha).
  OPCIONAL — Ticker scroll, activity bars, countdown (para esports/sports).

Elementos Clave:
  1. STRIPE VERTICAL DE ACENTO — FIRMA DEL LIVE PRODUCTION (de Audit #014 Gemini):
     CSS: #panel { border-left: 4px solid var(--accentColor); background: rgba(10,10,10,0.9); }
     El stripe izquierdo es LA firma visual del panel de datos en vivo. OBLIGATORIO.

  2. STATUS DOT CON PULSO DETERMINISTA:
     JS: const pulse = Math.sin(frame * 0.1) * 0.5 + 0.5;
     dot.style.opacity = ctx.utils.lerp(0.4, 1, pulse); // oscila entre 0.4 y 1.0
     NO usar CSS animation. Solo Math.sin(frame).

  3. STATS GRID — PARAMETRIZADO OBLIGATORIAMENTE:
     NUNCA hardcodear los valores de estadisticas en HTML.
     Cada stat es: un prop de label (string) + un prop de valor (string o number).
     JS:
     ctx.root.getElementById('label1').innerText = props.stat1Label;
     ctx.root.getElementById('val1').innerText = props.stat1Value;

  4. TICKER SCROLL DETERMINISTA (nuevo patron de Audit #015 DeepSeek):
     /* El modulo ES correcto aqui — la linea de texto DEBE loopear infinitamente */
     CSS: .ticker-wrapper { overflow: hidden; }
          .ticker-track { display: inline-flex; }
     HTML: <div id="ticker-track"><span id="ticker-a"></span><span id="ticker-b"></span></div>
     JS:
     const tickerA = ctx.root.getElementById('ticker-a');
     const tickerB = ctx.root.getElementById('ticker-b');
     const fullText = props.tickerText + ' • ';
     if (tickerA) tickerA.innerText = fullText;
     if (tickerB) tickerB.innerText = fullText;
     const track = ctx.root.getElementById('ticker-track');
     if (track) {
       const trackW = track.scrollWidth / 2;
       if (trackW > 0) track.style.transform = 'translateX(-' + ((frame * props.tickerSpeed) % trackW) + 'px)';
     }
     ADVERTENCIA: modulo en ticker es correcto (loop visual). Modulo en texto de fondo NO es correcto.

  5. ACTIVITY BARS FLUCTUANTES (nuevo patron de Audit #015 DeepSeek):
     /* Barras que varían en tiempo real con Math.sin — para "team momentum" o "live metrics" */
     const timeFactor = frame * 0.025;
     ['bar1','bar2','bar3','bar4'].forEach((id, idx) => {
       const bar = ctx.root.getElementById(id);
       if (!bar) return;
       const h = 25 + Math.sin(timeFactor + idx * 1.7) * 24 + Math.cos(frame * 0.04 + idx) * 12;
       bar.style.height = ctx.utils.clamp(h, 15, 85) + 'px';
       bar.style.background = 'linear-gradient(0deg, ' + props.accentColor + ', ' + props.accentColor + 'dd)';
     });
     DIFERENCIA vs data-viz bars: esas son estaticas con reveal. Estas son "vivas" y fluctuan siempre.

  6. COUNTDOWN DESDE FRAMES (nuevo patron de Audit #015 DeepSeek):
     /* Cuenta regresiva basada en frames — 100% determinista */
     const totalSecs = props.countdownInitial;
     const elapsed = Math.floor(frame / 60);
     const remaining = Math.max(0, totalSecs - elapsed);
     const mins = Math.floor(remaining / 60);
     const secs = remaining % 60;
     countdownEl.innerText = mins.toString().padStart(2,'0') + ':' + secs.toString().padStart(2,'0');
     CRITICO: NO usar setTimeout para el flash del countdown. Es PROHIBIDO.
     Para el flash de segundo, usar: la diferencia entre secs actuales y el valor guardado en dataset.
     El flash debe ser de 1 frame de opacidad reducida (frame-based, no timeout):
     const secondTick = (frame % 60 < 5);
     if (secondTick && remaining < totalSecs) countdownEl.style.opacity = '0.5';
     else countdownEl.style.opacity = '1';

  7. ANIMACION DE ENTRADA:
     Curva: [0.2, 1, 0.3, 1] — rapida y decisiva.
     Panel: translateX(entryOffset -> 0) desde derecha. Entry offset prop recomendado: 40px.
     Salida: translateX(0 -> -20px) + fade. Asimetrico y correcto para overlays de sports.
     Punch de titulo: scale(0.9 -> 1) al aterrizar.

  8. CORNER ACCENT:
     CSS: #corner-accent { position: absolute; bottom: 0; right: 0; width: 20px; height: 20px;
       border-right: 2px solid var(--accentColor); border-bottom: 2px solid var(--accentColor); }

  9. ENERGY LINE EN HEADER:
     CSS: #energy-line { flex-grow: 1; height: 1px;
       background: linear-gradient(90deg, var(--accentColor), transparent); }
     JS (entrada): energyLine.style.transform = 'scaleX(' + ease + ')';
                   energyLine.style.transformOrigin = 'left center';

  10. PALETA LIVE PRODUCTION:
      Fondo panel: rgba(10,10,10,0.9) — casi opaco. Legibilidad sobre video.
      Acento: color del equipo/liga via prop. Default esports: #FF6B00.
      Stats label: color del acento. Stats value: blanco. Titulo: blanco.
      NUNCA: gradientes en texto (background-clip). Es overlay de datos, no arte.

  11. RESTRICCIONES GLOBALES:
      width: 100%; height: 100%; en wrapper.
      El PANEL tiene width fija via calc(var(--panelWidth) * 1px) — 400px-600px tipico.
      NO ocupar mas del 40% del frame con el panel.
      PROHIBIDO: transition, @keyframes, setTimeout, Math.random().
      @import Inter: font-weight 700, 800, 900.
`,

  'minimal-elegant': `
[VISUAL SKILL: MINIMAL ELEGANT / EDITORIAL LUXURY]

Concepto: El silencio visual como declaracion de poder. Lujo editorial de alta gama.
Referencia: portadas de Vogue Paris, catalogos de Chanel, presentaciones de Leica,
Taschen book reveals, editoriales de arquitectura. Cada elemento en pantalla tiene un
proposito narrativo. Nada es decorativo — todo es esencial.

DIFERENCIA CRITICA vs studio-showcase:
  - studio-showcase: producto abstracto en el centro del vacio. Unico elemento.
  - minimal-elegant: SISTEMA editorial completo: imagen + titulo + precio + metadata. Narrativa.

Arquitectura OBLIGATORIA (en orden de aparicion):
  ELEMENTO 1 — Contenedor modal con padding generoso (64px minimo) y hairline border.
  ELEMENTO 2 — Eyebrow: categoria en mayusculas, font-size 14px, tracking extremo.
  ELEMENTO 3 — Divider line con reveal scaleX desde la izquierda.
  ELEMENTO 4 — Content row: imagen de artefacto + bloque de texto.
  ELEMENTO 5 — Main title: serif ligero (font-weight 400), letra grande, tracking negativo.
  ELEMENTO 6 — Technical grid: metadata en la parte inferior, 10px, opacity 0.4.

Elementos Clave:
  1. TIPOGRAFIA EDITORIAL — REGLAS ABSOLUTAS:
     @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Inter:wght@300;400&display=swap');
     Eyebrow: font-family: 'Inter', sans-serif; font-weight: 300; font-size: 14px;
       letter-spacing: 0.3em; text-transform: uppercase; opacity: 0.7;
     Titulo: font-family: 'Cormorant Garamond', serif; font-weight: 400; font-size: 64px-96px;
       letter-spacing: -0.02em; line-height: 1.0;
     Precio/subtitulo: font-size: 22px-28px; color: var(--accentColor); font-weight: 300;
     Metadata: font-family: 'Inter'; font-size: 10px; letter-spacing: 0.1em; opacity: 0.4;
     NUNCA: font-weight: 700-900 en minimal-elegant. El MAXIMO peso es 500.
     NO usar Helvetica Neue/SF Pro — no disponibles en Windows. Inter es el equivalente.

  2. MODAL CONTAINER — SNIPPET OBLIGATORIO:
     CSS: #modal {
       background-color: var(--bgColor);
       padding: 64px;
       display: flex; flex-direction: column; gap: 24px;
       box-shadow: 0 40px 100px rgba(0,0,0,0.05);
       border-top: 1px solid rgba(0,0,0,0.08);
     }
     El hairline border-top (1px) es el detalle que separa lo premium de lo generico.
     Box-shadow: SOLO para modo claro. Para modo oscuro: sin shadow (el vacio ya da profundidad).

  3. MASK TEXT REVEAL — SNIPPET HTML+CSS:
     HTML: <div class="mask"><h1 id="main-title"></h1></div>
     CSS: .mask { overflow: hidden; display: block; }
     JS:
     mainTitle.style.transform = 'translateY(' + ctx.utils.lerp(props.slideOffset, 0, ease) + 'px)';
     mainTitle.style.opacity = ease * (1 - outro) * opacityMult;
     El texto "sube" desde fuera del overflow:hidden. No es visible mientras translateY > height.
     Es la tecnica editorial canonica — el texto "emerge" de una grieta en el espacio.

  4. DIVIDER CON REVEAL DESDE IZQUIERDA:
     CSS: #divider { width: 100%; height: 1px; background: var(--textColor); opacity: 0.12;
       transform-origin: left; }
     JS:
     divider.style.transform = 'scaleX(' + ctx.utils.lerp(0, 1, ease) + ')';
     divider.style.opacity = (1 - outro) * opacityMult * 0.12;

  5. STAGGER EDITORIAL CON DELAY CORRECTO:
     /* PATRON CORRECTO: mapRange sobre intro (pre-bezier), no sobre ease (post-bezier) */
     const eyebrowEase = ctx.utils.bezier(props.curve, ctx.utils.clamp(ctx.utils.mapRange(intro, 0, 0.8, 0, 1), 0, 1));
     const titleEase = ctx.utils.bezier(props.curve, ctx.utils.clamp(ctx.utils.mapRange(intro, 0.1, 0.9, 0, 1), 0, 1));
     const priceEase  = ctx.utils.bezier(props.curve, ctx.utils.clamp(ctx.utils.mapRange(intro, 0.2, 1.0, 0, 1), 0, 1));
     Cada elemento tiene su propio rango de intro. La bezier se aplica DESPUES del mapRange.

  6. ARTIFACT (imagen de portada) CON ASPECT RATIO EDITORIAL:
     CSS: .artifact-box { width: calc(var(--coverWidth) * 1px);
       height: calc(var(--coverWidth) * 1.35px); } /* relacion editorial libro 3:4 */
     .dv-artifact { width: 100%; height: 100%; object-fit: cover; }
     JS (carga reactiva OBLIGATORIA):
     const el = ctx.root.getElementById('el_coverImage');
     const src = props.coverImage;
     if (el && src && el.getAttribute('src') !== src) el.src = src;
     else if (el && !src) el.src = '';
     JS (reveal del artefacto con delay):
     const artEase = ctx.utils.bezier(props.curve, ctx.utils.clamp(ctx.utils.mapRange(intro, 0.15, 0.85, 0, 1), 0, 1));
     el.style.opacity = artEase * (1 - outro) * opacityMult;
     el.style.transform = 'scale(' + ctx.utils.lerp(1.05, 1, artEase) + ')'; /* Ken Burns sutil */

  7. TECHNICAL GRID (metadata footer):
     HTML: <div id="technical-grid">
             <span>REF: 2026-001</span><span>EDICION LIMITADA</span><span>FORMATO DIGITAL</span>
           </div>
     CSS: #technical-grid { display: flex; justify-content: space-between; font-size: 10px;
       letter-spacing: 0.1em; opacity: 0.4; }
     Estos metadatos de 10px en la parte inferior comunican "ficha tecnica de producto".
     Pueden ser props (via @dv-prop string) o texto fijo segun el use case.

  8. PALETA EDITORIAL OBLIGATORIA:
     Modo claro (preferido): --bgColor: #FAFAF8; --textColor: #1A1A1A;
     Modo oscuro: --bgColor: #0C0C0C; --textColor: #F0EDE8;
     Acento: 1 solo color metalico via @dv-prop. Por defecto: oro palido #C9A96E.
     NUNCA fondos de colores saturados. NUNCA mas de 1 acento.
     El blanco roto (#FAFAF8) es mas premium que el blanco puro (#FFFFFF).

  9. ANIMACION GENERAL:
     Modal container: scale(0.98 -> 1) + opacity(0 -> 1). La escala es casi imperceptible.
       Eso es intencional — la elegancia se nota en los detalles minimos.
     Curva: [0.4, 0, 0.2, 1] (ease-in-out suave y prolongado). NO usar spring curves.
     Outro: fade lineal. El modal desaparece con dignidad, sin movimiento.
     PROHIBIDO: rotaciones, slides extremos, blur. Este skill es sobre la QUIETUD animada.

  10. WRAPPER — REGLA GLOBAL:
      #canvas { position: absolute; width: 100%; height: 100%; }
`,

  'cinematic': `
[VISUAL SKILL: CINEMATIC / MOVIE TRAILER OPENER]

Concepto: Opener de trailer cinematografico. El frame ES un fotograma de pelicula.
La audiencia debe sentir que esta en una sala de cine en los primeros 3 segundos.
Referencia: trailers de NOLAN (Interstellar, Tenet), A24 (Hereditary, Midsommar),
Denis Villeneuve (Dune, Arrival). La tipografia es elegante y escasa. El silencio es poder.

DIFERENCIA CRITICA vs otros skills:
  - publicidad-motion: marca moderna, rapida, colorida. Cinematic: oscuro, lento, inevitable.
  - studio-showcase: producto en foco. Cinematic: vacio y atmosfera. El titulo ES el producto.

Arquitectura OBLIGATORIA (todas las capas):
  CAPA 1 — Fondo negro (#050505, no #000000 — el negro puro "aplana" la imagen).
  CAPA 2 — Light orbs: 2-3 puntos de luz ambiental con blur extremo, drift lento.
  CAPA 3 — Color grade overlay: mix-blend-mode: color, para el tinte cinematografico.
  CAPA 4 — Vignette: box-shadow inset extremo oscurece los bordes.
  CAPA 5 — Grain animado: backgroundPosition animada con frame.
  CAPA 6 — Content layer: texto centrado, serif delgado.
  CAPA 7 — Letterbox bars: barras negras superior e inferior (formato cine 2.35:1).

Elementos Clave:
  1. LETTERBOX BARS — SNIPPET OBLIGATORIO:
     HTML: <div id="letterbox-top" class="letterbox"></div>
           <div id="letterbox-bottom" class="letterbox"></div>
     CSS: .letterbox { position: absolute; width: 100%; z-index: 100; background: #000; }
          #letterbox-top { top: 0; height: calc(var(--letterboxSize) * 1px); }
          #letterbox-bottom { bottom: 0; height: calc(var(--letterboxSize) * 1px); }
     CRITICO: position: absolute, NO position: fixed. Fixed rompe el contexto del motor.
     La barra de letterbox de 80px crea el ratio 2.35:1 cinematografico sobre un 16:9.

  2. VIGNETTE — SNIPPET OBLIGATORIO:
     CSS: #vignette { position: absolute; inset: 0; pointer-events: none; z-index: 5;
       box-shadow: inset 0 0 300px rgba(0,0,0,0.9); }
     El radio grande (300px) crea un vignette suave y dramatico. NO usar border-radius.
     NO animar — es una capa estatica. La intensidad es parte del diseno, no una prop.

  3. COLOR GRADE (tinte cinematografico):
     HTML: <div id="color-grade"></div>
     CSS: #color-grade { position: absolute; inset: 0; mix-blend-mode: color;
       pointer-events: none; z-index: 4; }
     JS: colorGrade.style.background = props.tintColor || '#A67C52';
         colorGrade.style.opacity = props.tintIntensity || 0.25;
     Tinte recomendado para drama: sepia dorado #A67C52 (Dune). Azul frio #1A2A4A (Tenet).
     Esta tecnica de mix-blend-mode: color es equivalente al color grading en DaVinci Resolve.

  4. KEN BURNS (camara lenta, inevitable):
     HTML: <div id="ken-burns-layer">...</div> (todo el contenido dentro)
     JS:
     const kenBurnsTarget = props.kenBurnsScale || 1.05;
     kenBurnsLayer.style.transform = 'scale(' + ctx.utils.lerp(1, kenBurnsTarget, intro) + ')';
     El zoom va de 1 a 1.05 durante todo el intro. Es casi imperceptible pero psicologicamente
     potente — la camara SE ACERCA en silencio. Solo la intensidad matter, no la velocidad.

  5. GRAIN ANIMADO (sin URL externas):
     HTML: <div id="noise-overlay"></div>
     CSS: #noise-overlay { position: absolute; inset: 0; mix-blend-mode: overlay; opacity: 0.12;
       background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
       background-size: 200px; pointer-events: none; }
     JS (animacion del grain):
     noise.style.backgroundPosition = (frame * 13) + 'px ' + (frame * 7) + 'px';
     El backgroundPosition cambia cada frame — da la ilusion de film grain vivo.
     NO usar URLs externas (transparenttextures.com). Siempre inline SVG data URI.

  6. LIGHT ORBS (puntos de luz ambiental):
     HTML: <div id="light-1" class="light-orb"></div><div id="light-2" class="light-orb"></div>
     CSS: .light-orb { position: absolute; border-radius: 50%; pointer-events: none;
       background: radial-gradient(circle, rgba(255,230,180,0.06) 0%, transparent 70%);
       filter: blur(60px); }
     #light-1 { width: 800px; height: 800px; top: -100px; left: -100px; }
     #light-2 { width: 600px; height: 600px; bottom: -50px; right: -50px; }
     JS (drift lento determinista — sin modulo):
     orb1.style.transform = 'translate(' + (Math.sin(frame * 0.005) * 30) + 'px, ' + (Math.cos(frame * 0.003) * 20) + 'px)';
     orb2.style.transform = 'translate(' + (Math.cos(frame * 0.004) * 40) + 'px, ' + (Math.sin(frame * 0.006) * 25) + 'px)';
     Diferentes frecuencias (0.005, 0.003, 0.004, 0.006) para movimiento organico.

  7. TIPOGRAFIA CINEMATOGRAFICA:
     @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&display=swap');
     Titulo: font-family: 'Cormorant Garamond', serif; font-weight: 300; font-size: 80px-120px;
       letter-spacing: 0.2em-0.3em; text-transform: uppercase; color: #FFFFFF;
     Subtitulo: font-weight: 400; font-size: 16px-20px; letter-spacing: 0.4em; color: #AAAAAA;
     Tagline: font-size: 14px-16px; letter-spacing: 0.4em; color: #888888; font-weight: 300;
     NUNCA: font-weight > 500 en cinematic. La delgadez es la estetica del drama.
     PROHIBIDO: background-clip: text (gradiente en titulo). El blanco puro #FFFFFF es el titulo.

  8. TIMING DRAMATICO DE TEXTOS (delay extremo):
     /* Titulo: aparece despues del 20% del intro, NO antes */
     const titleEase = ctx.utils.clamp(ctx.utils.mapRange(intro, 0.2, 1, 0, 1), 0, 1);
     title.style.opacity = ctx.utils.bezier(props.curve, titleEase) * (1 - outro) * opacityMult;
     title.style.transform = 'translateY(' + ctx.utils.lerp(40, 0, titleEase) + 'px)';
     /* Subtitulo: despues del 40% */
     const subEase = ctx.utils.clamp(ctx.utils.mapRange(intro, 0.4, 1, 0, 1), 0, 1);
     /* Tagline: despues del 60% */
     const tagEase = ctx.utils.clamp(ctx.utils.mapRange(intro, 0.6, 1, 0, 1), 0, 1);
     Nada aparece de golpe. Todo emerge en silencio.

  9. OUTRO CON FADE A NEGRO (SIN document.createElement):
     HTML: <div id="outro-black" style="position:absolute;inset:0;background:#000;opacity:0;z-index:199;pointer-events:none;"></div>
     JS: const outroBlack = ctx.root.getElementById('outro-black');
     if (outroBlack) outroBlack.style.opacity = outro;
     CRITICO: El div de outro-black DEBE estar en el HTML original. NUNCA usar document.createElement.
     document.createElement usa el document global, no el shadow DOM. Es un bug critico en DVGE.

  10. FILTER CINEMATOGRAFICO EN MAIN SCENE:
      CSS: #main-scene { filter: contrast(1.1) saturate(0.85); }
      El contraste elevado y la saturacion reducida dan el look de pelicula fotografica.
      NO aplicar el filter al wrapper raiz — solo al contenido, nunca a los overlays.

  11. WRAPPER — REGLA GLOBAL:
      #cinema-wrapper { position: absolute; width: 100%; height: 100%; background: #050505; }
`,
};
