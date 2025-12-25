import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface Guest {
    _id: string;
    name: string;
    familyCount: number;
    cityVillage: string;
    isInvited?: boolean;
}

interface GuestState {
    guests: Guest[];
    isLoading: boolean;
    error: string | null;
}

const initialState: GuestState = {
    guests: [],
    isLoading: false,
    error: null,
};

// Async Thunks

export const fetchGuests = createAsyncThunk('guest/fetchGuests', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/guests');
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch guests');
    }
});

export const addGuest = createAsyncThunk(
    'guest/addGuest',
    async (
        { name, count, city }: { name: string; count: number; city: string },
        { rejectWithValue }
    ) => {
        try {
            const response = await api.post('/guests', {
                name,
                familyCount: count,
                cityVillage: city,
            });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add guest');
        }
    }
);

export const updateGuestStatus = createAsyncThunk(
    'guest/updateGuestStatus',
    async (
        { id, isInvited }: { id: string; isInvited: boolean },
        { rejectWithValue }
    ) => {
        try {
            const response = await api.put(`/guests/${id}`, { isInvited });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update guest status');
        }
    }
);

const guestSlice = createSlice({
    name: 'guest',
    initialState,
    reducers: {
        clearGuestError: (state) => {
            state.error = null;
        },
        clearGuests: (state) => {
            state.guests = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Guests
            .addCase(fetchGuests.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchGuests.fulfilled, (state, action) => {
                state.guests = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchGuests.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Add Guest
            .addCase(addGuest.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addGuest.fulfilled, (state, action) => {
                state.guests.push(action.payload);
                state.isLoading = false;
            })
            .addCase(addGuest.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Update Guest Status
            .addCase(updateGuestStatus.fulfilled, (state, action) => {
                const index = state.guests.findIndex((g) => g._id === action.payload._id);
                if (index !== -1) {
                    state.guests[index] = action.payload;
                }
            });
    },
});

export const { clearGuestError, clearGuests } = guestSlice.actions;
export default guestSlice.reducer;
