# Manual de Usuario: Dynamic Vector Graphics Engine (DVGE)

## Bienvenida

Dynamic Vector Graphics Engine (DVGE) es una herramienta de producción audiovisual diseñada para que editores, productores y realizadores puedan crear, personalizar y exportar gráficos de video de forma rápida y sin necesidad de conocimientos técnicos avanzados.

Con esta aplicación podrás crear bandas de texto, títulos y demás elementos visuales, ajustarlos en tiempo real, y exportarlos como video con canal Alfa (fondo transparente) para insertarlos directamente sobre tu material de video en el editor de tu preferencia.

---

## 1. El Flujo de Trabajo

El proceso completo de creación de un gráfico sigue tres pasos simples:

```
Crear Proyecto  →  Editar & Previsualizar  →  Exportar y Usar
```

Cada projeto queda guardado en tu computadora y puede retomarse en cualquier momento sin perder ningún ajuste.

---

## 2. Pantalla de Inicio y Gestión de Proyectos

Al abrir la aplicación, verás el **Panel de Inicio**, dividido en dos secciones:

### 2.1 Proyectos Recientes (panel izquierdo)

Aquí aparecerán todos los proyectos que hayas creado anteriormente. Cada tarjeta muestra el nombre del proyecto y la plantilla gráfica que utiliza. Basta con hacer clic en **"Abrir"** para retomar exactamente donde lo dejaste, con todos los textos y colores ya guardados.

### 2.2 Crear un Nuevo Proyecto (panel derecho)

Para comenzar un gráfico nuevo:
1. Escribe el nombre de tu nuevo proyecto en el campo de texto (ej: *"Entrevista - María López"*).
2. Selecciona la **plantilla gráfica** que deseas usar de la lista de plugins disponibles.
3. Haz clic en **"Crear Proyecto"**.

La aplicación generará automáticamente un espacio de trabajo dedicado para ese proyecto en tu computadora y abrirá el editor.

---

## 3. Editor y Previsualización en Tiempo Real

Una vez dentro de un proyecto, la pantalla se divide en dos áreas:

### 3.1 Panel de Propiedades (lado izquierdo)

Aquí encontrarás los campos editables del gráfico: textos, colores, imágenes y **código**. Estos campos son definidos por la plantilla gráfica que seleccionaste.

**A medida que escribas o modifiques cualquier valor, el gráfico en el reproductor se actualizará automáticamente en tiempo real.**

> [!TIP]
> **Edición de Código (v3.3)**: A partir de la versión 3.3.0, puedes usar la plantilla **HTML Master Renderer**. Encontrarás campos de "Código HTML" y "Código CSS" que son cajas de texto grandes (textarea). Esto te permite pegar bloques enteros de código y ver el resultado instantáneamente sin programar.

### 3.2 Autoguardado y Guardado Manual

La aplicación guarda automáticamente tus cambios por "Autoguardado Silencioso". Si deseas asegurar que el archivo se ha escrito físicamente en el disco en un momento específico, usa el botón **"💾 Guardar Proyecto"** ubicado en la parte inferior del panel lateral.

### 3.3 El Reproductor de Previsualización (lado derecho)

El reproductor muestra la animación del gráfico en tiempo real a máxima calidad. Puedes usar los controles de reproducción para ver la animación de entrada y salida del gráfico tal como aparecerá en el video final.

#### Botón "Actualizar Código"
Si realizaste cambios directamente en los archivos del plugin desde el explorador de archivos, usa este botón (esquina superior izquierda del reproductor) para que la aplicación recargue los archivos más recientes del plugin sin necesidad de reiniciar el programa.

---

## 4. Exportación del Gráfico

Cuando el gráfico esté listo para producción:

1. Haz clic en el botón **"Renderizar"** ubicado en el panel izquierdo.
2. La barra de progreso te indicará el avance del proceso. El renderizador procesa cada fotograma de la animación con la máxima fidelidad gráfica.
3. Una vez finalizado al 100%, aparecerá la zona de **exportación** con el archivo listo.

### 4.1 Zona de Exportación

Verás una tarjeta con el ícono del archivo exportado. Esta tarjeta es **arrastrable**:

- **Arrastra** directamente desde esa tarjeta hacia la línea de tiempo de tu software de edición de video.
- Haz clic en **"Abrir Carpeta del Proyecto"** para acceder al archivo mediante el explorador de archivos y copiarlo o moverlo a donde necesites.

El archivo generado es un video **.MOV en formato ProRes 4444 con canal Alfa** (fondo transparente), compatible con la mayoría de los editores de video profesionales. Solo debes colocarlo en una capa superior a tu video base y la transparencia funcionará automáticamente.

---

## 5. Sección de Ayuda (Menú Superior)

Desde el menú **Ayuda** en la barra superior de la aplicación encontrarás acceso a:

- **Documentación**: Esta ventana de ayuda con las guías disponibles.
- **Abrir Carpeta de Plugins**: Abre directamente en el explorador de archivos la carpeta donde se almacenan todas las plantillas gráficas instaladas. Útil para instalar un plugin nuevo.
