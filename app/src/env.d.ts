/// <reference types="vite/client" />

export {}

export interface FormField {
  type: 'string' | 'color' | 'number' | 'image' | 'code'
  id: string
  label: string
  defaultValue: string | number
}

export interface PluginManifest {
  id: string
  name: string
  description: string
  version: string
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
