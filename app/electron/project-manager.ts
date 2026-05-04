import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import * as path from 'path';
import { app } from 'electron';

export interface DVProject {
  id: string; // The folder name
  name: string;
  createdAt: number;
  updatedAt: number;
  pluginId: string; // The plugin this project is associated with
  properties: Record<string, any>; // Saved state of the properties pane
  // [v5.6] Metadata persistente
  width?: number;
  height?: number;
  fps?: number;
  durationInFrames?: number;
  aspectRatioMode?: string;
}

const PROJECTS_DIR_NAME = 'DVG_Projects';

export class ProjectManager {
  private baseDir: string;

  constructor() {
    const docsPath = app.getPath('documents');
    this.baseDir = path.join(docsPath, PROJECTS_DIR_NAME);
    this.ensureDirectory();
  }

  private ensureDirectory() {
    if (!fs.existsSync(this.baseDir)) {
      console.log(`[ProjectManager] Creating base directory at: ${this.baseDir}`);
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  public getProjects(): DVProject[] {
    const projects: DVProject[] = [];
    if (!fs.existsSync(this.baseDir)) return projects;

    const entries = fs.readdirSync(this.baseDir, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const projectPath = path.join(this.baseDir, entry.name);
        const metadataPath = path.join(projectPath, 'project.json');

        if (fs.existsSync(metadataPath)) {
          try {
            const raw = fs.readFileSync(metadataPath, 'utf8');
            const data = JSON.parse(raw);
            projects.push({ 
              ...data, 
              id: entry.name,
              path: projectPath // Inyectamos la ruta absoluta
            });
          } catch (e) {
            console.error(`DV Engine: Error parseando proyecto en ${projectPath}`);
          }
        }
      }
    }

    // Sort by most recently updated
    return projects.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  public createProject(name: string, pluginId: string, defaultProps: Record<string, any> = {}): DVProject | null {
    const safeName = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const projectId = `${safeName}_${Date.now()}`;
    const projectPath = path.join(this.baseDir, projectId);
    
    if (fs.existsSync(projectPath)) return null;

    fs.mkdirSync(projectPath, { recursive: true });
    
    const projectFilePath = path.join(projectPath, 'project.json');
    const projectData: DVProject = {
      id: projectId,
      name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pluginId,
      properties: defaultProps
    };

    fs.writeFileSync(projectFilePath, JSON.stringify(projectData, null, 2));

    // Crear carpeta genérica de exports
    const exportsDir = path.join(projectPath, 'Exports');
    fs.mkdirSync(exportsDir, { recursive: true });

    return projectData;
  }

  private saveQueue: Map<string, Promise<any>> = new Map();

  public async saveProjectProperties(projectId: string, payload: any): Promise<boolean> {
    // [v5.8.3] Serialización de guardado por proyecto para evitar race conditions
    const currentQueue = this.saveQueue.get(projectId) || Promise.resolve();
    
    const nextSave = currentQueue.then(async () => {
      const projectPath = path.join(this.baseDir, projectId);
      const metadataPath = path.join(projectPath, 'project.json');
      const tmpPath = metadataPath + '.tmp';

      if (!fs.existsSync(metadataPath)) {
          console.warn(`[ProjectManager] ⚠ Attempted to save to non-existent project: ${projectId}`);
          return false;
      }

      try {
          const raw = await fsPromises.readFile(metadataPath, 'utf8');
          const data = JSON.parse(raw);
          
          if (payload.properties) {
            Object.assign(data, payload);
          } else {
            data.properties = payload;
          }
          
          data.updatedAt = Date.now();

          const json = JSON.stringify(data, null, 2);

          try { JSON.parse(json); } catch (validateErr) {
            console.error(`[ProjectManager] JSON validation failed, aborting save for ${projectId}:`, validateErr);
            return false;
          }

          await fsPromises.writeFile(tmpPath, json, 'utf8');
          await fsPromises.rename(tmpPath, metadataPath);

          console.log(`[ProjectManager] Saved (metadata+props) for: ${projectId}`);
          return true;
      } catch(e) {
          console.error(`[ProjectManager] Failed atomic save for ${projectId}:`, e);
          try { await fsPromises.unlink(tmpPath); } catch { /* no existe, ignorar */ }
          return false;
      }
    });

    this.saveQueue.set(projectId, nextSave);
    
    // Limpiar el mapa después de que termine la cola (opcional, para evitar fugas de memoria)
    nextSave.finally(() => {
      if (this.saveQueue.get(projectId) === nextSave) {
        this.saveQueue.delete(projectId);
      }
    });

    return nextSave;
  }

  public getProjectExportsFolder(projectId: string): string {
    const dir = path.join(this.baseDir, projectId, 'Exports');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return dir;
  }

  public async updateProject(projectId: string, updates: Partial<DVProject>): Promise<boolean> {
    const projectPath = path.join(this.baseDir, projectId);
    const metadataPath = path.join(projectPath, 'project.json');

    if (!fs.existsSync(metadataPath)) return false;

    try {
      const raw = await fsPromises.readFile(metadataPath, 'utf8');
      const data = JSON.parse(raw);
      
      Object.assign(data, updates);
      data.updatedAt = Date.now();

      await fsPromises.writeFile(metadataPath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (e) {
      console.error(`[ProjectManager] Error updating project ${projectId}:`, e);
      return false;
    }
  }

  public async deleteProject(projectId: string): Promise<boolean> {
    const projectPath = path.join(this.baseDir, projectId);
    if (!fs.existsSync(projectPath)) return false;

    try {
      // Eliminar recursivamente (fs.rmSync requiere Node 14.14+)
      fs.rmSync(projectPath, { recursive: true, force: true });
      return true;
    } catch (e) {
      console.error(`[ProjectManager] Error deleting project ${projectId}:`, e);
      return false;
    }
  }
}
