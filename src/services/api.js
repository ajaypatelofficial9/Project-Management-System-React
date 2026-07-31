/**
 * Thin wrapper around fetch that:
 * - Attaches the Bearer token from localStorage automatically
 * - Normalises response into { status, data, message }
 * - Matches the existing auth.service.js calling convention
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const getToken = () => localStorage.getItem('token') || '';

const request = async (method, path, body = null) => {
    try {
        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
        };

        const options = { method, headers };
        if (body) options.body = JSON.stringify(body);

        const response = await fetch(`${API_BASE_URL}${path}`, options);
        const data = await response.json();

        if (!response.ok) {
            return {
                status: response.status,
                message: data.errorMsg || data.message || 'Request failed',
                data: null,
            };
        }

        return {
            status: 200,
            message: data.message || 'Success',
            data: data.data !== undefined ? data.data : data,
        };
    } catch (error) {
        return {
            status: 500,
            message: error.message || 'Something went wrong',
            data: null,
        };
    }
};

const api = {
    get: (path) => request('GET', path),
    post: (path, body) => request('POST', path, body),
    put: (path, body) => request('PUT', path, body),
    patch: (path, body) => request('PATCH', path, body),
    delete: (path) => request('DELETE', path),
};

export default api;
