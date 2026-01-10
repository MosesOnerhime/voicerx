import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { type User } from './RootState';

// 3. Define the AuthState (what we store in Redux)
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

}

// 4. Check LocalStorage immediately so the user stays logged in on refresh
const storedToken = localStorage.getItem('token');
const storedUser = localStorage.getItem('user');

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,
  isAuthenticated: !!storedToken,
  isLoading: false,
};


const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Call this after a successful Login or Register
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      
      // Save to localStorage for persistence
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
    },
    
    // Call this when the user clicks "Logout"
    logout: (state) => {
      //reset state
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      
      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

// Export the reducer to add to your store
export default authSlice.reducer;
/** 
// Optional: Expert Selector (makes getting user data easy in components)
import { RootState } from './index';
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectCurrentRole = (state: RootState) => state.auth.user?.role;
*/