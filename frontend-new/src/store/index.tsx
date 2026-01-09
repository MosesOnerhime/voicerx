import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';

export const store = configureStore({
  reducer: {
    // This key 'auth' is what you will use in useSelector((state) => state.auth)
    auth: authReducer,
  },
});

// These are critical for TypeScript support throughout your app
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;