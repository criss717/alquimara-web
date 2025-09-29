"use client";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClient } from '@/utils/supabase/client';
import { ShippingFormData, ShippingFull, shippingSchema } from '@/types/shippingFormData';
import { useCartStore } from '@/store/cartStore';
import React from 'react';

export default function FormDireccionEnvio({ setFormVisible, initialData }: { setFormVisible: React.Dispatch<React.SetStateAction<boolean>>, initialData?: ShippingFull }) {
    const supabase = createClient();
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<ShippingFormData>({
        resolver: zodResolver(shippingSchema),
        defaultValues: initialData || {
            full_name: '',
            address: '',
            city: '',
            postal_code: '',
            phone: '',
            email: '',
            additional_notes: ''
        }
    });
    const user_id = useCartStore((state) => state.userId);  

    const onSubmit = async (data: ShippingFormData) => {
        try {
            if (initialData?.id) {
                // Actualizar dirección existente
                const { error: updateError } = await supabase
                    .from('shipping_details')
                    .update({
                        ...data,
                        active: true
                    })
                    .eq('id', initialData.id);

                if (updateError) throw new Error('Error al actualizar la dirección');
                //actualizar el active de los demas a false
                const { error: deactivateError } = await supabase
                    .from('shipping_details')
                    .update({ active: false })
                    .neq('id', initialData.id)
                    .eq('user_id', user_id);
                if (deactivateError) {
                    throw new Error('Error al actualizar las direcciones anteriores');
                }
            } else {
                // Insertar nueva dirección       
                const { data: shippingData, error: shippingError } = await supabase
                    .from('shipping_details')
                    .insert([{
                        user_id,
                        active: true,
                        ...data
                    }])
                    .select();

                if (shippingError) {
                    throw new Error('Error al guardar los detalles de envío');
                } else if (shippingData?.length) {
                    //actualizar el active de los demas a false
                    const { error: updateError } = await supabase
                        .from('shipping_details')
                        .update({ active: false })
                        .neq('id', shippingData[0].id);
                    if (updateError) {
                        throw new Error('Error al actualizar las direcciones anteriores');
                    }
                }
            }
            // Cerrar el formulario
            setFormVisible(false);

            // Resetear el formulario en caso de éxito
            reset();
        } catch (error) {
            console.error('Error saving order:', error);
        }
    };

        return (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 grid grid-cols-4 gap-5">
                <div className="col-span-5 sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Nombre completo
                    </label>
                    <input
                        {...register('full_name')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
                    />
                    {errors.full_name && (
                        <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>
                    )}
                </div>

                <div className='col-span-5 sm:col-span-2'>
                    <label className="block text-sm font-medium text-gray-700">
                        Dirección
                    </label>
                    <input
                        {...register('address')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
                    />
                    {errors.address && (
                        <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                    )}
                </div>

                <div className='col-span-5 sm:col-span-1'>
                    <label className="block text-sm font-medium text-gray-700">
                        Ciudad
                    </label>
                    <input
                        {...register('city')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
                    />
                    {errors.city && (
                        <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
                    )}
                </div>

                <div className='col-span-5 sm:col-span-1'>
                    <label className="block text-sm font-medium text-gray-700">
                        Código Postal
                    </label>
                    <input
                        {...register('postal_code')}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
                    />
                    {errors.postal_code && (
                        <p className="mt-1 text-sm text-red-600">{errors.postal_code.message}</p>
                    )}
                </div>

                <div className='col-span-5 sm:col-span-1'>
                    <label className="block text-sm font-medium text-gray-700">
                        Teléfono
                    </label>
                    <input
                        {...register('phone')}
                        type="tel"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
                    />
                    {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                    )}
                </div>

                <div className='col-span-5 sm:col-span-1'>
                    <label className="block text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input
                        {...register('email')}
                        type="email"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                </div>

                <div className='col-span-5 sm:col-span-1'>
                    <label className="block text-sm font-medium text-gray-700">
                        Notas adicionales
                    </label>
                    <textarea
                        {...register('additional_notes')}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-violet-500 focus:ring-violet-500"
                    />
                    {errors.additional_notes && (
                        <p className="mt-1 text-sm text-red-600">{errors.additional_notes.message}</p>
                    )}
                </div>

                <div className='col-span-1 self-end mb-3'>
                    <button
                        type="submit"
                        className="max-w-[200px] cursor-pointer bg-violet-500 text-white py-2 px-4 rounded hover:bg-violet-600"
                    >
                        Guardar
                    </button>
                    <button
                        type="button"
                        onClick={() => setFormVisible(false)}
                        className="ml-2 max-w-[200px] cursor-pointer bg-gray-200 text-black py-2 px-4 rounded hover:bg-gray-300"
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        );
    }