import { app, ipcMain } from 'electron'
import { getCompositions, renderMedia, renderFrames } from '@remotion/renderer'
import { join, extname } from 'node:path'
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
    try { process.chdir(app.getPath('temp')) } catch { }

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

      const composition = comps.find((c: any) => c.id === 'dvge-render-engine') || comps[0];

      if (!composition) throw new Error('Composición no encontrada.')

      const renderWidth = props._renderWidth || composition.width
      const renderHeight = props._renderHeight || composition.height
      const renderFps = props._renderFps || composition.fps
      const renderDuration = props._renderDuration || composition.durationInFrames

      let exportDir = 'C:\\OS_TEMP\\dv_engine_renders'
      if (props._projectId) {
        exportDir = join(app.getPath('documents'), 'DVG_Projects', props._projectId, 'Exports')
      }
      if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir, { recursive: true })

      // [v5.8.0] Soporte multi-formato dinámico
      const selectedCodec = props._codec || 'prores';
      let extension = 'mov';
      let remotionCodec: any = 'prores';
      let proResProfile: any = '4444';
      let pixelFormat: any = 'yuva444p10le';

      const isImageSequence = selectedCodec === 'png' || selectedCodec === 'jpg';
      const selectedCodecVal = selectedCodec;

      if (selectedCodec === 'h264') {
        extension = 'mp4';
        remotionCodec = 'h264';
        pixelFormat = 'yuv420p';
      } else if (selectedCodec === 'gif') {
        extension = 'gif';
        remotionCodec = 'gif';
        pixelFormat = undefined;
      } else if (selectedCodec === 'webm') {
        extension = 'webm';
        remotionCodec = 'vp9';
        pixelFormat = 'yuva420p';
      } else if (selectedCodec === 'standard') {
        extension = 'mov';
        remotionCodec = 'prores';
        proResProfile = 'standard';
        pixelFormat = 'yuv422p10le';
      } else if (selectedCodec === 'png') {
        extension = 'png';
        remotionCodec = 'png';
        pixelFormat = undefined;
      } else if (selectedCodec === 'jpg') {
        extension = 'jpg';
        remotionCodec = 'jpeg';
        pixelFormat = undefined;
      }

      // [v6.0.0] Para secuencias de imagen, outputLocation es una carpeta; para video, es un archivo.
      const outputLocation = isImageSequence
        ? join(exportDir, `dvge_frames_${Date.now()}`)
        : join(exportDir, `dvge_render_${Date.now()}.${extension}`)
      if (isImageSequence && !fs.existsSync(outputLocation)) {
        fs.mkdirSync(outputLocation, { recursive: true });
      }
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
      log(`🎬 Formato: ${selectedCodec} (.${extension})`);

      // [v5.3.0] SERVIDOR NATIVO CON LOGS FÍSICOS
      const server = http.createServer((req: any, res: any) => {
        // [v5.8.6] LOG DE TRÁFICO TOTAL
        if (req.url?.includes('media-proxy')) {
          log(`[Proxy-Hit] URL: ${req.url}`);
        }

        // [v5.8.5] MEDIA PROXY - Debug detallado
        if (req.url?.startsWith('/media-proxy')) {
          try {
            const url = new URL(req.url, `http://${req.headers.host}`);
            let fPath = url.searchParams.get('path');

            if (fPath && fs.existsSync(fPath)) {
              log(`[Proxy] ✅ SIRVIENDO: ${fPath}`);
              const ext = extname(fPath).toLowerCase();
              const mimeTypes: Record<string, string> = {
                '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
                '.gif': 'image/gif', '.svg': 'image/svg+xml', '.mp4': 'video/mp4'
              };
              res.writeHead(200, {
                'Content-Type': mimeTypes[ext] || 'application/octet-stream',
                'Access-Control-Allow-Origin': '*'
              });
              fs.createReadStream(fPath).pipe(res);
              return;
            } else {
              log(`[Proxy] ❌ NO EXISTE: ${fPath}`);
            }
          } catch (e) {
            log(`[Server] Proxy Error: ${e}`);
            res.writeHead(500);
            res.end('Error serving local media');
            return;
          }
        }

        if (req.url === '/props.json') {
          try {
            const data = JSON.stringify({ ...props, isExporting: true });
            log(`[Server] Enviando props.json (${data.length} bytes)`);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
          } catch (e: any) {
            log(`[Server] ❌ ERROR serializando props.json: ${e.message}`);
            res.writeHead(500);
            res.end(JSON.stringify({ error: e.message }));
          }
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

        const sharedConfig = {
          composition: { ...composition, width: renderWidth, height: renderHeight, fps: renderFps, durationInFrames: renderDuration },
          serveUrl: 'http://127.0.0.1:5555',
          inputProps: { ...props, isExporting: true },
          ...(binariesDirectory ? { binariesDirectory } : {}),
          dotRemotionDir,
          logLevel: 'verbose' as const,
          concurrency: 1,
          browserExecutable: await dependencyManager.ensureChromium() || dependencyManager.getSystemChromePath(),
          chromiumFlags: [
            '--headless=new',
            '--transparent-background-color=0',
            '--hide-scrollbars',
            '--mute-audio',
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--disable-setuid-sandbox',
            '--no-sandbox',
            '--force-cpu-rasterization',
            '--disable-web-security',
            '--allow-file-access-from-files'
          ],
          envVariables: cleanEnv as any,
          onConsoleLog: (msg: any) => log(`[Browser] ${msg.text}`),
        };

        if (isImageSequence) {
          // [v6.0.0] Image Sequence Export — renderFrames genera un archivo por frame
          log(`🖼️ Iniciando secuencia de imágenes (${selectedCodecVal.toUpperCase()}) → ${outputLocation}`);
          await (renderFrames as any)({
            ...sharedConfig,
            outputDir: outputLocation,
            imageFormat: selectedCodecVal === 'jpg' ? 'jpeg' : 'png',
            evaluatePage: async (page: any) => {
              await page.evaluate(() => {
                document.body.style.backgroundColor = 'transparent';
              });
            },
            onFrameUpdate: (frame: number) => {
              event.sender.send('render-progress', frame / renderDuration);
            },
          });
        } else {
          // Video export — renderMedia (comportamiento existente)
          await renderMedia({
            ...sharedConfig,
            codec: remotionCodec,
            ...(remotionCodec === 'prores' ? { proResProfile } : {}),
            ...(pixelFormat ? { pixelFormat } : {}),
            imageFormat: 'png',
            outputLocation,
            onProgress: ({ progress }: any) => event.sender.send('render-progress', progress),
            evaluatePage: async (page: any) => {
              await page.evaluate(() => {
                document.body.style.backgroundColor = 'transparent';
              });
            }
          } as any);
        }
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
      try { process.chdir(prevCwd) } catch { }
    }
  })
}
