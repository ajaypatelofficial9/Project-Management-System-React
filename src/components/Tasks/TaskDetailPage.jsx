import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getUserAuthData } from '../../redux/AuthSlice/index.slice.jsx';
import TaskService from '../../services/task.service.js';
import ProjectService from '../../services/project.service.js';
import CommentService from '../../services/comment.service.js';
import AppLayout from '../common/AppLayout.jsx';
import Spinner from '../common/Spinner.jsx';
import EmptyState from '../common/EmptyState.jsx';
import Badge from '../common/Badge.jsx';
import Modal from '../common/Modal.jsx';
import baseRoutes from '../../constants/routes.js';

const STATUS_FLOW = {
    pending: { next: 'in_progress', label: 'Start Progress' },
    in_progress: { next: 'completed', label: 'Mark Completed' },
    completed: null,
};

// ── inline validation ──────────────────────────────────────────────────────────
function validateEditForm(form) {
    const errs = {};
    if (!form.title.trim()) {
        errs.title = 'Title is required.';
    } else if (form.title.trim().length < 2) {
        errs.title = 'Title must be at least 2 characters.';
    } else if (form.title.trim().length > 200) {
        errs.title = 'Title must be 200 characters or fewer.';
    }
    if (form.description && form.description.trim().length > 0 && form.description.trim().length < 3) {
        errs.description = 'Description must be at least 3 characters.';
    }
    return errs;
}

function validateComment(text) {
    if (!text.trim()) return 'Comment cannot be empty.';
    if (text.trim().length > 2000) return 'Comment must be 2000 characters or fewer.';
    return null;
}
// ──────────────────────────────────────────────────────────────────────────────

function TaskDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const userAuthData = useSelector(getUserAuthData);
    const isAdmin = userAuthData?.role === 'admin';
    const currentUserId = userAuthData?.id;

    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    // Edit task modal
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({ title: '', description: '', assignedUserId: '' });
    const [editErrors, setEditErrors] = useState({});
    const [savingEdit, setSavingEdit] = useState(false);
    const [projectMembers, setProjectMembers] = useState([]);

    // Delete task
    const [deletingTask, setDeletingTask] = useState(false);

    // Comments
    const [commentText, setCommentText] = useState('');
    const [commentError, setCommentError] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [deletingCommentId, setDeletingCommentId] = useState(null);

    useEffect(() => {
        loadTask();
    }, [id]);

    const loadTask = async () => {
        setLoading(true);
        const res = await TaskService.getById(id);
        if (res.status === 200) {
            setTask(res.data);
        } else {
            toast.error(res.message || 'Task not found');
            navigate(-1);
        }
        setLoading(false);
    };

    // Pre-fill edit form and load the project's members when opening the modal
    const openEditModal = async () => {
        setEditForm({
            title: task.title,
            description: task.description || '',
            assignedUserId: task.assignedUserId ?? '',
        });
        setEditErrors({});

        // Load project members so admin can pick an assignee
        if (task.project?.id) {
            const res = await ProjectService.getById(task.project.id);
            if (res.status === 200) {
                setProjectMembers(res.data.assignedUsers || []);
            }
        }
        setShowEditModal(true);
    };

    const handleEditChange = (field, value) => {
        setEditForm((prev) => ({ ...prev, [field]: value }));
        // Clear error for the field the user just touched
        if (editErrors[field]) {
            setEditErrors((prev) => ({ ...prev, [field]: undefined }));
        }
    };

    const handleSaveEdit = async () => {
        const errs = validateEditForm(editForm);
        if (Object.keys(errs).length) {
            setEditErrors(errs);
            return;
        }

        setSavingEdit(true);
        const payload = {
            title: editForm.title.trim(),
            description: editForm.description.trim() || null,
            assignedUserId: editForm.assignedUserId ? parseInt(editForm.assignedUserId) : null,
        };
        const res = await TaskService.update(id, payload);
        setSavingEdit(false);

        if (res.status === 200) {
            toast.success('Task updated successfully');
            setShowEditModal(false);
            setTask((prev) => ({
                ...prev,
                ...res.data,
                // keep comments intact since update response doesn't include them
                comments: prev.comments,
            }));
        } else {
            toast.error(res.message || 'Failed to update task');
        }
    };

    const handleStatusUpdate = async () => {
        const flow = STATUS_FLOW[task.status];
        if (!flow) return;
        setUpdatingStatus(true);
        const res = await TaskService.updateStatus(id, flow.next);
        setUpdatingStatus(false);
        if (res.status === 200) {
            toast.success(`Status moved to "${flow.next.replace('_', ' ')}"`);
            setTask((prev) => ({ ...prev, status: flow.next }));
        } else {
            toast.error(res.message || 'Failed to update status');
        }
    };

    const handleDeleteTask = async () => {
        if (!window.confirm('Delete this task? This also removes all its comments and cannot be undone.')) return;
        setDeletingTask(true);
        const res = await TaskService.deleteTask(id);
        setDeletingTask(false);
        if (res.status === 200) {
            toast.success('Task deleted');
            navigate(task.project?.id ? baseRoutes.projectDetailPath(task.project.id) : baseRoutes.projects);
        } else {
            toast.error(res.message || 'Failed to delete task');
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        const err = validateComment(commentText);
        if (err) { setCommentError(err); return; }
        setCommentError('');
        setSubmittingComment(true);
        const res = await CommentService.create({ text: commentText.trim(), taskId: parseInt(id) });
        setSubmittingComment(false);
        if (res.status === 200 || res.status === 201) {
            toast.success('Comment added');
            setCommentText('');
            setTask((prev) => ({
                ...prev,
                comments: [...(prev.comments || []), res.data],
            }));
        } else {
            toast.error(res.message || 'Failed to add comment');
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Delete this comment?')) return;
        setDeletingCommentId(commentId);
        const res = await CommentService.deleteComment(commentId);
        setDeletingCommentId(null);
        if (res.status === 200) {
            setTask((prev) => ({
                ...prev,
                comments: (prev.comments || []).filter((c) => c.id !== commentId),
            }));
            toast.success('Comment deleted');
        } else {
            toast.error(res.message || 'Failed to delete comment');
        }
    };

    const canUpdateStatus = () => {
        if (!task) return false;
        if (task.status === 'completed') return false;
        if (isAdmin) return true;
        return task.assignedUserId === currentUserId;
    };

    const formatDate = (d) =>
        new Date(d).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });

    if (loading) return <AppLayout title="Task Detail"><Spinner center size="lg" /></AppLayout>;
    if (!task) return null;

    const statusFlow = STATUS_FLOW[task.status];
    const comments = task.comments || [];

    return (
        <AppLayout title="Task Detail">
            <button
                className="back-link"
                onClick={() =>
                    task.project?.id
                        ? navigate(baseRoutes.projectDetailPath(task.project.id))
                        : navigate(baseRoutes.projects)
                }
            >
                ← Back to Project
            </button>

            {/* ── Task Info Card ── */}
            <div className="card" style={{ marginBottom: 24 }}>
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
                            <h1 style={{ fontSize: 20, fontWeight: 700 }}>{task.title}</h1>
                            <Badge value={task.status} />
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                            Project:&nbsp;
                            <strong style={{ color: 'var(--text-secondary)' }}>{task.project?.name}</strong>
                            &nbsp;&middot;&nbsp;
                            Created by {task.creator?.firstName} {task.creator?.lastName}
                            &nbsp;&middot;&nbsp;
                            {new Date(task.createdAt).toLocaleDateString()}
                        </p>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                        {canUpdateStatus() && statusFlow && (
                            <button
                                className={`btn btn-sm ${task.status === 'pending' ? 'btn-primary' : 'btn-success'}`}
                                onClick={handleStatusUpdate}
                                disabled={updatingStatus}
                            >
                                {updatingStatus ? <Spinner size="sm" /> : statusFlow.label}
                            </button>
                        )}
                        {isAdmin && (
                            <>
                                <button className="btn btn-outline btn-sm" onClick={openEditModal}>
                                    ✏️ Edit Task
                                </button>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={handleDeleteTask}
                                    disabled={deletingTask}
                                >
                                    {deletingTask ? <Spinner size="sm" /> : '🗑 Delete'}
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Description */}
                {task.description ? (
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
                        {task.description}
                    </p>
                ) : (
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, fontStyle: 'italic' }}>
                        No description provided.
                    </p>
                )}

                {/* Meta row */}
                <div style={{
                    display: 'flex', gap: 24, flexWrap: 'wrap',
                    paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: 13,
                }}>
                    <div>
                        <span style={{ color: 'var(--text-muted)' }}>Assigned to:&nbsp;</span>
                        <span style={{ fontWeight: 500 }}>
                            {task.assignedUser
                                ? `${task.assignedUser.firstName} ${task.assignedUser.lastName}`
                                : <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}
                        </span>
                    </div>
                    <div>
                        <span style={{ color: 'var(--text-muted)' }}>Status:&nbsp;</span>
                        <Badge value={task.status} />
                    </div>
                </div>

                {/* Status flow hint */}
                {task.status !== 'completed' && (
                    <div style={{
                        marginTop: 12, fontSize: 12, color: 'var(--text-muted)',
                        background: 'var(--bg)', borderRadius: 6, padding: '8px 12px',
                    }}>
                        Status flow:&nbsp;
                        <strong style={{ color: task.status === 'pending' ? 'var(--warning)' : 'var(--text-muted)' }}>pending</strong>
                        &nbsp;→&nbsp;
                        <strong style={{ color: task.status === 'in_progress' ? 'var(--info)' : 'var(--text-muted)' }}>in progress</strong>
                        &nbsp;→&nbsp;
                        <strong style={{ color: 'var(--success)' }}>completed</strong>
                    </div>
                )}
            </div>

            {/* ── Comments Section ── */}
            <div className="card">
                <div className="card-header">
                    <span className="card-title">Comments ({comments.length})</span>
                </div>

                {/* Add comment form */}
                <form onSubmit={handleAddComment} style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <div className="comment-avatar" style={{ flexShrink: 0 }}>
                            {(userAuthData?.firstName?.[0] || '?').toUpperCase()}
                            {(userAuthData?.lastName?.[0] || '').toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                            <textarea
                                className="form-control"
                                rows={2}
                                placeholder="Write a comment…"
                                value={commentText}
                                onChange={(e) => {
                                    setCommentText(e.target.value);
                                    if (commentError) setCommentError('');
                                }}
                                style={{ resize: 'vertical' }}
                                maxLength={2000}
                            />
                            {commentError && (
                                <div className="form-error" style={{ marginTop: 4 }}>{commentError}</div>
                            )}
                            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                                    {commentText.length}/2000
                                </span>
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-sm"
                                    disabled={submittingComment || !commentText.trim()}
                                >
                                    {submittingComment ? <Spinner size="sm" /> : 'Add Comment'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Comment list */}
                {comments.length === 0 ? (
                    <EmptyState icon="💬" title="No comments yet" description="Be the first to comment on this task." />
                ) : (
                    <div>
                        {comments.map((comment) => (
                            <div key={comment.id} className="comment-item">
                                <div className="comment-avatar">
                                    {(comment.author?.firstName?.[0] || '?').toUpperCase()}
                                    {(comment.author?.lastName?.[0] || '').toUpperCase()}
                                </div>
                                <div className="comment-body">
                                    <div>
                                        <span className="comment-author">
                                            {comment.author?.firstName} {comment.author?.lastName}
                                        </span>
                                        <span className="comment-date">{formatDate(comment.createdAt)}</span>
                                    </div>
                                    <p className="comment-text">{comment.text}</p>
                                </div>
                                {(isAdmin || comment.authorId === currentUserId) && (
                                    <button
                                        className="btn btn-danger btn-sm"
                                        style={{ alignSelf: 'flex-start', flexShrink: 0 }}
                                        onClick={() => handleDeleteComment(comment.id)}
                                        disabled={deletingCommentId === comment.id}
                                        aria-label="Delete comment"
                                    >
                                        {deletingCommentId === comment.id ? <Spinner size="sm" /> : '🗑'}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Edit Task Modal (admin only) ── */}
            <Modal
                isOpen={showEditModal}
                onClose={() => { setShowEditModal(false); setEditErrors({}); }}
                title="Edit Task"
                footer={
                    <>
                        <button
                            className="btn btn-secondary"
                            onClick={() => { setShowEditModal(false); setEditErrors({}); }}
                            disabled={savingEdit}
                        >
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={handleSaveEdit} disabled={savingEdit}>
                            {savingEdit ? <><Spinner size="sm" />&nbsp;Saving…</> : 'Save Changes'}
                        </button>
                    </>
                }
            >
                {/* Title */}
                <div className="form-group">
                    <label className="form-label">Task Title *</label>
                    <input
                        className="form-control"
                        placeholder="e.g. Design homepage"
                        value={editForm.title}
                        onChange={(e) => handleEditChange('title', e.target.value)}
                        maxLength={200}
                    />
                    {editErrors.title && <div className="form-error">{editErrors.title}</div>}
                </div>

                {/* Description */}
                <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                        className="form-control"
                        rows={3}
                        placeholder="Optional task description…"
                        value={editForm.description}
                        onChange={(e) => handleEditChange('description', e.target.value)}
                        style={{ resize: 'vertical' }}
                        maxLength={2000}
                    />
                    {editErrors.description && <div className="form-error">{editErrors.description}</div>}
                </div>

                {/* Assigned user */}
                <div className="form-group">
                    <label className="form-label">Assigned To</label>
                    {projectMembers.length === 0 ? (
                        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                            No members in this project. Add members to the project first before assigning a task.
                        </p>
                    ) : (
                        <select
                            className="form-control"
                            value={editForm.assignedUserId}
                            onChange={(e) => handleEditChange('assignedUserId', e.target.value)}
                        >
                            <option value="">— Unassigned —</option>
                            {projectMembers.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.firstName} {u.lastName} ({u.email})
                                </option>
                            ))}
                        </select>
                    )}
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                        Only members assigned to this project can be selected.
                    </p>
                </div>
            </Modal>
        </AppLayout>
    );
}

export default TaskDetailPage;
