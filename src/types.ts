export interface FormField {
  type: 'string' | 'color' | 'number' | 'image' | 'code' | 'info'
      | 'select' | 'artifact' | 'prompt' | 'boolean' | 'slider' | 'button'
      | 'file-ref' | 'file'
      | 'image-ref' | 'dataset'
      | 'alignment' | 'easing' | 'range-dual' | 'icon' | 'gradient' | 'font'
  id: string
  label: string
  defaultValue: string | number | boolean
  description?: string
  group?: string
  options?: { label: string, value: string }[]
  accept?: string[]
  min?: number
  max?: number
  step?: number
}

export type PresetType = 'branding' | 'motion' | 'layout' | 'editor-full';

export interface GlobalEnv {
  isExporting: boolean;
  resolution: { width: number, height: number };
  safeArea: { top: number, left: number, right: number, bottom: number };
}

export interface DVGEContext {
  frame: number;
  root: ShadowRoot;
  props: Record<string, any>;
  state: Record<string, any>;
  refs: Record<string, HTMLElement>;
  utils: any; // Se reemplazará con DVGEUtils
  layer?: DVGELayerContext;
  settings?: {
    fps: number;
    duration: number;
    resolution: string;
    width: number;
    height: number;
  };
  env?: GlobalEnv;
  global?: Record<string, any>;
}

export interface DVGELayerContext {
  id: string;
  localFrame: number;
  opacity: number;
  blendMode: string;
}

export interface DVGEManifest {
  id: string
  name: string
  description: string
  version: string
  type: 'template' | 'tool' | 'extension'
  minEngineVersion?: string
  permissions?: ('network' | 'storage')[]
  presets?: PresetType[]
  schema: FormField[]
  externalScripts?: string[]
  externalStyles?: string[]
}
