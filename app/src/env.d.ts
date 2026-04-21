/// <reference types="vite/client" />

export {}

export interface FormField {
  type: 'string' | 'color' | 'number' | 'image' | 'code' | 'info'
  id: string
  label: string
  defaultValue: string | number
  group?: string // Opcional: para agrupar campos en la UI
}

/**
 * [3.4.0] Tipos de Presets y Entorno Modular
 */
export type PresetType = 'branding' | 'motion' | 'layout' | 'editor-full' | 'info';

export interface GlobalEnv {
  isExporting: boolean;
  resolution: { width: number, height: number };
  safeArea: { top: number, left: number, right: number, bottom: number };
}

export interface DVContext {
  frame: number;
  root: ShadowRoot;
  props: Record<string, any>;
  utils: any;
  settings: {
    fps: number;
    duration: number;
    resolution: string;
    width: number;
    height: number;
  };
  env: GlobalEnv;
  global: Record<string, any>;
  _state?: Record<string, any>;
  [key: string]: any;
}

export interface PluginManifest {
  id: string
  name: string
  description: string
  version: string
  presets?: PresetType[]
  schema: FormField[]
}

export interface DVPlugin {
  manifest: PluginManifest
  folderPath: string
  hasCss: boolean
  hasJs: boolean
}

declare global {
  interface Window {
    ipcRenderer: {
      send: (channel: string, data?: any) => void;
      on: (channel: string, func: (...args: any[]) => void) => void;
      invoke: (channel: string, ...args: any[]) => Promise<any>;
      startDrag: (filePath: string) => void;
      openFolder: (dirPath: string) => void;
      getPlugins: () => Promise<DVPlugin[]>;
      openPluginsFolder: () => void;
      getManualContent: () => Promise<string>;
      getPluginFiles: (pluginId: string) => Promise<{ html: string; css: string; js: string } | null>;
      
      // Workspace / Proyectos
      getProjects: () => Promise<any[]>;
      createProject: (name: string, pluginId: string, defaultProps: any) => Promise<any>;
      saveProjectProps: (projectId: string, props: any) => Promise<boolean>;
      openProjectFolder: (projectId: string) => void;
    }
  }
}
