import { createSlice } from '@reduxjs/toolkit';

export const projectSlice = createSlice({
    name: 'project',
    initialState: {
        projects: [],
        currentProject: null,
        users: [],
        loading: false,
        error: null,
    },
    reducers: {
        setProjects: (state, action) => {
            state.projects = action.payload;
        },
        setCurrentProject: (state, action) => {
            state.currentProject = action.payload;
        },
        setUsers: (state, action) => {
            state.users = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        clearCurrentProject: (state) => {
            state.currentProject = null;
        },
        addProject: (state, action) => {
            state.projects.unshift(action.payload);
        },
        updateProjectInList: (state, action) => {
            const index = state.projects.findIndex((p) => p.id === action.payload.id);
            if (index !== -1) state.projects[index] = action.payload;
        },
        removeProject: (state, action) => {
            state.projects = state.projects.filter((p) => p.id !== action.payload);
        },
    },
});

export const {
    setProjects,
    setCurrentProject,
    setUsers,
    setLoading,
    setError,
    clearCurrentProject,
    addProject,
    updateProjectInList,
    removeProject,
} = projectSlice.actions;

export const getProjects = (state) => state.project.projects;
export const getCurrentProject = (state) => state.project.currentProject;
export const getUsers = (state) => state.project.users;
export const getProjectLoading = (state) => state.project.loading;
export const getProjectError = (state) => state.project.error;

export default projectSlice.reducer;
