import React from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
    addPayment as addPaymentAction,
    addVendor as addVendorAction,
    deleteVendor as deleteVendorAction,
    fetchVendors as fetchVendorsAction,
    updateVendor as updateVendorAction,
    Vendor
} from '../store/slices/vendorSlice';

export function useVendor() {
    const dispatch = useAppDispatch();
    const { vendors, isLoading, error } = useAppSelector(state => state.vendor);

    const fetchVendors = async () => {
        await dispatch(fetchVendorsAction());
    };

    const addVendor = async (data: { name: string; category: string; contact?: string; totalAmount: number; paidAmount: number }) => {
        await dispatch(addVendorAction(data)).unwrap();
    };

    const updateVendor = async (id: string, data: Partial<Vendor>) => {
        await dispatch(updateVendorAction({ id, data })).unwrap();
    };

    const deleteVendor = async (id: string) => {
        await dispatch(deleteVendorAction(id)).unwrap();
    };

    const addPaymentToVendor = async (vendorId: string, amount: number, mode: string, note: string) => {
        await dispatch(addPaymentAction({ vendorId, amount, mode, note })).unwrap();
    };

    return {
        vendors,
        isLoading,
        error,
        fetchVendors,
        addVendor,
        updateVendor,
        deleteVendor,
        addPaymentToVendor
    };
}

export function VendorProvider({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
