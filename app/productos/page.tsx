import CardProduct from '@/components/cardProduct';
import FilterComponent from '@/components/filterComponent';
import { ProductsPageProps } from '@/types/productPageProps';
import { createClient } from '@/utils/supabase/server';
import { fetchCategorias, fetchPropiedades, itemsPerPage,minMaxPrice } from '@/utils/filtros/contanst';
import Pagination from '@/components/Pagination';
import SortComponent from '@/components/SortComponent';

export default async function ProductosPage({ searchParams }: ProductsPageProps) {
  const supabase = await createClient();
  const categoriasSupabase = await fetchCategorias();
  const propiedadesSupabase = await fetchPropiedades();
  const minMaxPriceSupabase = await minMaxPrice();
  const { categoria, propiedades, precios, page = '1', sort = 'created_at-desc', search } = await searchParams;
  const pageNumber = parseInt(page, 10) || 1;
  
  const from = (pageNumber - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  let query = supabase.from('productos').select('*', { count: 'exact' });

  // --- LÓGICA DE BÚSQUEDA INTELIGENTE ---
  if (search) {
    query = query.textSearch('name_description_ts', search, {
      type: 'websearch',
      config: 'spanish',
    });
  }
  // ------------------------------------

  try {
    if (categoria) {
      query = query.eq('categoria', categoria);
    }
    if (propiedades) {
      const propertiesArray = propiedades.split(',').map((p) => p.trim()).filter(Boolean);
      if (propertiesArray.length > 0) {
        query = query.contains('properties', JSON.stringify(propertiesArray));
      }
    }
    if (precios) {
      const [minStr, maxStr] = precios.split('-');
      const min = Number(minStr);
      const max = Number(maxStr);
      if (!Number.isNaN(min) && !Number.isNaN(max)) {
        query = query.gte('price', min).lte('price', max);
      }
    }
  } catch (error) {
    console.error('Error parsing filters:', error);
  }

  const [sortColumn, sortOrder] = sort.split('-');
  if (sortColumn) {
    query = query.order(sortColumn, { ascending: sortOrder === 'asc' });
  }

  query = query.range(from, to);

  const { data: productos, error, count } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    return <div className="p-6">Error al cargar los productos.</div>;
  }

  const totalPages = count ? Math.ceil(count / itemsPerPage) : 0;

  const productosConImagenes = productos.map((producto) => ({
    ...producto,
    imageUrl: supabase.storage
      .from('imagenes-jabones')
      .getPublicUrl(producto.image_path).data.publicUrl,
  }));
  return (
    <div className="mt-2 p-4 w-full flex flex-col gap-4 ">
      <div className="flex justify-end">
        <SortComponent />
      </div>
      <div className="flex  gap-4 items-start justify-start">
        <FilterComponent categorias={categoriasSupabase} propiedades={propiedadesSupabase} precios={minMaxPriceSupabase} selectedCategorias={categoria || ''} selectedpropiedades={propiedades ? propiedades.split(',') : []} selectedPrice={precios || ''} />
        {productosConImagenes.length > 0 ? (
          <div className='flex-1 '>
            <div className="grid min-h-[60vh] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {productosConImagenes.map((producto, index) => (
                <div key={producto.imageUrl + index} className="w-full h-full">
                  <CardProduct
                    imageUrl={producto.imageUrl}
                    name={producto.name}
                    price={producto.price}
                    id={producto.id}
                    description={producto.description}
                    stock={producto.stock}
                    slug={producto.slug}
                  />
                </div>
              ))}
            </div>
            {totalPages > 1 && <Pagination totalPages={totalPages} />}
          </div>
        ) : (
          <div className="text-center p-10">
            <p>No se encontraron productos que coincidan con tu búsqueda.</p>
          </div>
        )}
      </div>
    </div>
  );
}