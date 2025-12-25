import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    addGuest as addGuestAction,
    fetchGuests as fetchGuestsAction,
    updateGuestStatus as updateGuestStatusAction
} from '../store/slices/guestSlice';

export function useGuest() {
    const dispatch = useAppDispatch();
    const { guests, isLoading } = useAppSelector(state => state.guest);
    // We might need to check if wedding exists to fetch guests, similar to original logic.
    // Original: useEffect -> if hasWedding, fetchGuests.
    // We can replicate that here or let the component consumer handle it.
    // Existing components rely on Context doing it automatically.
    // So I should probably include the useEffect here if I can import `useWedding`.
    // But `useWedding` will use Redux too so it's fine.

    // However, calling hooks inside hooks is fine.
    // But I need to be careful about circular dependencies if useWedding imports useGuest (unlikely).

    // Data fetching is now handled by StoreInitializer to avoid multiple triggers

    // const hasWedding = useAppSelector(state => !!state.wedding.weddingData);
    // useEffect(() => { ... }, [hasWedding]);

    const fetchGuests = async () => {
        await dispatch(fetchGuestsAction());
    };

    const addGuest = async (name: string, count: number, city: string) => {
        await dispatch(addGuestAction({ name, count, city })).unwrap();
    };

    const updateGuestStatus = async (id: string, isInvited: boolean) => {
        await dispatch(updateGuestStatusAction({ id, isInvited }));
    };

    return {
        guests,
        isLoading,
        addGuest,
        fetchGuests,
        updateGuestStatus
    };
}

export function GuestProvider({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
