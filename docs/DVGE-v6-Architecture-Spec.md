# DVGE — Especificación de Arquitectura v6.0 & Sprint v5.7

## Visión: "El Motor de Orquestación Gráfica Inteligente"

Este documento consolida la visión estratégica, las historias de usuario y los requerimientos técnicos para la evolución de DVGE hacia un IDE asistido por IA para gráficos broadcast profesionales.

---

## 1. VISIÓN ESTRATÉGICA (The Smart Pivot)

DVGE deja de ser un simple reproductor de plugins para convertirse en un **Ecosistema de Trabajo Contextual**. El motor ahora actúa como el "Traductor Maestro" entre los assets físicos del editor y la capacidad creativa de la IA.

### Objetivos Clave

* **Independencia de la IA para cambios menores**: El editor debe poder ajustar propiedades directamente en el motor sin reiniciar el ciclo con la IA.
* **Mantenimiento de Trayectoria**: Cada decisión técnica debe proteger la calidad de los píxeles y la estabilidad del layout (Protocolo Responsivo v6.7).
* **Monetización PRO**: El valor del plan PRO reside en la capacidad del motor de automatizar reglas complejas y ofrecer herramientas de sistema exclusivas.

---

## 2. HISTORIAS DE USUARIO (HU)

### HU-01: Quick Image Cropping & Reference Injection

> **Como** Editor de video profesional.
> **Quiero** poder realizar recortes rápidos a una imagen directamente en el motor y que estos recortes se guarden como "Referencias" independientes.
> **Para** poder separar elementos de una sola foto (ej: Logo, Textura, Icono) y darles esas referencias a la IA para que las anime como capas profesionales e independientes.

**Requerimientos HU-01:**

* Herramienta de recorte (Cropper) nativa integrada en el flujo de selección de medios.
* Sistema de alias/referencias: `img_ref_01`, `img_ref_01_crop_a`, etc.
* Inyección automática: Los recortes deben aparecer como variables disponibles en `ctx.props`.

### HU-02: Automated Engine-AI Synergy (Knowledge Bridge PRO)

> **Como** Usuario del Plan PRO.
> **Quiero** que el motor genere un PDF de reglas que incluya no solo la API, sino todo el contexto de mi proyecto actual (assets disponibles, herramientas instaladas, artefactos).
> **Para** que la IA genere código 100% compatible y optimizado para usar los recursos específicos de mi espacio de trabajo actual con una sintaxis simplificada.

**Requerimientos HU-02:**

* Generador de PDF modular con secciones dinámicas.
* Sintaxis de "Custom Elements" (ej: `<dvge-text>`, `<dvge-image>`) para simplificar la demanda de código a la IA.
* Mapeo de Workspace: El PDF debe explicar qué hace cada panel abierto.

---

## 3. EL NUEVO "PANEL DE REFERENCIAS" (Inspector v2.0)

Este panel sustituye al antiguo inspector estático por uno dinámico y jerárquico.

### Tipos de Campos Soportados

1. **Títulos Formateados**: Soporte para estilos de texto avanzados.
2. **Color & Branding**: Paletas de colores ligadas al sistema de diseño.
3. **Imagen & Recorte**: Selector de archivos con disparador de herramienta de crop.
4. **Artefactos de Sistema**:
    * **JSON/CSV**: Inyección de datos masivos para automatización.
    * **TXT/MD**: Referencias a guiones o notas de producción.
5. **3D Models (Futuro)**: Espacio reservado para referencias a archivos GLB/OBJ.

---

## 4. MODULARIDAD DEL PDF (Contextual AI Bridge)

El PDF de Knowledge Bridge se dividirá en tres grandes secciones de conocimiento:

| Sección | Contenido |
| :--- | :--- |
| **SISTEMA** | API oficial, sintaxis de Custom Elements, comandos nativos y reglas de sandbox. |
| **TEMPLATE** | Metadatos de la plantilla actual, variables de animación disponibles y duración. |
| **WORKSPACE** | Lista de artefactos cargados, recortes de imagen activos, herramientas de sistema instaladas y descripción de paneles abiertos. |

---

## 5. TAXONOMÍA DE COMPONENTES (v6.x)

Se oficializa la separación de responsabilidades para evitar la confusión del término "plugin":

