import CardProduct from '@/components/cardProduct';
import { createClient } from '@/utils/supabase/server';

export default async function ProductosPage() {
  const supabase = await createClient();

  // Obténer los productos
  const { data: productos, error } = await supabase
    .from('productos')
    .select('*');

  if (error) {
    console.error('Error obteniendo las imágenes:', error);
    return <div>Error al cargar las imágenes</div>;
  }
  // Lista de productos con la url de la imagen
  const productosConImagenes = productos.map((producto) => ({
    ...producto,
    imageUrl: supabase.storage
      .from('imagenes-jabones')
      .getPublicUrl(producto.image_path).data.publicUrl,
  }));
  return (
    <div className="p-6 w-full">      
      <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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
    </div>
  );
}