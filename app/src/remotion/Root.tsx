import React from 'react'
import { Composition } from 'remotion'
import { RenderWrapper } from './RenderWrapper'

/**
 * RemotionRoot — Entry point del bundle de Remotion para render headless.
 *
 * Usa RenderWrapper (no PluginWrapper) porque:
 * - PluginWrapper está diseñado para preview interactivo (Shadow DOM, eventos, APIs web)
 * - RenderWrapper está diseñado para export determinista (DOM normal, síncrono, sin efectos)
 *
 * Los plugins son 100% compatibles con ambos — misma API (ctx, dvEngine.register, etc.)
 */

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="dvge-render-engine"
        component={RenderWrapper}
        durationInFrames={240}
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  )
}
