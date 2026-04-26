import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Formik } from "formik";
import { toast } from 'react-toastify';
import { updateUserAuthdataLogin } from '../../redux/AuthSlice/index.slice.jsx';
import AuthServices from '../../services/auth.service.js';
import baseRoutes from '../../constants/routes.js';
import './index.css'
import validation from './validation'

function UserLogin() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogin = async (values) => {
        const { email, password } = values || {};

        try {
            const payload = { email, password };
            const res = await AuthServices.Login(payload);

            if (res.status === 200) {
                toast.success('Login successfully');
                const userData = {
                    email: email,
                    token: res.data.token,
                    ...res.data.userDetails,
                    role: 'user'
                };
                dispatch(updateUserAuthdataLogin(userData));
                navigate(baseRoutes.userProfile);
            } else {
                toast.error(res.message || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            toast.error('Something went wrong during login');
        }
    }
    return <>
        <Formik
            validationSchema={validation}
            initialValues={{ email: "", password: "" }}
            onSubmit={handleLogin}
        >
            {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
            }) => (
                <div className="login">
                    <div className="form">
                        <form onSubmit={handleSubmit}>
                            <span>Login</span>
                            <input
                                type="email"
                                name="email"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.email}
                                placeholder="Enter email id / username"
                                className="form-control inp_text"
                                id="email"
                            />
                            <p className="error">
                                {errors.email && touched.email && errors.email}
                            </p>
                            <input
                                type="password"
                                name="password"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.password}
                                placeholder="Enter password"
                                className="form-control"
                            />
                            <p className="error">
                                {errors.password && touched.password && errors.password}
                            </p>
                            <button type="submit">Login</button>
                        </form>
                    </div>
                </div>
            )}
        </Formik>
    </>
}
export default UserLogin