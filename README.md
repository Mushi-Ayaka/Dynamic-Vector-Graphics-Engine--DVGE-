# Ember Motion Studio v5.9.0

[![Sitio Oficial](https://img.shields.io/badge/Sitio-Ember_Motion_Studio-E44C30?style=for-the-badge)](https://ember-motion-studio-landing.vercel.app/)

**Ember Motion Studio** es un software de escritorio de alto rendimiento diseñado para gráficos o animaciones profesionales. Construido con React, Electron y Remotion, permite a los productores y editores crear, personalizar y exportar gráficos dinámicos (lower thirds, títulos, callouts) con retroalimentación en tiempo real y soporte nativo para ProRes 4444 + Alpha.

> [!IMPORTANT]
> **Estado del Proyecto**: Ember Motion Studio es actualmente un proyecto **Open Source** libre y gratuito bajo la **MIT License**, mantenido por un único desarrollador independiente.
> 
> **Advertencia de Windows SmartScreen**: Debido a los elevados costes de los Certificados de Firma de Código EV ($300 - $500 USD anuales) y requisitos corporativos, nuestros ejecutables no están firmados digitalmente. Sin embargo, priorizamos la transparencia absoluta: nuestro código fuente es 100% auditable públicamente en GitHub. Para instalar con total tranquilidad, haz clic en **"Más información"** en la advertencia azul de Windows y selecciona **"Ejecutar de todos modos"**.

## ✨ Key Features (v5.9.0)

- **Studio Master Core**: Integración nativa de proyectos en blanco. Programa desde cero sin dependencias externas, utilizando el motor como un lienzo en blanco profesional de alto rendimiento.
- **Dynamic Inspector v2**: Extracción automática y dinámica de propiedades a partir de comentarios `/* @dv-prop */` en tu código fuente. Soporta inputs complejos como `alignment`, `slider`, `easing` e `icon` sincronizados al instante.
- **Transparency Transformer**: Motor de estabilidad avanzado para exportaciones ProRes 4444. Garantiza una captura del canal Alpha matemáticamente perfecta desde el fotograma cero.
- **Flujo Vibe Motion (Knowledge Bridge)**: Diseña de forma ultra-rápida definiendo la dirección artística y exportando las propiedades de tu lienzo a un PDF estructurado. Este documento entrena perfectamente a modelos de IA externos (como Claude 3.5 Sonnet) para que generen código Javascript compatible que solo tienes que pegar de vuelta en el canvas.
- **Bilingual Interface**: Soporte total de localización en Inglés y Español, sincronizado a través de un sistema de traducción dinámica en toda la aplicación.
- **Atomic Async I/O**: Sistema de guardado y persistencia de proyectos inmune a corrupciones de archivos mediante escrituras transaccionales atómicas en disco.

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
