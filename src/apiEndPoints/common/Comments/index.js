const CommentEndpoints = {
    GetByTask: (taskId) => ({ url: `/comments/task/${taskId}`, method: 'GET' }),
    Create: (bodyData) => ({ url: '/comments', method: 'POST', bodyData }),
    Delete: (id) => ({ url: `/comments/${id}`, method: 'DELETE' }),
};

export default CommentEndpoints;
