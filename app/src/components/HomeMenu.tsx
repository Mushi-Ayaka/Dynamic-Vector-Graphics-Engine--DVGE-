import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { FolderOpen, Plus, ShoppingBag } from 'lucide-react';
import './HomeMenu.css';
import { PluginGallery } from './PluginGallery';

export const HomeMenu: React.FC = () => {
    const { loadProject, plugins, isGalleryOpen, toggleGallery } = useStore();
    const [projects, setProjects] = useState<any[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newProjName, setNewProjName] = useState('');
    const [selectedPlugin, setSelectedPlugin] = useState('');
    const [isAboutOpen, setIsAboutOpen] = useState(false);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        if (window.ipcRenderer) {
            const list = await window.ipcRenderer.getProjects();
            setProjects(list);
        }
    };

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProjName || !selectedPlugin || !window.ipcRenderer) return;

        // Extraer valores predeterminados del schema del plugin
        const plugin = plugins.find(p => p.manifest.id === selectedPlugin);
        const defaultProps: Record<string, any> = {};
        if (plugin && plugin.manifest.schema) {
            plugin.manifest.schema.forEach((field: any) => {
                defaultProps[field.id] = field.defaultValue;
            });
        }

        const proj = await window.ipcRenderer.createProject(newProjName, selectedPlugin, defaultProps);
        if (proj) {
            loadProject(proj);
        } else {
            alert('Error creating project or name already exists.');
        }
    };

    const openProjectFolder = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.ipcRenderer) {
            window.ipcRenderer.openProjectFolder(id);
        }
    };

    return (
        <div className="home-menu-container">
            <div className="home-hero">
                <img src="icon.png" alt="DVGE Logo" className="hero-logo" />
                <h1>Dynamic Vector Graphics Engine (DVGE)</h1>
                <p>Proyectos de Animación Broadcast</p>
            </div>

            <div className="workspace-layout">
                {/* Left Column: Recent Projects */}
                <div className="projects-panel">
                    <div className="panel-header">
                        <h2>Proyectos y Borradores</h2>
                        <button className="dv-btn-small" onClick={() => setIsCreating(!isCreating)}>
                            <Plus size={14} /> Nuevo Proyecto
                        </button>
                    </div>

                    {isCreating && (
                        <form className="create-project-card" onSubmit={handleCreateProject}>
                            <input 
                                className="dv-input" 
                                placeholder="Nombre del proyecto..." 
                                value={newProjName}
                                onChange={e => setNewProjName(e.target.value)}
                                autoFocus
                                required
                            />
                            <select 
                                className="dv-input"
                                value={selectedPlugin}
                                onChange={e => setSelectedPlugin(e.target.value)}
                                required
                            >
                                <option value="" disabled>Selecciona un plugin base...</option>
                                {plugins.map(p => (
                                    <option key={p.manifest.id} value={p.manifest.id}>
                                        {p.manifest.name}
                                    </option>
                                ))}
                            </select>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button type="submit" className="dv-btn">Crear y Abrir</button>
                                <button type="button" className="dv-btn secondary" onClick={() => setIsCreating(false)}>Cancelar</button>
                            </div>
                        </form>
                    )}

                    <div className="projects-list">
                        {projects.map(proj => (
                            <div key={proj.id} className="project-item" onClick={() => loadProject(proj)}>
                                <div className="project-info">
                                    <strong>{proj.name}</strong>
                                    <span className="project-meta">Plugin: {proj.pluginId} • Editado: {new Date(proj.updatedAt).toLocaleDateString()}</span>
                                </div>
                                <div className="project-actions">
                                    <button className="btn-icon" onClick={(e) => openProjectFolder(proj.id, e)} title="Abrir carpeta">
                                        <FolderOpen size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {projects.length === 0 && !isCreating && (
                            <div className="empty-state">No hay proyectos recientes. Crea uno nuevo para comenzar.</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="home-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span><FolderOpen size={14} /> v4.1.0 GA </span>
                    <span>•</span>
                    <span>Jonatan Barón</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        className="dv-btn-small" 
                        style={{ background: 'rgba(228,76,48,0.15)', color: '#E44C30', border: '1px solid rgba(228,76,48,0.3)' }}
                        onClick={toggleGallery}
                    >
                        <ShoppingBag size={14} style={{ marginRight: '5px' }} /> Catálogo de Plugins
                    </button>
                    <button 
                        className="dv-btn-small secondary" 
                        onClick={() => setIsAboutOpen(true)}
                    >
                        ℹ️ Acerca de DVGE
                    </button>
                </div>
            </div>

            {isGalleryOpen && <PluginGallery />}

            {/* Modal "Acerca de" */}
            {isAboutOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 9999
                }}>
                    <div style={{
                        background: 'var(--bg-elevated)', padding: '30px',
                        borderRadius: '8px', maxWidth: '500px', width: '100%',
                        border: '1px solid rgba(255,255,255,0.1)',
                        display: 'flex', flexDirection: 'column', gap: '15px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                            <img src="icon.png" alt="DVGE" style={{ width: '48px', height: '48px' }} />
                            <div>
                                <h2 style={{ margin: 0, fontSize: '18px', color: 'white' }}>Dynamic Vector Graphics Engine</h2>
                                <span style={{ color: '#E44C30', fontSize: '12px', fontWeight: 'bold' }}>[DVGE]-[v4.1.0]-[GA]-[B210426-2305]</span>
                            </div>
                        </div>

                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                            <p>Motor de generación de gráficos broadcast dinámicos, impulsado por arquitecturas <strong>Standalone Client-Host</strong> y tecnología de inyección <strong>Shadow DOM</strong>.</p>
                            
                            <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                                <strong style={{ color: 'white' }}>Desarrollador:</strong> Jonatan Barón<br/>
                                <strong style={{ color: 'white' }}>Arquitectura:</strong> Standalone Client-Host (Sandbox Aislado)<br/>
                                <strong style={{ color: 'white' }}>Motor:</strong> Remotion v4 + Electron<br/>
                            </div>

                            <div style={{ marginTop: '15px', display: 'flex', gap: '15px' }}>
                                <a href="https://github.com/Mushi-Ayaka" target="_blank" rel="noopener" style={{ color: '#E44C30', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold' }}>GitHub</a>
                                <a href="https://portafolio-jonatan-baron.vercel.app/" target="_blank" rel="noopener" style={{ color: '#E44C30', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold' }}>Portafolio</a>
                                <a href="https://mail.google.com/mail/?view=cm&fs=1&to=barojonatan8@gmail.com" target="_blank" rel="noopener" style={{ color: '#E44C30', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold' }}>Contacto</a>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                            <button className="dv-btn" onClick={() => setIsAboutOpen(false)}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
