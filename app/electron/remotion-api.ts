import { app, ipcMain } from 'electron'
import { getCompositions, renderMedia } from '@remotion/renderer'
import { join } from 'node:path'
import * as fs from 'node:fs'
import * as http from 'node:http'
import { dependencyManager } from './dependency-manager'

/**
 * [CRÍTICO] setupRemotionIPC - Orquestador de Renderizado Nativo.
 * ⚠️ ADVERTENCIA:
 * Este módulo controla la comunicación con el kernel de Remotion y FFmpeg.
 * Cualquier cambio en los ChromiumFlags, PixelFormat o en la lógica de inyección de props
 * puede romper la transparencia ProRes 4444 o causar desincronización de audio/video.
 * Testear siempre con plugins que usen animaciones de larga duración antes de confirmar.
 */
export function setupRemotionIPC() {
  ipcMain.handle('start-render', async (event, props) => {
    // Remotion crea .remotion/ en el cwd. En producción el cwd es
    // C:\Program Files\ (sin permisos de escritura). Lo redirigimos a %TEMP%.
    const prevCwd = process.cwd()
    try { process.chdir(app.getPath('temp')) } catch {}

    try {
      console.log(`[Remotion] Render request:`, JSON.stringify(props, null, 2))

      // Dev:  app.getAppPath() = carpeta app/
      // Prod asar:true:  app.asar.unpacked/ (remotion-bundle está en asarUnpack)
      // Prod asar:false: resources/app/
      const unpacked = join(process.resourcesPath ?? '', 'app.asar.unpacked')
      const baseDir = fs.existsSync(unpacked) ? unpacked : app.getAppPath()
      const bundleDir = join(baseDir, 'remotion-bundle')

      console.log('--------------------------------------------------')
      console.log('[Remotion] DATA PATH DIAGNOSTIC:')
      console.log('[Remotion] app.getAppPath():', app.getAppPath())
      console.log('[Remotion] Target bundleDir:', bundleDir)
      console.log('[Remotion] Bundle index.html exists:', fs.existsSync(join(bundleDir, 'index.html')))
      console.log('[Remotion] Bundle bundle.js exists:', fs.existsSync(join(bundleDir, 'bundle.js')))
      if (fs.existsSync(join(bundleDir, 'bundle.js'))) {
        const stats = fs.statSync(join(bundleDir, 'bundle.js'))
        console.log('[Remotion] bundle.js size:', stats.size, 'bytes')
        console.log('[Remotion] bundle.js modified:', stats.mtime.toISOString())
      }
      console.log('--------------------------------------------------')

      if (!fs.existsSync(bundleDir)) {
        throw new Error(`Remotion bundle not found at: ${bundleDir}`)
      }

      // binariesDirectory: solo en producción (app instalada).
      // En dev, process.resourcesPath apunta al electron de node_modules — no tiene los binarios.
      const isPackaged = app.isPackaged
      const binariesDirectory = isPackaged
        ? join(process.resourcesPath, 'app.asar.unpacked', 'node_modules', '@remotion', 'compositor-win32-x64-msvc')
        : undefined

      console.log('[Remotion] isPackaged:', isPackaged, '| binariesDirectory:', binariesDirectory)

      // [CRÍTICO] Forzar directorio .remotion en TEMP para evitar EPERM en Program Files
      const dotRemotionDir = join(app.getPath('temp'), '.remotion-dvge');
      if (!fs.existsSync(dotRemotionDir)) fs.mkdirSync(dotRemotionDir, { recursive: true });

      const comps = await getCompositions(bundleDir, {
        ...(binariesDirectory ? { binariesDirectory } : {}),
        dotRemotionDir,
      } as any)
      
      const composition = comps.find((c: any) => c.id === 'lower-third-basic') || 
                          comps.find((c: any) => c.id === 'debug-pink') || 
                          comps[0];
      
      if (!composition) throw new Error('Composición no encontrada.')

      const renderWidth    = props._renderWidth    || composition.width
      const renderHeight   = props._renderHeight   || composition.height
      const renderFps      = props._renderFps      || composition.fps
      const renderDuration = props._renderDuration || composition.durationInFrames

      let exportDir = 'C:\\OS_TEMP\\dv_engine_renders'
      if (props._projectId) {
        exportDir = join(app.getPath('documents'), 'DVG_Projects', props._projectId, 'Exports')
      }
      if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir, { recursive: true })

      const outputLocation = join(exportDir, `dvge_render_${Date.now()}.mov`)
      const logPath = join(exportDir, 'render_debug.log');
      const logStream = fs.createWriteStream(logPath, { flags: 'a' });
      const log = (msg: string) => {
        const time = new Date().toLocaleTimeString();
        const line = `[${time}] ${msg}\n`;
        console.log(line.trim());
        logStream.write(line);
      };

      log('--------------------------------------------------');
      log(`🚀 INICIANDO RENDER: ${composition.id}`);
      log(`📂 Bundle: ${bundleDir}`);
      log(`📁 Cache Dir: ${dotRemotionDir}`);

      // [v5.3.0] SERVIDOR NATIVO CON LOGS FÍSICOS
      const server = http.createServer((req: any, res: any) => {
        log(`[Server] Request: ${req.url}`);

        if (req.url === '/props.json') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ...props, isExporting: true }));
          return;
        }

        const filePath = join(bundleDir, req.url === '/' ? 'index.html' : req.url);
        if (fs.existsSync(filePath)) {
          res.writeHead(200);
          res.end(fs.readFileSync(filePath));
        } else {
          log(`[Server] 404: ${req.url}`);
          res.writeHead(404);
          res.end('Not Found');
        }
      });

      await new Promise<void>((resolve) => server.listen(5555, '127.0.0.1', () => resolve()));
      log('[Server] http://127.0.0.1:5555');

      try {
        const cleanEnv = { ...process.env };
        delete cleanEnv.VITE_DEV_SERVER_URL;
        delete cleanEnv.REMOTION_DEV_SERVER;

        await renderMedia({
          composition: { ...composition, width: renderWidth, height: renderHeight, fps: renderFps, durationInFrames: renderDuration },
          serveUrl: 'http://127.0.0.1:5555',
          codec: 'prores',
          proResProfile: '4444',
          pixelFormat: 'yuva444p10le', // Revertido: Formato estándar 10-bit de Remotion
          imageFormat: 'png',
          outputLocation,
          inputProps: { ...props, isExporting: true },
          ...(binariesDirectory ? { binariesDirectory } : {}),
          dotRemotionDir,
          logLevel: 'verbose',
          concurrency: 1,
          browserExecutable: await dependencyManager.ensureChromium() || dependencyManager.getSystemChromePath(),
          // [CRÍTICO] Flags para forzar renderizado estable en Windows
          chromiumFlags: [
            '--headless=new',
            '--transparent-background-color=0',
            '--hide-scrollbars',
            '--mute-audio',
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--disable-setuid-sandbox',
            '--no-sandbox',
            '--force-cpu-rasterization'
          ],
          envVariables: cleanEnv as any,
          onConsoleLog: (msg: any) => log(`[Browser] ${msg.text}`),
          onProgress: ({ progress }: any) => event.sender.send('render-progress', progress),
          evaluatePage: async (page: any) => {
            await page.evaluate(() => {
              document.body.style.backgroundColor = 'transparent';
            });
          }
        } as any)
      } finally {
        log('[Render] Finalizado o abortado.');
        server.close();
        logStream.end();
      }

      console.log('✅ Render completo:', outputLocation)
      return { success: true, path: outputLocation }
    } catch (err) {
      console.error('❌ Error de Render:', err)
      return { success: false, error: String(err) }
    } finally {
      // Siempre restaurar el cwd original
      try { process.chdir(prevCwd) } catch {}
    }
  })
}
