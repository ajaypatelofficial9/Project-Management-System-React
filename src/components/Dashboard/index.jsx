import { Formik } from "formik";
import * as Yup from "yup";
import './index.css'
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUserAuthAction, getUserAuthData } from '../../redux/AuthSlice/index.slice.jsx';
import { toast } from 'react-toastify';

function UserProfile() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const userAuthData = useSelector(getUserAuthData);
    const [profilePhoto, setProfilePhoto] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    const handleLogout = () => {
        dispatch(logoutUserAuthAction());
        toast.success('Logged out successfully');
        navigate('/');
    };

    const onSubmit = (values) => {
        console.log("Updated values:", values);
        // Here you can save to localStorage or send to backend
        localStorage.setItem('userProfile', JSON.stringify(values));
        setIsEditing(false);
    }

    const initialValues = JSON.parse(localStorage.getItem('userProfile')) || {
        firstName: userAuthData.firstName || "John",
        lastName: userAuthData.lastName || "Doe",
        address: userAuthData.address || "123 Main St",
        email: userAuthData.email || "john.doe@example.com",
        profilePhoto: null
    };

    const handlePhotoChange = (event, setFieldValue) => {
        const file = event.currentTarget.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfilePhoto(e.target.result);
                setFieldValue("profilePhoto", e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    return <>
        <div className="profile">
            <div className="profile-header" style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <div className="profile-photo">
                    {profilePhoto || initialValues.profilePhoto ? (
                        <img src={profilePhoto || initialValues.profilePhoto} alt="Profile" style={{width: '100px', height: '100px', borderRadius: '50%'}} />
                    ) : (
                        <div style={{width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>No Photo</div>
                    )}
                </div>
                <h2>User Profile</h2>
            </div>
            <Formik
                initialValues={initialValues}
                onSubmit={onSubmit}
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
                    <div className="form">
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                name="firstName"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.firstName}
                                placeholder="Enter firstName"
                                className="form-control inp_text"
                                id="firstName"
                                disabled={!isEditing}
                            />
                            <input
                                type="text"
                                name="lastName"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.lastName}
                                placeholder="Enter lastName"
                                className="form-control inp_text"
                                id="lastName"
                                disabled={!isEditing}
                            />
                            <textarea
                                name="address"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.address}
                                placeholder="Enter address"
                                className="form-control inp_text"
                                id="address"
                                disabled={!isEditing}
                            />
                            <input
                                type="email"
                                name="email"
                                value={values.email}
                                placeholder="Email"
                                className="form-control inp_text mt-2"
                                id="email"
                                readOnly
                            />
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(event) => handlePhotoChange(event, setFieldValue)}
                                className="form-control"
                                disabled={!isEditing}
                            />
                            {!isEditing ? (
                                <button type="button" onClick={() => setIsEditing(true)}>Edit Profile</button>
                            ) : (
                                <>
                                    <button type="submit">Update Profile</button>
                                    <button className="mt-3" type="button" onClick={() => setIsEditing(false)}>Cancel</button>
                                </>
                            )}
                            <button
                                type="button"
                                onClick={handleLogout}
                                style={{
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    marginTop: '20px'
                                }}
                            >
                                Logout
                            </button>
                        </form>
                    </div>
                )}
            </Formik>
        </div>
    </>
}
export default UserProfile