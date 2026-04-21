import { bundle } from '@remotion/bundler';
import { getCompositions, renderMedia } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';

// CONFIGURACIÓN DE PRUEBA
const PROJECT_ROOT = 'c:/Users/Josue B/Desktop/Josue B/Documents/Jonatan Baron/Proyectos/Dynamic Vector Graphics Engine/app';
const PLUGIN_PATH = 'C:/Users/Josue B/Desktop/Josue B/Documents/DV_Engine_Plugins/verification-plugin';
const OUTPUT_PATH = 'C:/Users/Josue B/Desktop/Josue B_Verification_Final.mov';

async function runRender() {
    console.log('🚀 Iniciando verificación de renderizado...');

    try {
        // 1. Cargar archivos del plugin
        console.log('📂 Cargando archivos del plugin...');
        const activePluginFiles = {
            html: fs.readFileSync(path.join(PLUGIN_PATH, 'index.html'), 'utf8'),
            css: fs.readFileSync(path.join(PLUGIN_PATH, 'style.css'), 'utf8'),
            js: fs.readFileSync(path.join(PLUGIN_PATH, 'script.js'), 'utf8'),
        };

        const props = {
            activePluginFiles,
            text: '¡RENDER CLI EXITOSO!',
            bgColor: '#2DDE92'
        };

        // 2. Bundling
        const entryPoint = path.join(PROJECT_ROOT, 'src/remotion/index.ts');
        console.log('📦 Bundling Remotion...', entryPoint);
        
        const bundled = await bundle({
            entryPoint,
            webpackOverride: (config) => config,
        });

        // 3. Obtener composición
        const comps = await getCompositions(bundled);
        const composition = comps.find((c) => c.id === 'LowerThirdBasic');

        if (!composition) {
            throw new Error('Composición LowerThirdBasic no encontrada.');
        }

        // 4. Render Media
        console.log('🎥 Renderizando a:', OUTPUT_PATH);

        await renderMedia({
            composition,
            serveUrl: bundled,
            codec: 'prores',
            proResProfile: '4444',
            outputLocation: OUTPUT_PATH,
            inputProps: props,
            onProgress: ({ progress }) => {
                console.log(`⏳ Progreso: ${(progress * 100).toFixed(1)}%`);
            },
        });

        console.log('✅ VERIFICACIÓN DE RENDER EXITOSA!');
        console.log('📂 Archivo generado en:', OUTPUT_PATH);
        process.exit(0);
    } catch (err) {
        console.error('❌ ERROR DURANTE LA VERIFICACIÓN:', err);
        process.exit(1);
    }
}

runRender();
