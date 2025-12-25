import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  createWedding as createAction,
  refreshWeddingData as refreshAction,
  switchWedding as switchAction,
  updateBudget as updateBudgetAction
} from '../store/slices/weddingSlice';

export function useWedding() {
  const dispatch = useAppDispatch();
  const { weddings: rawWeddings, weddingData: rawWeddingData, isLoading } = useAppSelector(state => state.wedding);

  // Helper to convert Redux state (strings) to App state (Dates)
  const mapWeddingDates = (w: any) => ({
    ...w,
    date: w.date ? new Date(w.date) : new Date()
  });

  const weddings = rawWeddings.map(mapWeddingDates);
  const weddingData = rawWeddingData ? mapWeddingDates(rawWeddingData) : null;

  const hasWedding = !!weddingData;

  const refreshWeddingData = async () => {
    await dispatch(refreshAction());
  };

  const switchWedding = async (weddingId: string) => {
    await dispatch(switchAction(weddingId)).unwrap();
  };

  const updateBudget = async (budget: number) => {
    if (!weddingData?._id) return;
    await dispatch(updateBudgetAction({ id: weddingData._id, budget })).unwrap();
  };

  const createWedding = async (data: any) => {
    // Ensure date is serializable
    const payload = { ...data };
    if (payload.date instanceof Date) {
      payload.date = payload.date.toISOString();
    }
    await dispatch(createAction(payload)).unwrap();
  };

  return {
    hasWedding,
    weddingData,
    weddings,
    isLoading,
    refreshWeddingData,
    switchWedding,
    updateBudget,
    createWedding
  };
}

export function WeddingProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
