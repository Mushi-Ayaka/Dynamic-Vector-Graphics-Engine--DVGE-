import React from 'react';
import { Monitor, Clock, HardDrive, Film } from 'lucide-react';
import { useStore } from '../store/useStore';

interface VideoInfoPanelProps {
    width: number;
    height: number;
    fps: number;
    durationInFrames: number;
}

export const VideoInfoPanel: React.FC<VideoInfoPanelProps> = ({ width, height, fps, durationInFrames }) => {
    const activeProject = useStore(state => state.activeProject);
    const codec = activeProject?.preferredCodec || 'prores';

    const seconds = (durationInFrames / fps).toFixed(1);

    // [v5.9.0] Calibración real basada en renders de usuario
    const multipliers: Record<string, number> = {
        'prores': 0.0988,      // ProRes 4444 (Ajustado a ~34.4MB/150f)
        'standard': 0.0368,   // ProRes 422 (Ajustado a ~13MB/180f)
        'h264': 0.002,     // MP4 (Ajustado a ~800KB/180f)
        'webm': 0.004,       // WebM (Ajustado a ~150MB/180f)
        'gif': 0.0022       // GIF (Ajustado a ~800KB/180f)
    };

    const multiplier = multipliers[codec] || 0.5;
    const estimatedMB = ((width * height * durationInFrames * multiplier) / (1024 * 1024)).toFixed(0);

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '1px',
            background: 'var(--border)',
            border: '1px solid var(--border)',
            borderRadius: '4px',
            overflow: 'hidden',
            marginTop: '20px'
        }}>
            <div className="info-tile">
                <Monitor size={14} color="var(--text-label)" />
                <span>{width} × {height}</span>
            </div>
            <div className="info-tile">
                <Clock size={14} color="var(--text-label)" />
                <span>{seconds}s ({durationInFrames}f)</span>
            </div>
            <div className="info-tile">
                <Film size={14} color="var(--text-label)" />
                <span>{fps} FPS</span>
            </div>
            <div className="info-tile">
                <HardDrive size={14} color="var(--text-label)" />
                <span>~{estimatedMB} MB</span>
            </div>

            <style>{`
                .info-tile {
                    background: var(--bg-surface);
                    padding: 10px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    font-family: var(--font-mono);
                    color: var(--text-primary);
                }
                .info-tile span {
                    font-weight: 500;
                }
            `}</style>
        </div>
    );
};
