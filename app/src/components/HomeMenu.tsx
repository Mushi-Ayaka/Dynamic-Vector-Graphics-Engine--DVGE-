import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { FolderOpen, Plus, ShoppingBag, Settings, Trash2, Edit3, X } from 'lucide-react';
import './HomeMenu.css';
import { PluginGallery } from './PluginGallery';
import { APP_VERSION, BUILD_DATE } from '../version';

const ProjectSettingsModal: React.FC<{
    project: any,
    onClose: () => void,
    onRefresh: () => void
}> = ({ project, onClose, onRefresh }) => {
    const [newName, setNewName] = useState(project.name);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleRename = async () => {
        if (!window.ipcRenderer) return;
        // @ts-ignore
        const success = await window.ipcRenderer.updateProject(project.id, { name: newName });
        if (success) {
            onRefresh();
            onClose();
        }
    };

    const handleDelete = async () => {
        if (!window.ipcRenderer) return;
        // @ts-ignore
        const success = await window.ipcRenderer.deleteProject(project.id);
        if (success) {
            onRefresh();
            onClose();
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
            <div style={{
                background: 'var(--bg-elevated)', padding: '24px',
                borderRadius: '12px', maxWidth: '320px', width: '100%',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                animation: 'scaleIn 0.2s ease-out'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '14px', color: 'white', fontWeight: 600 }}>Ajustes del Proyecto</h3>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-disabled)', cursor: 'pointer' }}>
                        <X size={18} />
                    </button>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-label)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }}>Nombre del Proyecto</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                            className="dv-input"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            style={{ height: '36px', fontSize: '13px' }}
                        />
                        <button
                            onClick={handleRename}
                            style={{
                                background: 'var(--accent)',
                                border: 'none',
                                borderRadius: '6px',
                                color: 'white',
                                padding: '0 12px',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Edit3 size={16} />
                        </button>
                    </div>
                </div>

                <div style={{ paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    {!isDeleting ? (
                        <button
                            onClick={() => setIsDeleting(true)}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                padding: '10px',
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                borderRadius: '6px',
                                color: '#ef4444',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Trash2 size={14} /> ELIMINAR PROYECTO
                        </button>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <span style={{ fontSize: '11px', color: '#ef4444', textAlign: 'center', fontWeight: 600 }}>¿ESTÁS SEGURO? NO HAY VUELTA ATRÁS</span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => setIsDeleting(false)}
                                    style={{ flex: 1, padding: '10px', fontSize: '11px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    CANCELAR
                                </button>
                                <button
                                    onClick={handleDelete}
                                    style={{ flex: 1, padding: '10px', fontSize: '11px', background: '#ef4444', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    ELIMINAR
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const HomeMenu: React.FC = () => {
    const loadProject = useStore(state => state.loadProject);
    const plugins = useStore(state => state.plugins);
    const isGalleryOpen = useStore(state => state.isGalleryOpen);
    const toggleGallery = useStore(state => state.toggleGallery);
    const isCreatingProject = useStore(state => state.isCreatingProject);
    const setIsCreatingProject = useStore(state => state.setIsCreatingProject);
    const newProjectName = useStore(state => state.newProjectName);
    const setNewProjectName = useStore(state => state.setNewProjectName);
    const newProjectPluginId = useStore(state => state.newProjectPluginId);
    const setNewProjectPluginId = useStore(state => state.setNewProjectPluginId);
    const [projects, setProjects] = useState<any[]>([]);
    const [isAboutOpen, setIsAboutOpen] = useState(false);
    const [settingsProject, setSettingsProject] = useState<any | null>(null);

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
        if (!newProjectName || !newProjectPluginId || !window.ipcRenderer) return;

        // Extraer valores predeterminados del schema del plugin
        const plugin = plugins.find(p => p.manifest.id === newProjectPluginId);
        const defaultProps: Record<string, any> = {};
        if (plugin && plugin.manifest.schema) {
            plugin.manifest.schema.forEach((field: any) => {
                defaultProps[field.id] = field.defaultValue;
            });
        }

        const proj = await window.ipcRenderer.createProject(newProjectName, newProjectPluginId, defaultProps);
        if (proj) {
            // Limpiar estado de creación antes de cargar
            setNewProjectName('');
            setIsCreatingProject(false);
            loadProject(proj);
        } else {
            alert('Error creating project or name already exists.');
        }
    };

    const handleProjectClick = (proj: any) => {
        const pluginExists = plugins.some(p => p.manifest.id === proj.pluginId);

        if (!pluginExists) {
            alert(`❌ ERROR DE INTEGRIDAD:\nEl plugin "${proj.pluginId}" no está instalado.\n\nInstala el plugin necesario para poder abrir este proyecto.`);
            return;
        }

        loadProject(proj);
    };

    const openProjectFolder = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.ipcRenderer) {
            window.ipcRenderer.openProjectFolder(id);
        }
    };

    const openSettings = (proj: any, e: React.MouseEvent) => {
        e.stopPropagation();
        setSettingsProject(proj);
    };

    return (
        <div className="home-menu-container">
            <div className="home-hero">
                <img src="icon.png" alt="DVGE Logo" className="hero-logo" />
                <h1>Dynamic Vector Graphics Engine</h1>
                <p>Proyectos de Animación Broadcast</p>
            </div>

            <div className="workspace-layout">
                {/* Left Column: Recent Projects */}
                <div className="projects-panel">
                    <div className="panel-header">
                        <h2>Proyectos y Borradores</h2>
                        <button className="dv-btn-small" onClick={() => setIsCreatingProject(!isCreatingProject)}>
                            <Plus size={14} /> Nuevo Proyecto
                        </button>
                    </div>

                    {isCreatingProject && (
                        <form className="create-project-card" onSubmit={handleCreateProject}>
                            <input
                                className="dv-input"
                                placeholder="Nombre del proyecto..."
                                value={newProjectName}
                                onChange={e => setNewProjectName(e.target.value)}
                                autoFocus
                                required
                            />
                            <select
                                className="dv-input"
                                value={newProjectPluginId}
                                onChange={e => setNewProjectPluginId(e.target.value)}
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
                                <button type="button" className="dv-btn secondary" onClick={() => setIsCreatingProject(false)}>Cancelar</button>
                            </div>
                        </form>
                    )}

                    <div className="projects-list">
                        {projects.map(proj => (
                            <div key={proj.id} className="project-item" onClick={() => handleProjectClick(proj)}>
                                <div className="project-info">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <strong>{proj.name}</strong>
                                        {!plugins.some(p => p.manifest.id === proj.pluginId) && (
                                            <span style={{ fontSize: '9px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>MISSING PLUGIN</span>
                                        )}
                                    </div>
                                    <span className="project-meta">Plugin: {proj.pluginId} • Editado: {new Date(proj.updatedAt).toLocaleDateString()}</span>
                                </div>
                                <div className="project-actions">
                                    <button className="btn-icon" onClick={(e) => openSettings(proj, e)} title="Configuración">
                                        <Settings size={16} />
                                    </button>
                                    <button className="btn-icon" onClick={(e) => openProjectFolder(proj.id, e)} title="Abrir carpeta">
                                        <FolderOpen size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {projects.length === 0 && !isCreatingProject && (
                            <div className="empty-state">No hay proyectos recientes. Crea uno nuevo para comenzar.</div>
                        )}
                    </div>
                </div>
            </div>

            {settingsProject && (
                <ProjectSettingsModal
                    project={settingsProject}
                    onClose={() => setSettingsProject(null)}
                    onRefresh={fetchProjects}
                />
            )}

            <div className="home-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <span> v{APP_VERSION} </span>
                    <span>•</span>
                    <span>Jonatan Barón</span>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        className="dv-btn-small"
                        style={{ background: 'rgba(232,80,58,0.15)', color: 'var(--accent)', border: '1px solid rgba(232,80,58,0.3)' }}
                        onClick={toggleGallery}
                    >
                        <ShoppingBag size={14} style={{ marginRight: '5px' }} /> Catálogo de Plugins
                    </button>
                    <button
                        className="dv-btn-small secondary"
                        onClick={() => setIsAboutOpen(true)}
                    >
                        <svg width="14" height="14" style={{ marginRight: '4px', marginBottom: '-2px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg> Acerca de DVGE
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
                                <span style={{ color: 'var(--accent)', fontSize: '12px', fontWeight: 'bold' }}>[DVGE]-[v{APP_VERSION}]-[Build {BUILD_DATE}]</span>
                            </div>
                        </div>

                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                            <p>Motor de generación de gráficos broadcast dinámicos, impulsado por arquitecturas <strong>Standalone Client-Host</strong> y tecnología de inyección <strong>Shadow DOM</strong>.</p>

                            <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                                <strong style={{ color: 'white' }}>Desarrollador:</strong> Jonatan Barón<br />
                                <strong style={{ color: 'white' }}>Arquitectura:</strong> Standalone Client-Host (Sandbox Aislado)<br />
                                <strong style={{ color: 'white' }}>Motor:</strong> Remotion v4 + Electron<br />
                            </div>

                            <div style={{ marginTop: '15px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                                <a href="https://github.com/Mushi-Ayaka/Dynamic-Vector-Graphics-Engine--DVGE-" target="_blank" rel="noopener" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold', paddingTop: '5px' }}>GitHub</a>
                                <a href="https://portafolio-jonatan-baron.vercel.app/" target="_blank" rel="noopener" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold', paddingTop: '5px' }}>Portafolio</a>
                                <a href="https://mail.google.com/mail/?view=cm&fs=1&to=barojonatan8@gmail.com" target="_blank" rel="noopener" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold', paddingTop: '5px' }}>Contacto</a>
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
