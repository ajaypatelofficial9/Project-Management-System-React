import api from './api.js';

const TaskService = {
    async getAll() {
        return api.get('/tasks');
    },

    async getByProject(projectId) {
        return api.get(`/tasks/project/${projectId}`);
    },

    async getById(id) {
        return api.get(`/tasks/${id}`);
    },

    async create(payload) {
        return api.post('/tasks', payload);
    },

    async updateStatus(id, status) {
        return api.patch(`/tasks/${id}/status`, { status });
    },

    async deleteTask(id) {
        return api.delete(`/tasks/${id}`);
    },
};

export default TaskService;
