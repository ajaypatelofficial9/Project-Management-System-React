import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Formik } from 'formik';
import { toast } from 'react-toastify';
import AuthServices from '../../services/auth.service.js';
import baseRoutes from '../../constants/routes.js';
import validation from './validation.jsx';
import Spinner from '../common/Spinner.jsx';

function UserSignup() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    const handleImageUpload = async (file, setFieldValue) => {
        if (!file) return;
        setIsUploadingImage(true);
        try {
            const uploadRes = await AuthServices.UploadProfilePhoto(file);
            if (uploadRes.status === 200) {
                toast.success('Profile photo uploaded');
                setFieldValue('profileImageURL', uploadRes.data.profileImageURL);
            } else {
                toast.error(uploadRes.message || 'Upload failed');
            }
        } catch {
            toast.error('Failed to upload profile photo');
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleSignup = async (values, { setSubmitting }) => {
        try {
            const res = await AuthServices.SignUp({
                firstName: values.firstName,
                lastName: values.lastName,
                address: values.address,
                email: values.email,
                password: values.password,
                profileImageURL: values.profileImageURL,
            });
            if (res.status === 200) {
                toast.success('Account created! Please sign in.');
                navigate(baseRoutes.loginPage);
            } else {
                toast.error(res.message || 'Signup failed');
            }
        } catch {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card" style={{ maxWidth: 480 }}>
                <div className="auth-logo">
                    <div className="auth-logo-icon">🚀</div>
                    <div className="auth-logo-title">ProjectMS</div>
                    <div className="auth-logo-sub">Create your account</div>
                </div>

                <Formik
                    validationSchema={validation}
                    initialValues={{ firstName: '', lastName: '', address: '', email: '', password: '', profileImageURL: null }}
                    onSubmit={handleSignup}
                >
                    {({ values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue, isSubmitting }) => (
                        <form onSubmit={handleSubmit} noValidate>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="firstName">First name</label>
                                    <input
                                        id="firstName"
                                        type="text"
                                        name="firstName"
                                        className="form-control"
                                        placeholder="John"
                                        value={values.firstName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                    {errors.firstName && touched.firstName && <div className="form-error">{errors.firstName}</div>}
                                </div>
                                <div className="form-group">
                                    <label className="form-label" htmlFor="lastName">Last name</label>
                                    <input
                                        id="lastName"
                                        type="text"
                                        name="lastName"
                                        className="form-control"
                                        placeholder="Doe"
                                        value={values.lastName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                    />
                                    {errors.lastName && touched.lastName && <div className="form-error">{errors.lastName}</div>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="email">Email address</label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    placeholder="you@example.com"
                                    value={values.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    autoComplete="email"
                                />
                                {errors.email && touched.email && <div className="form-error">{errors.email}</div>}
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="address">Address</label>
                                <textarea
                                    id="address"
                                    name="address"
                                    className="form-control"
                                    placeholder="123 Main St, City"
                                    value={values.address}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    rows={2}
                                    style={{ resize: 'vertical' }}
                                />
                                {errors.address && touched.address && <div className="form-error">{errors.address}</div>}
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="password">Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        className="form-control"
                                        placeholder="Min. 8 characters"
                                        value={values.password}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        autoComplete="new-password"
                                        style={{ paddingRight: 40 }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((p) => !p)}
                                        style={{
                                            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                                            background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text-muted)',
                                        }}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                                {errors.password && touched.password && <div className="form-error">{errors.password}</div>}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Profile photo (optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="form-control"
                                    disabled={isUploadingImage}
                                    onChange={(e) => {
                                        const file = e.currentTarget.files[0];
                                        if (file) handleImageUpload(file, setFieldValue);
                                    }}
                                />
                                {isUploadingImage && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                                        <Spinner size="sm" /> Uploading…
                                    </div>
                                )}
                                {values.profileImageURL && (
                                    <div style={{ fontSize: 12, color: 'var(--success)', marginTop: 6 }}>✔ Photo ready</div>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-block btn-lg"
                                disabled={isSubmitting || isUploadingImage}
                                style={{ marginTop: 4 }}
                            >
                                {isSubmitting ? <><Spinner size="sm" /> &nbsp;Creating account…</> : 'Create account'}
                            </button>
                        </form>
                    )}
                </Formik>

                <div className="auth-footer">
                    Already have an account?{' '}
                    <Link to={baseRoutes.loginPage}>Sign in</Link>
                </div>
            </div>
        </div>
    );
}

export default UserSignup;
