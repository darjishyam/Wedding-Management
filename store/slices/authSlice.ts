import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../services/api';
import { authService } from '../../services/authService';

export interface User {
    _id: string;
    name: string;
    email: string;
    mobile: string;
    isPremium?: boolean;
    role?: 'user' | 'admin';
    profileImage?: string;
}

interface AuthState {
    user: User | null;
    isLoading: boolean;
    isDemo: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    isLoading: true,
    isDemo: false, // Set to true if DEMO_MODE logic is needed
    error: null,
};

// Async Thunks

export const loadUser = createAsyncThunk('auth/loadUser', async () => {
    try {
        const token = await AsyncStorage.getItem('userToken');
        const userInfo = await AsyncStorage.getItem('userInfo');
        if (token && userInfo) {
            return JSON.parse(userInfo) as User;
        }
        return null;
    } catch (error) {
        return null;
    }
});

export const login = createAsyncThunk(
    'auth/login',
    async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { token, ...userData } = response.data;
            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('userInfo', JSON.stringify(userData));
            return userData;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Login failed');
        }
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async (
        {
            name,
            email,
            mobile,
            password,
            firebaseVerified = false,
        }: { name: string; email: string; mobile: string; password: string; firebaseVerified?: boolean },
        { rejectWithValue }
    ) => {
        try {
            const response = await api.post('/auth/signup', {
                name,
                email,
                mobile,
                password,
                firebaseVerified,
            });

            if (firebaseVerified && response.data.token) {
                const { token, ...userData } = response.data;
                await AsyncStorage.setItem('userToken', token);
                await AsyncStorage.setItem('userInfo', JSON.stringify(userData));
                return { user: userData };
            }

            return { message: response.data.message }; // OTP Sent case
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Registration failed');
        }
    }
);

export const verifyOtp = createAsyncThunk(
    'auth/verifyOtp',
    async ({ mobile, otp }: { mobile: string; otp: string }, { rejectWithValue }) => {
        try {
            const response = await api.post('/auth/verify-otp', { mobile, otp });
            const { token, ...userData } = response.data;
            await AsyncStorage.setItem('userToken', token);
            await AsyncStorage.setItem('userInfo', JSON.stringify(userData));
            return userData;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'OTP verification failed');
        }
    }
);

export const logout = createAsyncThunk('auth/logout', async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userInfo');
});

export const reloadUser = createAsyncThunk('auth/reloadUser', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/auth/me');
        const userData = response.data;
        await AsyncStorage.setItem('userInfo', JSON.stringify(userData));
        return userData;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to reload user');
    }
});

export const deleteAccount = createAsyncThunk(
    'auth/deleteAccount',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            await api.delete('/auth/delete-account', {
                headers: { Authorization: `Bearer ${token}` },
            });
            dispatch(logout());
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Delete account failed');
        }
    }
);

export const signInWithGoogle = createAsyncThunk(
    'auth/signInWithGoogle',
    async (_, { rejectWithValue }) => {
        try {
            const result = await authService.signInWithGoogle();
            if (result && result.user) {
                // Now exchange this for our backend token
                const { email, displayName, phoneNumber, photoURL } = result.user;

                const response = await api.post('/auth/google', {
                    email,
                    name: displayName,
                    mobile: phoneNumber,
                    profileImage: photoURL
                });

                const { token, ...userData } = response.data;
                await AsyncStorage.setItem('userToken', token);
                await AsyncStorage.setItem('userInfo', JSON.stringify(userData));
                return userData;
            }
            return rejectWithValue('Google Sign In failed: No user data');
        } catch (error: any) {
            return rejectWithValue(error.message || 'Google Sign In failed');
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Load User
            .addCase(loadUser.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isLoading = false;
            })
            .addCase(loadUser.rejected, (state) => {
                state.user = null;
                state.isLoading = false;
            })
            // Login
            .addCase(login.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isLoading = false;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Register
            .addCase(register.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.isLoading = false;
                if (action.payload.user) {
                    state.user = action.payload.user;
                }
            })
            .addCase(register.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Verify OTP
            .addCase(verifyOtp.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(verifyOtp.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isLoading = false;
            })
            .addCase(verifyOtp.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Logout
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
            })
            // Reload User
            .addCase(reloadUser.fulfilled, (state, action) => {
                state.user = action.payload;
            })
            // Google Sign In
            .addCase(signInWithGoogle.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(signInWithGoogle.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isLoading = false;
            })
            .addCase(signInWithGoogle.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
