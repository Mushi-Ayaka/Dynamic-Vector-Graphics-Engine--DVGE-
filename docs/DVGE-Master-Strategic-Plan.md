# DVGE — Master Strategic Plan

> Documento de referencia interno. Contiene todas las decisiones arquitectónicas, de negocio, seguridad, comunidad y roadmap debatidas y cerradas. Sin redundancias, sin palabras de relleno.

---

## 1. POSICIONAMIENTO Y VISIÓN

### 1.1 El Pitch Oficial

> **DVGE no es un editor de video. Es un motor de orquestación de gráficos broadcast impulsado por WebTech.**

El usuario final no consume el motor. Consume los **Workflows** (flujos de trabajo) que el motor ejecuta. Esta distinción es crítica para todo el marketing y toda la comunicación.

- El motor (Engine Core) es la infraestructura → siempre gratuito (MIT).
- Los Workflows (Templates, Tools, Extensions) son el producto real → pueden ser gratuitos o de pago.

### 1.2 Diferenciador Real

DVGE no compite con After Effects. Automatiza lo que After Effects tarda horas en hacer:

- **Renderizado Determinista**: El fotograma 45 hoy y en un año producirá píxeles idénticos.
- **Frame-Math**: Animaciones matemáticamente puras, sin depender del reloj del sistema.
- **Exportación Broadcast**: ProRes 4444 con canal alfa puro, sin pérdida.
- **Stack Universal**: HTML/CSS/JS es el stack más amplio del planeta. Cualquier dev web puede crear un plugin.

### 1.3 Audiencia

| Segmento | Qué obtiene |
| ---------- | ------------ |
| Editores y Productoras | Templates listos para renderizar sin tocar código |
| Desarrolladores Web | SDK para crear gráficos broadcast con herramientas que ya conocen |
| Agencias/Enterprise | Motor de automatización masiva integrable en pipelines de producción |
| IAs / Knowledge Bridge | Contexto nativo para generar código compatible mediante el PDF de reglas |

---

## 2. TAXONOMÍA OFICIAL (Manifest v5.x)

### 2.1 Tipos de Componentes

Se elimina definitivamente la palabra genérica **"plugin"** del discurso oficial. Los tres tipos son:

| Tipo | Descripción | Ejecutado en |
| ------ | ------------ | ------------ |
| `template` | Plantilla de animación final. Output renderizable (ProRes). | Studio |
| `tool` | Herramienta de asistencia al desarrollo o al flujo de trabajo. | Library / Panel dedicado |
| `extension` | Módulo que amplía las capacidades internas del motor. Acceso profundo. | Main Process / Sistema |

### 2.2 Estructura del Manifest v5.x (Estándar Nuevo)

```json
{
  "id": "com.autor.nombre-componente",
  "name": "Nombre Visible",
  "version": "1.0.0",
  "author": "Nombre del Autor",
  "type": "template",
  "description": "Descripción funcional sin adornos.",
  "minEngineVersion": "5.5.0",
  "permissions": [],
  "schema": []
}
```

**Campo `permissions` (nuevo en v5.x):**

- Por defecto: sandbox total, sin acceso a red ni disco.
- `"network"`: permite `fetch()` externo.
- `"storage"`: permite leer/escribir en disco local.
- Si un `template` hace `fetch()` sin declarar `network`, el Sandbox lo bloquea silenciosamente.

**Campo `type` es obligatorio.** Sin él, el motor rechaza el componente en carga.

### 2.3 Tipos de Input en `schema`

| `type` | Descripción |
| -------- | ------------ |
| `string` | Campo de texto estándar |
| `number` | Numérico (posición, escala, duración) |
| `boolean` | Toggle on/off |
| `color` | Selector de color (devuelve hex o rgba) |
| `image` | Ruta a imagen local (DVGE maneja la ruta absoluta) |
| `select` | Menú desplegable (requiere array `options`) |
| `code` | Textarea monoespaciado para código inline |
| `info` | Texto de solo lectura con botón de copiado |
| `prompt` | Zona arrastrable (Drag & Drop) que genera el PDF de Knowledge Bridge |

---

## 3. ARQUITECTURA TÉCNICA

### 3.1 Multi-Ventana (Objetivo v5.6)

Se abandona el diseño de ventana única. La nueva arquitectura nativa de Electron separa contextos:

