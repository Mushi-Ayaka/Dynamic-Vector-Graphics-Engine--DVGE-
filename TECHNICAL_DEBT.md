# Deuda Técnica y Mejoras Futuras (DVGE)

Este documento registra las áreas del motor que requieren atención o expansión para mantener el estándar de calidad v4.0.

## 1. Arquitectura de Plugins
- [ ] **Migración Masiva:** Aún existen plugins en el repositorio que dependen de GSAP (v3.x). Deben ser refactorizados a la API `ctx.timeline` para ser compatibles con el renderizado determinístico.
- [ ] **Validación de Manifiesto:** El `plugin-manager` sanitiza el schema, pero no valida tipos de datos complejos en el `defaultValue`.

## 2. Rendimiento (UX)
- [ ] **Bundle Size:** El bundle de Vite supera los 500kB. Se requiere implementar `manualChunks` para separar el core de Remotion del resto de la interfaz.
- [ ] **Worker Thread Rendering:** Mover la lógica de parseo de plugins a un Web Worker para liberar el hilo de UI de React durante la carga inicial de muchos plugins.

## 3. Seguridad
- [ ] **Content Security Policy (CSP):** Implementar headers restrictivos en el proceso de Electron para evitar la carga de scripts remotos no declarados en el manifiesto.
- [ ] **Auditoría de Dependencias:** Integrar un paso de `npm audit` en el proceso de build (QA-Gate).

## 4. Funcionalidades Pendientes (Roadmap Pro)
- [ ] **Native Drag & Drop:** Arrastrar archivos de video directamente desde el motor al timeline de DaVinci Resolve.
- [ ] **Integración de API de Resolve:** Automatizar la importación de medios mediante el script `Workflow Integration`.
