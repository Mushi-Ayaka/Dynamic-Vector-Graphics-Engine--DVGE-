# Soporte Técnico de Archivos - Panel de Artefactos (v5.8.0)

Este documento detalla los tipos de archivos soportados, su tratamiento automático y las restricciones vigentes en el panel de **Artefactos** de Ember Motion Studio.

## 1. Clasificación Automática (vuelo)

El motor utiliza una lógica de detección por extensión para asignar el tipo de artefacto más adecuado al momento de importar (drag & drop o selector).

| Categoría | Extensiones Soportadas | Tipo de Artefacto | Funcionalidades Especiales |
| :--- | :--- | :--- | :--- |
| **Imágenes** | `.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.svg` | `image` | Previsualización real, Modal de Recorte nativo. |
| **Videos** | `.mp4`, `.webm`, `.mov`, `.mkv` | `video` | Indexación en assets, icono de video dedicado. |
| **Datos / Texto** | `.json`, `.csv`, `.txt`, `.md` | `file` | Lectura UTF-8, aviso de rendimiento por peso (>512KB). |
| **Otros** | Cualquier otra extensión no bloqueada | `file` | Almacenamiento en carpeta de assets del proyecto. |

## 2. Restricciones y Bloqueos

### 🚫 Audio (Deshabilitado)

Por diseño técnico en la versión actual (v5.8.0), el estudio no procesa pistas de audio de forma independiente para evitar desincronización en el motor de renderizado.

* **Extensiones bloqueadas:** `.mp3`, `.wav`, `.ogg`, `.m4a`, `.flac`.
* **Comportamiento:** El motor rechazará estos archivos con una notificación de error al intentar arrastrarlos o importarlos.

## 3. Comportamiento del Drag & Drop

El panel de Artefactos es sensible al contexto de lo que se suelta:

* **Archivos únicos:** Se copian al proyecto, se indexan y se crea un artefacto inmediato en la lista.
* **Múltiples archivos:** Se copian todos a la carpeta de assets y el panel cambia automáticamente al **Explorador de Assets** para su gestión manual.
* **Texto seleccionado:**
  * Si el texto es numérico, crea un artefacto `number`.
  * Si es texto general, crea un artefacto `string`.

## 4. Límites de Rendimiento

* **Imágenes:** Se recomienda no exceder los 4K (3840px) para mantener la fluidez del editor.
* **Archivos de Datos:** Archivos mayores a **512 KB** mostrarán una advertencia naranja en el inspector indicando posible impacto en el rendimiento de previsualización.

---

### Ember Motion Studio - Engine Technical Specs
