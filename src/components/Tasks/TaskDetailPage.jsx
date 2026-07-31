import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getUserAuthData } from '../../redux/AuthSlice/index.slice.jsx';
import TaskService from '../../services/task.service.js';
import CommentService from '../../services/comment.service.js';
import AppLayout from '../common/AppLayout.jsx';
import Spinner from '../common/Spinner.jsx';
import EmptyState from '../common/EmptyState.jsx';
import Badge from '../common/Badge.jsx';
import baseRoutes from '../../constants/routes.js';

const STATUS_FLOW = {
    pending: { next: 'in_progress', label: 'Start Progress' },
    in_progress: { next: 'completed', label: 'Mark Completed' },
    completed: null,
};

function TaskDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const userAuthData = useSelector(getUserAuthData);
    const isAdmin = userAuthData?.role === 'admin';
    const currentUserId = userAuthData?.id;

    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    const [commentText, setCommentText] = useState('');
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

    const handleStatusUpdate = async () => {
        const flow = STATUS_FLOW[task.status];
        if (!flow) return;
        setUpdatingStatus(true);
        const res = await TaskService.updateStatus(id, flow.next);
        setUpdatingStatus(false);
        if (res.status === 200) {
            toast.success(`Status updated to "${flow.next.replace('_', ' ')}"`);
            setTask((prev) => ({ ...prev, status: flow.next }));
        } else {
            toast.error(res.message || 'Failed to update status');
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        setSubmittingComment(true);
        const res = await CommentService.create({ text: commentText.trim(), taskId: parseInt(id) });
        setSubmittingComment(false);
        if (res.status === 200 || res.status === 201) {
            toast.success('Comment added');
            setCommentText('');
            // Add to local state immediately, avoid refetch
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
        } else {
            toast.error(res.message || 'Failed to delete comment');
        }
    };

    const canUpdateStatus = () => {
        if (!task) return false;
        if (isAdmin) return STATUS_FLOW[task.status] !== null;
        return task.assignedUserId === currentUserId && STATUS_FLOW[task.status] !== null;
    };

    if (loading) return <AppLayout title="Task Detail"><Spinner center size="lg" /></AppLayout>;
    if (!task) return null;

    const statusFlow = STATUS_FLOW[task.status];
    const comments = task.comments || [];

    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
        <AppLayout title="Task Detail">
            <button
                className="back-link"
                onClick={() => task.project?.id ? navigate(baseRoutes.projectDetailPath(task.project.id)) : navigate(baseRoutes.projects)}
            >
                ← Back to Project
            </button>

            {/* Task Info Card */}
            <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-header">
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                            <h1 style={{ fontSize: 20, fontWeight: 700 }}>{task.title}</h1>
                            <Badge value={task.status} />
                        </div>
                        <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                            Project: <strong style={{ color: 'var(--text-secondary)' }}>{task.project?.name}</strong>
                            &nbsp;&middot;&nbsp;
                            Created by {task.creator?.firstName} {task.creator?.lastName}
                            &nbsp;&middot;&nbsp;
                            {new Date(task.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    {canUpdateStatus() && statusFlow && (
                        <button
                            className={`btn btn-sm ${task.status === 'pending' ? 'btn-primary' : 'btn-success'}`}
                            onClick={handleStatusUpdate}
                            disabled={updatingStatus}
                        >
                            {updatingStatus ? <><Spinner size="sm" /></> : statusFlow.label}
                        </button>
                    )}
                </div>

                {task.description && (
                    <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.6 }}>
                        {task.description}
                    </p>
                )}

                {/* Task metadata row */}
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: 13 }}>
                    <div>
                        <span style={{ color: 'var(--text-muted)' }}>Assigned to: </span>
                        <span style={{ fontWeight: 500 }}>
                            {task.assignedUser
                                ? `${task.assignedUser.firstName} ${task.assignedUser.lastName}`
                                : 'Unassigned'}
                        </span>
                    </div>
                    <div>
                        <span style={{ color: 'var(--text-muted)' }}>Status: </span>
                        <Badge value={task.status} />
                    </div>
                </div>

                {/* Status flow hint */}
                {task.status !== 'completed' && (
                    <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg)', borderRadius: 6, padding: '8px 12px' }}>
                        Status flow: <strong>pending</strong> → <strong>in_progress</strong> → <strong>completed</strong>
                    </div>
                )}
            </div>

            {/* Comments Section */}
            <div className="card">
                <div className="card-header">
                    <span className="card-title">Comments ({comments.length})</span>
                </div>

                {/* Add comment form */}
                <form onSubmit={handleAddComment} style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', gap: 10 }}>
                        <div className="comment-avatar" style={{ flexShrink: 0 }}>
                            {(userAuthData?.firstName?.[0] || '?').toUpperCase()}{(userAuthData?.lastName?.[0] || '').toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                            <textarea
                                className="form-control"
                                rows={2}
                                placeholder="Write a comment…"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                style={{ resize: 'vertical' }}
                            />
                            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-sm"
                                    disabled={submittingComment || !commentText.trim()}
                                >
                                    {submittingComment ? <><Spinner size="sm" /></> : 'Add Comment'}
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
        </AppLayout>
    );
}

export default TaskDetailPage;
