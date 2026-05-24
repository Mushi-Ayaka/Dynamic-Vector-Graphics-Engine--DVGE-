# @dvge/core

Headless, framework-agnostic dynamic vector graphics and deterministic animation engine.

---

## Overview

`@dvge/core` is a lightweight, high-performance runtime designed for running dynamic, vector-based visual plugins in a secure, mathematically deterministic environment. It provides a frame-accurate execution layer suitable for real-time design tools, video editors, and automated broadcast pipelines.

By decoupling animation logic from system CPU time, `@dvge/core` ensures that rendering a given frame $N$ always yields identical visual output across any platform, device, or rendering engine.

---

## Core Capabilities

* **Deterministic Animation Runtime**: Timeline calculations are purely algebraic. The animation state relies strictly on the current frame index, eliminating dependencies on `requestAnimationFrame`, `setTimeout`, or system clock drift.
* **Shadow DOM Sandboxing**: Runs user-provided scripts inside isolated Shadow Roots. The execution layer virtualizes standard global objects (`window`, `globalThis`) to prevent namespace pollution and style leakage.
* **Native Math & Physics**: Built-in math utilities for cubic bezier easing, spring physics (stiffness and damping), typewriter text effects, and continuous tickers.
* **Fluid Layout Support**: Native coordinate translation utilities (`remapX`, `remapY`) to support dynamic scaling for arbitrary canvas sizes or orientation switches.
* **Declarative Schemas**: Extends template parameters into structured property schemas to dynamically populate inspector UI panels in host applications.

---

## Installation

```bash
# Using pnpm
pnpm add @dvge/core

# Using npm
npm install @dvge/core

# Using yarn
yarn add @dvge/core
```

---

## Technical API Reference

The package exports three primary execution and utility primitives:

```typescript
import {
  dvUtils,
  executePluginSandbox,
  calculateTimeline
} from '@dvge/core';
```

### 1. `executePluginSandbox`

Compiles and executes raw JavaScript code inside a virtualized scope bound to an isolated Shadow Root.

```typescript
function executePluginSandbox(
  jsCode: string,
  context: DVContext,
  onRegister: (lifecycle: DVLifecycle) => void
): void
```

The execution layer intercepts standard global namespaces (`window`, `globalThis`, `process`, `require`) to enforce isolation. It evaluates the source code and hooks into the declared update lifecycle.

### 2. `calculateTimeline`

Calculates localized phase indicators for a specific frame index.

```typescript
function calculateTimeline(
  frame: number,
  fps: number,
  duration: number
): DVTimeline
```

Returns a `DVTimeline` object:

* `progress` (number, `0.0` to `1.0`): Total animation timeline progress.
* `isIntro` (boolean): Active during the default intro phase (first 0.8 seconds).
* `isOutro` (boolean): Active during the default outro phase (last 0.5 seconds).
* `introProgress` (number, `0.0` to `1.0`): Normalized progress of the intro phase.
* `outroProgress` (number, `0.0` to `1.0`): Normalized progress of the outro phase.

### 3. `dvUtils` (Math & Animation Suite)

Optimized mathematical utilities tailored for vector animation and typesetting:

| Method | Signature | Description |
| --- | --- | --- |
| `lerp` | `(a: number, b: number, t: number): number` | Linear interpolation. |
| `bezier` | `(curveParams: string \| number[], t: number): number` | Cubic bezier easing. |
| `clamp` | `(val: number, min: number, max: number): number` | Restricts a value within specified bounds. |
| `spring` | `(t: number, stiffness?: number, damping?: number): number` | Analytical spring physical movement. |
| `mapRange` | `(val, inMin, inMax, outMin, outMax): number` | Linearly maps a value from an input range to an output range. |
| `typewriter` | `(text: string, frame: number, framesPerChar?: number): string` | Returns a substring based on frame progress. |
| `tickerOffset` | `(frame: number, speed: number, textWidth: number): number` | Computes a seamless scrolling horizontal offset. |
| `loop` | `(frame: number, duration: number): number` | Returns the progression of a repeating loop. |
| `remapX` | `(x: number, designWidth: number, currentWidth: number): number` | Linearly scales a horizontal position relative to viewport width. |
| `remapY` | `(y: number, designHeight: number, currentHeight: number): number` | Linearly scales a vertical position relative to viewport height. |

---

## Integration Example

Below is a complete, minimal implementation of how a host application initializes `@dvge/core` inside a Shadow Root and renders a single frame:

```typescript
import { executePluginSandbox, dvUtils, calculateTimeline } from '@dvge/core';

// 1. Initialize canvas container and attach Shadow Root
const container = document.getElementById('canvas-container')!;
const shadowRoot = container.attachShadow({ mode: 'open' });

// 2. Build the execution context for frame 30 (1 second at 30 fps)
const frame = 30;
const fps = 30;
const duration = 150; // 5 seconds total duration

const context = {
  root: shadowRoot,
  frame: frame,
  props: {
    title: "Headless Engine",
    color: "#E44C30",
    slideDistance: 300
  },
  utils: dvUtils,
  timeline: calculateTimeline(frame, fps, duration),
  state: {}, // Volatile state cache persisted across renders
  refs: {},  // HTMLElement cache persisted across renders
  env: {
    isExporting: false,
    resolution: { width: 1920, height: 1080 },
    aspectRatio: 16 / 9,
    isPortrait: false
  },
  global: {} // Shared variables across multiple layers
};

// 3. Define the plugin source code (dynamic user script)
const pluginSource = `
  window.update = (frame, props, ctx) => {
    let element = ctx.root.getElementById('text-node');
    if (!element) {
      element = document.createElement('div');
      element.id = 'text-node';
      element.style.position = 'absolute';
      element.style.fontFamily = 'sans-serif';
      element.style.fontSize = '48px';
      ctx.root.appendChild(element);
    }

    // Spring entrance animation
    const springProgress = ctx.utils.spring(ctx.timeline.introProgress, 200, 20);
    const x = ctx.utils.lerp(-props.slideDistance, 50, springProgress);

    element.textContent = ctx.utils.typewriter(props.title, frame, 2);
    element.style.color = props.color;
    element.style.transform = \`translateX(\${x}px)\`;
  };
`;

// 4. Run the code in the sandbox environment
executePluginSandbox(pluginSource, context, (lifecycle) => {
  if (lifecycle.awake) lifecycle.awake(context);
  if (lifecycle.start) lifecycle.start(context);
  if (lifecycle.update) lifecycle.update(context);
});
```

---

## Quality & Specifications

`@dvge/core` is rigorously tested to ensure exact mathematical idempotence, isolated global scopes, and zero leakage of layout styles.

```bash
# Run unit and Property-Based Tests (PBT)
pnpm test
```

---

## License

MIT License. Copyright © 2026 Jonatan Baron. All rights reserved.
