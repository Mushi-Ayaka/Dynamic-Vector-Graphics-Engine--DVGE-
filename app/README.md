# Dynamic Vector Graphics Engine (DVGE) v5.8

Professional-grade broadcast animation engine for creating dynamic vector graphics with native Alpha channel transparency.

## About

**Dynamic Vector Graphics Engine (DVGE)** is a high-performance desktop application designed for broadcast production. It allows editors and producers to create, customize, and export professional motion graphics (like lower thirds, titles, and callouts) without advanced technical knowledge.

Built on top of **Remotion** and **Electron**, DVGE combines the power of web technologies (HTML/CSS/JS) with the reliability of a native broadcast workflow.

## Key Features

- **Transparency Transformer**: Native ProRes 4444 export with perfect Alpha channel support for DaVinci Resolve, Premiere Pro, and After Effects.
- **Dynamic Plugin System**: Modular architecture that allows installing and updating graphics templates from a central catalog.
- **Atomic Save System**: Industrial-grade persistence that protects your projects from data corruption using asychronous atomic I/O.
- **Project Gallery**: Integrated management to rename, delete, and organize your broadcast assets.
- **Master UI**: Redesigned workspace with interactive guides and advanced inspector panels.

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **Google Chrome** (Installed on the system for headless rendering)
- **FFmpeg** (Included in the build process)

### Installation & Development

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Mushi-Ayaka/Dynamic-Vector-Graphics-Engine--DVGE-.git
   cd "Dynamic Vector Graphics Engine/app"
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Run in Development Mode**:

   ```bash
   npm run dev
   ```

## Documentation

For more details, check the internal documentation:

- [User Manual](USER_MANUAL.md)
- [Technical Documentation](TECHNICAL.md)

## License

This project is licensed under the **MIT License**.

---

## Developed by Jonatan Baron
