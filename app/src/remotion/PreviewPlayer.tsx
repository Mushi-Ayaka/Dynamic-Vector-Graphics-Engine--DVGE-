import React from 'react'
import { Player } from '@remotion/player'
import { PluginWrapper } from './PluginWrapper'
import { useStore } from '../store/useStore'

export const PreviewPlayer: React.FC = () => {
  const { properties, activeProject } = useStore()

  return (
    <div 
      style={{ 
        width: '100%', 
        height: '100%', 
        borderRadius: '0px', 
        overflow: 'hidden', 
        background: 'transparent',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Player
        component={PluginWrapper}
        durationInFrames={activeProject?.durationInFrames || 240}
        compositionWidth={Number(activeProject?.width) || 1920}
        compositionHeight={Number(activeProject?.height) || 1080}
        fps={Number(activeProject?.fps) || 60}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          background: 'transparent'
        }}
        controls
        autoPlay
        loop
        inputProps={{ ...properties, _isPreview: true }}
        acknowledgeRemotionLicense={true}
      />
    </div>
  )
}
