import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getUserAuthData } from '../../redux/AuthSlice/index.slice.jsx';
import { setTasks, getTasks } from '../../redux/TaskSlice/index.slice.jsx';
import TaskService from '../../services/task.service.js';
import AppLayout from '../common/AppLayout.jsx';
import Spinner from '../common/Spinner.jsx';
import EmptyState from '../common/EmptyState.jsx';
import Badge from '../common/Badge.jsx';
import baseRoutes from '../../constants/routes.js';

function TasksPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const userAuthData = useSelector(getUserAuthData);
    const tasks = useSelector(getTasks);
    const isAdmin = userAuthData?.role === 'admin';

    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        setLoading(true);
        const res = await TaskService.getAll();
        if (res.status === 200) {
            dispatch(setTasks(Array.isArray(res.data) ? res.data : []));
        }
        setLoading(false);
    };

    const filtered = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);

    if (loading) return <AppLayout title="All Tasks"><Spinner center size="lg" /></AppLayout>;

    return (
        <AppLayout title="All Tasks">
            <div className="page-header">
                <div>
                    <h1 className="page-title">All Tasks</h1>
                    <p className="page-subtitle">{tasks.length} task{tasks.length !== 1 ? 's' : ''} across all projects</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    {['all', 'pending', 'in_progress', 'completed'].map((s) => (
                        <button
                            key={s}
                            className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => setFilter(s)}
                        >
                            {s === 'all' ? 'All' : s.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            {filtered.length === 0 ? (
                <EmptyState icon="✅" title="No tasks found" description="No tasks match the selected filter." />
            ) : (
                <div className="card">
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Project</th>
                                    <th>Status</th>
                                    <th>Assigned To</th>
                                    <th>Created</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((task) => (
                                    <tr key={task.id}>
                                        <td style={{ fontWeight: 500 }}>{task.title}</td>
                                        <td>
                                            <button
                                                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: 13, fontWeight: 500, padding: 0 }}
                                                onClick={() => navigate(baseRoutes.projectDetailPath(task.project?.id))}
                                            >
                                                {task.project?.name || '—'}
                                            </button>
                                        </td>
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
                </div>
            )}
        </AppLayout>
    );
}

export default TasksPage;
