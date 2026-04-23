import { app, ipcMain } from 'electron'
import { getCompositions, renderMedia } from '@remotion/renderer'
import { join } from 'node:path'
import * as fs from 'node:fs'

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

      console.log('[Remotion] baseDir:', baseDir)
      console.log('[Remotion] bundleDir exists:', fs.existsSync(bundleDir))

      if (!fs.existsSync(bundleDir)) {
        throw new Error(`Remotion bundle not found at: ${bundleDir}`)
      }

      const comps = await getCompositions(bundleDir, {
        binariesDirectory: join(process.resourcesPath ?? '', 'app.asar.unpacked', 'node_modules', '@remotion', 'compositor-win32-x64-msvc'),
      } as any)
      const composition = comps.find((c: any) => c.id === 'LowerThirdBasic')
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
      console.log(`🎥 Rendering ${renderWidth}x${renderHeight}@${renderFps}fps →`, outputLocation)

      // binariesDirectory apunta al .asar.unpacked donde están los .exe reales
      const binariesDirectory = join(process.resourcesPath ?? '', 'app.asar.unpacked', 'node_modules', '@remotion', 'compositor-win32-x64-msvc')

      await renderMedia({
        composition: { ...composition, width: renderWidth, height: renderHeight, fps: renderFps, durationInFrames: renderDuration },
        serveUrl: bundleDir,
        codec: 'prores',
        proResProfile: '4444',
        outputLocation,
        inputProps: { ...props, isExporting: true },
        binariesDirectory: fs.existsSync(binariesDirectory) ? binariesDirectory : undefined,
        onProgress: ({ progress }: any) => event.sender.send('render-progress', progress),
      } as any)

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
