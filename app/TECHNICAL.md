# Documentación Técnica: Ember Motion Studio v5.8

## Introducción

El **Ember Motion Studio v5.8** es un entorno de producción audiovisual impulsado por el motor **DVGE**, diseñado para la creación, previsualización y exportación de gráficos broadcast. Su núcleo está optimizado para generar archivos de video con transparencia nativa (canal Alfa) listos para flujos de trabajo profesionales en cine y televisión.

---

## 1. Arquitectura del Motor

El sistema utiliza un modelo de ejecución distribuido que garantiza el determinismo visual y la estabilidad del sistema host.

### 1.1 Núcleo de Ejecución

El motor separa la interfaz de usuario de la lógica de renderizado pesado. Esto permite previsualizaciones fluidas a 60fps mientras el backend gestiona la persistencia de datos y la codificación de video en segundo plano.

### 1.2 Aislamiento y Renderizado (v5.8)

- **Cápsula de Estilos**: Los plugins operan en entornos aislados para evitar conflictos visuales con el Studio.
- **Determinismo**: El motor controla el reloj de animación fotograma a fotograma, asegurando que la previsualización sea idéntica al video exportado bit a bit.

---

## 2. Gestión de Proyectos

Cada producción se encapsula en un directorio independiente dentro de la carpeta de usuario.

### 2.1 Persistencia Atómica

El motor implementa un sistema de guardado resiliente: los cambios se validan antes de escribirse y se utiliza un flujo de escritura temporal para prevenir la corrupción de archivos en caso de fallos del sistema.

---

## 3. Sistema de Plugins v5 (Master)

### 3.1 Estructura del Plugin

Cada gráfico es una extensión del motor compuesta por:

- `manifest.json`: Definición de la interfaz y metadatos.
- `index.html`, `style.css`, `script.js`: Los componentes lógicos y visuales del gráfico.

### 3.2 Ciclo de Vida del Gráfico

La API del motor proporciona ganchos de ejecución para el control total de la animación:

- `awake`: Configuración inicial.
- `start`: Disparadores de inicio.
- `update`: Lógica reactiva fotograma a fotograma.

---

## 4. Tubería de Exportación (Master Mode)

### 4.1 Transparency Transformer

El motor de exportación aplica inyección directa para asegurar que los niveles de transparencia sean perfectos para broadcast, eliminando artefactos en los bordes y garantizando negros puros donde no hay gráfico.

### 4.2 Codificación Profesional

El sistema codifica la salida en **Apple ProRes 4444** (10-bit con soporte Alfa), el estándar de la industria para gráficos de video de alta calidad.

---

## 5. Preparación para v6 (Roadmap Técnico)

El motor está evolucionando hacia un modelo de **Extensiones Modulares**, donde la jerarquía de herramientas y efectos será totalmente personalizable, eliminando las restricciones de los plugins estáticos actuales.
