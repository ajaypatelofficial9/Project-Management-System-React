const ProjectEndpoints = {
    GetAll: () => ({ url: '/projects', method: 'GET' }),
    GetById: (id) => ({ url: `/projects/${id}`, method: 'GET' }),
    Create: (bodyData) => ({ url: '/projects', method: 'POST', bodyData }),
    Update: (id, bodyData) => ({ url: `/projects/${id}`, method: 'PUT', bodyData }),
    Delete: (id) => ({ url: `/projects/${id}`, method: 'DELETE' }),
    AssignUsers: (id, bodyData) => ({ url: `/projects/${id}/assign`, method: 'PUT', bodyData }),
    GetAllUsers: () => ({ url: '/projects/users', method: 'GET' }),
};

export default ProjectEndpoints;
