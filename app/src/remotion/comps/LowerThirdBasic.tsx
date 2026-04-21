import React from 'react'
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion'

export interface LowerThirdBasicProps {
  title: string
  subtitle: string
  barColor: string
}

export const LowerThirdBasic: React.FC<LowerThirdBasicProps> = ({ title, subtitle, barColor }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()

  // 1. Animación de entrada de la barra de acento (Left to Right)
  const barWidth = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.8 },
  })

  // 2. Transparencia y deslizamiento del texto principal
  const titleOpacity = interpolate(frame, [5, 15], [0, 1], { extrapolateRight: 'clamp' })
  const titleY = interpolate(frame, [5, 15], [20, 0], { extrapolateRight: 'clamp' })

  // 3. Transparencia y deslizamiento del subtítulo
  const subtitleOpacity = interpolate(frame, [10, 20], [0, 1], { extrapolateRight: 'clamp' })
  const subtitleY = interpolate(frame, [10, 20], [20, 0], { extrapolateRight: 'clamp' })

  // 4. Animación de Salida (Wipe out final a los 100 frames)
  const exitOpacity = interpolate(frame, [105, 115], [1, 0], { extrapolateRight: 'clamp' })

  return (
    <div
      style={{
        flex: 1,
        // Fondo completamente transparente para canal Alfa
        backgroundColor: 'transparent',
        position: 'relative',
        opacity: exitOpacity,
      }}
    >
      {/* Caja Posicionada Absolutamente (Bottom Left) */}
      <div
        style={{
          position: 'absolute',
          bottom: 150, // Safe margin bottom
          left: 150,   // Safe margin left
          background: 'linear-gradient(to right, rgba(0,0,0,0.65) 0%, transparent 100%)',
          padding: '20px 40px',
          borderRadius: '4px',
          minWidth: '600px',
        }}
      >
        {/* Línea Acento Animada */}
        <div
          style={{
            height: '6px',
            backgroundColor: barColor,
            width: `${barWidth * 100}%`,
            marginBottom: '10px',
            transformOrigin: 'left',
          }}
        />

        {/* Textos Animados */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div
            style={{
              fontSize: '64px',
              fontFamily: 'system-ui, sans-serif',
              fontWeight: 800,
              color: 'white',
              opacity: titleOpacity,
              transform: `translateY(${titleY}px)`,
              letterSpacing: '-1px',
            }}
          >
            {title}
          </div>
          
          <div
            style={{
              fontSize: '32px',
              fontFamily: 'system-ui, sans-serif',
              fontWeight: 400,
              color: 'rgba(255, 255, 255, 0.8)',
              opacity: subtitleOpacity,
              transform: `translateY(${subtitleY}px)`,
            }}
          >
            {subtitle}
          </div>
        </div>
      </div>
    </div>
  )
}