| Ventana | Responsabilidad |
| --------- | ----------------- |
| **Studio** | Edición, Inspector, Preview Player en tiempo real |
| **Library** | Catálogo de Templates y Tools instalados |
| **Render** | Cola de renderizado, progreso, arrastre de archivos resultantes |

**Comunicación entre ventanas:** Todo el estado de sesión se mueve del Renderer (Zustand) al **Main Process**. Las ventanas se comunican únicamente vía IPC Broadcast desde el Main. Ninguna ventana escribe estado directamente en otra.

**Barra de progreso global:** El estado de render es visible desde cualquier ventana activa mediante suscripción IPC.

### 3.2 Dependencias Frágiles → Auto-Fetch (v5.6)

**Problema actual:** El motor usa Chromium nativo del sistema para renderizar. Si el usuario no tiene Chrome/Edge instalado, falla.

**Solución (v5.6):** En el primer inicio, DVGE detecta si los binarios necesarios existen en `%APPDATA%\DVGE\bin\`. Si no, los descarga automáticamente:

- **Chromium**: Para el Sandbox de renderizado.
- **FFmpeg**: Para la codificación ProRes 4444.

Esto hace al motor 100% autónomo en cualquier máquina Windows, sin requerir instalaciones previas del usuario.

### 3.3 Estado Global en Main Process

```json
Main Process (Estado Autoritativo)
    ↕ IPC Broadcast
Studio Window ← → Library Window ← → Render Window
```

El Renderer ya no tiene Zustand como fuente de verdad del estado de sesión. Solo tiene estado de UI local (ej. qué panel está abierto).

### 3.4 Knowledge Bridge (v5.5.0 — Ya implementado)

- El campo `type: "prompt"` en el `manifest.json` de `dv-studio-master` genera una zona visual arrastrable en el Inspector.
- Al arrastrar, se invoca `generateRulesPdf()` via IPC, que compila las reglas del motor en un PDF temporal en `%TEMP%\DVGE-Master-Rules.pdf`.
- El usuario arrastra ese PDF directamente al chat de la IA (Claude, Gemini, ChatGPT).
- La IA lee el PDF y genera código 100% compatible con el Sandbox de DVGE.

**Bug corregido (sesión actual):** El `case 'prompt'` faltaba en el `switch` de `DynamicField` en `App.tsx`, causando fallback al input de texto por defecto. Ya restaurado.

---

## 4. MODELO DE NEGOCIO (Open Core)

### 4.1 Estructura de Tiers

| Tier | Target | Contenido | Precio |
| ------ | -------- | ----------- | -------- |
| **FREE** | Comunidad, individuos | Engine Core (MIT) + Catálogo comunitario | $0 |
| **PRO** | Freelancers, Power Users | Panel Batch Render + Tools premium propios | Suscripción (a definir) |
| **ENTERPRISE** | Agencias, Productoras | Plugins C++/Rust para render masivo en paralelo | Licencia perpetua por organización |

**Regla crítica:** Los primeros en monetizarse son los Workflows PRO propios del autor (Jonatan Barón), no los de terceros. El marketplace de terceros es Fase 3+.

### 4.2 Infraestructura de Pagos (Costo $0 hasta escala)

**Plataforma:** Lemon Squeezy (Merchant of Record)

- Lemon Squeezy almacena a los clientes, procesa pagos, emite facturas y gestiona impuestos (VAT global).
- Genera un **License Key** único por compra (ej. `XXXX-YYYY-ZZZZ`).
- DVGE no tiene base de datos de usuarios. Valida la licencia preguntando a la API pública de Lemon Squeezy:

```http
GET https://api.lemonsqueezy.com/v1/licenses/validate
Body: { "license_key": "XXXX-YYYY-ZZZZ" }
```

Respuesta:

```json
{ "valid": true, "status": "active" }
```

Si es válida, la app desbloquea las features localmente. Sin backend propio, sin DB propia.

**Gestión de suscriptores:** El Dashboard web de Lemon Squeezy actúa como CRM gratuito.

### 4.3 Distribución de Contenido PRO

**Plataforma:** Cloudflare R2 + Cloudflare Workers

- Los archivos pesados de pago (plugins Enterprise +1GB) se almacenan en Cloudflare R2.
- Un Cloudflare Worker genera **Signed URLs** de tiempo limitado (15 min) solo para licencias válidas.
- Los archivos viajan encriptados (`.dvge-pro`) y se descifran en memoria al cargarlos.
- **No hay servidor propio**. Cloudflare gestiona la infraestructura CDN y el compute.

### 4.4 Métricas Reales vs. Métricas de Vanidad

| Métrica | Tipo | Usar |
| --------- | ------ | ------ |
| Descargas totales | Vanidad | ❌ No mostrar públicamente |
| Active Installs | Real | ✅ Si se implementa telemetría anónima |
| MRR (Monthly Recurring Revenue) | Real | ✅ Interno (Excel) |
| License Keys activas | Real | ✅ Lemon Squeezy Dashboard |

**Control financiero:** Google Sheets / Excel con 3 pestañas: Gastos Fijos, Ingresos, KPIs mensuales. Suficiente hasta $5,000/mes de MRR.

---

## 5. SEGURIDAD Y PROTECCIÓN DE CÓDIGO

### 5.1 Modelo de Seguridad por Nivel

| Nivel | Qué proteger | Mecanismo |
| ------- | ------------- | ----------- |
| Engine Core | Módulo de verificación de licencias, features PRO internas | **V8 Snapshots** (bytecode nativo, no reversible a JS) |
| Plugins PRO externos | Lógica de animación de pago distribuida por Cloudflare | Encriptación AES-256 en reposo (`.dvge-pro`), descifrado en RAM |
| Plugins Enterprise | Lógica de render masivo de alto rendimiento | **Binarios nativos** C++/Rust (`.dll` / `.so`), no interpretables |

### 5.2 V8 Snapshots — Por qué y cómo

- **Por qué:** JavaScript en Electron es trivialmente extraíble (DevTools abierto, archivos `.asar` desempaquetables). V8 Snapshot convierte JS a bytecode/código máquina de V8. No existe decompilador público funcional.
- **Cómo:** `mksnapshot` (incluido en Electron) compila el módulo JS a un `.bin` que se carga como snapshot de inicio del proceso V8.
- **Restricción crítica:** Si se actualiza la versión de Electron, **todos los snapshots deben recompilarse**. Es un costo de mantenimiento de CI/CD aceptable.

### 5.3 Flujo de Descarga de Plugin PRO

```text
Usuario activa License Key
        ↓
