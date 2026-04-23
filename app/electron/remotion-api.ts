import { app, ipcMain } from 'electron'
import { bundle } from '@remotion/bundler'
import { getCompositions, renderMedia } from '@remotion/renderer'
import { join } from 'node:path'
import * as fs from 'node:fs'

export function setupRemotionIPC() {
  ipcMain.handle('start-render', async (event, props) => {
    try {
      console.log(`[Remotion] New render request received with props:`, JSON.stringify(props, null, 2))
      let entryPoint = join(__dirname, '../src/remotion/index.ts')
      if (app.isPackaged) {
          const asarUnpackedPath = app.getAppPath().replace('app.asar', 'app.asar.unpacked')
          entryPoint = join(asarUnpackedPath, 'src/remotion/index.ts')
          // [v4.1.5] Fix: Esbuild cannot run from inside ASAR, we point to the unpacked binary
          process.env.ESBUILD_BINARY_PATH = join(asarUnpackedPath, 'node_modules/@esbuild/win32-x64/esbuild.exe')
      }
      console.log('📦 Bundling Remotion...', entryPoint)
      
      const bundled = await bundle({
        entryPoint,
        webpackOverride: (config) => config,
      })

      const comps = await getCompositions(bundled)
      // Buscamos la composición base, pero sobreescribiremos sus dimensiones
      const composition = comps.find((c) => c.id === 'LowerThirdBasic')

      if (!composition) {
        throw new Error('Composición no encontrada.')
      }

      // [v4.1.5] Sincronización de Especificaciones de Video
      // Extraemos valores del proyecto o usamos fallbacks seguros
      const renderWidth = props._renderWidth || composition.width;
      const renderHeight = props._renderHeight || composition.height;
      const renderFps = props._renderFps || composition.fps;
      const renderDuration = props._renderDuration || composition.durationInFrames;

      let exportDir = 'C:\\OS_TEMP\\dv_engine_renders';
      if (props._projectId) {
          exportDir = join(app.getPath('documents'), 'DVG_Projects', props._projectId, 'Exports');
      }
      
      if (!fs.existsSync(exportDir)) {
          fs.mkdirSync(exportDir, { recursive: true });
      }
      
      const outputLocation = join(exportDir, `dvge_render_${Date.now()}.mov`);

      console.log(`🎥 Renderizando (${renderWidth}x${renderHeight} @ ${renderFps}fps) a:`, outputLocation)

      await renderMedia({
        composition: {
            ...composition,
            width: renderWidth,
            height: renderHeight,
            fps: renderFps,
            durationInFrames: renderDuration
        },
        serveUrl: bundled,
        codec: 'prores',
        proResProfile: '4444',
        outputLocation,
        inputProps: {
            ...props,
            isExporting: true // Forzamos flag de exportación
        },
        onProgress: ({ progress }) => {
          event.sender.send('render-progress', progress)
        },
      })

      console.log('✅ Render Completo!')
      return { success: true, path: outputLocation }
    } catch (err) {
      console.error('❌ Error de Render:', err)
      return { success: false, error: String(err) }
    }
  })
}
