# Dynamic Vector Graphics Engine (DVGE) v5.6.0 GA

Professional-grade broadcast animation engine for creating dynamic vector graphics with native Alpha channel transparency.

## About

**Dynamic Vector Graphics Engine (DVGE)** is a high-performance desktop application designed for broadcast production. It allows editors and producers to create, customize, and export professional motion graphics (like lower thirds, titles, and callouts) without advanced technical knowledge.

Built on top of **Remotion** and **Electron**, DVGE combines the power of web technologies (HTML/CSS/JS) with the reliability of a native broadcast workflow.

> [!IMPORTANT]
> **Open Source Status**: This project is currently **Open Source** under the **MIT License**. We are in active development (GA Stage). 
> **Note on Monetization**: As the project matures and transitions to a sustainable model, future professional versions may shift to a closed-source model to fund long-term maintenance and infrastructure.

## Key Features

- **Transparency Transformer**: Native ProRes 4444 export with perfect Alpha channel support for DaVinci Resolve, Premiere Pro, and After Effects.
- **Dynamic Plugin System**: Modular architecture that allows installing and updating graphics templates from a central catalog.
- **Atomic Save System**: Industrial-grade persistence that protects your projects from data corruption using asychronous atomic I/O.
- **AI-Native Workflow**: Integrated "Knowledge Bridge" to feed engine rules directly into LLMs for one-shot plugin generation.
- **Project Gallery**: Integrated management to rename, delete, and organize your broadcast assets.

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **Google Chrome** (Installed on the system for headless rendering)
- **FFmpeg** (Included in the build process)

### Installation & Development

1. **Clone the repository**:

   ```bash
   git clone https://github.com/Mushi-Ayaka/Dynamic-Vector-Graphics-Engine--DVGE-.git
   cd "Dynamic Vector Graphics Engine"
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Run in Development Mode**:

   ```bash
   npm run dev
   ```

4. **Build the Production Executable**:

   ```bash
   npm run build
   ```

## ⚠️ Installation Note (Windows SmartScreen)

As this is an independent project in development, the current `.exe` installers are **not digitally signed**. When installing on Windows:

1. A blue window saying **"Windows protected your PC"** may appear.
2. Click on **"More info"**.
3. Click on **"Run anyway"**.

*We are working towards acquiring a Code Signing Certificate once the project reaches a stable monetization phase.*

## Project Structure

- `app/electron`: Main process logic, IPC handlers, and project management.
- `app/src`: Frontend React application and UI components.
- `app/src/remotion`: The core rendering engine wrapper.
- `docs`: Comprehensive technical and user documentation.

## Documentation

For more details, check the internal documentation:

- [User Manual](USER_MANUAL.md)
- [Technical Documentation](TECHNICAL.md)
- [AI Plugin Guide](AI_PLUGIN_GUIDE.md)

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details (if applicable, otherwise defaults to MIT standards).

---

*Developed by Jonatan Baron*
