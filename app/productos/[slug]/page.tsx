import { createClient } from '@/utils/supabase/server';
import Image from 'next/image';
import AddToCartButton from '@/components/ui/addToCartButton';
import ProductCarousel from '@/components/ProductCarousel';
import { fetchProductsForCarousel } from '@/utils/cart/fetchProducts';
import Link from 'next/link';

export default async function ProductDetail({ params }: { params: { slug: string } }) {
    const { slug } = await params;
    const supabase = await createClient();

    // Obtener el producto por slug
    const { data: product, error } = await supabase
        .from('productos')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error) {
        console.error('Error obteniendo el producto:', error);
        return <div>Error al cargar el producto</div>;
    }

    // Productos para el carousel (muestra productos relacionados / más vendidos)
    const moreProducts = await fetchProductsForCarousel(supabase);

    // Parsear propiedades del producto (puede venir como array, JSON-string o CSV)
    const parseProperties = (raw: unknown): string[] => {
        if (!raw) return [];
        if (Array.isArray(raw)) return raw.map(String);
        if (typeof raw === 'string') {
            // intentar parsear JSON
            try {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) return parsed.map(String);
            } catch (e) {
                console.warn('No es JSON válido:', e);
            }
            // fallback: separar por comas
            return raw.split(',').map(s => s.trim()).filter(Boolean);
        }
        // si es objeto con keys o similar, intentar mapear values
        if (typeof raw === 'object') {
            try {
                const vals = Object.values(raw as Record<string, unknown>);
                return vals.map(String).filter(Boolean);
            } catch (e) {
                console.warn('Error parsing object properties:', e);
                return [];
            }
        }
        return [];
    }

    const propiedades = parseProperties(product.properties);

    return (
        <main className="p-6">
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                <div className="md:col-span-1 flex items-center justify-center">
                    <div className="w-full max-w-sm rounded overflow-hidden shadow-lg">
                        <Image
                            width={600}
                            height={600}
                            src={supabase.storage.from('imagenes-jabones').getPublicUrl(product.image_path).data.publicUrl}
                            alt={product.name}
                            className="object-cover w-full h-72"
                        />
                    </div>
                </div>

                <div className="md:col-span-2">
                    <h1 className="text-4xl font-extrabold mb-3">{product.name}</h1>
                    <div className="flex items-center gap-4 mb-4">
                        <p className="text-2xl font-bold text-gray-900">{product.price}€</p>
                        <p className="text-sm text-gray-600">Stock: {product.stock}</p>
                    </div>

                    <div className="mb-6 prose max-w-none text-gray-700">
                        {/* Descripción elegante: aprovechar texto con párrafos y bullets si aplica */}
                        <p>{product.description}</p>
                    </div>

                    {propiedades.length > 0 && (
                        <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Propiedades</h4>
                            <div className="flex flex-wrap gap-2">
                                {propiedades.map((p) => (
                                    <span key={p} className="inline-block bg-violet-100 text-violet-800 text-sm px-3 py-1 rounded-full">
                                        {p}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-wrap gap-3 items-center">
                        <AddToCartButton id={product.id} />
                        <Link href="/productos" className="inline-block bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition">
                            Ver todos los productos
                        </Link>
                    </div>
                </div>
            </section>

            <section className="mt-12">
                <h3 className="text-2xl font-semibold mb-4">También te puede interesar</h3>
                <div className="w-full">
                    <ProductCarousel products={moreProducts} />
                </div>
            </section>
        </main>
    );
}