import { createSlice } from '@reduxjs/toolkit';

export const taskSlice = createSlice({
    name: 'task',
    initialState: {
        tasks: [],
        currentTask: null,
        loading: false,
        error: null,
    },
    reducers: {
        setTasks: (state, action) => {
            state.tasks = action.payload;
        },
        setCurrentTask: (state, action) => {
            state.currentTask = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        clearCurrentTask: (state) => {
            state.currentTask = null;
        },
        addTask: (state, action) => {
            state.tasks.unshift(action.payload);
        },
        updateTaskInList: (state, action) => {
            const index = state.tasks.findIndex((t) => t.id === action.payload.id);
            if (index !== -1) state.tasks[index] = action.payload;
        },
        removeTask: (state, action) => {
            state.tasks = state.tasks.filter((t) => t.id !== action.payload);
        },
    },
});

export const {
    setTasks,
    setCurrentTask,
    setLoading,
    setError,
    clearCurrentTask,
    addTask,
    updateTaskInList,
    removeTask,
} = taskSlice.actions;

export const getTasks = (state) => state.task.tasks;
export const getCurrentTask = (state) => state.task.currentTask;
export const getTaskLoading = (state) => state.task.loading;
export const getTaskError = (state) => state.task.error;

export default taskSlice.reducer;
