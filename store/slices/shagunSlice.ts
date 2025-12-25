import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface ShagunEntry {
    id: string; // Ensure this matches usages. Backend returns _id.
    _id?: string;
    name: string;
    amount: string;
    city?: string;
    gift?: string;
    contact?: string;
    wishes?: string;
    date: string;
    type: 'received' | 'given';
}

interface ShagunState {
    shagunEntries: ShagunEntry[];
    isLoading: boolean;
    error: string | null;
}

const initialState: ShagunState = {
    shagunEntries: [],
    isLoading: false,
    error: null,
};

export const fetchShaguns = createAsyncThunk('shagun/fetchShaguns', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/shagun');
        // Map _id to id if component expects id
        return response.data.map((item: any) => ({ ...item, id: item._id }));
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch shagun');
    }
});

export const addShagun = createAsyncThunk('shagun/addShagun', async (entry: Omit<ShagunEntry, "id" | "_id">, { rejectWithValue }) => {
    try {
        const response = await api.post('/shagun', entry);
        return { ...response.data, id: response.data._id };
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to add shagun');
    }
});

export const deleteShagun = createAsyncThunk('shagun/deleteShagun', async (id: string, { rejectWithValue }) => {
    try {
        await api.delete(`/shagun/${id}`);
        return id;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to delete shagun');
    }
});

const shagunSlice = createSlice({
    name: 'shagun',
    initialState,
    reducers: {
        clearShagunError: (state) => {
            state.error = null;
        },
        clearShaguns: (state) => {
            state.shagunEntries = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch
            .addCase(fetchShaguns.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchShaguns.fulfilled, (state, action) => {
                state.shagunEntries = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchShaguns.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Add
            .addCase(addShagun.fulfilled, (state, action) => {
                state.shagunEntries.unshift(action.payload);
            })
            // Delete
            .addCase(deleteShagun.fulfilled, (state, action) => {
                state.shagunEntries = state.shagunEntries.filter(e => e.id !== action.payload);
            });
    },
});

export const { clearShagunError, clearShaguns } = shagunSlice.actions;
export default shagunSlice.reducer;
