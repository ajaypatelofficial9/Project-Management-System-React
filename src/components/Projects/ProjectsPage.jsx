import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getUserAuthData } from '../../redux/AuthSlice/index.slice.jsx';
import { setProjects, addProject, updateProjectInList, getProjects } from '../../redux/ProjectSlice/index.slice.jsx';
import ProjectService from '../../services/project.service.js';
import AppLayout from '../common/AppLayout.jsx';
import Spinner from '../common/Spinner.jsx';
import EmptyState from '../common/EmptyState.jsx';
import Modal from '../common/Modal.jsx';
import Badge from '../common/Badge.jsx';
import baseRoutes from '../../constants/routes.js';
import { toast } from 'react-toastify';

function ProjectsPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const userAuthData = useSelector(getUserAuthData);
    const projects = useSelector(getProjects);
    const isAdmin = userAuthData?.role === 'admin';

    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingProject, setEditingProject] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name: '', description: '', assignedUserIds: [] });
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        loadProjects();
        if (isAdmin) loadUsers();
    }, []);

    const loadProjects = async () => {
        setLoading(true);
        const res = await ProjectService.getAll();
        if (res.status === 200) {
            dispatch(setProjects(Array.isArray(res.data) ? res.data : []));
        }
        setLoading(false);
    };

    const loadUsers = async () => {
        const res = await ProjectService.getAllUsers();
        if (res.status === 200) {
            setAllUsers(Array.isArray(res.data) ? res.data.filter((u) => u.role === 'user') : []);
        }
    };

    const validate = () => {
        const errs = {};
        if (!form.name.trim()) {
            errs.name = 'Project name is required.';
        } else if (form.name.trim().length < 2) {
            errs.name = 'Name must be at least 2 characters.';
        }
        return errs;
    };

    const handleFormChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (formErrors[field]) {
            setFormErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleCreate = async () => {
        const errs = validate();
        if (Object.keys(errs).length) { setFormErrors(errs); return; }
        setSaving(true);
        const res = await ProjectService.create(form);
        setSaving(false);
        if (res.status === 200 || res.status === 201) {
            toast.success('Project created');
            dispatch(addProject(res.data));
            setShowCreateModal(false);
            setForm({ name: '', description: '', assignedUserIds: [] });
            setFormErrors({});
        } else {
            toast.error(res.message || 'Failed to create project');
        }
    };

    const openEditModal = (project, e) => {
        e.stopPropagation();
        setEditingProject(project);
        setForm({
            name: project.name,
            description: project.description || '',
            assignedUserIds: (project.assignedUsers || []).map((u) => u.id),
        });
        setFormErrors({});
        setShowEditModal(true);
    };

    const handleUpdate = async () => {
        const errs = validate();
        if (Object.keys(errs).length) { setFormErrors(errs); return; }
        setSaving(true);
        const res = await ProjectService.update(editingProject.id, {
            name: form.name.trim(),
            description: form.description.trim() || null,
        });
        setSaving(false);
        if (res.status === 200) {
            toast.success('Project updated');
            dispatch(updateProjectInList(res.data));
            setShowEditModal(false);
            setEditingProject(null);
            setForm({ name: '', description: '', assignedUserIds: [] });
            setFormErrors({});
        } else {
            toast.error(res.message || 'Failed to update project');
        }
    };

    const toggleUser = (userId) => {
        setForm((prev) => ({
            ...prev,
            assignedUserIds: prev.assignedUserIds.includes(userId)
                ? prev.assignedUserIds.filter((id) => id !== userId)
                : [...prev.assignedUserIds, userId],
        }));
    };

    if (loading) return <AppLayout title="Projects"><Spinner center size="lg" /></AppLayout>;

    return (
        <AppLayout title="Projects">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Projects</h1>
                    <p className="page-subtitle">
                        {isAdmin ? `${projects.length} total project${projects.length !== 1 ? 's' : ''}` : 'Your assigned projects'}
                    </p>
                </div>
                {isAdmin && (
                    <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
                        New Project
                    </button>
                )}
            </div>

            {projects.length === 0 ? (
                <EmptyState
                    title="No projects yet"
                    description={isAdmin ? 'Create your first project to get started.' : 'You have no assigned projects yet.'}
                    action={isAdmin ? (
                        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>Create Project</button>
                    ) : null}
                />
            ) : (
                <div className="items-grid">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="project-card"
                            onClick={() => navigate(baseRoutes.projectDetailPath(project.id))}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => e.key === 'Enter' && navigate(baseRoutes.projectDetailPath(project.id))}
                            aria-label={`Open project ${project.name}`}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                <h3 className="project-card-title">{project.name}</h3>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                    <Badge value={project.status} />
                                    {isAdmin && (
                                        <button
                                            className="btn btn-outline btn-sm"
                                            onClick={(e) => openEditModal(project, e)}
                                            style={{ padding: '2px 8px', fontSize: '11px' }}
                                        >
                                            Edit
                                        </button>
                                    )}
                                </div>
                            </div>
                            <p className="project-card-desc">{project.description || 'No description provided.'}</p>
                            <div className="project-card-meta">
                                <div className="avatar-stack">
                                    {(project.assignedUsers || []).slice(0, 4).map((u) => (
                                        <div key={u.id} className="avatar-chip" title={`${u.firstName} ${u.lastName}`}>
                                            {u.firstName[0]}{u.lastName?.[0] || ''}
                                        </div>
                                    ))}
                                    {(project.assignedUsers?.length || 0) > 4 && (
                                        <div className="avatar-chip">+{project.assignedUsers.length - 4}</div>
                                    )}
                                </div>
                                <span>{project.tasks?.length || 0} task{project.tasks?.length !== 1 ? 's' : ''}</span>
                            </div>
                            <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-muted)' }}>
                                By {project.creator?.firstName} {project.creator?.lastName} · {new Date(project.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Project Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => { setShowCreateModal(false); setFormErrors({}); setForm({ name: '', description: '', assignedUserIds: [] }); }}
                title="Create New Project"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setShowCreateModal(false)} disabled={saving}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>
                            {saving ? <><Spinner size="sm" /> Creating…</> : 'Create Project'}
                        </button>
                    </>
                }
            >
                <div className="form-group">
                    <label className="form-label">Project Name *</label>
                    <input
                        className="form-control"
                        placeholder="e.g. Website Redesign"
                        value={form.name}
                        onChange={(e) => handleFormChange('name', e.target.value)}
                        maxLength={100}
                    />
                    {formErrors.name && <div className="form-error">{formErrors.name}</div>}
                </div>

                <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Optional project description…"
                        value={form.description}
                        onChange={(e) => handleFormChange('description', e.target.value)}
                        style={{ resize: 'vertical' }}
                        maxLength={1000}
                    />
                </div>

                {allUsers.length > 0 && (
                    <div className="form-group">
                        <label className="form-label">Assign Users</label>
                        <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 5, padding: 8 }}>
                            {allUsers.map((u) => (
                                <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 4px', cursor: 'pointer', fontSize: 13 }}>
                                    <input
                                        type="checkbox"
                                        checked={form.assignedUserIds.includes(u.id)}
                                        onChange={() => toggleUser(u.id)}
                                    />
                                    <span>{u.firstName} {u.lastName}</span>
                                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                )}
            </Modal>

            {/* Edit Project Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => { setShowEditModal(false); setEditingProject(null); setFormErrors({}); }}
                title="Edit Project"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => { setShowEditModal(false); setEditingProject(null); }} disabled={saving}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleUpdate} disabled={saving}>
                            {saving ? <><Spinner size="sm" /> Saving…</> : 'Save Changes'}
                        </button>
                    </>
                }
            >
                <div className="form-group">
                    <label className="form-label">Project Name *</label>
                    <input
                        className="form-control"
                        placeholder="e.g. Website Redesign"
                        value={form.name}
                        onChange={(e) => handleFormChange('name', e.target.value)}
                        maxLength={100}
                    />
                    {formErrors.name && <div className="form-error">{formErrors.name}</div>}
                </div>

                <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Optional project description…"
                        value={form.description}
                        onChange={(e) => handleFormChange('description', e.target.value)}
                        style={{ resize: 'vertical' }}
                        maxLength={1000}
                    />
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    To assign/reassign members, use the "Manage Members" button on the project detail page.
                </p>
            </Modal>
        </AppLayout>
    );
}

export default ProjectsPage;
