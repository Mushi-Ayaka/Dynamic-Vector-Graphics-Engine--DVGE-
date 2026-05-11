/// <reference types="vite/client" />

export {}

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

export interface AIContextOptions {
  includeCanvas: boolean;
  includeArtifacts: boolean;
  includeCode: boolean;
  includeDataPreview: boolean; // [v5.7.3] Nueva opción para privacidad de datos
  visualSkill: string;
  stylePresets?: string[];
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
      generateRulesPdf: (data: { rulesText: string, projectContext?: any, options?: AIContextOptions }) => Promise<string>;

      // [INS-02/03] File Dialog — IPC nativo para selector de archivos
      showOpenDialog: (options: {
        filters?: { name: string; extensions: string[] }[];
        properties?: Array<'openFile' | 'multiSelections'>;
      }) => Promise<{ canceled: boolean; filePaths: string[] }>;

      // [INS-02] Lectura segura de archivos locales (proceso principal)
      readFileUtf8: (filePath: string) => Promise<{
        content: string;
        sizeBytes: number;
        error?: string;
      }>;
      
      // Workspace / Proyectos
      getProjects: () => Promise<any[]>;
      createProject: (name: string, pluginId: string, defaultProps: any) => Promise<any>;
      saveProjectProps: (projectId: string, props: any) => Promise<boolean>;
      openProjectFolder: (projectId: string) => void;
      updateProject: (projectId: string, updates: any) => Promise<boolean>;
      deleteProject: (projectId: string) => Promise<boolean>;

      // [Window Controls] Frameless window
      windowMinimize: () => void;
      windowMaximize: () => void;
      windowClose: () => void;
      windowIsMaximized: () => Promise<boolean>;
      windowNew: () => void;
      windowZoomIn: () => void;
      windowZoomOut: () => void;
      windowZoomReset: () => void;
      windowOpenExternal: (url: string) => void;
      windowOpenManual: () => void;
      getMachineId: () => Promise<string>;
      saveArtifact: (data: { projectId: string, fileName: string, base64Data: string }) => Promise<{ success: boolean, filePath?: string, error?: string }>;
      copyToProject: (data: { projectId: string, sourcePath: string }) => Promise<{ success: boolean, filePath?: string, error?: string }>;
      listAssets: (projectId: string) => Promise<{ name: string, path: string }[]>;
      indexAsset: (data: { projectId: string, assetPath: string }) => Promise<{ success: boolean, filePath?: string, error?: string }>;
      downloadAndRunUpdate?: (url: string) => Promise<{ success: boolean, error?: string }>;
    }
  }
}
