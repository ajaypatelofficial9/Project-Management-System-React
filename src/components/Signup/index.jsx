import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Formik } from "formik";
import { toast } from 'react-toastify';
import { updateUserAuthdataLogin } from '../../redux/AuthSlice/index.slice.jsx';
import AuthServices from '../../services/auth.service.js';
import baseRoutes from '../../constants/routes.js';
import validation from './validation'

function UserSignup() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleImageUpload = async (file, setFieldValue) => {
        if (!file) return;

        try {
            const uploadRes = await AuthServices.UploadProfilePhoto(file);
            if (uploadRes.status === 200) {
                toast.success('Profile photo uploaded successfully');
                setFieldValue('profileImageURL', uploadRes.data.profileImageURL);
            } else {
                toast.error(uploadRes.message || 'Profile upload failed');
            }
        } catch (err) {
            console.error('Image upload error:', err);
            toast.error('Failed to upload profile photo');
        }
    };

    const handleSignup = async (values) => {
        try {
            // Prepare signup payload
            const signupPayload = {
                firstName: values.firstName,
                lastName: values.lastName,
                address: values.address,
                email: values.email,
                password: values.password,
                profileImageURL: values.profileImageURL,
            };

            // Call signup API
            const res = await AuthServices.SignUp(signupPayload);

            if (res.status === 200) {
                toast.success('Signup successfully');
                navigate(baseRoutes.loginPage);
            } else {
                toast.error(res.message || 'Signup failed');
            }
        } catch (err) {
            console.error('Signup error:', err);
            toast.error('Something went wrong during signup');
        }
    }

    const initialValues = {
        firstName: "",
        lastName: "",
        address: "",
        email: "",
        password: "",
        profilePhoto: null,
        profileImageURL: null
    }

    return <>
        <Formik
            validationSchema={validation}
            initialValues={initialValues}
            onSubmit={handleSignup}
        >
            {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                handleSubmit,
                setFieldValue,
            }) => (
                <div className="signup">
                    <div className="form">
                        <form onSubmit={handleSubmit}>
                            <span>Signup</span>
                            <input
                                type="text"
                                name="firstName"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.firstName}
                                placeholder="Enter firstName"
                                className="form-control inp_text"
                                id="firstName"
                            />
                            <p className="error">
                                {errors.firstName && touched.firstName && errors.firstName}
                            </p>
                            <input
                                type="text"
                                name="lastName"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.lastName}
                                placeholder="Enter lastName"
                                className="form-control inp_text"
                                id="lastName"
                            />
                            <p className="error">
                                {errors.lastName && touched.lastName && errors.lastName}
                            </p>
                            <textarea
                                type="text"
                                name="address"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.address}
                                placeholder="Enter address"
                                className="form-control inp_text"
                                id="address"
                            />
                            <p className="error">
                                {errors.address && touched.address && errors.address}
                            </p>
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
                            <input
                                type="file"
                                name="profilePhoto"
                                accept="image/*"
                                onChange={(event) => {
                                    const file = event.currentTarget.files[0];
                                    if (file) {
                                        setFieldValue("profilePhoto", file);
                                        handleImageUpload(file, setFieldValue);
                                    }
                                }}
                                className="form-control"
                            />
                            <p className="error">
                                {errors.profilePhoto && touched.profilePhoto && errors.profilePhoto}
                            </p>
                            <button type="submit">Signup</button>
                        </form>
                    </div>
                </div>
            )}
        </Formik>
    </>
}
export default UserSignup