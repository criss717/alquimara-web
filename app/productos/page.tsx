import CardProduct from '@/components/cardProduct';
import { createClient } from '@/utils/supabase/server';

export default async function ProductosPage() {
  const supabase = await createClient();

  // Obtén la lista de imágenes del bucket
  const { data: files, error } = await supabase.storage
    .from('imagenes-jabones')
    .list('', { limit: 100 }); // Puedes ajustar el límite según tus necesidades

  if (error) {
    console.error('Error obteniendo las imágenes:', error);
    return <div>Error al cargar las imágenes</div>;
  }
  // Genera URLs públicas para las imágenes
  const imageUrls = files.map((file) =>
    supabase.storage.from('imagenes-jabones').getPublicUrl(file.name).data.publicUrl
  );
  console.log('imageUrls', imageUrls);

  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold">Lista de Productos</h1>
      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {imageUrls.map((url, index) => (
          <div key={index} className="w-full h-full">
            <CardProduct
              imageUrl={url}
              productName={`Producto ${index + 1}`}
              productPrice={Math.floor(Math.random() * 100) + 1} // Precio aleatorio entre 1 y 100
            />
          </div>
        ))}
      </div>
    </div>
  );
}