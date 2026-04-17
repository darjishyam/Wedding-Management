import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface Guest {
    _id: string;
    name: string;
    familyCount: number;
    cityVillage: string;
    category?: string;
    status?: string;
    isInvited: boolean;
    shagunAmount: number;
    assignedEvents?: { event: string, status: string }[];
}

interface GuestState {
    guests: Guest[];
    isLoading: boolean;
    error: string | null;
}

// ... (GuestState remains same)

export const fetchGuests = createAsyncThunk('guest/fetchGuests', async (weddingId: string, { rejectWithValue }) => {
    try {
        const response = await api.get(`/guests?weddingId=${weddingId}`);
        return response.data; // Expected to contain new fields now
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch guests');
    }
});

export const addGuest = createAsyncThunk(
    'guest/addGuest',
    async (
        { name, count, city, category, status, assignedEvents, weddingId }: { name: string; count: number; city: string; category?: string; status?: string, assignedEvents?: any[], weddingId?: string },
        { rejectWithValue }
    ) => {
        try {
            const response = await api.post('/guests', {
                weddingId,
                name,
                familyCount: count,
                cityVillage: city,
                category,
                status,
                assignedEvents
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
        { id, isInvited, status }: { id: string; isInvited?: boolean; status?: string },
        { rejectWithValue }
    ) => {
        try {
            const payload: any = {};
            if (isInvited !== undefined) payload.isInvited = isInvited;
            if (status !== undefined) payload.status = status;

            const response = await api.put(`/guests/${id}`, payload);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update guest status');
        }
    }
);

export const updateGuest = createAsyncThunk(
    'guest/updateGuest',
    async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
        try {
            const response = await api.put(`/guests/${id}`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update guest');
        }
    }
);

export const deleteGuest = createAsyncThunk(
    'guest/deleteGuest',
    async (id: string, { rejectWithValue }) => {
        try {
            await api.delete(`/guests/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete guest');
        }
    }
);
const initialState: GuestState = {
    guests: [],
    isLoading: false,
    error: null,
};

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
                const index = state.guests.findIndex((g: Guest) => g._id === action.payload._id);
                if (index !== -1) {
                    state.guests[index] = action.payload;
                }
            })
            // Update Guest
            .addCase(updateGuest.fulfilled, (state, action) => {
                const index = state.guests.findIndex((g: Guest) => g._id === action.payload._id);
                if (index !== -1) {
                    state.guests[index] = action.payload;
                }
            })
            // Delete Guest
            .addCase(deleteGuest.fulfilled, (state, action) => {
                state.guests = state.guests.filter((g: Guest) => g._id !== action.payload);
            });
    },
});

export const { clearGuestError, clearGuests } = guestSlice.actions;
export default guestSlice.reducer;
