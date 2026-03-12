import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  addShagun as addShagunAction,
  deleteShagun as deleteShagunAction
} from '../store/slices/shagunSlice';
import { useWedding } from './WeddingContext';

export function useShagun() {
  const dispatch = useAppDispatch();
  const { shagunEntries } = useAppSelector(state => state.shagun);

  const { weddingData } = useWedding();

  const addShagun = async (entry: any) => {
    if (!weddingData?._id) return;
    await dispatch(addShagunAction({ ...entry, weddingId: weddingData._id })).unwrap();
  };

  const deleteShagun = async (id: string) => {
    await dispatch(deleteShagunAction(id)).unwrap();
  };

  return {
    shagunEntries,
    addShagun,
    deleteShagun
  };
}

export function ShagunProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
