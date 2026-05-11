# Ember Motion Studio — Brand Identity

> Fuente de verdad para el naming, posicionamiento y herencia técnica del producto.  
> Versión aplicable desde: **v5.9.0**

---

## 1. El Nombre

### Nombre Comercial Oficial
```
Ember Motion Studio
```

| Componente | Origen | Significado |
|---|---|---|
| **Ember** | Design System "Obsidian & Ember" (`#E44C30`) | El acento cálido del sistema; la brasa viva que da vida al output |
| **Motion** | Lo que el producto produce | Gráficos en movimiento, frame-perfect, broadcast-grade |
| **Studio** | Lo que el producto es | Un espacio de trabajo, no un motor ni un plugin |

### Nombres Derivados

| Contexto | Forma | Ejemplo de uso |
|---|---|---|
| Casual / conversacional | **Ember** | "Lo hice en Ember" |
| Técnico / oficial | **Ember Motion Studio** | "Exportado desde Ember Motion Studio v6.0.0" |
| Sigla interna (no promover) | **EMS** | Solo para uso en código/configs internos |

> ⚠ **No promover EMS como marca.** El acrónimo está saturado (Electrical Muscle Stimulation, Emergency Medical Services). El producto se referencia siempre por su nombre completo o por "Ember".

---

## 2. Qué Reemplaza

**Ember Motion Studio** reemplaza el nombre comercial anterior:

```
DVGE — Dynamic Vector Graphics Engine
```

### Por qué se cambió

| Problema | Detalle |
|---|---|
| **Nombre genérico** | "Dynamic Vector Graphics Engine" describe una categoría, no un producto |
| **No buscable** | "DVGE" comparte espacio con acrónimos de ingeniería civil y geodesia |
| **Sin personalidad** | No evoca ninguna emoción ni comunidad |
| **Concepto equivocado** | Ya no es un "motor" — es un **estudio** con motores intercambiables |

---

## 3. DVGE como Nombre Técnico Heredado

**DVGE no desaparece. Se convierte en el nombre del engine interno.**

Este es el patrón de la industria:

| Producto (Brand) | Engine (Técnico) |
|---|---|
| Google Chrome | Chromium / Blink |
| DaVinci Resolve | Fusion Engine |
| Unreal Engine (juego X) | UE5 |
| **Ember Motion Studio** | **DVGE (Dynamic Vector Graphics Engine)** |

### Dónde vive DVGE técnicamente

```
Ember Motion Studio (la app, lo que ve el usuario)
└── Powered by DVGE (el engine interno)
    ├── dvEngine.register()       ← API de plugins
    ├── @dv-prop                  ← Sintaxis del Inspector
    ├── window.renderDVGE()       ← Entry point de renderizado
    ├── ctx.utils / ctx.timeline  ← Utilidades del runtime
    └── registry.json             ← Catálogo de plugins
```

### Frase oficial de referencia técnica

> *"Ember Motion Studio, powered by DVGE."*

---

## 4. Lo Que Da a Entender

### Para el usuario final (editor de video, productor broadcast)
> *"Es un estudio donde produzco mis gráficos broadcast, igual que uso DaVinci para editar."*

### Para el desarrollador / plugin author
> *"Es el recipiente que carga mi runtime de renderizado (Remotion, Hyperframes, etc.) y mis plugins de contenido."*

### Para la comunidad / mercado
> *"Es el primer broadcast graphics studio AI-native para Windows, con un ecosistema de plugins extensible."*

---

## 5. Arquitectura de Naming del Ecosistema

```
Ember Motion Studio          ← Producto (marca)
├── System Plugins           ← Runtimes de renderizado
│   ├── dvge-runtime-remotion    (default, v6)
│   ├── dvge-runtime-hyperframes (próximo)
│   └── dvge-runtime-[custom]    (endgame: framework propio)
└── Content Plugins          ← Plantillas del catálogo
    ├── template-lower-third
    ├── template-hero-horizons
    └── ... (registry.json)
```

Los plugins y el engine mantienen el prefijo `dvge-` / `dv-` para consistencia técnica, incluso bajo la nueva marca.

---

## 6. Conexión con el Design System

El design system **"Obsidian & Ember"** permanece inalterado.  
El nombre del producto **ya es coherente** con el sistema de diseño:

- `Obsidian` (`#050505` — `#000000`) → el fondo OLED base de la app
- `Ember` (`#E44C30`) → el acento principal → **el nombre del producto**

El nombre *emerge* del design system. No es una decisión arbitraria.

---

## 7. Guía de Uso de la Marca

### ✅ Correcto
- "Ember Motion Studio"
- "Ember" (casual)
- "Powered by DVGE"
- "dvEngine" (referencia técnica al core)

### ❌ Incorrecto
- "DVGE" como nombre comercial (hereda solo el rol técnico)
- "Dynamic Vector Graphics Engine" como nombre del producto
- "EMS" como nombre público
- "Ember Motion" sin "Studio" en contextos formales

---

## 8. Versión y Aplicación

| Campo | Valor |
|---|---|
| Nombre comercial activo desde | v6.0.0 |
| Nombre técnico (engine) | DVGE — Dynamic Vector Graphics Engine |
| Design System | Obsidian & Ember |
| Acento principal | `#E44C30` |
| Autor | Jonatan Barón |
| Fecha de decisión | 2026-05-01 |
