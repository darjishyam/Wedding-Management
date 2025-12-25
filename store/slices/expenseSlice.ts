import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../services/api';

export interface Expense {
    _id?: string;
    title: string;
    amount: number;
    paidAmount?: number;
    category: string;
    date: string; // Store as string
}

interface ExpenseState {
    expenses: Expense[];
    isLoading: boolean;
    error: string | null;
}

const initialState: ExpenseState = {
    expenses: [],
    isLoading: false,
    error: null,
};

export const fetchExpenses = createAsyncThunk('expense/fetchExpenses', async (_, { rejectWithValue }) => {
    try {
        const response = await api.get('/expenses');
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to fetch expenses');
    }
});

export const addExpense = createAsyncThunk('expense/addExpense', async (data: {
    title: string;
    amount: number;
    paidAmount: number;
    category: string;
    date: string;
}, { rejectWithValue }) => {
    try {
        const response = await api.post('/expenses', data);
        return response.data;
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.message || 'Failed to add expense');
    }
});

const expenseSlice = createSlice({
    name: 'expense',
    initialState,
    reducers: {
        clearExpenseError: (state) => {
            state.error = null;
        },
        clearExpenses: (state) => {
            state.expenses = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchExpenses.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchExpenses.fulfilled, (state, action) => {
                state.expenses = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchExpenses.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
            })
            .addCase(addExpense.fulfilled, (state, action) => {
                state.expenses.push(action.payload);
            });
    },
});

export const { clearExpenseError, clearExpenses } = expenseSlice.actions;
export default expenseSlice.reducer;
