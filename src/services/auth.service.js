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
            console.log("111111 :", data);

            if (!data?.data?.token) {
                console.log(2222222,data);
                throw {
                    message: data?.data.errorMsg || 'Login failed',
                    status: data,
                };
            }

            return {
                message: 'Login successfully',
                status: 200,
                data: {
                    token: data?.data.token,
                    userDetails: data?.data,
                },
            };
        } catch (error) {
            console.log(55555555);
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
};

export default AuthServices;
