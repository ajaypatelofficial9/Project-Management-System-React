import api from './api.js';

const CommentService = {
    async getByTask(taskId) {
        return api.get(`/comments/task/${taskId}`);
    },

    async create(payload) {
        return api.post('/comments', payload);
    },

    async deleteComment(id) {
        return api.delete(`/comments/${id}`);
    },
};

export default CommentService;
