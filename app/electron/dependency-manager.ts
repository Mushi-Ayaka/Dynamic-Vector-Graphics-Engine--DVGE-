import { app } from 'electron';
import { join } from 'node:path';
import * as fs from 'node:fs';
import { ensureBrowser } from '@remotion/renderer';

/**
 * DependencyManager - v5.6.0
 * Gestiona la descarga y resolución de rutas para Chromium y FFmpeg.
 * Garantiza que el motor sea autónomo y no dependa de instalaciones globales.
 */
export class DependencyManager {
  private binDir: string;

  constructor() {
    // Ruta: %APPDATA%/DVGE/bin
    this.binDir = join(app.getPath('userData'), 'bin');
    
    if (!fs.existsSync(this.binDir)) {
      fs.mkdirSync(this.binDir, { recursive: true });
    }
  }

  /**
   * Garantiza que Chromium esté disponible.
   * Utiliza la lógica de Remotion para descargar el binario si falta.
   */
  async ensureChromium(): Promise<string> {
    console.log('[DependencyManager] Checking Chromium...');
    
    // [CRÍTICO] Redirigir CWD a TEMP para evitar EPERM al crear .remotion en Program Files
    const prevCwd = process.cwd();
    try { process.chdir(app.getPath('temp')); } catch (e) { console.warn('Could not change CWD to TEMP', e); }

    try {
      const browser = await ensureBrowser();
      
      // Guardia de seguridad
      if (browser.type === 'no-browser') {
        throw new Error('No compatible browser found or could not be downloaded.');
      }

      if (browser.type === 'version-mismatch') {
        throw new Error('Chromium version mismatch detected. Please check your environment.');
      }

      // Usamos casting para evitar problemas de unión de tipos en diferentes versiones de Remotion
      const executablePath = (browser as any).path || (browser as any).executablePath;

      if (!executablePath) {
        throw new Error(`Could not resolve executable path for browser type: ${browser.type}`);
      }

      console.log('[DependencyManager] Chromium is ready:', executablePath);
      return executablePath;
    } catch (error) {
      console.error('[DependencyManager] Failed to ensure Chromium:', error);
      throw error;
    } finally {
      // Restaurar CWD original
      try { process.chdir(prevCwd); } catch {}
    }
  }

  /**
   * Devuelve la ruta de FFmpeg. 
   * En v5.6, confiamos en el binario incluido en el bundle o el sistema,
   * pero preparamos el terreno para el auto-fetch de la v5.7.
   */
  getFFmpegPath(): string | undefined {
    // Intentar encontrarlo en el bundle primero (asarUnpack)
    const unpackedFFmpeg = join(process.resourcesPath ?? '', 'app.asar.unpacked', 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');
    if (fs.existsSync(unpackedFFmpeg)) {
      return unpackedFFmpeg;
    }
    return undefined; // Remotion lo buscará en el PATH por defecto
  }

  /**
   * Intenta localizar Google Chrome en el sistema como fallback ultra-rápido.
   */
  getSystemChromePath(): string | undefined {
    const paths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe')
    ];

    for (const p of paths) {
      if (fs.existsSync(p)) return p;
    }
    return undefined;
  }
}

export const dependencyManager = new DependencyManager();
