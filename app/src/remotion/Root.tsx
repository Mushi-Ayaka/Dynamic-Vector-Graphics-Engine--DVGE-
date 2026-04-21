import { Composition } from 'remotion'
import { PluginWrapper } from './PluginWrapper'

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="LowerThirdBasic"
        component={PluginWrapper}
        durationInFrames={240} // 4 segundos a 60fps
        fps={60}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
    </>
  )
}
