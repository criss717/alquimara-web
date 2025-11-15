import { createClient } from '@/utils/supabase/server';

export async function fetchCategorias() {
    const supabase = await createClient();
    const { data } = await supabase.from('productos').select('categoria');
    // extraer categorias unicas
    const uniqueCategorias = Array.from(new Set(data?.map((r) => r.categoria) || []));
    return uniqueCategorias;
}

export async function fetchPropiedades() {
    const supabase = await createClient();
    const { data } = await supabase.from('productos').select('properties');
    const allProps = data?.flatMap((r) => r.properties !== null ? r.properties : []) || [];
    const uniqueProps = Array.from(new Set(allProps));
    return uniqueProps;
}

export async function minMaxPrice() {
    const supabase = await createClient();
    const { data } = await supabase.from('productos').select('price');
    const prices = data?.map((r) => r.price) || [];
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    return { minPrice, maxPrice };
}

export const itemsPerPage = 10;