import { createSlice } from '@reduxjs/toolkit';

export const commentSlice = createSlice({
    name: 'comment',
    initialState: {
        comments: [],
        loading: false,
        error: null,
    },
    reducers: {
        setComments: (state, action) => {
            state.comments = action.payload;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        addComment: (state, action) => {
            state.comments.push(action.payload);
        },
        removeComment: (state, action) => {
            state.comments = state.comments.filter((c) => c.id !== action.payload);
        },
        clearComments: (state) => {
            state.comments = [];
        },
    },
});

export const {
    setComments,
    setLoading,
    setError,
    addComment,
    removeComment,
    clearComments,
} = commentSlice.actions;

export const getComments = (state) => state.comment.comments;
export const getCommentLoading = (state) => state.comment.loading;
export const getCommentError = (state) => state.comment.error;

export default commentSlice.reducer;
