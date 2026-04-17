import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    addExpense as addExpenseAction,
    fetchExpenses as fetchExpensesAction,
    updateExpense as updateExpenseAction,
    deleteExpense as deleteExpenseAction
} from '../store/slices/expenseSlice';

export function useExpense() {
    const dispatch = useAppDispatch();
    const { expenses: rawExpenses, isLoading } = useAppSelector(state => state.expense);
    const { weddingData } = useAppSelector(state => state.wedding);

    const expenses = rawExpenses.map((e: any) => ({
        ...e,
        date: e.date ? new Date(e.date) : new Date()
    }));

    const totalAmount = expenses.reduce((sum, item) => sum + item.amount, 0);

    const addExpense = async (title: string, amount: number, paidAmount: number, category: string, date: Date = new Date()) => {
        await dispatch(addExpenseAction({ title, amount, paidAmount, category, date: date.toISOString(), weddingId: weddingData?._id })).unwrap();
    };

    const fetchExpenses = async () => {
        if (weddingData?._id) {
            await dispatch(fetchExpensesAction(weddingData._id));
        }
    };

    const updateExpense = async (id: string, data: any) => {
        await dispatch(updateExpenseAction({ id, data })).unwrap();
    };

    const deleteExpense = async (id: string) => {
        await dispatch(deleteExpenseAction(id)).unwrap();
    };

    return {
        expenses,
        isLoading,
        addExpense,
        fetchExpenses,
        updateExpense,
        deleteExpense,
        totalAmount
    };
}

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
