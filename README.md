# Dynamic Vector Graphics Engine (DVGE) v5.6.0 GA

**Dynamic Vector Graphics Engine (DVGE)** es un software de escritorio de alto rendimiento diseñado para gráficos de transmisión profesionales. Construido con React, Electron y Remotion, permite a los productores y editores crear, personalizar y exportar gráficos dinámicos (lower thirds, títulos, callouts) con retroalimentación en tiempo real y soporte nativo para ProRes 4444 + Alpha.

> [!IMPORTANT]
> **Estado del Proyecto**: DVGE es actualmente un proyecto **Open Source** impulsado por un único desarrollador independiente bajo la **MIT License**. Estamos en desarrollo activo (Etapa GA).
> **Compromiso de Seguridad**: Los instaladores actuales no están firmados digitalmente debido a los costes de certificación para desarrolladores independientes. Como proyecto Open Source, priorizamos la transparencia: el código es totalmente auditable. Para instalar sin avisos, simplemente haz clic en "Más información" -> "Ejecutar de todos modos".

## ✨ Key Features

- **Knowledge Bridge (v5.6)**: Inyección nativa de reglas para asistentes de IA. Genera reglas maestras en PDF para alimentar LLMs (Claude/Gemini/GPT) para la generación de plugins 100% compatibles.
- **Transparency Transformer**: Capa de estabilidad avanzada para exportaciones ProRes 4444, asegurando una captura perfecta del canal Alpha desde el primer fotograma (Solución para el bug del fotograma 0).
- **Gestión de Proyectos**: Galería integrada para renombrar, eliminar y gestionar tus activos de transmisión directamente desde el menú de inicio.
- **Integrity Check**: Capa de seguridad automatizada que evita la carga de proyectos con plugins faltantes o eliminados.
- **Smart Engine**: Capa de inteligencia que envuelve y corrige automáticamente errores estructurales en scripts generados por IA (Auto-Rescue).
- **Catálogo de Plugins**: Descubre, instala y actualiza gráficos directamente desde el registro oficial de GitHub.
- **Security Sandbox**: Ejecución de plugins aislada a través de Shadow DOM y `fakeWindow` para prevenir interferencias en el sistema.
- **Atomic Async I/O**: Persistencia de proyectos resiliente utilizando operaciones de archivos atómicos para prevenir la corrupción de datos.
- **Live 60FPS Preview**: Renderizado en tiempo real con animación determinística basada en fotogramas (`ctx.timeline`).

## Technical Stack

- **Core**: Electron, React 18, Vite.
- **Rendering Engine**: Remotion (Player & Renderer).
- **State Management**: Zustand.
- **Styling**: Vanilla CSS (Scoped via Shadow DOM).
- **Package Manager**: NPM / Electron-builder.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Version 18 or higher recommended)
- [NPM](https://www.npmjs.com/)
- **Google Chrome** (System-wide installation for headless rendering)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Mushi-Ayaka/Dynamic-Vector-Graphics-Engine--DVGE-.git
   cd "Dynamic Vector Graphics Engine"/app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

### Building for Production

To generate the installer (.exe) for Windows:

```bash
npm run build
```

Los artefactos se generarán en la carpeta `Releases` (configurada en `package.json`).

## Estructura del Proyecto

```text
app/
├── electron/          # Main process logic (IPC, File System, Render)
├── src/               # Renderer process (React UI, Logic, Styles)
│   ├── components/    # UI Components (Manuals, Project Manager)
│   ├── remotion/      # Remotion compositions and PluginWrapper
│   └── store/         # Zustand store (Persistence and Global State)
├── TECHNICAL.md       # Full technical architecture documentation
├── AI_PLUGIN_GUIDE.md # Tutorial for creating plugins with AI
└── CHANGELOG.md       # Version history and v3.1 release notes
```

## Documentation

- **[Technical Manual](app/TECHNICAL.md)**: Análisis profundo de la arquitectura, ciclo de vida y puente IPC.
- **[AI Plugin Guide](app/AI_PLUGIN_GUIDE.md)**: Tutorial paso a paso para generar plugins listos para producción usando IA.
- **[User Manual](app/USER_MANUAL.md)**: Guía sencilla para editores y productores.

## License

MIT — see the [LICENSE](LICENSE) file for details.

© 2026 Jonatan Baron. All rights reserved.
