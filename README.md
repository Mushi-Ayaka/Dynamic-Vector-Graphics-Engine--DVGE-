# 🚀 Dynamic Vector Graphics Engine (DVGE) v4.1.0 GA
**Dynamic Vector Graphics Engine (DVGE)** is a high-performance desktop application designed for professional broadcast graphics. Built with React, Electron, and Remotion, it allows producers and editors to create, customize, and export dynamic graphics (lower thirds, titles, callouts) with real-time feedback and native ProRes 4444 + Alpha support.

## ✨ Key Features

- **Plugin Marketplace (v4.1)**: Discover, install, and update graphics directly from the official GitHub registry.
- **Security Sandbox**: Isolated plugin execution via Shadow DOM and `fakeWindow` to prevent system interference.
- **Atomic Async I/O**: Resilient project persistence using atomic file operations to prevent data corruption.
- **Live 60FPS Preview**: Real-time rendering with deterministic frame-based animation (`ctx.timeline`).
- **AI-Ready Workflow**: Comprehensive guides to generate full plugins using LLMs.
- **Professional Export**: Native ProRes 4444 (.mov) support with transparent background.

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

### Installation

1. Clone the repository:

   ```bash
   git clone [repository-url]
   cd dv-web-graphics-engine/app
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
The output will be located in the `release/4.1.0` folder.

## Project Structure

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

- **[Technical Manual](app/TECHNICAL.md)**: Deep dive into the architecture, lifecycle, and IPC bridge.
- **[AI Plugin Guide](app/AI_PLUGIN_GUIDE.md)**: Step-by-step tutorial on generating production-ready plugins using AI.
- **[User Manual](app/USER_MANUAL.md)**: Simple guide for editors and producers.

## License

MIT — see the [LICENSE](LICENSE) file for details.

© 2026 Jonatan Baron. All rights reserved.
