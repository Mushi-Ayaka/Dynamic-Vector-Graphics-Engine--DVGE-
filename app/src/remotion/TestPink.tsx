import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';

export const TestPink: React.FC = () => {
    const frame = useCurrentFrame();
    const { width, height } = useVideoConfig();
    
    return (
        <div style={{ 
            width, 
            height, 
            backgroundColor: 'magenta', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
        }}>
            <h1 style={{ color: 'white', fontSize: '100px' }}>
                FRAME: {frame}
            </h1>
        </div>
    );
};
