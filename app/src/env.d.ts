/// <reference types="vite/client" />

export {}

export interface FormField {
  type: 'string' | 'color' | 'number' | 'image' | 'code' | 'info' | 'select' | 'artifact' | 'prompt'
  id: string
  label: string
  defaultValue: string | number
  group?: string // Opcional: para agrupar campos en la UI
  options?: { label: string, value: string }[]
}

/**
 * [3.4.0] Tipos de Presets y Entorno Modular
 */
export type PresetType = 'branding' | 'motion' | 'layout' | 'editor-full';

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
  externalScripts?: string[] // URLs de scripts JS (CDN)
  externalStyles?: string[]  // URLs de estilos CSS (CDN)
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
      renderProject: any
      send: (channel: string, data?: any) => void;
      on: (channel: string, func: (...args: any[]) => void) => void;
      invoke: (channel: string, ...args: any[]) => Promise<any>;
      startDrag: (filePath: string) => void;
      openFolder: (dirPath: string) => void;
      getPlugins: () => Promise<DVPlugin[]>;
      openPluginsFolder: () => void;
      getManualContent: () => Promise<string>;
      getPluginFiles: (pluginId: string) => Promise<{ html: string; css: string; js: string } | null>;
      installPlugin: (pluginId: string, files: any) => Promise<boolean>;
      deletePlugin: (pluginId: string) => Promise<boolean>;
      logSync: (data: any) => void;
      getDocContent: (docName: string) => Promise<string>;
      generateRulesPdf: (rulesText: string) => Promise<string>;
      
      // Workspace / Proyectos
      getProjects: () => Promise<any[]>;
      createProject: (name: string, pluginId: string, defaultProps: any) => Promise<any>;
      saveProjectProps: (projectId: string, props: any) => Promise<boolean>;
      openProjectFolder: (projectId: string) => void;
    }
  }
}
