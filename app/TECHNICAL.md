# Documentación Técnica: Ember Motion Studio v5.9.0

## Introducción

El **Ember Motion Studio v5.9.0** es un entorno de producción impulsado por el motor **DVGE**. Su arquitectura está diseñada para la orquestación de gráficos broadcast asistidos por IA, garantizando un renderizado de alta fidelidad con transparencia nativa.

---

## 1. Arquitectura de Orquestación

El sistema utiliza un modelo de ejecución dual (Main y Renderer) que separa la lógica de interfaz del procesamiento de video pesado.

### 1.1 AI Context Builder (Knowledge Bridge)

Es el componente central de la v5.9.0. El motor genera dinámicamente un manual técnico (PDF) que contiene:

- El esquema de la API de DVGE.
- La descripción de los artefactos de usuario.
- El contexto técnico del proyecto (Dimensiones, Duración, FPS).
- El código fuente actual para iteraciones incrementales.

### 1.2 Determinismo Visual

El motor controla el reloj de animación fotograma a fotograma (frame-by-frame clock control). Esto asegura que la previsualización en el Studio sea idéntica al video exportado, garantizando la consistencia del bit-rate y el timing.

---

## 2. Gestión de Artefactos y Datos

### 2.1 Artifact Linking

El sistema de propiedades (Inspector) se ha rediseñado para permitir la vinculación dinámica con los artefactos de la galería. El motor resuelve las referencias a assets locales y las inyecta en el contexto del plugin de forma segura.

### 2.2 Seguridad (Sandbox Shadow DOM)

Cada plugin se ejecuta dentro de un **Shadow Root** aislado con un proxy `fakeWindow`. Esto previene colisiones de estilos CSS y asegura que el código generado por la IA no tenga acceso a APIs críticas del sistema host.

---

## 3. Tubería de Exportación

### 3.1 Transparency Transformer

Aplica inyecciones de estilo a nivel de motor antes de cada captura de cuadro para asegurar una transparencia "Straight" perfecta, eliminando cualquier halo o artefacto en los bordes del gráfico.

### 3.2 Formatos Soportados

- **Apple ProRes 4444**: Estándar broadcast de 10 bits con canal Alfa.
- **H.264 (MP4)**: Codificación optimizada para web.
- **WebM / GIF / PNG Sequence**: Formatos versátiles para integraciones digitales.

---

## 4. Evolución hacia v6.0

El motor v5.9.0 sirve como base estable para la transición a un modelo de **Extensiones Modulares**, donde las herramientas del Studio (como el cropper o los editores de datos) serán componentes desacoplados y ampliables.
