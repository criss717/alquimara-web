import { createClient } from '@/utils/supabase/server';
import Image from 'next/image';

export default async function ProductDetail({ params }: { params: { productId: string } }) {
    const { productId } = params;
    console.log(params);

    const supabase = await createClient();

    // Obtener el producto por ID
    const { data: product, error } = await supabase
        .from('productos')
        .select('*')
        .eq('id', productId)
        .single();

    if (error) {
        console.error('Error obteniendo el producto:', error);
        return <div>Error al cargar el producto</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-4xl font-bold">{product.name}</h1>           
            <div className="mt-4">
                <Image
                    width={250}
                    height={250}
                    src={supabase.storage.from('imagenes-jabones').getPublicUrl(product.image_path).data.publicUrl}
                    alt={product.name}
                   
                />
            </div>
            <div className="mt-4">
                <h2 className="text-2xl font-bold">Detalles del Producto</h2>
                <p className="text-lg">{product.description}</p>
                <p className="text-xl font-bold">{product.price}€</p>
                <p className="text-sm text-gray-600">Stock: {product.stock}</p>
            </div>
            <button className="mt-4 px-4 py-2 bg-violet-800 hover:bg-violet-400 text-white rounded">
                Añadir al Carrito
            </button>

        </div>
    );
}