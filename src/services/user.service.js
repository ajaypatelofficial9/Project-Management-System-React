import api from './api.js';

const UserService = {
    async getAll() {
        return api.get('/admin/users');
    },

    async create(payload) {
        return api.post('/admin/users', payload);
    },
};

export default UserService;
