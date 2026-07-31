import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Formik } from 'formik';
import { toast } from 'react-toastify';
import { updateUserAuthdataLogin } from '../../redux/AuthSlice/index.slice.jsx';
import AuthServices from '../../services/auth.service.js';
import baseRoutes from '../../constants/routes.js';
import validation from './validation.jsx';
import Spinner from '../common/Spinner.jsx';

function UserLogin() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async (values, { setSubmitting }) => {
        try {
            const res = await AuthServices.Login({ email: values.email, password: values.password });
            if (res.status === 200) {
                toast.success('Welcome back!');
                const userData = {
                    ...res.data.userDetails,
                    email: values.email,
                    token: res.data.token,
                };
                dispatch(updateUserAuthdataLogin(userData));
                navigate(baseRoutes.dashboard);
            } else {
                toast.error(res.message || 'Invalid credentials');
            }
        } catch {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <div className="auth-logo-icon">🚀</div>
                    <div className="auth-logo-title">ProjectMS</div>
                    <div className="auth-logo-sub">Project Management System</div>
                </div>

                <h1 className="auth-title">Sign in</h1>
                <p className="auth-subtitle">Enter your credentials to continue</p>

                <Formik
                    validationSchema={validation}
                    initialValues={{ email: '', password: '' }}
                    onSubmit={handleLogin}
                >
                    {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
                        <form onSubmit={handleSubmit} noValidate>
                            <div className="form-group">
                                <label className="form-label" htmlFor="email">Email address</label>
                                <input
                                    id="email"
                                    type="email"
                                    name="email"
                                    className={`form-control${errors.email && touched.email ? ' is-invalid' : ''}`}
                                    placeholder="you@example.com"
                                    value={values.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    autoComplete="email"
                                />
                                {errors.email && touched.email && (
                                    <div className="form-error">{errors.email}</div>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label" htmlFor="password">Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        className={`form-control${errors.password && touched.password ? ' is-invalid' : ''}`}
                                        placeholder="Your password"
                                        value={values.password}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        autoComplete="current-password"
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
                                {errors.password && touched.password && (
                                    <div className="form-error">{errors.password}</div>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-block btn-lg"
                                disabled={isSubmitting}
                                style={{ marginTop: 8 }}
                            >
                                {isSubmitting ? <><Spinner size="sm" /> &nbsp;Signing in…</> : 'Sign in'}
                            </button>
                        </form>
                    )}
                </Formik>

                <div className="auth-footer">
                    Don&apos;t have an account?{' '}
                    <Link to={baseRoutes.signupPage}>Create one</Link>
                </div>
            </div>
        </div>
    );
}

export default UserLogin;
