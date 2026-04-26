import React from 'react';

export type AspectRatio = '16:9' | '9:16' | '1:1' | '4:3' | '21:9' | 'custom';

interface AspectRatioSelectorProps {
    selected: string;
    onSelect: (ratio: string) => void;
}

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ selected, onSelect }) => {
    const ratios = [
        { id: '16:9', label: '16:9 (Landscape)' },
        { id: '9:16', label: '9:16 (Portrait)' },
        { id: '1:1', label: '1:1 (Square)' },
        { id: '4:3', label: '4:3 (Standard)' },
        { id: '21:9', label: '21:9 (Cinematic)' },
        { id: 'custom', label: 'Custom' },
    ];

    return (
        <select
            value={selected}
            onChange={(e) => onSelect(e.target.value)}
            style={{
                background: 'rgba(0,0,0,0.2)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '11px',
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer'
            }}
        >
            {ratios.map(r => (
                <option key={r.id} value={r.id}>
                    {r.label}
                </option>
            ))}
        </select>
    );
};
