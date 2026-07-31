import api from './api.js';

const ProjectService = {
    async getAll() {
        return api.get('/projects');
    },

    async getById(id) {
        return api.get(`/projects/${id}`);
    },

    async create(payload) {
        return api.post('/projects', payload);
    },

    async update(id, payload) {
        return api.put(`/projects/${id}`, payload);
    },

    async assignUsers(id, assignedUserIds) {
        return api.put(`/projects/${id}/assign`, { assignedUserIds });
    },

    async deleteProject(id) {
        return api.delete(`/projects/${id}`);
    },

    async getAllUsers() {
        return api.get('/projects/users');
    },
};

export default ProjectService;
