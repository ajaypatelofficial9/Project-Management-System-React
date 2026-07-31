import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import {
    FLUSH,
    PAUSE,
    PERSIST,
    persistReducer,
    persistStore,
    PURGE,
    REGISTER,
    REHYDRATE,
} from 'redux-persist';
import { encryptTransform } from 'redux-persist-transform-encrypt';
import storage from 'redux-persist/es/storage';
import { createStateSyncMiddleware, initMessageListener } from 'redux-state-sync';
import { authSlice, projectSlice, taskSlice, commentSlice } from '../redux';

const RootReducer = combineReducers({
    auth: authSlice,
    project: projectSlice,
    task: taskSlice,
    comment: commentSlice,
});

const encryptor = encryptTransform({
    secretKey: 'userData',
    onError: (error) => {
        console.error({ error });
    },
});

const persistConfig = {
    key: 'root',
    storage,
    whitelist: ['auth'],   // only auth is persisted; project/task/comment are re-fetched on load
    transforms: [encryptor],
};

const persistedReducer = persistReducer(persistConfig, RootReducer);

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) => [
        ...getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }).concat(createStateSyncMiddleware({ blacklist: [PERSIST, PURGE] })),
    ],
});

initMessageListener(store);

export default store;

export const Persistor = persistStore(store);
