import { describe, it, expect } from 'vitest';
import { DVGE_MASTER_RULES } from '../src/Rules';
import type { DVGEManifest, FormField } from '../src/types';

// ============================================================
// [PBT] Round-trip del Manifest — Integridad de Tipos
// Propiedad: Un manifest válido debe sobrevivir a una serialización
// JSON y mantener sus tipos estructurales.
// ============================================================

const buildValidField = (overrides: Partial<FormField> = {}): FormField => ({
  type: 'string',
  id: 'testField',
  label: 'Test Label',
  defaultValue: 'hello',
  ...overrides,
});

const buildValidManifest = (overrides: Partial<DVGEManifest> = {}): DVGEManifest => ({
  id: 'test-template',
  name: 'Test Template',
  description: 'A test template',
  version: '1.0.0',
  type: 'template',
  schema: [buildValidField()],
  ...overrides,
});

describe('DVGEManifest — Round-trip & Invarianzas Estructurales (PBT)', () => {

  it('un manifest válido sobrevive JSON.stringify + JSON.parse sin mutación', () => {
    const original = buildValidManifest();
    const serialized = JSON.stringify(original);
    const restored = JSON.parse(serialized) as DVGEManifest;

    expect(restored.id).toBe(original.id);
    expect(restored.name).toBe(original.name);
    expect(restored.version).toBe(original.version);
    expect(restored.type).toBe(original.type);
    expect(restored.schema).toHaveLength(original.schema.length);
  });

  it('schema siempre es un array (invariante de colección)', () => {
    const manifests = [
      buildValidManifest({ schema: [] }),
      buildValidManifest({ schema: [buildValidField()] }),
      buildValidManifest({
        schema: [
          buildValidField({ id: 'f1', type: 'color' }),
          buildValidField({ id: 'f2', type: 'number' }),
          buildValidField({ id: 'f3', type: 'boolean' }),
        ]
      }),
    ];
    for (const m of manifests) {
      expect(Array.isArray(m.schema)).toBe(true);
    }
  });

  it('FormField conserva defaultValue de tipo string después de round-trip', () => {
    const field = buildValidField({ defaultValue: 'value_test' });
    const rt = JSON.parse(JSON.stringify(field)) as FormField;
    expect(typeof rt.defaultValue).toBe('string');
    expect(rt.defaultValue).toBe('value_test');
  });

  it('FormField conserva defaultValue de tipo number después de round-trip', () => {
    const field = buildValidField({ type: 'number', defaultValue: 42 });
    const rt = JSON.parse(JSON.stringify(field)) as FormField;
    expect(typeof rt.defaultValue).toBe('number');
    expect(rt.defaultValue).toBe(42);
  });

  it('FormField conserva defaultValue de tipo boolean después de round-trip', () => {
    const field = buildValidField({ type: 'boolean', defaultValue: false });
    const rt = JSON.parse(JSON.stringify(field)) as FormField;
    expect(typeof rt.defaultValue).toBe('boolean');
    expect(rt.defaultValue).toBe(false);
  });

  it('campos opcionales son omitidos limpiamente (no undefined serializado)', () => {
    const field = buildValidField(); // sin description, group, options
    const serialized = JSON.stringify(field);
    expect(serialized).not.toContain('"description":undefined');
    expect(serialized).not.toContain('"group":undefined');
  });

  it('manifest con externalScripts mantiene el array intacto', () => {
    const urls = ['https://cdn.example.com/lib.js', 'https://cdn.other.com/tool.js'];
    const m = buildValidManifest({ externalScripts: urls });
    const rt = JSON.parse(JSON.stringify(m)) as DVGEManifest;
    expect(rt.externalScripts).toEqual(urls);
  });

  it('manifest sin campos opcionales sigue siendo válido estructuralmente', () => {
    const minimal = buildValidManifest();
    expect(minimal.id).toBeTruthy();
    expect(minimal.name).toBeTruthy();
    expect(minimal.schema).toBeDefined();
    expect(minimal.type).toBeDefined();
  });
});

// ============================================================
// DVGE_MASTER_RULES — Invarianzas del Contrato de IA
// ============================================================

describe('DVGE_MASTER_RULES — Invarianzas del Contenido', () => {
  it('es un string no vacío', () => {
    expect(typeof DVGE_MASTER_RULES).toBe('string');
    expect(DVGE_MASTER_RULES.length).toBeGreaterThan(100);
  });

  it('contiene referencia al Shadow DOM (contrato fundamental)', () => {
    expect(DVGE_MASTER_RULES).toContain('Shadow DOM');
  });

  it('contiene la restricción de determinismo', () => {
    expect(DVGE_MASTER_RULES).toContain('frame');
  });

  it('contiene el entry point window.renderDVGE', () => {
    expect(DVGE_MASTER_RULES).toContain('renderDVGE');
  });
});
