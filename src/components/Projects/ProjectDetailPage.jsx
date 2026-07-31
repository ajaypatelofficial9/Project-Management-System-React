import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getUserAuthData } from '../../redux/AuthSlice/index.slice.jsx';
import ProjectService from '../../services/project.service.js';
import TaskService from '../../services/task.service.js';
import AppLayout from '../common/AppLayout.jsx';
import Spinner from '../common/Spinner.jsx';
import EmptyState from '../common/EmptyState.jsx';
import Modal from '../common/Modal.jsx';
import Badge from '../common/Badge.jsx';
import baseRoutes from '../../constants/routes.js';

function ProjectDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const userAuthData = useSelector(getUserAuthData);
    const isAdmin = userAuthData?.role === 'admin';

    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [allUsers, setAllUsers] = useState([]);

    // Task creation modal
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [taskForm, setTaskForm] = useState({ title: '', description: '', assignedUserId: '' });
    const [taskErrors, setTaskErrors] = useState({});
    const [savingTask, setSavingTask] = useState(false);

    // Assign users modal
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [savingAssign, setSavingAssign] = useState(false);

    useEffect(() => {
        loadProject();
        if (isAdmin) loadAllUsers();
    }, [id]);

    const loadProject = async () => {
        setLoading(true);
        const res = await ProjectService.getById(id);
        if (res.status === 200) {
            setProject(res.data);
            setSelectedUserIds((res.data.assignedUsers || []).map((u) => u.id));
        } else {
            toast.error(res.message || 'Project not found');
            navigate(baseRoutes.projects);
        }
        setLoading(false);
    };

    const loadAllUsers = async () => {
        const res = await ProjectService.getAllUsers();
        if (res.status === 200) {
            setAllUsers(Array.isArray(res.data) ? res.data.filter((u) => u.role === 'user') : []);
        }
    };

    const validateTask = () => {
        const errs = {};
        if (!taskForm.title.trim()) errs.title = 'Title is required';
        else if (taskForm.title.trim().length < 2) errs.title = 'Title must be at least 2 characters';
        return errs;
    };

    const handleCreateTask = async () => {
        const errs = validateTask();
        if (Object.keys(errs).length) { setTaskErrors(errs); return; }
        setSavingTask(true);
        const res = await TaskService.create({
            title: taskForm.title,
            description: taskForm.description,
            projectId: parseInt(id),
            assignedUserId: taskForm.assignedUserId ? parseInt(taskForm.assignedUserId) : null,
        });
        setSavingTask(false);
        if (res.status === 200 || res.status === 201) {
            toast.success('Task created!');
            setShowTaskModal(false);
            setTaskForm({ title: '', description: '', assignedUserId: '' });
            setTaskErrors({});
            loadProject();
        } else {
            toast.error(res.message || 'Failed to create task');
        }
    };

    const handleAssignUsers = async () => {
        setSavingAssign(true);
        const res = await ProjectService.assignUsers(id, selectedUserIds);
        setSavingAssign(false);
        if (res.status === 200) {
            toast.success('Users assigned!');
            setShowAssignModal(false);
            loadProject();
        } else {
            toast.error(res.message || 'Failed to assign users');
        }
    };

    const toggleAssignUser = (userId) => {
        setSelectedUserIds((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    if (loading) return <AppLayout title="Project Detail"><Spinner center size="lg" /></AppLayout>;
    if (!project) return null;

    const assignedUserIds = (project.assignedUsers || []).map((u) => u.id);

    return (
        <AppLayout title={project.name}>
            <button className="back-link" onClick={() => navigate(baseRoutes.projects)}>
                ← Back to Projects
            </button>

            {/* Project Info */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-header">
                    <div>
                        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{project.name}</h1>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                            Created by {project.creator?.firstName} {project.creator?.lastName} &middot;{' '}
                            {new Date(project.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <Badge value={project.status} />
                </div>

                {project.description && (
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>{project.description}</p>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Members:</span>
                    {(project.assignedUsers || []).length === 0 ? (
                        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>No members assigned</span>
                    ) : (
                        (project.assignedUsers).map((u) => (
                            <span key={u.id} style={{
                                background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 100,
                                padding: '3px 10px', fontSize: 12, fontWeight: 500,
                            }}>
                                {u.firstName} {u.lastName}
                            </span>
                        ))
                    )}
                    {isAdmin && (
                        <button className="btn btn-outline btn-sm" onClick={() => setShowAssignModal(true)}>
                            Manage Members
                        </button>
                    )}
                </div>
            </div>

            {/* Tasks Section */}
            <div className="card">
                <div className="card-header">
                    <span className="card-title">Tasks ({(project.tasks || []).length})</span>
                    {isAdmin && (
                        <button className="btn btn-primary btn-sm" onClick={() => setShowTaskModal(true)}>
                            + Add Task
                        </button>
                    )}
                </div>

                {(project.tasks || []).length === 0 ? (
                    <EmptyState
                        icon="✅"
                        title="No tasks yet"
                        description={isAdmin ? 'Add the first task to this project.' : 'No tasks have been created yet.'}
                        action={isAdmin ? (
                            <button className="btn btn-primary btn-sm" onClick={() => setShowTaskModal(true)}>Add Task</button>
                        ) : null}
                    />
                ) : (
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Status</th>
                                    <th>Assigned To</th>
                                    <th>Created</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {(project.tasks || []).map((task) => (
                                    <tr key={task.id}>
                                        <td style={{ fontWeight: 500 }}>{task.title}</td>
                                        <td><Badge value={task.status} /></td>
                                        <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                                            {task.assignedUser
                                                ? `${task.assignedUser.firstName} ${task.assignedUser.lastName}`
                                                : <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}
                                        </td>
                                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                            {new Date(task.createdAt).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-outline btn-sm"
                                                onClick={() => navigate(baseRoutes.taskDetailPath(task.id))}
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Task Modal */}
            <Modal
                isOpen={showTaskModal}
                onClose={() => { setShowTaskModal(false); setTaskErrors({}); setTaskForm({ title: '', description: '', assignedUserId: '' }); }}
                title="Create New Task"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setShowTaskModal(false)} disabled={savingTask}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleCreateTask} disabled={savingTask}>
                            {savingTask ? <><Spinner size="sm" /> &nbsp;Creating…</> : 'Create Task'}
                        </button>
                    </>
                }
            >
                <div className="form-group">
                    <label className="form-label">Task Title *</label>
                    <input
                        className="form-control"
                        placeholder="e.g. Design homepage"
                        value={taskForm.title}
                        onChange={(e) => setTaskForm((p) => ({ ...p, title: e.target.value }))}
                    />
                    {taskErrors.title && <div className="form-error">{taskErrors.title}</div>}
                </div>
                <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Optional task description…"
                        value={taskForm.description}
                        onChange={(e) => setTaskForm((p) => ({ ...p, description: e.target.value }))}
                        style={{ resize: 'vertical' }}
                    />
                </div>
                {(project.assignedUsers || []).length > 0 && (
                    <div className="form-group">
                        <label className="form-label">Assign To</label>
                        <select
                            className="form-control"
                            value={taskForm.assignedUserId}
                            onChange={(e) => setTaskForm((p) => ({ ...p, assignedUserId: e.target.value }))}
                        >
                            <option value="">Unassigned</option>
                            {(project.assignedUsers || []).map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.firstName} {u.lastName}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </Modal>

            {/* Assign Users Modal */}
            <Modal
                isOpen={showAssignModal}
                onClose={() => setShowAssignModal(false)}
                title="Manage Project Members"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={() => setShowAssignModal(false)} disabled={savingAssign}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleAssignUsers} disabled={savingAssign}>
                            {savingAssign ? <><Spinner size="sm" /> &nbsp;Saving…</> : 'Save Members'}
                        </button>
                    </>
                }
            >
                {allUsers.length === 0 ? (
                    <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>No regular users found. Create users first.</p>
                ) : (
                    <div style={{ maxHeight: 260, overflowY: 'auto' }}>
                        {allUsers.map((u) => (
                            <label key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px', cursor: 'pointer', fontSize: 14, borderBottom: '1px solid var(--border)' }}>
                                <input
                                    type="checkbox"
                                    checked={selectedUserIds.includes(u.id)}
                                    onChange={() => toggleAssignUser(u.id)}
                                />
                                <div>
                                    <div style={{ fontWeight: 500 }}>{u.firstName} {u.lastName}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</div>
                                </div>
                            </label>
                        ))}
                    </div>
                )}
            </Modal>
        </AppLayout>
    );
}

export default ProjectDetailPage;
