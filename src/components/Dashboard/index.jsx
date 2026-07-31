import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { getUserAuthData, updateUserAuthDataAction } from '../../redux/AuthSlice/index.slice.jsx';
import AuthServices from '../../services/auth.service.js';
import AppLayout from '../common/AppLayout.jsx';
import Spinner from '../common/Spinner.jsx';
import Badge from '../common/Badge.jsx';

function UserProfile() {
    const dispatch = useDispatch();
    const userAuthData = useSelector(getUserAuthData);

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [profileImageURL, setProfileImageURL] = useState(userAuthData?.profileImageURL || null);
    const [profilePreview, setProfilePreview] = useState(userAuthData?.profileImageURL || null);

    useEffect(() => {
        setProfileImageURL(userAuthData?.profileImageURL || null);
        setProfilePreview(userAuthData?.profileImageURL || null);
    }, [userAuthData]);

    const handlePhotoChange = async (event) => {
        const file = event.currentTarget.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { toast.error('File size must be less than 5MB'); return; }
        if (!file.type.startsWith('image/')) { toast.error('Only image files are allowed'); return; }
        setIsUploadingImage(true);
        try {
            const res = await AuthServices.UploadProfilePhoto(file);
            if (res.status === 200) {
                setProfileImageURL(res.data.profileImageURL);
                setProfilePreview(res.data.profileImageURL);
                toast.success('Photo uploaded');
            } else {
                toast.error(res.message || 'Upload failed');
            }
        } catch {
            toast.error('Upload failed');
        } finally {
            setIsUploadingImage(false);
        }
    };

    const handleProfileUpdate = async (values) => {
        setIsSaving(true);
        try {
            const payload = { id: userAuthData?.id, firstName: values.firstName, lastName: values.lastName, address: values.address, profileImageURL };
            const res = await AuthServices.UpdateProfile(payload);
            if (res.status === 200) {
                dispatch(updateUserAuthDataAction({ ...userAuthData, ...payload }));
                toast.success('Profile updated');
                setIsEditing(false);
            } else {
                toast.error(res.message || 'Update failed');
            }
        } catch {
            toast.error('Something went wrong');
        } finally {
            setIsSaving(false);
        }
    };

    const initials = `${(userAuthData?.firstName || '?')[0]}${(userAuthData?.lastName || '')[0] || ''}`.toUpperCase();

    return (
        <AppLayout title="My Profile">
            <div className="page-header">
                <div>
                    <h1 className="page-title">My Profile</h1>
                    <p className="page-subtitle">Manage your personal information</p>
                </div>
            </div>

            <div style={{ maxWidth: 560 }}>
                <div className="card">
                    {/* Avatar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>
                        <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>
                            {profilePreview ? <img src={profilePreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : initials}
                        </div>
                        <div>
                            <div style={{ fontSize: 18, fontWeight: 700 }}>{userAuthData?.firstName} {userAuthData?.lastName}</div>
                            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{userAuthData?.email}</div>
                            <div style={{ marginTop: 6 }}><Badge value={userAuthData?.role || 'user'} /></div>
                        </div>
                    </div>

                    <Formik
                        enableReinitialize
                        initialValues={{
                            firstName: userAuthData?.firstName || '',
                            lastName: userAuthData?.lastName || '',
                            address: userAuthData?.address || '',
                            email: userAuthData?.email || '',
                        }}
                        validationSchema={Yup.object({
                            firstName: Yup.string().min(2).required('First name is required'),
                            lastName: Yup.string().min(2).required('Last name is required'),
                            address: Yup.string().min(3).optional(),
                        })}
                        onSubmit={handleProfileUpdate}
                    >
                        {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
                            <form onSubmit={handleSubmit}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                    <div className="form-group">
                                        <label className="form-label">First Name</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            className="form-control"
                                            value={values.firstName}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            disabled={!isEditing || isSaving}
                                        />
                                        {touched.firstName && errors.firstName && <div className="form-error">{errors.firstName}</div>}
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Last Name</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            className="form-control"
                                            value={values.lastName}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            disabled={!isEditing || isSaving}
                                        />
                                        {touched.lastName && errors.lastName && <div className="form-error">{errors.lastName}</div>}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input type="email" name="email" className="form-control" value={values.email} readOnly />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Address</label>
                                    <textarea
                                        name="address"
                                        className="form-control"
                                        rows={2}
                                        value={values.address}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        disabled={!isEditing || isSaving}
                                        style={{ resize: 'vertical' }}
                                    />
                                </div>

                                {isEditing && (
                                    <div className="form-group">
                                        <label className="form-label">Profile Photo</label>
                                        <input type="file" accept="image/*" className="form-control" onChange={handlePhotoChange} disabled={isUploadingImage} />
                                        {isUploadingImage && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, display: 'flex', gap: 6, alignItems: 'center' }}><Spinner size="sm" /> Uploading…</div>}
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                                    {!isEditing ? (
                                        <button type="button" className="btn btn-primary" onClick={() => setIsEditing(true)}>Edit Profile</button>
                                    ) : (
                                        <>
                                            <button type="submit" className="btn btn-primary" disabled={isSaving || isUploadingImage}>
                                                {isSaving ? <><Spinner size="sm" /> &nbsp;Saving…</> : 'Save Changes'}
                                            </button>
                                            <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(false)} disabled={isSaving}>Cancel</button>
                                        </>
                                    )}
                                </div>
                            </form>
                        )}
                    </Formik>
                </div>
            </div>
        </AppLayout>
    );
}

export default UserProfile;
