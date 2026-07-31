const TaskEndpoints = {
    GetAll: () => ({ url: '/tasks', method: 'GET' }),
    GetByProject: (projectId) => ({ url: `/tasks/project/${projectId}`, method: 'GET' }),
    GetById: (id) => ({ url: `/tasks/${id}`, method: 'GET' }),
    Create: (bodyData) => ({ url: '/tasks', method: 'POST', bodyData }),
    UpdateStatus: (id, bodyData) => ({ url: `/tasks/${id}/status`, method: 'PATCH', bodyData }),
    Delete: (id) => ({ url: `/tasks/${id}`, method: 'DELETE' }),
};

export default TaskEndpoints;
