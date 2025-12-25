import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    addExpense as addExpenseAction,
    fetchExpenses as fetchExpensesAction
} from '../store/slices/expenseSlice';

export function useExpense() {
    const dispatch = useAppDispatch();
    const { expenses: rawExpenses, isLoading } = useAppSelector(state => state.expense);

    const expenses = rawExpenses.map((e: any) => ({
        ...e,
        date: e.date ? new Date(e.date) : new Date()
    }));

    const totalAmount = expenses.reduce((sum, item) => sum + item.amount, 0);

    const addExpense = async (title: string, amount: number, paidAmount: number, category: string, date: Date = new Date()) => {
        await dispatch(addExpenseAction({ title, amount, paidAmount, category, date: date.toISOString() })).unwrap();
    };

    const fetchExpenses = async () => {
        await dispatch(fetchExpensesAction());
    };

    return {
        expenses,
        isLoading,
        addExpense,
        fetchExpenses,
        totalAmount
    };
}

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
