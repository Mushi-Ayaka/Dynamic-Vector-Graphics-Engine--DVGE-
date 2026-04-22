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
          entryPoint = join(app.getAppPath().replace('app.asar', 'app.asar.unpacked'), 'src/remotion/index.ts')
      }
      console.log('📦 Bundling Remotion...', entryPoint)
      
      const bundled = await bundle({
        entryPoint,
        webpackOverride: (config) => config,
      })

      const comps = await getCompositions(bundled)
      const composition = comps.find((c) => c.id === 'LowerThirdBasic')

      if (!composition) {
        throw new Error('Composición no encontrada.')
      }

      let exportDir = 'C:\\OS_TEMP\\dv_engine_renders';
      if (props._projectId) {
          exportDir = join(app.getPath('documents'), 'DVG_Projects', props._projectId, 'Exports');
      }
      
      if (!fs.existsSync(exportDir)) {
          fs.mkdirSync(exportDir, { recursive: true });
      }

      const outputLocation = join(exportDir, `lower_third_${Date.now()}.mov`);

      console.log('🎥 Renderizando a:', outputLocation)

      await renderMedia({
        composition,
        serveUrl: bundled,
        codec: 'prores',
        proResProfile: '4444',
        outputLocation,
        inputProps: props,
        onProgress: ({ progress }) => {
          // Stream de progreso hacia React
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
