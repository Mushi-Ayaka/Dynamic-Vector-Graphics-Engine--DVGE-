import React, { useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { FolderOpen, Plus, ShoppingBag, Settings, Trash2, Edit3, X, Search, LayoutGrid, List } from 'lucide-react';
import { useTranslation } from '../i18n/useTranslation';
import './HomeMenu.css';
import { PluginGallery } from './PluginGallery';
import { APP_VERSION } from '../version';

const ProjectSettingsModal: React.FC<{
    project: any,
    onClose: () => void,
    onRefresh: () => void
}> = ({ project, onClose, onRefresh }) => {
    const { t } = useTranslation();
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
                    <h3 style={{ margin: 0, fontSize: '14px', color: 'white', fontWeight: 600 }}>{t('project_settings')}</h3>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-disabled)', cursor: 'pointer' }}>
                        <X size={18} />
                    </button>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-label)', marginBottom: '6px', fontWeight: 600, textTransform: 'uppercase' }}>{t('project_name_label')}</label>
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
                            <Trash2 size={14} /> {t('delete_project_btn')}
                        </button>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <span style={{ fontSize: '11px', color: '#ef4444', textAlign: 'center', fontWeight: 600 }}>{t('delete_confirm_msg')}</span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    onClick={() => setIsDeleting(false)}
                                    style={{ flex: 1, padding: '10px', fontSize: '11px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    {t('cancel').toUpperCase()}
                                </button>
                                <button
                                    onClick={handleDelete}
                                    style={{ flex: 1, padding: '10px', fontSize: '11px', background: '#ef4444', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer', fontWeight: 600 }}
                                >
                                    {t('delete').toUpperCase()}
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
    const { t } = useTranslation();
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
    const [settingsProject, setSettingsProject] = useState<any | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

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
            alert(t('error_create_project'));
        }
    };

    const handleProjectClick = (proj: any) => {
        const pluginExists = plugins.some(p => p.manifest.id === proj.pluginId);

        if (!pluginExists) {
            alert(t('integrity_error').replace('{id}', proj.pluginId));
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

            {/* Toolbar: Búsqueda + Acciones */}
            <div className="home-toolbar">
                <div className="home-search">
                    <Search size={14} className="home-search-icon" />
                    <input
                        className="home-search-input"
                        type="text"
                        placeholder={t('search_projects')}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        autoComplete="off"
                    />
                </div>

                <div className="home-toolbar-actions">
                    <button
                        className="home-view-btn"
                        onClick={() => setViewMode('list')}
                        title={t('list_view')}
                        aria-pressed={viewMode === 'list'}
                    >
                        <List size={15} />
                    </button>
                    <button
                        className="home-view-btn"
                        onClick={() => setViewMode('grid')}
                        title={t('grid_view')}
                        aria-pressed={viewMode === 'grid'}
                    >
                        <LayoutGrid size={15} />
                    </button>
                    <button
                        className="dv-btn dv-new-project-btn"
                        onClick={() => setIsCreatingProject(!isCreatingProject)}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <Plus size={14} /> {t('new_project')}
                    </button>
                </div>
            </div>

            {/* Form de creación */}
            {isCreatingProject && (
                <form className="create-project-card" onSubmit={handleCreateProject}>
                    <input
                        className="dv-input"
                        placeholder={t('new_project_placeholder')}
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
                        <option value="" disabled>{t('select_plugin_base')}</option>
                        {plugins.map(p => (
                            <option key={p.manifest.id} value={p.manifest.id}>
                                {p.manifest.name}
                            </option>
                        ))}
                    </select>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button type="submit" className="dv-btn">{t('create_and_open')}</button>
                        <button type="button" className="dv-btn secondary" onClick={() => setIsCreatingProject(false)}>{t('cancel')}</button>
                    </div>
                </form>
            )}

            {/* Proyecto list / grid */}
            <div className={`projects-list ${viewMode === 'grid' ? 'projects-grid' : ''}`}>
                {projects
                    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(proj => (
                        <div key={proj.id} className="project-item dv-project-item" onClick={() => handleProjectClick(proj)}>
                            <div className="project-info">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <strong>{proj.name}</strong>
                                    {!plugins.some(p => p.manifest.id === proj.pluginId) && (
                                        <span style={{ fontSize: '9px', background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>{t('missing_plugin')}</span>
                                    )}
                                </div>
                                <span className="project-meta">Plugin: {proj.pluginId} • {t('edited')}: {new Date(proj.updatedAt).toLocaleDateString()}</span>
                            </div>
                            <div className="project-actions">
                                <button className="btn-icon" onClick={(e) => openSettings(proj, e)} title={t('settings')}>
                                    <Settings size={16} />
                                </button>
                                <button className="btn-icon" onClick={(e) => openProjectFolder(proj.id, e)} title={t('open_folder_tooltip')}>
                                    <FolderOpen size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                {projects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && !isCreatingProject && (
                    <div className="empty-state">
                        {searchQuery ? `${t('no_results')} "${searchQuery}"` : t('no_projects')}
                    </div>
                )}
            </div>

            {settingsProject && (
                <ProjectSettingsModal
                    project={settingsProject}
                    onClose={() => setSettingsProject(null)}
                    onRefresh={fetchProjects}
                />
            )}

            <div className="home-footer">
                <button
                    className="dv-btn-small"
                    style={{ background: 'rgba(228,76,48,0.12)', color: 'var(--accent)', border: '1px solid rgba(228,76,48,0.25)' }}
                    onClick={toggleGallery}
                >
                    <ShoppingBag size={13} style={{ marginRight: '5px' }} /> {t('plugin_catalog')}
                </button>
                <span className="home-footer-meta">v{APP_VERSION}</span>
            </div>

            {isGalleryOpen && <PluginGallery />}

            {/* Modal "Acerca de" se maneja globalmente en App.tsx */}
        </div>
    );
};
