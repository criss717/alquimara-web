import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint para la búsqueda predictiva.
 * Busca tanto en productos como en categorías.
 * @param {NextRequest} request - La solicitud entrante con el parámetro 'query'.
 * @returns {Promise<NextResponse>} - Una respuesta JSON con una lista combinada de sugerencias.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');

  if (!query || query.length < 3) {
    return NextResponse.json([]); // Devuelve un array vacío si no hay query o es muy corta
  }

  // --- LOG DE DEBUG: VER QUÉ QUERY LLEGA ---
  console.log(`API Search Received Query: "${query}"`);
  // -----------------------------------------

  const supabase = await createClient();

  // Realizamos ambas búsquedas en paralelo para mayor eficiencia
  const [productosPromise, categoriasPromise] = await Promise.all([
    supabase
      .from('productos')
      .select('name, slug, image_path')
      .ilike('name', `%${query}%`)
      .limit(5),   
    supabase
      .from('productos')
      .select('categoria', { count: 'exact', head: false })
      .ilike('categoria', `%${query}%`)
      .limit(2)
      .then(response => {
        // La consulta con 'distinct' no está disponible directamente, así que lo simulamos.
        // Primero obtenemos las categorías que coinciden
        if (response.error) return { data: [], error: response.error };
        const categoriasUnicas = [...new Set(response.data.map(p => p.categoria))];
        return { data: categoriasUnicas.map(c => ({ name: c })), error: null };
      })    
  ]);

  const { data: productos, error: errorProductos } = productosPromise;
  const { data: categorias, error: errorCategorias } = categoriasPromise;

  if (errorProductos || errorCategorias) {
    console.error('Error en la búsqueda:', errorProductos || errorCategorias);
    return NextResponse.json({ error: 'Error al buscar' }, { status: 500 });
  }

  // Mapeamos los productos para darles el formato de sugerencia
  const sugerenciasProductos = productos.map(p => ({
    type: 'product',
    name: p.name,
    href: `/productos/${p.slug}`,
    imageUrl: supabase.storage.from('imagenes-jabones').getPublicUrl(p.image_path).data.publicUrl,
  }));

  // Mapeamos las categorías para darles el formato de sugerencia
  const sugerenciasCategorias = categorias.map(c => ({
    type: 'category',
    name: `Ver todo en "${c.name}"`,
    href: `/productos?categoria=${encodeURIComponent(c.name)}`,
    imageUrl: null, // Las categorías no tienen imagen en este caso
  }));

  // Combinamos los resultados, dando prioridad a las categorías
  const resultados = [...sugerenciasCategorias, ...sugerenciasProductos];

  // --- LOG DE DEBUG: VER QUÉ RESULTADOS SE ENVÍAN ---
  console.log('API Search Returning Results:', resultados);
  // ------------------------------------------------

  return NextResponse.json(resultados);
}