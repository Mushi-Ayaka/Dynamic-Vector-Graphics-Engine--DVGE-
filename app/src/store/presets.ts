import { FormField, PresetType } from '../env';

/**
 * [3.4.0] Registro Maestro de Presets
 * Estos bloques de campos se inyectan automáticamente cuando un plugin
 * declara el preset en su manifest.json.
 */
export const PRESET_REGISTRY: Record<PresetType, FormField[]> = {
  'branding': [
    { id: 'brandLogo', type: 'image', label: 'Logo de Marca', defaultValue: '', group: 'Branding' },
    { id: 'brandPrimaryColor', type: 'color', label: 'Color Principal', defaultValue: '#E44C30', group: 'Branding' },
    { id: 'brandSlogan', type: 'string', label: 'Eslogan / Subtítulo', defaultValue: 'Dynamic Graphics', group: 'Branding' },
  ],
  'motion': [
    { id: 'entryDuration', type: 'number', label: 'Duración Entrada (ms)', defaultValue: 500, group: 'Animación' },
    { id: 'exitDuration', type: 'number', label: 'Duración Salida (ms)', defaultValue: 500, group: 'Animación' },
    { id: 'easingType', type: 'string', label: 'Curva de Easing', defaultValue: 'easeOutCubic', group: 'Animación' },
  ],
  'layout': [
    { id: 'safeAreaPadding', type: 'number', label: 'Margen de Seguridad (px)', defaultValue: 60, group: 'Layout' },
    { id: 'showSafeGuides', type: 'code', label: 'Mostrar Guías (true/false)', defaultValue: 'false', group: 'Layout' },
  ],
  'editor-full': [
      { id: 'editorActive', type: 'code', label: 'Estado del Editor (Internal)', defaultValue: 'true', group: 'Editor' }
  ],
  'info': [
      { 
        id: 'aiInstructions', 
        type: 'info', 
        label: 'Super Prompt para IA Externa', 
        defaultValue: 'Actúa como un desarrollador senior de Motion Graphics. Genera un plugin para DVGE v3.4.0 siguiendo estas reglas:\n\n1. TECNOLOGÍA: Vanilla HTML/CSS/JS (❌ NO React/Librerías).\n2. MODULARIDAD: Usa presets ["branding", "motion", "layout"] en manifest.json.\n3. API: dvEngine.register({ awake, start, update }).\n4. DOM: Usa ctx.root.getElementById() (Shadow DOM). NUNCA uses "document".\n5. ANIMACIÓN: Usa ctx.frame y dvEngine.utils.\n6. BROADCAST: 1920x1080. Usa clases .dv-glass y .dv-safe-area.\n\n[DESCRIPCIÓN DEL PLUGIN: ...]', 
        group: 'Ayuda' 
      }
  ]
};

/**
 * Función que expande un manifiesto basándose en sus presets.
 */
export const expandManifestFields = (presets?: PresetType[], originalSchema: FormField[] = []): FormField[] => {
  if (!presets || presets.length === 0) return originalSchema;

  const presetFields: FormField[] = [];
  presets.forEach(presetId => {
    const fields = PRESET_REGISTRY[presetId];
    if (fields) {
      presetFields.push(...fields);
    }
  });

  // Combinamos presets primero, luego los campos específicos del plugin
  return [...presetFields, ...originalSchema];
};
