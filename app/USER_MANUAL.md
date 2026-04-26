# Manual de Usuario: Dynamic Vector Graphics Engine v5.6.0 GA

## Bienvenida

Dynamic Vector Graphics Engine (DVGE) es una herramienta de producción audiovisual diseñada para que editores, productores y realizadores puedan crear, personalizar y exportar gráficos de video de forma rápida y sin conocimientos técnicos avanzados.

A partir de la versión **v5.6.0**, el motor introduce mejoras críticas de estabilidad en el renderizado y un sistema de gestión de proyectos simplificado desde la pantalla principal.

---

## 1. Flujo de Trabajo

```
Explorar Catálogo → Crear Proyecto → Exportar y Usar
```

---

## 2. Catálogo de Plugins

Amplía tu librería gráfica con un clic:

1. En la pantalla de inicio, haz clic en **Catálogo de Plugins**.
2. Explora la galería de gráficos disponibles en el repositorio oficial.
3. Haz clic en **Instalar** en el gráfico que quieras.
4. Una vez instalado, aparecerá en tu lista de plantillas al crear un nuevo proyecto.

> **Actualizaciones**: Si un plugin instalado recibe una mejora, el Catálogo mostrará un botón de **Actualizar**.

---

## 3. Pantalla de Inicio y Proyectos

### 3.1 Proyectos Recientes
Tus proyectos se guardan en **Documentos/DVG_Projects**. Haz clic en cualquier tarjeta para retomar tu trabajo.

### 3.2 Gestión de Proyectos (v5.6+)
Ahora puedes gestionar tus proyectos directamente desde la galería:
- **Renombrar**: Haz clic en el icono del **engranaje** de un proyecto para cambiar su nombre.
- **Eliminar**: Desde el mismo menú de ajustes, puedes eliminar proyectos que ya no necesites.
- **Abrir Carpeta**: El icono de la **carpeta** abre directamente la ubicación del proyecto en el Explorador de Archivos.

### 3.3 Control de Integridad
Si un proyecto depende de un plugin que ha sido eliminado o movido, aparecerá un aviso de **MISSING PLUGIN**. El motor impedirá la apertura del proyecto para evitar errores, indicándote exactamente qué plugin necesitas reinstalar.

### 3.4 Crear un Nuevo Proyecto
1. Escribe el nombre del proyecto.
2. Selecciona la plantilla gráfica.
3. Haz clic en **"Crear y Abrir"**.

---

## 4. Editor y Previsualización

### 4.1 Panel de Propiedades
Modifica textos, colores e imágenes. Los cambios se reflejan en tiempo real.

- **Branding**: Si la plantilla lo soporta, verás una sección de "Branding" para subir tu logo y elegir su posición.
- **Alineación**: Controla la posición global del gráfico sin tocar código.

### 4.2 Guardado Automático
El sistema de **Guardado Atómico** protege tu trabajo contra cierres inesperados. El indicador en la esquina inferior izquierda confirma cuando el archivo está seguro en disco.

---

## 5. Exportación Profesional

1. Haz clic en **Renderizar**.
2. El motor genera un video **ProRes 4444 con canal Alfa** (transparencia nativa).
3. **Drag & Drop**: Arrastra el archivo directamente desde la app hacia tu línea de tiempo en DaVinci Resolve, Premiere Pro o After Effects.

> **Estabilidad v5.6**: Se ha corregido un error crítico que causaba videos transparentes o congelados al exportar en sistemas Windows con alta carga de trabajo. El motor ahora garantiza la captura correcta del primer fotograma.

### 5.1 Transparencia en DaVinci Resolve
Si al importar el video ves un fondo negro, sigue estos pasos para activar el canal Alfa:
1. Haz clic derecho sobre el clip en el **Media Pool**.
2. Selecciona **"Clip Attributes"**.
3. En la pestaña Video, cambia **Alpha Mode** de "None" a **"Straight"** o **"Premultiplied"**.

---

## 6. Soporte

En el botón **Acerca de** de la pantalla de inicio encontrarás enlaces al portafolio del desarrollador, contacto por Gmail y el repositorio de código para reportar errores o solicitar funciones.
