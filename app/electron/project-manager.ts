import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

export interface DVProject {
  id: string; // The folder name
  name: string;
  createdAt: number;
  updatedAt: number;
  pluginId: string; // The plugin this project is associated with
  properties: Record<string, any>; // Saved state of the properties pane
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
            projects.push({ ...data, id: entry.name });
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

  public saveProjectProperties(projectId: string, properties: Record<string, any>) {
    const projectPath = path.join(this.baseDir, projectId);
    const metadataPath = path.join(projectPath, 'project.json');

    if (fs.existsSync(metadataPath)) {
        try {
            const raw = fs.readFileSync(metadataPath, 'utf8');
            const data = JSON.parse(raw);
            data.properties = properties;
            data.updatedAt = Date.now();
            fs.writeFileSync(metadataPath, JSON.stringify(data, null, 2));
            return true;
        } catch(e) {
            console.error('Failed to save project state:', e);
        }
    }
    return false;
  }

  public getProjectExportsFolder(projectId: string): string {
    const dir = path.join(this.baseDir, projectId, 'Exports');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return dir;
  }
}
