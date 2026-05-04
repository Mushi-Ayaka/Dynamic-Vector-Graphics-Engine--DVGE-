import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FormField } from '../env';
import { useStore } from '../store/useStore';
import { DynamicField } from './InspectorTabs';
import { Plus, Trash2, Settings2, Check, Scissors, X, AlertCircle, FileImage, FolderOpen, RefreshCcw, Link, UploadCloud, Table } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';
import { DataGridEditor } from './DataGridEditor';

// --- Sub-componente: Toast de Notificación ---
const Toast: React.FC<{ message: string; type: 'error' | 'success'; onClear: () => void }> = ({ message, type, onClear }) => {
    useEffect(() => {
        const timer = setTimeout(onClear, 3000);
        return () => clearTimeout(timer);
    }, [onClear]);

    return (
        <div style={{
            position: 'absolute',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: type === 'error' ? '#D32F2F' : '#388E3C',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 600,
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            whiteSpace: 'nowrap'
        }}>
            <AlertCircle size={14} />
            {message}
        </div>
    );
};
// --- Sub-componente: Modal de Recorte Nativo ---
const CropModal: React.FC<{ 
    src: string; 
    onConfirm: (base64: string) => void; 
    onCancel: () => void; 
}> = ({ src, onConfirm, onCancel }) => {
    const { t } = useTranslation();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0, width: 0, height: 0 });
    const [dragging, setDragging] = useState<{ 
        type: 'move' | 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w', 
        startX: number, 
        startY: number, 
        initialCrop: typeof crop 
    } | null>(null);
    const [imgReady, setImgReady] = useState(false);

    const SNAP_THRESHOLD = 12; 
    const GRID_SIZE = 4;

    const getSnappedValue = (value: number, limit: number, size: number = 0) => {
        const center = limit / 2 - size / 2;
        const end = limit - size;
        if (Math.abs(value) < SNAP_THRESHOLD) return 0;
        if (Math.abs(value - center) < SNAP_THRESHOLD) return center;
        if (Math.abs(value - end) < SNAP_THRESHOLD) return end;
        return Math.round(value / GRID_SIZE) * GRID_SIZE;
    };

    const handleImageLoad = () => {
        if (!imgRef.current) return;
        const { clientWidth, clientHeight } = imgRef.current;
        setCrop({ x: 0, y: 0, width: clientWidth, height: clientHeight });
        setImgReady(true);
    };

    const handleMouseDown = (e: React.MouseEvent, type: any) => {
        e.stopPropagation();
        setDragging({ type, startX: e.clientX, startY: e.clientY, initialCrop: { ...crop } });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!dragging || !imgRef.current) return;
        const img = imgRef.current;
        const rect = img.getBoundingClientRect();
        const totalDx = e.clientX - dragging.startX;
        const totalDy = e.clientY - dragging.startY;

        setCrop(() => {
            let { x, y, width, height } = dragging.initialCrop;

            if (dragging.type === 'move') {
                x = getSnappedValue(x + totalDx, rect.width, width);
                y = getSnappedValue(y + totalDy, rect.height, height);
                x = Math.max(0, Math.min(x, rect.width - width));
                y = Math.max(0, Math.min(y, rect.height - height));
            } else {
                // Lógica de redimensionamiento omnidireccional
                if (dragging.type.includes('e')) {
                    const rawW = width + totalDx;
                    width = getSnappedValue(rawW, rect.width - x);
                    width = Math.max(20, Math.min(width, rect.width - x));
                }
                if (dragging.type.includes('w')) {
                    const rawX = x + totalDx;
                    const snappedX = getSnappedValue(rawX, rect.width);
                    const deltaX = x - snappedX;
                    if (width + deltaX > 20 && snappedX >= 0) {
                        x = snappedX;
                        width += deltaX;
                    }
                }
                if (dragging.type.includes('s')) {
                    const rawH = height + totalDy;
                    height = getSnappedValue(rawH, rect.height - y);
                    height = Math.max(20, Math.min(height, rect.height - y));
                }
                if (dragging.type.includes('n')) {
                    const rawY = y + totalDy;
                    const snappedY = getSnappedValue(rawY, rect.height);
                    const deltaY = y - snappedY;
                    if (height + deltaY > 20 && snappedY >= 0) {
                        y = snappedY;
                        height += deltaY;
                    }
                }
            }
            return { x, y, width, height };
        });
    };

    const handleConfirm = () => {
        const canvas = canvasRef.current;
        const img = imgRef.current;
        if (!canvas || !img) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const scaleX = img.naturalWidth / img.clientWidth;
        const scaleY = img.naturalHeight / img.clientHeight;
        canvas.width = crop.width * scaleX;
        canvas.height = crop.height * scaleY;
        ctx.drawImage(img, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, canvas.width, canvas.height);
        onConfirm(canvas.toDataURL('image/png'));
    };

    const ResizeHandle = ({ pos, type }: { pos: any, type: any }) => (
        <div 
            style={{ position: 'absolute', ...pos, width: 12, height: 12, background: '#E44C30', borderRadius: '2px', border: '2px solid #fff', cursor: `${type}-resize`, zIndex: 20, boxShadow: '0 2px 5px rgba(0,0,0,0.5)' }} 
            onMouseDown={e => handleMouseDown(e, type)}
        />
    );

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.96)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', backdropFilter: 'blur(20px)' }}>
            <div style={{ background: '#111', border: '1px solid #333', borderRadius: '12px', width: 'auto', maxWidth: '95vw', maxHeight: '95vh', display: 'flex', flexDirection: 'column', boxShadow: '0 30px 90px rgba(0,0,0,1)' }}>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Scissors size={14} color="#E44C30" />
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#eee', textTransform: 'uppercase', letterSpacing: '2px' }}>{t('crop_professional')}</span>
                    </div>
                    <button onClick={onCancel} style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer' }}><X size={20}/></button>
                </div>
                
                <div 
                    style={{ position: 'relative', overflow: 'hidden', flex: 1, background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: dragging ? 'grabbing' : 'default', padding: '30px' }}
                    onMouseMove={handleMouseMove}
                    onMouseUp={() => setDragging(null)}
                    onMouseLeave={() => setDragging(null)}
                >
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img ref={imgRef} src={src} onLoad={handleImageLoad} style={{ display: 'block', maxWidth: '80vw', maxHeight: '60vh', userSelect: 'none', pointerEvents: 'none', opacity: imgReady ? 0.3 : 0 }} />
                        {imgReady && (
                            <div style={{ position: 'absolute', left: crop.x, top: crop.y, width: crop.width, height: crop.height, border: '1.5px solid #E44C30', boxShadow: '0 0 0 9999px rgba(0,0,0,0.85)', cursor: 'move', zIndex: 10 }} onMouseDown={e => handleMouseDown(e, 'move')}>
                                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                                    <div style={{ position: 'absolute', left: '33.33%', top: 0, bottom: 0, width: '0.5px', background: 'rgba(255,255,255,0.15)' }} />
                                    <div style={{ position: 'absolute', left: '66.66%', top: 0, bottom: 0, width: '0.5px', background: 'rgba(255,255,255,0.15)' }} />
                                    <div style={{ position: 'absolute', top: '33.33%', left: 0, right: 0, height: '0.5px', background: 'rgba(255,255,255,0.15)' }} />
                                    <div style={{ position: 'absolute', top: '66.66%', left: 0, right: 0, height: '0.5px', background: 'rgba(255,255,255,0.15)' }} />
                                </div>
                                
                                {/* Manejadores de esquinas */}
                                <ResizeHandle pos={{ top: -6, left: -6 }} type="nw" />
                                <ResizeHandle pos={{ top: -6, right: -6 }} type="ne" />
                                <ResizeHandle pos={{ bottom: -6, left: -6 }} type="sw" />
                                <ResizeHandle pos={{ bottom: -6, right: -6 }} type="se" />
                                
                                {/* Manejadores de bordes */}
                                <ResizeHandle pos={{ top: -6, left: '50%', marginLeft: -6 }} type="n" />
                                <ResizeHandle pos={{ bottom: -6, left: '50%', marginLeft: -6 }} type="s" />
                                <ResizeHandle pos={{ left: -6, top: '50%', marginTop: -6 }} type="w" />
                                <ResizeHandle pos={{ right: -6, top: '50%', marginTop: -6 }} type="e" />
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ padding: '16px 24px', borderTop: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '8px', color: '#555', textTransform: 'uppercase', fontWeight: 800 }}>{t('output_resolution')}</span>
                            <span style={{ fontSize: '11px', color: '#aaa', fontFamily: 'var(--font-mono)' }}>{Math.round(crop.width)} x {Math.round(crop.height)} px</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button onClick={onCancel} style={{ padding: '10px 24px', background: 'transparent', border: '1px solid #333', color: '#888', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}>{t('cancel')}</button>
                        <button onClick={handleConfirm} style={{ padding: '10px 32px', background: '#E44C30', border: 'none', color: '#fff', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', boxShadow: '0 8px 16px rgba(228,76,48,0.2)' }}>{t('apply_crop')}</button>
                    </div>
                </div>
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
};

export const ArtifactsPanel: React.FC = () => {
    const { t } = useTranslation();
    const { 
        artifactFields, 
        addArtifactField, 
        removeArtifactField, 
        updateArtifactField,
        properties, 
        setProperties,
        activeProject,
        saveProjectState,
        appSettings
    } = useStore();
    
    const [showTypeMenu, setShowTypeMenu] = useState(false);
    const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
    const [cropTarget, setCropTarget] = useState<{ fieldId: string, src: string } | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
    const [physicalAssets, setPhysicalAssets] = useState<{ name: string, path: string }[]>([]);
    const [viewMode, setViewMode] = useState<'fields' | 'explorer'>('fields');
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [datasetToEdit, setDatasetToEdit] = useState<{ id: string, data: string[][] | null } | null>(null);

    const typeLabels: Record<string, string> = {
        'string': t('field_string'),
        'number': t('field_number'),
        'boolean': t('field_boolean'),
        'color': t('field_color'),
        'slider': t('field_slider'),
        'select': t('field_select'),
        'image': t('field_image'),
        'file': t('field_file'),
        'code': t('field_code'),
        'alignment': t('field_alignment'),
        'easing': t('field_easing'),
        'dataset': t('field_dataset')
    };

    const activeProjectId = activeProject?.id;

    const loadPhysicalAssets = useCallback(async () => {
        if (!activeProjectId || !window.ipcRenderer) return;
        try {
            const list = await window.ipcRenderer.listAssets(activeProjectId);
            setPhysicalAssets(list);
        } catch (err) {
            console.error('Error loading assets:', err);
        }
    }, [activeProjectId]);

    useEffect(() => {
        loadPhysicalAssets();
    }, [activeProjectId, loadPhysicalAssets]);

    const handleAddField = useCallback((type: FormField['type'], initialValue: any = null, label: string | null = null) => {
        const id = `art_${type}_${Date.now()}`;
        const newField: FormField = {
            id,
            type,
            label: label || `${typeLabels[type] || type} ${artifactFields.length + 1}`,
            defaultValue: type === 'number' || type === 'slider' ? 0 : type === 'boolean' ? false : ''
        };
        addArtifactField(newField);
        if (initialValue !== null) {
            setProperties({ [id]: initialValue });
        }
        setShowTypeMenu(false);
        setEditingFieldId(id);
        if (appSettings.autoSave) {
            setTimeout(() => saveProjectState(), 100);
        }
    }, [addArtifactField, appSettings.autoSave, artifactFields.length, saveProjectState, setProperties, typeLabels]);

    const handleLinkToArtifact = useCallback(async (assetPath: string, fileName: string) => {
        if (!activeProjectId || !window.ipcRenderer) return;
        try {
            // [v5.8.5] Detección proactiva de tablas antes de indexar (evita mover el archivo antes de leerlo)
            const isTable = fileName.match(/\.(csv|xlsx|xls)$/i);
            
            if (isTable && (window.ipcRenderer as any).parseTableFile) {
                const parseResult = await (window.ipcRenderer as any).parseTableFile(assetPath);
                if (parseResult.success) {
                    // Indexamos para que se mueva a artifacts (esto invalida assetPath para futuras lecturas)
                    const indexResult = await window.ipcRenderer.indexAsset({
                        projectId: activeProjectId,
                        assetPath
                    });
                    
                    if (indexResult.success) {
                        handleAddField('dataset', JSON.stringify(parseResult.data), fileName);
                        setViewMode('fields');
                        setToast({ message: `${t('indexed_msg')} (Dataset): ${fileName}`, type: 'success' });
                        loadPhysicalAssets();
                        return;
                    }
                }
            }

            // Flujo estándar para imágenes y otros archivos
            const result = await window.ipcRenderer.indexAsset({
                projectId: activeProjectId,
                assetPath
            });

            if (result.success && result.filePath) {
                const isImage = fileName.match(/\.(png|jpg|jpeg|webp|gif|svg)$/i);
                const type = isImage ? 'image' : 'file';
                handleAddField(type, result.filePath, fileName);
                setViewMode('fields');
                setToast({ message: `${t('indexed_msg')}: ${fileName}`, type: 'success' });
                loadPhysicalAssets();
            } else {
                setToast({ message: t('error_indexing'), type: 'error' });
            }
        } catch (err) {
            console.error('Error linking artifact:', err);
            setToast({ message: t('error_indexing'), type: 'error' });
        }
    }, [activeProjectId, handleAddField, loadPhysicalAssets, t]);

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingOver(false);
        if (!activeProjectId || !window.ipcRenderer) return;

        const files = Array.from(e.dataTransfer.files);
        const text = e.dataTransfer.getData('text');

        if (files.length > 0) {
            if (files.length === 1) {
                const file = files[0];
                const copyResult = await window.ipcRenderer.copyToProject({
                    projectId: activeProjectId,
                    sourcePath: (file as any).path
                });
                if (copyResult.success && copyResult.filePath) {
                    await handleLinkToArtifact(copyResult.filePath, file.name);
                }
            } else {
                for (const file of files) {
                    await window.ipcRenderer.copyToProject({
                        projectId: activeProjectId,
                        sourcePath: (file as any).path
                    });
                }
                setViewMode('explorer');
                loadPhysicalAssets();
                setToast({ message: `${files.length} ${t('drag_assets_hint')}`, type: 'success' });
            }
        } else if (text) {
            const num = Number(text);
            if (!isNaN(num) && text.trim() !== '') {
                handleAddField('number', num, `Value ${text}`);
            } else {
                handleAddField('string', text, `Text: ${text.substring(0, 10)}...`);
            }
            setViewMode('fields');
            setToast({ message: t('artifact_created'), type: 'success' });
        }
    };

    const handleSaveDataset = (data: string[][]) => {
        if (datasetToEdit) {
            const jsonValue = JSON.stringify(data);
            if (datasetToEdit.id === 'NEW') {
                const id = `art_dataset_${Date.now()}`;
                const newField: FormField = {
                    id,
                    type: 'dataset',
                    label: `Dataset ${artifactFields.length + 1}`,
                    defaultValue: jsonValue
                };
                addArtifactField(newField);
                setProperties({ [id]: jsonValue });
            } else {
                // Actualizamos tanto las propiedades en vivo como el esquema persistente
                setProperties({ [datasetToEdit.id]: jsonValue });
                updateArtifactField(datasetToEdit.id, { defaultValue: jsonValue });
            }

            setToast({ message: t('changes_saved'), type: 'success' });
            
            if (appSettings.autoSave) {
                // Pequeño delay para asegurar sincronización del store
                setTimeout(() => saveProjectState(), 100);
            }
        }
        setDatasetToEdit(null);
    };

    const handleImportExternal = async () => {
        if (!window.ipcRenderer || !activeProjectId) return;
        try {
            const dialogResult = await window.ipcRenderer.showOpenDialog({
                filters: [{ name: 'Imágenes', extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'] }],
                properties: ['openFile'],
            });

            if (dialogResult.canceled || dialogResult.filePaths.length === 0) return;

            const filePath = dialogResult.filePaths[0];
            const result = await window.ipcRenderer.copyToProject({
                projectId: activeProjectId,
                sourcePath: filePath
            });

            if (result.success) {
                setToast({ message: t('changes_saved'), type: 'success' });
                loadPhysicalAssets();
            }
        } catch (err) {
            setToast({ message: t('error_create_project'), type: 'error' });
        }
    };

    const handleRemoveField = (id: string) => {
        removeArtifactField(id);
        if (appSettings.autoSave) {
            setTimeout(() => saveProjectState(), 100);
        }
    };

    const handleOpenCrop = (fieldId: string) => {
        const currentVal = properties[fieldId];
        if (currentVal && typeof currentVal === 'string') {
            let finalSrc = currentVal;
            if (!currentVal.startsWith('http') && !currentVal.startsWith('data') && !currentVal.startsWith('media')) {
                const normalized = currentVal.replace(/\\/g, '/');
                finalSrc = `media://${normalized}`;
            }
            setCropTarget({ fieldId, src: finalSrc });
        } else {
            setToast({ message: t('select_image_first'), type: 'error' });
        }
    };

    const handleCropConfirm = async (base64: string) => {
        if (!cropTarget || !activeProjectId) return;
        try {
            const fileName = `crop_${Date.now()}.png`;
            const result = await window.ipcRenderer.saveArtifact({
                projectId: activeProjectId,
                fileName,
                base64Data: base64
            });

            if (result.success && result.filePath) {
                setProperties({ [cropTarget.fieldId]: result.filePath });
                setCropTarget(null);
                setToast({ message: t('crop_saved'), type: 'success' });
                if (appSettings.autoSave) saveProjectState();
            }
        } catch (err) {
            setToast({ message: t('error_indexing'), type: 'error' });
        }
    };

    return (
        <div 
            onDragOver={e => { e.preventDefault(); setIsDraggingOver(true); }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={handleDrop}
            style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                height: '100%', 
                background: 'var(--bg-primary)', 
                overflow: 'hidden', 
                position: 'relative' 
            }}
        >
            {toast && <Toast message={toast.message} type={toast.type} onClear={() => setToast(null)} />}
            
            {isDraggingOver && (
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(228, 76, 48, 0.1)',
                    border: '2px dashed var(--accent)',
                    zIndex: 1000,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    pointerEvents: 'none'
                }}>
                    <UploadCloud size={48} color="var(--accent)" style={{ marginBottom: '12px' }} />
                    <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '2px' }}>{t('drop_to_import')}</span>
                </div>
            )}

            {cropTarget && (
                <CropModal 
                    src={cropTarget.src} 
                    onConfirm={handleCropConfirm} 
                    onCancel={() => setCropTarget(null)} 
                />
            )}

            {datasetToEdit && (
                <DataGridEditor 
                    initialData={datasetToEdit.data}
                    onSave={handleSaveDataset}
                    onClose={() => setDatasetToEdit(null)}
                />
            )}

            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', flexShrink: 0 }}>
                <button 
                    onClick={() => setViewMode('fields')}
                    className="dv-artifacts-tab"
                    style={{ flex: 1, padding: '10px', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', background: viewMode === 'fields' ? 'var(--bg-primary)' : 'transparent', border: 'none', color: viewMode === 'fields' ? 'var(--accent)' : 'var(--text-disabled)', cursor: 'pointer', borderBottom: viewMode === 'fields' ? '2px solid var(--accent)' : 'none' }}
                >
                    {t('artifacts')}
                </button>
                <button 
                    onClick={() => { setViewMode('explorer'); loadPhysicalAssets(); }}
                    className="dv-explorer-tab"
                    style={{ flex: 1, padding: '10px', fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', background: viewMode === 'explorer' ? 'var(--bg-primary)' : 'transparent', border: 'none', color: viewMode === 'explorer' ? 'var(--accent)' : 'var(--text-disabled)', cursor: 'pointer', borderBottom: viewMode === 'explorer' ? '2px solid var(--accent)' : 'none' }}
                >
                    {t('asset_explorer')}
                </button>
            </div>

            <div style={{ padding: '16px', flex: 1, overflowY: 'auto' }}>
                {viewMode === 'fields' ? (
                    <>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '1.5px', margin: 0 }}>
                                {t('my_artifacts')}
                            </h3>
                            <span className="dv-badge" style={{ fontSize: '9px' }}>{artifactFields.length}</span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {artifactFields.map(field => {
                                const isEditing = editingFieldId === field.id;
                                return (
                                    <div key={field.id} className="dv-artifact-item" style={{ 
                                        padding: '12px', 
                                        background: isEditing ? 'rgba(228, 76, 48, 0.04)' : 'var(--bg-elevated)', 
                                        borderRadius: '6px', 
                                        border: isEditing ? '1px solid var(--accent)' : '1px solid var(--border)'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{ fontSize: '9px', fontWeight: 800, color: isEditing ? 'var(--accent)' : 'var(--text-secondary)', textTransform: 'uppercase' }}>
                                                    {typeLabels[field.type] || field.type}
                                                </span>
                                                {field.type === 'dataset' && properties[field.id] && (
                                                    <span style={{ fontSize: '8px', color: 'var(--text-disabled)', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '10px' }}>
                                                        {(() => {
                                                            try {
                                                                const d = typeof properties[field.id] === 'string' ? JSON.parse(properties[field.id]) : properties[field.id];
                                                                return `${d.length} ${t('rows') || 'filas'}`;
                                                            } catch(e) { return ''; }
                                                        })()}
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                {field.type === 'image' && (
                                                    <button onClick={() => handleOpenCrop(field.id)} className="btn-icon dv-artifact-crop-btn" title={t('crop_image_tooltip')}><Scissors size={13}/></button>
                                                )}
                                                {field.type === 'dataset' && (
                                                    <button onClick={() => {
                                                        let currentData = null;
                                                        const val = properties[field.id];
                                                        if (val) {
                                                            try { 
                                                                currentData = typeof val === 'string' ? JSON.parse(val) : val; 
                                                            } catch(e) {
                                                                console.error("Error parsing dataset JSON:", e);
                                                            }
                                                        }
                                                        setDatasetToEdit({ id: field.id, data: currentData });
                                                    }} className="btn-icon dv-artifact-dataset-btn" title={t('edit_data')}><Table size={13}/></button>
                                                )}
                                                <button onClick={() => setEditingFieldId(isEditing ? null : field.id)} className="btn-icon dv-artifact-edit-btn">
                                                    {isEditing ? <Check size={14} color="var(--accent)"/> : <Settings2 size={14}/>}
                                                </button>
                                                <button onClick={() => handleRemoveField(field.id)} className="btn-icon"><Trash2 size={13}/></button>
                                            </div>
                                        </div>

                                        {isEditing ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                                <div className="dv-field">
                                                    <input className="dv-input dv-artifact-label-input" value={field.label} onChange={e => {
                                                        updateArtifactField(field.id, { label: e.target.value });
                                                        if (appSettings.autoSave) saveProjectState();
                                                    }}/>
                                                </div>
                                                <div className="dv-field">
                                                    <label>{t('description_label')}</label>
                                                    <textarea 
                                                        className="dv-input dv-artifact-desc-input" 
                                                        placeholder={t('artifact_desc_placeholder')}
                                                        rows={2}
                                                        value={field.description || ''} 
                                                        onChange={e => {
                                                            updateArtifactField(field.id, { description: e.target.value });
                                                            if (appSettings.autoSave) saveProjectState();
                                                        }}
                                                    />
                                                </div>
                                                {(field.type === 'number' || field.type === 'slider') && (
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                                                        <div className="dv-field">
                                                            <label>{t('min_label')}</label>
                                                            <input type="number" className="dv-input" value={field.min ?? 0} onChange={e => {
                                                                updateArtifactField(field.id, { min: Number(e.target.value) });
                                                                if (appSettings.autoSave) saveProjectState();
                                                            }}/>
                                                        </div>
                                                        <div className="dv-field">
                                                            <label>{t('max_label')}</label>
                                                            <input type="number" className="dv-input" value={field.max ?? 100} onChange={e => {
                                                                updateArtifactField(field.id, { max: Number(e.target.value) });
                                                                if (appSettings.autoSave) saveProjectState();
                                                            }}/>
                                                        </div>
                                                        <div className="dv-field">
                                                            <label>{t('step_label')}</label>
                                                            <input type="number" className="dv-input" value={field.step ?? 1} onChange={e => {
                                                                updateArtifactField(field.id, { step: Number(e.target.value) });
                                                                if (appSettings.autoSave) saveProjectState();
                                                            }}/>
                                                        </div>
                                                    </div>
                                                )}
                                                {field.type === 'select' && (
                                                    <div className="dv-field">
                                                        <label>{t('options_hint')}</label>
                                                        <textarea className="dv-input" rows={2} value={field.options?.map(o => o.label).join(', ') || ''} onChange={e => {
                                                            updateArtifactField(field.id, { options: e.target.value.split(',').map(s => ({ label: s.trim(), value: s.trim() })) });
                                                            if (appSettings.autoSave) saveProjectState();
                                                        }}/>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <DynamicField 
                                                field={field} 
                                                value={properties[field.id]} 
                                                onChange={(id, val) => {
                                                    setProperties({ [id]: val });
                                                    if (appSettings.autoSave) saveProjectState();
                                                }} 
                                                onOpenDataEditor={(f, data) => setDatasetToEdit({ id: f.id, data })}
                                            />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <h3 style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '1.5px', margin: 0 }}>
                                {t('asset_explorer')}
                            </h3>
                            <div style={{ display: 'flex', gap: '4px' }}>
                                <button onClick={loadPhysicalAssets} className="btn-icon" title={t('refresh_tooltip')}><RefreshCcw size={13}/></button>
                                <button onClick={() => window.ipcRenderer.openProjectFolder(activeProjectId)} className="btn-icon" title={t('open_folder_tooltip')}><FolderOpen size={14}/></button>
                            </div>
                        </div>
                        
                        {physicalAssets.length === 0 ? (
                            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-disabled)', fontSize: '11px', border: '1px dashed var(--border)', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' }}>
                                <span>{t('drag_assets_hint')}</span>
                                <button onClick={handleImportExternal} className="dv-btn" style={{ height: '32px', fontSize: '9px', gap: '6px' }}>
                                    <UploadCloud size={14}/> {t('import_file_btn')}
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                {physicalAssets.map(art => (
                                    <div 
                                        key={art.path} 
                                        style={{ 
                                            background: 'var(--bg-elevated)', 
                                            border: '1px solid var(--border)', 
                                            borderRadius: '6px', 
                                            padding: '8px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '8px'
                                        }}
                                    >
                                        <div style={{ height: '90px', background: '#000', borderRadius: '4px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {art.name.match(/\.(png|jpg|jpeg|webp|gif|svg)$/i) ? (
                                                <img 
                                                    src={`media://${art.path.replace(/\\/g, '/')}`} 
                                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                                />
                                            ) : (
                                                <FileImage size={24} color="var(--text-disabled)"/>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>
                                                {art.name}
                                            </span>
                                            <button 
                                                onClick={() => handleLinkToArtifact(art.path, art.name)}
                                                className="dv-btn"
                                                style={{ height: '24px', fontSize: '8px', gap: '4px', background: 'var(--accent)', color: '#fff', border: 'none' }}
                                            >
                                                <Link size={10}/> {t('load_artifact_btn')}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div style={{ padding: '16px', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', position: 'relative', flexShrink: 0 }}>
                {showTypeMenu && (
                    <div style={{ 
                        position: 'absolute', 
                        bottom: '100%', 
                        left: '8px', 
                        right: '8px', 
                        marginBottom: '8px',
                        background: '#252525', 
                        border: '1px solid var(--accent)', 
                        borderRadius: '4px', 
                        padding: '4px', 
                        zIndex: 100, 
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '4px',
                        boxShadow: '0 -8px 24px rgba(0,0,0,0.5)' 
                    }}>
                        {Object.entries(typeLabels).map(([type, label]) => (
                            <button 
                                key={type} 
                                onClick={() => handleAddField(type as FormField['type'])} 
                                style={{ 
                                    padding: '8px', 
                                    fontSize: '9px', 
                                    textAlign: 'left', 
                                    background: 'rgba(255,255,255,0.02)', 
                                    border: 'none', 
                                    color: '#ccc', 
                                    cursor: 'pointer',
                                    borderRadius: '2px',
                                    fontWeight: 600,
                                    textTransform: 'uppercase'
                                }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                )}
                    <button 
                        onClick={() => setShowTypeMenu(!showTypeMenu)} 
                        className="dv-btn dv-add-artifact-btn" 
                        style={{ gap: '8px', height: '36px', fontSize: '10px', width: '100%' }}
                    >
                        <Plus size={14}/> {t('create_empty_artifact')}
                    </button>
            </div>
        </div>
    );
};
