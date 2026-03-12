import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface Wedding {
    _id?: string;
    groomName: string;
    brideName: string;
    date: string; // Redux needs serializable data, store date as string (ISO)
    totalBudget: number;
    startStatistics?: {
        guestCount: number;
        totalSpent: number;
    };
    groomImage?: string;
    brideImage?: string;
    location?: string;
    type?: string;
    venue?: string;
    budgetBreakdown?: {
        catering: number;
        decoration: number;
        venue: number;
        photography: number;
        travel: number;
        makeup: number;
        otherExpenses: number;
    };
}

interface WeddingState {
    weddings: Wedding[];
    weddingData: Wedding | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: WeddingState = {
    weddings: [],
    weddingData: null,
    isLoading: false,
    error: null,
};

// Helper: Convert API date to string if needed
// Actually, API returns JSON string for dates usually. We will store it as string.
// Components will convert to Date object if needed for DatePicker etc.

export const fetchWeddings = createAsyncThunk('wedding/fetchWeddings', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/weddings');
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch weddings');
    }
});

export const fetchActiveWedding = createAsyncThunk('wedding/fetchActiveWedding', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/weddings/my');
        if (response.data) {
            return response.data; // Ensure date is string
        }
        return null; // No active wedding
    } catch (error: any) {
        // If 404 or similar, it means no active wedding
        return null;
    }
});

export const refreshWeddingData = createAsyncThunk('wedding/refresh', async (_, { dispatch }) => {
    await dispatch(fetchWeddings());
    await dispatch(fetchActiveWedding());
});

export const switchWedding = createAsyncThunk('wedding/switch', async (weddingId: string, { rejectWithValue }) => {
    try {
        const response = await api.get(`/weddings/my?weddingId=${weddingId}`);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to switch wedding');
    }
});

export const updateBudget = createAsyncThunk('wedding/updateBudget', async ({ id, budget }: { id: string, budget: number }, { rejectWithValue }) => {
    try {
        const response = await api.put(`/weddings/${id}`, { totalBudget: budget });
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update budget');
    }
});

export const updateWedding = createAsyncThunk('wedding/update', async ({ id, ...data }: { id: string } & Partial<Wedding>, { rejectWithValue }) => {
    try {
        const response = await api.put(`/weddings/${id}`, data);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to update wedding');
    }
});

export const createWedding = createAsyncThunk('wedding/create', async (data: Partial<Wedding>, { dispatch, rejectWithValue }) => {
    try {
        const response = await api.post('/weddings', data);
        await dispatch(refreshWeddingData());
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to create wedding');
    }
});

const weddingSlice = createSlice({
    name: 'wedding',
    initialState,
    reducers: {
        clearWeddingError: (state) => {
            state.error = null;
        },
        resetWeddingState: (state) => {
            state.weddings = [];
            state.weddingData = null;
            state.isLoading = false;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Weddings
            .addCase(fetchWeddings.fulfilled, (state, action) => {
                if (Array.isArray(action.payload)) {
                    state.weddings = action.payload;
                }
            })
            // Fetch Active Wedding
            .addCase(fetchActiveWedding.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchActiveWedding.fulfilled, (state, action) => {
                state.weddingData = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchActiveWedding.rejected, (state) => {
                // If failed, assume no active wedding but don't error out loudly for "No active wedding" usually
                state.weddingData = null;
                state.isLoading = false;
            })
            // Switch Wedding
            .addCase(switchWedding.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(switchWedding.fulfilled, (state, action) => {
                state.weddingData = action.payload;
                state.isLoading = false;
            })
            .addCase(switchWedding.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Update Budget
            .addCase(updateBudget.fulfilled, (state, action) => {
                if (state.weddingData && state.weddingData._id === action.payload._id) {
                    state.weddingData.totalBudget = action.payload.totalBudget;
                }
            })
            // Update Wedding
            .addCase(updateWedding.fulfilled, (state, action) => {
                state.weddingData = action.payload;
            })
            // Create Wedding
            .addCase(createWedding.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createWedding.fulfilled, (state, action) => {
                state.weddingData = action.payload;
                state.isLoading = false;
            })
            .addCase(createWedding.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearWeddingError, resetWeddingState } = weddingSlice.actions;
export default weddingSlice.reducer;
