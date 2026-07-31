import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
    const [profileImageURL, setProfileImageURL] = useState(userAuthData?.profileImageURL || '');
    const [profilePreview, setProfilePreview] = useState(userAuthData?.profileImageURL || '');

    // Form state — fully controlled, not via Formik so disabled bug can't occur
    const [fields, setFields] = useState({
        firstName: userAuthData?.firstName || '',
        lastName: userAuthData?.lastName || '',
        address: userAuthData?.address || '',
    });
    const [errors, setErrors] = useState({});

    // Sync when redux data changes (e.g. after save)
    useEffect(() => {
        setFields({
            firstName: userAuthData?.firstName || '',
            lastName: userAuthData?.lastName || '',
            address: userAuthData?.address || '',
        });
        setProfileImageURL(userAuthData?.profileImageURL || '');
        setProfilePreview(userAuthData?.profileImageURL || '');
    }, [userAuthData?.id]);

    const handleFieldChange = (field, value) => {
        setFields((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

    const validate = () => {
        const errs = {};
        if (!fields.firstName.trim()) errs.firstName = 'First name is required.';
        else if (fields.firstName.trim().length < 2) errs.firstName = 'Must be at least 2 characters.';
        if (!fields.lastName.trim()) errs.lastName = 'Last name is required.';
        else if (fields.lastName.trim().length < 2) errs.lastName = 'Must be at least 2 characters.';
        if (fields.address.trim() && fields.address.trim().length < 3) errs.address = 'Must be at least 3 characters.';
        return errs;
    };

    const handlePhotoChange = async (event) => {
        const file = event.currentTarget.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { toast.error('File must be less than 5MB'); return; }
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

    const handleSave = async () => {
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); return; }

        setIsSaving(true);
        try {
            const payload = {
                id: userAuthData?.id,
                firstName: fields.firstName.trim(),
                lastName: fields.lastName.trim(),
                address: fields.address.trim() || null,
                profileImageURL: profileImageURL || null,
            };
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

    const handleCancel = () => {
        // Reset back to redux state
        setFields({
            firstName: userAuthData?.firstName || '',
            lastName: userAuthData?.lastName || '',
            address: userAuthData?.address || '',
        });
        setProfileImageURL(userAuthData?.profileImageURL || '');
        setProfilePreview(userAuthData?.profileImageURL || '');
        setErrors({});
        setIsEditing(false);
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

            <div style={{ maxWidth: 520 }}>
                <div className="card">
                    {/* Avatar row */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 16,
                        marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)',
                    }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: '50%', overflow: 'hidden',
                            background: 'var(--primary-light)', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', fontSize: 22, fontWeight: 700,
                            color: 'var(--primary)', flexShrink: 0, border: '1px solid var(--border)',
                        }}>
                            {profilePreview
                                ? <img src={profilePreview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                : initials}
                        </div>
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 700 }}>
                                {userAuthData?.firstName} {userAuthData?.lastName}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                                {userAuthData?.email}
                            </div>
                            <div style={{ marginTop: 6 }}>
                                <Badge value={userAuthData?.role || 'user'} />
                            </div>
                        </div>
                    </div>

                    {/* Form fields */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
                        <div className="form-group">
                            <label className="form-label">First Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={fields.firstName}
                                onChange={(e) => handleFieldChange('firstName', e.target.value)}
                                disabled={!isEditing || isSaving}
                                maxLength={50}
                            />
                            {errors.firstName && <div className="form-error">{errors.firstName}</div>}
                        </div>
                        <div className="form-group">
                            <label className="form-label">Last Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={fields.lastName}
                                onChange={(e) => handleFieldChange('lastName', e.target.value)}
                                disabled={!isEditing || isSaving}
                                maxLength={50}
                            />
                            {errors.lastName && <div className="form-error">{errors.lastName}</div>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-control"
                            value={userAuthData?.email || ''}
                            readOnly
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Address</label>
                        <textarea
                            className="form-control"
                            rows={2}
                            value={fields.address}
                            onChange={(e) => handleFieldChange('address', e.target.value)}
                            disabled={!isEditing || isSaving}
                            placeholder="Your address"
                            style={{ resize: 'vertical' }}
                            maxLength={200}
                        />
                        {errors.address && <div className="form-error">{errors.address}</div>}
                    </div>

                    {isEditing && (
                        <div className="form-group">
                            <label className="form-label">Profile Photo</label>
                            <input
                                type="file"
                                accept="image/*"
                                className="form-control"
                                onChange={handlePhotoChange}
                                disabled={isUploadingImage || isSaving}
                            />
                            {isUploadingImage && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                                    <Spinner size="sm" /> Uploading…
                                </div>
                            )}
                        </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                        {!isEditing ? (
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => setIsEditing(true)}
                            >
                                Edit Profile
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleSave}
                                    disabled={isSaving || isUploadingImage}
                                >
                                    {isSaving ? <><Spinner size="sm" /> Saving…</> : 'Save Changes'}
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleCancel}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

export default UserProfile;
