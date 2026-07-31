import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getUserAuthData } from '../../redux/AuthSlice/index.slice.jsx';
import { setProjects } from '../../redux/ProjectSlice/index.slice.jsx';
import { setTasks } from '../../redux/TaskSlice/index.slice.jsx';
import ProjectService from '../../services/project.service.js';
import TaskService from '../../services/task.service.js';
import AppLayout from '../common/AppLayout.jsx';
import Spinner from '../common/Spinner.jsx';
import Badge from '../common/Badge.jsx';
import baseRoutes from '../../constants/routes.js';

function DashboardPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const userAuthData = useSelector(getUserAuthData);
    const isAdmin = userAuthData?.role === 'admin';

    const [projects, setLocalProjects] = useState([]);
    const [tasks, setLocalTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [pRes, tRes] = await Promise.all([
                    ProjectService.getAll(),
                    isAdmin ? TaskService.getAll() : Promise.resolve({ status: 200, data: [] }),
                ]);
                if (pRes.status === 200) {
                    setLocalProjects(Array.isArray(pRes.data) ? pRes.data : []);
                    dispatch(setProjects(Array.isArray(pRes.data) ? pRes.data : []));
                }
                if (tRes.status === 200) {
                    setLocalTasks(Array.isArray(tRes.data) ? tRes.data : []);
                    dispatch(setTasks(Array.isArray(tRes.data) ? tRes.data : []));
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [dispatch, isAdmin]);

    const pendingCount = tasks.filter((t) => t.status === 'pending').length;
    const inProgressCount = tasks.filter((t) => t.status === 'in_progress').length;
    const completedCount = tasks.filter((t) => t.status === 'completed').length;

    const recentProjects = projects.slice(0, 5);
    const recentTasks = tasks.slice(0, 5);

    if (loading) return (
        <AppLayout title="Dashboard">
            <Spinner center size="lg" />
        </AppLayout>
    );

    return (
        <AppLayout title="Dashboard">
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        Welcome back, {userAuthData?.firstName}! 👋
                    </h1>
                    <p className="page-subtitle">
                        {isAdmin ? "Here's your system overview." : "Here are your assigned projects and tasks."}
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon stat-icon-blue">📁</div>
                    <div>
                        <div className="stat-value">{projects.length}</div>
                        <div className="stat-label">{isAdmin ? 'Total Projects' : 'Assigned Projects'}</div>
                    </div>
                </div>
                {isAdmin && (
                    <>
                        <div className="stat-card">
                            <div className="stat-icon stat-icon-yellow">⏳</div>
                            <div>
                                <div className="stat-value">{pendingCount}</div>
                                <div className="stat-label">Pending Tasks</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon stat-icon-purple">🔄</div>
                            <div>
                                <div className="stat-value">{inProgressCount}</div>
                                <div className="stat-label">In Progress</div>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon stat-icon-green">✅</div>
                            <div>
                                <div className="stat-value">{completedCount}</div>
                                <div className="stat-label">Completed Tasks</div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isAdmin ? '1fr 1fr' : '1fr', gap: 20 }}>
                {/* Recent Projects */}
                <div className="card">
                    <div className="card-header">
                        <span className="card-title">Recent Projects</span>
                        <button className="btn btn-outline btn-sm" onClick={() => navigate(baseRoutes.projects)}>
                            View all
                        </button>
                    </div>
                    {recentProjects.length === 0 ? (
                        <p style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>
                            No projects yet
                        </p>
                    ) : (
                        <div>
                            {recentProjects.map((p) => (
                                <div
                                    key={p.id}
                                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                                    onClick={() => navigate(baseRoutes.projectDetailPath(p.id))}
                                    role="button"
                                    tabIndex={0}
                                    onKeyDown={(e) => e.key === 'Enter' && navigate(baseRoutes.projectDetailPath(p.id))}
                                >
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                                            {p.assignedUsers?.length || 0} member{p.assignedUsers?.length !== 1 ? 's' : ''}
                                        </div>
                                    </div>
                                    <Badge value={p.status} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Tasks — admin only */}
                {isAdmin && (
                    <div className="card">
                        <div className="card-header">
                            <span className="card-title">Recent Tasks</span>
                        </div>
                        {recentTasks.length === 0 ? (
                            <p style={{ fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>
                                No tasks yet
                            </p>
                        ) : (
                            <div>
                                {recentTasks.map((t) => (
                                    <div
                                        key={t.id}
                                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                                        onClick={() => navigate(baseRoutes.taskDetailPath(t.id))}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => e.key === 'Enter' && navigate(baseRoutes.taskDetailPath(t.id))}
                                    >
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 600 }}>{t.title}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.project?.name}</div>
                                        </div>
                                        <Badge value={t.status} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}

export default DashboardPage;
