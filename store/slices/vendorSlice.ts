import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface Vendor {
    _id: string;
    name: string;
    category: string;
    contact?: string;
    totalAmount: number;
    paidAmount: number;
    status: string;
    payments?: any[];
    createdAt?: string;
}

interface VendorState {
    vendors: Vendor[];
    isLoading: boolean;
    error: string | null;
}

const initialState: VendorState = {
    vendors: [],
    isLoading: false,
    error: null,
};

// Async Thunks

export const fetchVendors = createAsyncThunk('vendor/fetchVendors', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/vendors');
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch vendors');
    }
});

export const addVendor = createAsyncThunk(
    'vendor/addVendor',
    async (
        vendorData: { name: string; category: string; contact?: string; totalAmount: number; paidAmount: number },
        { rejectWithValue }
    ) => {
        try {
            const response = await api.post('/vendors', vendorData);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add vendor');
        }
    }
);

export const updateVendor = createAsyncThunk(
    'vendor/updateVendor',
    async (
        { id, data }: { id: string; data: Partial<Vendor> },
        { rejectWithValue }
    ) => {
        try {
            const response = await api.put(`/vendors/${id}`, data);
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update vendor');
        }
    }
);

export const addPayment = createAsyncThunk(
    'vendor/addPayment',
    async (
        { vendorId, amount, mode, note }: { vendorId: string; amount: number; mode: string; note: string },
        { rejectWithValue }
    ) => {
        try {
            const response = await api.post(`/vendors/${vendorId}/payment`, { amount, mode, note });
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to add payment');
        }
    }
);

export const deleteVendor = createAsyncThunk(
    'vendor/deleteVendor',
    async (id: string, { rejectWithValue }) => {
        try {
            await api.delete(`/vendors/${id}`);
            return id;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message || 'Failed to delete vendor');
        }
    }
);

const vendorSlice = createSlice({
    name: 'vendor',
    initialState,
    reducers: {
        clearVendorError: (state) => {
            state.error = null;
        },
        clearVendors: (state) => {
            state.vendors = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch Vendors
            .addCase(fetchVendors.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchVendors.fulfilled, (state, action) => {
                state.vendors = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchVendors.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Add Vendor
            .addCase(addVendor.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(addVendor.fulfilled, (state, action) => {
                state.vendors.unshift(action.payload); // Add to top
                state.isLoading = false;
            })
            .addCase(addVendor.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            // Update Vendor
            .addCase(updateVendor.fulfilled, (state, action) => {
                const index = state.vendors.findIndex((v) => v._id === action.payload._id);
                if (index !== -1) {
                    state.vendors[index] = action.payload;
                }
            })
            // Add Payment
            .addCase(addPayment.fulfilled, (state, action) => {
                const index = state.vendors.findIndex((v) => v._id === action.payload._id);
                if (index !== -1) {
                    state.vendors[index] = action.payload;
                }
            })
            // Delete Vendor
            .addCase(deleteVendor.fulfilled, (state, action) => {
                state.vendors = state.vendors.filter((v) => v._id !== action.payload);
            });
    },
});

export const { clearVendorError, clearVendors } = vendorSlice.actions;
export default vendorSlice.reducer;