* **Plantillas (Templates)**: El "Lienzo Final". Código renderizable que produce el video ProRes.
* **Herramientas (Tools)**: Funcionalidades del sistema (ej: El Recortador, El Inyector de CSV). Pueden vivir en ventanas independientes o paneles.
* **Efectos / Extensiones**: Módulos de lógica (CSS/JS) que pueden aplicarse a las plantillas para añadir comportamientos (ej: Efecto de partículas, Filtros de color).

---

## 6. MOTORES DE ANIMACIÓN & DETERMINISMO (v6.x)

Para garantizar el estándar broadcast (frames idénticos), el motor implementa un sistema de control sobre librerías externas.

### A. Matriz de Compatibilidad Exclusiva

* **Contrato de Proyecto**: Cada proyecto debe declarar un motor de animación primario (ej: GSAP, Anime.js, Framer Motion).
* **Aislamiento**: Solo se inyecta el Plugin de Sistema correspondiente para evitar colisiones de tiempo y exceso de carga en el bundle.

### B. Protocolo de Verificación "Dictador"

* **Hard Reset Snapshot**: Antes de cada frame, el motor tiene la capacidad de limpiar las mutaciones de estilo inline en el DOM para evitar la "Inercia de Estado" (Memory Effect).
* **Verify & Re-render**: Si un motor de animación no devuelve el estado visual exacto para el timestamp de Remotion, el motor descarta el frame y fuerza un re-intento de construcción.
* **Whitelist de Funciones**: El PDF de reglas prohibirá funciones que rompan el Sandbox (ej: ScrollTrigger o accesos directos al `document.body`).

---

## 7. VENTANA DE RENDER PRO (Control de Calidad)

Separación física de la edición y la exportación para garantizar estabilidad absoluta.

### Funcionalidades del Puesto de Control

* **Modo Dictador (Toggle)**: Activa la verificación frame-a-frame con limpieza de estado. Incluye advertencia de consumo elevado de recursos.
* **Pre-flight Check**: Validación de Assets (Crops de HU-01), Fuentes y Conexiones de Datos antes de iniciar el proceso.
* **Background Processing**: La exportación no bloquea la UI del Studio.

---

## 8. TELEMETRY & HEALTH HUB (Validación de Producto)
Para justificar la inversión y asegurar el crecimiento, el motor debe recolectar datos de uso y rendimiento de forma profesional y ética.

### A. Pilares de Recolección:
* **Estabilidad (Crash Reporting)**: Captura automática de errores críticos y stack traces para resolver fallos antes de que afecten a la masa crítica.
* **Rendimiento (Performance)**: Monitoreo de consumo de recursos (CPU, RAM, GPU) para asegurar fluidez en el mayor rango de hardware posible.
* **Adopción y Negocio**: Seguimiento de métricas de retención (DAU/MAU) y uso de funcionalidades clave para identificar el valor real del producto.

### B. Privacidad y Ética:
* **Anonimización**: Los datos se asocian a un `machine_id` anónimo, nunca a datos personales sin consentimiento explícito.
* **Opt-in/Opt-out**: Panel de configuración para que el usuario decida qué nivel de diagnóstico desea compartir.

---

## 9. ROADMAP DE IMPLEMENTACIÓN (Sprint v5.7)

### Fase 1: Estabilización, Base & Datos (Actual)
* ✅ Protocolo de Posicionamiento Responsivo (v6.7.3).
* ✅ Auditoría de Calidad de Píxeles.
* 🔲 **Telemetry Hub Initial**: Implementación del "Ping" de identidad y salud básica de la aplicación.
* 🔲 **Refactor del Inspector**: Implementación de "Campos Personalizados" y lógica de inyección de props dinámica.
* 🔲 **References Panel**: Estructura base para el banco de assets (referencias de logos, json, md).

### Fase 2: Herramientas Nativa
* 🔲 **Image Cropper**: Prototipo de la herramienta de recorte integrada en el flujo de assets.
* 🔲 **Sistema de Alias**: Lógica para generar `ref_crop_a` desde una sola fuente física.

### Fase 3: Knowledge Bridge Modular
* 🔲 **PDF Contextual**: Generación de secciones (Sistema, Template, Workspace).
* 🔲 **Sintaxis v6**: Implementación de Custom Elements (`<dvge-text>`) para simplificar la demanda a la IA.

---
**Documento Generado por**: Antigravity (Senior AI Architect)
**Fecha**: 2026-04-28
**Estado**: Sprint v5.7 Activado - Visión de Grado Broadcast & Business Ready
