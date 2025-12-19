import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

interface Expense {
    _id?: string;
    title: string;
    amount: number;
    paidAmount?: number;
    category: string;
    date: Date;
}

interface ExpenseContextType {
    expenses: Expense[];
    isLoading: boolean;
    addExpense: (title: string, amount: number, paidAmount: number, category: string, date?: Date) => Promise<void>;
    fetchExpenses: () => Promise<void>;
    totalAmount: number;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

export const ExpenseProvider = ({ children }: { children: ReactNode }) => {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const { user } = useAuth();

    const fetchExpenses = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const res = await api.get('/expenses');
            setExpenses(res.data);
        } catch (error) {
            console.error("Failed to fetch expenses", error);
        } finally {
            setIsLoading(false);
        }
    };

    const addExpense = async (title: string, amount: number, paidAmount: number, category: string, date: Date = new Date()) => {
        setIsLoading(true);
        try {
            const res = await api.post('/expenses', {
                title,
                amount,
                paidAmount,
                category,
                date
            });
            setExpenses(prev => [...prev, res.data]);
        } catch (error) {
            console.error("Failed to add expense", error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchExpenses();
        } else {
            setExpenses([]);
        }
    }, [user]);

    const totalAmount = expenses.reduce((sum, item) => sum + item.amount, 0);

    return (
        <ExpenseContext.Provider value={{ expenses, isLoading, addExpense, fetchExpenses, totalAmount }}>
            {children}
        </ExpenseContext.Provider>
    );
};

export const useExpense = () => {
    const context = useContext(ExpenseContext);
    if (!context) {
        throw new Error('useExpense must be used within an ExpenseProvider');
    }
    return context;
};
