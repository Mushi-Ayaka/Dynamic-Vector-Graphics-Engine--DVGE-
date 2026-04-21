import { FormField, PresetType } from '../env';

/**
 * [3.4.0] Registro Maestro de Presets
 * Estos bloques de campos se inyectan automáticamente cuando un plugin
 * declara el preset en su manifest.json.
 */
export const PRESET_REGISTRY: Record<PresetType, FormField[]> = {
  'branding': [
    { id: 'brandLogo', type: 'image', label: 'Logo de Marca', defaultValue: '', group: 'Branding' },
    { 
      id: 'logoPosition', 
      type: 'select', 
      label: 'Posición del Logo', 
      defaultValue: 'top-right', 
      group: 'Branding',
      options: [
        { label: 'Arriba Derecha', value: 'top-right' },
        { label: 'Arriba Izquierda', value: 'top-left' },
        { label: 'Abajo Derecha', value: 'bottom-right' },
        { label: 'Abajo Izquierda', value: 'bottom-left' },
        { label: 'Oculto', value: 'none' }
      ]
    },
    { id: 'logoSize', type: 'number', label: 'Tamaño Logo (px)', defaultValue: 100, group: 'Branding' },
    { id: 'brandPrimaryColor', type: 'color', label: 'Color Principal', defaultValue: '#E44C30', group: 'Branding' },
    { id: 'brandSlogan', type: 'string', label: 'Eslogan / Subtítulo', defaultValue: 'Dynamic Graphics', group: 'Branding' },
  ],
  'motion': [
    { id: 'fps', type: 'number', label: 'FPS (Velocidad)', defaultValue: 60, group: 'Animación' },
    { id: 'totalDuration', type: 'number', label: 'Duración Total (s)', defaultValue: 5, group: 'Animación' },
    { id: 'entryDuration', type: 'number', label: 'Duración Entrada (ms)', defaultValue: 500, group: 'Animación' },
    { id: 'exitDuration', type: 'number', label: 'Duración Salida (ms)', defaultValue: 500, group: 'Animación' },
    { 
      id: 'easingType', 
      type: 'select', 
      label: 'Curva de Easing', 
      defaultValue: 'easeOutCubic', 
      group: 'Animación',
      options: [
        { label: 'Cubic (Suave)', value: 'easeOutCubic' },
        { label: 'Expo (Rápido)', value: 'easeOutExpo' },
        { label: 'Linear (Constante)', value: 'linear' },
        { label: 'Back (Rebote)', value: 'easeOutBack' }
      ]
    },
  ],
  'layout': [
    { id: 'resolutionWidth', type: 'number', label: 'Ancho (px)', defaultValue: 1920, group: 'Layout' },
    { id: 'resolutionHeight', type: 'number', label: 'Alto (px)', defaultValue: 1080, group: 'Layout' },
    { 
      id: 'contentAlign', 
      type: 'select', 
      label: 'Alineación Global', 
      defaultValue: 'center', 
      group: 'Layout',
      options: [
        { label: 'Centro', value: 'center' },
        { label: 'Abajo Centro', value: 'bottom-center' },
        { label: 'Abajo Derecha', value: 'bottom-right' },
        { label: 'Abajo Izquierda', value: 'bottom-left' },
        { label: 'Arriba Izquierda (Default)', value: 'top-left' }
      ]
    },
    { id: 'safeAreaPadding', type: 'number', label: 'Margen de Seguridad (px)', defaultValue: 60, group: 'Layout' },
    { id: 'showSafeGuides', type: 'code', label: 'Mostrar Guías (true/false)', defaultValue: 'false', group: 'Layout' },
  ],
  'editor-full': [
      { id: 'editorActive', type: 'code', label: 'Estado del Editor (Internal)', defaultValue: 'true', group: 'Editor' }
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
