import React from 'react';
import { Monitor, Clock, HardDrive, Film } from 'lucide-react';

interface VideoInfoPanelProps {
    width: number;
    height: number;
    fps: number;
    durationInFrames: number;
}

export const VideoInfoPanel: React.FC<VideoInfoPanelProps> = ({ width, height, fps, durationInFrames }) => {
    const seconds = (durationInFrames / fps).toFixed(1);
    
    // Estimación aproximada para ProRes 4444 (~0.5 bytes por píxel por frame)
    const estimatedMB = ((width * height * durationInFrames * 0.5) / (1024 * 1024)).toFixed(0);

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
