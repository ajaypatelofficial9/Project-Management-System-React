import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import UserService from '../../services/user.service.js';
import AppLayout from '../common/AppLayout.jsx';
import Spinner from '../common/Spinner.jsx';
import EmptyState from '../common/EmptyState.jsx';
import Modal from '../common/Modal.jsx';
import Badge from '../common/Badge.jsx';

const INITIAL_FORM = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    address: '',
    role: 'user',
};

function validate(form) {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'First name is required.';
    else if (form.firstName.trim().length < 2) errs.firstName = 'Must be at least 2 characters.';

    if (!form.lastName.trim()) errs.lastName = 'Last name is required.';
    else if (form.lastName.trim().length < 2) errs.lastName = 'Must be at least 2 characters.';

    if (!form.email.trim()) errs.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = 'Enter a valid email address.';

    if (!form.password) errs.password = 'Password is required.';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters.';

    if (form.address.trim() && form.address.trim().length < 3) errs.address = 'Must be at least 3 characters.';

    return errs;
}

function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(INITIAL_FORM);
    const [formErrors, setFormErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => { loadUsers(); }, []);

    const loadUsers = async () => {
        setLoading(true);
        const res = await UserService.getAll();
        if (res.status === 200) {
            setUsers(Array.isArray(res.data) ? res.data : []);
        } else {
            toast.error(res.message || 'Failed to load users');
        }
        setLoading(false);
    };

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const handleCreate = async () => {
        const errs = validate(form);
        if (Object.keys(errs).length) { setFormErrors(errs); return; }

        setSaving(true);
        const res = await UserService.create({
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            email: form.email.trim().toLowerCase(),
            password: form.password,
            address: form.address.trim() || null,
            role: form.role,
        });
        setSaving(false);

        if (res.status === 200 || res.status === 201) {
            toast.success('User created successfully');
            setShowModal(false);
            setForm(INITIAL_FORM);
            setFormErrors({});
            loadUsers();
        } else {
            toast.error(res.message || 'Failed to create user');
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setForm(INITIAL_FORM);
        setFormErrors({});
        setShowPassword(false);
    };

    const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

    if (loading) return <AppLayout title="Users"><Spinner center size="lg" /></AppLayout>;

    return (
        <AppLayout title="Users">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Users</h1>
                    <p className="page-subtitle">{users.length} registered user{users.length !== 1 ? 's' : ''}</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>
                    Create User
                </button>
            </div>

            {users.length === 0 ? (
                <EmptyState
                    title="No users yet"
                    description="Create your first user."
                    action={<button className="btn btn-primary" onClick={() => setShowModal(true)}>Create User</button>}
                />
            ) : (
                <div className="card" style={{ padding: 0 }}>
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th className="table-cell-center">Role</th>
                                    <th className="table-cell-center">Status</th>
                                    <th>Created</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.id}>
                                        <td style={{ fontWeight: 500 }}>{u.firstName} {u.lastName}</td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                                        <td className="table-cell-center"><Badge value={u.role} /></td>
                                        <td className="table-cell-center"><Badge value={u.status} /></td>
                                        <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(u.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create User Modal */}
            <Modal
                isOpen={showModal}
                onClose={closeModal}
                title="Create New User"
                footer={
                    <>
                        <button className="btn btn-secondary" onClick={closeModal} disabled={saving}>Cancel</button>
                        <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>
                            {saving ? <><Spinner size="sm" /> Creating…</> : 'Create User'}
                        </button>
                    </>
                }
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
                    <div className="form-group">
                        <label className="form-label">First Name *</label>
                        <input
                            className="form-control"
                            placeholder="John"
                            value={form.firstName}
                            onChange={(e) => handleChange('firstName', e.target.value)}
                            maxLength={50}
                        />
                        {formErrors.firstName && <div className="form-error">{formErrors.firstName}</div>}
                    </div>
                    <div className="form-group">
                        <label className="form-label">Last Name *</label>
                        <input
                            className="form-control"
                            placeholder="Doe"
                            value={form.lastName}
                            onChange={(e) => handleChange('lastName', e.target.value)}
                            maxLength={50}
                        />
                        {formErrors.lastName && <div className="form-error">{formErrors.lastName}</div>}
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input
                        type="email"
                        className="form-control"
                        placeholder="user@example.com"
                        value={form.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        maxLength={100}
                    />
                    {formErrors.email && <div className="form-error">{formErrors.email}</div>}
                </div>

                <div className="form-group">
                    <label className="form-label">Password *</label>
                    <div style={{ position: 'relative' }}>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            className="form-control"
                            placeholder="Min. 6 characters"
                            value={form.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                            style={{ paddingRight: 36 }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((p) => !p)}
                            style={{
                                position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13,
                            }}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? 'Hide' : 'Show'}
                        </button>
                    </div>
                    {formErrors.password && <div className="form-error">{formErrors.password}</div>}
                </div>

                <div className="form-group">
                    <label className="form-label">Address</label>
                    <input
                        className="form-control"
                        placeholder="Optional"
                        value={form.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                        maxLength={200}
                    />
                    {formErrors.address && <div className="form-error">{formErrors.address}</div>}
                </div>

                <div className="form-group">
                    <label className="form-label">Role</label>
                    <select
                        className="form-control"
                        value={form.role}
                        onChange={(e) => handleChange('role', e.target.value)}
                    >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
            </Modal>
        </AppLayout>
    );
}

export default UsersPage;
