"use client"
import { createClient } from '@/utils/supabase/client';
import { useEffect, useState } from 'react';
import { ShippingFull } from '@/types/shippingFormData';
import CardDirecciones from './cardDirecciones';
import { useCartStore } from '@/store/cartStore';
import FormDireccionEnvio from './FormDireccionEnvio';

export default function ResumenDireccion() {
    const supabase = createClient();
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
            const { data } = await supabase.from('shipping_details')
                .select('*')
                .eq('user_id', userId)

            if (!data) return setShippingData([]);
            setShippingData(data);
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
                                Añadir Nueva Dirección
                            </button>
                        </div>
                        <div className="max-h-[500px] overflow-y-auto">
                            {shippingData?.length && shippingData.map((direccion) => (
                                <CardDirecciones
                                    key={direccion.id}
                                    direccion={direccion}
                                    onChangeActive={handleChangeActive}
                                    onDelete={handleDelete}
                                    onEdit={handleEdit}
                                />
                            ))}
                        </div>
                    </div>
                )
            }
        </div>
    );
}