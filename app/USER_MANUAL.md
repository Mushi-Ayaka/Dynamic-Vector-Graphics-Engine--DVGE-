# Manual de Usuario: Ember Motion Studio v5.9.0

## El Flujo de Trabajo en 5 Pasos

Ember v5.9.0 introduce un flujo de trabajo optimizado para garantizar resultados profesionales al primer intento:

1. **Configuración del Canvas**: Define las dimensiones, duración y FPS de tu proyecto.
2. **Gestión de Artefactos**: Inyecta imágenes, videos o bases de datos (Excel/CSV). Es crucial añadir títulos y descripciones detalladas; esta es la información que la IA usará para entender cómo manipular cada recurso.
3. **AI Context Builder**: Genera el manual de reglas técnico (PDF) y arrástralo a tu chat de IA favorito (Claude, GPT o **DeepSeek en Modo Experto**).
4. **Refinamiento Visual**: Una vez generado el código, ajusta los valores en el **Inspector** en tiempo real para pulir los detalles estéticos.
5. **Exportación e Iteración**: Renderiza tu video final o regresa al Builder para incluir el código actual y solicitar modificaciones a la IA.

---

## 1. El Catálogo de Plugins

Amplía tu biblioteca de gráficos con un solo clic:

- Accede al **Catálogo de Plugins** desde la pantalla de inicio.
- Instala o actualiza plantillas.
- Los plugins instalados aparecerán automáticamente en tu lista de plantillas de proyecto.

---

## 2. El Studio (Interfaz de Trabajo)

### 2.1 AI Context Builder (Smart Knowledge)

Localizado en la parte inferior del panel de control. Te permite "enseñar" a la IA sobre tu proyecto actual. Puedes elegir inyectar el contexto de tus artefactos, dimensiones o incluso el código actual.

### 2.2 Inspector

Permite ajustar parámetros del proyecto actual.

### 2.3 Recordatorios Inteligentes (Smart Tips)

Si eres nuevo, verás un recordatorio sobre la **Guía Rápida**. Este aviso se vuelve transparente al pasar el cursor para no estorbar tu visión mientras trabajas.

---

## 3. Exportación Broadcast

El motor de renderizado **Ember** exporta archivos de alta fidelidad:

- **ProRes 4444**: Máxima calidad con transparencia real para broadcast.
- **H.264 / MP4**: Ideal para redes sociales (sin transparencia).
- **GIF**: Para previsualizaciones rápidas y stickers.

:::tip[Tip para DaVinci Resolve]
Si el video ProRes aparece con fondo negro: Clic derecho sobre el clip -> **Clip Attributes** -> **Alpha Mode** -> **Straight**.
:::
