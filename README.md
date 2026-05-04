# Ember Motion Studio v5.9.0

[![Sitio Oficial](https://img.shields.io/badge/Sitio-Ember_Motion_Studio-E44C30?style=for-the-badge)](https://ember-motion-studio-landing.vercel.app/)

**Ember Motion Studio** es un software de escritorio de alto rendimiento diseñado para gráficos o animaciones profesionales. Construido con React, Electron y Remotion, permite a los productores y editores crear, personalizar y exportar gráficos dinámicos (lower thirds, títulos, callouts) con retroalimentación en tiempo real y soporte nativo para ProRes 4444 + Alpha.

> [!IMPORTANT]
> **Estado del Proyecto**: Ember Motion Studio es actualmente un proyecto **Open Source** impulsado por un único desarrollador independiente bajo la **MIT License**. Estoy en desarrollo activo (Etapa GA).
> **Compromiso de Seguridad**: Los instaladores actuales no están firmados digitalmente debido a los costes de certificación para desarrolladores independientes. Como proyecto Open Source, priorizamos la transparencia: el código es totalmente auditable. Para instalar sin avisos, simplemente haz clic en "Más información" -> "Ejecutar de todos modos".

## ✨ Key Features (v5.9.0)

- **Studio Master Core**: Integración nativa del "Proyecto Vacío". Ahora puedes programar desde cero sin dependencias externas, utilizando el motor como un lienzo en blanco profesional.
- **Dynamic Inspector v2**: Extracción automática de propiedades mediante tags `/* @dv-prop */`. Soporta tipos complejos como `alignment`, `slider`, `easing` e `icon` con sincronización en tiempo real.
- **Transparency Transformer**: Sistema avanzado de estabilidad para exportaciones ProRes 4444, garantizando que el canal Alpha sea capturado perfectamente desde el fotograma 0.
- **Knowledge Bridge**: Generador de contextos para IA. Crea PDFs con reglas maestras para que Claude, Gemini o GPT generen plugins 100% compatibles con la arquitectura del motor.
- **Bilingual Interface**: Soporte completo para Inglés y Español, sincronizado a través de un sistema de i18n dinámico en toda la aplicación.
- **Atomic Async I/O**: Sistema de persistencia de proyectos ultra-resiliente que utiliza operaciones atómicas para prevenir la corrupción de datos en sesiones largas.

## 🚀 Technical Stack

- **Core**: React 18, Electron 29, Vite.
- **Rendering**: Remotion (Frame-accurate determinism).
- **State**: Zustand (Persistence & Global Sync).
- **Security**: Shadow DOM Sandboxing & Polyfilled Roots.

## 🛠️ Getting Started

### Requisitos Previos

- [Node.js](https://nodejs.org/) (v18 o superior)
- **Google Chrome** (Instalado para el renderizado headless)

### Instalación para Desarrollo

1. Clonar el repositorio.
2. Entrar en la carpeta del proyecto:

   ```bash
   cd "Dynamic Vector Graphics Engine"/app
   ```

3. Instalar dependencias:

   ```bash
   npm install
   ```

4. Iniciar el entorno de desarrollo:

   ```bash
   npm run dev
   ```

### Producción

Para generar el instalador oficial (.exe):

```bash
npm run build
```

## 📁 Estructura del Proyecto

```text
app/
├── electron/          # Lógica del proceso principal (IPC, Filesystem, Render API)
├── src/               # Interfaz de usuario (React, i18n, Global Store)
│   ├── components/    # Componentes de UI (Inspector, Project Manager, Modales)
│   ├── remotion/      # Composiciones de video y PluginWrapper
│   └── engine/        # Núcleo del motor y Sandbox (Bridge, TagExtractor)
└── TECHNICAL.md       # Documentación técnica profunda del motor
```

## 📜 Licencia

MIT — ver el archivo [LICENSE](LICENSE) para más detalles.

© 2026 Jonatan Baron. All rights reserved.
