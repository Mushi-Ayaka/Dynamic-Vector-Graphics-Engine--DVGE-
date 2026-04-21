import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { FolderOpen, Plus } from 'lucide-react';
import './HomeMenu.css';

export const HomeMenu: React.FC = () => {
    const { loadProject, plugins } = useStore();
    const [projects, setProjects] = useState<any[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newProjName, setNewProjName] = useState('');
    const [selectedPlugin, setSelectedPlugin] = useState('');

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

            <div className="home-footer">
                <span><FolderOpen size={14} /> v3.4.0 </span>
                <span>•</span>
                <span>Jonatan Barón</span>
            </div>
        </div>
    );
};
