"use client"
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { ShippingFull } from '@/types/shippingFormData';
import CardDirecciones from './cardDirecciones';
import { useCartStore } from '@/store/cartStore';
import FormDireccionEnvio from './FormDireccionEnvio';

export default function ResumenDireccion() {
    const supabase = createClient();
    const [loadingAddresses, setLoadingAddresses] = useState<boolean>(true);
    const [shippingData, setShippingData] = useState<ShippingFull[]>([]);
    const userId = useCartStore((state) => state.userId);
    const [formVisible, setFormVisible] = useState<boolean>(false);
    const [editingAddress, setEditingAddress] = useState<ShippingFull | undefined>(undefined);

    const handleChangeActive = async (id: string) => {
        const { error } = await supabase
            .from('shipping_details')
            .update({ active: true })
            .eq('id', id);

        if (error) {
            console.error('Error updating shipping address:', error);
            return;
        }
        // Actualizar el estado local después de la mutación exitosa
        setShippingData(prev =>
            prev.map(dir => dir.id === id ? { ...dir, active: true } : dir)
        );

        // Si se activó una dirección, desactivar las demás
        const { error: deactivateError } = await supabase
            .from('shipping_details')
            .update({ active: false })
            .neq('id', id)
            .eq('user_id', userId);

        if (deactivateError) {
            console.error('Error deactivating other addresses:', deactivateError);
            return;
        }

        // Actualizar el estado local para desactivar las demás direcciones
        setShippingData(prev =>
            prev.map(dir => dir.id !== id ? { ...dir, active: false } : dir)
        );

    };

    const handleDelete = async (id: string) => {
        const { error } = await supabase
            .from('shipping_details')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting shipping address:', error);
            return;
        }
        // Actualizar el estado local después de eliminar
        setShippingData(prev => prev.filter(dir => dir.id !== id));
    };

    const handleEdit = async (id: string) => {
        const direccionToEdit = shippingData.find(dir => dir.id === id);
        setEditingAddress(direccionToEdit);
        setFormVisible(true);
    };

    useEffect(() => {
        const fetchData = async () => {
            // Evitar hacer la consulta si no hay userId válido
            if (!userId) {
                setShippingData([]);
                setLoadingAddresses(false);
                return;
            }

            setLoadingAddresses(true);
            const { data } = await supabase.from('shipping_details')
                .select('*')
                .eq('user_id', userId)

            if (!data) {
                setShippingData([]);
                setLoadingAddresses(false);
                return;
            }

            setShippingData(data);
            setLoadingAddresses(false);
        };
        fetchData();
    }, [supabase, userId, formVisible]);

    return (
        <div className='w-full flex flex-col'>
            {formVisible ?
                (
                    <>
                        <h2 className="text-2xl font-bold mb-4">
                            Indica tus datos para el envío
                        </h2>
                        <FormDireccionEnvio
                            setFormVisible={setFormVisible}
                            initialData={editingAddress || undefined}
                        />
                    </>
                ) : (
                    <div className='w-full flex flex-col'>
                        <div className='w-full flex justify-between items-center'>
                            <h2 className="text-2xl font-bold mb-4">Resumen de Direcciones</h2>
                            <button
                                className="bg-violet-500 text-white px-4 py-2 rounded hover:bg-violet-600 mb-4"
                                onClick={() => {
                                    setEditingAddress(undefined);
                                    setFormVisible(true);
                                }}
                            >
                                Nueva Dirección
                            </button>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                            {loadingAddresses ? (
                                // Skeletons: reproducen estructura y tamaño de CardDirecciones (h-[160px])
                                [1, 2, 3].map((i) => (
                                    <div key={i} className="border p-4 mb-4 flex h-[160px] animate-pulse">
                                        <div className="h-full w-11/12">
                                            <div className="h-6 bg-gray-200 rounded w-1/3 mb-3" />
                                            <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                                            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                                            <div className="h-4 bg-gray-200 rounded w-1/4" />
                                        </div>
                                        <div className="h-full w-1/12 items-center justify-between flex flex-col">
                                            <div className="w-6 h-6 bg-gray-200 rounded" />
                                            <div className="h-full w-full flex items-center justify-center gap-2">
                                                <div className="w-6 h-6 bg-gray-200 rounded" />
                                                <div className="w-6 h-6 bg-gray-200 rounded" />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                shippingData && shippingData.length > 0 ? (
                                    shippingData.map((direccion) => (
                                        <CardDirecciones
                                            key={direccion.id}
                                            direccion={direccion}
                                            onChangeActive={handleChangeActive}
                                            onDelete={handleDelete}
                                            onEdit={handleEdit}
                                        />
                                    ))
                                ) : (
                                    <div className="text-sm text-gray-500">No hay direcciones todavía.</div>
                                )
                            )}
                        </div>
                    </div>
                )
            }
        </div>
    );
}