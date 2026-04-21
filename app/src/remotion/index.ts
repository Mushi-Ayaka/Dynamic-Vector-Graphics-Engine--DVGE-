import { registerRoot } from 'remotion'
import { RemotionRoot } from './Root'

// Entrada principal requerida por el Bundler de Remotion para poder generar el video de forma Headless.
registerRoot(RemotionRoot)
