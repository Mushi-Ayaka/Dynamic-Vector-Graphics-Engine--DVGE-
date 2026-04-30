import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Download, Trash2, RefreshCw, X } from 'lucide-react';

interface GalleryPlugin {
    id: string;
    name: string;
    description: string;
    version: string;
    author: string;
    updatedAt: string;
    files: {
        manifest: any;
        html: string;
        css: string;
        js: string;
    };
}

export const PluginGallery: React.FC = () => {
    const { toggleGallery, plugins, initialize } = useStore();
    const [remotePlugins, setRemotePlugins] = useState<GalleryPlugin[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [confirmingId, setConfirmingId] = useState<string | null>(null);

    useEffect(() => {
        fetchRegistry();
    }, []);

    const fetchRegistry = async () => {
        setLoading(true);
        setError(null);
        
        try {
            console.log('[PluginGallery] Solicitando registro al Main Process...');
            // @ts-ignore
            const result = await window.ipcRenderer.fetchRemoteRegistry();
            
            if (result && result.success) {
                console.log('[PluginGallery] Registro recibido del Main Process.');
                setRemotePlugins(result.data.plugins || []);
            } else {
                throw new Error(result.error);
            }
        } catch (err: any) {
            console.error('[PluginGallery] Error al obtener registro:', err);
            setError(`Error de catálogo: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleInstall = async (p: GalleryPlugin) => {
        if (!window.ipcRenderer) return;
        const success = await window.ipcRenderer.installPlugin(p.id, p.files);
        if (success) {
            initialize(); // Recargar plugins locales
        }
    };

    const handleDeleteConfirm = async (pluginId: string) => {
        if (!window.ipcRenderer) return;
        const success = await window.ipcRenderer.deletePlugin(pluginId);
        if (success) {
            setConfirmingId(null);
            initialize();
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 10000,
            backdropFilter: 'blur(8px)'
        }}>
            <div style={{
                background: 'var(--bg-elevated)', padding: '40px',
                borderRadius: '12px', maxWidth: '900px', width: '100%',
                maxHeight: '80vh', display: 'flex', flexDirection: 'column',
                border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px rgba(0,0,0,0.5)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <div>
                        <h2 style={{ margin: 0, color: 'white' }}>Catálogo de Plugins</h2>
                        <p style={{ margin: '5px 0 0', fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
                            Descubre y descarga nuevos plugins.
                        </p>
                    </div>
                    <button className="btn-icon" onClick={toggleGallery} style={{ padding: '10px' }}>
                        <X size={24} />
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                    {loading && <div style={{ textAlign: 'center', padding: '40px', gridColumn: '1/-1' }}>Cargando catálogo...</div>}
                    {error && (
                        <div style={{ textAlign: 'center', padding: '40px', gridColumn: '1/-1', color: '#E44C30' }}>
                            {error}<br/>
                            <button onClick={fetchRegistry} style={{ marginTop: '10px', background: 'none', border: 'none', color: '#E44C30', cursor: 'pointer', textDecoration: 'underline' }}>
                                Reintentar
                            </button>
                        </div>
                    )}
                    
                    {!loading && !error && remotePlugins.map(p => {
                        const local = plugins.find(lp => lp.manifest.id === p.id);
                        const isOutdated = local && local.manifest.version !== p.version;

                        return (
                            <div key={p.id} style={{ 
                                background: 'rgba(255,255,255,0.03)', 
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '8px', padding: '20px',
                                display: 'flex', flexDirection: 'column', gap: '10px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <h3 style={{ margin: 0, fontSize: '16px', color: 'white' }}>{p.name}</h3>
                                    <span style={{ fontSize: '10px', color: '#E44C30', fontWeight: 'bold' }}>v{p.version}</span>
                                </div>
                                <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.6)', flex: 1 }}>{p.description}</p>
                                
                                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.3)', marginTop: '5px' }}>
                                    Por: {p.author} • {new Date(p.updatedAt).toLocaleDateString()}
                                </div>

                                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                    {!local ? (
                                        <button className="dv-btn" style={{ flex: 1, padding: '8px' }} onClick={() => handleInstall(p)}>
                                            <Download size={14} style={{ marginRight: '5px' }} /> Instalar
                                        </button>
                                    ) : (
                                        <>
                                            {isOutdated ? (
                                                <button className="dv-btn" style={{ flex: 1, padding: '8px' }} onClick={() => handleInstall(p)}>
                                                    <RefreshCw size={14} style={{ marginRight: '5px' }} /> Actualizar
                                                </button>
                                            ) : (
                                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: 'var(--success)' }}>
                                                    ✓ Instalado
                                                </div>
                                            )}
                                            {confirmingId === p.id ? (
                                                <div style={{ display: 'flex', gap: '5px', flex: 1 }}>
                                                    <button className="dv-btn" style={{ flex: 1, padding: '8px', background: '#E44C30', color: 'white', border: 'none' }} onClick={() => handleDeleteConfirm(p.id)}>
                                                        Sí
                                                    </button>
                                                    <button className="dv-btn secondary" style={{ flex: 1, padding: '8px' }} onClick={() => setConfirmingId(null)}>
                                                        No
                                                    </button>
                                                </div>
                                            ) : (
                                                <button 
                                                    className="dv-btn secondary" 
                                                    style={{ padding: '8px', minWidth: '40px' }} 
                                                    onClick={() => setConfirmingId(p.id)}
                                                    title="Borrar plugin local"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
