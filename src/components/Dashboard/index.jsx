import { Formik } from "formik";
import * as Yup from "yup";
import './index.css'
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUserAuthAction, getUserAuthData, updateUserAuthDataAction } from '../../redux/AuthSlice/index.slice.jsx';
import { toast } from 'react-toastify';
import AuthServices from '../../services/auth.service.js';

function UserProfile() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const userAuthData = useSelector(getUserAuthData);
    const [profilePhotoFile, setProfilePhotoFile] = useState(null);
    const [profilePhotoPreview, setProfilePhotoPreview] = useState(userAuthData?.profileImageURL || null);
    const [profileImageURL, setProfileImageURL] = useState(userAuthData?.profileImageURL || null);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    useEffect(() => {
        setProfilePhotoPreview(userAuthData?.profileImageURL || null);
        setProfileImageURL(userAuthData?.profileImageURL || null);
    }, [userAuthData]);

    const handleLogout = () => {
        dispatch(logoutUserAuthAction());
        toast.success('Logged out successfully');
        navigate('/');
    };

    const handleProfileUpdate = async (values) => {
        setIsSaving(true);
        try {
            const payload = {
                id: userAuthData?.id,
                firstName: values.firstName,
                lastName: values.lastName,
                address: values.address,
                profileImageURL: profileImageURL,
            };

            const response = await AuthServices.UpdateProfile(payload);
            if (response.status === 200) {
                dispatch(updateUserAuthDataAction({
                    ...userAuthData,
                    ...payload,
                }));
                toast.success('Profile updated successfully');
                setIsEditing(false);
            } else {
                toast.error(response.message || 'Profile update failed');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            toast.error('Something went wrong during profile update');
        } finally {
            setIsSaving(false);
        }
    };

    const initialValues = {
        firstName: userAuthData?.firstName || '',
        lastName: userAuthData?.lastName || '',
        address: userAuthData?.address || '',
        email: userAuthData?.email || '',
    };

    const handlePhotoChange = async (event) => {
        const file = event.currentTarget.files[0];
        if (!file) {
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            return;
        }

        if (!file.type.startsWith('image/')) {
            toast.error('Only image files are allowed');
            return;
        }

        setProfilePhotoFile(file);
        setIsUploadingImage(true);

        try {
            const uploadResponse = await AuthServices.UploadProfilePhoto(file);
            if (uploadResponse.status === 200) {
                setProfileImageURL(uploadResponse.data.profileImageURL);
                setProfilePhotoPreview(uploadResponse.data.profileImageURL);
                toast.success('Profile image uploaded successfully');
            } else {
                toast.error(uploadResponse.message || 'Image upload failed');
            }
        } catch (error) {
            console.error('Image upload error:', error);
            toast.error('Failed to upload profile image');
        } finally {
            setIsUploadingImage(false);
        }
    };

    if (!userAuthData || !userAuthData.email) {
        return (
            <div className="profile" style={{ textAlign: 'center', padding: '50px' }}>
                <h2>Loading profile...</h2>
            </div>
        );
    }

    return (
        <div className="profile">
            <div className="profile-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="profile-photo">
                    {profilePhotoPreview ? (
                        <img
                            src={profilePhotoPreview}
                            alt="Profile"
                            style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                    ) : (
                        <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            No Photo
                        </div>
                    )}
                </div>
                <h2>User Profile</h2>
            </div>
            <Formik
                enableReinitialize
                initialValues={initialValues}
                validationSchema={Yup.object({
                    firstName: Yup.string().min(2, 'First name must be at least 2 characters').required('First name is required'),
                    lastName: Yup.string().min(2, 'Last name must be at least 2 characters').required('Last name is required'),
                    address: Yup.string().min(3, 'Address must be at least 3 characters'),
                })}
                onSubmit={handleProfileUpdate}
            >
                {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
                    <div className="form">
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                name="firstName"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.firstName}
                                placeholder="Enter first name"
                                className="form-control inp_text"
                                id="firstName"
                                disabled={!isEditing || isSaving}
                            />
                            {touched.firstName && errors.firstName && <div className="error">{errors.firstName}</div>}

                            <input
                                type="text"
                                name="lastName"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.lastName}
                                placeholder="Enter last name"
                                className="form-control inp_text"
                                id="lastName"
                                disabled={!isEditing || isSaving}
                            />
                            {touched.lastName && errors.lastName && <div className="error">{errors.lastName}</div>}
                            <input
                                type="email"
                                name="email"
                                value={values.email}
                                placeholder="Email"
                                className="form-control inp_text mt-2"
                                id="email"
                                readOnly
                            />

                            <div style={{ margin: '16px 0' }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoChange}
                                    disabled={!isEditing || isUploadingImage}
                                    className="form-control"
                                />
                                {isUploadingImage && <p style={{ marginTop: '8px', color: '#666' }}>Uploading image...</p>}
                            </div>

                            {!isEditing ? (
                                <button type="button" onClick={() => setIsEditing(true)}>Edit Profile</button>
                            ) : (
                                <>
                                    <button type="submit" disabled={isSaving || isUploadingImage}>
                                        {isSaving ? 'Saving...' : 'Update Profile'}
                                    </button>
                                    <button className="mt-3" type="button" onClick={() => setIsEditing(false)} disabled={isSaving || isUploadingImage}>
                                        Cancel
                                    </button>
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
                                    marginTop: '20px',
                                }}
                                disabled={isSaving || isUploadingImage}
                            >
                                Logout
                            </button>
                        </form>
                    </div>
                )}
            </Formik>
        </div>
    );
}
export default UserProfile