App pide Signed URL al Worker de Cloudflare
        ↓
Worker valida con Lemon Squeezy API
        ↓
Worker genera URL firmada (TTL: 15 min)
        ↓
App descarga archivo .dvge-pro encriptado
        ↓
Motor descifra en RAM al cargar el plugin
        ↓
Nunca existe en disco como JS plano
```

### 5.4 Plugins Gratuitos y Comunitarios

- Los plugins del catálogo oficial son código abierto (MIT), sin ofuscar, revisables en el repositorio.
- Los plugins de terceros que se instalan manualmente pueden estar ofuscados, pero DVGE no los lista ni da soporte oficial.
- El Sandbox de DVGE (Shadow DOM + restricciones de permisos) los contiene independientemente de su origen.

---

## 6. ECOSISTEMA Y COMUNIDAD

### 6.1 Catálogo Oficial (Registry)

- **Repositorio GitHub** con política estricta de PRs.
- **Requisito de entrada:** El código debe ser abierto, legible, sin ofuscar, con licencia MIT.
- **El autor (Jonatan Barón) revisa y aprueba/rechaza cada PR** manualmente en esta etapa.
- No existe un sistema automático de publicación. La revisión humana es el control de calidad.

### 6.2 Monetización de Terceros

Un desarrollador externo o empresa puede:

- Crear Templates/Tools de calidad profesional.
- Ofuscarlos con las herramientas que prefieran.
- Venderlos por canales externos (Gumroad, web propia, Lemon Squeezy propio).
- Los usuarios los instalan manualmente en DVGE.

**Lo que DVGE no hace:** Listarlos en el catálogo oficial, darles soporte, ni tomar comisión.
**Lo que DVGE sí permite:** La instalación manual y ejecución en el sandbox.

Esta política fomenta que los creadores de plugins promocionen DVGE para vender sus propias creaciones (efecto red natural).

### 6.3 Hub de Comunicación

- **GitHub Discussions**: Foro oficial. Categorías: Showcase, Soporte, Ideas.
- **Razón de la elección:** Mantiene a los usuarios cerca del código, facilita el SEO de preguntas técnicas, y evita la fragmentación de canales.
- No se crea un Discord propio en esta etapa (overhead de moderación innecesario).

### 6.4 Estrategia de Contribución

- Los colaboradores que hagan PR aprobados quedan listados en `CREDITS.md` y en la sección de Transparencia de la Landing.
- No hay programa de recompensas económicas en etapa inicial.
- Los contribuidores obtienen visibilidad en un proyecto con potencial Enterprise como reputación profesional.

---

## 7. ROADMAP DETALLADO

### Fase 1 — Estabilización Atmosférica (v5.6 – v5.9)

**Objetivo:** Motor robusto, autónomo y con identidad visual profesional.

| Ítem | Descripción | Versión objetivo |
| ------ | ------------- | ----------------- |
| Rebranding | Nuevos iconos, logotipo y sistema de identidad visual. Guía de marca completa. | v5.7 |
| Multi-ventana | Separación real de Studio, Library y Render. Estado en Main Process. | v5.6 |
| Auto-Fetch deps | Descarga autónoma de Chromium y FFmpeg en `%APPDATA%` en primer inicio. | v5.6 |
| Manifest v5.x | Campo `type` obligatorio, validación de `permissions`, rechazo estricto. | v5.7 |
| Transparencia | Página de benchmarks reales (color, alfa, performance) y créditos OSS en Landing. | v5.7 |
| About / Credits | Sección completa de créditos OSS dentro de la app (Electron, React, Remotion, FFmpeg). | v5.8 |
| Lite Version | Versión reducida que usa Edge nativo del sistema. Solo lanzable en versiones LTS del motor. | v5.9 |

### Fase 2 — Valor PRO y Monetización (v6.0)

**Objetivo:** Primera versión que genera ingresos reales.

| Ítem | Descripción |
| ------ | ------------- |
| Batch Render Panel | Interfaz para inyectar JSON/CSV y generar N renders automáticamente. |
| License Key System | Integración de la API de Lemon Squeezy para activación y validación de licencias PRO. |
| V8 Snapshot | Protección del módulo de verificación de licencias y features PRO mediante bytecode. |
| Cloudflare Worker | Worker de distribución de contenido PRO con Signed URLs y validación de licencia. |

### Fase 3 — Killer Feature (v6.x)

| Ítem | Descripción |
| ------ | ------------- |
| Render-in-Render | El output de un Template puede ser el input de otro. Composición modular de flujos visuales en tiempo real. |

### Fase 4 — Terreno Enterprise (v7.0+)

| Ítem | Descripción |
| ------ | ------------- |
| Bridge Engine Plugin | Plugin de +1GB escrito en C++/Rust para orquestar miles de renders en paralelo (render farm). |
| Mac Support | Soporte oficial macOS con notarización de Apple. Solo viable cuando los ingresos cubran los $99/año de Developer Program + el costo de refactor arquitectónico. |

### Planes a Largo Plazo (sin versión asignada)

| Ítem | Descripción |
| ------ | ------------- |
| Versión Lite LTS | Solo lanzable atada a versiones LTS estables. Usa Microsoft Edge nativo. Para transmisiones de larga duración que requieren mínimo footprint. |
| Linux | Soporte "as-is" sin garantías. No es una plataforma objetivo activa. |
| Cliente Móvil | App satélite (iOS/Android o PWA) que actúa como control remoto del motor desktop. Envía datos, dispara renders, actualiza marcadores. No renderiza localmente. |

---

## 8. MULTIPLATAFORMA — DECISIONES TOMADAS

### Windows (Principal)

- Foco 100% en Windows para v5.x y v6.x.
- Justificación: La audiencia principal (broadcast, productoras, creadores de contenido hispanohablantes) opera en Windows.

### macOS

- No se aborda hasta que los ingresos de la versión Enterprise sean suficientes para cubrir:
  - Apple Developer Program: $99/año.
  - Notarización obligatoria (sin ella, macOS bloquea la app por defecto).
  - Refactor arquitectónico (APIs de Electron difieren en comportamiento en Mac).
- **Estimación:** Post-v7.0 o cuando haya MRR Enterprise estable.

### Linux

- Se provee compilación "as-is" para usuarios avanzados que sepan manejarse.
- No hay soporte activo, no hay QA en Linux, no hay garantías.

---

## 9. TRANSPARENCIA Y CRÉDITOS OSS

### 9.1 Por qué es Obligatorio

DVGE no existiría sin la infraestructura de código abierto de terceros. El reconocimiento explícito:

- Es éticamente correcto.
- Cumple con las licencias de las dependencias (algunas requieren atribución explícita).
- Genera confianza Enterprise (un CTO que ve transparencia ve profesionalismo).

### 9.2 Dependencias Críticas a Reconocer

| Tecnología | Rol en DVGE | Licencia |
| ------------ | ------------- | ---------- |
| **Remotion** | Frame-Math. Convierte el DOM en una línea de tiempo discreta y determinista. | Remotion License |
| **Electron** | Contenedor desktop. Acceso al sistema de archivos con operaciones atómicas. | MIT |
| **Chromium** | Lienzo de renderizado (WebGL, V8). | BSD-style |
| **FFmpeg** | Codificación y compresión ProRes 4444 con canal alfa. | LGPL |
| **React** | Arquitectura de UI y base para la API de plugins. | MIT |

### 9.3 Implementación

- Sección `About → Credits` dentro de la app.
- Página `about/credits` en la Landing Page (ya implementada).
- Archivo `CREDITS.md` en el repositorio principal.

---

## 10. IDENTIDAD VISUAL Y REBRANDING

**Estado:** Pendiente. Incluido en Fase 1 (v5.6).

**Qué implica el rebranding:**

- Nuevos iconos de la aplicación (`.ico`, `.icns`, formatos múltiples).
- Logotipo vectorial oficial (SVG).
- Sistema de colores y tipografía codificado en variables CSS.
- Guía de marca mínima (uso del logo, variantes, espaciado mínimo).
- Actualización del ícono en la Landing Page, el instalador y el ejecutable.

**Criterio de calidad:** El nuevo diseño debe sentirse inmediatamente profesional para un CTO o productor broadcast al ver la app por primera vez.

---

## 11. CONTROL FINANCIERO (Etapa Actual)

No se necesita software de contabilidad hasta $5,000/mes de MRR. La infraestructura mínima viable:

**Google Sheets / Excel — 3 pestañas:**

1. **Gastos Fijos**: Dominio, Cloudflare, Apple Developer Program, herramientas.
2. **Ingresos**: Fecha, License Key vendida, monto, tier (PRO/ENTERPRISE).
3. **KPIs Mensuales**: MRR, Active Installs (si hay telemetría), License Keys activas.

**Fuente de verdad de suscriptores:** Dashboard de Lemon Squeezy (sin costo adicional).

---

## 12. GO-TO-MARKET — PRIMEROS PASOS

**Objetivo inmediato:** Conseguir los primeros 10 usuarios reales que prueben y validen el motor.

### El Showcase (Antes que cualquier campaña)

Grabar un video de 60 segundos:

1. Mostrar un archivo CSV/Excel con 10 nombres de jugadores de fútbol.
2. Arrastrarlo a DVGE y configurar el Template de tercio inferior.
3. Presionar Render.
4. Mostrar los 10 archivos ProRes generados en 30 segundos.

**Este video es todo el argumento de venta.**

### Canales de Distribución (por orden de esfuerzo/retorno)

| Canal | Público | Acción |
| ------- | ------- | ------- |
| Reddit | r/VideoEditing, r/broadcasting, r/selfhosted | Post con el video del Showcase |
| YouTube | Devs y creadores técnicos | Tutorial: "Automaticé mis overlays con código" |
| Product Hunt | Tech early adopters | Launch oficial cuando v6.0 esté listo |
| Twitter/X | Comunidad de devs hispanohablantes | Thread con el proceso de construcción |

### Posicionamiento del Mensaje

- ❌ "Motor gráfico rápido basado en WebTech"
- ✅ "Crea overlays 10x más rápido. Automatiza tus gráficos de broadcast sin tocar código."

---

## 13. DOCUMENTOS ASOCIADOS A ESTE PLAN

| Documento | Ubicación | Estado |
| ----------- | ----------- | -------- |
| Landing — Visión | `Landing DVGE/src/content/docs/about/vision.md` | ✅ Actualizado |
| Landing — Roadmap | `Landing DVGE/src/content/docs/engine/roadmap.md` | ✅ Actualizado |
| Landing — Transparencia | `Landing DVGE/src/content/docs/about/transparency.md` | ✅ Actualizado |
| Landing — Créditos | `Landing DVGE/src/content/docs/about/credits.md` | ✅ Actualizado |
| Landing — Comunidad | `Landing DVGE/src/content/docs/ecosystem/community.md` | ✅ Actualizado |
| Landing — Quick Start | `Landing DVGE/src/content/docs/development/quick-start.md` | ✅ Actualizado |
| Landing — Manifest API | `Landing DVGE/src/content/docs/development/manifest.md` | ✅ Creado |
| App — Inspector Bug Fix | `app/src/App.tsx` (case 'prompt') | ✅ Corregido |
| Estrategia financiera | Este documento, Sección 11 | ✅ Definida |
| Manifest v5.x Schema | Este documento, Sección 2 | ✅ Definido |
| Seguridad y DRM | Este documento, Sección 5 | ✅ Definido |

---

## 14. DEUDA TÉCNICA Y PENDIENTES

| Ítem | Prioridad | Fase |
| ------ | ------- | ------- |
| Benchmarks reales publicados (color, alfa, performance) | Alta | v5.7 |
| Implementar Auto-Fetch de Chromium/FFmpeg | Alta | v5.6 |
| Refactor Multi-ventana (Studio/Library/Render) | Alta | v5.6 |
| Rebranding completo (iconos + identidad visual) | Alta | v5.6 |
| Reestructurar manifest.json con campo `type` y `permissions` | Alta | v5.7 |
| Integrar API de Lemon Squeezy para validación de licencias | Media | v6.0 |
| Implementar V8 Snapshot para módulo de licencias | Media | v6.0 |
| Configurar Cloudflare R2 + Worker para distribución PRO | Media | v6.0 |
| Implementar Batch Render Panel en UI | Media | v6.0 |
| Render-in-Render (composición modular) | Baja | v6.x |
| Bridge Engine en C++/Rust | Baja | v7.0+ |
| Soporte macOS con notarización | Baja | v7.0+ |
| Cliente Móvil (control remoto) | Muy Baja | TBD |
| Marketplace de plugins de terceros | Muy Baja | Post v7.0 |

---

## 15. FEEDBACK REAL DE USUARIOS BETA (Abril 2026)

> Fuente: Pruebas con fotógrafo/editor profesional + grupo de WhatsApp de editores de video. Fecha: 24-25/04/2026.

### 15.1 Bugs Confirmados (Críticos)

| ID | Descripción | Impacto | Fase |
| ------ | ------------- | --------- | ------ |
| BUG-01 | El nombre del proyecto a veces no se puede cambiar. Requiere cerrar y reabrir la app. | Alto | v5.6 |
| BUG-02 | Las opciones del Inspector (Presets: Layout, Branding, Motion) **NO se reflejan en el Preview**. El usuario cambia valores y no pasa nada. | Crítico | v5.6 |
| BUG-03 | Los campos de escala, ancho y alto del Inspector no funcionan visualmente. | Crítico | v5.6 |
| BUG-04 | Curva de easing, FPS, duración de entrada/salida y duración total no funcionan o no son visibles en Preview. | Crítico | v5.6 |
| BUG-05 | El Preview solo muestra orientación horizontal. No es posible cambiar orientación ni tamaño para simular video vertical. | Alto | v5.6 |
| BUG-06 | "Alpha Channel Enabled" y el botón "Actualizar Código" son controles confusos sin explicación contextual. UX rota. | Medio | v5.7 |

### 15.2 Problemas de UX y Diseño de Producto

| ID | Descripción | Decisión |
| ------ | ------------- | ---------- |
| UX-01 | Los Presets (Branding, Layout, Motion) generan ruido cognitivo sin aportar valor real. Si no funcionan correctamente: **eliminar o mover a Preferencias**. | Eliminar/Refactorizar en v5.6 |
| UX-02 | Editar detalles requiere volver al chat de IA, con riesgo de perder código que ya gustaba. El usuario quiere editar propiedades **directamente en la app**. | Feature request: Live Inspector |
| UX-03 | **[IDEA CLAVE]** El usuario quiere un sistema tipo DaVinci Resolve: cada elemento DOM como una "capa" seleccionable, con sus propiedades editables en el Inspector. **Las propiedades las define el manifest/código, no nosotros.** | Roadmap v6.x |
| UX-04 | Click-to-select: tocar un elemento en el Preview interactivo debe seleccionarlo automáticamente en el Inspector. | Roadmap v6.x |
| UX-05 | El preview interactivo es un diferenciador valorado, pero no está suficientemente explotado ni comunicado en el onboarding. | Marketing / Onboarding |

### 15.3 Sobre las Animaciones Generadas por IA

- **Caso de uso INCORRECTO confirmado:** Un fotógrafo/editor pidió una escena con dos personas corriendo en una pradera. El resultado fueron rectángulos HTML. Conclusión: DVGE **no es** para ilustraciones o escenas artísticas 2D complejas. Esta limitación debe comunicarse claramente.
- **Caso de uso CORRECTO confirmado:** Social media bugs (Instagram, Facebook), lower thirds, tickers, marcadores. El usuario valoró positivamente el resultado de la burbuja de Instagram.
- **Acción:** Actualizar el pitch y la Landing para ser explícitos sobre qué tipo de gráficos produce DVGE (infografía de broadcast) y qué NO produce (motion graphics artístico).

### 15.4 Seguridad y Confianza en la Distribución

- **Bloqueador real de adopción:** El instalador de Windows muestra advertencia de "archivo no reconocido". Usuarios preguntaron si era un virus en el grupo de WhatsApp. Un early adopter tuvo que dar fe de que era seguro.
- **Solución:** Code Signing Certificate (DigiCert, Sectigo). Costo: ~$100-300/año. **Prioritario antes de cualquier campaña de marketing pública.**

### 15.5 Insights Estratégicos Confirmados

- **El público objetivo correcto NO son directores de arte.** Son editores de video técnicos/productores que automatizan flujos repetitivos: lower thirds de equipos, tickers de noticias, marcadores de partidos.
- **El flujo que SÍ gusta:** PDF de Knowledge Bridge + prompt a IA + copy/paste del código. Pero rompe en el momento que se quiere ajustar un detalle sin reiniciar el ciclo con la IA.
- **El Showcase del Batch Render** (CSV de 10 jugadores → 10 ProRes en 30 segundos) sigue siendo el argumento de venta más poderoso y debe grabarse antes de cualquier campaña.
- **El copy actual es correcto** ("Automatiza tus gráficos broadcast"), pero la app no lo demuestra en el primer minuto. El onboarding falla.

---

## 16. ROADMAP ARQUITECTÓNICO (v6.0+)

> Las siguientes funcionalidades representan pivotes arquitectónicos mayores y están reservadas para la serie 6.x, priorizando la estabilidad y resolución de bugs en la serie 5.x.

### 16.1 DVGE Custom Elements (Auto-Schema)

La evolución final del motor. En lugar de lidiar con HTML normal y un `manifest.json` manual, el motor proveerá Web Components propios (`<dvge-text>`, `<dvge-slider>`, etc.).

- **Objetivo:** El motor escanea el DOM, detecta estas etiquetas y auto-genera el Inspector conectado en tiempo real.
- **Beneficio IA:** Permite a la IA generar código con una sintaxis extremadamente sencilla ("usa las etiquetas dvge-"), garantizando resultados deterministas y eliminando el riesgo de que la IA invente CSS complejo que no funciona.

### 16.2 DVGE Attribute System (Inspector Declarativo)

Soporte para propiedades complejas directamente en el HTML o JSON. Atributos al estilo Unity (`interactive`, `tooltip`, `dropdown` options) que enriquecen el Inspector sin escribir lógica de interfaz.

### 16.3 Layer Inspector (Árbol Visual)

Un panel Inspector estilo DaVinci Resolve o After Effects, donde cada elemento editable (cada Custom Element) aparece como una capa en un árbol visual, permitiendo ocultar, aislar y seleccionar directamente.

### 16.4 Render Queue Visual (Batch Render Pro)

En lugar de un botón de "Render" que bloquea el hilo principal, un gestor de cola de tareas. El usuario encola múltiples proyectos o iteraciones (CSV) y el motor las procesa secuencialmente en background. Embrión de la versión PRO/Enterprise.

---

*Última actualización: 2026-04-25. Este documento es la fuente de verdad única del plan estratégico de DVGE.*
