import * as z from 'zod';

// Definir esquema de validación con Zod
export const shippingSchema = z.object({
    full_name: z.string().min(3, "Nombre completo es requerido"),
    address: z.string().min(5, "Dirección es requerida"),
    city: z.string().min(2, "Ciudad es requerida"),
    postal_code: z.string().min(5, "Código postal válido requerido"),
    phone: z.string().regex(/^\+?[0-9]{9,}$/, "Teléfono válido requerido"),
    email: z.email("Email válido requerido"),
    additional_notes: z.string().optional(),
    active: z.boolean().optional(),
});

export type ShippingFormData = z.infer<typeof shippingSchema>;

export type ShippingFull = z.infer<typeof shippingSchema> & { id: string, user_id: string };