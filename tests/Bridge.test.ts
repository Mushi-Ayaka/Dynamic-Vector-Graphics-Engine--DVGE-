import { describe, it, expect } from 'vitest';
import { dvUtils, calculateTimeline } from '../src/Bridge';

// ============================================================
// [PBT] Invarianza Matemática — ctx.utils
// Propiedad: funciones puras, mismo input => mismo output siempre.
// ============================================================

describe('dvUtils — Invarianza Matemática (PBT)', () => {

  describe('lerp', () => {
    it('lerp(a, b, 0) siempre == a', () => {
      const cases = [[0, 100], [50, 200], [-10, 10], [1.5, 3.7]];
      for (const [a, b] of cases) {
        expect(dvUtils.lerp(a, b, 0)).toBeCloseTo(a, 10);
      }
    });

    it('lerp(a, b, 1) siempre == b', () => {
      const cases = [[0, 100], [50, 200], [-10, 10], [1.5, 3.7]];
      for (const [a, b] of cases) {
        expect(dvUtils.lerp(a, b, 1)).toBeCloseTo(b, 10);
      }
    });

    it('lerp(a, b, 0.5) es el punto medio exacto', () => {
      expect(dvUtils.lerp(0, 100, 0.5)).toBeCloseTo(50, 10);
      expect(dvUtils.lerp(10, 20, 0.5)).toBeCloseTo(15, 10);
    });

    it('determinista: mismos inputs producen el mismo output', () => {
      const result1 = dvUtils.lerp(10, 90, 0.3);
      const result2 = dvUtils.lerp(10, 90, 0.3);
      expect(result1).toBe(result2);
    });
  });

  describe('clamp', () => {
    it('valores dentro del rango no cambian', () => {
      expect(dvUtils.clamp(5, 0, 10)).toBe(5);
      expect(dvUtils.clamp(0, 0, 10)).toBe(0);
      expect(dvUtils.clamp(10, 0, 10)).toBe(10);
    });

    it('valores fuera del rango quedan en el límite', () => {
      expect(dvUtils.clamp(-5, 0, 10)).toBe(0);
      expect(dvUtils.clamp(15, 0, 10)).toBe(10);
    });

    it('idempotente: clamp(clamp(x)) == clamp(x)', () => {
      const values = [-100, -1, 0, 0.5, 1, 2, 100];
      for (const v of values) {
        const once = dvUtils.clamp(v, 0, 1);
        const twice = dvUtils.clamp(once, 0, 1);
        expect(twice).toBe(once);
      }
    });
  });

  describe('mapRange', () => {
    it('mapRange correcto en extremos', () => {
      expect(dvUtils.mapRange(0, 0, 100, 0, 1)).toBeCloseTo(0, 10);
      expect(dvUtils.mapRange(100, 0, 100, 0, 1)).toBeCloseTo(1, 10);
    });

    it('mapRange es lineal en el interior', () => {
      expect(dvUtils.mapRange(50, 0, 100, 0, 1)).toBeCloseTo(0.5, 10);
    });

    it('mapRange con inMin == inMax devuelve outMin', () => {
      expect(dvUtils.mapRange(50, 50, 50, 0, 10)).toBe(0);
    });
  });

  describe('easeOutCubic', () => {
    it('f(0) == 0 y f(1) == 1', () => {
      expect(dvUtils.easeOutCubic(0)).toBeCloseTo(0, 10);
      expect(dvUtils.easeOutCubic(1)).toBeCloseTo(1, 10);
    });

    it('salida siempre dentro de [0,1] para inputs dentro de [0,1]', () => {
      for (let t = 0; t <= 1; t += 0.05) {
        const result = dvUtils.easeOutCubic(t);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(1);
      }
    });

    it('es monótonamente creciente', () => {
      let prev = -1;
      for (let t = 0; t <= 1; t += 0.05) {
        const curr = dvUtils.easeOutCubic(t);
        expect(curr).toBeGreaterThanOrEqual(prev);
        prev = curr;
      }
    });
  });

  describe('spring', () => {
    it('spring(0) == 0 y spring(1) == 1', () => {
      expect(dvUtils.spring(0)).toBe(0);
      expect(dvUtils.spring(1)).toBe(1);
    });

    it('determinista para los mismos parámetros', () => {
      const r1 = dvUtils.spring(0.5, 150, 15);
      const r2 = dvUtils.spring(0.5, 150, 15);
      expect(r1).toBe(r2);
    });
  });

  describe('hexToRgb', () => {
    it('convierte correctamente #FF0000 a rojo', () => {
      expect(dvUtils.hexToRgb('#FF0000')).toBe('255, 0, 0');
    });

    it('devuelve null para hex inválido', () => {
      expect(dvUtils.hexToRgb('not-a-color')).toBeNull();
    });

    it('funciona sin #', () => {
      expect(dvUtils.hexToRgb('00FF00')).toBe('0, 255, 0');
    });
  });

  describe('typewriter', () => {
    it('devuelve cadena vacía en frame 0', () => {
      expect(dvUtils.typewriter('Hello', 0)).toBe('');
    });

    it('devuelve el texto completo cuando frame es suficientemente grande', () => {
      expect(dvUtils.typewriter('Hello', 100)).toBe('Hello');
    });

    it('es determinista: mismo frame => mismo resultado', () => {
      expect(dvUtils.typewriter('World', 10, 2)).toBe(dvUtils.typewriter('World', 10, 2));
    });
  });

  describe('loop', () => {
    it('loop(0, N) == 0', () => {
      expect(dvUtils.loop(0, 30)).toBe(0);
    });

    it('el output siempre está en [0, 1)', () => {
      for (let f = 0; f < 300; f++) {
        const result = dvUtils.loop(f, 30);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThan(1);
      }
    });
  });
});

// ============================================================
// [PBT] calculateTimeline — Invarianzas Temporales
// ============================================================

describe('calculateTimeline (PBT)', () => {
  const FPS = 30;
  const DURATION = 90; // 3 segundos

  it('progress == 0 en frame 0', () => {
    const tl = calculateTimeline(0, FPS, DURATION);
    expect(tl.progress).toBe(0);
  });

  it('progress == 1 en el último frame', () => {
    const tl = calculateTimeline(DURATION, FPS, DURATION);
    expect(tl.progress).toBe(1);
  });

  it('isIntro == true al inicio', () => {
    const tl = calculateTimeline(0, FPS, DURATION);
    expect(tl.isIntro).toBe(true);
  });

  it('isOutro == false al inicio', () => {
    const tl = calculateTimeline(0, FPS, DURATION);
    expect(tl.isOutro).toBe(false);
  });

  it('isOutro == true cerca del final', () => {
    const tl = calculateTimeline(DURATION - 1, FPS, DURATION);
    expect(tl.isOutro).toBe(true);
  });

  it('introProgress siempre en [0, 1]', () => {
    for (let f = 0; f <= DURATION; f++) {
      const { introProgress } = calculateTimeline(f, FPS, DURATION);
      expect(introProgress).toBeGreaterThanOrEqual(0);
      expect(introProgress).toBeLessThanOrEqual(1);
    }
  });

  it('outroProgress siempre en [0, 1]', () => {
    for (let f = 0; f <= DURATION; f++) {
      const { outroProgress } = calculateTimeline(f, FPS, DURATION);
      expect(outroProgress).toBeGreaterThanOrEqual(0);
      expect(outroProgress).toBeLessThanOrEqual(1);
    }
  });

  it('no divide por cero cuando duration == 0', () => {
    const tl = calculateTimeline(0, FPS, 0);
    expect(tl.progress).toBe(0);
  });
});
