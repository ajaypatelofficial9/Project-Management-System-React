const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const AuthServices = {
    async SignUp(payload) {
        try {
            const response = await fetch(`${API_BASE_URL}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw {
                    message: data.errorMsg || 'Signup failed',
                    status: response.status,
                };
            }

            return {
                message: 'Signup successfully',
                status: 200,
                data,
            };
        } catch (error) {
            return {
                message: error.message || 'Something went wrong during signup',
                status: error.status || 500,
            };
        }
    },

    async Login(payload) {
        try {
            const response = await fetch(`${API_BASE_URL}/signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            console.log("Login response:", data);

            // Check if the response indicates success
            if (data?.data?.token) {
                return {
                    message: 'Login successfully',
                    status: 200,
                    data: {
                        token: data.data.token,
                        userDetails: data.data,
                    },
                };
            }

            if (data?.status === false || !response.ok) {
                throw {
                    message: data?.msg || data?.message || 'Invalid credentials',
                    status: response.status || 400,
                };
            }

            // Fallback error
            throw {
                message: 'Login failed',
                status: 400,
            };

        } catch (error) {
            console.log('Login error:', error);
            return {
                message: error.message || 'Something went wrong during login',
                status: error.status || 500,
            };
        }
    },

    async UploadProfilePhoto(file) {
        try {
            const fileUpload = new FormData();
            fileUpload.append('file', file);

            const response = await fetch(`${API_BASE_URL}/media/upload/image/user`, {
                method: 'POST',
                body: fileUpload,
            });

            const data = await response.json();

            if (!response.ok || !data.status) {
                throw {
                    message: data.message || data.errorMsg || 'Profile upload failed',
                    status: response.status,
                };
            }

            return {
                message: 'Upload successfully',
                status: 200,
                data: {
                    profileImageURL: data.baseUrl,
                    mediaId: data.id,
                },
            };
        } catch (error) {
            return {
                message: error.message || 'Something went wrong during upload',
                status: error.status || 500,
            };
        }
    },

    async UpdateProfile(profileData) {
        try {
            const token = localStorage.getItem('token') || profileData.token;
            const response = await fetch(`${API_BASE_URL}/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(profileData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw {
                    message: data.message || 'Profile update failed',
                    status: response.status,
                };
            }

            return {
                message: 'Profile updated successfully',
                status: 200,
                data: data.data,
            };
        } catch (error) {
            console.error('Profile update error:', error);
            return {
                message: error.message || 'Something went wrong during profile update',
                status: error.status || 500,
            };
        }
    },
};

export default AuthServices;
